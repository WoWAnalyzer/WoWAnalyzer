import PropTypes from 'prop-types';

import { PERMANENT } from './BuffDuration';

class Ability {
  static propTypes = {
    /**
     * REQUIRED The spell definition. If an array of spell definitions is provided, the first element in the array will be what shows in suggestions / cast timeline. Multiple spell definitions in the same ability can be used to tie multiple cast / buff IDs together as the same ability (with a shared cooldown)
     */
    spell: PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }),
      PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      })),
    ]).isRequired,
    /**
     * The duration of a buff at the time of the application. Use one of the available values from the BuffDuration object.
     */
    duration: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.number,
      PropTypes.oneOf([PERMANENT]),
    ]),
    /**
     * Whether the spell is enabled (available to the player) and should be displayed. This should only be used for hiding spells that are unavailable, for example due to talents. Defaults to true.
     */
    enabled: PropTypes.bool,
    /**
     * The spells that trigger this buff. Defaults to the same spell as the buff (this is most commonly the same spell). Only configure this if it's different.
     */
    triggeredBy: PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }),
      PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      })),
    ]),
    /**
     * Whether the spell should be highlighted on the timeline. You should only highlight important buffs that may affect your cast behavior. Defaults to false.
     */
    timelineHightlight: PropTypes.bool,
  };

  spell = null;
  duration = null;
  enabled = true;
  triggerBy = null;
  timelineHightlight = false;
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

export default Ability;
