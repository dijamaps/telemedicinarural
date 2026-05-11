// VARIABLES GLOBALES
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let consultas = JSON.parse(localStorage.getItem('consultas')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let editingPacId = null;

const chartInstances = {};

// INICIALIZAR
document.addEventListener('DOMContentLoaded', () => {
  if (usuarioActual) {
    mostrarPanel();
    cargarDatos();
  } else {
    mostrarAuth();
  }

  // Configurar fecha actual
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('reporteFechaInicio').valueAsDate = new Date(new Date().setDate(new Date().getDate() - 7));
  document.getElementById('reporteFechaFin').value = hoy;
});

// ==================== AUTENTICACIÓN ====================

function toggleForms() {
  document.getElementById('loginForm').classList.toggle('d-none');
  document.getElementById('registerForm').classList.toggle('d-none');
}

function register() {
  const name = document.getElementById('regName').value.trim();
  const user = document.getElementById('regUser').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const role = document.getElementById('regRole').value;
  const errorDiv = document.getElementById('registerError');

  // Validaciones
  if (!name || !user || !pass) {
    errorDiv.textContent = '⚠️ Todos los campos son requeridos';
    errorDiv.classList.remove('d-none');
    return;
  }

  if (usuarios.some(u => u.user === user)) {
    errorDiv.textContent = '⚠️ El usuario ya existe';
    errorDiv.classList.remove('d-none');
    return;
  }

  usuarios.push({ name, user, pass, role, id: Date.now() });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  errorDiv.classList.add('d-none');
  alert('✅ Cuenta creada exitosamente. Inicia sesión.');
  toggleForms();
  document.getElementById('registerForm').querySelectorAll('input, select').forEach(e => e.value = '');
}

function login() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const errorDiv = document.getElementById('loginError');

  const usuarioValido = usuarios.find(u => u.user === user && u.pass === pass);

  if (usuarioValido) {
    usuarioActual = usuarioValido;
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    errorDiv.classList.add('d-none');
    mostrarPanel();
    cargarDatos();
  } else {
    errorDiv.textContent = '❌ Usuario o contraseña incorrectos';
    errorDiv.classList.remove('d-none');
  }
}

