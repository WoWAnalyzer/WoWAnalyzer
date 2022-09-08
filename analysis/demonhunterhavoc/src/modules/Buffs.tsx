import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: DH_LEGENDARIES.CHAOTIC_BLADES.id, //Chaos Theory Legendary
        timelineHighlight: true,
        triggeredBySpellId: [DH_SPELLS.DEATH_SWEEP.id, DH_SPELLS.BLADE_DANCE.id],
      },
      {
        spellId: DH_SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: DH_SPELLS.METAMORPHOSIS_HAVOC.id,
      },
      {
        spellId: DH_SPELLS.IMMOLATION_AURA.id,
        timelineHighlight: true,
        triggeredBySpellId: DH_SPELLS.IMMOLATION_AURA.id,
      },
      {
        spellId: DH_TALENTS.FELBLADE_TALENT.id,
        timelineHighlight: false,
        triggeredBySpellId: DH_TALENTS.FELBLADE_TALENT.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
