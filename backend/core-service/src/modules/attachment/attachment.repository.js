const Attachment = require('./attachment.model');

const create           = (data) => Attachment.create(data);
const findById         = (id)   => Attachment.findById(id);
const findByTarget     = (targetId, targetType) =>
  Attachment.find({ targetId, targetType });
const findByWorkspace  = (workspaceId) =>
  Attachment.find({ workspaceId });
const deleteById       = (id)   => Attachment.findByIdAndDelete(id);

const sumSizeByWorkspace = (workspaceId) =>
  Attachment.aggregate([
    { $match: { workspaceId: new (require('mongoose').Types.ObjectId)(workspaceId) } },
    { $group: { _id: null, total: { $sum: '$size' } } },
  ]).then((r) => r[0]?.total ?? 0);

module.exports = {
  create, findById, findByTarget, findByWorkspace,
  deleteById, sumSizeByWorkspace,
};
