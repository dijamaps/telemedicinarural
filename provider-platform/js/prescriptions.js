// ========== Módulo de Gestión de Prescripciones ==========

const PrescriptionsModule = (() => {
    const STORAGE_KEY = 'provider_prescriptions';
    const MEDICATIONS_KEY = 'provider_medications';

    // Medicamentos comunes (base de datos inicial)
    const DEFAULT_MEDICATIONS = [
        { id: 1, name: 'Amoxicilina', dosage: '500mg', type: 'Antibiótico' },
        { id: 2, name: 'Paracetamol', dosage: '500mg', type: 'Analgésico' },
        { id: 3, name: 'Ibuprofeno', dosage: '400mg', type: 'Antiinflamatorio' },
        { id: 4, name: 'Metformina', dosage: '500mg', type: 'Antidiabético' },
        { id: 5, name: 'Lisinopril', dosage: '10mg', type: 'Antihipertensivo' }
    ];

    // Inicializar medicamentos
    const initMedications = () => {
        if (!localStorage.getItem(MEDICATIONS_KEY)) {
            localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(DEFAULT_MEDICATIONS));
        }
    };

    // Obtener todos los medicamentos
    const getMedications = () => {
        initMedications();
        return JSON.parse(localStorage.getItem(MEDICATIONS_KEY) || '[]');
    };

    // Obtener todas las prescripciones
    const getAll = () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    };

    // Crear nueva prescripción
    const create = (prescriptionData) => {
        const prescriptions = getAll();
        
        const newPrescription = {
            id: Date.now(),
            ...prescriptionData,
            doctor: AuthModule.getCurrentUser().id,
            issuedAt: new Date().toISOString(),
            status: 'activa'
        };

        prescriptions.push(newPrescription);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
        return newPrescription;
    };

    // Obtener prescripciones por paciente
    const getByPatient = (patientId) => {
        const prescriptions = getAll();
        return prescriptions.filter(p => p.patientId === patientId)
            .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
    };

    // Obtener prescripción por ID
    const getById = (id) => {
        const prescriptions = getAll();
        return prescriptions.find(p => p.id === id);
    };

    // Cancelar prescripción
    const cancel = (id) => {
        const prescriptions = getAll();
        const index = prescriptions.findIndex(p => p.id === id);
        
        if (index === -1) return { success: false };
        
        prescriptions[index].status = 'cancelada';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
        return { success: true };
    };

    return {
        getMedications,
        getAll,
        create,
        getByPatient,
        getById,
        cancel
    };
})();
