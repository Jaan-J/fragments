// src/routes/api/get.js
const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;
const { Fragment } = require('../../model/fragment.js');
/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // print the request body
  console.log(req.params);
  if(!req.params.id && !req.query.expand) {
    try {
      Fragment.byUser(req.user, false).then((fragments) => {
      res.send(createSuccessResponse({fragments,}));
      });
    } catch (err) {
      res.status(404).json(createErrorResponse(err));
    }
    return;
  }
  if(req.query.expand) {
    try {
      Fragment.byUser(req.user, true).then((fragments) => {
      res.send(createSuccessResponse({fragments,}));
      });
    } catch (err) {
      res.status(404).json(createErrorResponse(err));
    }
    return;
  }
  if(req.params.id && !req.query.expand) {
  Fragment.byId(req.user, req.params.id).then((fragment) => {
    res.json(createSuccessResponse(fragment));
  });
  return;
  }
};
