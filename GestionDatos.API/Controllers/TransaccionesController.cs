using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionDatos.API.Data;
using GestionDatos.API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; // Añadimos este using para simplificar los Claims
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

        private string NombreUsuario => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaccion>>> GetTransacciones()
        {
            var transacciones = await _transaccionService.GetByUserAsync(NombreUsuario);
            return Ok(transacciones);
        }

        [HttpPost]
        public async Task<ActionResult<Transaccion>> PostTransaccion(Transaccion transaccion)
        {
            var nueva = await _transaccionService.AddAsync(transaccion, NombreUsuario);
            return Ok(nueva);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteTransaccion(int id)
        {
            var exito = await _transaccionService.SoftDeleteAsync(id, NombreUsuario);
            if (!exito) return NotFound();
            return NoContent();
        }
    }
}