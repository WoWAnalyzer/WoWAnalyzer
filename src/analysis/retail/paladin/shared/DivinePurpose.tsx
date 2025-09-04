import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  ALL_HOLY_POWER_SPENDERS,
  DAMAGE_HOLY_POWER_SPENDERS,
  DIVINE_PURPOSE_CHANCE,
  HEALING_HOLY_POWER_SPENDERS,
  RET_DIVINE_PURPOSE_CHANCE,
} from './constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { AURORA_DIVINE_PURPOSE } from '../holy/normalizers/EventLinks/EventLinkConstants';
import SPECS from 'game/SPECS';

const BUFF_TIME: number = 12000 * 0.95; //add buffer since log events lmao
const TRACK_BUFFER = 500;

class DivinePurpose extends Analyzer {
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
  procProbabilities: number[] = [];

  constructor(args: Options) {
    super(args);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.DIVINE_PURPOSE_SHARED_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DIVINE_PURPOSE_RETRIBUTION_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(ALL_HOLY_POWER_SPENDERS),
      this.castCounter,
    );
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
      this.applyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF),
      this.removeBuff,
    );
    // Ret has a different version (and ID) of Divine Purpose probably thanks to balance nuances.
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF_RET),
      this.applyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF_RET),
      this.applyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF_RET),
      this.removeBuff,
    );
  }

  castCounter() {
    this.totalChances += 1;
    this.procProbabilities.push(
      this.selectedCombatant.spec === SPECS.RETRIBUTION_PALADIN
        ? RET_DIVINE_PURPOSE_CHANCE
        : DIVINE_PURPOSE_CHANCE,
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
    if (!HasRelatedEvent(event, AURORA_DIVINE_PURPOSE)) {
      this.hasProc = true;
      this.procsGained += 1;
      this.buffAppliedTimestamp = event.timestamp;
    }
  }

  removeBuff(event: RemoveBuffEvent) {
    const lowerRoughTime = this.buffAppliedTimestamp + BUFF_TIME;
    if (lowerRoughTime < event.timestamp) {
      this.procsWasted += 1;
    }
    this.averageTimeTillBuffConsumed += event.timestamp - this.buffAppliedTimestamp;
    this.buffRemovedTimestamp = event.timestamp;
    this.hasProc = false;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
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
        <TalentSpellText talent={TALENTS.DIVINE_PURPOSE_SHARED_TALENT}>
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
        {plotOneVariableBinomChart(this.procsGained, this.totalChances, this.procProbabilities)}
      </Statistic>
    );
  }
}

export default DivinePurpose;
