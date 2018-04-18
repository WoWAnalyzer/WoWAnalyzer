import PropTypes from 'prop-types';

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
     * The name to use if it is different from the name provided by the `spell` object. This should only be used in rare situations.
     */
    name: PropTypes.string,
    /**
     * REQUIRED The name of the category to place this spell in, you should usually use the SPELL_CATEGORIES enum for these values.
     */
    category: PropTypes.string.isRequired,
    /**
     * The cooldown of a spell at the time of the call, this can be a function for more complicated calls or even to check for buffs. Parameters provided: `hastePercentage`, `selectedCombatant`
     */
    cooldown: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.number,
    ]),
    /**
     * NYI, do not use
     */
    channel: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.number,
    ]),
    /**
     * The amount of charges the spell has by default. Reminder: only 1 charge will recharge at a time, so a spell having multiple charges will only have the amount of charges as extra possible casts during a fight.
     */
    charges: PropTypes.number,
    /**
     * Whether the spell is on the GCD.
     * If this spell overlaps in the Spell Timeline it likes is incorrectly marked as on the GCD and should be removed.
     */
    isOnGCD: PropTypes.bool,
    // TODO: Add properties `staticGCD` and `baseGcd` since the baseGcd can be different per spell (e.g. Brewmaster's Effuse has a 1.5sec base GCD and most other spells are 1sec)
    castEfficiency: PropTypes.shape({
      /**
       * If this is set to `true`, this spell will trigger a Cast Efficiency suggestion when the efficiency is below the set threshold (with one of the props below, or the default 80%).
       */
      suggestion: PropTypes.bool,
      /**
       * The custom recommended cast efficiency. Default is 80% (0.8).
       */
      recommendedEfficiency: PropTypes.number,
      averageIssueEfficiency: PropTypes.number,
      majorIssueEfficiency: PropTypes.number,
      /**
       * Extra suggestion text for after the Cast Efficiency suggestion. Use this for example to give the user a reason why.
       */
      extraSuggestion: PropTypes.node,
      /**
       * A function to get the amount of casts done of a spell. Parameters provided: `castCount`, `parser`
       * @deprecated Usage should be avoided. This may be removed in the future.
       */
      casts: PropTypes.func,
      /**
       * A function to get the max amount of casts for a spell. Parameters provided: `cooldown`, `fightDuration`, `getAbility`, `parser`
       * @deprecated Usage should be avoided. This may be removed in the future.
       */
      maxCasts: PropTypes.func,
      /**
       * If set, this suggestion will get this static importance value. Use this ISSUE_IMPORTANCE enum for this.
       */
      importance: PropTypes.string,
    }),
    /**
     * Whether the spell is enabled (available to the player) and should be displayed. This should only be used for hiding spells that are unavailable, for example due to talents.
     */
    enabled: PropTypes.bool,
    /**
     * A boolean to indicate it can not be detected whether the player his this spells. This makes it so the spell is hidden when there are 0 casts in the fight. This should only be used for spells that can't be detected if a player has access to them, like racials.
     */
    isUndetectable: PropTypes.bool,
    /**
     * The ability's priority on the timeline. The lower the number the higher on the timeline it will be displayed.
     */
    timelineSortIndex: PropTypes.number,
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
      /**
       * We verify the sanity of the abilities props to avoid mistakes. First we check the types by reusing React's PropTypes which prints to your console, and next we verify if all the props of the abilities exist in the possible proptypes. If not they're likely mislocated.
       */
      PropTypes.checkPropTypes(this.constructor.propTypes, props, 'prop', 'Ability');
      Object.keys(props).forEach(prop => {
        if (process.env.NODE_ENV === 'development') {
          if (this.constructor.propTypes[prop] === undefined) {
            throw new Error(`Unrecognized prop in Abilities: ${prop} seems misplaced in ${JSON.stringify(props.spell)}`);
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
