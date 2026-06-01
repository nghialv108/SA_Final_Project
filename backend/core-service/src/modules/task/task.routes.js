const { Router } = require('express');
const ctrl       = require('./task.controller');
const validate   = require('../../shared/middlewares/validate.middleware');
const {
  createTaskSchema, updateTaskSchema,
  changeStatusSchema, assignSchema, logTimeSchema,
} = require('./task.schema');

const router = Router();

// /mine PHẢI đứng trước /:id để không bị match nhầm
router.get('/mine',          ctrl.getMyTasks);
router.get('/',              ctrl.getTasksByProject);    // ?projectId=xxx
router.post('/',             validate(createTaskSchema), ctrl.createTask);
router.get('/:id',           ctrl.getTaskById);
router.put('/:id',           validate(updateTaskSchema), ctrl.updateTask);
router.delete('/:id',        ctrl.deleteTask);
router.get('/:id/subtasks',  ctrl.getSubTasks);

router.patch('/:id/status',  validate(changeStatusSchema), ctrl.changeStatus);
router.patch('/:id/assign',  validate(assignSchema),       ctrl.assignTask);
router.post('/:id/time-log', validate(logTimeSchema),      ctrl.logTime);

module.exports = router;
