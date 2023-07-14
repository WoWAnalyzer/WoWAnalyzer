import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { TIERS } from 'game/TIERS';
import { formatPercentage } from 'common/format';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import EventHistory from 'parser/shared/modules/EventHistory';
import CooldownHistory from 'parser/shared/modules/CooldownHistory';

class CharringEmbers extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    eventHistory: EventHistory,
    cooldownHistory: CooldownHistory,
  };
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;
  protected cooldownHistory!: CooldownHistory;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T30);
  }

  charringEmbersUptime = () => {
    const history = this.enemies.getDebuffHistory(SPELLS.CHARRING_EMBERS_DEBUFF.id);
    let uptime = 0;
    history.forEach((d) => (uptime += d.end - d.start));
    return uptime;
  };

  noPhoenixFlames = () => {
    const buffApplies = this.eventHistory.getEvents(EventType.ApplyBuff, {
      spell: SPELLS.FLAMES_FURY,
    });
    let noPhoenixFlames = 0;
    buffApplies.forEach((buff) => {
      if (!this.cooldownHistory.wasAvailable(TALENTS.PHOENIX_FLAMES_TALENT.id, buff.timestamp)) {
        noPhoenixFlames += 1;
      }
    });
    return noPhoenixFlames;
  };

  get uptimePercent() {
    return this.charringEmbersUptime() / this.owner.fightDuration;
  }

  get noPhoenixFlamesThresholds() {
    return {
      actual: this.noPhoenixFlames(),
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible" tooltip={<>PLACEHOLDER</>}>
        <BoringSpellValueText spell={SPELLS.CHARRING_EMBERS_DEBUFF}>
          <>
            {formatPercentage(this.uptimePercent, 2)}% <small>Charring Embers Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CharringEmbers;
