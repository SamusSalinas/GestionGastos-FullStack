import { useEffect, useState } from 'react'
import './App.css'
import Tarjeta from './components/Tarjeta'

function App() {

  // 1. ESTADOS (La memoria)

  //Brujula
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [vista, setVista]= useState(token ? 'inicio' : 'login'); //Si hay token

  //Creamos la memoria para la lista de la base de datos.
  //mpieza como [] (un arreglo vacío) porque al inicio, 
  // antes de consultar al servidor, no tenemos nada.
  const [transacciones, setTransacciones] = useState([]);
  const [esRegistro, setEsRegistro] = useState(false);

  //Creamos la memoria para el formulario.
  const[nuevoGasto, setNuevoGasto] = useState({
    monto:0,
    descripcion:'',
    tipo: 'Gasto',
    categoriaId: 1
  });

  

  // 2. LÓGICA DE FILTRADO
  // Los creamos aquí para usarlos abajo según la vista
  const soloGastos = transacciones.filter(t => t.tipo === 'Gasto' && !t.estaBorrado);
  const soloGanancias = transacciones.filter(t => t.tipo === 'Ingreso' && !t.estaBorrado);

  // 3. FUNCIONES DE EVENTOS

  const handleRegister = async (usuario, password) =>{
    const response = await fetch('http://localhost:5000/api/Auth/registrar', {
      method: 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({ usuario, password})
    });

    if (response.ok){
      const data = await response.json();
      // Guardamos el token que nos mando el registro
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setVista('inicio'); // Entra directamente
      alert("¡Cuenta creada y sesión iniciada!");
    }else{
      alert("Error al registrarse. Quizás el usuario ya existe.")
    }
  }

  const handleLogin = async (usuario, password) => {
    try{
      const response = await fetch('http://localhost:5000/api/Auth/login',{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({ usuario, password})
      });

      if (response.ok){
        const data = await response.json();
        localStorage.setItem('token', data.token); // Guardamos la llave en el navegador
        setToken(data.token);
        setVista('inicio'); // Saltamos a la app principal
      } else{
        alert("Usuario o contraseña incorrectos")
      }
    } catch (error){
      console.error("Error al conectar con la API:", error)
    }
  };

  const cargarTransacciones = async () => {
  if (!token) return;

  try {
    const res = await fetch('http://localhost:5000/api/transacciones', {
      headers: {
        'Authorization': `Bearer ${token}` // Mostramos la pulsera VIP
      }
    });

    if (res.ok) {
      const data = await res.json();
      setTransacciones(data); // Esto actualiza la lista y el saldo automáticamente
    } else if (res.status === 401) {
      handleLogout(); // Si el token no sirve, afuera
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};
  //Esta función se ejecuta cada vez que tecleas una sola letra en el formulario.
  //(e): Es el "evento" que lanza el navegador. Contiene toda la información de la tecla que presionaste.
  const manejarCambio = (e) => {
  // e.target.name es el nombre del input (ej: 'monto')
  // e.target.value es lo que el usuario escribió
  setNuevoGasto({
    ...nuevoGasto,
    [e.target.name]: e.target.value
  });
  };

  const enviarDatos = async (e) => {
  e.preventDefault(); // Evita que la página se recargue

  const response = await fetch('http://localhost:5000/api/transacciones', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(nuevoGasto) // Convertimos el objeto a texto JSON
  });

  if (response.ok) {
    const registroCreado = await response.json();// La API nos devuelve el objeto con su ID de SQL
    // ACTUALIZACIÓN AUTOMÁTICA:
    // "Toma lo que ya tenías y agrégale el nuevo registro al final"
    setTransacciones([...transacciones, registroCreado]);

    alert("Guardado con exito!");
    setVista('inicio')// Te manda al inicio para ver el saldo actualizado
  }
  };

  //Borrar
  const borrarTransaccion = async (id) => {
    // Confirmación simple para evitar errores
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;

    const response = await fetch(`http://localhost:5000/api/transacciones/${id}`, {
      method: 'DELETE', // El navegador enviará la petición al método que creamos arriba
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok){
      // Para que desaparezca de la pantalla sin recargar:
    // Filtramos la lista local quitando la que acabamos de borrar
      setTransacciones(transacciones.filter(t => t.transaccionId !== id));
    } else {
      alert("Error al intentar borrar el registro");
    }
  };
  

  // 4. CARGA INICIAL

  useEffect(() => {
  cargarTransacciones();
  }, [token]); // Se dispara solo al loguearte o cambiar el token

  const saldoTotal = transacciones.reduce((acumulado, t) => {
    //Si es Ingreso sumamos, si es Gasto restamos
    return t.tipo === 'Ingreso'
    ? acumulado + t.monto
    : acumulado - t.monto
  }, 0)// El 0 es el valor inicial de la cuenta

  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos la llave de la memoria física
    setToken(null);
    setTransacciones([]);// Limpiamos la lista por seguridad
    setVista('login')// Volvemos a la puerta
  };
  // 5. RENDERIZADO (Lo que se ve)

  return (
    
    <div className="container">
      {/*El HEADER SIEMPRE SE VE*/}
      <header className="header">
        <button onClick={() => setVista('inicio')}>Inicio</button>
        <button onClick={() => setVista('formulario')}>Nuevo Registro</button>
        <button onClick={() => setVista('gastos')}>Ver Gastos</button>
        <button onClick={() => setVista('ganancias')}>Ver Ganancias</button>
        <button onClick={handleLogout} className="boton-salir">Cerrar Sesion</button>
      </header>
      
      <main>
      <h1>Gestión de Gastos</h1>

      {/*Vista Login*/}
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
            <button type="submit" className="boton-auth"> {/* <--- Asegúrate de esta clase */}
              {esRegistro ? 'Registrarme' : 'Entrar'}
            </button>
          </form>
          
          <p className="toggle-auth">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <span onClick={() => setEsRegistro(!esRegistro)}>
              {esRegistro ? 'Inicia Sesión' : 'Regístrate aquí'}
            </span>
          </p>
        </div>
      )}
      
      {/*Vista Inicio*/}
      {vista === 'inicio' &&(
        <div className='mensaje-inicio'>
          <h2>Bienvenido</h2>
          <p>Usa el menú superior para gestionar tus finanzas.</p>
        </div>
      )}

      {vista === 'inicio' &&(
        <div className="inicio-container">
          <h2>Resumen General</h2>

          {/* Aplicamos clase 'positivo' o 'negativo' según el número */}
          <div className={`tarjeta-saldo ${saldoTotal >= 0 ? 'positivo' : 'negativo'}`}>
          <h3>Saldo Disponible</h3>
          <p className="monto-total">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(saldoTotal)}
        
          </p>
          </div>
          <p>Tienes un total de {transacciones.length} registros en tu base de datos.</p>
        </div>
      )}
      
      {/*Vista: Formulario*/}
      {vista === 'formulario' &&(
        <section className="seccion-formulario">
          <h2>Nuevo Registro</h2>
          <form onSubmit={enviarDatos} className="formulario-moderno">
            <div className="grupo-input">
              <label>Monto</label>
              <input name="monto" type="number" placeholder="0.00" onChange={manejarCambio} />
            </div>

            <div className="grupo-input">
              <label>Descripción</label>
              <input name="descripcion" type="text" placeholder="¿En qué se usó el dinero?" onChange={manejarCambio} />
            </div>

            <div className="grupo-input">
              <label>Tipo de Movimiento</label>
              <select name="tipo" onChange={manejarCambio}>
                <option value="Gasto">📉 Gasto</option>
                <option value="Ingreso">📈 Ingreso</option>
              </select>
            </div>

            <button type="submit" className="boton-guardar">Guardar Registro</button>
          </form>
        </section>
      )}

      {/*Vista: Gastos*/}
      {vista === 'gastos' &&(
        <div className='Lista-tarjetas'>
          <h2>Mis Gastos</h2>
          {soloGastos.map((t) => (
            <Tarjeta
              key={t.transaccionId}
              nombre={t.descripcion}
              oficio={`Gasto: $${t.monto}`}
              color="#e74c3c"
              onDelete={() => borrarTransaccion(t.transaccionId)}
            />
          ))}
        </div>
      )}

      {/*Vista Ganancias */}
      {vista === 'ganancias' && (
        <div className='lista-tarjetas'>
          <h2>Mis Ganancias</h2>
          {soloGanancias.map((t) => (
            <Tarjeta
            key={t.transaccionId}
            nombre={t.descripcion}
            oficio={`Ingreso: $${t.monto}`}
            color="#2ecc71"
            onDelete={() => borrarTransaccion(t.transaccionId)}
            />
          ))}
        </div>
      )}
      </main>
    </div>
  )
}

export default App;