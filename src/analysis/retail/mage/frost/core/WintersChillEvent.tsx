import {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import SPELLS, { maybeGetSpell } from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { SpellSeq } from 'parser/ui/SpellSeq';
import Spell from 'common/SPELLS/Spell';
import { Enchant } from 'common/ITEMS/Item';

const WINTERS_CHILL_SPENDERS = [SPELLS.ICE_LANCE_DAMAGE.id, SPELLS.GLACIAL_SPIKE_DAMAGE.id];

class WintersChillEvent {
  apply: ApplyDebuffEvent;
  remove: RemoveDebuffEvent | undefined;
  precast: CastEvent | undefined;
  precastIcicles: number;
  damageEvents: DamageEvent[];
  applier: CastEvent | undefined;

  constructor(
    apply: ApplyDebuffEvent,
    remove: RemoveDebuffEvent | undefined,
    precast: CastEvent | undefined,
    precastIcicles: number,
    applier: CastEvent | undefined,
  ) {
    this.apply = apply;
    this.remove = remove;
    this.precast = precast;
    this.precastIcicles = precastIcicles;
    this.damageEvents = [];
    this.applier = applier;
  }

  comesFromFlurry(): boolean {
    return this.applier?.ability.guid === TALENTS.FLURRY_TALENT.id || false;
  }

  hasTwoShatteredSpells(): boolean {
    const shatteredSpenders = this.damageEvents.filter((damage) =>
      WINTERS_CHILL_SPENDERS.includes(damage.ability.guid),
    );
    return shatteredSpenders.length >= 2;
  }

  hasOneSpellAndRayOfFrost(): boolean {
    const shatteredSpenders = this.damageEvents.filter((d) =>
      WINTERS_CHILL_SPENDERS.includes(d.ability.guid),
    );
    const rayHits = this.damageEvents.filter(
      (d) => d.ability.guid === TALENTS.RAY_OF_FROST_TALENT.id,
    );
    return shatteredSpenders.length === 1 && rayHits.length > 2;
  }

  getShatterPerformance(): QualitativePerformance {
    if (this.hasTwoShatteredSpells() || this.hasOneSpellAndRayOfFrost()) {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Fail;
  }

  getShatterPerformanceMessage(): string {
    let message = '';
    if (!this.hasTwoShatteredSpells() && !this.hasOneSpellAndRayOfFrost()) {
      message = 'Stacks not used or miss used';
    } else if (this.hasTwoShatteredSpells()) {
      message = '2 spells shattered';
    } else if (this.hasOneSpellAndRayOfFrost()) {
      message = '1 spell and Ray of Frost shattered';
    }
    return message;
  }

  getPrecastPerformance(): QualitativePerformance {
    let performance = QualitativePerformance.Fail;
    if (this.precast && this.precastInDamageEvents()) {
      performance = QualitativePerformance.Good;
    } else if (!this.precast && this.precastIcicles === 4) {
      performance = QualitativePerformance.Good;
    } else if (this.precast && !this.precastInDamageEvents()) {
      performance = QualitativePerformance.Fail;
    } else if (!this.precast) {
      performance = QualitativePerformance.Fail;
    }
    return performance;
  }

  getPrecastPerformanceMessage(): string {
    let message = 'Unknown fail';
    if (this.precast && this.precastInDamageEvents()) {
      message = 'Precast shattered';
    } else if (!this.precast && this.precastIcicles === 4) {
      message = 'No precast on 4 icicles';
    } else if (this.precast && !this.precastInDamageEvents()) {
      message = 'Precast not shattered';
    } else if (!this.precast) {
      message = 'No precast';
    }
    return message;
  }

  getPerformance(): QualitativePerformance {
    let performance = QualitativePerformance.Fail;
    if (
      this.getPrecastPerformance() === QualitativePerformance.Good &&
      this.getShatterPerformance() === QualitativePerformance.Good
    ) {
      performance = QualitativePerformance.Good;
    }
    return performance;
  }

  precastInDamageEvents() {
    const preCastDamage: DamageEvent | undefined =
      this.precast && GetRelatedEvent(this.precast, 'SpellDamage');
    return preCastDamage && this.damageEvents.includes(preCastDamage);
  }

  getPerformanceDetails(): JSX.Element {
    const precast: Spell | undefined = maybeGetSpell(this.precast?.ability.guid);
    const applier: Spell | undefined = maybeGetSpell(this.applier?.ability.guid);

    const spells: Spell[] = [];
    if (precast) {
      spells.push(precast);
    }
    if (applier) {
      spells.push(applier);
    }

    const damageSpells = this.damageEvents
      .map((damage) => SPELLS[damage.ability.guid])
      .filter((spell) => spell); // filters undefined

    // Delete the precast from the damage side
    if (damageSpells.length > 0 && precast && damageSpells[0].icon === precast.icon) {
      damageSpells.shift();
    }

    damageSpells.filter(this.removeRayOfFrostTicks).forEach((spell) => spells.push(spell));

    const tooltip = (
      <>
        <div>
          <PerformanceMark perf={this.getPrecastPerformance()} />{' '}
          {this.getPrecastPerformanceMessage()}
        </div>
        <div>
          <PerformanceMark perf={this.getShatterPerformance()} />{' '}
          {this.getShatterPerformanceMessage()}
        </div>
        <SpellSeq spells={spells} />
      </>
    );
    return tooltip;
  }

  removeRayOfFrostTicks = (spell: Spell | Enchant, pos: number, arr: (Spell | Enchant)[]) => {
    return this._isNotRayOfFrostTick(pos, spell, arr);
  };

  private _isNotRayOfFrostTick(pos: number, spell: Spell, arr: Spell[]) {
    return pos === 0 || spell.id !== TALENTS.RAY_OF_FROST_TALENT.id || spell !== arr[pos - 1];
  }
}

export default WintersChillEvent;
