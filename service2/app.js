require("dotenv").config({ path: `./env/.env.${process.env.NODE_ENV}` });
const express = require("express");
const app = express();
const server = require("http").Server(app);
require("./configs/mongoose");
require("./configs/express")(app);
const router = express.Router();
app.use("/api/v1", router);
require("./routes/index")(router);
require("./sequelizeRoutes/index")(router);
app.get("/working", (req, res) => {
  return res.status(200).send("Working!!");
});

// These are optionals
// const {createClient} = require('redis')
// const { createAdapter } = require("@socket.io/redis-adapter");

// const client = createClient({
//   url: `redis://:${process.env.REDIS_AUTH}@${process.env.REDISHOST}:${process.env.REDISPORT}`,
// });
// require('./config/redis').initRedis(client)
// //=========== Socket
// const io = require("socket.io")(server, {
//   pingInterval: 6000,
//   pingTimeout: 3000,
//   cookie: false,
//   origins: "*:*"
// });

// const subClient = client.duplicate();    
// require("./config/socket").init(io);
// subClient.connect().then(() => {
//   io.adapter(createAdapter(client, subClient));
// });
// subClient.on("error", (err) => {
//   console.log("subClient", err);
// })

server.listen(process.env.PORT, () =>
  console.log(`Server is running on ${process.env.PORT}`)
);
