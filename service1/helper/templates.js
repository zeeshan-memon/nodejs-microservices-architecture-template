const helperSvc = require("./helper");
module.exports = {
  emailVerification: (userName, varificationLink) => {
const template = `<!DOCTYPE html>
 <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Hey Karry</title>
  </head>
  <body style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif">
    <section
      style="margin: 0 auto; width: 100%; max-width: 600px; display: block">
      <div
        style="
          margin: 0 auto;
          padding: 30px 0 40px;
          display: block;
          box-sizing: border-box;
        ">
        <img
          src="${process.env.LOGO}"
          style="
            width: 100px;
            height: 100px;
            margin: 0 0 15px 0;
            padding-right: 30px;
            padding-left: 30px;
          "/>
        <h1 style="font-size: 30px; padding-right: 30px; padding-left: 30px">
          Welcome to Hey Karry!
        </h1>
        <p style="font-size: 17px; padding-right: 30px; padding-left: 30px">
          Dear ${userName}, Your account has been recently created on
          <strong>Hey Karry</strong>. Please Click
          <a href="${varificationLink}">here</a> to verify your Account.
          <br />
          <br />
          If the above link does not work please copy below Url and paste it on
          your address bar. ${varificationLink}
        </p>
      </div>
    </section>
  </body>
</html>
      `;
      return template;
  },
};
