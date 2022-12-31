import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { ApplyDebuffEvent, DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
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

const WANING_TWILIGHT_BONUS_DAMAGE = 0.04;
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;
const WT_COLOR = '#00bb44';

class WaningTwilight extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  missedDamage = 0;
  damageGotten = 0;
  waningTwilightUptime = 0;
  talentRank: number;
  waningTwilightUptimes: OpenTimePeriod[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.WANING_TWILIGHT_TALENT);
    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.WANING_TWILIGHT_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WANING_TWILIGHT),
      this.onApplyWaningTwilight,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.WANING_TWILIGHT),
      this.onRemoveWaningTwilight,
    );
  }

  onApplyWaningTwilight(event: ApplyDebuffEvent) {
    this.waningTwilightUptimes.push({ start: event.timestamp });
  }

  onRemoveWaningTwilight(event: RemoveDebuffEvent) {
    this.waningTwilightUptimes[this.waningTwilightUptimes.length - 1].end = event.timestamp;
  }

  onDamage(event: DamageEvent) {
    const target = this.enemies.enemies[`${event.targetID}.0`];
    const hasWaningTwilight = target?.hasBuff(393957);
    if (hasWaningTwilight) {
      this.damageGotten += calculateEffectiveDamage(
        event,
        WANING_TWILIGHT_BONUS_DAMAGE * this.talentRank,
      );
    } else {
      this.missedDamage += event.amount * 0.04;
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
    this.waningTwilightUptime =
      this.enemies.getBuffUptime(SPELLS.WANING_TWILIGHT.id) / this.owner.fightDuration;
    console.log(this.owner.fightDuration);
    return (
      <Statistic position={STATISTIC_ORDER.CORE(7)} size="flexible">
        <BoringSpellValueText spellId={TALENTS_DRUID.WANING_TWILIGHT_TALENT.id}>
          <>
            {formatPercentage(this.waningTwilightUptime)} % <small> uptime</small>
            <br />
            {formatNumber(this.damageGotten / (this.owner.fightDuration / 1000))} <small>DPS</small>
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
