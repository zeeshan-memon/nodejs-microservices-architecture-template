const jwt = require("jsonwebtoken");
const helper = require("./helper");
const { check } = require("express-validator");

exports.tokenValidation = (req, res, next) => {
  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "local") {
    next();
  } else {
    try {
      const token = req.headers["authorization"];
      jwt.verify(token, process.env.ENCRYPTIONKEY, (err, decode) => {
        if (err) {
          return res
            .status(200)
            .json(helper.statusMessages.authentication_failed);
        }
        req.session = decode;
        next();
      });
    } catch (error) {}
  }
};

/**
 * ===================================================================================================================
 * Middleware to decode objects provided in the body.
 * ===================================================================================================================
 */

exports.decode = (req, res, next) => {
  if (!helper.toBoolean(process.env.ENCRYPTION)) {
    next();
  } else {
    try {
      if (helper.toBoolean(process.env.ENCRYPTION) && req.body && req.body.d)
        req.body = helper.decryptData(req.body.d);
      next();
    } catch (error) {
      return res.status(200).json(helper.errorMessage(error));
    }
  }
};

/**
 * ===================================================================================================================
 * Middleware to validate accounts field provided in the body for create.
 * ===================================================================================================================
 */

exports.accountValidations = async (req, res, next) => {
  await check("user")
    .exists()
    .withMessage(`${helper.statusMessages.fields_missing} user`)
    .run(req);

  await check("email")
    .isEmail()
    .withMessage("You have provided an invalid Email")
    .run(req);

  await check("firstName")
    .isLength({ max: 40, min: 4 })
    .withMessage("Length must be between 4 to 40 characters of Name")
    .not()
    .matches(/\d/)
    .withMessage("Name only accept Characters")
    .not()
    .matches(/[!@#$%^&*()_+\-=\[\]{};':'\\|,.<>\/?]+/)
    .withMessage("Name only accept Characters")
    .run(req);

  next();
};

/**
 * ===================================================================================================================
 * Middleware to validate accounts field provided in the body for update.
 * ===================================================================================================================
 */

exports.accountUpdateValidations = async (req, res, next) => {
  if (req.body.password !== undefined) {
    await check("password")
      .isLength({ min: 6 })
      .withMessage("Length must be greater than 5 of Password")
      .matches(/\d/)
      .withMessage("Require atleast one numeric character in Password")
      .matches(/[!@#$%^&*()_+\-=\[\]{};':'\\|,.<>\/?]+/)
      .withMessage("Require atleast one special character in Password")
      .run(req);
  }

  await check("user")
    .exists()
    .withMessage(`${helper.statusMessages.fields_missing} user`)
    .run(req);

  if (req.body.email !== undefined) {
    await check("email")
      .isEmail()
      .withMessage("You have provided an invalid Email")
      .run(req);
  }

  if (req.body.firstName !== undefined) {
    await check("firstName")
      .not()
      .matches(/\d/)
      .withMessage("Name only accept Characters ")
      .not()
      .matches(/[!@#$%^&*()_+\-=\[\]{};':'\\|,.<>\/?]+/)
      .withMessage("Name only accept Characters")
      .run(req);
  }
  next();
};

/**
 * ===================================================================================================================
 * Middleware to validate email and password.
 * ===================================================================================================================
 */

exports.loginValidations = async (req, res, next) => {
  await check("email")
    .exists()
    .withMessage(helper.statusMessages.fields_missing)
    .isEmail()
    .withMessage("You have provided an Invalid")
    .run(req);

  await check("password")
    .exists()
    .withMessage(helper.statusMessages.fields_missing)
    .run(req);

  next();
};
