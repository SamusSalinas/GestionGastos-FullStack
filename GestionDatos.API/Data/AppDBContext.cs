using Microsoft.EntityFrameworkCore;
using GestionDatos.API.Models; // Verifica que apunte a tu carpeta Model

namespace GestionDatos.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Estas líneas conectan tus clases con las tablas reales de SQL
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Transaccion> Transacciones { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
    }
}