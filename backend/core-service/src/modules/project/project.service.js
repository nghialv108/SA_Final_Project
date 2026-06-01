const projectRepo = require('./project.repository');
const AppError    = require('../../shared/utils/AppError');
const eventBus    = require('../../shared/events/eventBus');
const EVENTS      = require('../../shared/events/eventNames');
const { ROLE }    = require('../../shared/interfaces/enums');

// ── Helpers ───────────────────────────────────────────────────────────────────
const assertProjectExists = async (projectId, workspaceId) => {
  const project = await projectRepo.findById(projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (String(project.workspaceId) !== String(workspaceId))
    throw new AppError('Project not found', 404);
  return project;
};

// Lấy project role của user (manager/member) hoặc null nếu không phải member
const getProjectRole = (project, userId) => {
  const m = project.members.find((m) => String(m.userId) === String(userId));
  return m?.role ?? null;
};

// workspace admin có quyền cao nhất bất kể project role
const canManageProject = (workspaceRole, projectRole) =>
  workspaceRole === ROLE.ADMIN || projectRole === ROLE.MANAGER;

const assertProjectAccess = async (projectId, userId, workspaceId, workspaceRole) => {
  const project     = await assertProjectExists(projectId, workspaceId);
  const projectRole = getProjectRole(project, userId);

  // workspace admin bypass project membership check
  if (workspaceRole !== ROLE.ADMIN && projectRole === null)
    throw new AppError('Forbidden: You are not a member of this project', 403);

  return { project, projectRole };
};

// ── CRUD ──────────────────────────────────────────────────────────────────────
const createProject = async ({ userId, role: workspaceRole, workspaceId }, body) => {
  if (workspaceRole !== ROLE.ADMIN && workspaceRole !== ROLE.MANAGER)
    throw new AppError('Forbidden: Only admin/manager can create projects', 403);

  const project = await projectRepo.create({
    ...body,
    workspaceId,
    ownerId: userId,
    members: [{ userId, role: ROLE.MANAGER }], // creator mặc định là manager
  });

  eventBus.emit(EVENTS.PROJECT_CREATED, {
    projectId: project._id, name: project.name,
    workspaceId, createdBy: userId,
  });

  return project;
};

const getProjects = async ({ userId, role: workspaceRole, workspaceId }) => {
  // workspace admin thấy tất cả project
  if (workspaceRole === ROLE.ADMIN) return projectRepo.findByWorkspace(workspaceId);
  // còn lại chỉ thấy project mình là member
  return projectRepo.findByMember(userId);
};

const getProjectById = async ({ userId, role: workspaceRole, workspaceId }, projectId) => {
  const { project } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);
  return project;
};

const updateProject = async ({ userId, role: workspaceRole, workspaceId }, projectId, body) => {
  const { project, projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);

  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden: Only admin/manager can update this project', 403);

  const updated = await projectRepo.updateById(projectId, body);

  eventBus.emit(EVENTS.PROJECT_UPDATED, { projectId, updatedBy: userId, changes: body, workspaceId });

  return updated;
};

const deleteProject = async ({ userId, role: workspaceRole, workspaceId }, projectId) => {
  const { project } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);

  const isOwner = String(project.ownerId) === String(userId);
  if (!isOwner && workspaceRole !== ROLE.ADMIN)
    throw new AppError('Forbidden: Only owner or workspace admin can delete this project', 403);

  await projectRepo.deleteById(projectId);

  eventBus.emit(EVENTS.PROJECT_DELETED, { projectId, deletedBy: userId, workspaceId });
};

const archiveProject = async ({ userId, role: workspaceRole, workspaceId }, projectId) => {
  const { project, projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);

  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden: Only admin/manager can archive projects', 403);

  return projectRepo.updateById(projectId, { isArchived: true });
};

// ── Members ───────────────────────────────────────────────────────────────────
const getMembers = async ({ userId, role: workspaceRole, workspaceId }, projectId) => {
  const { project } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);
  return project.members;
};

const addMember = async ({ userId, role: workspaceRole, workspaceId }, projectId, memberId, memberRole = ROLE.MEMBER) => {
  const { project, projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);

  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden: Only admin/manager can add members', 403);

  const alreadyMember = project.members.some((m) => String(m.userId) === String(memberId));
  if (alreadyMember) throw new AppError('User is already a member of this project', 409);

  const updated = await projectRepo.addMember(projectId, memberId, memberRole);

  eventBus.emit(EVENTS.PROJECT_MEMBER_ADDED, { projectId, memberId, addedBy: userId, workspaceId });

  return updated;
};

const updateMemberRole = async ({ userId, role: workspaceRole, workspaceId }, projectId, memberId, newRole) => {
  const { project, projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);

  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden: Only admin/manager can change member roles', 403);

  return projectRepo.updateMemberRole(projectId, memberId, newRole);
};

const removeMember = async ({ userId, role: workspaceRole, workspaceId }, projectId, memberId) => {
  const { project, projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);

  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden: Only admin/manager can remove members', 403);

  if (String(userId) === String(memberId))
    throw new AppError('Cannot remove yourself from project', 400);

  const updated = await projectRepo.removeMember(projectId, memberId);

  eventBus.emit(EVENTS.PROJECT_MEMBER_REMOVED, { projectId, memberId, removedBy: userId });

  return updated;
};

// ── Milestones ────────────────────────────────────────────────────────────────
const addMilestone = async ({ userId, role: workspaceRole, workspaceId }, projectId, data) => {
  const { projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);
  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden: Only admin/manager can add milestones', 403);
  return projectRepo.addMilestone(projectId, data);
};

const updateMilestone = async ({ userId, role: workspaceRole, workspaceId }, projectId, milestoneId, data) => {
  const { projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);
  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden', 403);
  return projectRepo.updateMilestone(projectId, milestoneId, data);
};

const deleteMilestone = async ({ userId, role: workspaceRole, workspaceId }, projectId, milestoneId) => {
  const { projectRole } = await assertProjectAccess(projectId, userId, workspaceId, workspaceRole);
  if (!canManageProject(workspaceRole, projectRole))
    throw new AppError('Forbidden: Only admin/manager can delete milestones', 403);
  return projectRepo.deleteMilestone(projectId, milestoneId);
};

module.exports = {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, archiveProject,
  getMembers, addMember, updateMemberRole, removeMember,
  addMilestone, updateMilestone, deleteMilestone,
};
