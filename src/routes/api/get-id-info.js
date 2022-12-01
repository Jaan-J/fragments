// src/routes/api/get-id-info.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const Fragment = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, 'GET /fragments/:id/info');
    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
