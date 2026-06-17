const Joi = require('joi');

const kycSchema = Joi.object({
  license_number: Joi.string().min(5).max(30).required(),
  license_expiry: Joi.string().isoDate().required(),
  id_card_number: Joi.string().min(5).max(30).required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100)
});

module.exports = { kycSchema, updateProfileSchema };