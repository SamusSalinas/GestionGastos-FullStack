# Sistema de Gestión de Gastos Personal 

¡Bienvenido! Este es un sistema **Full Stack** diseñado para el control eficiente de finanzas personales. No es solo una aplicación de "lista de tareas"; es un sistema multiusuario construido con estándares de arquitectura empresarial y buenas prácticas de la industria.

---

## Características Principales

* **Seguridad de Nivel Industrial:** Autenticación y autorización basada en **JWT (JSON Web Tokens)**.
* **Navegación Profesional:** Enrutamiento declarativo y protección de rutas privadas mediante **React Router DOM**. Los usuarios sin sesión iniciada son redirigidos automáticamente.
* **Arquitectura Desacoplada:** Separación total de responsabilidades. El Backend sigue los principios **SOLID**, mientras que el Frontend utiliza una arquitectura basada en Componentes y una capa de servicios (`api.js`) para aislar la lógica de red.
* **Aislamiento de Datos:** Cada usuario tiene su propia base de datos lógica; los datos están protegidos y solo son accesibles por su propietario.
* **Experiencia de Usuario:** Mnejo de estados en tiempo real y diseño responsivo.

---

## Stack Tecnológico

**Backend**
* **Framework:** .NET 8 (Web API)
* **Base de Datos:** SQL Server
* **Autenticación:** JWT (Bearer Token)
* **ORM:** Entity Framework Core

**Frontend**
* **Librería:** React.js (construido con Vite)
* **Enrutamiento:** React Router DOM
* **Estilos:** CSS3 
* **Gestión de API:** Fetch API centralizado mediante capa de servicios.

---

## Arquitectura de Software

Para este proyecto, se aplicó una separación de responsabilidades clara en ambos extremos del Stack:

### Backend (Principios SOLID)
1. **Capa de Controladores:** Únicamente gestiona las peticiones HTTP y las respuestas. No conoce la base de datos.
2. **Capa de Servicios:** Contiene toda la lógica de negocio, cumpliendo con el **Single Responsibility Principle (SRP)**.
3. **Seguridad:** Implementación de un Middleware para la validación de tokens y protección de rutas.

### Frontend (Arquitectura de Componentes)
1. **Orquestador Principal:** `App.jsx` actúa únicamente como manejador de rutas y estados globales.
2. **Componentes Aislados:** Vistas divididas en módulos reutilizables (`Dashboard`, `Filtros`, `Formularios`, etc.).
3. **Capa de Servicios (`api.js`):** Centralización de todas las llamadas HTTP y manejo de errores, eliminando la lógica de conexión de la vista del usuario.
4. **Variables de Entorno:** Uso de archivos `.env` para proteger las URLs de conexión a la API.

---

## Instalación y Configuración

### Prerrequisitos
* .NET SDK 8.0
* SQL Server (LocalDB o instancia de servidor)
* Node.js (v18+)

### Configuración del Backend
1. Navega a la carpeta `/GestionDatos.API`.
2. Configura tu cadena de conexión en el archivo `appsettings.json`.
3. Ejecuta las migraciones de Entity Framework para generar las tablas: `dotnet ef database update`.
4. Corre la API: `dotnet run`. *(Por defecto correrá en el puerto 5000).*

### Configuración del Frontend
1. Navega a la carpeta `/mi-proyecto-react`.
2. Crea un archivo `.env` en la raíz de esta carpeta e incluye la URL de tu API:
```env
   VITE_API_URL=http://localhost:5000/api

Autor
 👤 Autor
 Samuel - Full Stack Developer
- GitHub: https://github.com/SamusSalinas
- LinkedIn: www.linkedin.com/in/samuel-elias-salinas-contreras-a91091240
