const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth'); // Middleware de autenticação (verifica autenticação e adiciona req.user)
const { User, Appointment, Doctor, Specialty } = require('../models'); // Importa os modelos

// Aplica o middleware de autenticação a TODAS as rotas neste ficheiro.
// Isso garante que qualquer acesso a /api/users/* requer autenticação.
router.use(auth);

// --- Rotas Acessíveis por Utilizadores (com verificação de posse) ou por Admin ---

// GET /users/:userId/specialties/:specialtyId/appointments - Retorna consultas de um utilizador específico numa especialidade específica
// Um utilizador pode ver as suas próprias consultas; um admin pode ver as de qualquer um.
router.get('/:userId/specialties/:specialtyId/appointments', async (req, res) => {
    const userId = req.params.userId;
    const specialtyId = req.params.specialtyId;

    try {
        // Validação de autorização: Utilizador autenticado é o próprio user OU é admin
        if (req.user.id !== parseInt(userId, 10) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Não tem permissão para ver estas consultas.' });
        }

        const appointments = await Appointment.findAll({
            where: { user_id: userId }, // Filtra as consultas pelo ID do utilizador
            include: [
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usa o alias 'Doctor'
                    attributes: ['id', 'name'],
                    required: true,
                    include: [
                        {
                            model: Specialty,
                            as: 'specialty', // Alias do Doctor para Specialty
                            attributes: ['id', 'name'],
                            where: { id: specialtyId }, // FILTRA as consultas PELA ESPECIALIDADE DO MÉDICO
                            required: true // Garante que apenas consultas com esta especialidade são retornadas
                        }
                    ]
                },
                {
                    model: User,
                    as: 'User', // <-- CORRIGIDO: Usa o alias 'User'
                    attributes: ['id', 'name', 'email', 'role']
                }
            ],
            attributes: ['id', 'date', 'time', 'notes'],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        res.json(appointments);

    } catch (error) {
        console.error(`Erro ao buscar consultas para o utilizador ${userId} na especialidade ${specialtyId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar consultas para o utilizador e especialidade especificados.' });
    }
});

// GET /users/:userId/doctors - Retorna médicos únicos com quem um utilizador teve consultas
// Um utilizador pode ver os seus próprios médicos; um admin pode ver os de qualquer um.
router.get('/:userId/doctors', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Validação de autorização: Utilizador autenticado é o próprio user OU é admin
        if (req.user.id !== parseInt(userId, 10) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Não tem permissão para ver os médicos associados a este utilizador.' });
        }

        const appointments = await Appointment.findAll({
            where: { user_id: userId },
            attributes: [], // Não precisamos dos atributos da consulta em si
            include: [
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usa o alias 'Doctor'
                    attributes: ['id', 'name'],
                    required: true,
                }
            ],
        });

        const doctors = appointments
            .map(appointment => appointment.Doctor) // Extrai o objeto 'Doctor' de cada consulta
            .filter((doctor, index, self) =>
                index === self.findIndex((d) => (d.id === doctor.id)) // Filtra para obter médicos únicos
            );

        res.json(doctors);

    } catch (error) {
        console.error(`Erro ao buscar médicos para o utilizador com ID ${userId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar médicos do utilizador.' });
    }
});

// GET /users/:userId/appointments - Retorna as consultas de um utilizador específico
// Um utilizador pode ver as suas próprias consultas; um admin pode ver as de qualquer um.
router.get('/:userId/appointments', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Validação de autorização: Utilizador autenticado é o próprio user OU é admin
        if (req.user.id !== parseInt(userId, 10) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Não tem permissão para ver estas consultas.' });
        }

        const appointments = await Appointment.findAll({
            where: { user_id: userId },
            attributes: ['id', 'date', 'time', 'notes'],
            include: [
                {
                    model: User,
                    as: 'User', // <-- CORRIGIDO: Usa o alias 'User'
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Doctor,
                    as: 'Doctor', // <-- CORRIGIDO: Usa o alias 'Doctor'
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Specialty,
                            as: 'specialty', // Alias do Doctor para Specialty
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        res.json(appointments);

    } catch (error) {
        console.error(`Erro ao buscar consultas para o utilizador com ID ${userId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar consultas do utilizador.' });
    }
});

// --- Rotas Acessíveis APENAS por Administradores ---

// Middleware para verificar se o utilizador é admin (aplicado a todas as rotas abaixo)
router.use((req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem gerir utilizadores.' });
    }
    next();
});

// GET /users - Retorna uma lista de todos os utilizadores (Apenas Admin)
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role'] // Incluir email e role para admin
        });
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar utilizadores:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar utilizadores.' });
    }
});

// POST /users - Cria um novo utilizador (Apenas Admin)
router.post('/', async (req, res) => {
    const { name, email, google_id, role } = req.body;

    if (!name || !email || !google_id) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando: name, email, google_id.' });
    }

    try {
        const newUser = await User.create({
            name,
            email,
            google_id,
            role: role || 'user'
        });

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });

    } catch (error) {
        console.error('Erro ao criar utilizador:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Email ou Google ID já existem.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao criar utilizador.' });
    }
});

// GET /users/:id - Retorna um utilizador específico pelo ID (Apenas Admin)
router.get('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'role', 'google_id'] // Admin pode ver google_id
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        res.json(user);

    } catch (error) {
        console.error(`Erro ao buscar utilizador com ID ${userId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar utilizador.' });
    }
});

// PUT /users/:id - Atualiza os dados de um utilizador pelo ID (Apenas Admin)
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, role } = req.body;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (role !== undefined) updateFields.role = role;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo de atualização fornecido.' });
        }

        await user.update(updateFields);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error(`Erro ao atualizar utilizador com ID ${userId}:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Violação de restrição única.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar utilizador.' });
    }
});

// DELETE /users/:id - Deleta um utilizador pelo ID (Apenas Admin)
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const deletedRowCount = await User.destroy({
            where: { id: userId }
        });

        if (deletedRowCount === 0) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        res.status(204).send(); // 204 No Content para sucesso de eliminação

    } catch (error) {
        console.error(`Erro ao deletar utilizador com ID ${userId}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao deletar utilizador.' });
    }
});

module.exports = router;
