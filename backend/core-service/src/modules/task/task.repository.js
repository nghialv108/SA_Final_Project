const Task = require('./task.model');

const findById = (id) => Task.findById(id);

// BUG FIX (từ backend_fixed): nhận thêm options { skip, limit } cho pagination
const findByProject = (projectId, filters = {}, options = {}) => {
  let query = Task.find({ projectId, isArchived: false, ...filters });
  if (options.skip  != null) query = query.skip(options.skip);
  if (options.limit != null) query = query.limit(options.limit);
  return query;
};

const findByAssignee = (assigneeId, filters = {}) =>
  Task.find({ assigneeId, isArchived: false, ...filters });

const findSubTasks = (parentTaskId) =>
  Task.find({ parentTaskId, isArchived: false });

const findOverdue = (workspaceId) =>
  Task.find({
    workspaceId,
    dueDate:    { $lt: new Date() },
    status:     { $nin: ['done', 'cancelled'] },
    isArchived: false,
  });

const create     = (data) => Task.create(data);

const updateById = (id, data) =>
  Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteById = (id) => Task.findByIdAndDelete(id);

const deleteSubTasks = (parentTaskId) =>
  Task.deleteMany({ parentTaskId });

const pushTimeEntry = (id, entry) =>
  Task.findByIdAndUpdate(id, { $push: { timeEntries: entry } }, { new: true });

const countByProject = (projectId) =>
  Task.countDocuments({ projectId, isArchived: false });

const groupByStatus = (projectId) =>
  Task.aggregate([
    { $match: { projectId: new (require('mongoose').Types.ObjectId)(projectId), isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

module.exports = {
  findById, findByProject, findByAssignee,
  findSubTasks, findOverdue,
  create, updateById, deleteById, deleteSubTasks,
  pushTimeEntry, countByProject, groupByStatus,
};
