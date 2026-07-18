const joi = require("joi");

const idSchema = joi.object({
  params: joi.object({
    id: joi.string().hex().required(),
  }),
});
const getConnectionsSchema = joi.object({
  query: joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    status: joi.string().valid("pending", "accept", "reject").optional(),
  }),
});

const getSuggestionsSchema = joi.object({
  query: joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
  }),
});

module.exports = {
  idSchema,
  getConnectionsSchema,
  getSuggestionsSchema,
};
