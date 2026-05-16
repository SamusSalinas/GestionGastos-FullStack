using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionDatos.API.Data;
using GestionDatos.API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GestionDatos.API.Services;

namespace GestionDatos.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TransaccionesController : ControllerBase
    {
        private readonly ITransaccionService _transaccionService;

        public TransaccionesController(ITransaccionService transaccionService)
        {
            _transaccionService = transaccionService;
        }

        // Esta propiedad lee de forma segura el identificador único del Token JWT
        private string NombreUsuario => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                                         User.FindFirst(ClaimTypes.Name)?.Value ?? "";

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaccion>>> GetTransacciones(
            [FromQuery] int? categoriaId,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta)
        {
            
            if (string.IsNullOrEmpty(NombreUsuario)) return Unauthorized("No se pudo identificar al usuario en el token.");

            // Pasamos los filtros que vienen en la URL
            var transacciones = await _transaccionService.GetByUserAsync(NombreUsuario, categoriaId, desde, hasta);

            return Ok(transacciones);
        }

        [HttpPost]
        public async Task<ActionResult<Transaccion>> PostTransaccion(Transaccion transaccion)
        {
            if (string.IsNullOrEmpty(NombreUsuario)) return Unauthorized("No se pudo identificar al usuario en el token.");

            var nueva = await _transaccionService.AddAsync(transaccion, NombreUsuario);
            return Ok(nueva);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteTransaccion(int id)
        {
            if (string.IsNullOrEmpty(NombreUsuario)) return Unauthorized("No se pudo identificar al usuario en el token.");

            var exito = await _transaccionService.SoftDeleteAsync(id, NombreUsuario);
            if (!exito) return NotFound();
            return NoContent();
        }
    }
}