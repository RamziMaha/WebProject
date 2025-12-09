const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db');

class Tag extends Model {}

Tag.init(
  {
    id_tag: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'tags',
    timestamps: false
  }
);

module.exports = Tag;
