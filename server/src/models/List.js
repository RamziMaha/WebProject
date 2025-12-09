const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db');

class List extends Model {}

List.init(
  {
    id_list: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    owner_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('personal', 'work', 'grocery', 'trip'),
      allowNull: false,
      defaultValue: 'personal'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'lists',
    timestamps: false
  }
);

module.exports = List;
