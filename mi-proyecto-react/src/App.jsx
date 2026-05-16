import { useEffect, useState } from 'react'
import './App.css'
import Tarjeta from './components/Tarjeta'

function App() {
  // 1. ESTADOS
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [vista, setVista] = useState(token ? 'inicio' : 'login');
  const [categorias, setCategorias] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [esRegistro, setEsRegistro] = useState(false);

  // Estados para los filtros
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Memoria del formulario (iniciamos la categoriaId en 0 para evitar errores)
  const [nuevoGasto, setNuevoGasto] = useState({
    monto: '',
    descripcion: '',
    tipo: 'Gasto',
    categoriaId: 0 
  });

  // 2. LÓGICA DE FILTRADO LOCAL
  const soloGastos = transacciones.filter(t => t.tipo === 'Gasto');
  const soloGanancias = transacciones.filter(t => t.tipo === 'Ingreso');
  const categoriasFiltradas = categorias.filter(c => c.tipo === nuevoGasto.tipo);

  const limpiarFiltros = () => {
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setFiltroCategoria("");
    obtenerTransacciones("", "", ""); 
  };

  // 3. FUNCIONES DE API
  const guardarNuevaCategoria = async (nombre, tipo) => {
    const response = await fetch('http://localhost:5000/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nombre, tipo })
    });

    if (response.ok) {
      const catCreada = await response.json();
      setCategorias([...categorias, catCreada]);
      alert(`¡Categoría '${nombre}' creada!`);
      setVista('formulario');
    }
  };

  const handleRegister = async (usuario, password) => {
    const response = await fetch('http://localhost:5000/api/Auth/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setVista('inicio');
      alert("¡Cuenta creada y sesión iniciada!");
    } else { alert("Error al registrarse."); }
  };

  const handleLogin = async (usuario, password) => {
    const response = await fetch('http://localhost:5000/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setVista('inicio');
    } else { alert("Usuario o contraseña incorrectos"); }
  };

  const obtenerTransacciones = async (desde = "", hasta = "", catId = "") => {
    if (!token) return;
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    if (catId) params.append("categoriaId", catId);

    const url = `http://localhost:5000/api/transacciones?${params.toString()}`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    
    if (response.ok) {
      const data = await response.json();
      setTransacciones(data);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo') {
        setNuevoGasto({ ...nuevoGasto, tipo: value, categoriaId: 0 });
    } else {
        setNuevoGasto({
            ...nuevoGasto,
            [name]: (name === 'monto' || name === 'categoriaId') ? Number(value) : value
        });
    }
  };

  const enviarDatos = async (e) => {
    e.preventDefault(); 
    const datosAEnviar = { ...nuevoGasto };
    
    // Seguro Anti-Errores
    if (datosAEnviar.categoriaId === 0) {
        if (categoriasFiltradas.length > 0) {
            datosAEnviar.categoriaId = categoriasFiltradas[0].categoriaId;
        } else {
            alert("Error: No tienes categorías para este tipo. ¡Crea una primero!");
            return;
        }
    }

    try {
      // Intentamos ir al Backend
      const response = await fetch('http://localhost:5000/api/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(datosAEnviar) 
      });

      if (response.ok) {
        const registroCreado = await response.json();
        setTransacciones([...transacciones, registroCreado]);
        alert("¡Guardado con éxito!");
        setVista('inicio'); 
        setNuevoGasto({ monto: '', descripcion: '', tipo: 'Gasto', categoriaId: 0 });
      } else {
        alert(`El Backend lo rechazó (Error ${response.status}).`);
      }
    } catch (error) {
      // Si el Backend está apagado o inalcanzable, caerá aquí
      alert("¡React no pudo encontrar el Backend! ¿Está corriendo Visual Studio?");
    }
  };

  const borrarTransaccion = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    const response = await fetch(`http://localhost:5000/api/transacciones/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      setTransacciones(transacciones.filter(t => t.transaccionId !== id));
    }
  };

  // 4. USE EFFECTS (Carga Inicial y Persistencia)
  useEffect(() => {
    if (!token) return;
    const cargarCategorias = async () => {
      const response = await fetch("http://localhost:5000/api/categorias", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setCategorias(await response.json());
    };
    cargarCategorias();
  }, [token]);

  useEffect(() => {
    if (token) {
        obtenerTransacciones(filtroFechaDesde, filtroFechaHasta, filtroCategoria);
    }
  }, [token, filtroFechaDesde, filtroFechaHasta, filtroCategoria]);

  const saldoTotal = transacciones.reduce((acumulado, t) => {
    return t.tipo === 'Ingreso' ? acumulado + Number(t.monto) : acumulado - Number(t.monto)
  }, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTransacciones([]);
    setVista('login');
  };

  // 5. RENDERIZADO
  return (
    <div className="container">
      {token && (
        <header className="header">
          <button onClick={() => setVista('inicio')}>Inicio</button>
          <button onClick={() => setVista('formulario')}>Nuevo Registro</button>
          <button onClick={() => setVista('nueva-categoria')}>Nueva Categoría</button>
          <button onClick={() => setVista('gastos')}>Ver Gastos</button>
          <button onClick={() => setVista('ganancias')}>Ver Ganancias</button>
          <button onClick={handleLogout} className="boton-salir">Cerrar Sesión</button>
        </header>
      )}

      <main>
        <h1>Gestión de Gastos</h1>

        {vista === 'login' && (
          <div className="login-container">
            <h2>{esRegistro ? 'Crear Cuenta' : 'Ingresar'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const u = e.target.usuario.value;
              const p = e.target.password.value;
              esRegistro ? handleRegister(u, p) : handleLogin(u, p);
            }}>
              <input name="usuario" type="text" placeholder="Usuario" required />
              <input name="password" type="password" placeholder="Contraseña" required />
              <button type="submit" className="boton-auth">{esRegistro ? 'Registrarme' : 'Entrar'}</button>
            </form>
            <p className="toggle-auth">
              {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              <span onClick={() => setEsRegistro(!esRegistro)}>
                {esRegistro ? ' Inicia Sesión' : ' Regístrate aquí'}
              </span>
            </p>
          </div>
        )}

        {(vista === 'gastos' || vista === 'ganancias') && (
          <div className="filters-container">
            <div className="filters-title">🔍 Filtros de Búsqueda</div>
            
            <div className="filters-grid">
              {/* Grupo de Botones de Tipo */}
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

              {/* Filtro por Categoría */}
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

              {/* Filtro por Fechas */}
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
        )}

        {vista === 'inicio' && (
          <div className="inicio-container">
            <div className='mensaje-inicio'>
              <h2>Bienvenido</h2>
              <p>Usa el menú superior para gestionar tus finanzas.</p>
            </div>
            <div className={`tarjeta-saldo ${saldoTotal >= 0 ? 'positivo' : 'negativo'}`}>
              <h3>Saldo Disponible</h3>
              <p className="monto-total">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(saldoTotal)}
              </p>
            </div>
            <p>Tienes un total de {transacciones.length} registros en tu base de datos.</p>
          </div>
        )}

        {vista === 'formulario' && (
          <section className="seccion-formulario">
            <h2>Nuevo Registro</h2>
            <form onSubmit={enviarDatos} className="formulario-moderno">
              <div className="grupo-input">
                <label>Monto</label>
                <input name="monto" type="number" placeholder="0.00" value={nuevoGasto.monto} onChange={manejarCambio} required />
              </div>
              <div className="grupo-input">
                <label>Descripción</label>
                <input name="descripcion" type="text" placeholder="¿En qué se usó?" value={nuevoGasto.descripcion} onChange={manejarCambio} required />
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
                <select name="categoriaId" value={nuevoGasto.categoriaId || ""} onChange={manejarCambio} required>
                    <option value="">Seleccione una...</option>
                    {categoriasFiltradas.map(cat => (
                        <option key={cat.categoriaId} value={cat.categoriaId}>{cat.nombre}</option>
                    ))}
                </select>
              </div>
              <button type="submit" className="boton-guardar">Guardar Registro</button>
            </form>
          </section>
        )}

        {vista === 'nueva-categoria' && (
          <section className="seccion-formulario">
            <h2>Crear Nueva Categoría</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              guardarNuevaCategoria(e.target.nombreCat.value, e.target.tipoCat.value);
            }} className="formulario-moderno">
              <div className="grupo-input">
                <label>Nombre</label>
                <input name="nombreCat" type="text" placeholder="Ej: Gimnasio..." required />
              </div>
              <div className="grupo-input">
                <label>Tipo</label>
                <select name="tipoCat">
                  <option value="Gasto">Gasto</option>
                  <option value="Ingreso">Ingreso</option>
                </select>
              </div>
              <button type="submit" className="boton-guardar">Guardar Categoría</button>
            </form>
          </section>
        )}

        {vista === 'gastos' && (
          <div className='lista-tarjetas'>
            <h2>Mis Gastos</h2>
            {soloGastos.length > 0 ? soloGastos.map((t) => (
              <Tarjeta key={t.transaccionId} nombre={t.descripcion} oficio={`${t.categoria?.nombre || 'S/C'} - $${t.monto}`} color="#e74c3c" onDelete={() => borrarTransaccion(t.transaccionId)} />
            )) : <p>No hay gastos registrados o que coincidan con los filtros.</p>}
          </div>
        )}

        {vista === 'ganancias' && (
          <div className='lista-tarjetas'>
            <h2>Mis Ganancias</h2>
            {soloGanancias.length > 0 ? soloGanancias.map((t) => (
              <Tarjeta key={t.transaccionId} nombre={t.descripcion} oficio={`${t.categoria?.nombre || 'S/C'} - $${t.monto}`} color="#2ecc71" onDelete={() => borrarTransaccion(t.transaccionId)} />
            )) : <p>No hay ingresos registrados o que coincidan con los filtros.</p>}
          </div>
        )}
      </main>
    </div>
  )
}

export default App;