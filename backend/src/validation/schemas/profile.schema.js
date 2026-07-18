const joi = require("joi");

const objectId = joi.string().hex().length(24);

const updateProfileSchema = joi.object({
  body: joi.object({
    name: joi.string().min(3).max(30).optional(),
    bio: joi.string().max(500).optional(),
    skills: joi.string().optional(),
    education: joi.string().optional(),
    experience: joi.string().optional(),
  }),
});

const userProfileSchema = joi.object({
  params: joi.object({
    id: joi.string().hex().required(),
  }),
});

module.exports = {
  updateProfileSchema,
  userProfileSchema,
};