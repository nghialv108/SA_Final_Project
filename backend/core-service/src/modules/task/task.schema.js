const { z } = require('zod');
const { TASK_STATUS, TASK_PRIORITY } = require('../../shared/interfaces/enums');

const createTaskSchema = z.object({
  title:            z.string().min(1).max(300),
  description:      z.string().max(5000).optional().default(''),
  projectId:        z.string().min(1),
  priority:         z.enum(Object.values(TASK_PRIORITY)).optional().default('medium'),
  assigneeId:       z.string().optional().nullable(),
  parentTaskId:     z.string().optional().nullable(),
  dueDate:          z.string().datetime({ offset: true }).optional().nullable(),
  startDate:        z.string().datetime({ offset: true }).optional().nullable(),
  estimatedMinutes: z.number().int().min(0).optional().default(0),
  tags:             z.array(z.string()).optional().default([]),
});

const updateTaskSchema = z.object({
  title:            z.string().min(1).max(300).optional(),
  description:      z.string().max(5000).optional(),
  priority:         z.enum(Object.values(TASK_PRIORITY)).optional(),
  dueDate:          z.string().datetime({ offset: true }).optional().nullable(),
  startDate:        z.string().datetime({ offset: true }).optional().nullable(),
  estimatedMinutes: z.number().int().min(0).optional(),
  tags:             z.array(z.string()).optional(),
});

const changeStatusSchema = z.object({
  status: z.enum(Object.values(TASK_STATUS)),
});

const assignSchema = z.object({
  assigneeId: z.string().min(1),
});

const logTimeSchema = z.object({
  startedAt: z.string().datetime({ offset: true }),
  endedAt:   z.string().datetime({ offset: true }).optional().nullable(),
  minutes:   z.number().int().min(1),
  note:      z.string().max(500).optional().default(''),
});

module.exports = {
  createTaskSchema, updateTaskSchema,
  changeStatusSchema, assignSchema, logTimeSchema,
};
