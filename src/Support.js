import {isPlainObject, each} from 'lodash';

/**
 * Deeply freezes object.
 * @param {Object} object
 * @returns {Object}
 */
export function freeze(object) {
  const keys = Reflect.ownKeys(object);
  for (const key of keys) {
    const value = object[key];
    if (! isPlainObject(value)) continue;
    object[key] = freeze(value);
  }
  return Object.freeze(object);
}

/**
 * Deeply unfreezes object.
 * @param {Object} object
 * @returns {Object}
 */
export function unfreeze(object) {
  const unfrozen = {};
  const keys = Reflect.ownKeys(object);
  for (const key of keys) {
    const value = object[key];
    unfrozen[key] = isPlainObject(value) ? unfreeze(value) : value;
  }
  return unfrozen;
}
