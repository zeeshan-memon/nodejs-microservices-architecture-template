"use strict";

const jwt = require("jsonwebtoken");
let _io = null;

module.exports.init = (io) => {
  io.use((socket, next) => {
    let handshake = socket.handshake;
      if (handshake.query.token) {
        jwt.verify(
          handshake.query.token,
          process.env.secret,
          (err, decoded) => {
            if (err)
              next(
                new Error("Authentication failed or tocken has been expired")
              );
            socket.request.session = decoded;
            next();
          }
        );
      } else {
        socket.disconnect();
        next(new Error("Invalid Authentication"));
      }    
  });

  io.on("connection", async (socket) => {
      try {
        console.log("socket.request.session", socket.request.session);
        ocket.join(socket.request.session._id.toString())
      } catch (e) {
        console.log("ERROR in ", "socket connect", e);
      }
  
    socket.on("disconnect", async (data) => {
      console.log("Socket disconnect");
        try {
            socket.leave(socket.request.session._id.toString());
            socket.disconnect();
        } catch (e) {
          console.log("ERROR in ", "socket disconnect", e);
        }
      });
  });

  _io = io;
};


module.exports.customEmitData = async (userId, event, data) => {
  userId = userId.toString().trim();
  let req = {
    type: "Any",
    userId: userId,
    event: event,
    data: data,
  };
  _io.to(req.event.toString()).emit(event.toString(), req.data);
};
