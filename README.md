# Sistema de Gestión de Gastos Personal 
![Visuales](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Visuales](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Visuales](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Visuales](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)

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

## 🚀 Instalación (Docker - Recomendado)
La forma más rápida de ejecutar la aplicación es utilizando Docker Compose.

1. **Clona el repositorio:**
   ```bash
   git clone [https://github.com/SamusSalinas/Gestion-Gastos.git](https://github.com/SamusSalinas/Gestion-Gastos.git)
   cd Gestion-Gastos
2. **Ejecuta los contenedores:**
   Bash
   docker-compose up -d --build
3. **Accede a la app**
   Frontend: http://localhost:3000
   http://localhost:5000/scalar/v1
Autor
 👤 Autor
 Samuel - Full Stack Developer
- GitHub: https://github.com/SamusSalinas
- LinkedIn: www.linkedin.com/in/samuel-elias-salinas-contreras-a91091240
