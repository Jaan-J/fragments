// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
var md = require('markdown-it')();
const sharp = require('sharp');
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const validFileTypes = {
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
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;

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
    if (!fragment) {
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
  async save() {
    this.updated = new Date().toISOString();
    return await writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    this.size = Buffer.byteLength(data);
    this.data = data;
    this.updated = new Date().toISOString();
    return await writeFragmentData(this.ownerId, this.id, data);
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
    return this.mimeType.includes('text');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let mimeTypes = [];
    switch (this.type) {
      case validFileTypes.txt:
      case validFileTypes.txtCharset:
        mimeTypes = [validFileTypes.txt];
        break;
      case validFileTypes.md:
        mimeTypes = [validFileTypes.md, validFileTypes.txt, validFileTypes.html];
        break;
      case validFileTypes.html:
        mimeTypes = [validFileTypes.html, validFileTypes.txt];
        break;
      case validFileTypes.json:
        mimeTypes = [validFileTypes.json, validFileTypes.txt];
        break;
      case validFileTypes.png:
        mimeTypes = [validFileTypes.png, validFileTypes.jpg, validFileTypes.webp, validFileTypes.gif];
        break;
      case validFileTypes.jpg:
        mimeTypes = [validFileTypes.png, validFileTypes.jpg, validFileTypes.webp, validFileTypes.gif];
        break;
      case validFileTypes.gif:
        mimeTypes = [validFileTypes.png, validFileTypes.jpg, validFileTypes.webp, validFileTypes.gif];
        break;
      case validFileTypes.webp:
        mimeTypes = [validFileTypes.png, validFileTypes.jpg, validFileTypes.webp, validFileTypes.gif];
        break;
      default:
        mimeTypes = [];
    }
    return mimeTypes;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return Object.values(validFileTypes).includes(value);
  }

  static isUseableExtension(value) {
    return Object.keys(validFileTypes).includes(value);
  }

  static isValidExtType(ext) {
    return validFileTypes[ext];
  }

  async convertFragment(fragData, conversionType) {
    switch (conversionType) {
      case 'text/plain':
        return fragData.toString();
      case 'text/html':
        if (this.type === 'text/markdown') return md.render(fragData.toString());
        return fragData;
      case 'image/png':
        return await sharp(fragData).png();
      case 'image/jpeg':
        return await sharp(fragData).jpeg();
      case 'image/gif':
        return await sharp(fragData).gif();
      case 'image/webp':
        return await sharp(fragData).webp();
      default:
        return fragData;
    }
  }
}

module.exports = Fragment;
