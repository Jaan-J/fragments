// src/routes/api/get-id.js
const { createErrorResponse, createSuccessResponse } = require('../../response');
const {Fragment} = require('../../model/fragment');
const path = require('path');
var md = require('markdown-it')();

module.exports = async (req, res) => {
  try {
    const ext = path.parse(req.params.id).ext.slice(1);
    if (ext) {
      console.log(ext);
      const paramID = req.params.id.split('.')[0];
        const fragment = await Fragment.byId(req.user, paramID);
        if(ext!='html'){
          return res.status(415).json(createErrorResponse(415, 'This extension conversion is not supported.'));
        }
        let htmlRender = md.render(fragment.data.toString());
        //if html render ends with a newline, remove it
        if (htmlRender.endsWith('\n')) {
          htmlRender = htmlRender.slice(0, -1);
        }
        res.set({
          'Content-Type': 'text/html',
          'Content-Length': fragment.size,
        })
        res.status(200).json(createSuccessResponse({
          fragment: {
            htmlRender
          }
        }));
      return;
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
  try{
      const fragment = await Fragment.byId(req.user, req.params.id);
      const data = fragment.data.toString();
      res.set({
        'Content-Type': fragment.type,
        'Content-Length': fragment.size,
      })
      res.status(200).json(createSuccessResponse({data}));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};