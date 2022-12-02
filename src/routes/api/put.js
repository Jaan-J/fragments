const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.debug({ fragment }, 'PUT /fragments/:id');
    logger.debug(
      { fragmentType: fragment.type, contentType: req.headers['content-type'] },
      'Fragment type and content type'
    );

    if (fragment.type !== req.headers['content-type']) {
      return res
        .status(400)
        .json(
          createErrorResponse(400, "A fragment's type can not be changed after it is created.")
        );
    }

    const updatedFragment = new Fragment({
      id: req.params.id,
      ownerId: req.user,
      created: fragment.created,
      type: req.headers['content-type'],
      size: Buffer.byteLength(req.body),
    });
    await updatedFragment.save();
    await updatedFragment.setData(req.body);

    logger.debug({ fragment }, 'Updated fragment');

    res.status(200).json(createSuccessResponse({ fragment: updatedFragment }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
