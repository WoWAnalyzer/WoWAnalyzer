import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ChangeHasteEvent, RefreshBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Haste from 'parser/shared/modules/Haste';
import RechargeProgress from './RechargeProgress';

const CHARGES = 2;
const BASE_COOLDOWN_MS = 5000;
export const CRUSADERS_JUDGMENT_CDR = 3000;

export default class HammerOfWrath extends ExecuteHelper.withDependencies({
  abilities: Abilities,
  haste: Haste,
}) {
  static executeSpells: Spell[] = [SPELLS.HAMMER_OF_WRATH_PROTECTION];
  static executeSources = SELECTED_PLAYER;
  static executeOutsideRangeEnablers: Spell[] = [TALENTS.AVENGING_WRATH_TALENT, SPELLS.SENTINEL];
  static lowerThreshold = -1;

  recharge: RechargeProgress;

  constructor(options: Options) {
    super(options);

    this.recharge = new RechargeProgress(
      BASE_COOLDOWN_MS,
      this.owner.fight.start_time,
      this.deps.haste.current,
    );
    this.addEventListener(Events.ChangeHaste, this.onChangeHaste);

    if (this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
        this.onGrandCrusaderProc,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
        this.onGrandCrusaderProc,
      );
    }

    this.deps.abilities.add({
      spell: SPELLS.HAMMER_OF_WRATH_PROTECTION.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => BASE_COOLDOWN_MS / 1000 / (1 + haste),
      charges: CHARGES,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        maxCasts: () => this.maxCastsDuringWings(),
      },
    });
  }

  private onChangeHaste(event: ChangeHasteEvent) {
    this.recharge.changeHaste(event.timestamp, event.newHaste);
  }

  private onGrandCrusaderProc(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.recharge.reduceCooldown(event.timestamp, CRUSADERS_JUDGMENT_CDR);
    this.spellUsable.reduceCooldown(
      SPELLS.HAMMER_OF_WRATH_PROTECTION.id,
      CRUSADERS_JUDGMENT_CDR,
      event.timestamp,
    );
  }

  get wingsWindows(): [number, number][] {
    const windows = this.executeRanges
      .map((range): [number, number] => [range.startEvent.timestamp, range.endEvent.timestamp])
      .sort((a, b) => a[0] - b[0]);
    return windows.reduce<[number, number][]>((merged, [start, end]) => {
      const last = merged.at(-1);
      if (last && start <= last[1]) {
        last[1] = Math.max(last[1], end);
      } else {
        merged.push([start, end]);
      }
      return merged;
    }, []);
  }

  private maxCastsDuringWings() {
    return this.wingsWindows.reduce(
      (total, [start, end]) => total + CHARGES + Math.floor(this.recharge.between(start, end)),
      0,
    );
  }
}
