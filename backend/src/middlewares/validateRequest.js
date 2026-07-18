const validate = (schema) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: false,
        },
      },
    };
    const { body, params, query } = req;
    const validBody = { body, params, query };
    const { error, value } = schema.validate(validBody, options);
    if (error) {
      const errors = error.details.map((detail) => ({
        path: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors,
      });
    }
    req.query = value.query;
    req.body = value.body;
    req.params = value.params;
    next();
  };
};

module.exports = validate;
