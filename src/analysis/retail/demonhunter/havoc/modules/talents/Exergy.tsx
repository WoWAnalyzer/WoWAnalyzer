import type { JSX } from 'react';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { EXERGY_SCALING } from '../../constants';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

/*
example report: https://www.warcraftlogs.com/reports/1HRhNZa2cCkgK9AV/#fight=48&source=10
* */

class Exergy extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EXERGY_TALENT);
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EXERGY_BUFF.id) / this.owner.fightDuration;
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EXERGY_BUFF.id);
  }

  get buffHistory() {
    return this.selectedCombatant.getBuffHistory(SPELLS.EXERGY_BUFF.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.buffUptime,
      isLessThan: {
        minor: 0.55,
        average: 0.45,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={TALENTS.EXERGY_TALENT} />
        </strong>{' '}
        provides an{' '}
        {formatPercentage(
          EXERGY_SCALING[this.selectedCombatant.getTalentRank(TALENTS.EXERGY_TALENT)],
          0,
        )}
        % damage increase for 20 seconds after casting{' '}
        <SpellLink spell={TALENTS.THE_HUNT_HAVOC_TALENT} /> and{' '}
        <SpellLink spell={TALENTS.VENGEFUL_RETREAT_TALENT} />. This should be treated as a
        maintenance buff with almost 100% uptime, since{' '}
        <SpellLink spell={TALENTS.VENGEFUL_RETREAT_TALENT} /> has a 20 seconds cooldown itself with{' '}
        <SpellLink spell={TALENTS.TACTICAL_RETREAT_TALENT} /> taken.
      </section>
    );
    const data = (
      <RoundedPanel>
        <p>
          <strong>
            <SpellLink spell={TALENTS.EXERGY_TALENT} />
          </strong>{' '}
          uptime
        </p>
        {uptimeBarSubStatistic(this.owner.fight, {
          spells: [SPELLS.EXERGY_BUFF],
          uptimes: this.buffHistory.map((buff) => ({
            start: buff.start,
            end: buff.end ?? this.owner.fight.end_time,
          })),
        })}
      </RoundedPanel>
    );
    return <ExplanationAndDataSubSection explanation={explanation} data={data} title="Exergy" />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`The Exergy buff total uptime was ${formatDuration(this.buffDuration)}.`}
      >
        <TalentSpellText talent={TALENTS.EXERGY_TALENT}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Exergy;
