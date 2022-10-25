const helper = require("../helper/helper");
const sequelize = require("../configs/sequelize");

module.exports.get = async (
  model,
  query,
  isSingle,
  select,
  orderBy,
  include,
  transaction,
  groupBy,
  offset,
  limit,
  isdeleted
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!isdeleted) query.isDeleted = false;

      let queryOptions = {
        where: query,
        attributes: select,
        order: [orderBy || ["id", "DESC"]],
        offset: offset,
        limit: limit,
        group: groupBy,
        transaction: transaction || null,
        include: include || null,
      };
      if (isSingle)
        model
          .findOne(queryOptions)
          .then((data) => resolve(JSON.parse(JSON.stringify(data))))
          .catch((err) => reject(err));
      else
        model
          .findAll(queryOptions)
          .then((data) => resolve(JSON.parse(JSON.stringify(data))))
          .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.get");
      reject(e);
    }
  });
};

exports.count = (model, query, transaction, isdeleted) => {
  return new Promise((resolve, reject) => {
    try {
      if (!isdeleted) query.isDeleted = false;
      model
        .count({
          where: query,
          transaction: transaction || null,
        })
        .then((c) => resolve(c))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.count");
      reject(e);
    }
  });
};

//column='age'
exports.sum = (model, column, query, transaction, isdeleted) => {
  return new Promise((resolve, reject) => {
    try {
      if (!isdeleted) query.isDeleted = false;
      model
        .sum(column, {
          where: query,
          transaction: transaction || null,
        })
        .then((c) => resolve(c))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.sum");
      reject(e);
    }
  });
};

//column='age'
exports.min = (model, column, query, transaction, isdeleted) => {
  return new Promise((resolve, reject) => {
    try {
      if (!isdeleted) query.isDeleted = false;
      model
        .min(column, {
          where: query,
          transaction: transaction || null,
        })
        .then((c) => resolve(c))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.min");
      reject(e);
    }
  });
};

//column='age'
exports.max = (model, column, query, transaction, isdeleted) => {
  return new Promise((resolve, reject) => {
    try {
      if (!isdeleted) query.isDeleted = false;
      model
        .max(column, {
          where: query,
          transaction: transaction || null,
        })
        .then((c) => resolve(c))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.max");
      reject(e);
    }
  });
};

module.exports.query = async (query) => {
  return new Promise((resolve, reject) => {
    try {
      sequelize
        .query(query)
        .then(([results, metadata]) => resolve(results))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.max");
      reject(e);
    }
  });
};

module.exports.save = async (model, record, transaction, multiple) => {
  return new Promise((resolve, reject) => {
    try {
      if (multiple)
        model
          .bulkCreate(record, {
            transaction: transaction || null,
          })
          .then((data) => resolve(data))
          .catch((err) => reject(err));
      else
        model
          .create(record, {
            transaction: transaction || null,
          })
          .then((data) => resolve(data))
          .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.save");
      reject(e);
    }
  });
};

module.exports.saveRoutes = async (model, record, transaction, multiple) => {
  return new Promise((resolve, reject) => {
    try {
      if (multiple)
        model
          .bulkCreate(record, {
            transaction: transaction || null,
            updateOnDuplicate: ["scheduleId"],
          })
          .then((data) => resolve(data))
          .catch((err) => reject(err));
      else
        model
          .create(record, {
            transaction: transaction || null,
          })
          .then((data) => resolve(data))
          .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.save");
      reject(e);
    }
  });
};
module.exports.update = async (model, query, updatedData, transaction) => {
  return new Promise((resolve, reject) => {
    try {
      model
        .update(updatedData, {
          transaction: transaction || null,
          returning: true,
          where: query,
        })
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.update");
      reject(e);
    }
  });
};

module.exports.upsert = async (model, query, updatedData, transaction) => {
  return new Promise((resolve, reject) => {
    try {
      model
        .upsert(updatedData, {
          transaction: transaction || null,
          returning: true,
          where: query,
        })
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.update");
      reject(e);
    }
  });
};

module.exports.delete = async (model, query, transaction) => {
  return new Promise((resolve, reject) => {
    try {
      model
        .update(
          {
            isDeleted: true,
            deletedat: helper.getTimeStampWithoutMilliseconds(),
          },
          {
            where: query,
            transaction: transaction || null,
          }
        )
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.delete");
      reject(e);
    }
  });
};

module.exports.remove = async (model, query, transaction) => {
  return new Promise((resolve, reject) => {
    try {
      model
        .destroy({
          where: query,
          transaction: transaction || null,
        })
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    } catch (e) {
      helper.log(e, "db.remove");
      reject(e);
    }
  });
};
