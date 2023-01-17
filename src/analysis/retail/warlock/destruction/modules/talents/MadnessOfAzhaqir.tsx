import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { TooltipElement } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

class MadnessOfAzhaqir extends Analyzer {
  static talent = TALENTS.MADNESS_OF_THE_AZJAQIR_TALENT;
  static buffId = SPELLS.MADNESS_OF_AZHAQIR_BUFF.id;

  buffedCasts: number = 0;
  totalCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(MadnessOfAzhaqir.talent);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_BOLT),
      this.onChaosBoltCast,
    );
  }

  onChaosBoltCast() {
    this.totalCasts += 1;

    if (this.selectedCombatant.hasBuff(MadnessOfAzhaqir.buffId)) {
      this.buffedCasts += 1;
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(MadnessOfAzhaqir.buffId) / this.owner.fightDuration;
  }

  get buffedChaosBoltCasts() {
    return this.buffedCasts;
  }

  get totalChaosBoltCasts() {
    return this.totalCasts;
  }

  get buffedCastsPercentage() {
    return this.buffedCasts / this.totalCasts;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={MadnessOfAzhaqir.talent}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          <br />
          {formatPercentage(this.buffedCastsPercentage, 0)}%{' '}
          <TooltipElement content={`${this.buffedCasts} / ${this.totalCasts}`}>
            <small>buffed Chaos Bolt casts</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MadnessOfAzhaqir;
