import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Ability from './Ability';
import AbilityTracker from './AbilityTracker';
import Combatants from './Combatants';
import Haste from './Haste';

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

  // TODO: Remove this
  static ABILITIES = [];

  /**
   * This will be called *once* during initialization. See the Ability class for the available properties.
   * You should always include the results from the parent spellbook via `...super.spellbook(),` as the top entry of your array.
   * This should contain ALL spells available to a player of your spec, including utility.
   * @returns {object[]}
   */
  spellbook() {
    const combatant = this.combatants.selected;
    // This will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Buff you need to put it in a function.
    // While you can put checks for talents/traits outside of the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
    return [
      // Shared trinkets and legendaries
      {
        spell: SPELLS.CLEANSING_MATRIX,
        name: ITEMS.ARCHIVE_OF_FAITH.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        enabled: combatant.hasTrinket(ITEMS.ARCHIVE_OF_FAITH.id),
      },
      {
        spell: SPELLS.GUIDING_HAND,
        name: ITEMS.DECEIVERS_GRAND_DESIGN.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        charges: 2,
        cooldown: 120,
        enabled: combatant.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id),
      },
      {
        spell: SPELLS.GNAWED_THUMB_RING,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 180,
        enabled: combatant.hasFinger(ITEMS.GNAWED_THUMB_RING.id),
      },
      {
        spell: SPELLS.KILJAEDENS_BURNING_WISH_DAMAGE, // cast event never shows, we fab cast events from damage events
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 75,
        castEfficiency: {
          extraSuggestion: 'Delaying the cast somewhat to line up with add spawns is acceptable, however.',
        },
        enabled: combatant.hasTrinket(ITEMS.KILJAEDENS_BURNING_WISH.id),
      },
      {
        spell: SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 75,
        enabled: combatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id),
      },
      {
        spell: SPELLS.SPECTRAL_OWL,
        name: ITEMS.TARNISHED_SENTINEL_MEDALLION.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        enabled: combatant.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id),
      },
      {
        spell: SPELLS.TOME_OF_UNRAVELING_SANITY_DAMAGE,
        name: ITEMS.TOME_OF_UNRAVELING_SANITY.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        enabled: combatant.hasTrinket(ITEMS.TOME_OF_UNRAVELING_SANITY.id),
      },
      {
        spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 75,
        enabled: combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
      },
      {
        spell: SPELLS.SUMMON_DREAD_REFLECTION,
        name: ITEMS.SPECTER_OF_BETRAYAL.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 45,
        enabled: combatant.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id),
      },
      {
        spell: SPELLS.CEASELESS_TOXIN,
        name: ITEMS.VIAL_OF_CEASELESS_TOXINS.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60, // TODO: add detection if target has died and reduced cooldown
        enabled: combatant.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id),
      },
      {
        spell: SPELLS.REFRESHING_AGONY_DOT,
        name: ITEMS.CARAFE_OF_SEARING_LIGHT.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        enabled: combatant.hasTrinket(ITEMS.CARAFE_OF_SEARING_LIGHT.id),
      },
    ];
  }

  abilities = [];
  activeAbilities = [];
  on_initialized() {
    this.abilities = this.spellbook().map(options => new Ability(this, options));
    this.activeAbilities = this.abilities.filter(ability => ability.enabled);
  }

  /*
   * Returns the first ACTIVE spellInfo with the given spellId (or undefined if there is no such spellInfo)
   */
  getAbility(spellId) {
    return this.activeAbilities.find(ability => {
      if (ability.spell instanceof Array) {
        return ability.spell.some(spell => spell.id === spellId);
      } else {
        return ability.spell.id === spellId;
      }
    });
  }

  /*
   * Returns the expected cooldown (in seconds) of the given spellId at the current timestamp (or undefined if there is no such spellInfo)
   */
  getExpectedCooldownDuration(spellId) {
    const ability = this.getAbility(spellId);
    return ability ? ability.cooldown * 1000 : undefined;
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
