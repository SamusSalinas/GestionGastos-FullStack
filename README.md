Sistema de Gestión de Gastos Personal (Industrial Grade)
¡Bienvenido! Este es un sistema Full Stack diseñado para el control de finanzas personales. No es solo una aplicación de "lista de tareas"; es un sistema multiusuario construido con estándares de arquitectura empresarial.
Características Principales
• Seguridad: Autenticación y autorización basada en JWT (JSON Web Tokens).
• Aislamiento de Datos: Cada usuario tiene su propia base de datos lógica; los datos están protegidos y solo son accesibles por su propietario.
• Experiencia de Usuario (UX) Fluida: Implementación de Auto-Login tras el registro y diseño moderno en Dark Mode.
• Arquitectura Escalable: El backend está diseñado siguiendo los principios SOLID, facilitando el mantenimiento y la expansión del sistema.
Stack Tecnológico
Backend
• Framework: .NET 8 (Web API)
• Base de Datos: SQL Server
• Autenticación: JWT (Bearer Token)
• ORM: Entity Framework Core/ ADO.NET
Frontend
• Librería: React.js (con Vite)
• Estado/Rutas: React Router Dom
• Estilos: CSS3 
• Visualización: (Próximamente) Recharts para analítica financiera.
Arquitectura de Software (Principios SOLID)
Para este proyecto, decidí ir más allá de un controlador básico. Apliqué una separación de responsabilidades clara:
1.Capa de Controladores: Únicamente gestiona las peticiones HTTP y las respuestas. No conoce la base de datos.
2.Capa de Servicios (TransaccionService): Contiene toda la lógica de negocio, cumpliendo con el Single Responsibility Principle (SRP).
3.Seguridad: Implementación de un Middleware para la validación de tokens y protección de rutas.
Instalación y Configuración
Prerrequisitos
•.NET SDK 8.0
• SQL Server (LocalDB o instancia de servidor)
• Node.js (v18+)
Backend
1. Navega a la carpeta /backend.
2. Configura tu cadena de conexión en el archivo appsettings.json.
3. Ejecuta las migraciones (si usas EF Core): dotnet ef database update.
4. Corre la API: dotnet run.
Frontend
1. Navega a la carpeta /frontend.
2. Instala las dependencias: npm install.
3. Inicia el servidor de desarrollo: npm run dev.
Próximos Pasos (Roadmap)
• Implementación de gráficos estadísticos (torta/barras) para categorías de gastos.
• Exportación de reportes en formato PDF/Excel.
• Categorización personalizada por el usuario.

Autor
 👤 Autor
 Samuel - Full Stack Developer
- GitHub: https://github.com/SamusSalinas
- LinkedIn: www.linkedin.com/in/samuel-elias-salinas-contreras-a91091240
