const Joi = require('joi');

const createBusSchema = Joi.object({
  bus_number: Joi.string().min(2).max(20).required(),
  capacity: Joi.number().integer().min(1).max(100).required(),
  model: Joi.string().max(100),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear())
});

const updateBusSchema = Joi.object({
  bus_number: Joi.string().min(2).max(20),
  capacity: Joi.number().integer().min(1).max(100),
  model: Joi.string().max(100),
  is_active: Joi.boolean()
});

module.exports = { createBusSchema, updateBusSchema };