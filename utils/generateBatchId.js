import IncomingMaterial from "../models/incomingModel.js";

export const generateBatchId = async () => {
  const date = new Date();

  // Format date as DDMMYYYY (no dashes)
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}${date.getFullYear()}`;

  // Find the latest batch with today's date (regex: VFDDMMYYYY)
  const lastBatch = await IncomingMaterial.findOne({
    batchId: { $regex: `^VF${formattedDate}` },
  }).sort({ createdAt: -1 });

  let nextSerial = 1;

  if (lastBatch) {
    const lastSerial = parseInt(lastBatch.batchId.slice(-3)); // last 3 digits are serial
    nextSerial = lastSerial + 1;
  }

  // Construct new batchId
  const batchId = `VF${formattedDate}${String(nextSerial).padStart(3, "0")}`;

  return batchId;
};
