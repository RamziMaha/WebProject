const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');
const Session = require('./Session');
const List = require('./List');
const Task = require('./Task');
const Tag = require('./Tag');

const ListMember = sequelize.define(
  'list_member',
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    list_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    role: {
      type: DataTypes.ENUM('owner', 'member'),
      allowNull: false,
      defaultValue: 'member'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'list_member',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'list_id']
      }
    ]
  }
);

const TaskAssignee = sequelize.define(
  'task_assignee',
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    task_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    tableName: 'task_assignee',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'task_id']
      }
    ]
  }
);

const TaskTag = sequelize.define(
  'task_tag',
  {
    task_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    tag_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    tableName: 'task_tag',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['task_id', 'tag_id']
      }
    ]
  }
);

function registerAssociations() {
  User.hasMany(Session, {
    foreignKey: 'user_id',
    as: 'sessions',
    onDelete: 'CASCADE'
  });
  Session.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  User.hasMany(List, {
    foreignKey: 'owner_id',
    as: 'ownedLists',
    onDelete: 'CASCADE'
  });
  List.belongsTo(User, {
    foreignKey: 'owner_id',
    as: 'owner'
  });

  User.belongsToMany(List, {
    through: ListMember,
    foreignKey: 'user_id',
    otherKey: 'list_id',
    as: 'lists'
  });
  List.belongsToMany(User, {
    through: ListMember,
    foreignKey: 'list_id',
    otherKey: 'user_id',
    as: 'members'
  });
  ListMember.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  });
  ListMember.belongsTo(List, {
    foreignKey: 'list_id',
    as: 'list',
    onDelete: 'CASCADE'
  });

  List.hasMany(Task, {
    foreignKey: 'list_id',
    as: 'tasks',
    onDelete: 'CASCADE'
  });
  Task.belongsTo(List, {
    foreignKey: 'list_id',
    as: 'list'
  });

  User.belongsToMany(Task, {
    through: TaskAssignee,
    foreignKey: 'user_id',
    otherKey: 'task_id',
    as: 'assignedTasks'
  });
  Task.belongsToMany(User, {
    through: TaskAssignee,
    foreignKey: 'task_id',
    otherKey: 'user_id',
    as: 'assignees'
  });
  TaskAssignee.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  });
  TaskAssignee.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task',
    onDelete: 'CASCADE'
  });

  Task.belongsToMany(Tag, {
    through: TaskTag,
    foreignKey: 'task_id',
    otherKey: 'tag_id',
    as: 'tags'
  });
  Tag.belongsToMany(Task, {
    through: TaskTag,
    foreignKey: 'tag_id',
    otherKey: 'task_id',
    as: 'tasks'
  });
  TaskTag.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task',
    onDelete: 'CASCADE'
  });
  TaskTag.belongsTo(Tag, {
    foreignKey: 'tag_id',
    as: 'tag',
    onDelete: 'CASCADE'
  });
}

module.exports = {
  ListMember,
  TaskAssignee,
  TaskTag,
  registerAssociations
};
