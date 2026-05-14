import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  INFERNOS_BLESSING_BASE_DURATION_MS,
  MIGHTY_INFERNO_DAMAGE_MULTIPLIER,
  TIMEWALKER_BASE_EXTENSION,
} from '../../constants';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';
import StatTracker from 'parser/shared/modules/StatTracker';
import { InformationIcon } from 'interface/icons';
import { SpellLink } from 'interface/index';

interface infernoApplication {
  playerID: number;
  baseEndTimestamp: number;
}

/**
 * Inferno's Blessing deals 40% increased damage.
 */
class MightyInferno extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;
  ampedDamage = 0;
  extensionDamage = 0;
  infernoApps: infernoApplication[] = [];
  totalInfernosExtension = 0;
  // This can mess with the results.
  hasReceivedExternalInfernos = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIGHTY_INFERNO_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_DAMAGE),
      this.onDamage,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
      this.onReceiveBuff,
    );
  }

  onDamage(event: DamageEvent) {
    const playerId = event.supportID ? event.supportID : event.sourceID;
    if (
      this.hasReceivedExternalInfernos &&
      playerId === this.selectedCombatant.id &&
      !this.selectedCombatant.hasOwnBuff(SPELLS.INFERNOS_BLESSING_BUFF.id)
    ) {
      // This damage belongs to another Aug
      return;
    }
    const ampDamage = calculateEffectiveDamage(event, MIGHTY_INFERNO_DAMAGE_MULTIPLIER);
    this.ampedDamage += ampDamage;
    const index = this.infernoApps.findIndex((app) => app.playerID === playerId);
    if (index === -1) {
      return;
    }
    if (event.timestamp - this.infernoApps[index].baseEndTimestamp) {
      this.extensionDamage += event.amount - ampDamage;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.onInfernosApply(event.targetID, event.timestamp);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.onInfernosRemove(event.targetID, event.timestamp);
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.onInfernosRemove(event.targetID, event.timestamp);
    this.onInfernosApply(event.targetID, event.timestamp);
  }

  onFightEnd(event: FightEndEvent) {
    this.infernoApps.forEach((app) => this.onInfernosRemove(app.playerID, event.timestamp));
  }

  onInfernosApply(targetID: number, timestamp: number) {
    this.infernoApps.push({
      playerID: targetID,
      baseEndTimestamp:
        timestamp +
        INFERNOS_BLESSING_BASE_DURATION_MS *
          (1 + TIMEWALKER_BASE_EXTENSION + this.stats.currentMasteryPercentage),
    });
  }

  onReceiveBuff(event: ApplyBuffEvent) {
    if (event.sourceID != this.owner.selectedCombatant.id) {
      this.hasReceivedExternalInfernos = true;
    }
  }

  onInfernosRemove(targetID: number, timestamp: number) {
    const index = this.infernoApps.findIndex((app) => app.playerID === targetID);
    if (index === -1) {
      return;
    }
    // While refreshing Inferno's Blessing with Fire Breath will appear to set the duration to 10 or 11 sec,
    // this is actually 8 sec and then immediately being extended by 2 or 3 sec.
    const extensionValue = timestamp - this.infernoApps[index].baseEndTimestamp;
    if (extensionValue > 0) {
      this.totalInfernosExtension += extensionValue;
    }
    this.infernoApps.splice(index, 1);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage from amp: {formatNumber(this.ampedDamage)}</li>
            <li>Damage from extension: {formatNumber(this.extensionDamage)}</li>
            {this.hasReceivedExternalInfernos && (
              <li>
                You received {<SpellLink spell={TALENTS.INFERNOS_BLESSING_TALENT} />} from another
                Evoker, which can cause these damage numbers to be too large.
              </li>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MIGHTY_INFERNO_TALENT}>
          <div>
            <ItemDamageDone amount={this.ampedDamage + this.extensionDamage} />
          </div>
          <div>
            <InformationIcon /> {formatNumber(this.totalInfernosExtension / 1000)} sec
            <small> extra duration granted</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MightyInferno;
