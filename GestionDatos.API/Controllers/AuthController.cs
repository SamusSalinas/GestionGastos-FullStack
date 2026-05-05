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

            var nuevoUsuario = new Usuario
            {
                NombreUsuario = registroRequest.Usuario,
                Password = registroRequest.Password
            };

            // Guardar en la base de datos (Aquí es donde fallaba el _context)
            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            // Generar token para auto-login (Aquí corregimos el error de 'tpken')
            var token = GenerarTokenJWT(nuevoUsuario.NombreUsuario);

            return Ok(new { token = token });
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