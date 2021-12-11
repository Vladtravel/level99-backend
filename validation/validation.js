const Joi = require("joi");
const { HttpCode } = require("../service/constants");

const schemaValidateAuth = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

const validate = (schema, obj, next) => {
  const { error } = schema.validate(obj);
  if (error) {
    return next({
      status: HttpCode.BAD_REQUEST,
      message: "Bad request",
    });
  }
  next();
};

const validateAuth = (req, _res, next) => {
  return validate(schemaValidateAuth, req.body, next);
};

module.exports = {
  validateAuth,
};
