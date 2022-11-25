// src/routes/api/get-metadata-expanded.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user, true);
    logger.debug({ fragments }, 'GET /fragments/?expand=1');
    res.status(200).json(createSuccessResponse({ fragments }));

  } catch (err) {
    res.status(404).json(createErrorResponse(err));
  }
  return;
};
