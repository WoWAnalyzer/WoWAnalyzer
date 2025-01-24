import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  eruptionConsumedEssenceBurst,
  dreamConsumedEssenceBurst,
} from '../normalizers/CastLinkNormalizer';
import Events, { CastEvent } from 'parser/core/Events';
import Soup from 'interface/icons/Soup';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink } from 'interface';
/**
 * Essence Burst has a 20% chance not to be consumed.
 */
class HoardedPower extends Analyzer {
  eruptionHoardedPowerProcs = 0;
  blossomHoardedPowerProcs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.HOARDED_POWER_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onEruptionCast,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.DREAM_OF_SPRING_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM_CAST),
        this.onBlossomCast,
      );
    }
  }

  onEruptionCast(event: CastEvent) {
    if (
      !eruptionConsumedEssenceBurst(event) &&
      this.selectedCombatant.hasBuff(SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF)
    ) {
      this.eruptionHoardedPowerProcs += 1;
    }
  }

  onBlossomCast(event: CastEvent) {
    if (
      !dreamConsumedEssenceBurst(event) &&
      this.selectedCombatant.hasBuff(SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF)
    ) {
      this.blossomHoardedPowerProcs += 1;
    }
  }

  statistic() {
    const hoardedProcs = [
      {
        color: 'rgb(212, 81, 19)',
        label: TALENTS.ERUPTION_TALENT.name,
        spellId: TALENTS.ERUPTION_TALENT.id,
        valueTooltip: this.eruptionHoardedPowerProcs,
        value: this.eruptionHoardedPowerProcs,
      },
      {
        color: 'rgb(46, 139, 87)',
        label: SPELLS.EMERALD_BLOSSOM_CAST.name,
        spellId: SPELLS.EMERALD_BLOSSOM_CAST.id,
        valueTooltip: this.blossomHoardedPowerProcs,
        value: this.blossomHoardedPowerProcs,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.HOARDED_POWER_TALENT}>
          <div>
            <Soup /> {this.eruptionHoardedPowerProcs + this.blossomHoardedPowerProcs}{' '}
            <small>
              <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> saved
            </small>
          </div>
        </TalentSpellText>
        {this.selectedCombatant.hasTalent(TALENTS_EVOKER.DREAM_OF_SPRING_TALENT) ? (
          <div className="pad">
            <label>Hoarded Power procs</label>
            <DonutChart items={hoardedProcs} />
          </div>
        ) : (
          ''
        )}
      </Statistic>
    );
  }
}

export default HoardedPower;
