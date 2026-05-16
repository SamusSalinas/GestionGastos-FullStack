using GestionDatos.API.Data;
using GestionDatos.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDatos.API.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly AppDbContext _context;

        public CategoriaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Categoria>> GetByUserAsync(string nombreUsuario)
        {
            // La lógica clave: 
            // "Tráeme las mías O las que dicen Sistema"
            return await _context.Categorias
                .Where(c => c.Usuario == nombreUsuario || c.Usuario == "Sistema")
                .ToListAsync();
        }

        public async Task<Categoria> AddAsync(Categoria categoria, string nombreUsuario)
        {
            categoria.Usuario = nombreUsuario; // Las nuevas siempre serán del usuario
            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();
            return categoria;
        }
    }
}