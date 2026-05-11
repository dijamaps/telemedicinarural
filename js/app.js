// Sistema de Teleenfermería Comunitaria

class TeleenfermeriApp {
    constructor() {
        this.usuarios = this.cargarDatos('usuarios') || [];
        this.pacientes = this.cargarDatos('pacientes') || [];
        this.consultas = this.cargarDatos('consultas') || [];
        this.usuarioActual = null;
        this.chartInstances = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.verificarSesion();
    }

    // ===== ALMACENAMIENTO LOCAL =====
    cargarDatos(clave) {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : null;
    }

    guardarDatos(clave, datos) {
        localStorage.setItem(clave, JSON.stringify(datos));
    }

    // ===== AUTENTICACIÓN =====
    setupEventListeners() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Registro
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrar();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Pacientes
        document.getElementById('formNuevoPaciente').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarPaciente();
        });

        // Consultas
        document.getElementById('formNuevaConsulta').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarConsulta();
        });

        // Búsqueda de pacientes
        document.getElementById('btnBuscarPaciente').addEventListener('click', () => {
            this.buscarPacientes();
        });

        // Filtros de consultas
        document.getElementById('filtroConsultaPaciente').addEventListener('input', () => {
            this.filtrarConsultas();
        });
        document.getElementById('filtroConsultaTipo').addEventListener('change', () => {
            this.filtrarConsultas();
        });
        document.getElementById('filtroConsultaEstado').addEventListener('change', () => {
            this.filtrarConsultas();
        });

        // Reporte
        document.getElementById('btnGenerarReporte').addEventListener('click', () => {
            this.generarReporte();
        });
    }

    verificarSesion() {
        const usuarioGuardado = localStorage.getItem('usuarioActual');
        if (usuarioGuardado) {
            this.usuarioActual = JSON.parse(usuarioGuardado);
            this.mostrarPanel();
        }
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const usuario = this.usuarios.find(u => u.email === email && u.password === password);

        if (usuario) {
            this.usuarioActual = usuario;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            document.getElementById('loginError').style.display = 'none';
            this.mostrarPanel();
        } else {
            document.getElementById('loginError').textContent = '❌ Correo o contraseña incorrectos.';
            document.getElementById('loginError').style.display = 'block';
        }
    }

    registrar() {
        const nombre = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const rol = document.getElementById('registerRole').value;

        if (password.length < 6) {
            document.getElementById('registerError').textContent = '❌ La contraseña debe tener al menos 6 caracteres.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }

        if (this.usuarios.some(u => u.email === email)) {
            document.getElementById('registerError').textContent = '❌ Este correo ya está registrado.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }

        const nuevoUsuario = {
            id: Date.now(),
            nombre,
            email,
            password,
            rol,
            fechaRegistro: new Date().toISOString()
        };

        this.usuarios.push(nuevoUsuario);
        this.guardarDatos('usuarios', this.usuarios);
        document.getElementById('registerError').style.display = 'none';
        document.getElementById('registerForm').reset();
        alert('✅ Registro exitoso. Inicia sesión con tus credenciales.');
        
        // Cambiar a tab de login
        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();
    }

    logout() {
        this.usuarioActual = null;
        localStorage.removeItem('usuarioActual');
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }

    mostrarPanel() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        document.getElementById('userInfo').textContent = `👤 ${this.usuarioActual.nombre} (${this.usuarioActual.rol})`;
        this.cargarDashboard();
        this.cargarPacientes();
        this.cargarConsultas();
    }

    // ===== GESTIÓN DE PACIENTES =====
    agregarPaciente() {
        const paciente = {
            id: Date.now(),
            nombre: document.getElementById('nombrePaciente').value,
            dni: document.getElementById('dniPaciente').value,
            edad: parseInt(document.getElementById('edadPaciente').value),
            genero: document.getElementById('generoPaciente').value,
            telefono: document.getElementById('telefonoPaciente').value,
            email: document.getElementById('emailPaciente').value,
            direccion: document.getElementById('direccionPaciente').value,
            antecedentes: document.getElementById('antecedentesPaciente').value,
            alergias: document.getElementById('alergiasPaciente').value,
            fechaRegistro: new Date().toISOString()
        };

        this.pacientes.push(paciente);
        this.guardarDatos('pacientes', this.pacientes);
        document.getElementById('formNuevoPaciente').reset();
        alert('✅ Paciente registrado exitosamente.');
        this.cargarPacientes();
        this.actualizarSelectPacientes();
    }

    cargarPacientes() {
        const tbody = document.querySelector('#tablaPacientes tbody');
        tbody.innerHTML = '';

        this.pacientes.forEach(paciente => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${paciente.nombre}</td>
                <td>${paciente.dni}</td>
                <td>${paciente.edad}</td>
                <td>${paciente.telefono}</td>
                <td>${paciente.email}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="app.editarPaciente(${paciente.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarPaciente(${paciente.id})"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    buscarPacientes() {
        const termino = document.getElementById('buscarPaciente').value.toLowerCase();
        const tbody = document.querySelector('#tablaPacientes tbody');
        tbody.innerHTML = '';

        const filtrados = this.pacientes.filter(p =>
            p.nombre.toLowerCase().includes(termino) ||
            p.dni.includes(termino) ||
            p.telefono.includes(termino)
        );

        filtrados.forEach(paciente => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${paciente.nombre}</td>
                <td>${paciente.dni}</td>
                <td>${paciente.edad}</td>
                <td>${paciente.telefono}</td>
                <td>${paciente.email}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="app.editarPaciente(${paciente.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarPaciente(${paciente.id})"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    editarPaciente(id) {
        const paciente = this.pacientes.find(p => p.id === id);
        if (paciente) {
            document.getElementById('editarPacienteId').value = id;
            document.getElementById('editarNombrePaciente').value = paciente.nombre;
            document.getElementById('editarTelefonoPaciente').value = paciente.telefono;
            document.getElementById('editarEmailPaciente').value = paciente.email;
            document.getElementById('editarDireccionPaciente').value = paciente.direccion;
            
            document.getElementById('formEditarPaciente').addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarCambiosPaciente(id);
            });
            
            new bootstrap.Modal(document.getElementById('modalEditarPaciente')).show();
        }
    }

    guardarCambiosPaciente(id) {
        const paciente = this.pacientes.find(p => p.id === id);
        if (paciente) {
            paciente.nombre = document.getElementById('editarNombrePaciente').value;
            paciente.telefono = document.getElementById('editarTelefonoPaciente').value;
            paciente.email = document.getElementById('editarEmailPaciente').value;
            paciente.direccion = document.getElementById('editarDireccionPaciente').value;
            
            this.guardarDatos('pacientes', this.pacientes);
            bootstrap.Modal.getInstance(document.getElementById('modalEditarPaciente')).hide();
            alert('✅ Paciente actualizado.');
            this.cargarPacientes();
        }
    }

    eliminarPaciente(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
            this.pacientes = this.pacientes.filter(p => p.id !== id);
            this.guardarDatos('pacientes', this.pacientes);
            alert('✅ Paciente eliminado.');
            this.cargarPacientes();
            this.actualizarSelectPacientes();
        }
    }

    actualizarSelectPacientes() {
        const select = document.getElementById('pacienteConsulta');
        select.innerHTML = '<option value="">-- Seleccionar Paciente --</option>';
        
        this.pacientes.forEach(paciente => {
            const option = document.createElement('option');
            option.value = paciente.id;
            option.textContent = `${paciente.nombre} (${paciente.dni})`;
            select.appendChild(option);
        });
    }

    // ===== GESTIÓN DE CONSULTAS =====
    agregarConsulta() {
        const pacienteId = parseInt(document.getElementById('pacienteConsulta').value);
        const paciente = this.pacientes.find(p => p.id === pacienteId);

        if (!paciente) {
            alert('❌ Selecciona un paciente válido.');
            return;
        }

        const consulta = {
            id: Date.now(),
            pacienteId: pacienteId,
            pacienteNombre: paciente.nombre,
            tipo: document.getElementById('tipoConsulta').value,
            fecha: document.getElementById('fechaConsulta').value,
            profesional: document.getElementById('profesionalConsulta').value,
            motivo: document.getElementById('motivoConsulta').value,
            notas: document.getElementById('notasConsulta').value,
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString()
        };

        this.consultas.push(consulta);
        this.guardarDatos('consultas', this.consultas);
        document.getElementById('formNuevaConsulta').reset();
        alert('✅ Consulta registrada exitosamente.');
        this.cargarConsultas();
        this.cargarDashboard();
    }

    cargarConsultas() {
        const tbody = document.querySelector('#tablaConsultas tbody');
        tbody.innerHTML = '';

        this.consultas.forEach(consulta => {
            const fecha = new Date(consulta.fecha).toLocaleDateString('es-ES');
            const estadoBadge = `<span class="badge badge-${this.getEstadoBadgeColor(consulta.estado)}">${consulta.estado}</span>`;
            
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${consulta.pacienteNombre}</td>
                <td>${consulta.tipo}</td>
                <td>${fecha}</td>
                <td>${consulta.profesional}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="app.editarConsulta(${consulta.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarConsulta(${consulta.id})"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    filtrarConsultas() {
        const paciente = document.getElementById('filtroConsultaPaciente').value.toLowerCase();
        const tipo = document.getElementById('filtroConsultaTipo').value;
        const estado = document.getElementById('filtroConsultaEstado').value;

        const tbody = document.querySelector('#tablaConsultas tbody');
        tbody.innerHTML = '';

        const filtradas = this.consultas.filter(c =>
            (!paciente || c.pacienteNombre.toLowerCase().includes(paciente)) &&
            (!tipo || c.tipo === tipo) &&
            (!estado || c.estado === estado)
        );

        filtradas.forEach(consulta => {
            const fecha = new Date(consulta.fecha).toLocaleDateString('es-ES');
            const estadoBadge = `<span class="badge badge-${this.getEstadoBadgeColor(consulta.estado)}">${consulta.estado}</span>`;
            
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${consulta.pacienteNombre}</td>
                <td>${consulta.tipo}</td>
                <td>${fecha}</td>
                <td>${consulta.profesional}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="app.editarConsulta(${consulta.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarConsulta(${consulta.id})"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    editarConsulta(id) {
        const consulta = this.consultas.find(c => c.id === id);
        if (consulta) {
            document.getElementById('editarConsultaId').value = id;
            document.getElementById('editarEstadoConsulta').value = consulta.estado;
            document.getElementById('editarNotasConsulta').value = consulta.notas;
            
            document.getElementById('formEditarConsulta').onsubmit = (e) => {
                e.preventDefault();
                this.guardarCambiosConsulta(id);
            };
            
            new bootstrap.Modal(document.getElementById('modalEditarConsulta')).show();
        }
    }

    guardarCambiosConsulta(id) {
        const consulta = this.consultas.find(c => c.id === id);
        if (consulta) {
            consulta.estado = document.getElementById('editarEstadoConsulta').value;
            consulta.notas = document.getElementById('editarNotasConsulta').value;
            
            this.guardarDatos('consultas', this.consultas);
            bootstrap.Modal.getInstance(document.getElementById('modalEditarConsulta')).hide();
            alert('✅ Consulta actualizada.');
            this.cargarConsultas();
            this.cargarDashboard();
        }
    }

    eliminarConsulta(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta consulta?')) {
            this.consultas = this.consultas.filter(c => c.id !== id);
            this.guardarDatos('consultas', this.consultas);
            alert('✅ Consulta eliminada.');
            this.cargarConsultas();
            this.cargarDashboard();
        }
    }

    getEstadoBadgeColor(estado) {
        const colores = {
            'pendiente': 'warning',
            'completada': 'success',
            'cancelada': 'danger'
        };
        return colores[estado] || 'info';
    }

    // ===== DASHBOARD =====
    cargarDashboard() {
        const hoy = new Date().toISOString().split('T')[0];
        
        // Estadísticas
        document.getElementById('totalPacientes').textContent = this.pacientes.length;
        
        const consultasHoy = this.consultas.filter(c => 
            c.fecha.split('T')[0] === hoy
        ).length;
        document.getElementById('consultasHoy').textContent = consultasHoy;
        
        const pendientes = this.consultas.filter(c => c.estado === 'pendiente').length;
        document.getElementById('consultasPendientes').textContent = pendientes;
        
        const completadas = this.consultas.filter(c => c.estado === 'completada').length;
        document.getElementById('consultasCompletadas').textContent = completadas;

        // Gráficos
        this.crearGraficoTipoConsulta();
        this.crearGraficoEstadoConsulta();
        this.crearGraficoUltimos7Dias();
    }

    crearGraficoTipoConsulta() {
        const tipos = {};
        this.consultas.forEach(c => {
            tipos[c.tipo] = (tipos[c.tipo] || 0) + 1;
        });

        const ctx = document.getElementById('chartTipoConsulta');
        
        if (this.chartInstances.tipoConsulta) {
            this.chartInstances.tipoConsulta.destroy();
        }

        this.chartInstances.tipoConsulta = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(tipos),
                datasets: [{
                    data: Object.values(tipos),
                    backgroundColor: [
                        '#0078d7',
                        '#00a86b',
                        '#dc3545',
                        '#ffc107',
                        '#17a2b8'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    crearGraficoEstadoConsulta() {
        const estados = {
            pendiente: 0,
            completada: 0,
            cancelada: 0
        };

        this.consultas.forEach(c => {
            if (estados.hasOwnProperty(c.estado)) {
                estados[c.estado]++;
            }
        });

        const ctx = document.getElementById('chartEstadoConsulta');
        
        if (this.chartInstances.estadoConsulta) {
            this.chartInstances.estadoConsulta.destroy();
        }

        this.chartInstances.estadoConsulta = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Pendiente', 'Completada', 'Cancelada'],
                datasets: [{
                    data: [estados.pendiente, estados.completada, estados.cancelada],
                    backgroundColor: ['#ffc107', '#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        po
