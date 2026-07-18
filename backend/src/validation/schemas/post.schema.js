const joi = require("joi");

const objectId = joi.string().hex().length(24);

const createPostSchema = joi.object({
  body: joi.object({
    title: joi.string().min(3).max(100).required(),
    content: joi.string().min(1).required(),
  }),
});

const updatePostSchema = joi.object({
  params: joi.object({
    id: joi.string().hex().required(),
  }),
  body: joi.object({
    title: joi.string().min(3).max(100).optional(),
    content: joi.string().min(1).optional(),
    removeImage: joi.boolean().optional(),
  }),
});

const postIdSchema = joi.object({
  params: joi.object({
    id: joi.string().hex().required(),
  }),
});

const commentPostSchema = joi.object({
  params: joi.object({
    id: joi.string().hex().required(),
  }),
  body: joi.object({
    text: joi.string().trim().min(1).required(),
  }),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  commentPostSchema,
};