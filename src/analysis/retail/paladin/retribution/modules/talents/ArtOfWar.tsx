import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TALENTS_PALADIN } from 'common/TALENTS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';

const ART_OF_WAR_DURATION = 10000;

class AoWProcTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  consumedAoWProcs = 0;
  wastedAoWProcs = 0;
  totalAoWProcs = 0;
  lastAoWProcTime: null | number = null;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.ART_OF_WAR_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ART_OF_WAR),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ART_OF_WAR),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT),
      this.onCast,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.totalAoWProcs += 1;
    if (this.spellUsable.isOnCooldown(TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT.id);
      this.lastAoWProcTime = event.timestamp;
    }
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.wastedAoWProcs += 1;
    this.totalAoWProcs += 1;
  }

  get consumedProcsPercent() {
    return this.consumedAoWProcs / this.totalAoWProcs;
  }

  get suggestionThresholds() {
    return {
      actual: this.consumedProcsPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent) {
    if (this.lastAoWProcTime !== event.timestamp) {
      if (this.lastAoWProcTime === null) {
        return;
      }
      const AoWTimeframe = this.lastAoWProcTime + ART_OF_WAR_DURATION;
      if (event.timestamp <= AoWTimeframe) {
        this.consumedAoWProcs += 1;
        this.lastAoWProcTime = null;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You got {this.totalAoWProcs} Art of War procs and used {this.consumedAoWProcs} of them.
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PALADIN.ART_OF_WAR_TALENT}>
          {formatPercentage(this.consumedProcsPercent)} % <small>of procs consumed</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default AoWProcTracker;
