import React from 'react';
import PropTypes from 'prop-types';

import CombatLogParser from 'parser/core/CombatLogParser';
import Combatant from 'parser/core/Combatant';
import { Event } from '../Events';
import Abilities from './Abilities';

export interface AbilityTrackerAbility {
  casts: number;
  manaUsed: number;
  healingHits?: number;
  healingEffective?: number;
  healingAbsorbed?: number;
  healingOverheal?: number;
  healingCriticalHits?: number;
  healingCriticalEffective?: number;
  healingCriticalAbsorbed?: number;
  healingCriticalOverheal?: number;
  damageHits?: number;
  damageEffective?: number;
  damageAbsorbed?: number;
  damageCriticalHits?: number;
  damageCriticalEffective?: number;
  damageCriticalAbsorbed?: number;

  // TODO: Fix this proper
  healingIolHits?: number
}
export interface SpellbookAbility {
  /**
   * REQUIRED The spell definition. If an array of spell definitions is
   * provided, the first element in the array will be what shows in suggestions
   * / cast timeline. Multiple spell definitions in the same ability can be
   * used to tie multiple cast / buff IDs together as the same ability (with a
   * shared cooldown)
   */
  spell:
    | {
        id: number;
        name: string;
        icon: string;
      }
    | Array<{
        id: number;
        name: string;
        icon: string;
      }>;
  /**
   * The name to use if it is different from the name provided by the `spell`
   * object. This should only be used in rare situations.
   */
  name?: string;
  /**
   * REQUIRED The name of the category to place this spell in, you should
   * usually use the SPELL_CATEGORIES enum for these values.
   */
  category: string;
  /**
   * The cooldown of a spell at the time of the cast, this can be a function
   * for more complicated calls or even to check for buffs. Parameters
   * provided: `hastePercentage`, `selectedCombatant`
   */
  cooldown?: ((haste: number, trigger?: Event<any>) => number) | number;
  /**
   * NYI, do not use
   */
  channel?: ((haste: number) => number) | number;
  /**
   * The amount of charges the spell has by default. Reminder: only 1 charge
   * will recharge at a time, so a spell having multiple charges will only have
   * the amount of charges as extra possible casts during a fight.
   */
  charges?: number;
  /**
   * `null` is the spell is off the GCD, or an object if the spell is on the
   * GCD. If this spell overlaps in the Spell Timeline it likely is incorrectly
   * marked as on the GCD and should be removed.
   */
  gcd?:
    | {
        static?: number | ((combatant: Combatant) => number);
        base?: number | ((combatant: Combatant) => number);
        minimum?: number | ((combatant: Combatant) => number);
      }
    | ((combatant: Combatant) => number)
    | null;
  castEfficiency?: {
    name?: string;
    /**
     * If this is set to `true`, this spell will trigger a Cast Efficiency
     * suggestion when the efficiency is below the set threshold (with one of
     * the props below, or the default 80%).
     */
    suggestion?: boolean;
    /**
     * The custom recommended cast efficiency. Default is 80% (0.8).
     */
    recommendedEfficiency?: number;
    averageIssueEfficiency?: number;
    majorIssueEfficiency?: number;
    /**
     * Extra suggestion text for after the Cast Efficiency suggestion. Use this
     * for example to give the user a reason why.
     */
    extraSuggestion?: React.ReactNode;
    /**
     * A function to get the amount of casts done of a spell.
     * @deprecated Usage should be avoided. This may be removed in the future.
     */
    casts?: (
      castCount: AbilityTrackerAbility,
      parser: CombatLogParser,
    ) => number;
    /**
     * A function to get the max amount of casts for a spell.
     * @deprecated Usage should be avoided. This may be removed in the future.
     */
    maxCasts?: (cooldown: number) => number;
    /**
     * If set, this suggestion will get this static importance value. Use this
     * ISSUE_IMPORTANCE enum for this.
     */
    importance?: string;
  };
  /**
   * Whether the spell is enabled (available to the player) and should be
   * displayed. This should only be used for hiding spells that are
   * unavailable, for example due to talents.
   */
  enabled?: boolean;

