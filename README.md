# CTP Platanar - Sistema de Asistencia

Sistema de gestión de asistencia para el Colegio Técnico Platanar con interfaz web.

## Estructura del Proyecto

```
ctp-platanar/
├── ctp-platanar-backend/     # API REST con Node.js + Express + MySQL
│   ├── models/               # Modelos de datos (Sequelize)
│   ├── routes/               # Rutas API
│   ├── server.js             # Servidor principal
│   ├── db.js                 # Configuración de base de datos
│   ├── package.json          # Dependencias
│   ├── .env                  # Variables de entorno
│   └── .env.example          # Template de variables
│
└── ctp-platanar-frontend/    # Interfaz web con React
    ├── src/
    │   ├── components/       # Componentes reutilizables
    │   ├── pages/           # Páginas principales
    │   ├── utils/           # Utilidades (API client)
    │   ├── App.js           # Componente principal
    │   └── index.js         # Punto de entrada
    ├── package.json         # Dependencias
    └── .env                 # Variables de entorno

```

## Configuración Inicial

### Backend

1. **Instalar dependencias:**
   ```bash
   cd ctp-platanar-backend
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env`
   - Ajustar los valores según tu ambiente:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=tu_contraseña
     DB_NAME=ctp_platanar
     DB_DIALECT=mysql
     PORT=5000
     JWT_SECRET=tu_secreto
     ```

3. **Crear la base de datos MySQL:**
   ```sql
   CREATE DATABASE ctp_platanar;
   ```
   - Si no usas MySQL local, puedes usar SQLite en el backend con `DB_DIALECT=sqlite` o usando `DATABASE_URL`.
   - El archivo SQLite se guarda en `ctp-platanar-backend/data/database.sqlite`.

4. **Ejecutar el servidor:**
   ```bash
   npm start          # Producción
   npm run dev        # Desarrollo (con nodemon)
   ```

   Si quieres que el backend escuche en toda la red y acepte peticiones solo desde tu frontend, configura estas variables antes de iniciar:
   ```bash
   $env:HOST="0.0.0.0"
   $env:PORT="5000"
   $env:FRONTEND_ORIGINS="http://192.168.1.20:3000,http://localhost:3000"
   ```
   Reemplaza la IP por la del equipo donde estará el frontend. Luego arranca el backend con `npm start`.

### Ejecutar todo desde la raíz del repositorio
1. Instala dependencias desde la raíz:
   ```bash
   npm run install-deps
   ```
2. Inicia frontend y backend juntos (modo desarrollo):
   ```bash
   npm run dev
   ```
3. En producción, construye el frontend y luego ejecuta el backend:
   ```bash
   npm run build-frontend
   npm run backend
   ```

### Frontend

1. **Instalar dependencias:**
   ```bash
   cd ctp-platanar-frontend
   npm install
   ```

2. **Configurar variables de entorno:**
   - Crear/editar `.env`:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```
   - Para despliegue local o cuando el frontend se sirve desde el mismo backend en producción, usa la ruta relativa:
     ```
     REACT_APP_API_URL=/api
     ```
   - Si prefieres usar una URL pública completa:
     ```
     REACT_APP_API_URL=https://mi-backend-en-la-nube.com/api
     ```

3. **Ejecutar la aplicación:**
   ```bash
   cd ctp-platanar-frontend
   npm install
   npm start          # Inicia el frontend y también el backend automáticamente
   ```

   - Con esta configuración, el comando `npm start` dentro de `ctp-platanar-frontend` ejecuta el backend y abre el frontend en `http://localhost:3000`.
   - Si ya estás en la raíz del repositorio, también puedes usar `npm run dev` para iniciar ambos servicios desde allí.

## Despliegue en la nube

Para que el backend esté siempre disponible desde cualquier navegador, debes desplegarlo en un servicio con URL pública y una base de datos persistente.

1. **Elegir un host:**
   - Render, Railway, Fly.io, Heroku, Vercel (para frontend), DigitalOcean App Platform.
   - Alternativa local: utilizar un servidor con IP pública y mantener Node.js en ejecución.

