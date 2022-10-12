// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/memory');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date();
    this.updated = updated || new Date();
    this.type = type;
    this.size = size;
    // TODO
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
      if(expand){
        const fragments = await listFragments(ownerId);
        return Promise.all(fragments.map(f => Fragment.byId(ownerId, f)));
      }
      return listFragments(ownerId);
    // TODO
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TODO
    const fragment = await readFragment(ownerId, id);
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id){
    // TODO
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    // TODO
    return writeFragment(this.ownerId, this.id, this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    // TODO
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    // TODO
    this.size = data.length;
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
    // TODO
    if(this.mimeType.startsWith('text/')){
      return true;
    }
    return false;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // TODO
    if(this.isText){
      return ['text/html', 'text/plain'];
    }
    return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // TODO
    const { type } = contentType.parse(value);
    if(type.startsWith('text/plain')){
      return true;
    }
    return false;
  }
}

module.exports.Fragment = Fragment;