import SPELLS from 'common/SPELLS/classic/paladin';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;
    return [
      // Auras
      { spellId: SPELLS.CONCENTRATION_AURA.id },
      { spellId: SPELLS.CRUSADER_AURA.id },
      { spellId: SPELLS.DEVOTION_AURA.id },
      { spellId: SPELLS.FIRE_RESISTANCE_AURA.id },
      { spellId: SPELLS.FROST_RESISTANCE_AURA.id },
      { spellId: SPELLS.RETRIBUTION_AURA.id },
      { spellId: SPELLS.SHADOW_RESISTANCE_AURA.id },
      { spellId: SPELLS.RIGHTEOUS_FURY.id },
      // Blessings
      { spellId: SPELLS.BLESSING_OF_KINGS.id },
      { spellId: SPELLS.BLESSING_OF_MIGHT.id },
      { spellId: SPELLS.BLESSING_OF_SANCTUARY.id },
      { spellId: SPELLS.BLESSING_OF_WISDOM.id },
      { spellId: SPELLS.GREATER_BLESSING_OF_KINGS.id },
      { spellId: SPELLS.GREATER_BLESSING_OF_MIGHT.id },
      { spellId: SPELLS.GREATER_BLESSING_OF_SANCTUARY.id },
      { spellId: SPELLS.GREATER_BLESSING_OF_WISDOM.id },
      // Seals
      { spellId: SPELLS.SEAL_OF_BLOOD.id },
      { spellId: SPELLS.SEAL_OF_CORRUPTION.id },
      { spellId: SPELLS.SEAL_OF_JUSTICE.id },
      { spellId: SPELLS.SEAL_OF_LIGHT.id },
      { spellId: SPELLS.SEAL_OF_RIGHTEOUSNESS.id },
      { spellId: SPELLS.SEAL_OF_THE_MARTYR.id },
      { spellId: SPELLS.SEAL_OF_VENGEANCE.id },
      { spellId: SPELLS.SEAL_OF_WISDOM.id },
      {
        spellId: SPELLS.SEAL_OF_COMMAND.id,
        enabled: combatant.talentPoints[2] >= 10,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
