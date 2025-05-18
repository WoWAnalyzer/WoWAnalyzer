import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  GetRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { DAMAGE_HOLY_POWER_SPENDERS, HEALING_HOLY_POWER_SPENDERS } from '../../../shared/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { AURORA_DIVINE_PURPOSE } from '../../normalizers/CastLinkNormalizer';

const BUFF_TIME: number = 12000 * 0.95; //add buffer since log events lmao
const TRACK_BUFFER = 500;

class Aurora extends Analyzer {
  averageTimeTillBuffConsumed = 0;

  hasProc = false;
  procsWasted = 0;
  procsGained = 0;

  healingDone = 0;
  overhealingDone = 0;
  damageDone = 0;

  buffAppliedTimestamp = 0;
  buffRemovedTimestamp = 0;

  totalChances = 0;

  constructor(args: Options) {
    super(args);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.DIVINE_PURPOSE_SHARED_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DIVINE_PURPOSE_RETRIBUTION_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_HOLY_POWER_SPENDERS),
      this.holyPowerDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HEALING_HOLY_POWER_SPENDERS),
      this.holyPowerHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF),
      this.applyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF),
      this.refreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF),
      this.removeBuff,
    );
  }

  holyPowerDamage(event: DamageEvent) {
    if (this.hasProc || this.buffRemovedTimestamp + TRACK_BUFFER > event.timestamp) {
      this.damageDone += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  holyPowerHeal(event: HealEvent) {
    if (this.hasProc || this.buffRemovedTimestamp + TRACK_BUFFER > event.timestamp) {
      this.healingDone += (event.amount || 0) + (event.absorbed || 0);
      this.overhealingDone += event.overheal || 0;
    }
  }

  applyBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (GetRelatedEvent(event, AURORA_DIVINE_PURPOSE)) {
      this.hasProc = true;
      this.procsGained += 1;
      this.buffAppliedTimestamp = event.timestamp;
    }
  }

  refreshBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (GetRelatedEvent(event, AURORA_DIVINE_PURPOSE)) {
      this.hasProc = true;
      this.procsGained += 1;
      this.buffAppliedTimestamp = event.timestamp;
      this.procsWasted += 1;
    }
  }

  removeBuff(event: RemoveBuffEvent) {
    if (this.hasProc) {
      const lowerRoughTime = this.buffAppliedTimestamp + BUFF_TIME;
      if (lowerRoughTime < event.timestamp) {
        this.procsWasted += 1;
      }
      this.averageTimeTillBuffConsumed += event.timestamp - this.buffAppliedTimestamp;
      this.buffRemovedTimestamp = event.timestamp;
      this.hasProc = false;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                Average Time Till Buff Consumed:{' '}
                {formatDuration(this.averageTimeTillBuffConsumed / this.procsGained)}
              </li>
              <li>Total Buffs: {this.procsGained}</li>
              <li>Wasted Buffs: {this.procsWasted}</li>
              <li>Damage: {formatNumber(this.damageDone)}</li>
              <li>Healing: {formatNumber(this.healingDone)}</li>
              <li>Overhealing: {formatNumber(this.overhealingDone)}</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.AURORA_TALENT}>
          {this.healingDone > 0 && (
            <>
              <ItemHealingDone amount={this.healingDone} /> <br />
            </>
          )}
          {this.damageDone > 0 && (
            <>
              <ItemDamageDone amount={this.damageDone} /> <br />
            </>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Aurora;
