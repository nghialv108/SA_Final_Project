const mongoose = require('mongoose');
const { PROJECT_VISIBILITY, ROLE } = require('../../shared/interfaces/enums');

const milestoneSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  dueDate:     { type: Date,    default: null },
  isCompleted: { type: Boolean, default: false },
}, { _id: true });

// ProjectMember: role riêng biệt cho từng project
// Tách khỏi workspace role — 1 user có thể là manager ở project X,
// nhưng chỉ member ở project Y trong cùng workspace.
const projectMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role:   { type: String, enum: [ROLE.MANAGER, ROLE.MEMBER], default: ROLE.MEMBER },
}, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    visibility:  {
      type:    String,
      enum:    Object.values(PROJECT_VISIBILITY),
      default: PROJECT_VISIBILITY.PRIVATE,
    },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    ownerId:     { type: mongoose.Schema.Types.ObjectId, required: true },
    // members giờ là array object { userId, role } thay vì chỉ ObjectId
    members:     [projectMemberSchema],
    milestones:  [milestoneSchema],
    isArchived:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

projectSchema.index({ workspaceId: 1, isArchived: 1 });
projectSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Project', projectSchema);
