const mongoose = require("mongoose");

const options = {
    maxPoolSize:10
}

module.exports = mongoose.connect(process.env.DB_URI, options).catch(err=>console.log("error", err));

// calls when mongoose is connected successfully
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection is open');
  });
  // calls when mongoose throws error
   /* istanbul ignore next */
  mongoose.connection.on('error', function (err) {
    /* istanbul ignore next */
    console.log('Mongoose default connection has occured ' + err + ' error');
  });
  // calls when mongoose is disconnected with any reason
  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection is disconnected');
  });
