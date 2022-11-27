// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
var md = require('markdown-it')();
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/memory');

const validTypes = {
  txt: 'text/plain',
  txtCharset: 'text/plain; charset=utf-8',
  md: 'text/markdown',
  html: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0, data }) {
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date();
    this.updated = updated || new Date();
    this.type = type;
    this.size = size;
    this.data = data;

    if (!ownerId) {
      throw new Error('No owner id provided');
    }

    if (!type) {
      throw new Error('No type provided');
    }

    if (typeof size !== 'number') {
      throw new Error('Size is not a number');
    }

    if (size < 0) {
      throw new Error('Size is less than 0');
    }

    if (!Fragment.isSupportedType(type)) {
      throw new Error('Type is not supported');
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    return fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (fragment == null) {
      throw new Error('Fragment is null or undefined');
    }
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    this.size = data.length;
    this.data = data;
    this.updated = new Date().toISOString();
    await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    if (this.mimeType.startsWith('text/')) {
      return true;
    }
    return false;
  }

  get isMarkdown() {
    if (this.mimeType === 'text/markdown') {
      return true;
    }
    return false;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.isText) {
      return ['text/plain'];
    }
    if (this.isMarkdown) {
      return ['text/html'];
    }
    return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    if (
      type === 'text/plain' ||
      type === 'text/plain; charset=utf-8' ||
      type === 'text/markdown' ||
      type === 'text/html' ||
      type === 'application/json'
    ) {
      return true;
    }
    return false;
  }

  static isSupportedExt(value) {
    return Object.keys(validTypes).includes(value);
  }
  
  static extValidType(ext) {
    return validTypes[ext];
  }

  static convertData(fragmentData, conversionType) {
    switch (conversionType) {
      case 'text/plain':
        return fragmentData.toString();
      case 'text/html':
        if (this.type === 'text/markdown') return md.render(fragmentData.toString());
        return fragmentData;
      default:
        return fragmentData;
    }
  }
  
}

module.exports.Fragment = Fragment;
