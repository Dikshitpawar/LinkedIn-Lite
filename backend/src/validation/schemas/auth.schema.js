const joi = require("joi");

const registerSchema = joi.object({
  body: joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  }),
});

const loginSchema = joi.object({
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  }),
});

module.exports = { registerSchema, loginSchema };
