import { maybeGetSpell } from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';
import CombatLogParser from 'parser/core/CombatLogParser';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TrackedAbility } from 'parser/shared/modules/AbilityTracker';
import PropTypes from 'prop-types';
import * as React from 'react';

import Abilities from './Abilities';

export interface SpellbookAbility<TrackedAbilityType extends TrackedAbility = TrackedAbility> {
  /**
   * REQUIRED The spell id. If an array of spell ids is
   * provided, the first element in the array will be what shows in suggestions
   * / cast timeline. Multiple spell ids in the same ability can be
   * used to tie multiple cast / buff IDs together as the same ability (with a
   * shared cooldown)
   */
  spell: number | number[];
  /**
   * The name to use if it is different from the name provided by the `spell`
   * object. This should only be used in rare situations.
   */
  name?: string;
  /**
   * REQUIRED The category of a spell eg Rotational or Defensive.
   * Use {@link SPELL_CATEGORY} for the value.
   */
  category: SPELL_CATEGORY;
  /**
   * The cooldown of a spell at the time of the cast. Unlike most other durations in WoWA,
   * this is in *seconds, NOT milliseconds*. This can be the direct number, or it can be a function
   * for cooldowns that scale with haste, and can also branch based on combatantinfo.
   * @param haste the player's haste at the time of spell cast, as a proportion of
   *   normal casting speed (20% haste will be passed as 1.20).
   */
  cooldown?: ((haste: number) => number) | number;
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
    casts?: (castCount: TrackedAbilityType, parser: CombatLogParser) => number;
    /**
     * A function to get the max amount of casts for a spell.
     * @deprecated Usage should be avoided. This may be removed in the future.
     */
    maxCasts?: (cooldown: number) => number;
    /**
     * If set, this suggestion will get this static importance value. Use this
     * ISSUE_IMPORTANCE enum for this.
     */
    importance?: ISSUE_IMPORTANCE;
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
   * If this ability is only castable with a certain buff, this can be indicated
   * by setting this prop to the buff spell id.
   * If the trigger isn't an actual buff but a crit, you may need to make a
   * normalizer to fabricate buff events. See TBC Hunter's Kill Command for an
   * example.
   */
  timelineCastableBuff?: number;
  /**
   * @deprecated Use the Buffs module to define your buffs instead. If your
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
   * The spell ID that'll forcibly shown on the timeline if set.
   */
  shownSpell?: number;
}

class Ability {
  /**
   * When extending this class with a new propTypes property you MUST include
   * its parent's propTypes values in your new override value. Otherwise your
   * class will treat inherited props as misplaced
   * Example:
   * import CoreAbility from 'parser/core/modules/Ability';
   * class Ability extends CoreAbility {
   *   static propTypes = {
   *     ...CoreAbility.propTypes,
   *     //...new property entries here...
   * }
   */
  static propTypes: { [key: string]: any } = {
    /**
     * REQUIRED The spell definition. If an array of spell definitions is
     * provided, the first element in the array will be what shows in
     * suggestions / cast timeline. Multiple spell definitions in the same
     * ability can be used to tie multiple cast / buff IDs together as the same
     * ability (with a shared cooldown)
     */
    spell: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]).isRequired,
    /**
     * The name to use if it is different from the name provided by the `spell`
     * object. This should only be used in rare situations.
     */
    name: PropTypes.string,
    /**
     * REQUIRED The category of a spell eg Rotational or Defensive.
     * Use {@link SPELL_CATEGORY} for the value.
     */
    category: PropTypes.oneOf(
      Object.values(SPELL_CATEGORY).filter((category) => typeof category === 'number'),
    ).isRequired,
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
    timelineCastableBuff: PropTypes.number,
    /**
     * DEPRECATED. Use the Buffs module to define your buffs instead. If your
     * spec has no Buffs module, this prop will be used to prefill it.
     *
     * The buff(s) belonging to the ability. Setting this will display the buff
     * on the timeline.
     */
    buffSpellId: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
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
    shownSpell: PropTypes.number,
  };

  private readonly owner: Abilities | undefined;

  spell!: SpellbookAbility['spell'];
  primaryOverride: number | undefined;
  get primarySpell(): number {
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
    return maybeGetSpell(this.primarySpell)?.name;
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
    return this.getCooldown(this.owner?.haste.current || 0);
  }
  getCooldown(haste: number) {
    if (this._cooldown === undefined) {
      // Most abilities will always be active and don't provide this prop at all
      return 0;
    }
    if (typeof this._cooldown === 'function') {
      return this._cooldown.call(null, haste);
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
      return this._channel.call(this.owner, this.owner?.haste.current || 0);
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
  timelineCastableBuff: number | undefined;
  /** @deprecated Use the Buffs module to define your buffs instead. If your spec has no Buffs module, this prop will be used to prefill it. */
  buffSpellId: number | number[] | null = null;
  shownSpell = null;

  /**
   * @param owner
   * @param options
   */
  constructor(owner: Abilities | undefined, options: SpellbookAbility) {
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
      Object.keys(props).forEach((prop) => {
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
    Object.keys(props).forEach((prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._setProp(prop, props[prop]);
    });
  }
  _setProp(prop: string, value: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this[prop] = value;
  }
}

export default Ability;
