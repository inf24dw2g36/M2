const express = require('express');
const router = express.Router();

// Middleware de autenticação
const auth = require('../middleware/auth');

// Importa modelos. Os aliases nos modelos devem estar em concordância.
const { Appointment, User, Doctor, Specialty } = require('../models');

// Aplica o middleware de autenticação a TODAS as rotas de agendamentos neste router
router.use(auth);

// Helper para formatar a resposta da consulta para o formato da API (id, date, time, notes, User, Doctor, Specialty)
// Ajusta os acessos a .User e .Doctor conforme os aliases definidos nos teus modelos (com 'U' e 'D' maiúsculos).
const formatAppointmentResponse = (appointment) => {
    if (!appointment) return null;

    // Acessa as associações usando os aliases definidos nos modelos (User e Doctor)
    // As instâncias do Sequelize trarão as associações com os nomes dos modelos/aliases definidos.
    const doctor = appointment.Doctor; // Alias 'Doctor' do models/index.js
    const specialty = doctor && doctor.Specialty; // Alias 'Specialty' para Doctor.belongsTo(Specialty) no models/index.js
    const user = appointment.User; // Alias 'User' do models/index.js

    // Combinar date e time da BD para 'data' (ISO 8601 string) se necessário para um formato específico da API
    // No entanto, o frontend parece usar `appointment.date` e `appointment.time` diretamente.
    // Vamos manter as propriedades `date` e `time` separadas para consistência com a DB e o frontend.
    // Se o frontend ou OpenAPI precisar de um campo `data` combinado, ele pode ser adicionado.

    return {
        id: appointment.id,
        date: appointment.date, // Mantém a data original
        time: appointment.time, // Mantém a hora original
        notes: appointment.notes,
        // Inclui os objetos User e Doctor no nível superior, como o frontend espera (capitalizados)
        User: user ? {
            id: user.id,
            name: user.name,
            email: user.email, // Incluído para completar o objeto User
            role: user.role // Incluído para completar o objeto User
        } : null,
        Doctor: doctor ? {
            id: doctor.id,
            name: doctor.name,
            // A especialidade aninhada dentro do médico também é esperada no frontend (DoctorsPage)
            Specialty: specialty ? { // Alias 'Specialty' para Doctor.belongsTo(Specialty)
                id: specialty.id,
                name: specialty.name
            } : null
        } : null
        // Não incluo 'specialty' no nível superior aqui se já está dentro de 'Doctor'
        // Mas se o OpenAPI ou frontend explicitamente esperarem 'specialty' no nível superior, adicione:
        // specialty: specialty ? { id: specialty.id, name: specialty.name } : null
    };
};

// Helper para garantir que o utilizador autenticado é o dono da consulta ou é admin
const authorizeAppointmentAccess = (req, appointment) => {
    if (!appointment) return false;
    if (!req.user || !req.user.role) return false;

    if (req.user.role === 'admin') {
        return true;
    }

    // Compara o ID do utilizador autenticado com o user_id da consulta (coluna da DB)
    if (req.user.id === appointment.user_id) {
        return true;
    }

    return false;
};