function logout() {
  usuarioActual = null;
  localStorage.removeItem('usuarioActual');
  mostrarAuth();
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function mostrarAuth() {
  document.getElementById('authContainer').classList.remove('d-none');
  document.getElementById('mainPanel').classList.add('d-none');
}

function mostrarPanel() {
  document.getElementById('authContainer').classList.add('d-none');
  document.getElementById('mainPanel').classList.remove('d-none');
  document.getElementById('userName').textContent = `👤 ${usuarioActual.name} (${usuarioActual.role})`;
  cargarPacientesSelect();
}

// ==================== GESTIÓN DE PACIENTES ====================

function registrarPaciente() {
  const paciente = {
    id: Date.now(),
    nombre: document.getElementById('pacNombre').value.trim(),
    dni: document.getElementById('pacDNI').value.trim(),
    edad: document.getElementById('pacEdad').value,
    sexo: document.getElementById('pacSexo').value,
    telefono: document.getElementById('pacTelefono').value.trim(),
    email: document.getElementById('pacEmail').value.trim(),
    sangre: document.getElementById('pacSangre').value,
    alergias: document.getElementById('pacAlergias').value.trim(),
    enfermedades: document.getElementById('pacEnfermedades').value.trim(),
    medicamentos: document.getElementById('pacMedicamentos').value.trim(),
    direccion: document.getElementById('pacDireccion').value.trim(),
    ciudad: document.getElementById('pacCiudad').value.trim(),
    departamento: document.getElementById('pacDepartamento').value.trim(),
    contactoEmergencia: document.getElementById('pacContactoEmergencia').value.trim(),
    telEmergencia: document.getElementById('pacTelEmergencia').value.trim(),
    fechaRegistro: new Date().toISOString()
  };

  if (!paciente.nombre || !paciente.dni) {
    alert('⚠️ Nombre y DNI son obligatorios');
    return;
  }

  if (pacientes.some(p => p.dni === paciente.dni)) {
    alert('⚠️ Ya existe un paciente con este DNI');
    return;
  }

  pacientes.push(paciente);
  localStorage.setItem('pacientes', JSON.stringify(pacientes));

  // Limpiar formulario
  document.querySelectorAll('#pacientes input, #pacientes textarea, #pacientes select').forEach(e => {
    if (e.type !== 'button') e.value = '';
  });

  alert('✅ Paciente registrado exitosamente');
  mostrarPacientes();
  cargarPacientesSelect();
  actualizarEstadisticas();
}

function mostrarPacientes() {
  const buscar = document.getElementById('buscarPaciente').value.toLowerCase();
  const filtrados = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(buscar) ||
    p.dni.includes(buscar) ||
    p.email.toLowerCase().includes(buscar)
  );

  const tbody = document.getElementById('tablaPacientes');
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay pacientes registrados</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map(p => `
    <tr>
      <td><strong>${p.nombre}</strong></td>
      <td>${p.dni}</td>
      <td>${p.edad} años</td>
      <td>${p.telefono}</td>
      <td>${p.email}</td>
      <td><span class="badge bg-info">${p.sangre || '-'}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editarPaciente(${p.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="eliminarPaciente(${p.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function editarPaciente(id) {
  const paciente = pacientes.find(p => p.id === id);
  if (!paciente) return;

  editingPacId = id;
  document.getElementById('editPacId').value = id;
  document.getElementById('editPacNombre').value = paciente.nombre;
  document.getElementById('editPacDNI').value = paciente.dni;
  document.getElementById('editPacTelefono').value = paciente.telefono;
  document.getElementById('editPacEmail').value = paciente.email;
  document.getElementById('editPacEnfermedades').value = paciente.enfermedades;

  new bootstrap.Modal(document.getElementById('editPacienteModal')).show();
}

function guardarPacienteEditado() {
  const id = parseInt(document.getElementById('editPacId').value);
  const paciente = pacientes.find(p => p.id === id);

  if (paciente) {
    paciente.nombre = document.getElementById('editPacNombre').value.trim();
    paciente.dni = document.getElementById('editPacDNI').value.trim();
    paciente.telefono = document.getElementById('editPacTelefono').value.trim();
    paciente.email = document.getElementById('editPacEmail').value.trim();
    paciente.enfermedades = document.getElementById('editPacEnfermedades').value.trim();

    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    bootstrap.Modal.getInstance(document.getElementById('editPacienteModal')).hide();
    alert('✅ Paciente actualizado');
    mostrarPacientes();
  }
}

function eliminarPaciente(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
    pacientes = pacientes.filter(p => p.id !== id);
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    mostrarPacientes();
    cargarPacientesSelect();
    actualizarEstadisticas();
  }
}

function cargarPacientesSelect() {
  const select = document.getElementById('conPaciente');
  select.innerHTML = '<option value="">Seleccionar paciente...</option>';
  pacientes.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.nombre} (${p.dni})</option>`;
  });
}

// ==================== GESTIÓN DE CONSULTAS ====================

function registrarConsulta() {
  const pacId = parseInt(document.getElementById('conPaciente').value);
  const paciente = pacientes.find(p => p.id === pacId);

  if (!paciente) {
    alert('⚠️ Selecciona un paciente válido');
    return;
  }

  const consulta = {
    id: Date.now(),
    pacienteid: pacId,
    pacienteNombre: paciente.nombre,
    tipo: document.getElementById('conTipo').value,
    fecha: document.getElementById('conFecha').value,
    enfermero: document.getElementById('conEnfermero').value.trim() || usuarioActual.name,
    motivo: document.getElementById('conMotivo').value.trim(),
    observaciones: document.getElementById('conObservaciones').value.trim(),
    estado: 'pendiente',
    fechaRegistro: new Date().toISOString()
  };

  if (!consulta.tipo || !consulta.fecha || !consulta.motivo) {
    alert('⚠️ Completa todos los campos requeridos');
    return;
  }

  consultas.push(consulta);
  localStorage.setItem('consultas', JSON.stringify(consultas));

  document.querySelectorAll('#consultasTab input, #consultasTab textarea, #consultasTab select').forEach(e => {
    if (e.id !== 'buscarConsulta') e.value = '';
  });

  alert('✅ Consulta registrada exitosamente');
  mostrarConsultas();
  actualizarEstadisticas();
  actualizarGraficos();
}

