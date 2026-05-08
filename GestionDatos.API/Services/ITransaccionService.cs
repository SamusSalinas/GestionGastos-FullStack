using GestionDatos.API.Models;
using System.Collections.Generic; // Para el IEnumerable
using System.Threading.Tasks;    // Para el Task

namespace GestionDatos.API.Services
{
    public interface ITransaccionService
    {
        // Revisa que estas tres líneas terminen en punto y coma
        Task<IEnumerable<Transaccion>> GetByUserAsync(string nombreUsuario);

        Task<Transaccion> AddAsync(Transaccion transaccion, string nombreUsuario);

        Task<bool> SoftDeleteAsync(int id, string nombreUsuario);
    }
}