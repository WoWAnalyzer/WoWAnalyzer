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

interface infernoApplication {
  playerID: number;
  timestamp: number;
  baseInfernosDuration: number;
}

/**
 * Inferno's Blessing deals 40% increased damage.
 * Sands of Time also extends Inferno's Blessing. [NYI]
 */
class MightyInferno extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;
  damage = 0;
  infernoApps: infernoApplication[] = [];
  totalInfernosExtension = 0;

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
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, MIGHTY_INFERNO_DAMAGE_MULTIPLIER);
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
    Object.keys(this.infernoApps).forEach((targetID) => {
      this.onInfernosRemove(Number(targetID), event.timestamp);
    });
  }

  onInfernosApply(targetID: number, timestamp: number) {
    this.infernoApps.push({
      playerID: targetID,
      timestamp,
      baseInfernosDuration:
        (INFERNOS_BLESSING_BASE_DURATION_MS *
          (1 + TIMEWALKER_BASE_EXTENSION + this.stats.currentMasteryPercentage)) /
        1000,
    });
  }

  onInfernosRemove(targetID: number, timestamp: number) {
    const index = this.infernoApps.findIndex((app) => app.playerID === targetID);
    if (index === -1) {
      return;
    }
    const infernosDuration = (timestamp - this.infernoApps[index].timestamp) / 1000;
    // While refreshing Inferno's Blessing with Fire Breath will appear to set the duration to 10 or 11 sec,
    // this is actually 8 sec and then immediately being extended by 2 or 3 sec.
    const extensionValue = infernosDuration - this.infernoApps[index].baseInfernosDuration;
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
      >
        <TalentSpellText talent={TALENTS.MIGHTY_INFERNO_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <div></div>
          <InformationIcon /> {formatNumber(this.totalInfernosExtension)} sec
          <small> extra duration granted</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MightyInferno;
