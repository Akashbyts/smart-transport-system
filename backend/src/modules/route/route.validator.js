const Joi = require('joi');

const createRouteSchema = Joi.object({
  route_number: Joi.string().min(1).max(20).required(),
  route_name: Joi.string().min(2).max(200).required(),
  start_location: Joi.string().required(),
  end_location: Joi.string().required(),
  stops: Joi.array().items(Joi.string()).min(1).required(),
  estimated_duration_minutes: Joi.number().integer().min(1)
});

const updateRouteSchema = Joi.object({
  route_name: Joi.string().min(2).max(200),
  start_location: Joi.string(),
  end_location: Joi.string(),
  stops: Joi.array().items(Joi.string()),
  estimated_duration_minutes: Joi.number().integer().min(1),
  is_active: Joi.boolean()
});

module.exports = { createRouteSchema, updateRouteSchema };