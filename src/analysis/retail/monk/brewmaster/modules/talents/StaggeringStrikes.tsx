import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import StaggerStatistic from '../tools/StaggerAnalyzer';
import { GoodColor, OkColor } from 'interface/guide';
import { formatNumber, formatPercentage } from 'common/format';

const AP_RATIO = 10; // yes, 10x. not a typo
const HEALTH_BONUS_RATIO = 2; // 300% effectiveness at 0% HP (i think -- untested. will validate once we get `staggerclear`)

// TODO (@emallson): on beta there is no `staggerclear` for this effect, hopefully this is fixed later
export default class StaggeringStrikes extends StaggerStatistic {
  protected rank: number;

  constructor(options: Options) {
    super(talents.STAGGERING_STRIKES_TALENT, options);

    this.rank = this.selectedCombatant.getTalentRank(talents.STAGGERING_STRIKES_TALENT);
    this.active = this.rank > 0;

    this.addEventListener(Events.cast.spell(SPELLS.BLACKOUT_KICK_BRM), this.onKick);
  }

  private onKick(event: CastEvent) {
    // not attempting to compensate for missing attack power, it is insanely
    // rare from what i've seen. we accept the loss to reduce complexity.
    if (!event.attackPower) {
      return;
    }

    const hpPercent = (event.hitPoints ?? 1) / (event.maxHitPoints ?? 1);

    const amount = event.attackPower * AP_RATIO * (1 + HEALTH_BONUS_RATIO * (1 - hpPercent));
    this.removeStagger(event, amount);

    this.addDebugAnnotation(event, {
      color: event.hitPoints !== undefined ? GoodColor : OkColor,
      summary: `Removed up to ${formatNumber(amount)} Stagger`,
      details: (
        <dl>
          <dt>Attack Power</dt>
          <dd>{formatNumber(event.attackPower)}</dd>
          <dt>Hit Points (%)</dt>
          <dd>
            {event.hitPoints} ({formatPercentage(hpPercent, 2)}%)
          </dd>
        </dl>
      ),
    });
  }
}
