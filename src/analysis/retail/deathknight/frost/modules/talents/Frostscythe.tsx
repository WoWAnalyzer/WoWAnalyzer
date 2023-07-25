import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 *A sweeping attack that strikes all enemies in front of you for (14% of attack power) Frost damage. This attack benefits from Killing Machine. Critical strikes with Frostscythe deal 4 times normal damage.
 */
class Frostscythe extends Analyzer {
  casts: number = 0;
  hits: number = -1; // need to initialize negative to make sure first cast isn't counted as bad
  goodCasts: number = 0;
  hitThreshold: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.FROSTSCYTHE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.FROSTSCYTHE_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(talents.FROSTSCYTHE_TALENT),
      this.onDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onCast(event: CastEvent) {
    if (this.hits >= this.hitThreshold) {
      // this is checking the previous cast, not the cast in the current event
      this.goodCasts += 1;
    }
    this.casts += 1;
    this.hitThreshold = this.selectedCombatant.hasBuff(SPELLS.KILLING_MACHINE.id, event.timestamp)
      ? 1
      : 2;
    this.hits = 0;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
  }

  onFightEnd() {
    // check if the last cast of Fsc was good
    if (this.hits >= this.hitThreshold) {
      this.goodCasts += 1;
    }
  }

  get efficiency() {
    return this.goodCasts / this.casts;
  }

  get efficencyThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.efficencyThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={talents.FROSTSCYTHE_TALENT} /> efficiency can be improved. Only
          cast Frostscythe if you have a <SpellLink spell={SPELLS.KILLING_MACHINE} icon /> proc or
          you can hit 2+ targets.
        </>,
      )
        .icon(talents.FROSTSCYTHE_TALENT.icon)
        .actual(
          defineMessage({
            id: 'deathknight.frost.frostScythe.efficiency',
            message: `${formatPercentage(actual)}% Frostscythe efficiency`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={`A good cast is one where you either hit 1+ targets with a Killing Machine buff or you hit 2+ targets.  You had ${this.goodCasts} / ${this.casts} good casts`}
      >
        <BoringSpellValueText spell={talents.FROSTSCYTHE_TALENT}>
          <>
            {formatPercentage(this.efficiency)} % <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Frostscythe;
