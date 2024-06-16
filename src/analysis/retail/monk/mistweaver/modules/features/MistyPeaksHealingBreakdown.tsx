import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';
import DancingMists from '../spells/DancingMists';
import MistsOfLife from '../spells/MistsOfLife';
import MistyPeaks from '../spells/MistyPeaks';
import RapidDiffusion from '../spells/RapidDiffusion';

class MistyPeaksHealingBreakdown extends Analyzer {
  get remainingMistyPeaksHealing() {
    return (
      this.mistyPeaks.extraHealing -
      this.rapidDiffusion.mistyPeaksHealingFromRapidDiffusion -
      this.dancingMists.mistyPeaksHealingFromDancingMist -
      this.mistsOfLife.extraMistyPeaksHealing
    );
  }
  static dependencies = {
    mistyPeaks: MistyPeaks,
    dancingMists: DancingMists,
    rapidDiffusion: RapidDiffusion,
    mistsOfLife: MistsOfLife,
  };
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT);
    if (!this.active) {
      return;
    }
  }

  protected mistyPeaks!: MistyPeaks;
  protected dancingMists!: DancingMists;
  protected rapidDiffusion!: RapidDiffusion;
  protected mistsOfLife!: MistsOfLife;

  renderMistyPeaksChart() {
    const items = [
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Renewing Mist',
        spellId: SPELLS.RENEWING_MIST_HEAL.id,
        value: this.remainingMistyPeaksHealing,
        valueTooltip: formatThousands(this.remainingMistyPeaksHealing),
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.MISTS_OF_LIFE_TALENT)) {
      items.push({
        color: SPELL_COLORS.GUSTS_OF_MISTS,
        label: 'Mists of Life',
        spellId: TALENTS_MONK.MISTS_OF_LIFE_TALENT.id,
        value: this.mistsOfLife.extraMistyPeaksHealing,
        valueTooltip: formatThousands(this.mistsOfLife.extraMistyPeaksHealing),
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.DANCING_MISTS_TALENT)) {
      items.push({
        color: SPELL_COLORS.DANCING_MISTS,
        label: 'Dancing Mists',
        spellId: TALENTS_MONK.DANCING_MISTS_TALENT.id,
        value: this.dancingMists.mistyPeaksHealingFromDancingMist,
        valueTooltip: formatThousands(this.dancingMists.mistyPeaksHealingFromDancingMist),
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT)) {
      items.push({
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: 'Rapid Diffusion',
        spellId: TALENTS_MONK.RAPID_DIFFUSION_TALENT.id,
        value: this.rapidDiffusion.mistyPeaksHealingFromRapidDiffusion,
        valueTooltip: formatThousands(this.rapidDiffusion.mistyPeaksHealingFromRapidDiffusion),
      });
    }

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(1)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT}>Misty Peaks</SpellLink> breakdown
          </label>
          {this.renderMistyPeaksChart()}
        </div>
      </Statistic>
    );
  }
}

export default MistyPeaksHealingBreakdown;
