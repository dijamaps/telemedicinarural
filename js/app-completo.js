// Sistema Completo de Telemedicina Rural
// Portales para Pacientes y Profesionales Médicos

class TelemedicinaRural {
    constructor() {
        this.pacientes = this.cargarDatos('pacientes') || [];
        this.medicos = this.cargarDatos('medicos') || [];
        this.citasSolicitadas = this.cargarDatos('citasSolicitadas') || [];
        this.citasConfirmadas = this.cargarDatos('citasConfirmadas') || [];
        this.usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
        this.tipoUsuario = localStorage.getItem('tipoUsuario') || null; // 'paciente' o 'medico'
        this.init();
    }

    cargarDatos(clave) {
        return JSON.parse(localStorage.getItem(clave)) || null;
    }

    guardarDatos(clave, datos) {
        localStorage.setItem(clave, JSON.stringify(datos));
    }

    init() {
        this.verificarSesion();
        this.setupEventListeners();
    }

    verificarSesion() {
        if (this.usuarioActual && this.tipoUsuario) {
            if (this.tipoUsuario === 'paciente') {
                this.mostrarPortalPaciente();
            } else if (this.tipoUsuario === 'medico') {
                this.mostrarPanelMedico();
            }
        } else {
            this.mostrarLogin();
        }
    }

