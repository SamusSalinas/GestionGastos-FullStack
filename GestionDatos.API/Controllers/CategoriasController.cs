using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionDatos.API.Data;
using GestionDatos.API.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace GestionDatos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriasController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
        {
            var usuarioLogueado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return await _context.Categorias
                .Where(c => c.Usuario == usuarioLogueado || c.Usuario == "Sistema")
                .ToListAsync();
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
        {
            try
            {
                var usuarioLogueado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                categoria.Usuario = usuarioLogueado; // Asignamos el dueño

                _context.Categorias.Add(categoria);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetCategorias", new { id = categoria.CategoriaId }, categoria);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar: {ex.Message}");
            }
        }
    }
}