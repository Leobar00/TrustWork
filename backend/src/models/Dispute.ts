import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum DisputeStatus {
  OPEN = 'open',
  ANALYZING = 'analyzing',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum DisputeOutcome {
  FULL_PAYMENT = 'full_payment',
  PARTIAL_75 = 'partial_75',
  PARTIAL_50 = 'partial_50',
  PARTIAL_25 = 'partial_25',
  FULL_REFUND = 'full_refund',
}

interface DisputeAttributes {
  id: string;
  taskId: string;
  raisedBy: string;
  reason: string;
  freelancerResponse?: string;
  aiAnalysis?: any;
  clientClaimScore?: number;
  freelancerDefenseScore?: number;
  revalidationScore?: number;
  outcome?: DisputeOutcome;
  resolution?: string;
  status: DisputeStatus;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DisputeCreationAttributes
  extends Optional<
    DisputeAttributes,
    | 'id'
    | 'freelancerResponse'
    | 'aiAnalysis'
    | 'clientClaimScore'
    | 'freelancerDefenseScore'
    | 'revalidationScore'
    | 'outcome'
    | 'resolution'
    | 'status'
    | 'resolvedAt'
  > {}

class Dispute extends Model<DisputeAttributes, DisputeCreationAttributes> implements DisputeAttributes {
  public id!: string;
  public taskId!: string;
  public raisedBy!: string;
  public reason!: string;
  public freelancerResponse?: string;
  public aiAnalysis?: any;
  public clientClaimScore?: number;
  public freelancerDefenseScore?: number;
  public revalidationScore?: number;
  public outcome?: DisputeOutcome;
  public resolution?: string;
  public status!: DisputeStatus;
  public resolvedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Dispute.init(
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
    raisedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    freelancerResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aiAnalysis: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    clientClaimScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    freelancerDefenseScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    revalidationScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    outcome: {
      type: DataTypes.ENUM(...Object.values(DisputeOutcome)),
      allowNull: true,
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DisputeStatus)),
      allowNull: false,
      defaultValue: DisputeStatus.OPEN,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'disputes',
    timestamps: true,
    indexes: [
      {
        fields: ['taskId'],
      },
      {
        fields: ['raisedBy'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Dispute;
