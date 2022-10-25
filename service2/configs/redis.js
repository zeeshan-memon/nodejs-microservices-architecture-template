"use strict";
let client = null;

module.exports.initRedis = async (inclient) => {
  client = inclient;
  client.on("connect", () => console.log("redis connected"));
  client.on("error", (data) => console.log(data));
  client.on("ready", () => console.log("redis ready"));
  client.on("reconnecting", () => console.log("redis reconnecting"));
  client.on("end", () => console.log("redis connection has been closed"));
  client.on("warning", () => console.log("redis warning"));
  //making redis connection
  await client.connect();
};

module.exports.redis = {

  get: (key) => {
    try {
      return new Promise(async (resolve, reject) => {
        let res = key.toString().split("-")[0]
          ? key.toString().split("-")[0]
          : key;
        let reply = await client.get(key.toString());

        return reply ? resolve(JSON.parse(reply)) : reject(res + " not found");
      });
    } catch (e) {
      console.log("error in redis", "get", e);
      reject(e);
    }
  },

  remove: (key) => client.del(key.toString()),

  getFieldsWithMatch: (pattern) => {
    return new Promise((resolve, reject) => {
      client
        .scan(0, { MATCH: `${pattern}*`, COUNT: 10000 })
        .then((res) => {
          console.log("getFieldsWithMatchRES");
          console.log(res);
          if (res.keys.length > 0) {
            client
              .mGet(res.keys)
              .then((values) => {
                console.log("getFieldsWithMatchRES");
                console.log(
                  JSON.parse(`'[${values}]'`.toString().replace(/\'/g, ""))
                );
                resolve(
                  JSON.parse(`'[${values}]'`.toString().replace(/\'/g, ""))
                );
              })
              .catch((e) => reject(e));
          } else {
            resolve([]);
          }
        })
        .catch((e) => reject(e));
    });
  },

  set: (key, data) => {
    try {
      return new Promise(async (resolve, reject) => {
        let reply = await client.set(key.toString(), JSON.stringify(data));
        return reply == "OK" ? resolve(reply) : reject(reply);
      });
    } catch (e) {
      console.log("error in redis", "set", e);
      reject(e);
    }
  },

  getMany: (keys) => {
    try {
      return new Promise((resolve, reject) => {
        if (keys.length > 0) {
          try {
            client
              .mGet(keys)
              .then((values) => {
                return resolve(
                  JSON.parse(`'[${values}]'`.toString().replace(/\'/g, ""))
                );
              })
              .catch((e) => {
                return reject(e);
              });
          } catch (e) {
            return reject(e);
          }
        } else {
          return resolve([]);
        }
      });
    } catch (e) {
      console.log("error in redis", "getMany", e);
      reject(e);
    }
  },
};
