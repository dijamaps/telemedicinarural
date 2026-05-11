// ========== Módulo de Gestión de Pacientes ==========

const PatientsModule = (() => {
    const STORAGE_KEY = 'provider_patients';

    // Obtener todos los pacientes
    const getAll = () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    };

    // Obtener paciente por ID
    const getById = (id) => {
        const patients = getAll();
        return patients.find(p => p.id === id);
    };

    // Crear nuevo paciente
    const create = (patientData) => {
        const patients = getAll();
        
        const newPatient = {
            id: Date.now(),
            ...patientData,
            registeredBy: AuthModule.getCurrentUser().id,
            registeredAt: new Date().toISOString()
        };

        patients.push(newPatient);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
        return newPatient;
    };

    // Actualizar paciente
    const update = (id, patientData) => {
        let patients = getAll();
        const index = patients.findIndex(p => p.id === id);

        if (index === -1) {
            return { success: false, message: 'Paciente no encontrado' };
        }

        patients[index] = { ...patients[index], ...patientData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
        return { success: true, patient: patients[index] };
    };

    // Eliminar paciente
    const remove = (id) => {
        let patients = getAll();
        patients = patients.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
        return { success: true };
    };

    // Buscar pacientes
    const search = (query) => {
        const patients = getAll();
        const lowerQuery = query.toLowerCase();
        
        return patients.filter(p => 
            p.nombre.toLowerCase().includes(lowerQuery) ||
            p.dni.includes(query) ||
            p.email.toLowerCase().includes(lowerQuery)
        );
    };

    // Obtener pacientes por médico
    const getByDoctor = (doctorId) => {
        const patients = getAll();
        return patients.filter(p => p.assignedDoctor === doctorId);
    };

    return {
        getAll,
        getById,
        create,
        update,
        remove,
        search,
        getByDoctor
    };
})();
