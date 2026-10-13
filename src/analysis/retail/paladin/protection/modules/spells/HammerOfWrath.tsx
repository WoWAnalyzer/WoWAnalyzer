import SPELLS from 'common/SPELLS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { ChangeHasteEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Haste from 'parser/shared/modules/Haste';
import Wings from '../core/Wings';
import GrandCrusader from '../talents/GrandCrusader';
import RechargeProgress from './RechargeProgress';

const CHARGES = 2;
const BASE_COOLDOWN_MS = 5000;

export default class HammerOfWrath extends Analyzer.withDependencies({
  abilities: Abilities,
  haste: Haste,
  grandCrusader: GrandCrusader,
  wings: Wings,
}) {
  recharge: RechargeProgress;

  constructor(options: Options) {
    super(options);

    this.recharge = new RechargeProgress(
      BASE_COOLDOWN_MS,
      this.owner.fight.start_time,
      this.deps.haste.current,
    );
    this.addEventListener(Events.ChangeHaste, this.onChangeHaste);

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

  private rechargesBetween(start: number, end: number) {
    const resets = this.deps.grandCrusader
      .resetsBetween(start, end)
      .map((reset) => reset.timestamp);
    return (
      this.recharge.between(start, end) +
      this.recharge.reductionProgress(resets, this.deps.grandCrusader.cooldownReduction)
    );
  }

  private maxCastsDuringWings() {
    return this.deps.wings.windows.reduce(
      (total, [start, end]) => total + CHARGES + Math.floor(this.rechargesBetween(start, end)),
      0,
    );
  }
}
