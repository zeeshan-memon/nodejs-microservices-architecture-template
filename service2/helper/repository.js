"use strict";

exports.get = (
  model,
  query,
  isSingle,
  selectParams,
  sortParams,
  limit,
  isDeleted,
  skip,
  isLean = false
) => {
  /* istanbul ignore next */
  return new Promise((resolve, reject) => {
    if (!isDeleted) query.isDeleted = false;
    if (isSingle) {
      model
        .findOne(query)
        .select(selectParams || "")
        .lean(isLean)
        .exec((error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
    } else {
      /* istanbul ignore next */
      model
        .find(query)
        .select(selectParams || "")
        .sort(sortParams || "")
        .skip(skip)
        .limit(limit)
        .lean(isLean)
        .exec((error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
    }
  });
};

exports.save = (model, saveObj) => {
  return new Promise((resolve, reject) => {
    new model(saveObj).save((error, doc) => {
      if (error) {
        reject(error);
      } else {
        resolve(doc);
      }
    });
  });
};

exports.update = (model, query, updateData, isSingle) => {
  return new Promise((resolve, reject) => {
    model.updateMany(query, updateData, (error, doc) =>
      error ? reject(error) : resolve(doc)
    );
  });
};

/* istanbul ignore next */
exports.delete = (model, query) => {
  return new Promise((resolve, reject) => {
    model.remove(query, (error, doc) => {
      if (error) {
        reject(error);
      } else {
        resolve(doc);
      }
    });
  });
};

/* istanbul ignore next */
exports.register = (model, data) => {
  return new Promise((resolve, reject) => {
    const obj = new model(data);
    obj.password = data.password
      ? obj.generateHash(data.password)
      : obj.password;
    obj.save((error, doc) => {
      if (error) {
        reject(error);
      } else {
        resolve(doc);
      }
    });
  });
};

/* istanbul ignore next */
exports.aggregate = (model, query, isStringSort) => {
  return new Promise((resolve, reject) => {
    if (isStringSort) {
      model.aggregate(
        query,
        {
          collation: {
            locale: "en_US",
            numericOrdering: true,
          },
        },
        (error, doc) => {
          if (error) {
            reject(error);
          } else {
            resolve(doc);
          }
        }
      );
    } else {
      model.aggregate(query, (error, doc) => {
        if (error) {
          reject(error);
        } else {
          resolve(doc);
        }
      });
    }
  });
};

/* istanbul ignore next */
exports.count = (model, query, isDeleted) => {
  return new Promise((resolve, reject) => {
    if (!isDeleted) query.isDeleted = false;
    model.countDocuments(query, (error, c) => {
      if (error) {
        reject(error);
      } else {
        resolve(c);
      }
    });
  });
};

/* istanbul ignore next */
exports.saveMany = (model, saveObj) => {
  return new Promise((resolve, reject) => {
    model.insertMany(saveObj, (error, doc) => {
      if (error) {
        reject(error);
      } else {
        resolve(doc);
      }
    });
  });
};
