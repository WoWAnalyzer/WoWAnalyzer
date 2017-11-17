import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import AbilityTracker from './AbilityTracker';
import Combatants from './Combatants';
import Haste from './Haste';

/* eslint-disable no-unused-vars */
class Abilities extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    haste: Haste,
  };
  static SPELL_CATEGORIES = {
    ROTATIONAL: 'Rotational Spell',
    ROTATIONAL_AOE: 'Spell (AOE)',
    ITEMS: 'Item',
    COOLDOWNS: 'Cooldown',
    DEFENSIVE: 'Defensive Cooldown',
    OTHERS: 'Spell',
    UTILITY: 'Utility',
    HEALER_DAMAGING_SPELL: 'Damaging Spell',
  };
  static ABILITIES = [
    /**
     * Available properties:
     *
     * required spell {object} The spell definition with { id, name and icon }
     * optional name {string} the name to use if it is different from the name provided by the `spell` object.
     * required category {string} The name of the category to place this spell in, you should usually use the SPELL_CATEGORIES enum for these values.
     * required getCooldown {func} A function to calculate the cooldown of a spell. Parameters provided: `hastePercentage`, `selectedCombatant`
     * optional isActive {func} Whether the spell is active (available to the player) and should be displayed. This should only be used for hiding spells that are unavailable, for example due to talents. If you have a spell behaving differently with a legendary for example, you can also add that spell twice and use this property to toggle the one applicable. Parameters provided: `selectedCombatant`
     * optional charges {number} The amount of charges the spell has by default.
     * optional recommendedCastEfficiency {number} The custom recommended cast efficiency. Default is 80% (0.8).
     * optional noCanBeImproved {bool} If this is set to `true`, the Cast Efficiency tab won't show a "can be improved" next to a spell.
     * optional noSuggestion {bool} If this is set to `true`, this spell will not trigger a suggestion.
     * optional extraSuggestion {string} Provide additional information in the suggestion.
     *
     * Rarely necessary:
     * optional isUndetectable {bool} A boolean to indicate it can not be detected whether the player his this spells. This makes it so the spell is hidden when there are 0 casts in the fight. This should only be used for spells that can't be detected if a player has access to them, like racials.
     * optional getCasts {func} A function to get the amount of casts done of a spell. Parameters provided: `castCount`, `parser`
     * optional getMaxCasts {func} A function to get the max amount of casts for a spell. Parameters provided: `cooldown`, `fightDuration`, `getAbility`, `parser`
     * optional importance {string} If set, this suggestion will get this static importance value. Use this ISSUE_IMPORTANCE enum for this.
     */

    // Shared trinkets and legendaries
    {
      spell: SPELLS.CLEANSING_MATRIX,
      name: `${ITEMS.ARCHIVE_OF_FAITH.name}`,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTrinket(ITEMS.ARCHIVE_OF_FAITH.id),
    },
    {
      spell: SPELLS.GUIDING_HAND,
      name: `${ITEMS.DECEIVERS_GRAND_DESIGN.name}`,
      charges: 2,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id),
    },
    {
      spell: SPELLS.GNAWED_THUMB_RING,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasFinger(ITEMS.GNAWED_THUMB_RING.id),
    },
    // {
    //   spell: SPELLS.KILJAEDENS_BURNING_WISH_CAST,
    //   category: Abilities.SPELL_CATEGORIES.ITEMS,
    //   getCooldown: haste => 75,
    //   isActive: combatant => combatant.hasTrinket(ITEMS.KILJAEDENS_BURNING_WISH.id),
    // },
    {
      spell: SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 75,
      isActive: combatant => combatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id),
    },
    {
      spell: SPELLS.SPECTRAL_OWL,
      name: `${ITEMS.TARNISHED_SENTINEL_MEDALLION.name}`,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id),
    },
    {
      spell: SPELLS.TOME_OF_UNRAVELING_SANITY_DAMAGE,
      name: `${ITEMS.TOME_OF_UNRAVELING_SANITY.name}`,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTrinket(ITEMS.TOME_OF_UNRAVELING_SANITY.id),
    },
    {
      spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 75,
      isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
    },
    {
      spell: SPELLS.SUMMON_DREAD_REFLECTION,
      name: `${ITEMS.SPECTER_OF_BETRAYAL.name}`,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 45,
      isActive: combatant => combatant.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id),
    },
    {
      spell: SPELLS.CEASELESS_TOXIN,
      name: `${ITEMS.VIAL_OF_CEASELESS_TOXINS.name}`,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      getCooldown: haste => 60, // TODO: add detection if target has died and reduced cooldown
      isActive: combatant => combatant.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id),
    },
  ];

  /*
   * Returns the first ACTIVE spellInfo with the given spellId (or undefined if there is no such spellInfo)
   */
  getAbility(spellId) {
    return this.constructor.ABILITIES.find(ability => {
      if (ability.spell.id === spellId) {
        return !ability.isActive || ability.isActive(this.combatants.selected);
      }
      return false;
    });
  }

  /*
   * Returns the expected cooldown (in seconds) of the given spellId at the current timestamp (or undefined if there is no such spellInfo)
   */
  getExpectedCooldownDuration(spellId) {
    const ability = this.getAbility(spellId);
    return ability ? (ability.getCooldown(this.haste.current, this.combatants.selected) * 1000) : undefined;
  }

  /*
   * Returns the max charges of the given spellId, or 1 if the spell doesn't have charges (or undefined if there is no such spellInfo)
   */
  getMaxCharges(spellId) {
    const ability = this.getAbility(spellId);
    return ability ? (ability.charges || 1) : undefined;
  }

}

export default Abilities;
