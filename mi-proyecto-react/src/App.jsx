import { useEffect, useState } from 'react'
import './App.css'
import Tarjeta from './components/Tarjeta'
import Dashboard from './components/Dashboard'
import Login from './components/Login';
import FormularioTransaccion from './components/FormularioTransaccion';
import Filtros from './components/Filtros';
import FormularioCategoria from './components/FormularioCategoria';

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

  // 2. LÓGICA DE FILTRADO LOCAL Y MÉTRICAS
  const soloGastos = transacciones.filter(t => t.tipo === 'Gasto');
  const soloGanancias = transacciones.filter(t => t.tipo === 'Ingreso');
  const categoriasFiltradas = categorias.filter(c => c.tipo === nuevoGasto.tipo);

  // Cálculos matemáticos del Dashboard en vivo
  const totalIngresos = transacciones.filter(t => t.tipo === 'Ingreso').reduce((acc, t) => acc + Number(t.monto), 0);
  const totalGastos = transacciones.filter(t => t.tipo === 'Gasto').reduce((acc, t) => acc + Number(t.monto), 0);
  const saldoTotal = totalIngresos - totalGastos;
  const pozoAhorro = totalIngresos * 0.2; // 20% de los ingresos totales se destinan a la meta de ahorro

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

        {/* --- FORMULARIO DE AUTH (LOGIN / REGISTRO) --- */}
        {vista === 'login' && (
          <Login 
            esRegistro={esRegistro} 
            setEsRegistro={setEsRegistro} 
            handleLogin={handleLogin} 
            handleRegister={handleRegister} 
          />
        )}

        {/* --- CONTENEDOR DE FILTROS --- */}
        {(vista === 'gastos' || vista === 'ganancias') && (
          <Filtros 
            vista={vista}
            setVista={setVista}
            categorias={categorias}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
            filtroFechaDesde={filtroFechaDesde}
            setFiltroFechaDesde={setFiltroFechaDesde}
            filtroFechaHasta={filtroFechaHasta}
            setFiltroFechaHasta={setFiltroFechaHasta}
            limpiarFiltros={limpiarFiltros}
          />
        )}

        {/* --- PANTALLA DE INICIO (DASHBOARD COMPLETO) --- */}
        {vista === 'inicio' && (
          <Dashboard 
            saldoTotal={saldoTotal} 
            pozoAhorro={pozoAhorro} 
            totalGastos={totalGastos} 
            soloGastos={soloGastos} 
          />
        )}

        {/* --- SECCIÓN NUEVO REGISTRO --- */}
        {vista === 'formulario' && (
          <FormularioTransaccion 
            enviarDatos={enviarDatos}
            nuevoGasto={nuevoGasto}
            manejarCambio={manejarCambio}
            categoriasFiltradas={categoriasFiltradas}
          />
        )}

        {/* --- SECCIÓN NUEVA CATEGORÍA --- */}
        {vista === 'nueva-categoria' && (
          <FormularioCategoria guardarNuevaCategoria={guardarNuevaCategoria} />
        )}

        {/* --- VISTA LISTADO DE GASTOS --- */}
        {vista === 'gastos' && (
          <div className='lista-tarjetas'>
            <h2>Mis Gastos</h2>
            {soloGastos.length > 0 ? soloGastos.map((t) => (
              <div key={t.transaccionId} className="tarjeta-item">
                <Tarjeta nombre={t.descripcion} oficio={`${t.categoria?.nombre || 'S/C'} - $${t.monto}`} color="#e74c3c" onDelete={() => borrarTransaccion(t.transaccionId)} />
              </div>
            )) : <p>No hay gastos registrados o que coincidan con los filtros.</p>}
          </div>
        )}

        {/* --- VISTA LISTADO DE GANANCIAS --- */}
        {vista === 'ganancias' && (
          <div className='lista-tarjetas'>
            <h2>Mis Ganancias</h2>
            {soloGanancias.length > 0 ? soloGanancias.map((t) => (
              <div key={t.transaccionId} className="tarjeta-item">
                <Tarjeta nombre={t.descripcion} oficio={`${t.categoria?.nombre || 'S/C'} - $${t.monto}`} color="#2ecc71" onDelete={() => borrarTransaccion(t.transaccionId)} />
              </div>
            )) : <p>No hay ingresos registrados o que coincidan con los filtros.</p>}
          </div>
        )}
      </main>
    </div>
  )
}

export default App;