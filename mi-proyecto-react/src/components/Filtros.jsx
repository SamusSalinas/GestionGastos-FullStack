import React from 'react';

function Filtros({ 
  vista, 
  setVista, 
  categorias, 
  filtroCategoria, 
  setFiltroCategoria, 
  filtroFechaDesde, 
  setFiltroFechaDesde, 
  filtroFechaHasta, 
  setFiltroFechaHasta, 
  limpiarFiltros 
}) {
  return (
    <div className="filters-container">
      <div className="filters-title">🔍 Filtros de Búsqueda</div>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label>Tipo de Flujo</label>
          <div className="filter-buttons-group">
            <button 
              className={`btn-filter ${vista === 'ganancias' ? 'active-ingreso' : ''}`}
              onClick={() => setVista('ganancias')}
            >
              Ingresos
            </button>
            <button 
              className={`btn-filter ${vista === 'gastos' ? 'active-gasto' : ''}`}
              onClick={() => setVista('gastos')}
            >
              Gastos
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Categoría</label>
          <select 
            className="filter-control"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            {categorias
              .filter(c => vista === 'gastos' ? c.tipo === 'Gasto' : c.tipo === 'Ingreso')
              .map(cat => (
                <option key={cat.categoriaId} value={cat.categoriaId}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Desde</label>
          <input 
            type="date" 
            className="filter-control" 
            value={filtroFechaDesde}
            onChange={(e) => setFiltroFechaDesde(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input 
            type="date" 
            className="filter-control" 
            value={filtroFechaHasta}
            onChange={(e) => setFiltroFechaHasta(e.target.value)}
          />
        </div>

        <button className="btn-clear-filters" onClick={limpiarFiltros}>
          Limpiar
        </button>
      </div>
    </div>
  );
}

export default Filtros;