const contentType = require('content-type');
const { Fragment } = require('../../model/fragment.js');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const API_URL = process.env.API_URL || 'http://localhost:8080';

// Support sending various Content-Types on the body up to 5M in size
module.exports =  (req, res) => {
  const { type } = contentType.parse(req);
  if (Object.keys(req.body).length === 0) {
    //check to see if type is supported
    if (!Fragment.isSupportedType(type)) {
      res.status(415).json(createErrorResponse('Improper Content-Type'));
      return;
    }
    throw new Error('No body provided');
  }
  // check to see if the type is supported
  const metadata = {
    ownerId: req.user,
    type,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    size: req.body.length,
    data: req.body,
  };
  const fragments = new Fragment(metadata);
  fragments.save();
  if (Buffer.isBuffer(req.body)) {
    res.location(`${API_URL}/v1/fragments/${fragments.id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment: {
          id: fragments.id,
          ownerId: fragments.ownerId,
          type: fragments.type,
          size: fragments.size,
          created: fragments.created,
          updated: fragments.updated
        },
      })
    );
  } else {
    res.json(createErrorResponse(415, 'Improper Content-Type'));
  }
};
