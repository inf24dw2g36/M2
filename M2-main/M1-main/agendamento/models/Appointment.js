// models/appointment.js

const { Model } = require('sequelize'); // DataTypes como argumento

class Appointment extends Model {}

module.exports = (sequelize, DataTypes) => { //  recebe DataTypes
  Appointment.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: false, // Se não usar createdAt e updatedAt
  });



  return Appointment; // Retorna o modelo definido
};
