// models/specialty.js

const { Model } = require('sequelize'); // DataTypes será passado como argumento

class Specialty extends Model {}

module.exports = (sequelize, DataTypes) => { // recebe DataTypes
  Specialty.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Specialty',
    tableName: 'specialties',
    timestamps: false, // Se não usar createdAt e updatedAt
  });

 

  return Specialty; // Retorna o modelo definido
};