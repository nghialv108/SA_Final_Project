const { Router } = require('express');
const ctrl       = require('./project.controller');
const validate   = require('../../shared/middlewares/validate.middleware');
const {
  createProjectSchema, updateProjectSchema,
  milestoneSchema, memberSchema, memberRoleSchema,
} = require('./project.schema');

const router = Router();

router.get('/',    ctrl.getProjects);
router.post('/',   validate(createProjectSchema), ctrl.createProject);
router.get('/:id', ctrl.getProjectById);
router.put('/:id', validate(updateProjectSchema), ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);
router.patch('/:id/archive', ctrl.archiveProject);

// Members
router.get('/:id/members',              ctrl.getMembers);
router.post('/:id/members',             validate(memberSchema),     ctrl.addMember);
router.patch('/:id/members/:memberId/role', validate(memberRoleSchema), ctrl.updateMemberRole);
router.delete('/:id/members/:memberId', ctrl.removeMember);

// Milestones
router.post('/:id/milestones',          validate(milestoneSchema),  ctrl.addMilestone);
router.put('/:id/milestones/:mid',      validate(milestoneSchema),  ctrl.updateMilestone);
router.delete('/:id/milestones/:mid',   ctrl.deleteMilestone);

module.exports = router;
