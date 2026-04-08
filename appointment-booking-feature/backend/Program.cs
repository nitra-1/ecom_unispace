// =============================================================================
// Program.cs — ASP.NET Core 8 application entry point.
//
// This project uses EF Core Database-First scaffolding:
//   • Models and DbContext are scaffolded from SQL Server (see scaffold command
//     in DbContext/AppointmentDbContext.cs).
//   • There are NO EF Migrations — the database schema is managed via SQL scripts
//     in the /database folder (01_CreateTables.sql, 02_SeedData.sql, 03_Indices.sql).
//   • After a schema change: update the SQL scripts, run them on the DB, then
//     re-scaffold the models using dotnet ef dbcontext scaffold.
//
// Architecture overview:
//   Controller → Service → Repository → DbContext → SQL Server
//       ↑                                   ↑
//   SignalR Hub                        Fluent API config
//       ↓
//   Frontend / Admin WebSocket
//
// For junior developers:
//   1. Connection string: appsettings.json → ConnectionStrings:DefaultConnection
//   2. JWT config:        appsettings.json → JwtSettings
//   3. CORS origins:      appsettings.json → AllowedOrigins
//   4. Audit log target:  appsettings.json → AuditLogSettings:BaseUrl
// =============================================================================

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using AppointmentBooking.DbContext;
using AppointmentBooking.Hubs;
using AppointmentBooking.Middleware;
using AppointmentBooking.Repositories;
using AppointmentBooking.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────────
// DB-First: models were scaffolded from SQL Server schema via EF Core tooling.
// Connection string is stored in appsettings.json (never hardcode credentials).
// EnableRetryOnFailure handles transient SQL Azure/network errors automatically.
builder.Services.AddDbContext<AppointmentDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure(3)));

// ── JWT Authentication ────────────────────────────────────────────────────────
// Reads settings from appsettings.json under "JwtSettings".
// The frontend sends tokens via Authorization: Bearer <token> header.
// The admin panel stores tokens in localStorage and sends the same header.
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey is required");

builder.Services.AddAuthentication(options =>
{
    // Set JWT Bearer as the default scheme for both authentication and challenge
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],       // "aparna-api"
        ValidAudience = jwtSection["Audience"],   // "aparna-client"
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero, // No tolerance on token expiry
    };

    // Allow SignalR connections to pass JWT via query string
    // (browsers cannot set Authorization headers on WebSocket upgrades)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/hubs/appointment"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allowed origins come from appsettings.json "AllowedOrigins" array.
// Both the Next.js frontend (port 3000) and React admin (port 3001) are listed.
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "http://localhost:3001"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Required for SignalR WebSocket + cookie-based auth
    });
});

// ── SignalR ───────────────────────────────────────────────────────────────────
// Enables real-time push notifications to frontend and admin clients.
// Hub path: /hubs/appointment (configured below in app.MapHub)
builder.Services.AddSignalR();

// ── Application Services (Dependency Injection) ───────────────────────────────
// Scoped = one instance per HTTP request. This ensures each request gets its own
// DbContext and transaction scope.
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<ISlotGenerationService, SlotGenerationService>();
builder.Services.AddScoped<IReminderService, ReminderService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// Repository layer (optional abstraction over DbContext for testability)
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<ISlotRepository, SlotRepository>();

// HttpClient for audit log forwarding (POST /api/Log)
// Uses IHttpClientFactory under the hood for connection pooling.
builder.Services.AddHttpClient<IAuditLogService, AuditLogService>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["AuditLogSettings:BaseUrl"]
            ?? "https://api.aparna.hashtechy.space/");
    client.Timeout = TimeSpan.FromSeconds(5); // Fire-and-forget; don't block requests
});

// ── MVC + JSON ────────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Return camelCase JSON to match frontend expectations
        // (React/Redux expects camelCase property names)
        opts.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        // Skip null properties to reduce payload size
        opts.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ── Swagger ───────────────────────────────────────────────────────────────────
// Swagger UI is available at /swagger in Development mode.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Aparna Appointment Booking API",
        Version = "v1",
        Description = "EF Core Database-First .NET 8 API for appointment booking. "
                    + "Models scaffolded from SQL Server schema."
    });

    // Add JWT Bearer support to Swagger UI so developers can test protected endpoints
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token: Bearer {your_token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────────────
// Order matters! CORS → DeviceId → Auth → Controllers/SignalR

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must come before routing, auth, and endpoints
app.UseCors();

// Custom middleware: reads X-Device-Id header and stores in HttpContext.Items
// so controllers can forward it to audit logs.
app.UseMiddleware<DeviceIdMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// Map REST controllers — routes are defined via [Route] attributes on controllers
// e.g. api/Appointment/Booking, api/Appointment/Section, api/Appointment/Slot
app.MapControllers();

// Map SignalR hub at /hubs/appointment
// Frontend and admin connect here for real-time slot/booking updates.
// Events: BookingCreated, BookingRescheduled, BookingCancelled,
//         SlotBlocked, SlotUnblocked
app.MapHub<AppointmentHub>("/hubs/appointment");

app.Run();