  /**
   * The ability's priority on the timeline. The lower the number the higher on
   * the timeline it will be displayed.
   */
  timelineSortIndex?: number;
  /**
   * DEPRECATED. Use the Buffs module to define your buffs instead. If your
   * spec has no Buffs module, this prop will be used to prefill it.
   *
   * The buff(s) belonging to the ability. Setting this will display the buff
   * on the timeline.
   */
  buffSpellId?: number | number[];
  /**
   * A boolean to indicate the spell is a defensive.
   */
  isDefensive?: boolean;
  /**
   * A boolean to indicate it can not be detected whether the player his this
   * spells. This makes it so the spell is hidden when there are 0 casts in the
   * fight. This should only be used for spells that can't be detected if a
   * player has access to them, like racials.
   */
  isUndetectable?: boolean;
  /**
   * The ability's primary coefficient for calculating its damage or healing
   * from the player's attackpower or spellpower.
   */
  primaryCoefficient?: number;
  /**
   * An array of healing effects that this spell cast causes.
   */
  healSpellIds?: number[];
  /**
   * An array of damage spell ids that this spell cast causes.
   */
  damageSpellIds?: number[];
  /**
   * The spell that'll forcibly shown on the timeline if set.
   */
  shownSpell?: {
    id: number;
    name: string;
    icon: string;
  };
}

