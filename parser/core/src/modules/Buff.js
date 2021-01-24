import PropTypes from 'prop-types';

class Buff {
  static propTypes = {
    /**
     * REQUIRED The spell id. If an array of spell ids is provided, the first element in the array will be what shows in suggestions / cast timeline. Multiple spell definitions in the same ability can be used to tie multiple cast / buff IDs together as the same ability (with a shared cooldown)
     */
    spellId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]).isRequired,
    /**
     * Whether the spell is enabled (available to the player) and should be displayed. This should only be used for hiding spells that are unavailable, for example due to talents. Defaults to true.
     */
    enabled: PropTypes.bool,
    /**
     * The spells that trigger this buff. Defaults to the same spell as the buff (this is most commonly the same spell). Only configure this if it's different.
     */
    triggeredBySpellId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    /**
     * Whether the spell should be highlighted on the timeline. You should only highlight important buffs that may affect your cast behavior. Defaults to false.
     */
    timelineHighlight: PropTypes.bool,
  };

  spellId = null;
  enabled = true;
  triggeredBySpellId = null;
  timelineHighlight = false;
  /**
   * When extending this class you MUST copy-paste this function into the new class. Otherwise your new props will not be set properly.
   * @param options
   */
  constructor(options) {
    this._setProps(options);
  }

  _setProps(props) {
    if (process.env.NODE_ENV === 'development') {
      /**
       * We verify the sanity of the abilities props to avoid mistakes. First we check the types by reusing React's PropTypes which prints to your console, and next we verify if all the props of the abilities exist in the possible proptypes. If not they're likely mislocated.
       */
      PropTypes.checkPropTypes(this.constructor.propTypes, props, 'prop', 'Ability'); // eslint-disable-line react/forbid-foreign-prop-types
      Object.keys(props).forEach(prop => {
        if (this.constructor.propTypes[prop] === undefined) { // eslint-disable-line react/forbid-foreign-prop-types
          console.log(prop);
          throw new Error(`Property not recognized in Buffs: ${prop} seems misplaced in ${JSON.stringify(props.spell)}`);
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

export default Buff;
