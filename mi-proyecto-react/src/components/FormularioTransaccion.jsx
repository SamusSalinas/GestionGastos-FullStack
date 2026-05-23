import React from 'react';

function FormularioTransaccion({ enviarDatos, nuevoGasto, manejarCambio, categoriasFiltradas }) {
  return (
    <section className="seccion-formulario">
      <h2>Nuevo Registro</h2>
      <form onSubmit={enviarDatos} className="formulario-moderno">
        <div className="grupo-input">
          <label>Monto</label>
          <input 
            name="monto" 
            type="number" 
            placeholder="0.00" 
            value={nuevoGasto.monto} 
            onChange={manejarCambio} 
            required 
          />
        </div>
        
        <div className="grupo-input">
          <label>Descripción</label>
          <input 
            name="descripcion" 
            type="text" 
            placeholder="¿En qué se usó?" 
            value={nuevoGasto.descripcion} 
            onChange={manejarCambio} 
            required 
          />
        </div>
        
        <div className="grupo-input">
          <label>Tipo</label>
          <select name="tipo" value={nuevoGasto.tipo} onChange={manejarCambio}>
            <option value="Gasto">📉 Gasto</option>
            <option value="Ingreso">📈 Ingreso</option>
          </select>
        </div>
        
        <div className="grupo-input">
          <label>Categoría</label>
          <select 
            name="categoriaId" 
            value={nuevoGasto.categoriaId || ""} 
            onChange={manejarCambio} 
            required
          >
              <option value="">Seleccione una...</option>
              {categoriasFiltradas.map(cat => (
                  <option key={cat.categoriaId} value={cat.categoriaId}>
                    {cat.nombre}
                  </option>
              ))}
          </select>
        </div>
        
        <button type="submit" className="boton-guardar">Guardar Registro</button>
      </form>
    </section>
  );
}

export default FormularioTransaccion;