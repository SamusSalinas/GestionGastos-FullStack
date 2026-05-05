using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionDatos.API.Data;
using GestionDatos.API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; // Añadimos este using para simplificar los Claims

namespace GestionDatos.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TransaccionesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransaccionesController(AppDbContext context)
        {
            _context = context;
        }

        // Esta propiedad extrae el "Nombre" que guardamos en el token al hacer login
        private string NombreUsuario => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

        // GET: api/transacciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaccion>>> GetTransacciones()
        {
            // FILTRO DOBLE: Solo lo que no está borrado Y que pertenece al usuario actual
            return await _context.Transacciones
                .Where(t => t.EstaBorrado == false && t.Usuario == NombreUsuario)
                .Include(t => t.Categoria)
                .ToListAsync();
        }

        // POST: api/transacciones
        [HttpPost]
        public async Task<ActionResult<Transaccion>> PostTransaccion(Transaccion transaccion)
        {
            // SEGURIDAD: El servidor asigna el dueño, ignorando lo que venga del frontend
            transaccion.Usuario = NombreUsuario;

            _context.Transacciones.Add(transaccion);
            await _context.SaveChangesAsync();

            return Ok(transaccion);
        }

        // DELETE: api/transacciones/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteTransaccion(int id)
        {
            // BUSQUEDA SEGURA: Buscamos la transacción por ID PERO verificamos que sea del usuario
            var transaccion = await _context.Transacciones
                .FirstOrDefaultAsync(t => t.TransaccionId == id && t.Usuario == NombreUsuario);

            if (transaccion == null)
            {
                // Si no existe o si existe pero es de otro usuario, decimos que no se encontró
                return NotFound();
            }

            transaccion.EstaBorrado = true;
            _context.Entry(transaccion).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}