const Joi = require('joi');




const rejectDriverSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Rejection reason must be at least 5 characters',
    'string.max': 'Rejection reason cannot exceed 500 characters',
    'any.required': 'Rejection reason is required'
  })
});

const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character'
    })
});


const updateDriverStatusSchema = Joi.object({
  status: Joi.string()
    .valid('approved', 'rejected', 'suspended')
    .required()
    .messages({
      'any.only': 'Status must be approved, rejected, or suspended'
    }),
  reason: Joi.string().max(500).when('status', {
    is: Joi.valid('rejected', 'suspended'),
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'suspended').optional(),
  search: Joi.string().max(100).optional()
});

const createRouteAdminSchema = Joi.object({
  route_number: Joi.string().min(1).max(20).required(),
  route_name: Joi.string().min(2).max(200).required(),
  start_location: Joi.string().min(2).max(200).required(),
  end_location: Joi.string().min(2).max(200).required(),
  stops: Joi.array().items(Joi.string().min(1)).min(1).required().messages({
    'array.min': 'At least one stop is required'
  }),
  estimated_duration_minutes: Joi.number().integer().min(1).max(1440).optional()
});

const suspendDriverSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required()
});

const dateRangeSchema = Joi.object({
  from: Joi.string().isoDate().optional(),
  to: Joi.string().isoDate().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  rejectDriverSchema,
  createAdminSchema,
  updateDriverStatusSchema,
  paginationSchema,
  createRouteAdminSchema,
  suspendDriverSchema,
  dateRangeSchema
};
