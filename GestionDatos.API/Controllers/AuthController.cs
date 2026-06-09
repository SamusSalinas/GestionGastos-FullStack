using GestionDatos.API.Data; // Asegúrate de que este sea el namespace de tu AppDbContext
using GestionDatos.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GestionDatos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            // BUSCAMOS EL USUARIO
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NombreUsuario == login.Usuario && u.Password == login.Password);

            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });
            }

            var token = GenerarTokenJWT(usuario.NombreUsuario);
            return Ok(new { token });
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] LoginDto registroRequest)
        {
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == registroRequest.Usuario))
            {
                return BadRequest(new { mensaje = "El usuario ya existe" });
            }

            // Usamos la estrategia de ejecución para evitar fallos de transacción
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        var nuevoUsuario = new Usuario { NombreUsuario = registroRequest.Usuario, Password = registroRequest.Password };
                        _context.Usuarios.Add(nuevoUsuario);
                        await _context.SaveChangesAsync();

                        var nuevaCategoria = new Categoria
                        {
                            Nombre = "Ahorros Generales",
                            Tipo = "Ahorro",
                            Usuario = nuevoUsuario.NombreUsuario // Exclusivo de este usuario
                        };
                        _context.Categorias.Add(nuevaCategoria);
                        await _context.SaveChangesAsync();

                        await transaction.CommitAsync();

                        var token = GenerarTokenJWT(nuevoUsuario.NombreUsuario);
                        return Ok(new { token = token });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return StatusCode(500, new { mensaje = "Error interno: " + ex.Message });
                    }
                }
            });
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