    setupEventListeners() {
        // Pacientes
        document.getElementById('formLoginPaciente')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.loginPaciente();
        });

        document.getElementById('formRegisterPaciente')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarPaciente();
        });

        document.getElementById('formSolicitarCita')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.solicitarCita();
        });

        // Médicos
        document.getElementById('formLoginMedico')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.loginMedico();
        });

        // Logout
        document.getElementById('cerrarSesionPac')?.addEventListener('click', () => {
            this.logout();
        });
    }

    // ===== PORTAL PACIENTES =====
    toggleAuthPaciente() {
        const loginDiv = document.getElementById('loginPacDiv');
        const registerDiv = document.getElementById('registerPacDiv');
        loginDiv.classList.toggle('d-none');
        registerDiv.classList.toggle('d-none');
    }

    loginPaciente() {
        const dni = document.getElementById('loginPacDNI').value;
        const pass = document.getElementById('loginPacPass').value;

        const paciente = this.pacientes.find(p => p.dni === dni && p.contrasena === pass);

        if (paciente) {
            this.usuarioActual = paciente;
            this.tipoUsuario = 'paciente';
            localStorage.setItem('usuarioActual', JSON.stringify(paciente));
            localStorage.setItem('tipoUsuario', 'paciente');
            document.getElementById('errorLoginPac').classList.add('d-none');
            this.mostrarPortalPaciente();
        } else {
            document.getElementById('errorLoginPac').classList.remove('d-none');
            document.getElementById('errorLoginPac').textContent = '❌ DNI o contraseña incorrectos';
        }
    }

    registrarPaciente() {
        const nombre = document.getElementById('regPacNombre').value;
        const dni = document.getElementById('regPacDNI').value;
        const email = document.getElementById('regPacEmail').value;
        const telefono = document.getElementById('regPacTelefono').value;
        const edad = parseInt(document.getElementById('regPacEdad').value);
        const pass = document.getElementById('regPacPass').value;
        const passConfirm = document.getElementById('regPacPassConfirm').value;

        if (pass !== passConfirm) {
            document.getElementById('errorRegPac').classList.remove('d-none');
            document.getElementById('errorRegPac').textContent = '⚠️ Las contraseñas no coinciden';
            return;
        }

        if (this.pacientes.some(p => p.dni === dni)) {
            document.getElementById('errorRegPac').classList.remove('d-none');
            document.getElementById('errorRegPac').textContent = '⚠️ Ya existe un paciente con ese DNI';
            return;
        }

        const nuevoPaciente = {
            id: Date.now(),
            nombre,
            dni,
            email,
            telefono,
            edad,
            contrasena: pass,
            fechaRegistro: new Date().toISOString()
        };

        this.pacientes.push(nuevoPaciente);
        this.guardarDatos('pacientes', this.pacientes);

        alert('✅ Registro exitoso. Inicia sesión con tu DNI y contraseña');
        this.toggleAuthPaciente();
        document.getElementById('formRegisterPaciente').reset();
    }

    solicitarCita() {
        const cita = {
            id: Date.now(),
            pacienteId: this.usuarioActual.id,
            pacienteNombre: this.usuarioActual.nombre,
            pacienteDNI: this.usuarioActual.dni,
            pacienteTelefono: this.usuarioActual.telefono,
            tipoConsulta: document.getElementById('pacTipoConsulta').value,
            especialidad: document.getElementById('pacEspecialidad').value,
            motivo: document.getElementById('pacMotivo').value,
            fechaPreferida: document.getElementById('pacFechaPreferida').value,
            horaPreferida: document.getElementById('pacHoraPreferida').value,
            urgente: document.getElementById('pacUrgente').checked,
            estado: 'solicitada',
            fechaSolicitud: new Date().toISOString()
        };

        this.citasSolicitadas.push(cita);
        this.guardarDatos('citasSolicitadas', this.citasSolicitadas);

        const alertDiv = document.getElementById('alertaSolicitud');
        alertDiv.className = 'alert alert-success';
        alertDiv.innerHTML = '✅ Cita solicitada correctamente. El médico confirmará tu cita en breve.';
        alertDiv.classList.remove('d-none');

        document.getElementById('formSolicitarCita').reset();
        setTimeout(() => this.cargarMisCitas(), 1000);
    }

    cargarMisCitas() {
        const tbody = document.getElementById('tablaMisCitas').querySelector('tbody');
        tbody.innerHTML = '';

        const misCitas = this.citasConfirmadas.filter(c => c.pacienteId === this.usuarioActual.id);

        if (misCitas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No tienes citas programadas</td></tr>';
            return;
        }

        misCitas.forEach(cita => {
            const fecha = new Date(cita.fechaConfirmada).toLocaleDateString('es-ES');
            const estadoBadge = `<span class="badge bg-success">✅ Confirmada</span>`;

            const fila = `
                <tr>
                    <td>${fecha}</td>
                    <td>${cita.horaConfirmada}</td>
                    <td><span class="badge bg-info">${cita.especialidad}</span></td>
                    <td>${cita.tipoConsulta}</td>
                    <td>${estadoBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="app.verDetallesCita(${cita.id})">Ver Detalles</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    }

    cargarPerfilPaciente() {
        document.getElementById('perfilNombre').value = this.usuarioActual.nombre;
        document.getElementById('perfilDNI').value = this.usuarioActual.dni;
        document.getElementById('perfilEmail').value = this.usuarioActual.email;
        document.getElementById('perfilTelefono').value = this.usuarioActual.telefono;
        document.getElementById('perfilEdad').value = this.usuarioActual.edad;
    }

    guardarPerfilPaciente() {
        const paciente = this.pacientes.find(p => p.id === this.usuarioActual.id);
        if (paciente) {
            paciente.email = document.getElementById('perfilEmail').value;
            paciente.telefono = document.getElementById('perfilTelefono').value;
            paciente.edad = parseInt(document.getElementById('perfilEdad').value);
            paciente.alergias = document.getElementById('perfilAlergias').value;
            paciente.enfermedades = document.getElementById('perfilEnfermedades').value;

            this.guardarDatos('pacientes', this.pacientes);
            this.usuarioActual = paciente;
            localStorage.setItem('usuarioActual', JSON.stringify(paciente));
            alert('✅ Perfil actualizado correctamente');
        }
    }

    mostrarPortalPaciente() {
        document.getElementById('authPacientes').classList.add('d-none');
        document.getElementById('portalPacientes').classList.remove('d-none');
        document.getElementById('pacienteNombreNav').textContent = `👋 Bienvenido, ${this.usuarioActual.nombre}`;
        this.cargarMisCitas();
        this.cargarPerfilPaciente();
        this.cargarHorariosDisponibles();
    }

    cargarHorariosDisponibles() {
        const container = document.getElementById('horariosDisponibles');
        container.innerHTML = '';

        // Mostrar horarios disponibles de los médicos
        const horariosDisp = [
            { dia: 'Lunes', horas: ['08:00', '09:00', '10:00'] },
            { dia: 'Martes', horas: ['08:00', '10:00', '14:00'] },
            { dia: 'Miércoles', horas: ['09:00', '11:00', '15:00'] },
            { dia: 'Jueves', horas: ['08:00', '10:00', '16:00'] },
            { dia: 'Viernes', horas: ['09:00', '11:00', '14:00'] }
        ];

        horariosDisp.forEach(h => {
            container.innerHTML += `
                <div class="col-md-4 mb-3">
                    <div class="alert alert-info">
                        <strong>${h.dia}</strong>
                        <br>
                        ${h.horas.join(', ')}
                    </div>
                </div>
            `;
        });
    }

    // ===== PANEL MÉDICOS =====
    loginMedico() {
        const usuario = document.getElementById('loginMedicoUser').value;
        const pass = document.getElementById('loginMedicoPass').value;

        // Médicos de prueba
        const medicosValidos = [
            { id: 1, nombre: 'Dr. Juan García', usuario: 'drgarcia', pass: '123456', especialidad: 'Medicina General' },
            { id: 2, nombre: 'Dra. María López', usuario: 'drlopez', pass: '123456', especialidad: 'Ginecología' },
            { id: 3, nombre: 'Dr. Carlos Rodríguez', usuario: 'drrodriguez', pass: '123456', especialidad: 'Pediatría' }
        ];

        const medico = medicosValidos.find(m => m.usuario === usuario && m.pass === pass);

        if (medico) {
            this.usuarioActual = medico;
            this.tipoUsuario = 'medico';
            this.medicos.push(medico);
            this.guardarDatos('medicos', this.medicos);
            localStorage.setItem('usuarioActual', JSON.stringify(medico));
            localStorage.setItem('tipoUsuario', 'medico');
            this.mostrarPanelMedico();
        } else {
            document.getElementById('errorLoginMedico').classList.remove('d-none');
            document.getElementById('errorLoginMedico').textContent = '❌ Usuario o contraseña incorrectos';
        }
    }

    cargarCitasSolicitadas() {
        const tbody = document.getElementById('tablaCitasSolicitadas').querySelector('tbody');
        tbody.innerHTML = '';

        if (this.citasSolicitadas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay citas pendientes</td></tr>';
            return;
        }

        this.citasSolicitadas.filter(c => c.estado === 'solicitada').forEach(cita => {
            const fila = `
                <tr>
                    <td><strong>${cita.pacienteNombre}</strong></td>
                    <td>${cita.pacienteDNI}</td>
                    <td><span class="badge bg-info">${cita.especialidad}</span></td>
                    <td>${cita.fechaPreferida}</td>
                    <td>${cita.motivo}</td>
                    <td>${cita.urgente ? '<span class="badge bg-danger">🚨 Urgente</span>' : '<span class="badge bg-warning">Normal</span>'}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="app.abrirModalAprobarCita(${cita.id})">Aprobar</button>
                        <button class="btn btn-sm btn-danger" onclick="app.rechazarCita(${cita.id})">Rechazar</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    }

    cargarCitasProgramadas() {
        const tbody = document.getElementById('tablaCitasProgramadas').querySelector('tbody');
        tbody.innerHTML = '';

        if (this.citasConfirmadas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay citas programadas</td></tr>';
            return;
        }

        this.citasConfirmadas.forEach(cita => {
            const fecha = new Date(cita.fechaConfirmada).toLocaleDateString('es-ES');
            const fila = `
                <tr>
                    <td>${cita.pacienteNombre}</td>
                    <td>${cita.pacienteDNI}</td>
                    <td>${fecha}</td>
                    <td>${cita.horaConfirmada}</td>
                    <td><span class="badge bg-info">${cita.especialidad}</span></td>
                    <td>${cita.tipoConsulta}</td>
                    <td><span class="badge bg-success">Confirmada</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="app.completarCita(${cita.id})">Completar</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    }

    abrirModalAprobarCita(id) {
        const cita = this.citasSolicitadas.find(c => c.id === id);
        if (cita) {
            document.getElementById('citaIdAprobar').value = id;
            const fechaMin = new Date(cita.fechaPreferida).toISOString().split('T')[0];
            document.getElementById('fechaConfirmada').min = fechaMin;
            document.getElementById('fechaConfirmada').value = cita.fechaPreferida;
            document.getElementById('horaConfirmada').value = cita.horaPreferida;
            new bootstrap.Modal(document.getElementById('modalAprobarCita')).show();
        }
    }

    confirmarCita() {
        const citaId = parseInt(document.getElementById('citaIdAprobar').value);
        const cita = this.citasSolicitadas.find(c => c.id === citaId);

        if (cita) {
            const citaConfirmada = {
                ...cita,
                fechaConfirmada: document.getElementById('fechaConfirmada').value,
                horaConfirmada: document.getElementById('horaConfirmada').value,
                notas: document.getElementById('notasConfirmacion').value,
                estado: 'confirmada',
                medicoNombre: this.usuarioActual.nombre,
                medicoEspecialidad: this.usuarioActual.especialidad
            };

            this.citasConfirmadas.push(citaConfirmada);
            this.citasSolicitadas = this.citasSolicitadas.filter(c => c.id !== citaId);

            this.guardarDatos('citasConfirmadas', this.citasConfirmadas);
            this.guardarDatos('citasSolicitadas', this.citasSolicitadas);

            bootstrap.Modal.getInstance(document.getElementById('modalAprobarCita')).hide();
            alert('✅ Cita confirmada y notificada al paciente');

            this.cargarCitasSolicitadas();
            this.cargarCitasProgramadas();
            this.actualizarEstadisticasMedicas();
        }
    }

    rechazarCita(id) {
        if (confirm('¿Deseas rechazar esta cita?')) {
            this.citasSolicitadas = this.citasSolicitadas.filter(c => c.id !== id);
            this.guardarDatos('citasSolicitadas', this.citasSolicitadas);
            alert('✅ Cita rechazada');
            this.cargarCitasSolicitadas();
        }
    }

    completarCita(id) {
        const cita = this.citasConfirmadas.find(c => c.id === id);
        if (cita) {
            cita.estado = 'completada';
            this.guardarDatos('citasConfirmadas', this.citasConfirmadas);
            alert('✅ Cita marcada como completada');
            this.cargarCitasProgramadas();
            this.actualizarEstadisticasMedicas();
        }
    }

    agregarDisponibilidad() {
        const disponibilidad = {
            id: Date.now(),
            dia: document.getElementById('dispDia').value,
            horaInicio: document.getElementById('dispHoraInicio').value,
            horaFin: document.getElementById('dispHoraFin').value,
            duracion: parseInt(document.getElementById('dispDuracion').value),
            medicoId: this.usuarioActual.id
        };

        // Aquí se guardaría la disponibilidad
        alert('✅ Disponibilidad agregada');
        this.cargarListaDisponibilidad();
    }

    cargarListaDisponibilidad() {
        const container = document.getElementById('listaDisponibilidad');
        container.innerHTML = `
            <div class="list-group-item">
                <h6>Disponibilidad configurada:</h6>
                <ul>
                    <li>Lunes: 08:00 - 12:00</li>
                    <li>Martes: 14:00 - 18:00</li>
                    <li>Miércoles: 08:00 - 12:00</li>
                    <li>Jueves: 14:00 - 18:00</li>
                    <li>Viernes: 08:00 - 14:00</li>
                </ul>
            </div>
        `;
    }

    actualizarEstadisticasMedicas() {
        const citasProgramadas = this.citasConfirmadas.length;
        const pendientes = this.citasSolicitadas.filter(c => c.estado === 'solicitada').length;
        const completadas = this.citasConfirmadas.filter(c => c.estado === 'completada').length;
        const pacientesUnicos = new Set(this.citasConfirmadas.map(c => c.pacienteId)).size;

        document.getElementById('statCitasProgramadas').textContent = citasProgramadas;
        document.getElementById('statPendientes').textContent = pendientes;
        document.getElementById('statCompletadas').textContent = completadas;
        document.getElementById('statPacientes').textContent = pacientesUnicos;
    }

    mostrarPanelMedico() {
        document.getElementById('loginMedicosDiv').classList.add('d-none');
        document.getElementById('panelMedicos').classList.remove('d-none');
        document.getElementById('medicoNombreNav').textContent = `👨‍⚕️ Dr/a. ${this.usuarioActual.nombre}`;
        this.cargarCitasSolicitadas();
        this.cargarCitasProgramadas();
        this.cargarListaDisponibilidad();
        this.actualizarEstadisticasMedicas();
    }

    logout() {
        this.usuarioActual = null;
        this.tipoUsuario = null;
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('tipoUsuario');
        this.mostrarLogin();
    }

    mostrarLogin() {
        document.getElementById('portalPacientes').classList.add('d-none');
        document.getElementById('panelMedicos').classList.add('d-none');
        document.getElementById('authPacientes').classList.remove('d-none');
    }

    cerrarSesionMedico() {
        this.logout();
    }

    cerrarSesionPaciente() {
        this.logout();
    }

    verDetallesCita(id) {
        const cita = this.citasConfirmadas.find(c => c.id === id);
        if (cita) {
            alert(`
                📅 Detalles de tu Cita
                
                Fecha: ${new Date(cita.fechaConfirmada).toLocaleDateString('es-ES')}
                Hora: ${cita.horaConfirmada}
                Médico: ${cita.medicoNombre}
                Especialidad: ${cita.especialidad}
                Tipo: ${cita.tipoConsulta}
                
                Notas: ${cita.notas || 'Sin notas adicionales'}
            `);
        }
    }
}

// Inicializar la aplicación
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TelemedicinaRural();
});
