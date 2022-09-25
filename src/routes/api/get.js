// src/routes/api/get.js
const createSuccessResponse = require('../../response').createSuccessResponse;

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  res.send(createSuccessResponse({ fragments: [] }));
};
