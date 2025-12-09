const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db');

class Task extends Model {}

Task.init(
  {
    id_task: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    list_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('todo', 'doing', 'done'),
      allowNull: false,
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'med', 'high'),
      allowNull: false,
      defaultValue: 'med'
    },
    due_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    position: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Task;
