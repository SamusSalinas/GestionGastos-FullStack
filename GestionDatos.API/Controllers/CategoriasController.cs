using GestionDatos.API.Models;
using GestionDatos.API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GestionDatos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriaService _categoriaService;

        public CategoriasController(ICategoriaService categoriaService)
        {
            _categoriaService = categoriaService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
        {
            var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Invitado";
            var categorias = await _categoriaService.GetByUserAsync(nombreUsuario);
            return Ok(categorias);
        }

        [HttpPost]
        public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
        {
            var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Invitado";
            var nuevaCategoria = await _categoriaService.AddAsync(categoria, nombreUsuario);
            return Ok(nuevaCategoria);
        }
    }
}