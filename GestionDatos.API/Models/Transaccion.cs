using System;

namespace GestionDatos.API.Models
{
    public class Transaccion
    {
        public int TransaccionId { get; set; }
        public decimal Monto { get; set; }
        public string? Descripcion { get; set; }
        public DateTime Fecha { get; set; } = DateTime.Now;
        public string Tipo { get; set; } = string.Empty; // 'Ingreso' o 'Gasto'
        public int CategoriaId { get; set; }
        public bool EstaBorrado { get; set; }=false;
        public string Usuario { get; set; } = string.Empty;
        // Esto permite que .NET traiga los datos de la categoría asociada
        public Categoria? Categoria { get; set; }
    }
}