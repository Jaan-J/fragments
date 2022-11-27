// src/routes/index.js

const express = require('express');
const createSuccessResponse = require('../response').createSuccessResponse;
// version and author from package.json
const { version } = require('../../package.json');
const { hostname } = require('os');

// Create a router that we can use to mount our API
const router = express.Router();

// Our authorization middleware
const { authenticate } = require('../authorization/index');
/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
 router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author: 'Jaan Javed',
      githubUrl: 'https://github.com/jaan-j/fragments',
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});

module.exports = router;
