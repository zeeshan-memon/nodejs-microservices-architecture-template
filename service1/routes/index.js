const tokenValidation = require("../helper/middleware").tokenValidation;
const decodeBody = require("../helper/middleware").decode;

module.exports = (router) => {
  require("./users")(router, tokenValidation, decodeBody);
};
