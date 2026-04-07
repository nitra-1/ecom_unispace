// ============================================================
// Program.cs – Application entry point and service registration
//
// This file wires up:
//   • Entity Framework 6 (Database-First) with SQL Server
//   • JWT Bearer authentication (same settings as main API)
//   • SignalR hub for real-time appointment notifications
//   • CORS policy to accept requests from admin panel and frontend
//   • HTTP client factory for audit log POSTs
//   • Newtonsoft.Json for EF6 navigation-property serialisation
// ============================================================
using AppointmentBooking.Data;
using AppointmentBooking.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------------------
// 1. Controllers + Newtonsoft.Json
//    EF6 navigation properties can produce reference cycles so we
//    configure ReferenceLoopHandling.Ignore here.
// ----------------------------------------------------------------
builder.Services.AddControllers()
    .AddNewtonsoftJson(opts =>
        opts.SerializerSettings.ReferenceLoopHandling =
            Newtonsoft.Json.ReferenceLoopHandling.Ignore);

// ----------------------------------------------------------------
// 2. Entity Framework 6 DbContext – Database-First
//    The context is registered as scoped (one per HTTP request).
//    The connection string is resolved from appsettings.json under
//    ConnectionStrings:AppointmentDb.
// ----------------------------------------------------------------
builder.Services.AddScoped<AppointmentDbContext>(_ =>
{
    string connStr = builder.Configuration.GetConnectionString("AppointmentDb")
        ?? throw new InvalidOperationException(
               "Connection string 'AppointmentDb' is not configured. " +
               "Add it to appsettings.json or as an environment variable.");

    return new AppointmentDbContext(connStr);
});

// ----------------------------------------------------------------
// 3. JWT Bearer Authentication
//    Settings MUST match the IDServer / main API so that tokens
//    issued by the identity service are accepted here too.
// ----------------------------------------------------------------
var jwtSection = builder.Configuration.GetSection("JwtSettings");
string jwtSecret  = jwtSection["Secret"]   ?? throw new InvalidOperationException("JwtSettings:Secret not configured.");
string jwtIssuer  = jwtSection["Issuer"]   ?? "AparnaPlatform";
string jwtAudience = jwtSection["Audience"] ?? "AparnaPlatform";

builder.Services.AddAuthentication(opts =>
{
    // Make JWT the default scheme so [Authorize] uses it automatically
    opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opts.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opts =>
{
    opts.RequireHttpsMetadata = false; // Set to true in production

    opts.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtIssuer,
        ValidAudience            = jwtAudience,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        // Allow 30 s clock skew between client and server
        ClockSkew                = TimeSpan.FromSeconds(30)
    };

    // SignalR passes the JWT as a query-string parameter (?access_token=…)
    // because WebSocket upgrades cannot set custom headers in browsers.
    opts.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            // Read the token from the query string for SignalR connections
            var accessToken = ctx.Request.Query["access_token"];
            var path = ctx.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/Hubs/appointmentHub"))
            {
                ctx.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ----------------------------------------------------------------
// 4. SignalR
//    The hub is mounted at /Hubs/appointmentHub to follow the same
//    path pattern as the existing Notification and Upload hubs.
// ----------------------------------------------------------------
builder.Services.AddSignalR();

// ----------------------------------------------------------------
// 5. HTTP client factory
//    Used by controllers to POST audit log entries to /api/Log.
// ----------------------------------------------------------------
builder.Services.AddHttpClient();

// ----------------------------------------------------------------
// 6. CORS
//    Allow requests from both the customer frontend (port 3000)
//    and the admin panel (port 8080) as well as the production URLs.
// ----------------------------------------------------------------
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("AllowFrontends", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",    // Customer frontend (dev)
                "http://localhost:8080",    // Admin panel (dev)
                "https://aparna.hashtechy.space",           // Customer frontend (prod)
                "https://admin.aparna.hashtechy.space"      // Admin panel (prod)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            // Required for SignalR WebSocket connections
            .AllowCredentials();
    });
});

// ----------------------------------------------------------------
// 7. Swagger / OpenAPI (development only)
// ----------------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opts =>
{
    opts.SwaggerDoc("v1", new() { Title = "Appointment Booking API", Version = "v1" });

    // Add JWT auth button to Swagger UI
    opts.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description  = "Enter 'Bearer <token>'"
    });

    opts.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ================================================================
// Build
// ================================================================
var app = builder.Build();

// ----------------------------------------------------------------
// Middleware pipeline (order matters in ASP.NET Core)
// ----------------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must come before authentication and routing
app.UseCors("AllowFrontends");

// Authentication before Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers (REST endpoints)
app.MapControllers();

// Map SignalR hub – path matches AllStaticVariables.jsx convention
app.MapHub<AppointmentHub>("/Hubs/appointmentHub");

app.Run();
