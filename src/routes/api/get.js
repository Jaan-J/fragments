// src/routes/api/get.js
const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;
const { Fragment } = require('../../model/fragment.js');
/**
 * Get a list of fragments for the current user
 */

module.exports = (req, res) => {
  if (!req.params.id && !req.query.expand) {
    try {
      Fragment.byUser(req.user, false).then((fragments) => {
        res.send(createSuccessResponse({ fragments }));
      });
    } catch (err) {
      res.status(404).json(createErrorResponse(err));
    }
    return;
  }

  if (req.query.expand) {
    try {
      Fragment.byUser(req.user, true).then((fragments) => {
        res.send(createSuccessResponse({ fragments }));
      });
    } catch (err) {
      res.status(404).json(createErrorResponse(err));
    }
    return;
  }

  if (req.params.id && !req.query.expand) {
    if (req.originalUrl.endsWith('/info')) {
      try {
        Fragment.byId(req.user, req.params.id).then((fragment) => {
          res.json(createSuccessResponse(fragment));
        });
      } catch (err) {
        res.status(404).json(createErrorResponse(err));
      }
      return;
    }
    try {
      Fragment.byId(req.user, req.params.id).then((fragment) => {
        res.send(
          createSuccessResponse({
            'Content-Type': fragment.type,
            'Content-Length': fragment.size,
            data: fragment.data.toString(),
          })
        );
      });
    } catch (err) {
      res.status(404).json(createErrorResponse(err));
    }
    return;
  }
};
