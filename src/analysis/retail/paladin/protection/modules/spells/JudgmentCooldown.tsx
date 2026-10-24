import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { ChangeHasteEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Haste from 'parser/shared/modules/Haste';
import Wings from '../core/Wings';
import GrandCrusader from '../talents/GrandCrusader';
import RechargeProgress from './RechargeProgress';

const BASE_COOLDOWN_MS = 5000;

export default class JudgmentCooldown extends Analyzer.withDependencies({
  abilities: Abilities,
  haste: Haste,
  wings: Wings,
  grandCrusader: GrandCrusader,
}) {
  charges = 1;
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
      this.charges = 2;
    }

    this.deps.abilities.add({
      spell: SPELLS.JUDGMENT_CAST_PROTECTION.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => BASE_COOLDOWN_MS / 1000 / (1 + haste),
      charges: this.charges,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        maxCasts: () => this.maxCastsOutsideWings(),
      },
    });
  }

  get windowsOutsideWings(): [number, number][] {
    const windows: [number, number][] = [];
    let start = this.owner.fight.start_time;
    this.deps.wings.windows.forEach(([wingsStart, wingsEnd]) => {
      if (wingsStart > start) {
        windows.push([start, wingsStart]);
      }
      start = Math.max(start, wingsEnd);
    });
    if (this.owner.fight.end_time > start) {
      windows.push([start, this.owner.fight.end_time]);
    }
    return windows;
  }

  private onChangeHaste(event: ChangeHasteEvent) {
    this.recharge.changeHaste(event.timestamp, event.newHaste);
  }

  private rechargesBetween(start: number, end: number) {
    const resets = this.deps.grandCrusader
      .resetsBetween(start, end)
      .map((reset) => reset.timestamp);
    return (
      this.recharge.between(start, end) +
      this.recharge.reductionProgress(resets, this.deps.grandCrusader.cooldownReduction)
    );
  }

  private maxCastsOutsideWings() {
    return this.windowsOutsideWings.reduce(
      (total, [start, end]) => total + this.charges + Math.floor(this.rechargesBetween(start, end)),
      0,
    );
  }
}
