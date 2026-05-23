import React from 'react';

function FormularioCategoria({ guardarNuevaCategoria }) {
  
  const manejarEnvio = (e) => {
    e.preventDefault();
    const nombre = e.target.nombreCat.value;
    const tipo = e.target.tipoCat.value;
    guardarNuevaCategoria(nombre, tipo);
  };

  return (
    <section className="seccion-formulario">
      <h2>Crear Nueva Categoría</h2>
      <form onSubmit={manejarEnvio} className="formulario-moderno">
        <div className="grupo-input">
          <label>Nombre de Categoría</label>
          <input 
            name="nombreCat" 
            type="text" 
            placeholder="Ej: Gimnasio, Sueldo, Supermercado..." 
            required 
          />
        </div>
        
        <div className="grupo-input">
          <label>Tipo de Flujo</label>
          <select name="tipoCat">
            <option value="Gasto">📉 Gasto</option>
            <option value="Ingreso">📈 Ingreso</option>
          </select>
        </div>
        
        <button type="submit" className="boton-guardar">Guardar Categoría</button>
      </form>
    </section>
  );
}

export default FormularioCategoria;