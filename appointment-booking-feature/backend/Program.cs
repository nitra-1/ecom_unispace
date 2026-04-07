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
builder.Services.AddDbContext<AppointmentDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure(3)));

// ── JWT Authentication ────────────────────────────────────────────────────────
// Reads settings from appsettings.json under "JwtSettings".
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey is required");

builder.Services.AddAuthentication(options =>
{
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
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
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
builder.Services.AddSignalR();

// ── Application Services (Dependency Injection) ───────────────────────────────
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<ISlotGenerationService, SlotGenerationService>();
builder.Services.AddScoped<IReminderService, ReminderService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// Repository layer (optional abstraction over DbContext for testability)
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<ISlotRepository, SlotRepository>();

// HttpClient for audit log forwarding (POST /api/Log)
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
        opts.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Aparna Appointment Booking API",
        Version = "v1",
        Description = "DB-First .NET Core 8 API for appointment booking"
    });

    // Add JWT Bearer support to Swagger UI
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must come before routing, auth, and endpoints
app.UseCors();

// Custom middleware: reads and validates X-Device-Id header on every request
app.UseMiddleware<DeviceIdMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// Map REST controllers
app.MapControllers();

// Map SignalR hub at /hubs/appointment
// Frontend and admin connect here for real-time slot/booking updates
app.MapHub<AppointmentHub>("/hubs/appointment");

app.Run();
