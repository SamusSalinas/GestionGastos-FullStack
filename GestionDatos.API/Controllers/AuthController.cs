using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GestionDatos.API.Data; // Asegúrate de que este sea el namespace de tu AppDbContext
using GestionDatos.API.Models;

namespace GestionDatos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 1. Declaramos las dos herramientas que necesitamos
        private readonly AppDbContext _context; // Para la base de datos
        private readonly IConfiguration _config; // Para leer la clave secreta

        // 2. El constructor ahora recibe AMBAS herramientas
        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {
            // Buscamos al usuario real en la base de datos
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NombreUsuario == loginRequest.Usuario && u.Password == loginRequest.Password);

            if (usuario != null)
            {
                var tokenString = GenerarTokenJWT(usuario.NombreUsuario);
                return Ok(new { token = tokenString });
            }

            return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] LoginDto registroRequest)
        {
            // Verificar si ya existe
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == registroRequest.Usuario))
            {
                return BadRequest(new { mensaje = "El usuario ya existe" });
            }

            // Iniciamos una transacción segura (Si algo falla, no se guarda nada a medias)
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var nuevoUsuario = new Usuario
                    {
                        NombreUsuario = registroRequest.Usuario,
                        Password = registroRequest.Password
                    };

                    _context.Usuarios.Add(nuevoUsuario);
                    await _context.SaveChangesAsync(); // Al guardar, SQL Server le asigna un 'Id' al usuario

                    var nuevaCategoria = new Categoria
                    {
                        Nombre = "Ahorros Generales",
                        Tipo = "Ahorro",
                        Usuario = nuevoUsuario.NombreUsuario // Conectar la categoría con el dueño
                    };

                    _context.Categorias.Add(nuevaCategoria);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    var token = GenerarTokenJWT(nuevoUsuario.NombreUsuario);

                    return Ok(new { token = token });
                }
                catch (Exception ex)
                {
                    // Si hubo un error de conexión, cancelamos todo para no dejar datos corruptos
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { mensaje = "Error interno al crear la cuenta. Intente nuevamente." });
                }
            }
        }

        private string GenerarTokenJWT(string usuario)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings.GetValue<string>("Key")!);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario),
                new Claim(ClaimTypes.Role, "Administrador")
            };

            var credenciales = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            );

            var tokenDescriptor = new JwtSecurityToken(
                issuer: jwtSettings.GetValue<string>("Issuer"),
                audience: jwtSettings.GetValue<string>("Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credenciales
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}