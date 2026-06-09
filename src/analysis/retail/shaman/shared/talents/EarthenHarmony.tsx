import SPELLS from 'common/SPELLS/shaman';
import talents from 'common/TALENTS/shaman';
import { WCLDamageTaken, WCLDamageTakenTableResponse } from 'common/WCL_TYPES';
import fetchWcl from 'common/fetchWclApi';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, EventType, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import {
  healingIncreases,
} from '../../restoration/constants';
import Combatants from 'parser/shared/modules/Combatants';

class EarthenHarmony extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  eSApply = -1;
  eOESApply = -1;
  firstESBuffDone = false;
  firstEOESBuffDone = false;
  damageTakenWithEarthShield = 0;
  damageTakenWithElementalOrbitEarthShield = 0;
  earthShieldHealing = 0;
  elementalOrbitEarthShieldHealing = 0;
  elementalOrbitActive = false;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.EARTHEN_HARMONY_TALENT);
    this.elementalOrbitActive = this.selectedCombatant.hasTalent(talents.ELEMENTAL_ORBIT_TALENT);

    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
      this.onEarthShieldHeal,
    );
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([talents.EARTH_SHIELD_TALENT, SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF]),
      this.onEarthShieldApply,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([talents.EARTH_SHIELD_TALENT, SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF]),
      this.onEarthShieldRemove,
    );
    this.loadDamageTakenDuringEarthShield(talents.EARTH_SHIELD_TALENT.id);
    if (this.elementalOrbitActive) {
      this.loadDamageTakenDuringEarthShield(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id);
    }
  }

  get totalHealing() {
    return this.earthShieldHealing + this.elementalOrbitEarthShieldHealing;
  }

  get earthShielddamageReduced() {
    return (
      (this.damageTakenWithEarthShield / (1 - healingIncreases.EARTHEN_HARMONY_DAMAGE_REDUCTION)) *
      healingIncreases.EARTHEN_HARMONY_DAMAGE_REDUCTION
    );
  }

  get elementalOrbitDamageReduced() {
    return (
      (this.damageTakenWithElementalOrbitEarthShield / (1 - healingIncreases.EARTHEN_HARMONY_DAMAGE_REDUCTION)) *
      healingIncreases.EARTHEN_HARMONY_DAMAGE_REDUCTION
    );
  }

  get totalDamageReduction() {
    return this.earthShielddamageReduced + this.elementalOrbitDamageReduced;
  }

  onEarthShieldApply(event: ApplyBuffEvent) {
    if (event.ability.guid === talents.EARTH_SHIELD_TALENT.id) {
      this.eSApply = event.timestamp;
    } else {
      this.eOESApply = event.timestamp;
    }
  }
  onEarthShieldRemove(event: RemoveBuffEvent) {
    if (
      event.ability.guid === talents.EARTH_SHIELD_TALENT.id &&
      this.eSApply !== -1 &&
      !this.firstESBuffDone
    ) {
      this.loadFirstBuffDamageTakenDuringEarthShield(
        this.eSApply,
        event.timestamp,
        talents.EARTH_SHIELD_TALENT.id,
        event.targetID,
      );
      this.firstESBuffDone = true;
    } else if (this.eOESApply !== -1 && !this.firstEOESBuffDone) {
      this.loadFirstBuffDamageTakenDuringEarthShield(
        this.eOESApply,
        event.timestamp,
        SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id,
        event.targetID,
      );
      this.firstEOESBuffDone = true;
    }
  }

  onEarthShieldHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }
    if (combatant.hasBuff(talents.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.earthShieldHealing += calculateEffectiveHealing(event, this.getHealingIncrease(event));
    } else if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.elementalOrbitEarthShieldHealing += calculateEffectiveHealing(
        event,
        this.getHealingIncrease(event),
      );
    }
  }

  loadFirstBuffDamageTakenDuringEarthShield(
    start: number,
    end: number,
    spellId: number,
    targetID: number,
  ) {
    fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: start,
      end: end,
    })
      .then((json) => {
        json = json as WCLDamageTakenTableResponse;
        const total = (json.entries as WCLDamageTaken[]).reduce(
          (damageTaken: number, entry: { id: number; total: number }) =>
            (damageTaken += entry.id === targetID ? entry.total : 0),
          0,
        );
        if (spellId === talents.EARTH_SHIELD_TALENT.id) {
          this.damageTakenWithEarthShield += total;
        } else if (spellId === SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id) {
          this.damageTakenWithElementalOrbitEarthShield += total;
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  loadDamageTakenDuringEarthShield(spellId: number) {
    fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='${EventType.ApplyBuff}' AND ability.id=${spellId} AND source.name='${this.selectedCombatant.name}' TO type='${EventType.RemoveBuff}' AND ability.id=${spellId} AND source.name='${this.selectedCombatant.name}' GROUP BY target ON target END)`,
    })
      .then((json) => {
        json = json as WCLDamageTakenTableResponse;
        const total = (json.entries as WCLDamageTaken[]).reduce(
          (damageTaken: number, entry: { id: number; total: number }) =>
            (damageTaken += entry.total),
          0,
        );
        if (spellId === talents.EARTH_SHIELD_TALENT.id) {
          this.damageTakenWithEarthShield += total;
        } else if (spellId === SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id) {
          this.damageTakenWithElementalOrbitEarthShield += total;
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  getHealingIncrease(event: HealEvent) {
    const hpPercentAtStart = (event.hitPoints - event.amount) / event.maxHitPoints;
    const scalingFactor = Math.min(1, Math.max(0, (1 - hpPercentAtStart) / 0.5));
    return healingIncreases.EARTHEN_HARMONY_HEALING_INCREASE * scalingFactor;
  }
}

export default EarthenHarmony;
