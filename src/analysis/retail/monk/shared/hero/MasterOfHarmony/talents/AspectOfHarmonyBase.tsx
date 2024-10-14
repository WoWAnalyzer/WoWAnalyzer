import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  DamageEvent,
  EventType,
  HealEvent,
} from 'parser/core/Events';

interface CastInfo {
  totalDamage: number;
  overkill: number;
  totalHealing: number;
  overhealing: number;
  numBuffs: number;
  numDebuffs: number;
  startTime: number;
}

class AspectOfHarmonyBaseAnalyzer extends Analyzer {
  castEntries: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ASPECT_OF_HARMONY_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ASPECT_OF_HARMONY_HOT),
      this.onPeriodicApply,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.ASPECT_OF_HARMONY_DOT),
      this.onPeriodicApply,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDmg);
  }

  initEntry(
    event: ApplyBuffEvent | ApplyDebuffEvent | HealEvent | DamageEvent,
  ): CastInfo | undefined {
    // normal init case is for aspect buff apply or for catching pre-pull TFT/CB
    if (event.ability.guid === SPELLS.ASPECT_OF_HARMONY_BUFF.id || !this.castEntries.length) {
      this.castEntries.push({
        totalDamage: 0,
        overkill: 0,
        totalHealing: 0,
        overhealing: 0,
        numBuffs: 0,
        numDebuffs: 0,
        startTime: event.timestamp,
      });
    }
    return this.castEntries.at(-1);
  }

  onPeriodicApply(event: ApplyBuffEvent | ApplyDebuffEvent) {
    const entry = this.initEntry(event);
    if (entry) {
      if (event.type === EventType.ApplyBuff) {
        entry.numBuffs += 1;
      } else {
        entry.numDebuffs += 1;
      }
    }
  }

  onHeal(event: HealEvent) {
    // coalesence doesn't buff Aspect HOT
    if (event.ability.guid === SPELLS.ASPECT_OF_HARMONY_HOT.id) {
      return;
    }
    const entry = this.initEntry(event);
    if (entry) {
      entry.totalHealing += event.amount;
      entry.overhealing += event.overheal || 0;
    }
  }

  onDmg(event: DamageEvent) {
    if (event.ability.guid === SPELLS.ASPECT_OF_HARMONY_DOT.id) {
      return;
    }
    const entry = this.initEntry(event);
    if (entry) {
      entry.totalDamage += event.amount;
      entry.overkill += event.overkill || 0;
    }
  }

  getCastEntries(): CastInfo[] {
    return this.castEntries;
  }
}

export default AspectOfHarmonyBaseAnalyzer;
