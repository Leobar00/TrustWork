import User from './User';
import Task from './Task';
import Submission from './Submission';
import Escrow from './Escrow';
import Dispute from './Dispute';

User.hasMany(Task, { foreignKey: 'clientId', as: 'clientTasks' });
User.hasMany(Task, { foreignKey: 'freelancerId', as: 'freelancerTasks' });
User.hasMany(Submission, { foreignKey: 'freelancerId', as: 'submissions' });
User.hasMany(Dispute, { foreignKey: 'raisedBy', as: 'disputes' });

Task.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Task.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });
Task.hasMany(Submission, { foreignKey: 'taskId', as: 'submissions' });
Task.hasOne(Escrow, { foreignKey: 'taskId', as: 'escrow' });
Task.hasMany(Dispute, { foreignKey: 'taskId', as: 'disputes' });

Submission.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Submission.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });

Escrow.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

Dispute.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Dispute.belongsTo(User, { foreignKey: 'raisedBy', as: 'raiser' });

export { User, Task, Submission, Escrow, Dispute };
