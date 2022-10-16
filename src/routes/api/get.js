// src/routes/api/get.js
const createSuccessResponse = require('../../response').createSuccessResponse;
const { Fragment } = require('../../model/fragment.js');
/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  if(!req.params.id){
    res.send(createSuccessResponse({ fragments: [] }));
    return
  }
  Fragment.byId(req.user, req.params.id).then((fragment) => {
    res.json(createSuccessResponse(fragment));
  });
};