class Ability {
  static propTypes: { [key: string]: any } = {
    /**
     * REQUIRED The spell definition. If an array of spell definitions is
     * provided, the first element in the array will be what shows in
     * suggestions / cast timeline. Multiple spell definitions in the same
     * ability can be used to tie multiple cast / buff IDs together as the same
     * ability (with a shared cooldown)
     */
    spell: PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }),
      PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          icon: PropTypes.string.isRequired,
        }),
      ),
    ]).isRequired,
    /**
     * The name to use if it is different from the name provided by the `spell`
     * object. This should only be used in rare situations.
     */
    name: PropTypes.string,
    /**
     * REQUIRED The name of the category to place this spell in, you should
     * usually use the SPELL_CATEGORIES enum for these values.
     */
    category: PropTypes.string.isRequired,
    /**
     * The cooldown of a spell at the time of the cast, this can be a function
     * for more complicated calls or even to check for buffs. Parameters
     * provided: `hastePercentage`, `selectedCombatant`
     */
    cooldown: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    /**
     * NYI, do not use
     */
    channel: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    /**
     * The amount of charges the spell has by default. Reminder: only 1 charge
     * will recharge at a time, so a spell having multiple charges will only
     * have the amount of charges as extra possible casts during a fight.
     */
    charges: PropTypes.number,
    /**
     * `null` is the spell is off the GCD, or an object if the spell is on the
     * GCD. If this spell overlaps in the Spell Timeline it likes is
     * incorrectly marked as on the GCD and should be removed.
     */
    gcd: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        static: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        base: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        minimum: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
      }),
    ]),
    castEfficiency: PropTypes.shape({
      /**
       * If this is set to `true`, this spell will trigger a Cast Efficiency
       * suggestion when the efficiency is below the set threshold (with one of
       * the props below, or the default 80%).
       */
      suggestion: PropTypes.bool,
      /**
       * The custom recommended cast efficiency. Default is 80% (0.8).
       */
      recommendedEfficiency: PropTypes.number,
      averageIssueEfficiency: PropTypes.number,
      majorIssueEfficiency: PropTypes.number,
      /**
       * Extra suggestion text for after the Cast Efficiency suggestion. Use
       * this for example to give the user a reason why.
       */
      extraSuggestion: PropTypes.node,
      /**
       * A function to get the amount of casts done of a spell. Parameters
       * provided: `castCount`, `parser`
       * @deprecated Usage should be avoided. This may be removed in the
       *   future.
       */
      casts: PropTypes.func,
      /**
       * A function to get the max amount of casts for a spell. Parameters
       * provided: `cooldown`, `fightDuration`, `getAbility`, `parser`
       * @deprecated Usage should be avoided. This may be removed in the
       *   future.
       */
      maxCasts: PropTypes.func,
      /**
       * If set, this suggestion will get this static importance value. Use
       * this ISSUE_IMPORTANCE enum for this.
       */
      importance: PropTypes.string,
    }),
    /**
     * Whether the spell is enabled (available to the player) and should be
     * displayed. This should only be used for hiding spells that are
     * unavailable, for example due to talents.
     */
    enabled: PropTypes.bool,

    /**
     * The ability's priority on the timeline. The lower the number the higher
     * on the timeline it will be displayed.
     */
    timelineSortIndex: PropTypes.number,
    /**
     * DEPRECATED. Use the Buffs module to define your buffs instead. If your
     * spec has no Buffs module, this prop will be used to prefill it.
     *
     * The buff(s) belonging to the ability. Setting this will display the buff
     * on the timeline.
     */
    buffSpellId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    /**
     * A boolean to indicate the spell is a defensive.
     */
    isDefensive: PropTypes.bool,
    /**
     * A boolean to indicate it can not be detected whether the player his this
     * spells. This makes it so the spell is hidden when there are 0 casts in
     * the fight. This should only be used for spells that can't be detected if
     * a player has access to them, like racials.
     */
    isUndetectable: PropTypes.bool,
    /**
     * The ability's primary coefficient for calculating its damage or healing
     * from the player's attackpower or spellpower.
     */
    primaryCoefficient: PropTypes.number,
    /**
     * An array of healing effects that this spell cast causes.
     */
    healSpellIds: PropTypes.arrayOf(PropTypes.number),
    /**
     * An array of damage spell ids that this spell cast causes.
     */
    damageSpellIds: PropTypes.arrayOf(PropTypes.number),
    /**
     * The spell that'll forcibly shown on the timeline if set.
     */
    shownSpell: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
  };

  private readonly owner: Abilities;

  spell!: SpellbookAbility['spell'];
  primaryOverride: number | undefined;
  get primarySpell() {
    if (this.spell instanceof Array) {
      return this.spell[this.primaryOverride || 0];
    } else {
      return this.spell;
    }
  }
  // region name
  _name: SpellbookAbility['name'];
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
  _cooldown: SpellbookAbility['cooldown'];
  /** @param {func|number|undefined} value */
  set cooldown(value) {
    this._cooldown = value;
  }
  /** @return {number} */
  get cooldown() {
    return this.getCooldown(this.owner.haste.current);
  }
  getCooldown(haste: number, cooldownTriggerEvent?: Event<any>) {
    if (this._cooldown === undefined) {
      // Most abilities will always be active and don't provide this prop at all
      return 0;
    }
    if (typeof this._cooldown === 'function') {
      return this._cooldown.call(null, haste, cooldownTriggerEvent);
    }

    return this._cooldown;
  }
  // endregion
  // region channel
  _channel: SpellbookAbility['channel'];
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
      return this._channel.call(this.owner, this.owner.haste.current);
    }

    return this._channel;
  }
  // endregion
  gcd: SpellbookAbility['gcd'];
  extraSuggestion = null;
  recommendedEfficiency = null;
  isDefensive = null;
  isUndetectable = null;
  castEfficiency: NonNullable<SpellbookAbility['castEfficiency']> = {
    suggestion: false,
    recommendedEfficiency: undefined,
    averageIssueEfficiency: undefined,
    majorIssueEfficiency: undefined,
    extraSuggestion: undefined,
    casts: undefined,
    maxCasts: undefined,
    importance: undefined,
  };
  charges = 1;
  enabled = true;
  timelineSortIndex: number | null = null;
  /** @deprecated Use the Buffs module to define your buffs instead. If your spec has no Buffs module, this prop will be used to prefill it. */
  buffSpellId: number | Array<number> | null = null;
  shownSpell = null;

  /**
   * When extending this class you MUST copy-paste this function into the new
   * class. Otherwise your new props will not be set properly.
   * @param owner
   * @param options
   */
  constructor(owner: Abilities, options: SpellbookAbility) {
    this.owner = owner;
    this._setProps(options);
  }

  _setProps(props: SpellbookAbility) {
    if (process.env.NODE_ENV === 'development') {
      /**
       * We verify the sanity of the abilities props to avoid mistakes. First
       * we check the types by reusing React's PropTypes which prints to your
       * console, and next we verify if all the props of the abilities exist in
       * the possible proptypes. If not they're likely mislocated.
       */
      PropTypes.checkPropTypes(
        // eslint-disable-next-line react/forbid-foreign-prop-types
        (this.constructor as typeof Ability).propTypes,
        props,
        'prop',
        'Ability',
      );
      Object.keys(props).forEach(prop => {
        if (
          // eslint-disable-next-line react/forbid-foreign-prop-types
          (this.constructor as typeof Ability).propTypes[prop] === undefined
        ) {
          console.log(prop);
          throw new Error(
            `Property not recognized in Abilities: ${prop} seems misplaced in ${JSON.stringify(
              props.spell,
            )}`,
          );
        }
      });
    }
    Object.keys(props).forEach(prop => {
      // @ts-ignore
      this._setProp(prop, props[prop]);
    });
  }
  _setProp(prop: string, value: any) {
    // @ts-ignore
    this[prop] = value;
  }
}

export default Ability;
