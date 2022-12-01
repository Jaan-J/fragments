// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const Fragment = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    if (req.query.expand === '1') {
      const fragments = await Fragment.byUser(req.user, true);
      logger.debug({ fragments }, 'GET /fragments');
      res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragments.id}`);
      res.status(200).json(createSuccessResponse({ fragments }));
      return;
    }
    const fragments = await Fragment.byUser(req.user);
    logger.debug({ fragments }, 'GET /fragments');
    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragments.id}`);
    res.status(200).json(createSuccessResponse({ fragments }));
    return;
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
