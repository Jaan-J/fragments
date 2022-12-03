// src/routes/api/get-id.js
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');
const Fragment = require('../../model/fragment');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const id = path.parse(req.params.id).name;
    const ext = path.parse(req.params.id).ext.slice(1);

    const fragment = new Fragment(await Fragment.byId(ownerId, id));
    const fragmentData = await fragment.getData();

    if (ext) {
      logger.debug({ id: id, ext: ext }, 'GET /fragments/:id.ext');

      if (!Fragment.isUseableExtension(ext)) {
        return res.status(415).json(createErrorResponse(415, 'Extension type is not supported.'));
      }

      const type = await Fragment.isValidExtType(ext);

      if (!fragment.formats.includes(type)) {
        return res.status(415).json(createErrorResponse(415, 'Conversion is not allowed.'));
      }

      const newFragmentData = await fragment.convertFragment(fragmentData, type);
      logger.debug(
        { newFragmentData: newFragmentData, contentType: type },
        'New fragment data and content type'
      );
      res.setHeader('Content-type', type);
      res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
      res.status(200).send(newFragmentData);
      return;
    }
    logger.debug({ fragment }, 'GET /fragments/:id');
    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.setHeader('content-type', fragment.type);
    res.status(200).send(fragmentData);
    return;
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
