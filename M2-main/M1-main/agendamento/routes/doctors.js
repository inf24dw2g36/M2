const express = require('express');
const router = express.Router();

// Middleware de autenticação (verifica autenticação e adiciona req.user)
const auth = require('../middleware/auth');

// Importa modelos.
const { Appointment, User, Doctor, Specialty } = require('../models');

// Aplica o middleware de autenticação a TODAS as rotas de médicos neste router.
// Isto garante que mesmo o GET /doctors (listar todos) requer autenticação.
router.use(auth);

// GET /doctors - Lista todos os médicos, incluindo a especialidade
// Acessível por qualquer utilizador autenticado.
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            include: [{
                model: Specialty, // Modelo que queremos incluir
                as: 'specialty', // ALIAS definido na associação Doctor.belongsTo(Specialty, { as: 'specialty', ... })
                attributes: ['id', 'name'] // Seleciona os campos da especialidade
            }],
            attributes: ['id', 'name'], // Opcional: Limite os campos retornados para o próprio médico
        });
        res.json(doctors);
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar médicos.' });
    }
});

// Middleware de verificação de admin (aplicado APENAS às rotas abaixo desta linha)
// As rotas acima (GET /) não serão afetadas por este middleware de admin.
router.use((req, res, next) => {
    // Verifica se o utilizador está autenticado (já garantido por router.use(auth) acima)
    // e se tem a role 'admin'
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem gerir médicos.' });
    }
    next(); // Se for admin autenticado, continua para a próxima middleware/rota
});

// POST /doctors - Adiciona um novo médico (Requer admin)
router.post('/', async (req, res) => {
    const { name, specialty_id } = req.body;

    if (!name || !specialty_id) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando: name, specialty_id.' });
    }

    try {
        const specialty = await Specialty.findByPk(specialty_id);
        if (!specialty) {
            return res.status(400).json({ error: 'ID de especialidade inválido.' });
        }
        const newDoctor = await Doctor.create({ name, specialty_id });

        const doctorWithSpecialty = await Doctor.findByPk(newDoctor.id, {
            attributes: ['id', 'name'],
            include: [{
                model: Specialty,
                as: 'specialty', // Usa o ALIAS definido na associação Doctor.belongsTo(Specialty, { as: 'specialty', ... })
                attributes: ['id', 'name']
            }]
        });

        res.status(201).json(doctorWithSpecialty);

    } catch (error) {
        console.error('Erro ao criar médico:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao criar médico.' });
    }
});

// GET /doctors/:id - Retorna um médico específico pelo ID, incluindo a especialidade (Requer admin)
router.get('/:id', async (req, res) => {
    const doctorId = req.params.id;

    try {
        const doctor = await Doctor.findByPk(doctorId, {
            include: {
                model: Specialty,
                as: 'specialty', // Usa o alias definido na associação Doctor.belongsTo(Specialty, { as: 'specialty', ... })
                attributes: ['id', 'name']
            }
        });

        if (!doctor) {
            return res.status(404).json({ error: 'Médico não encontrado.' });
        }

        res.json(doctor);

    } catch (error) {
        console.error(`Erro ao buscar médico com ID ${doctorId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar médico.' });
    }
});

// PUT /doctors/:id - Atualiza os dados de um médico pelo ID (Requer admin)
router.put('/:id', async (req, res) => {
    const doctorId = req.params.id;
    const { name, specialty_id } = req.body;

    try {
        const doctor = await Doctor.findByPk(doctorId);

        if (!doctor) {
            return res.status(404).json({ error: 'Médico não encontrado.' });
        }

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (specialty_id !== undefined) {
            const specialty = await Specialty.findByPk(specialty_id);
            if (!specialty) {
                return res.status(400).json({ error: 'ID de especialidade inválido.' });
            }
            updateFields.specialty_id = specialty_id;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo de atualização fornecido.' });
        }

        await doctor.update(updateFields);

        const updatedDoctorWithSpecialty = await Doctor.findByPk(doctor.id, {
            include: {
                model: Specialty,
                as: 'specialty', // Usa o alias definido na associação Doctor.belongsTo(Specialty, { as: 'specialty', ... })
                attributes: ['id', 'name']
            }
        });

        res.json(updatedDoctorWithSpecialty);

    } catch (error) {
        console.error(`Erro ao atualizar médico com ID ${doctorId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar médico.' });
    }
});

// GET /doctors/:id/appointments - Retorna as consultas de um médico específico, incluindo pacientes e especialidades (Requer admin)
router.get('/:id/appointments', async (req, res) => {
    const doctorId = req.params.id;

    try {
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Médico não encontrado.' });
        }

        const appointments = await Appointment.findAll({
            where: { doctor_id: doctorId },
            attributes: ['id', 'date', 'time', 'notes'],
            include: [
                {
                    model: User,
                    as: 'User', // <-- CORRIGIDO: Usa o alias 'User' conforme models/index.js
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usa o alias 'Doctor' conforme models/index.js
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Specialty,
                            as: 'specialty', // Usa o alias definido em Doctor.belongsTo(Specialty, { as: 'specialty', ... })
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        res.json(appointments);

    } catch (error) {
        console.error(`Erro ao buscar consultas para o médico com ID ${doctorId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar consultas do médico.' });
    }
});

// DELETE /doctors/:id - Deleta um médico pelo ID (Requer admin)
router.delete('/:id', async (req, res) => {
    const doctorId = req.params.id;

    try {
        const deletedRowCount = await Doctor.destroy({
            where: { id: doctorId }
        });

        if (deletedRowCount === 0) {
            return res.status(404).json({ error: 'Médico não encontrado.' });
        }

        res.status(204).send();

    } catch (error) {
        console.error(`Erro ao deletar médico com ID ${doctorId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao deletar médico.' });
    }
});

module.exports = router;
