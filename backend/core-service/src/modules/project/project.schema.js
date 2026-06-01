const { z } = require('zod');
const { PROJECT_VISIBILITY, ROLE } = require('../../shared/interfaces/enums');

const createProjectSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().max(1000).optional().default(''),
  visibility:  z.enum(Object.values(PROJECT_VISIBILITY)).optional().default('private'),
});

const updateProjectSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  visibility:  z.enum(Object.values(PROJECT_VISIBILITY)).optional(),
});

const milestoneSchema = z.object({
  title:       z.string().min(1).max(200),
  dueDate:     z.string().datetime({ offset: true }).optional().nullable(),
  isCompleted: z.boolean().optional(),
});

const memberSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  role:   z.enum([ROLE.MANAGER, ROLE.MEMBER]).optional().default(ROLE.MEMBER),
});

const memberRoleSchema = z.object({
  role: z.enum([ROLE.MANAGER, ROLE.MEMBER]),
});

module.exports = {
  createProjectSchema, updateProjectSchema,
  milestoneSchema, memberSchema, memberRoleSchema,
};
