// src/routes/api/get.js
const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment.js');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    //return all fragments with metadata for the current user if expand is true
    if (req.query.expand === '1') {
      Fragment.byUser(req.user, true).then((fragments) => {
        res.send(createSuccessResponse({ fragments }));
      });
      return;
    }
    Fragment.byUser(req.user, false).then((fragments) => {
      res.send(createSuccessResponse({ fragments }));
    });
  } catch (err) {
    res.status(404).json(createErrorResponse(err));
  }
  return;
};
