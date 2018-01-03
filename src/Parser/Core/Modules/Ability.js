import PropTypes from 'prop-types';

/**
 * Available properties:
 *
 * required spell {object or array of objects} The spell definition with { id, name and icon }, or an array of spell definitions with the same format. If an array of spell definitions is provided, the first element in the array will be what shows in suggestions / cast timeline. Multiple spell definitions in the same ability can be used to tie multiple cast / buff IDs together as the same ability (with a shared cooldown)
 * optional name {string} the name to use if it is different from the name provided by the `spell` object.
 * required category {string} The name of the category to place this spell in, you should usually use the SPELL_CATEGORIES enum for these values.
 * optional cooldown {func} A function to calculate the cooldown of a spell. Parameters provided: `hastePercentage`, `selectedCombatant`
 * optional enabled {func} Whether the spell is enabled (available to the player) and should be displayed. This should only be used for hiding spells that are unavailable, for example due to talents. If you have a spell behaving differently with a legendary for example, you can also add that spell twice and use this property to toggle the one applicable. Parameters provided: `selectedCombatant`
 * optional charges {number} The amount of charges the spell has by default.
 * optional recommendedEfficiency {number} The custom recommended cast efficiency. Default is 80% (0.8).
 * optional suggestion {bool} If this is set to `true`, this spell will trigger a suggestion.
 * optional extraSuggestion {string} Provide additional information in the suggestion.
 *
 * Rarely necessary:
 * optional isUndetectable {bool} A boolean to indicate it can not be detected whether the player his this spells. This makes it so the spell is hidden when there are 0 casts in the fight. This should only be used for spells that can't be detected if a player has access to them, like racials.
 * optional casts {func} A function to get the amount of casts done of a spell. Parameters provided: `castCount`, `parser`
 * optional maxCasts {func} A function to get the max amount of casts for a spell. Parameters provided: `cooldown`, `fightDuration`, `getAbility`, `parser`
 * optional importance {string} If set, this suggestion will get this static importance value. Use this ISSUE_IMPORTANCE enum for this.
 */
class Ability {
  static propTypes = {
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
    ]),
    name: PropTypes.string,
    category: PropTypes.string.isRequired,
    cooldown: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.number,
    ]),
    channel: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.number,
    ]),
    charges: PropTypes.number,
    isOnGCD: PropTypes.bool,
    castEfficiency: PropTypes.shape({
      suggestion: PropTypes.bool,
      recommendedEfficiency: PropTypes.number,
      averageIssueEfficiency: PropTypes.number,
      majorIssueEfficiency: PropTypes.number,
      extraSuggestion: PropTypes.node,
      casts: PropTypes.func,
      maxCasts: PropTypes.func,
      importance: PropTypes.string,
    }),
    enabled: PropTypes.bool,
  };

  _owner = null;

  spell = null;
  get primarySpell() {
    if(this.spell instanceof Array) {
      return this.spell[0];
    } else {
      return this.spell;
    }
  }
  // region name
  _name = null;
  get name() {
    if (this._name) {
      return this._name;
    }
    return this.primarySpell.name;
  }
  set name(value) {
    this._name = value;
  }
  // endregion
  category = null;
  // region cooldown
  _cooldown = null;
  /** @param {func|number|undefined} value */
  set cooldown(value) {
    this._cooldown = value;
  }
  /** @return {number} */
  get cooldown() {
    if (this._cooldown === undefined) {
      // Most abilities will always be active and don't provide this prop at all
      return 0;
    }
    if (typeof this._cooldown === 'function') {
      return this._cooldown.call(this._owner, this._owner.haste.current, this._owner.combatants.selected);
    }

    return this._cooldown;
  }
  // endregion
  // region channel
  _channel = null;
  /** @param {func|number|undefined} value */
  set channel(value) {
    this._channel = value;
  }
  /** @return {number} */
  get channel() {
    if (this._channel === undefined) {
      // Most abilities will always be active and don't provide this prop at all
      return 0;
    }
    if (typeof this._channel === 'function') {
      return this._channel.call(this._owner, this._owner.haste.current);
    }

    return this._channel;
  }
  // endregion
  isOnGCD = null;
  extraSuggestion = null;
  recommendedEfficiency = null;
  isUndetectable = null;
  castEfficiency = {
    suggestion: false,
    recommendedEfficiency: null,
    averageIssueEfficiency: null,
    majorIssueEfficiency: null,
    extraSuggestion: null,
    casts: null,
    maxCasts: null,
    importance: null,
  };
  charges = 1;
  enabled = true;

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
      PropTypes.checkPropTypes(this.constructor.propTypes, props, 'prop', 'Ability');
      Object.keys(props).forEach(prop => {
        if (process.env.NODE_ENV === 'development') {
          if (this.constructor.propTypes[prop] === undefined) {
            throw new Error(`Unrecognized prop: ${prop}`);
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

export default Ability;
