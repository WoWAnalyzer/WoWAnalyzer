import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { DIVINE_PURPOSE_CHANCE } from './constants';

const HEALING_HOLY_POWER_SPELLS: Spell[] = [
  SPELLS.WORD_OF_GLORY,
  SPELLS.LIGHT_OF_DAWN_HEAL,
  TALENTS.LIGHT_OF_DAWN_TALENT,
];
const DAMAGE_HOLY_POWER_SPELLS: Spell[] = [
  SPELLS.SHIELD_OF_THE_RIGHTEOUS,
  SPELLS.TEMPLARS_VERDICT,
  SPELLS.TEMPLARS_VERDICT_DAMAGE,
  SPELLS.DIVINE_STORM_DAMAGE,
  SPELLS.FINAL_VERDICT_FINISHER,
  TALENTS.DIVINE_STORM_TALENT,
  TALENTS.JUSTICARS_VENGEANCE_TALENT,
  TALENTS.EXECUTION_SENTENCE_TALENT,
];
const BUFF_HOLY_POWER_SPELLS: Spell[] = [TALENTS.SERAPHIM_TALENT];
const ALL_HOLY_POWER_SPELLS: Spell[] = [
  ...HEALING_HOLY_POWER_SPELLS,
  ...DAMAGE_HOLY_POWER_SPELLS,
  ...BUFF_HOLY_POWER_SPELLS,
];

const BUFF_TIME: number = 12000 * 0.95; //add buffer since log events lmao
const TRACK_BUFFER = 500;

class DivinePurpose extends Analyzer {
  averageTimeTillBuffConsumed: number = 0;

  hasProc: boolean = false;
  procsWasted: number = 0;
  procsGained: number = 0;

  healingDone: number = 0;
  overhealingDone: number = 0;
  damageDone: number = 0;

  buffAppliedTimestamp: number = 0;
  buffRemovedTimestamp: number = 0;

  totalChances: number = 0;
  procProbabilities: number[] = [];

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_PURPOSE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(ALL_HOLY_POWER_SPELLS),
      this.castCounter,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_HOLY_POWER_SPELLS),
      this.holyPowerDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HEALING_HOLY_POWER_SPELLS),
      this.holyPowerHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF),
      this.applyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF),
      this.removeBuff,
    );
  }

  castCounter() {
    this.totalChances += 1;
    this.procProbabilities.push(DIVINE_PURPOSE_CHANCE);
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

  applyBuff(event: ApplyBuffEvent) {
    this.hasProc = true;
    this.procsGained += 1;
    this.buffAppliedTimestamp = event.timestamp;
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
              <li>Damage: {formatNumber(this.damageDone)}</li>
              <li>Healing: {formatNumber(this.healingDone)}</li>
              <li>Overhealing: {formatNumber(this.overhealingDone)}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.DIVINE_PURPOSE_TALENT.id}>
          <ItemDamageDone amount={this.damageDone} /> <br />
          <ItemHealingDone amount={this.healingDone} />
        </BoringSpellValueText>
        {plotOneVariableBinomChart(this.procsGained, this.totalChances, this.procProbabilities)}
      </Statistic>
    );
  }
}

export default DivinePurpose;
