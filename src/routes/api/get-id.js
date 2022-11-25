// src/routes/api/get-id.js
const { createErrorResponse, createSuccessResponse } = require('../../response');
const {Fragment} = require('../../model/fragment');
const path = require('path');
var md = require('markdown-it')();

module.exports = async (req, res) => {
  try {
    const ext = path.parse(req.params.id).ext.slice(1);
    if (ext) {
      const paramID = req.params.id.split('.')[0];
      try {
        Fragment.byId(req.user, paramID).then((fragment) => {
          var htmlRender = md.render(fragment.data.toString());
          if (htmlRender.endsWith('\n')) {
            htmlRender = htmlRender.slice(0, -1);
          }
          res.send(
            createSuccessResponse({
              'Content-Type': 'text/html',
              'Content-Length': fragment.size,
              data: htmlRender,
            })
          );
        });
      } catch (err) {
        res.status(404).json(createErrorResponse(err));
      }
      return;
    }
       Fragment.byId(req.user, req.params.id).then((fragment) => {
        const fragData = fragment.data.toString();
        res.set({
          'Content-Type': fragment.type,
          'Content-Length': fragment.size,
        });
        res.status(200).send(fragData);
      });
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};