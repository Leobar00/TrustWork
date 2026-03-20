import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum SubmissionStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

interface SubmissionAttributes {
  id: string;
  taskId: string;
  freelancerId: string;
  content: string;
  attachmentUrls?: string[];
  aiValidationResult?: any;
  qualityScore?: number;
  requirementScore?: number;
  contentScore?: number;
  finalScore?: number;
  status: SubmissionStatus;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubmissionCreationAttributes
  extends Optional<
    SubmissionAttributes,
    'id' | 'attachmentUrls' | 'aiValidationResult' | 'qualityScore' | 'requirementScore' | 'contentScore' | 'finalScore' | 'status' | 'feedback'
  > {}

class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
  public id!: string;
  public taskId!: string;
  public freelancerId!: string;
  public content!: string;
  public attachmentUrls?: string[];
  public aiValidationResult?: any;
  public qualityScore?: number;
  public requirementScore?: number;
  public contentScore?: number;
  public finalScore?: number;
  public status!: SubmissionStatus;
  public feedback?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Submission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    freelancerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachmentUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    aiValidationResult: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    qualityScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    requirementScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    contentScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    finalScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SubmissionStatus)),
      allowNull: false,
      defaultValue: SubmissionStatus.PENDING,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'submissions',
    timestamps: true,
    indexes: [
      {
        fields: ['taskId'],
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

export default Submission;
