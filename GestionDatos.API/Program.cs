using GestionDatos.API.Data;
using GestionDatos.API.Models;
using GestionDatos.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore; 
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar la conexión a SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null);
        }));

// 2. Habilitar los Controladores
builder.Services.AddControllers();

// 3. Habilitar CORS para que React pueda conectarse sin bloqueos
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // La URL de tu React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configurar Seguridad JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings.GetValue<string>("key")!);

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
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddEndpointsApiExplorer();

// Configurar OpenAPI Nativo de .NET 10 con Candado de Seguridad Oficial
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        if (document == null) return Task.CompletedTask;

        document.Components ??= new Microsoft.OpenApi.OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.IOpenApiSecurityScheme>();

        var esquemaSeguridad = new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            Type = Microsoft.OpenApi.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Escribe la palabra 'Bearer' seguida de un espacio y tu token JWT.\n\nEjemplo: Bearer eyJ..."
        };

        document.Components.SecuritySchemes.Add("Bearer", esquemaSeguridad);

        var requisitoSeguridad = new Microsoft.OpenApi.OpenApiSecurityRequirement
        {
            [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
        };

        document.Security = new List<Microsoft.OpenApi.OpenApiSecurityRequirement> { requisitoSeguridad };

        return Task.CompletedTask;
    });
});

// Inyección de dependencias de tus Servicios
builder.Services.AddScoped<ITransaccionService, TransaccionService>();
builder.Services.AddScoped<ICategoriaService, CategoriaService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GestionDatos.API.Data.AppDbContext>();
    // Esto obliga a Entity Framework a aplicar tus migraciones y crear la BD en Docker
    context.Database.Migrate();
}

// CONFIGURACIÓN DEL PIPELINE (MIDDLEWARES) 
//app.UseHttpsRedirection();

// Activar la política de CORS para React
app.UseCors("PermitirReact");

app.UseAuthentication(); // ¿Quién eres?
app.UseAuthorization();  // ¿Qué puedes hacer?

// Mapear los controladores de la API
app.MapControllers();

// Publica tu documentación OpenAPI nativa de .NET 10
app.MapOpenApi();

app.MapScalarApiReference();

// Seeder automático de categorías de prueba
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!context.Categorias.Any())
    {
        context.Categorias.AddRange(
            new Categoria { Nombre = "Comida", Tipo = "Gasto", Usuario = "Sistema" },
            new Categoria { Nombre = "Transporte", Tipo = "Gasto", Usuario = "Sistema" },
            new Categoria { Nombre = "Salario", Tipo = "Ingreso", Usuario = "Sistema" }
        );
        context.SaveChanges();
    }
}

// Arrancar la aplicación
app.Run();