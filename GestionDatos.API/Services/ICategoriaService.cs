using GestionDatos.API.Models;
using System.Collections.Generic; // Para el IEnumerable
using System.Threading.Tasks;

public interface ICategoriaService
{
    Task<IEnumerable<Categoria>> GetByUserAsync(string nombreUsuario);
    Task<Categoria> AddAsync(Categoria categoria, string nombreUsuario);
}