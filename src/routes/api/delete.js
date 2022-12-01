// src/routes/api/delete.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const Fragment = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    logger.debug({ ownerId: req.user, Id: req.params.id }, 'DELETE /fragments/:id');
    await Fragment.delete(req.user, req.params.id);
    res.status(200).json(createSuccessResponse());
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
