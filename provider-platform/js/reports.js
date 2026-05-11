// ========== Módulo de Reportes ==========

const ReportsModule = (() => {
    
    // Generar reporte de pacientes
    const generatePatientReport = (startDate, endDate) => {
        const patients = PatientsModule.getAll();
        
        const filtered = patients.filter(p => {
            const date = new Date(p.registeredAt);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        return {
            title: 'Reporte de Pacientes',
            totalPatients: filtered.length,
            data: filtered,
            generatedAt: new Date().toISOString()
        };
    };

    // Generar reporte de consultas
    const generateConsultationReport = (startDate, endDate) => {
        const consultations = ConsultationsModule.getAll();
        
        const filtered = consultations.filter(c => {
            const date = new Date(c.createdAt);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const stats = {
            total: filtered.length,
            completed: filtered.filter(c => c.status === 'completada').length,
            pending: filtered.filter(c => c.status === 'pendiente').length
        };

        return {
            title: 'Reporte de Consultas',
            stats,
            data: filtered,
            generatedAt: new Date().toISOString()
        };
    };

    // Generar reporte de prescripciones
    const generatePrescriptionReport = (startDate, endDate) => {
        const prescriptions = PrescriptionsModule.getAll();
        
        const filtered = prescriptions.filter(p => {
            const date = new Date(p.issuedAt);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        return {
            title: 'Reporte de Prescripciones',
            totalPrescriptions: filtered.length,
            data: filtered,
            generatedAt: new Date().toISOString()
        };
    };

    // Exportar a CSV
    const exportToCSV = (data, filename) => {
        const csv = convertToCSV(data);
        downloadFile(csv, filename, 'text/csv');
    };

    // Convertir a CSV
    const convertToCSV = (data) => {
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).join(','));
        return [header, ...rows].join('\n');
    };

    // Descargar archivo
    const downloadFile = (content, filename, type) => {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    };

    // Generar estadísticas generales
    const generateStats = () => {
        return {
            totalPatients: PatientsModule.getAll().length,
            totalConsultations: ConsultationsModule.getAll().length,
            totalPrescriptions: PrescriptionsModule.getAll().length,
            pendingConsultations: ConsultationsModule.getPending().length
        };
    };

    return {
        generatePatientReport,
        generateConsultationReport,
        generatePrescriptionReport,
        exportToCSV,
        generateStats
    };
})();
