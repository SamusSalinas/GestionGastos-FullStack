using System;

namespace GestionDatos.API.Models
{
    public class Categoria
    {
        public int CategoriaId { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Tipo { get; set; } = "Gasto"; // Asegúrate de que termine en ;

        public string Usuario { get; set; } = string.Empty; // Asegúrate de que termine en ;
    }
}