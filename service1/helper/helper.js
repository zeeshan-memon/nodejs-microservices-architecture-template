const cryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const axios = require('axios');
const moment = require('moment');
const roundTo = require('round-to');

exports.errorMessage = (error) => {
  console.log(
    `|======================= TIMESTAMP ${new Date()}========================|`
  );
  console.log(error);
  console.log("|======================== ERROR  END  =======================|");
  if (this.toBoolean(process.env.ENCRYPTION)) {
    return {
      data: this.encryptData({
        status: false,
        response: null,
        error: errorMessage(error),
      }),
    };
  } else {
    return {
      status: false,
      response: null,
      error: errorMessage(error),
    };
  }
};

exports.SuccessMessage = (response) => {
  if (this.toBoolean(process.env.ENCRYPTION)) {
    return {
      data: this.encryptData({
        status: true,
        response: response,
        error: null,
      }),
    };
  } else {
    return {
      status: true,
      response: response,
      error: null,
    };
  }
};

exports.toBoolean = (text) => {
  return text === "true" ? true : false;
};

exports.encryptData = (data) => {
  const key = cryptoJS.enc.Utf8.parse(process.env.ENCRYPTIONKEY);
  const iv = cryptoJS.enc.Utf8.parse(process.env.ENCRYPTIONIV);
  return cryptoJS.AES.encrypt(JSON.stringify(data), key, { iv: iv });
};

exports.decryptData = (data) => {
  const key = cryptoJS.enc.Utf8.parse(process.env.ENCRYPTIONKEY);
  const iv = cryptoJS.enc.Utf8.parse(process.env.ENCRYPTIONIV);
  const bytes = cryptoJS.AES.decrypt(data, key, { iv: iv });
  return JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
};

exports.statusMessages = {
  account_hold: "Your account is on hold.",
  fields_missing: "Required field missing.",
  already_registered: "Account already registered.",
  unauthorized_request: "Unauthorized Request.",
  authentication_failed: "Authentication failed.",
  incorrect_user_password: "Incorrect user name or password.",
  incorrect_email_password: "Incorrect email or password.",
  not_found: "No Record Found.",
  token_not_provided: "No token provided.",
  password_reset: "Please check you mail.",
  password_updated: "Password Updated.",
  incorrect_password: "Incorrect old password.",
  already_Exist: " already Exist",
  parameter_Missing: "Request Parameter Missing",
  unable_to_delete: "Unable to delete, already in use somewhere",
  invalid_id: "You have provided an invalid id ",
  on_hold: "Your account is on hold.",
  not_approved:
    "Your profile is not approved. Please contact System Administrator",
  account_not_found: "Unable to find this account.",
  orderDetails_Missing: "Please fill order details",
};

/**
 * ===================================================================================================================
 * General Method which handle mongoose validators and general exception errors
 * ===================================================================================================================
 */

const errorMessage = (e) => {
  /* istanbul ignore next */
  if (e.msg && e.param) {
    return `${e.msg}: ${e.param} `;
  } else if (e.code && e.code === 11000) {
    const key = Object.keys(e.keyValue)[0];
    let fieldName = key.replace(".", " ");
    return `${fieldName} ${this.statusMessages.already_Exist} : ${e.keyValue[key]}`;
  } else if (
    e.errors &&
    e.errors[Object.keys(e.errors)[0]].name == "CastError"
  ) {
    return `${this.statusMessages.invalid_id} ${Object.keys(
      e.errors
    )[0].replace(".", " ")}`;
  } else if (
    e.errors &&
    e.errors[Object.keys(e.errors)[0]].properties.type == "required"
  ) {
    return `${this.statusMessages.fields_missing} ${Object.keys(
      e.errors
    )[0].replace(".", " ")}`;
  } else if (e.name && e.name == "CastError") {
    return `${this.statusMessages.invalid_id}: ${e.value}`;
  } else if (e.message) {
    return e.message;
  } else {
    return e;
  }
};

/**
 * ===================================================================================================================
 * General Method for getting mail configuration.
 * ===================================================================================================================
 */

let mailConfig = {
  name: "mail.test.com",
  host: process.env.SMTP,
  port: process.env.EMAILPORT,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

/**
 * ===================================================================================================================
 * General Method for sending email through node mailer.
 * ===================================================================================================================
 */

exports.sendEmail = (obj) => {
  return new Promise((resolve, reject) => {
    try {
      let mail = nodemailer.createTransport(mailConfig);
      mail.sendMail(
        {
          from: `'test'<${process.env.EMAIL}>`,
          to: obj.Recipients,
          subject: obj.Subject,
          html: obj.message,
          cc: obj.CC,
        },
        (err, info) => {
          return err ? reject(err) : resolve(info);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * ===================================================================================================================
 * General Method to convert string to mongoose Object
 * ===================================================================================================================
 */

exports.toMongooseObjectId = (e) => {
  return mongoose.Types.ObjectId(e);
};

/**
 * ===================================================================================================================
 * General Method to get the response from the axios
 * ===================================================================================================================
 */

 exports.axios = (url, req, httpMethod, serviceName, data) => {
  const options = {
    method: httpMethod,
    headers: {
      'content-type': 'application/json',
      authorization: req.headers['authorization'],
    },
    url,
  };

  if (data) {
    options.data = (boolean(process.env.ENCRYPTION)) ? {
      d: encodeObject(data)
    } : data
  }

  return new Promise((resolve, reject) => {
    axios(options)
      .then(function (response) {
        // console.log("response.data.d", response.data.d)

        if (boolean(process.env.ENCRYPTION))
          response = decodeObject(response.data.d);
        else
          response = response.data

        // console.log("response", response)

        if (response.status) {
          resolve(response.response);
        } else {
          reject(`Encountered an error from ${serviceName} : ${response.error}`)
        }
      })
      .catch(function (error) {
        error.message = `${serviceName} unable to establish the connection: ${error}`
        reject(error);
      });
  });
};

/**
 * ===================================================================================================================
 * Method to get the start time of the date
 * ===================================================================================================================
 */

 exports.startTimeOfDate = (time, date) => {
  if (date) {
    return moment(new Date(date)).startOf(time).toDate();
  } else {
    return moment().startOf(time).toDate();
  }
};

/**
 * ===================================================================================================================
 * Method to get the end time of the date
 * ===================================================================================================================
 */

 exports.endTimeOfDate = (time, date) => {
  if (date) {
    return moment(new Date(date)).endOf(time).toDate();
  } else {
    return moment().endOf(time).toDate();
  }
};

/**
 * ===================================================================================================================
 * General Method for round off the decimal value.
 * ===================================================================================================================
 */

 exports.round = (value) => {
  value = parseFloat(value);
  value = roundTo(value, 4).toFixed(4)
  return parseFloat(value);
}

/**
 * ===================================================================================================================
 * General Method for round off the decimal value.
 * ===================================================================================================================
 */

exports.roundWithTwoDecimal = (value) => {
  value = parseFloat(value);
  value = roundTo(value, 4)
  return value.toFixed(2);
}

/**
 * ===================================================================================================================
 * General Method for fix the decimal value.
 * ===================================================================================================================
 */

exports.fix = (value) => {
  value = parseFloat(value).toFixed(4)
  return value;
}

/**
 * ===================================================================================================================
 * General Method to remove milliseconds from time object.
 * ===================================================================================================================
 */

exports.removeMilliseconds = (dt) => {
  let date = new Date(dt)
  date.setMilliseconds('000')
  return date;
}
