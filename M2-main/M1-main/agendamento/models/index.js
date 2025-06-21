const { Sequelize, DataTypes } = require('sequelize'); // Importa DataTypes aqui
const config = require(__dirname + '/../config/config.js')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host, // Usa config.host para consistência
  dialect: config.dialect,
  logging: config.logging // Inclui a opção de logging do config
});

// Passa sequelize E DataTypes para os modelos
const User = require('./User')(sequelize, DataTypes);
const Specialty = require('./Specialty')(sequelize, DataTypes);
const Doctor = require('./Doctor')(sequelize, DataTypes);
const Appointment = require('./Appointment')(sequelize, DataTypes);

// Definir Associações
// Relação 1:N entre Specialty e Doctor (uma especialidade tem muitos médicos)
Specialty.hasMany(Doctor, {
  foreignKey: 'specialty_id',
  as: 'doctors' // Alias para quando buscar especialidade com médicos
});
Doctor.belongsTo(Specialty, {
  foreignKey: 'specialty_id',
  as: 'specialty' // Alias para quando buscar médico com especialidade (usado no frontend)
});

// Relação 1:N entre User e Appointment (um utilizador tem muitas consultas)
// Alterado 'as: "paciente"' para 'as: "User"' para corresponder ao frontend
User.hasMany(Appointment, {
  foreignKey: 'user_id',
  as: 'User' // Alias para quando buscar utilizador com consultas. Corrigido para 'User' para frontend.
});
Appointment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'User' // Alias para quando buscar consulta com paciente. Corrigido para 'User' para frontend.
});

// Relação 1:N entre Doctor e Appointment (um médico tem muitas consultas)
// Alterado 'as: "medico"' para 'as: "Doctor"' para corresponder ao frontend
Doctor.hasMany(Appointment, {
  foreignKey: 'doctor_id',
  as: 'appointments' // Alias para quando buscar médico com consultas
});
Appointment.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'Doctor' // Alias para quando buscar consulta com médico. Corrigido para 'Doctor' para frontend.
});

// REMOVIDO: Doctor.hasMany(User) - Esta associação é problemática e não corresponde ao seu esquema.
// A relação entre médicos e pacientes é feita através das consultas (Appointments).

module.exports = {
  sequelize,
  User,
  Specialty,
  Doctor,
  Appointment,
};
