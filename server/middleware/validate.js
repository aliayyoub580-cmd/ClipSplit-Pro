/**
 * Validation helper.
 *
 * Wraps express-validator's validationResult to send a consistent
 * 422 response when any field fails validation.
 *
 * Usage:
 *   router.post("/", [...validationChain], validate, handler);
 */

const { validationResult } = require("express-validator");

/**
 * Middleware that reads express-validator errors and short-circuits
 * with a 422 if any validation failed.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: "Validation failed.",
      details: errors.array().map((e) => ({
        field: e.path || e.param,
        message: e.msg,
      })),
    });
  }
  next();
}

module.exports = { validate };
