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

const WANING_TWILIGHT_BONUS_DAMAGE = 0.04;
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;
const WT_COLOR = '#00bb44';

class WaningTwilight extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  damageGotten = 0;
  talentRank: number;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.WANING_TWILIGHT_TALENT);
    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.WANING_TWILIGHT_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const target = this.enemies.enemies[`${event.targetID}.0`];
    const hasWaningTwilight = target?.hasBuff(393957);
    if (hasWaningTwilight) {
      this.damageGotten += calculateEffectiveDamage(
        event,
        WANING_TWILIGHT_BONUS_DAMAGE * this.talentRank,
      );
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
    const dpsAdded = formatNumber(this.damageGotten / (this.owner.fightDuration / 1000));
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`You had ${waningTwilightUptime}% uptime on this talent which added ${dpsAdded} to your DPS.`}
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.WANING_TWILIGHT_TALENT.id}>
          <>
            {waningTwilightUptime}% <small> uptime</small>
            <br />
            {dpsAdded} <small>DPS</small>
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
