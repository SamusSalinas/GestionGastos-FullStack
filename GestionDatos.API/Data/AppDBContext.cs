using Microsoft.EntityFrameworkCore;
using GestionDatos.API.Models;

namespace GestionDatos.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Estas líneas conectan tus clases con las tablas reales de SQL
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Transaccion> Transacciones { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }

        // ESTO DEBE IR DENTRO DE LA CLASE
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Esto quita la advertencia del Monto y define la precisión
            modelBuilder.Entity<Transaccion>()
                .Property(t => t.Monto)
                .HasColumnType("decimal(18,2)");
        }
    } // Aquí cierra la clase
} // Aquí cierra el namespace