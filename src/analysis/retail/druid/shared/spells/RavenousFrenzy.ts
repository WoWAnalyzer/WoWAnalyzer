import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Buffs from 'parser/core/modules/Auras';

// TODO so far this is removed in Dragonflight - leaving it around until we're sure
/**
 * This module handles common things for Ravenous Frenzy
 *
 * **Ravenous Frenzy**
 * Covenant Ability - Venthyr
 *
 * For 20 sec, Druid spells you cast increase your damage and healing by 2%, and haste by 1%, stacking.
 * If you spend 2 sec idle, the Frenzy overcomes you, consuming 1% of your health per stack, stunning you for 1 sec, and ending.
 */
class RavenousFrenzy extends Analyzer {
  static dependencies = {
    buffs: Buffs,
  };

  protected buffs!: Buffs;

  constructor(
    options: Options & {
      buffs: Buffs;
    },
  ) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    // Add the buffs to the buff tracker so that they show up in the timeline
    options.buffs.add({
      spellId: [SPELLS.RAVENOUS_FRENZY.id, SPELLS.SINFUL_HYSTERIA_BUFF.id],
      timelineHighlight: true,
      triggeredBySpellId: SPELLS.RAVENOUS_FRENZY.id,
    });
  }
}

export default RavenousFrenzy;
