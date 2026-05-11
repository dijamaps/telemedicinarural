// ========== Módulo de Gestión de Consultas ==========

const ConsultationsModule = (() => {
    const STORAGE_KEY = 'provider_consultations';

    // Obtener todas las consultas
    const getAll = () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    };

    // Obtener consulta por ID
    const getById = (id) => {
        const consultations = getAll();
        return consultations.find(c => c.id === id);
    };

    // Crear nueva consulta
    const create = (consultationData) => {
        const consultations = getAll();
        
        const newConsultation = {
            id: Date.now(),
            ...consultationData,
            doctor: AuthModule.getCurrentUser().id,
            status: 'pendiente',
            createdAt: new Date().toISOString()
        };

        consultations.push(newConsultation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));
        return newConsultation;
    };

    // Actualizar consulta
    const update = (id, consultationData) => {
        let consultations = getAll();
        const index = consultations.findIndex(c => c.id === id);

        if (index === -1) {
            return { success: false, message: 'Consulta no encontrada' };
        }

        consultations[index] = { ...consultations[index], ...consultationData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));
        return { success: true, consultation: consultations[index] };
    };

    // Obtener consultas por paciente
    const getByPatient = (patientId) => {
        const consultations = getAll();
        return consultations.filter(c => c.patientId === patientId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    // Obtener consultas pendientes
    const getPending = () => {
        const consultations = getAll();
        return consultations.filter(c => c.status === 'pendiente');
    };

    // Marcar consulta como completada
    const markAsCompleted = (id, notes) => {
        return update(id, {
            status: 'completada',
            completedAt: new Date().toISOString(),
            notes
        });
    };

    return {
        getAll,
        getById,
        create,
        update,
        getByPatient,
        getPending,
        markAsCompleted
    };
})();
