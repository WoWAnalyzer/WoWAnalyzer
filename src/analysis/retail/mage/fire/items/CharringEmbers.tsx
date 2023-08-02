import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { TIERS } from 'game/TIERS';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { EventType } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import EventHistory from 'parser/shared/modules/EventHistory';
import CooldownHistory from 'parser/shared/modules/CooldownHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class CharringEmbers extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    eventHistory: EventHistory,
    cooldownHistory: CooldownHistory,
    spellUsable: SpellUsable,
  };
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;
  protected cooldownHistory!: CooldownHistory;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T30);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PHOENIX_FLAMES_DAMAGE),
      this.onPhoenixDamage,
    );
  }

  onPhoenixDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.FLAMES_FURY.id)) {
      return;
    }
    const cast = this.eventHistory.getEvents(EventType.Cast, {
      spell: TALENTS.PHOENIX_FLAMES_TALENT,
      count: 1,
      duration: 1000,
    })[0];
    const castTarget = encodeTargetString(cast.targetID || 0, cast.targetInstance);
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (castTarget === damageTarget) {
      this.spellUsable.reduceCooldown(TALENTS.PHOENIX_FLAMES_TALENT.id, 25000);
    }
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
