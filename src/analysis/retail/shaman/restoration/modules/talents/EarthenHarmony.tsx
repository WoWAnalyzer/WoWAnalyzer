import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/shaman';
import { WCLDamageTaken, WCLDamageTakenTableResponse } from 'common/WCL_TYPES';
import fetchWcl from 'common/fetchWclApi';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, EventType, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';

const DAMAGE_REDUCTION_PER_POINT = 0.03;
const HEALING_INCREASE_PER_POINT = 0.5;
const HEALTH_THRESHOLD = 0.75;

class EarthenHarmony extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  eSApply: number = -1;
  eOESApply: number = -1;
  firstESBuffDone: boolean = false;
  firstEOESBuffDone: boolean = false;
  damageReduction;
  damageTakenWithEarthShield: number = 0;
  damageTakenWithElementalOrbitEarthShield: number = 0;
  healingIncrease;
  earthShieldHealing: number = 0;
  elementalOrbitEarthShieldHealing: number = 0;
  elementalOrbitActive: boolean = false;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.EARTHEN_HARMONY_TALENT);
    this.elementalOrbitActive = this.selectedCombatant.hasTalent(talents.ELEMENTAL_ORBIT_TALENT);
    this.damageReduction =
      DAMAGE_REDUCTION_PER_POINT *
      this.selectedCombatant.getTalentRank(talents.EARTHEN_HARMONY_TALENT);
    this.healingIncrease =
      HEALING_INCREASE_PER_POINT *
      this.selectedCombatant.getTalentRank(talents.EARTHEN_HARMONY_TALENT);

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
    return (this.damageTakenWithEarthShield / (1 - this.damageReduction)) * this.damageReduction;
  }

  get elementalOrbitDamageReduced() {
    return (
      (this.damageTakenWithElementalOrbitEarthShield / (1 - this.damageReduction)) *
      this.damageReduction
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
    if (!this.targetIsBelowHpThreshold(event)) {
      return;
    }
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }
    if (combatant.hasBuff(talents.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.earthShieldHealing += calculateEffectiveHealing(event, this.healingIncrease);
    } else if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.elementalOrbitEarthShieldHealing += calculateEffectiveHealing(
        event,
        this.healingIncrease,
      );
    }
  }

  /** We need the damage taken by the target during Earth Shield in order to calculate the damage
   *  reduction, which isn't present in the main event stream we have. This forms and sends the
   *  required custom query */
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

  targetIsBelowHpThreshold(event: HealEvent) {
    const hpPercent = (event.hitPoints - event.amount) / event.maxHitPoints;
    return hpPercent < HEALTH_THRESHOLD;
  }
}

export default EarthenHarmony;
