import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum TaskStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  ASSIGNED = 'assigned',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

interface TaskAttributes {
  id: string;
  clientId: string;
  freelancerId?: string;
  title: string;
  description: string;
  budget: number;
  status: TaskStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'freelancerId' | 'status'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: string;
  public clientId!: string;
  public freelancerId?: string;
  public title!: string;
  public description!: string;
  public budget!: number;
  public status!: TaskStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    freelancerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.DRAFT,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['freelancerId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Task;
