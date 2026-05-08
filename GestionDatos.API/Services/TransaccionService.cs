using GestionDatos.API.Data;
using GestionDatos.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDatos.API.Services
{
    public class TransaccionService : ITransaccionService
    {
        private readonly AppDbContext _context;

        public TransaccionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Transaccion>> GetByUserAsync(string nombreUsuario)
        {
            return await _context.Transacciones
                .Where(t => t.EstaBorrado == false && t.Usuario == nombreUsuario)
                .Include(t => t.Categoria)
                .ToListAsync();
        }

        public async Task<Transaccion> AddAsync(Transaccion transaccion, string nombreUsuario)
        {
            transaccion.Usuario = nombreUsuario;
            _context.Transacciones.Add(transaccion);
            await _context.SaveChangesAsync();
            return transaccion;
        }

        public async Task<bool> SoftDeleteAsync(int id, string nombreUsuario)
        {
            var transaccion = await _context.Transacciones
                .FirstOrDefaultAsync(t => t.TransaccionId == id && t.Usuario == nombreUsuario);

            if (transaccion == null) return false;

            transaccion.EstaBorrado = true;
            _context.Entry(transaccion).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}