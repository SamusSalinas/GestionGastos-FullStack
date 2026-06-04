
import React, { useState } from 'react';

function Login({ esRegistro, setEsRegistro, handleLogin, handleRegister }) {

  const [mostrarPassword, setMostrarPassword] = useState(false);
    const togglePassword = () => {
      setMostrarPassword(!mostrarPassword);
    };

  const handleSubmit = (e) => {
    e.preventDefault();
    const usuario = e.target.usuario.value;
    const password = e.target.password.value;
    
    if (esRegistro) {
      handleRegister(usuario, password);
    } else {
      handleLogin(usuario, password);
    }
  };

return (
    <div className="login-container">
      <h2>{esRegistro ? 'Crear Cuenta' : 'Ingresar'}</h2>
      <form onSubmit={handleSubmit}>
        
        <div className="grupo-input">
          <label>Nombre de Usuario</label>
          <input name="usuario" type="text" placeholder="Usuario" required />
        </div>
        
        {/* 4. AQUÍ ESTÁ EL NUEVO INPUT DE CONTRASEÑA */}
        <div className="grupo-input">
          <label>Contraseña</label>
          <div className="input-password-container">
            <input 
              name="password" 
              type={mostrarPassword ? "text" : "password"} 
              placeholder="Contraseña" 
              required 
            />
            <button 
              type="button" 
              className="btn-ver-password" 
              onClick={togglePassword}
            >
              {mostrarPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <button type="submit" className="boton-auth">
          {esRegistro ? 'Registrarme' : 'Entrar'}
        </button>
      </form>
      
      <p className="toggle-auth">
        {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
        <span onClick={() => setEsRegistro(!esRegistro)}>
          {esRegistro ? ' Inicia Sesión' : ' Regístrate aquí'}
        </span>
      </p>
    </div>
  );
}

export default Login; 