// GET /appointments - Retorna uma lista de consultas do utilizador autenticado (ou todas para admin)
// Formato esperado pelo frontend: { id, date, time, notes, User: {id, name}, Doctor: {id, name, Specialty: {id, name}}}
router.get('/', async (req, res) => {
    try {
        const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };

        const appointments = await Appointment.findAll({
            where,
            attributes: ['id', 'date', 'time', 'notes', 'user_id', 'doctor_id'],
            include: [
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usar alias 'Doctor'
                    attributes: ['id', 'name'],
                    include: [{
                        model: Specialty,
                        as: 'specialty', // <-- CORRIGIDO: Usar alias 'specialty' (do Doctor)
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: User,
                    as: 'User', // <-- CORRIGIDO: Usar alias 'User'
                    attributes: ['id', 'name', 'email', 'role'] // Incluir mais atributos para o frontend/futuro
                }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        // Formatar cada consulta para o formato esperado pelo frontend
        const formattedAppointments = appointments.map(formatAppointmentResponse);

        res.json(formattedAppointments);

    } catch (error) {
        console.error('Erro ao listar consultas:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao listar consultas.' });
    }
});

// POST /appointments - Cria uma nova consulta
router.post('/', async (req, res) => { // <-- CORRIGIDO: 'auth' removido do argumento da rota, já está no router.use()
    const userId = req.user.id; // ID do utilizador autenticado obtido do req.user
    const { date, time, notes, doctorId, specialtyId } = req.body; // Use 'date', 'time', 'notes', 'doctorId', 'specialtyId' conforme o frontend envia

    if (!date || !time || !doctorId || !specialtyId) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando: data, hora, medicoId, especialidadeId.' });
    }

    try {
        // Validação do médico e especialidade
        const doctor = await Doctor.findByPk(doctorId, { // Usa 'doctorId'
            include: [{
                model: Specialty,
                as: 'specialty', // Alias do Doctor para Specialty
                attributes: ['id']
            }],
            rejectOnEmpty: true
        });

        if (!doctor.specialty || doctor.specialty.id !== specialtyId) { // Usa 'specialtyId'
            return res.status(400).json({ error: 'Médico não encontrado ou não associado à especialidade fornecida.' });
        }

        // Criar a consulta
        const newAppointment = await Appointment.create({
            date: date,
            time: time,
            notes: notes,
            user_id: userId, // Usar o ID do utilizador autenticado
            doctor_id: doctorId // Usar o ID do médico
        });

        // Buscar a consulta criada com todas as associações para a resposta
        const createdAppointmentDetails = await Appointment.findByPk(newAppointment.id, {
            attributes: ['id', 'date', 'time', 'notes', 'user_id', 'doctor_id'],
            include: [
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usar alias 'Doctor'
                    attributes: ['id', 'name'],
                    include: [{
                        model: Specialty,
                        as: 'specialty', // Alias do Doctor para Specialty
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: User,
                    as: 'User', // <-- CORRIGIDO: Usar alias 'User'
                    attributes: ['id', 'name', 'email', 'role']
                }
            ]
        });

        res.status(201).json(formatAppointmentResponse(createdAppointmentDetails)); // <-- CORRIGIDO: Formatar resposta

    } catch (error) {
        console.error('Erro ao criar consulta:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: 'ID de médico ou paciente inválido.' });
        }
        if (error.name === 'SequelizeEmptyResultError') {
            return res.status(400).json({ error: 'Médico não encontrado com o ID fornecido.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao criar consulta.' });
    }
});

// GET /appointments/:id - Retorna uma consulta específica pelo ID
router.get('/:id', async (req, res) => {
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findByPk(appointmentId, {
            attributes: ['id', 'date', 'time', 'notes', 'user_id', 'doctor_id'],
            include: [
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usar alias 'Doctor'
                    attributes: ['id', 'name'],
                    include: [{
                        model: Specialty,
                        as: 'specialty', // Alias do Doctor para Specialty
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: User,
                    as: 'User', // <-- CORRIGIDO: Usar alias 'User'
                    attributes: ['id', 'name', 'email', 'role']
                }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Consulta não encontrada.' });
        }

        if (!authorizeAppointmentAccess(req, appointment)) {
            return res.status(403).json({ error: 'Acesso negado. Não tem permissão para visualizar esta consulta.' });
        }

        res.json(formatAppointmentResponse(appointment)); // <-- CORRIGIDO: Formatar resposta

    } catch (error) {
        console.error(`Erro ao buscar consulta com ID ${appointmentId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar consulta.' });
    }
});

// PUT /appointments/:id - Atualiza os dados de uma consulta
router.put('/:id', async (req, res) => {
    const appointmentId = req.params.id;
    const { date, time, notes, doctorId, specialtyId } = req.body; // Usa 'date', 'time', 'notes', 'doctorId', 'specialtyId'

    try {
        const appointment = await Appointment.findByPk(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: 'Consulta não encontrada' });
        }

        if (!authorizeAppointmentAccess(req, appointment)) {
            return res.status(403).json({ error: 'Acesso negado. Não tem permissão para editar esta consulta.' });
        }

        const updateFields = {};

        if (date !== undefined) updateFields.date = date;
        if (time !== undefined) updateFields.time = time;
        if (notes !== undefined) updateFields.notes = notes;

        // Se medicoId for fornecido, valida e adiciona doctor_id aos updateFields
        if (doctorId !== undefined) {
            const doctor = await Doctor.findByPk(doctorId, {
                include: [{
                    model: Specialty,
                    as: 'specialty', // Alias do Doctor para Specialty
                    attributes: ['id']
                }]
            });

            if (!doctor) {
                return res.status(400).json({ error: 'ID do médico inválido.' });
            }

            if (specialtyId !== undefined) {
                if (!doctor.specialty || doctor.specialty.id !== specialtyId) {
                    return res.status(400).json({ error: 'Novo médico não associado à especialidade fornecida.' });
                }
            }
            updateFields.doctor_id = doctorId;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo de atualização válido fornecido (data, hora, notas, medicoId).' });
        }

        await appointment.update(updateFields);

        const updatedAppointmentDetails = await Appointment.findByPk(appointment.id, {
            attributes: ['id', 'date', 'time', 'notes', 'user_id', 'doctor_id'],
            include: [
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usar alias 'Doctor'
                    attributes: ['id', 'name'],
                    include: [{
                        model: Specialty,
                        as: 'specialty', // Alias do Doctor para Specialty
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: User,
                    as: 'User', // <-- CORRIGIDO: Usar alias 'User'
                    attributes: ['id', 'name', 'email', 'role']
                }
            ]
        });

        res.json(formatAppointmentResponse(updatedAppointmentDetails)); // <-- CORRIGIDO: Formatar resposta

    } catch (error) {
        console.error(`Erro ao editar consulta com ID ${appointmentId}:`, error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: 'ID de médico inválido na atualização.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao editar consulta.' });
    }
});

// DELETE /appointments/:id - Eliminar consulta
router.delete('/:id', async (req, res) => {
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findByPk(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: 'Consulta não encontrada' });
        }

        if (!authorizeAppointmentAccess(req, appointment)) {
            return res.status(403).json({ error: 'Acesso negado. Não tem permissão para eliminar esta consulta.' });
        }

        await appointment.destroy();

        res.status(204).send(); // 204 No Content para sucesso de eliminação

    } catch (error) {
        console.error(`Erro ao eliminar consulta com ID ${appointmentId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao eliminar consulta.' });
    }
});

module.exports = router;
