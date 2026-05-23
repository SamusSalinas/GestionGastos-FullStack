import React from 'react';

function Dashboard({ saldoTotal, pozoAhorro, totalGastos, soloGastos }) {
  return (
    <div className="inicio-container">
      <div className='mensaje-inicio'>
        <h2>Panel de Control Financiero</h2>
        <p>Monitorea tus ingresos, gastos y metas de ahorro en tiempo real.</p>
      </div>

      <div className="dashboard-grid">
        <div className={`tarjeta-dashboard ${saldoTotal >= 0 ? 'positivo' : 'negativo'}`}>
          <h3>Saldo Disponible</h3>
          <p className="monto-dashboard">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(saldoTotal)}
          </p>
        </div>

        <div className="tarjeta-dashboard ahorro">
          <h3>Pozo de Ahorro</h3>
          <p className="monto-dashboard">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(pozoAhorro)}
          </p>
          <small>🎯 Meta sugerida: 20% de tus ingresos totales guardados</small>
        </div>

        <div className="tarjeta-dashboard gastos-totales">
          <h3>Gastos Totales</h3>
          <p className="monto-dashboard">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalGastos)}
          </p>
        </div>
      </div>

      <div className="analytics-section">
        <h2>📊 Distribución Porcentual de Gastos por Categoría</h2>
        {soloGastos.length > 0 ? (
          <div className="chart-mock-container">
            {Object.entries(
              soloGastos.reduce((acc, t) => {
                const catNombre = t.categoria?.nombre || 'General';
                acc[catNombre] = (acc[catNombre] || 0) + Number(t.monto);
                return acc;
              }, {})
            ).map(([categoria, monto]) => {
              const porcentaje = totalGastos > 0 ? ((monto / totalGastos) * 100).toFixed(1) : 0;
              return (
                <div key={categoria} className="chart-row">
                  <div className="chart-label">
                    <span className="chart-cat-name">{categoria}</span>
                    <span className="chart-cat-monto">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto)} ({porcentaje}%)
                    </span>
                  </div>
                  <div className="chart-bar-bg">
                    <div className="chart-bar-fill" style={{ width: `${porcentaje}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data-text">No hay gastos registrados en la base de datos para generar reportes visuales.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;