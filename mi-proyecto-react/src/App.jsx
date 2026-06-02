import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Tarjeta from './components/Tarjeta'
import Dashboard from './components/Dashboard'
import Login from './components/Login';
import FormularioTransaccion from './components/FormularioTransaccion';
import Filtros from './components/Filtros';
import FormularioCategoria from './components/FormularioCategoria';
import { apiService } from './services/api';

function App() {
  // 1. ESTADOS
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [categorias, setCategorias] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [esRegistro, setEsRegistro] = useState(false);

  // Estados para los filtros
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Memoria del formulario (iniciamos la categoriaId en 0 para evitar errores)
  const [nuevoGasto, setNuevoGasto] = useState({ monto: '', descripcion: '', tipo: 'Gasto', categoriaId: 0 });

  const navigate = useNavigate();
  
  

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
    try {
      const catCreada = await apiService.crearCategoria(token, nombre, tipo);
      setCategorias([...categorias, catCreada]);
      alert(`¡Categoría '${nombre}' creada!`);
      navigate('/formulario');
    } catch (error) { alert(error.message); }
  };

  const handleRegister = async (usuario, password) => {
    try {
      const data = await apiService.registrar(usuario, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      navigate('/inicio');
      alert("¡Cuenta creada y sesión iniciada!");
    } catch (error) { alert(error.message); }
    
  }

  const handleLogin = async (usuario, password) => {
    try {
      const data = await apiService.login(usuario, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      navigate('/inicio');
    } catch (error) { alert(error.message); }
    navigate('/inicio');
  };

  const obtenerTransacciones = async (desde = "", hasta = "", catId = "") => {
    if (!token) return;
    try {
      const data = await apiService.obtenerTransacciones(token, desde, hasta, catId);
      setTransacciones(data);
    } catch (error) { console.error(error); }
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

    if (datosAEnviar.categoriaId === 0) {
        if (categoriasFiltradas.length > 0) { datosAEnviar.categoriaId = categoriasFiltradas[0].categoriaId; } 
        else { alert("Error: Crea una categoría primero."); return; }
    }

    try {
      const registroCreado = await apiService.crearTransaccion(token, datosAEnviar);
      setTransacciones([...transacciones, registroCreado]);
      alert("¡Guardado con éxito!");
      navigate('/inicio');
      setNuevoGasto({ monto: '', descripcion: '', tipo: 'Gasto', categoriaId: 0 });
    } catch (error) {
      alert(error.message || "¡Error de conexión con el Backend!");
    }
  };

  const borrarTransaccion = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await apiService.borrarTransaccion(token, id);
      setTransacciones(transacciones.filter(t => t.transaccionId !== id));
    } catch (error) { alert(error.message); }
  };

  // 4. USE EFFECTS (Carga Inicial y Persistencia)
  useEffect(() => {
    if (!token) return;
    const cargarCategorias = async () => {
      try {
        const data = await apiService.obtenerCategorias(token);
        setCategorias(data);
      } catch (error) { console.error(error); }
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
    navigate('/login');
  };

  // 5. RENDERIZADO
  return (
    <div className="container">
      {token && (
        <header className="header">
          <button onClick={() => navigate('/inicio')}>Inicio</button>
          
          
          <button onClick={() => navigate('/registro')}>Nuevo Registro</button>
          
          
          <button onClick={() => navigate('/categoria')}>Nueva Categoría</button>
          
          <button onClick={() => navigate('/gastos')}>Ver Gastos</button>
          <button onClick={() => navigate('/ganancias')}>Ver Ganancias</button>
          <button onClick={handleLogout} className="boton-salir">Cerrar Sesión</button>
        </header>
      )}

      <main>
        <h1>Gestión de Gastos</h1>
        
        <Routes>
          <Route path="/login" element={!token ? <Login esRegistro={esRegistro} setEsRegistro={setEsRegistro} handleLogin={handleLogin} handleRegister={handleRegister} /> : <Navigate to="/inicio" />} />
          
          <Route path="/inicio" element={token ? <Dashboard saldoTotal={saldoTotal} pozoAhorro={pozoAhorro} totalGastos={totalGastos} soloGastos={soloGastos} /> : <Navigate to="/login" />} />
          
          <Route path="/registro" element={token ? <FormularioTransaccion enviarDatos={enviarDatos} nuevoGasto={nuevoGasto} manejarCambio={manejarCambio} categoriasFiltradas={categoriasFiltradas} /> : <Navigate to="/login" />} />
          
          <Route path="/categoria" element={token ? <FormularioCategoria guardarNuevaCategoria={guardarNuevaCategoria} /> : <Navigate to="/login" />} />
          
          {/* VISTAS DE LISTAS */}
          <Route path="/gastos" element={token ? (
            <>
                <Filtros vista="gastos" setVista={() => navigate('/gastos')} categorias={categorias} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} filtroFechaDesde={filtroFechaDesde} setFiltroFechaDesde={setFiltroFechaDesde} filtroFechaHasta={filtroFechaHasta} setFiltroFechaHasta={setFiltroFechaHasta} limpiarFiltros={limpiarFiltros} />
                <div className='lista-tarjetas'>
                    {soloGastos.map(t => <div key={t.transaccionId} className="tarjeta-item"><Tarjeta nombre={t.descripcion} oficio={`${t.categoria?.nombre || 'S/C'} - $${t.monto}`} color="#e74c3c" onDelete={() => borrarTransaccion(t.transaccionId)} /></div>)}
                </div>
            </>
          ) : <Navigate to="/login" />} />

          <Route path="/ganancias" element={token ? (
            <>
                <Filtros vista="ganancias" setVista={() => navigate('/ganancias')} categorias={categorias} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} filtroFechaDesde={filtroFechaDesde} setFiltroFechaDesde={setFiltroFechaDesde} filtroFechaHasta={filtroFechaHasta} setFiltroFechaHasta={setFiltroFechaHasta} limpiarFiltros={limpiarFiltros} />
                <div className='lista-tarjetas'>
                    {soloGanancias.map(t => <div key={t.transaccionId} className="tarjeta-item"><Tarjeta nombre={t.descripcion} oficio={`${t.categoria?.nombre || 'S/C'} - $${t.monto}`} color="#2ecc71" onDelete={() => borrarTransaccion(t.transaccionId)} /></div>)}
                </div>
            </>
          ) : <Navigate to="/login" />} />
          
          <Route path="/" element={<Navigate to={token ? "/inicio" : "/login"} />} />
        </Routes>
      </main>
    </div>
  )
}
export default App;