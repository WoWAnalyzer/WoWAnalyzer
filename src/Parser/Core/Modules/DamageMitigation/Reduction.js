import PropTypes from 'prop-types';

class Reduction {
  static propTypes = {
    /**
     * REQUIRED The ID used for the damage reduction. This is also the ID used to check for active buffs.
     */
    id: PropTypes.number.isRequired,
    /**
     * REQUIRED The name of the damage reduction.
     */
    name: PropTypes.string.isRequired,
    /**
     * The mitigation provided by the damage reduction. This can be a function for more complicated calls or even to check for buffs. Parameters provided: `selectedCombatant`, `armor`.
     */
    mitigation: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.number,
    ]),
    /**
     * Whether the reduction is enabled and should be used. Defaults to true. This can be a function.
     */
    enabled: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.bool,
    ]),
  };

  _owner = null;

  id = null;
  name = null;
  // region mitigation
  _mitigation = null;
  /** @param {func|number|undefined} value */
  set mitigation(value) {
    this._mitigation = value;
  }
  /** @return {number} */
  get mitigation() {
    if (this._mitigation === undefined) {
      return 0;
    }
    if (typeof this._mitigation === 'function') {
      return this._mitigation.call(this._owner, this._owner.statTracker.currentArmorPercentage, this._owner.statTracker.currentVersatilityPercentage, this._owner.statTracker.currentMasteryPercentage, this._owner.selectedCombatant);
    }
    return this._mitigation;
  }
  // endregion
  // region enabled
  _enabled = true;
  /** @param {func|bool|undefined} value */
  set enabled(value) {
    this._enabled = value;
  }
  /** @return {bool} */
  get enabled() {
    if (this._enabled === undefined) {
      return true;
    }
    if (typeof this._enabled === 'function') {
      return this._enabled.call(this._owner, this._owner.selectedCombatant);
    }
    return this._enabled;
  }
  // endregion
 
  /**
   * When extending this class you MUST copy-paste this function into the new class. Otherwise your new props will not be set properly.
   * @param owner
   * @param options
   */
  constructor(owner, options) {
    this._owner = owner;
    this._setProps(options);
  }

  _setProps(props) {
    if (process.env.NODE_ENV === 'development') {
      /**
       * We verify the sanity of the reductions props to avoid mistakes. First we check the types by reusing React's PropTypes which prints to your console, and next we verify if all the props of the reductions exist in the possible proptypes. If not they're likely mislocated.
       */
      PropTypes.checkPropTypes(this.constructor.propTypes, props, 'prop', 'Reduction');
      Object.keys(props).forEach(prop => {
        if (process.env.NODE_ENV === 'development') {
          if (this.constructor.propTypes[prop] === undefined) {
            throw new Error(`Unrecognized prop in Reductions: ${prop} seems misplaced in ${JSON.stringify(props.id)}`);
          }
        }
      });
    }
    Object.keys(props).forEach(prop => {
      this._setProp(prop, props[prop]);
    });
  }
  _setProp(prop, value) {
    this[prop] = value;
  }
}

export default Reduction;
