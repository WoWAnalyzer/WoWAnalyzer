import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const OSSUARY_RUNICPOWER_REDUCTION = 5;

class Ossuary extends Analyzer {
  dsWithOS = 0;
  dsWithoutOS = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEATH_STRIKE_TALENT),
      this.onCast,
    );
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.OSSUARY_TALENT_BUFF.id) / this.owner.fightDuration
    );
  }

  get buffedDeathStrikes() {
    return this.dsWithOS / (this.dsWithOS + this.dsWithoutOS);
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.OSSUARY_TALENT_BUFF.id)) {
      this.dsWithOS += 1;
    } else {
      this.dsWithoutOS += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This Death Strike cast was without Ossuary.`;
    }
  }

  get efficiencySuggestionThresholds(): NumberThreshold {
    return {
      actual: this.buffedDeathStrikes,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.efficiencySuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={TALENTS.OSSUARY_TALENT} /> usage can be improved. Avoid casting{' '}
          <SpellLink spell={TALENTS.DEATH_STRIKE_TALENT} /> while not having Ossuary up as you lose
          Runic Power by doing so.
        </>,
      )
        .icon(TALENTS.OSSUARY_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Ossuary efficiency`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={
          <>
            {this.dsWithoutOS * OSSUARY_RUNICPOWER_REDUCTION} RP wasted by casting them without
            Ossuary up.
            <br />
            {this.dsWithOS * OSSUARY_RUNICPOWER_REDUCTION} RP saved by casting them with Ossuary up.
            <br />
            {formatPercentage(this.uptime)}% uptime.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.OSSUARY_TALENT}>
          <>
            {this.dsWithoutOS} / {this.dsWithOS + this.dsWithoutOS}{' '}
            <small>Death Strikes without Ossuary</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Ossuary;
