const History = require("../models/History");

const saveHistory = async (batchId, model, action, data, updatedBy) => {
  await History.create({ batchId, model, action, data, updatedBy });
};

module.exports = saveHistory;
