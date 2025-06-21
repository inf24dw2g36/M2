// models/doctor.js

const { Model } = require('sequelize'); // DataTypes será passado como argumento

class Doctor extends Model {}

module.exports = (sequelize, DataTypes) => { // recebe DataTypes
  Doctor.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Conforme o schema.sql, especialidade é obrigatória para o médico
    },
  }, {
    sequelize,
    modelName: 'Doctor',
    tableName: 'doctors',
    timestamps: false, // Se não usar createdAt e updatedAt
  });



  return Doctor; // Retorna o modelo definido
};
