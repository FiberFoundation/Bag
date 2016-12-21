import {get, set, has, unset, extend, dropRight, castArray, map, each, filter, keys, values, defaults} from 'lodash';
import {freeze, unfreeze} from './Support';

const GuardedState = new WeakMap();

/**
 * Bag
 * @class
 * @typedef {Object} Bag
 */
export default class Bag {

  /**
   * Constructs Bag.
   * @param {Object} [attributes={}]
   * @param {boolean} [guarded=false]
   * @param {Object|null} [AttributeModel=null]
   */
  constructor(attributes = {}, guarded = false, AttributeModel = null) {
    if (AttributeModel) this.AttributeModel = AttributeModel;
    this.reset(attributes, guarded);
  }

  /**
   * Resets Bag attributes with the given.
   * @param {Object} attributes
   * @param {boolean} [guarded=false]
   * @return {Bag}
   */
  reset(attributes, guarded = false) {
    this.attributes = {};

    each(attributes, (value, key) => {
      this.set(key, value);
    });

    if (guarded) this.guard();

    return this;
  }

  /**
   * Makes attributes guarded. Attributes cannot be mutated.
   * @return {Bag}
   */
  guard() {
    freeze(this.attributes);
    GuardedState.set(this, true);
    return this;
  }

  /**
   * Makes Bag attributes unguarded. Attributes can be mutated.
   * @return {Bag}
   */
  unguard() {
    this.attributes = unfreeze(this.attributes);
    GuardedState.set(this, false);
    return this;
  }

  /**
   * Determines if Bag is Guarded.
   * @return {boolean}
   */
  isGuarded() {
    return GuardedState.get(this);
  }

  /**
   * Mutates Bag key with value. Even if is guarded.
   * @param {string} key
   * @param {*} value
   * @returns {Bag}
   */
  mutate(key, value) {
    const isGuarded = this.isGuarded();
    isGuarded && this.unguard();
    this.set(key, value);
    isGuarded && this.guard();
    return this;
  }

  /**
   * Returns value by the given key or defaults if not exists.
   * @param {string} key
   * @param {*} [defaults=null]
   * @returns {*}
   */
  get(key, defaults = null) {
    return get(this.attributes, key, defaults);
  }

  /**
   * Sets value by key.
   * @param {string} key
   * @param {*} value
   * @returns {Bag}
   */
  set(key, value) {
    set(this.attributes, key, this.convertToModel(value));
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return has(this.attributes, key);
  }

  /**
   * Removes value by key.
   * @param {string} key
   * @returns {Bag}
   */
  forget(key) {
    unset(this.attributes, key);
    return this;
  }

  /**
   * Returns all attributes.
   * @returns {Object}
   */
  all() {
    return extend({}, this.attributes);
  }

  /**
   * Puts attributes to the Bag.
   * @param {Object} attributes
   * @returns {Bag}
   */
  put(attributes) {
    extend(this.attributes, attributes);
    return this;
  }

  /**
   * Calls method at the given path with args.
   * @param {string} path
   * @param {Array} [args=[]]
   * @returns {*}
   */
  call(path, args = []) {
    let parent = this;
    const fn = this.get(path);
    const parentPathArray = dropRight(path.split('.'));
    const parentPath = parentPathArray.join('.');
    if (parentPathArray.length) parent = this.get(parentPath);
    return fn.apply(parent, castArray(args));
  }

  /**
   * Includes given attributes directly to the Bag.
   * @param {Object} attributes
   * @returns {Bag}
   */
  include(attributes) {
    extend(this, attributes);
    return this;
  }

  /**
   * Maps Bag attributes.
   * @param {Function} iteratee
   * @returns {Array}
   */
  map(iteratee) {
    return map(this.all(), iteratee);
  }

  /**
   * Maps attributes at given key.
   * @param {string} key
   * @param {Function} iteratee
   * @returns {Array}
   */
  mapAt(key, iteratee) {
    return map(this.get(key), iteratee);
  }

  /**
   * Traverses Bag attributes.
   * @param {Function} iteratee
   * @returns {Array}
   */
  each(iteratee) {
    return each(this.all(), iteratee);
  }

  /**
   * Traverses attributes at given key.
   * @param {string} key
   * @param {Function} iteratee
   * @returns {Array}
   */
  eachAt(key, iteratee) {
    return each(this.get(key), iteratee);
  }

  /**
   * Returns all values.
   * @returns {Array}
   */
  values() {
    return values(this.all());
  }

  /**
   * Returns all keys.
   * @returns {Array}
   */
  keys() {
    return keys(this.all());
  }

  /**
   * Returns plucked attributes.
   * @param {string|Object|Function} attributes
   * @returns {Array}
   */
  pluck(attributes) {
    return map(this.values(), attributes);
  }

  /**
   * Returns filtered attributes.
   * @param {string|Object|Function} attributes
   * @returns {Array}
   */
  filter(attributes) {
    return filter(this.all(), attributes);
  }

  /**
   * Sets default attributes.
   * @param {Object} defaultAttributes
   * @returns {Bag}
   */
  defaults(defaultAttributes) {
    defaults(this.attributes, defaultAttributes);
    return this;
  }

  /**
   * Returns value converted to Bag `AttributeModel`, if one is not defined then raw value will be returned.
   * @param {*} value
   * @returns {*}
   */
  convertToModel(value) {
    if (! this.AttributeModel) return value;
    return new this.AttributeModel(value);
  }
}
