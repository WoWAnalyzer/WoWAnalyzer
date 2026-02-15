import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import RisingSunKick from './RisingSunKick';
import RisingMist from './RisingMist';
import { SpellLink, TooltipElement } from 'interface';
import { getCurrentRSKTalent } from '../../constants';
import { Talent } from 'common/TALENTS/types';
import RushingWindKick from './RushingWindKick';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { formatNumber, formatPercentage } from 'common/format';

/*
 * Add in Statistic box to show average time between RSK casts when Rising Mist is talented.
 */
class TimeBetweenRSKs extends Analyzer {
  static dependencies = {
    risingSunKick: RisingSunKick,
    rushingWindKick: RushingWindKick,
  };

  protected risingSunKick!: RisingSunKick;
  protected rushingWindKick!: RushingWindKick;

  totalRSKCasts = 0;
  firstRSKTimestamp = 0;
  lastRSKTimestamp = 0;
  currentRskTalent: Talent;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.currentRskTalent), this.onRSK);
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

  substatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.rushingWindKick.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(22)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <TalentSpellText talent={this.currentRskTalent}>
          <div>
            {this.averageTimeBetweenRSKSeconds} <small>average time between casts</small>
          </div>
          <div>{this.risingSunKick.subStatistic()}</div>
          {this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT) && (
            <div>
              <TooltipElement
                content={
                  <>
                    {this.rushingWindKick.avgTargetsHit.toFixed(2)} average targets hit per{' '}
                    <SpellLink spell={TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT} /> cast
                  </>
                }
              >
                <ItemHealingDone amount={this.rushingWindKick.healing} />
              </TooltipElement>
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TimeBetweenRSKs;
