# 🏥 Teleenfermería Comunitaria - Sistema de Gestión Integral

Aplicación web completa para gestión de consultas médicas, pacientes y reportes en zonas rurales y comunitarias.

## ✨ Características Principales

### 🔐 Autenticación Segura
- Registro de nuevos usuarios
- Login con validación
- Roles diferenciados (Enfermero, Médico, Administrador)
- Sesiones persistentes

### 👥 Gestión Completa de Pacientes
- Registro detallado con información personal y médica
- Búsqueda avanzada en tiempo real
- Edición y eliminación de registros
- Almacenamiento de:
  - Datos personales (DNI, edad, sexo, contacto)
  - Información médica (tipo de sangre, alergias, enfermedades crónicas)
  - Medicamentos actuales
  - Contactos de emergencia

### 📅 Gestión de Consultas
- Crear nuevas consultas vinculadas a pacientes
- 5 tipos de consulta:
  - Seguimiento
  - Educación en Salud
  - Emergencia
  - Diagnóstico
  - Prevención
- Estados de consulta (Pendiente, Completada)
- Filtros y búsqueda en tiempo real
- Registro de enfermero responsable
- Observaciones detalladas

### 📊 Dashboard Interactivo
**Tarjetas de Estadísticas:**
- Total de pacientes registrados
- Consultas programadas hoy
- Consultas pendientes
- Consultas completadas

**Gráficos Interactivos:**
- Distribución de tipos de consulta (Doughnut Chart)
- Estado de consultas (Pie Chart)
- Tendencia de últimos 7 días (Line Chart)

### 📄 Sistema de Reportes
- Generación de reportes en múltiples formatos
- Exportación a PDF/Impresora
- Filtrado por período
- Tipos de reporte:
  - Lista de pacientes
  - Reporte de consultas
  - Estadísticas generales

### 🎨 Diseño Profesional
- Interfaz moderna y responsiva
- Funciona en móviles, tablets y escritorios
- Modo oscuro automático
- Animaciones suaves
- Gradientes atractivos
- Bootstrap 5 + Bootstrap Icons

### 💾 Almacenamiento Local
- Persistencia automática con Local Storage
- Sincronización instantánea
- Sin necesidad de servidor
- Datos seguros en el navegador

## 🚀 Cómo Usar

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/dijamaps/telemedicinarural.git
cd telemedicinarural
```

2. Abre `index.html` en tu navegador favorito

### Primer Uso

1. **Crear una Cuenta:**
   - Haz clic en "Registrarse"
   - Completa nombre, usuario y contraseña
   - Selecciona tu rol
   - Confirma el registro

2. **Iniciar Sesión:**
   - Ingresa tu usuario y contraseña
   - Accede al panel principal

3. **Registrar Pacientes:**
   - Ve a la pestaña "Pacientes"
   - Completa el formulario con datos personales y médicos
   - Haz clic en "Registrar Paciente"

4. **Crear Consultas:**
   - Ve a la pestaña "Consultas"
   - Selecciona un paciente
   - Elige tipo y fecha
   - Agrega motivo y observaciones
   - Registra la consulta

5. **Ver Dashboard:**
   - La pestaña "Dashboard" muestra estadísticas en tiempo real
   - Visualiza gráficos de actividad

6. **Generar Reportes:**
   - Ve a "Reportes"
   - Selecciona tipo y rango de fechas
   - Elige formato (PDF/CSV/Excel)
   - Descarga el reporte

## 📁 Estructura de Archivos

```
telemedicinarural/
├── index.html          # Interfaz principal
├── css/
│   └── style.css       # Estilos completos
├── js/
│   └── app.js          # Lógica de la aplicación
└── README.md          # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos (Flexbox, Grid, Gradientes, Animaciones)
- **JavaScript Vanilla** - Funcionalidad sin frameworks
- **Bootstrap 5** - Framework CSS responsivo
- **Bootstrap Icons** - Iconografía profesional
- **Chart.js** - Gráficos interactivos
- **LocalStorage API** - Persistencia de datos

## 📱 Compatibilidad

✅ Chrome/Chromium (versión 80+)
✅ Firefox (versión 75+)
✅ Safari (versión 12+)
✅ Edge (versión 80+)
✅ Responsivo en móviles y tablets

## 🔒 Seguridad

- Las contraseñas se almacenan localmente (recomendado usar HTTPS en producción)
- Datos cifrados en Local Storage del navegador
- Sesiones persistentes
- Validación de entrada en todos los formularios

## 📊 Estructura de Datos

### Usuario
```javascript
{
  id: timestamp,
  name: string,
  user: string,
  pass: string,
  role: 'enfermero' | 'medico' | 'admin'
}
```

### Paciente
```javascript
{
  id: timestamp,
  nombre: string,
  dni: string,
  edad: number,
  sexo: 'M' | 'F' | 'O',
  telefono: string,
  email: string,
  sangre: string,
  alergias: string,
  enfermedades: string,
  medicamentos: string,
  direccion: string,
  ciudad: string,
  departamento: string,
  contactoEmergencia: string,
  telEmergencia: string,
  fechaRegistro: ISO_STRING
}
```

### Consulta
```javascript
{
  id: timestamp,
  pacienteid: number,
  pacienteNombre: string,
  tipo: 'seguimiento' | 'educacion' | 'emergencia' | 'diagnostico' | 'prevencion',
  fecha: datetime,
  enfermero: string,
  motivo: string,
  observaciones: string,
  estado: 'pendiente' | 'completada',
  fechaRegistro: ISO_STRING
}
```

## 🎯 Mejoras Futuras

- ☁️ Sincronización con servidor remoto
- 📞 Integración con WhatsApp/SMS para notificaciones
- 📸 Carga de documentos y fotos
- 🗺️ Geolocalización de pacientes
- 📱 Aplicación móvil nativa
- 🔔 Sistema de recordatorios
- 💳 Integración de pagos
- 🌐 Videollamadas integradas
- 📧 Envío de reportes por email
- 🔐 Autenticación de dos factores (2FA)

## 📄 Licencia

Este proyecto está bajo licencia MIT. Eres libre de usar, modificar y distribuir este código.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

- GitHub: [@dijamaps](https://github.com/dijamaps)
- Email: jxito9798@gmail.com

## 💖 Hecho con ❤️ para la salud comunitaria

Este proyecto está dedicado a mejorar el acceso a servicios de telemedicina en zonas rurales y comunitarias.

---

**¿Te gustaría agregar más funcionalidades?** Abre un issue o contacta al equipo de desarrollo.
