import {
  MajorDefensiveBuff,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// TWW ScaleCommander hero talent has a +5% buff so just preparing for that.
const BASE_MITIGATION = 0.3;
const HARDENED_SCALES_MITIGATION = 0.05;

class ObsidianScales extends MajorDefensiveBuff {
  hasHardenedScales = false;
  mitPct: number = BASE_MITIGATION + (this.hasHardenedScales ? HARDENED_SCALES_MITIGATION : 0);

  constructor(options: Options) {
    super(TALENTS.OBSIDIAN_SCALES_TALENT, buff(TALENTS.OBSIDIAN_SCALES_TALENT), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.OBSIDIAN_SCALES_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.mitPct),
    });
  }

  description() {
    return (
      <p>
        <SpellLink spell={TALENTS.OBSIDIAN_SCALES_TALENT} /> reduces the damage you take by 30%.
      </p>
    );
  }

  statistic() {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default ObsidianScales;
