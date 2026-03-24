using AppointmentService.Hubs;
using AppointmentService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Dependency injection
builder.Services.AddScoped<IAppointmentService, AppointmentSvc>();
builder.Services.AddScoped<ISlotService, SlotService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IQuoteService, QuoteService>();

// SignalR
builder.Services.AddSignalR();

// JWT authentication (reuse existing platform IDServer configuration)
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience  = builder.Configuration["Jwt:Audience"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
        };
    });

builder.Services.AddAuthorization();

// CORS – allow storefront and admin panel origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAparna", policy =>
    {
        policy
            .WithOrigins(
                builder.Configuration["Cors:StorefrontOrigin"] ?? "https://aparna.hashtechy.space",
                builder.Configuration["Cors:AdminOrigin"]      ?? "https://admin.aparna.hashtechy.space"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();   // Required for SignalR
    });
});

// ── Middleware pipeline ───────────────────────────────────────────────────────

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAparna");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map the SignalR hub
app.MapHub<AppointmentHub>("/hubs/appointment");

app.Run();
