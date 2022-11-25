// src/routes/api/get.js
const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;
const { Fragment } = require('../../model/fragment.js');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    Fragment.byUser(req.user, false).then((fragments) => {
      res.send(createSuccessResponse({ fragments }));
    });
  } catch (err) {
    res.status(404).json(createErrorResponse(err));
  }
  return;
};
