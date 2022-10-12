const contentType = require('content-type');
const { Fragment } = require('../../model/fragment.js');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const API_URL = process.env.API_URL || 'http://localhost:8080';

// Support sending various Content-Types on the body up to 5M in size
module.exports = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    throw new Error('No body provided');
  }
  const { type } = contentType.parse(req);
  const metadata = {
    ownerId: req.user,
    type,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    size: req.body.length,
  };

  const fragments = new Fragment(metadata);
  fragments.save();
  if (Buffer.isBuffer(req.body)) {
    res.status(201).json(
      createSuccessResponse({
        Location: API_URL,
        'Content-Type': type,
        'Content-Length': req.body.length,
      })
    );
  } else {
    res.json(createErrorResponse(415, 'Improper Content-Type'));
  }
};