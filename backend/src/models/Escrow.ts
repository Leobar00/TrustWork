import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum EscrowStatus {
  PENDING = 'pending',
  LOCKING = 'locking',
  LOCKED = 'locked',
  RELEASING = 'releasing',
  RELEASED = 'released',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  PARTIAL = 'partial',
  FAILED = 'failed',
}

interface EscrowAttributes {
  id: string;
  taskId: string;
  contractAddress?: string;
  amount: number;
  status: EscrowStatus;
  lockTxHash?: string;
  releaseTxHash?: string;
  refundTxHash?: string;
  lockedAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EscrowCreationAttributes
  extends Optional<
    EscrowAttributes,
    'id' | 'contractAddress' | 'status' | 'lockTxHash' | 'releaseTxHash' | 'refundTxHash' | 'lockedAt' | 'releasedAt' | 'refundedAt'
  > {}

class Escrow extends Model<EscrowAttributes, EscrowCreationAttributes> implements EscrowAttributes {
  public id!: string;
  public taskId!: string;
  public contractAddress?: string;
  public amount!: number;
  public status!: EscrowStatus;
  public lockTxHash?: string;
  public releaseTxHash?: string;
  public refundTxHash?: string;
  public lockedAt?: Date;
  public releasedAt?: Date;
  public refundedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Escrow.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    contractAddress: {
      type: DataTypes.STRING(42),
      allowNull: true,
      validate: {
        is: /^0x[a-fA-F0-9]{40}$/,
      },
    },
    amount: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EscrowStatus)),
      allowNull: false,
      defaultValue: EscrowStatus.PENDING,
    },
    lockTxHash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
    releaseTxHash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
    refundTxHash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    releasedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'escrow',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['taskId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['contractAddress'],
      },
    ],
  }
);

export default Escrow;
