using GestionDatos.API.Models;
using System.Collections.Generic; // Para el IEnumerable
using System.Threading.Tasks;    // Para el Task

namespace GestionDatos.API.Services
{
    public interface ITransaccionService
    {
        // Añadimos parámetros opcionales para filtrar
        Task<IEnumerable<Transaccion>> GetByUserAsync(
            string nombreUsuario,
            int? categoriaId = null,
            DateTime? desde = null,
            DateTime? hasta = null);

        Task<Transaccion> AddAsync(Transaccion transaccion, string nombreUsuario);
        Task<bool> SoftDeleteAsync(int id, string nombreUsuario);
    }
}