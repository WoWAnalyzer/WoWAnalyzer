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
import Combatants from 'parser/shared/modules/Combatants';

export interface CastInfo {
  totalDamage: number;
  overkill: number;
  totalHealing: number;
  overhealing: number;
  numBuffs: number;
  numDebuffs: number;
  startTime: number;
}

class AspectOfHarmonyBaseAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  castEntries: CastInfo[] = [];
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ASPECT_OF_HARMONY_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ASPECT_OF_HARMONY_BUFF),
      this.onBuffApply,
    );
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

  // initializes entry if Aspect buff or a pre-pull damage/heal/apply HoT/DoT event
  // if Damage/Heal/Apply Hot/DoT and not pre-pull, then just return latest entry
  initAndGetEntry(
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

  onBuffApply(event: ApplyBuffEvent) {
    this.initAndGetEntry(event);
  }

  onPeriodicApply(event: ApplyBuffEvent | ApplyDebuffEvent) {
    const entry = this.initAndGetEntry(event);
    if (entry) {
      if (event.type === EventType.ApplyBuff) {
        // dont care about buffs on pets
        if (this.combatants.getEntity(event)) {
          entry.numBuffs += 1;
        }
      } else {
        entry.numDebuffs += 1;
      }
    }
  }

  onHeal(event: HealEvent) {
    const entity = this.combatants.getEntity(event);
    if (!entity || !entity.hasBuff(SPELLS.ASPECT_OF_HARMONY_BUFF.id)) {
      return;
    }
    const entry = this.initAndGetEntry(event);
    if (entry) {
      entry.totalHealing += event.amount;
      entry.overhealing += event.overheal || 0;
    }
  }

  onDmg(event: DamageEvent) {
    const entry = this.initAndGetEntry(event);
    if (entry) {
      entry.totalDamage += event.amount;
      entry.overkill += event.overkill || 0;
    }
  }

  get avgDots(): number {
    return (
      this.castEntries.reduce((prev: number, cur: CastInfo) => {
        return prev + cur.numDebuffs;
      }, 0) / this.castEntries.length
    );
  }

  get avgHots(): number {
    return (
      this.castEntries.reduce((prev: number, cur: CastInfo) => {
        return prev + cur.numBuffs;
      }, 0) / this.castEntries.length
    );
  }
}

export default AspectOfHarmonyBaseAnalyzer;
