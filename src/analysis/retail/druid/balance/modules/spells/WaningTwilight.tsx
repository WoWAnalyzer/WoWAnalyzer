import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import Enemies from 'parser/shared/modules/Enemies';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { TrackedBuffEvent } from 'parser/core/Entity';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../constants';
import UptimeIcon from 'interface/icons/Uptime';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const WANING_TWILIGHT_BONUS_DAMAGE = 0.06;
const WT_COLOR = '#00bb44';

/**
 * **Waning Twilight**
 * Spec Talent
 *
 * When you have 3 periodic effects from your spells on a target, your damage and healing on them are increased by 6%.
 */
class WaningTwilight extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.WANING_TWILIGHT_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const target = this.enemies.enemies[`${event.targetID}.0`];
    const hasWaningTwilight = target?.hasBuff(SPELLS.WANING_TWILIGHT.id);
    if (hasWaningTwilight) {
      this.totalDamage += calculateEffectiveDamage(event, WANING_TWILIGHT_BONUS_DAMAGE);
    }
  }

  private get uptimePerc() {
    const events: OpenTimePeriod[] = [];
    const entities = this.enemies.getEntities();
    Object.values(entities).forEach((enemy) => {
      enemy
        .getBuffHistory(SPELLS.WANING_TWILIGHT.id, this.selectedCombatant.id)
        .forEach((buff: TrackedBuffEvent) => {
          events.push({
            start: buff.start,
            end: buff.end ?? this.owner.fight.end_time,
          });
        });
    });
    return events;
  }

  statistic() {
    const waningTwilightUptime = formatPercentage(
      this.enemies.getBuffUptime(SPELLS.WANING_TWILIGHT.id) / this.owner.fightDuration,
    );
    const dpsAdded = formatNumber(this.totalDamage / (this.owner.fightDuration / 1000));
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`You had ${waningTwilightUptime}% uptime on this talent which added ${dpsAdded} to your DPS.`}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.WANING_TWILIGHT_TALENT}>
          <>
            <UptimeIcon /> {waningTwilightUptime}% <small> uptime</small>
            <br />
            <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    this.enemies.getBuffUptime(SPELLS.WANING_TWILIGHT.id) / this.owner.fightDuration;

    const explanation = <></>;

    const data = (
      <div>
        <RoundedPanel>
          <strong>Waning Twilight Uptime</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.WANING_TWILIGHT],
        uptimes: mergeTimePeriods(this.uptimePerc, this.owner.currentTimestamp),
        color: WT_COLOR,
      },
      [],
      SubPercentageStyle.ABSOLUTE,
    );
  }
}

export default WaningTwilight;
