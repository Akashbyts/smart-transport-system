const Joi = require('joi');

const startTripSchema = Joi.object({
  bus_id: Joi.string().uuid().required(),
  route_id: Joi.string().uuid().required()
});

const locationUpdateSchema = Joi.object({
  trip_id: Joi.string().uuid().required(),
  bus_id: Joi.string().uuid().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  heading: Joi.number().min(0).max(360),
  speed: Joi.number().min(0).max(200)
});

module.exports = { startTripSchema, locationUpdateSchema };