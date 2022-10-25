const helper = require("../helper/helper");
const repository = require("../helper/repository");
const templates = require("../helper/templates");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

module.exports = {
  /**
   * ===================================================================================================================
   * Request for crete new Account. like crete new profile of karry, fleet provider, merchant, crm admin, etc. This
   * Request set admin123 as default password and generate a JWT token and send in the user email to varify his email
   * and set first password because hey karry dont allow users to sign up .
   * ===================================================================================================================
   */
  create: (req, res) => {
    fnCreateUser(req, res);
  },

  /**
   * ===================================================================================================================
   * Request for getting the  list or single user account. client can also pass query string in the requets . Also
   * client can pass account_id in parameter to get single account's data. This Request will never return password
   * fields present in an account.
   * ===================================================================================================================
   */
  get: async (req, res) => {
    fnGetUser(req, res);
  },

  /**
   * ===================================================================================================================
   * General Request for update fields in a perticular account. The request is also used to update first password set by
   * the account user after emaiil varification.
   * ===================================================================================================================
   */
  update: (req, res) => {
    fnUpdateUser(req, res);
  },

  /**
   * ===================================================================================================================
   * Request to delete an account. This request will update isDeleted Field in a perticular account.
   * ===================================================================================================================
   */

  delete: (req, res) => {
    fnDeleteUser(req, res);
  },

  /**
   * ===================================================================================================================
   * Request for login to the system from web that means users with role not equal to karry can use this request to login.
   * ===================================================================================================================
   */

  login: (req, res) => {
    fnLogin(req, res);
  },
  
};

const fnCreateUser = async (req, res) => {
  try {
    //Error catch for the Express Validator
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json(helper.errorMessage(errors.array()[0]));
    }
    let body = req.body;
    body.email = body.email.toLowerCase();
    const user = new userModel();
    const new_password = body.password;
    body.password = user.generateHash(new_password);
    const data = await repository.register(userModel, body);
    const obj = {
      _id: data._id,
      name: data.userName,
      email: data.email,
    };

    jwt.sign(
      obj,
      process.env.secret,
      {
        expiresIn: process.env.expirytime,
      },
      async (error, token) => {
        if (error) return res.status(200).json(helper.errorMessage(error));
        const message = {
          Recipients: body.email,
          Subject: "Email Verification",
          message: templates.emailVerification(
            obj.userName,
            process.env.LINK + "/#/verify/" + data._id + "/" + token
          ),
        };
        await helper.sendEmail(message);
        return res.status(200).json(helper.SuccessMessage(data));
      }
    );
  } catch (error) {
    return res.status(200).json(helper.errorMessage(error));
  }
};

const fnGetUser = async (req, res) => {
  try {
    let isSingle = false;
    let query = req.query ? req.query : {};

    if (req.params && req.params.id) {
      query = {
        _id: req.params.id,
      };
      isSingle = true;
    }

    let data = await repository.get(
      userModel,
      query,
      isSingle,
      "-__v -password ",
      "-createdAt",
      null,
      null,
      null,
      true
    );

    return res.status(200).json(helper.statusMessages(data));
  } catch (error) {
    return res.status(200).json(helper.errorMessage(error));
  }
};

const fnUpdateUser = async (req, res) => {
  try {
    //Error catch for the Express Validator
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json(helper.errorMessage(errors.array()[0]));
    }

    if (req.params && req.params.id) {
      let body = req.body;
      let query = {
        _id: req.params.id,
      };
      let updateReason = body.reason ? body.reason : "";

      const user = await repository.get(
        userModel,
        query,
        true,
        "isAdmin email userName",
        null,
        null,
        null,
        null,
        true
      );

      if (!user) {
        return res
          .status(200)
          .json(helper.errorMessage(helper.statusMessages.account_not_found));
      }

      //Update
      const data = await repository.update(userModel, query, body);

      return res.status(200).json(helper.SuccessMessage(data));
    } else {
      return res
        .status(200)
        .json(helper.errorMessage(helper.statusMessages.parameter_Missing));
    }
  } catch (error) {
    return res.status(200).json(helper.errorMessage(error));
  }
};

const fnDeleteUser = async (req, res) => {
  try {
    if (req.params && req.params.id) {
      let body = {
        isDeleted: true,
      };
      let query = {
        _id: req.params.id,
      };
      let user = await repository.get(
        userModel,
        query,
        true,
        "_id userName",
        null,
        null,
        null,
        null,
        true
      );

      if (!user) {
        return res.status(200).json(helper.errorMessage("User Not Found"));
      }

      let data = await repository.update(
        userModel,
        { _id: req.params.id },
        body
      );

      return res.status(200).json(helper.SuccessMessage(data));
    } else {
      return res
        .status(200)
        .json(helper.error_message(helper.statusMessages.parameter_Missing));
    }
  } catch (error) {
    return res.status(200).json(helper.errorMessage(error));
  }
};

const fnLogin = async (req, res) => {
  try {
    let body = req.body;
    //Error catch for the Express Validator
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json(helper.errorMessage(errors.array()[0]));
    }

    let query = {
      email: body.email.toLowerCase(),
    };

    const user = await repository.get(
      userModel,
      query,
      true,
      "_id isAdmin userName email password"
    );
    if (!user) {
      return res
        .status(200)
        .json(helper.errorMessage(helper.statusMessages.account_not_found));
    } else if (user) {
      bcrypt.compare(body.password, user.password, (err, result) => {
        if (result) {
          let data = {
            _id: user._id,
            email: user.email,
          };
          let temp = {};

          jwt.sign(
            data,
            process.env.secret,
            // {
            //   expiresIn: process.env.expirytime,
            // },
            async (error, token) => {
              if (error)
                return res.status(200).json(helper.errorMessage(error));
              temp.isAdmin = user.isAdmin;
              temp.userName = user.userName;
              temp.token = token;
              temp.email = user.email;

              if (helper.toBoolean(process.env.IsMONIT))
                return res.status(200).json(helper.SuccessMessage(temp));
            }
          );
        } else {
          if (helper.toBoolean(process.env.IsMONIT))
            return res
              .status(200)
              .json(
                helper.errorMessage(
                  helper.statusMessages.incorrect_user_password
                )
              );
        }
      });
    }
  } catch (error) {
    return res.status(200).json(helper.errorMessage(error));
  }
};
