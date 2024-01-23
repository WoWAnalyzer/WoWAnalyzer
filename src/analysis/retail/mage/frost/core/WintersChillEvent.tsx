import {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { SpellSeq } from 'parser/ui/SpellSeq';
import Spell from 'common/SPELLS/Spell';

const WINTERS_CHILL_SPENDERS = [SPELLS.ICE_LANCE_DAMAGE.id, SPELLS.GLACIAL_SPIKE_DAMAGE.id];

class WintersChillEvent {
  apply: ApplyDebuffEvent;
  remove: RemoveDebuffEvent | undefined;
  precast: CastEvent | undefined;
  precastIcicles: number;
  damageEvents: DamageEvent[];
  flurry: CastEvent | undefined;

  constructor(
    apply: ApplyDebuffEvent,
    remove: RemoveDebuffEvent | undefined,
    precast: CastEvent | undefined,
    precastIcicles: number,
    flurry: CastEvent | undefined,
  ) {
    this.apply = apply;
    this.remove = remove;
    this.precast = precast;
    this.precastIcicles = precastIcicles;
    this.damageEvents = [];
    this.flurry = flurry;
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
      message = 'Stacks not used';
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
    const spellsArray: Spell[] = Object.values(SPELLS);
    const precast: Spell | undefined = spellsArray.find(
      (spell) => spell.id === this.precast?.ability.guid,
    );
    const flurry: Spell | undefined = spellsArray.find(
      (spell) => spell.id === this.flurry?.ability.guid,
    );
    const spells: Spell[] = [];
    if (precast) {
      spells.push(precast);
    }
    if (flurry) {
      spells.push(flurry);
    }
    this.damageEvents.forEach((damage) => {
      const spell: Spell | undefined = spellsArray.find(
        (spell) => spell.id === damage.ability.guid,
      );
      if (spell) {
        spells.push(spell);
      }
    });
    const tooltip = (
      <>
        <PerformanceMark perf={this.getPrecastPerformance()} />
        {this.getPrecastPerformanceMessage()} <br />
        <PerformanceMark perf={this.getShatterPerformance()} />
        {this.getShatterPerformanceMessage()} <br />
        <SpellSeq spells={spells} />
      </>
    );
    return tooltip;
  }
}

export default WintersChillEvent;
