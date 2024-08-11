import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import RisingSunKick from './RisingSunKick';
import RisingMist from './RisingMist';
import { SpellLink } from 'interface';

/*
 * Add in Statistic box to show average time between RSK casts when Rising Mist is talented.
 */
class TimeBetweenRSKs extends Analyzer {
  static dependencies = {
    risingSunKick: RisingSunKick,
    risingMist: RisingMist,
  };

  protected risingMist!: RisingMist;
  protected risingSunKick!: RisingSunKick;
  totalRSKCasts: number = 0;
  firstRSKTimestamp: number = 0;
  lastRSKTimestamp: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.onRSK,
    );
  }

  get rskWindow() {
    return this.lastRSKTimestamp - this.firstRSKTimestamp;
  }

  get averageTimeBetweenRSKSeconds() {
    if (this.totalRSKCasts === 0) {
      return 'Rising Sun Kick was not cast';
    } else if (this.totalRSKCasts === 1) {
      return 'Rising Sun Kick was only cast once';
    } else {
      return (this.rskWindow / 1000 / (this.totalRSKCasts - 1)).toFixed(2) + `s`;
    }
  }

  onRSK(event: CastEvent) {
    if (this.totalRSKCasts === 0) {
      this.firstRSKTimestamp = event.timestamp;
    } else {
      this.lastRSKTimestamp = event.timestamp;
    }
    this.totalRSKCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(22)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <TalentSpellText talent={TALENTS_MONK.RISING_SUN_KICK_TALENT}>
          <>
            {this.averageTimeBetweenRSKSeconds} <small>average time between casts</small>
          </>
          <br />
          <>
            {this.risingMist.averageTargetsPerRSKCast()}{' '}
            <small>
              average <SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT} /> hits per cast
            </small>
          </>
          <br />
          <>{this.risingSunKick.subStatistic()}</>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TimeBetweenRSKs;
