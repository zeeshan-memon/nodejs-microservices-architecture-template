const controller = require("../sequelizeControllers/users");
const {
  accountValidations,
  accountUpdateValidations,
  loginValidations
} = require("../helper/middleware");
module.exports = (router, tokenValidation, decodeBody) => {
  router
    .route("/accounts/:id?")
    .get(tokenValidation, tokenValidation, decodeBody, controller.get)
    .post(accountValidations, decodeBody, controller.create)
    .put(accountUpdateValidations, tokenValidation, decodeBody, controller.update)
    .delete(tokenValidation, decodeBody, controller.delete);

  router.post("/login", loginValidations, controller.login);  
};