function mostrarConsultas() {
  const buscar = document.getElementById('buscarConsulta').value.toLowerCase();
  const filtrados = consultas.filter(c =>
    c.pacienteNombre.toLowerCase().includes(buscar) ||
    c.tipo.includes(buscar)
  );

  const tbody = document.getElementById('tablaConsultas');
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay consultas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map(c => {
    const fecha = new Date(c.fecha).toLocaleDateString('es-ES');
    let badgeClass = c.estado === 'pendiente' ? 'bg-warning' : 'bg-success';
    return `
      <tr>
        <td><strong>${c.pacienteNombre}</strong></td>
        <td><span class="badge bg-info">${c.tipo}</span></td>
        <td>${fecha}</td>
        <td>${c.enfermero}</td>
        <td><span class="badge ${badgeClass}">${c.estado}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="completarConsulta(${c.id})">
            <i class="bi bi-check"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarConsulta(${c.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function completarConsulta(id) {
  const consulta = consultas.find(c => c.id === id);
  if (consulta) {
    consulta.estado = 'completada';
    localStorage.setItem('consultas', JSON.stringify(consultas));
    mostrarConsultas();
    actualizarEstadisticas();
    actualizarGraficos();
  }
}

function eliminarConsulta(id) {
  if (confirm('¿Estás seguro?')) {
    consultas = consultas.filter(c => c.id !== id);
    localStorage.setItem('consultas', JSON.stringify(consultas));
    mostrarConsultas();
    actualizarEstadisticas();
    actualizarGraficos();
  }
}

// ==================== ESTADÍSTICAS Y GRÁFICOS ====================

function actualizarEstadisticas() {
  const hoy = new Date().toISOString().split('T')[0];
  const consultasHoy = consultas.filter(c => c.fecha.startsWith(hoy)).length;
  const pendientes = consultas.filter(c => c.estado === 'pendiente').length;
  const completadas = consultas.filter(c => c.estado === 'completada').length;

  document.getElementById('totalPacientes').textContent = pacientes.length;
  document.getElementById('consultasHoy').textContent = consultasHoy;
  document.getElementById('pendientes').textContent = pendientes;
  document.getElementById('completadas').textContent = completadas;
}

function actualizarGraficos() {
  // Gráfico de Tipos
  const tipos = {};
  consultas.forEach(c => {
    tipos[c.tipo] = (tipos[c.tipo] || 0) + 1;
  });

  const ctxTipos = document.getElementById('chartTipos')?.getContext('2d');
  if (ctxTipos) {
    if (chartInstances.tipos) chartInstances.tipos.destroy();
    chartInstances.tipos = new Chart(ctxTipos, {
      type: 'doughnut',
      data: {
        labels: Object.keys(tipos),
        datasets: [{
          data: Object.values(tipos),
          backgroundColor: [
            '#0078d7', '#00a86b', '#ffc107', '#dc3545', '#17a2b8'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Gráfico de Estados
  const estados = {
    pendiente: consultas.filter(c => c.estado === 'pendiente').length,
    completada: consultas.filter(c => c.estado === 'completada').length
  };

  const ctxEstados = document.getElementById('chartEstados')?.getContext('2d');
  if (ctxEstados) {
    if (chartInstances.estados) chartInstances.estados.destroy();
    chartInstances.estados = new Chart(ctxEstados, {
      type: 'pie',
      data: {
        labels: ['Pendientes', 'Completadas'],
        datasets: [{
          data: [estados.pendiente, estados.completada],
          backgroundColor: ['#ffc107', '#00a86b'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Gráfico de Tendencia
  const tendencia = {};
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    const key = fecha.toISOString().split('T')[0];
    tendencia[key] = consultas.filter(c => c.fecha.startsWith(key)).length;
  }

  const ctxTendencia = document.getElementById('chartTendencia')?.getContext('2d');
  if (ctxTendencia) {
    if (chartInstances.tendencia) chartInstances.tendencia.destroy();
    chartInstances.tendencia = new Chart(ctxTendencia, {
      type: 'line',
      data: {
        labels: Object.keys(tendencia),
        datasets: [{
          label: 'Consultas',
          data: Object.values(tendencia),
          borderColor: '#0078d7',
          backgroundColor: 'rgba(0, 120, 215, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// ==================== REPORTES ====================

function generarReporte() {
  const tipo = document.getElementById('reporteTipo').value;
  const formato = document.getElementById('reporteFormato').value;
  const fechaInicio = document.getElementById('reporteFechaInicio').value;
  const fechaFin = document.getElementById('reporteFechaFin').value;

  let contenido = '';

  if (tipo === 'pacientes') {
    contenido = generarReportePacientes();
  } else if (tipo === 'consultas') {
    const consultasFiltradas = consultas.filter(c =>
      c.fecha >= fechaInicio && c.fecha <= (fechaFin + 'T23:59:59')
    );
    contenido = generarReporteConsultas(consultasFiltradas);
  } else if (tipo === 'estadisticas') {
    contenido = generarReporteEstadisticas();
  }

  if (formato === 'pdf') {
    exportarPDF(contenido, tipo);
  } else if (formato === 'csv') {
    exportarCSV(contenido, tipo);
  } else if (formato === 'excel') {
    exportarExcel(contenido, tipo);
  }
}

function generarReportePacientes() {
  let html = '<h3>Reporte de Pacientes</h3>';
  html += '<table style="width:100%; border-collapse:collapse;">';
  html += '<tr style="background:#0078d7;color:white;"><th style="padding:10px;border:1px solid #ccc;">Nombre</th><th style="padding:10px;border:1px solid #ccc;">DNI</th><th style="padding:10px;border:1px solid #ccc;">Edad</th><th style="padding:10px;border:1px solid #ccc;">Email</th><th style="padding:10px;border:1px solid #ccc;">Teléfono</th></tr>';
  pacientes.forEach(p => {
    html += `<tr><td style="padding:10px;border:1px solid #ccc;">${p.nombre}</td><td style="padding:10px;border:1px solid #ccc;">${p.dni}</td><td style="padding:10px;border:1px solid #ccc;">${p.edad}</td><td style="padding:10px;border:1px solid #ccc;">${p.email}</td><td style="padding:10px;border:1px solid #ccc;">${p.telefono}</td></tr>`;
  });
  html += '</table>';
  return html;
}

function generarReporteConsultas(consultasFiltradas) {
  let html = '<h3>Reporte de Consultas</h3>';
  html += '<table style="width:100%; border-collapse:collapse;">';
  html += '<tr style="background:#0078d7;color:white;"><th style="padding:10px;border:1px solid #ccc;">Paciente</th><th style="padding:10px;border:1px solid #ccc;">Tipo</th><th style="padding:10px;border:1px solid #ccc;">Fecha</th><th style="padding:10px;border:1px solid #ccc;">Estado</th></tr>';
  consultasFiltradas.forEach(c => {
    html += `<tr><td style="padding:10px;border:1px solid #ccc;">${c.pacienteNombre}</td><td style="padding:10px;border:1px solid #ccc;">${c.tipo}</td><td style="padding:10px;border:1px solid #ccc;">${c.fecha}</td><td style="padding:10px;border:1px solid #ccc;">${c.estado}</td></tr>`;
  });
  html += '</table>';
  return html;
}

function generarReporteEstadisticas() {
  let html = '<h3>Estadísticas Generales</h3>';
  html += `<p><strong>Total de Pacientes:</strong> ${pacientes.length}</p>`;
  html += `<p><strong>Total de Consultas:</strong> ${consultas.length}</p>`;
  html += `<p><strong>Consultas Completadas:</strong> ${consultas.filter(c => c.estado === 'completada').length}</p>`;
  html += `<p><strong>Consultas Pendientes:</strong> ${consultas.filter(c => c.estado === 'pendiente').length}</p>`;
  return html;
}

function exportarPDF(contenido, tipo) {
  const ventana = window.open('', '', 'width=1000,height=600');
  ventana.document.write(`
    <html>
    <head>
      <title>Reporte - ${tipo}</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h3 { color: #0078d7; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ccc; text-align: left; }
        th { background: #0078d7; color: white; }
      </style>
    </head>
    <body>${contenido}<br><br><button onclick="window.print()">Imprimir/Guardar como PDF</button></body>
    </html>
  `);
  ventana.document.close();
}

function exportarCSV(contenido, tipo) {
  alert('✅ Función de exportación CSV disponible en versiones futuras');
}

function exportarExcel(contenido, tipo) {
  alert('✅ Función de exportación Excel disponible en versiones futuras');
}

function cargarDatos() {
  mostrarPacientes();
  mostrarConsultas();
  actualizarEstadisticas();
  actualizarGraficos();
  cargarPacientesSelect();

  // Event listeners de búsqueda
  document.getElementById('buscarPaciente').addEventListener('input', mostrarPacientes);
  document.getElementById('buscarConsulta').addEventListener('input', mostrarConsultas);
}
