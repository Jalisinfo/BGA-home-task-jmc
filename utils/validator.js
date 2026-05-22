const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidAddress = (address) => isNonEmptyString(address);

const isValidTimestamp = (timestamp) => {
  const ts = Number(timestamp);
  return Number.isFinite(ts) && ts > 0;
};

const isValidAmount = (amount) => {
  const parsed = parseFloat(amount);
  return !isNaN(parsed) && isFinite(parsed) && parsed > 0;
};

const sanitizeAddress = (address) => String(address).trim();
const sanitizeSignature = (signature) =>String(signature).trim(); 

const sanitizeAmount = (amount) => parseFloat(amount);

const sanitizeTimestamp = (timestamp) => {
  const ts = Number(String(timestamp).trim());
  return Number.isFinite(ts) ? ts : NaN;
};

module.exports = {
  isNonEmptyString,
  isValidAddress,
  isValidTimestamp,
  isValidAmount,
  sanitizeAddress,
  sanitizeAmount,
  sanitizeSignature,
  sanitizeTimestamp,
};