2. **Configurar variables de entorno en el servicio:**
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=tu_secreto_seguro`
   - `DATABASE_URL` con la conexión de tu base de datos en la nube, o `DB_DIALECT=sqlite` si el host guarda archivos en disco persistente.
   - Si tu servicio usa SSL para DB: `DB_SSL=true`

3. **Frontend:**
   - Para producción, construye con `npm run build` en `ctp-platanar-frontend`.
   - Si el frontend se sirve desde el mismo backend, usa `REACT_APP_API_URL=/api`.
   - Si lo sirves desde un dominio separado, usa la URL pública completa del backend.

4. **Despliegue en Render:**
   - Agrega un servicio tipo Web en Render que apunte al repositorio.
   - Usa este comando de build:
     ```bash
     cd ctp-platanar-frontend && npm install && npm run build && cd ../ctp-platanar-backend && npm install
     ```
   - Usa este comando de start:
     ```bash
     cd ctp-platanar-backend && npm start
     ```
   - Define estas variables en Render:
     - `NODE_ENV=production`
     - `PORT=5000`
     - `JWT_SECRET=tu_secreto_seguro`
     - `DATABASE_URL=mysql://user:password@host:3306/ctp_platanar`
     - `DB_SSL=true` (si el proveedor de base de datos lo requiere)
     - `REACT_APP_API_URL=/api`
   - El backend servirá el frontend estático desde `ctp-platanar-frontend/build` cuando `NODE_ENV=production`.

5. **Base de datos persistente:**
   - No uses una base de datos temporal o en memoria.
   - Para producción, lo más estable es usar MySQL o PostgreSQL gestionado.
   - Si usas SQLite, revisa que `ctp-platanar-backend/data/database.sqlite` exista después de reiniciar.

4. **Base de datos persistente:**
   - No uses una base de datos temporal o en memoria.
   - Para producción, lo más seguro es MySQL o PostgreSQL gestionado.
   - Si usas SQLite, asegúrate de que el host no borre `ctp-platanar-backend/data/database.sqlite` tras cada reinicio.

## API Endpoints

### Profesores
- `POST /api/teachers` - Registrar profesor
- `POST /api/teachers/login` - Login profesor
- `GET /api/teachers` - Listar profesores
- `DELETE /api/teachers` - Eliminar todos

### Estudiantes
- `POST /api/students` - Crear estudiante
- `GET /api/students/:teacherId` - Obtener estudiantes por profesor
- `DELETE /api/students` - Eliminar todos

### Asistencia
- `GET /api/attendance` - Obtener todos los registros
- `POST /api/attendance` - Crear registro de asistencia
- `PUT /api/attendance/:id` - Actualizar asistencia

## Modelos de Datos

### Teacher
```javascript
{
  teacherId: String,
  name: String,
  phone: String,
  email: String (único),
  password: String (encriptada),
  subject: String
}
```

### Student
```javascript
{
  id: Integer (PK),
  name: String,
  grade: String,
  section: String,
  parentEmail: String,
  teacherId: String (FK)
}
```

### Attendance
```javascript
{
  id: Integer (PK),
  date: Date,
  status: Enum('Presente', 'Tarde', 'Ausente', 'Justificado'),
  studentId: Integer (FK)
}
```

## Problemas Comunes

### Error: "Cannot find module 'sequelize'"
- Ejecutar: `npm install` en la carpeta backend

### Error de conexión a base de datos
- Verificar que MySQL está ejecutándose
- Validar credenciales en `.env`
- Confirmar que la base de datos existe

### Frontend no conecta al backend
- Verificar que el backend está corriendo en puerto 5000
- Revisar la URL en `.env` del frontend
- Abrir consola del navegador para ver errores

## Próximos Pasos

- [ ] Implementar autenticación con JWT
- [ ] Agregar validación de datos en servidor
- [ ] Crear panel de reportes
- [ ] Implementar notificaciones por email
- [ ] Agregar pruebas automatizadas
- [ ] Desplegar en producción
