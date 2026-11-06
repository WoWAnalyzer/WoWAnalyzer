import SPELLS from 'common/SPELLS/shaman';
import talents from 'common/TALENTS/shaman';
import { WCLDamageTaken, WCLDamageTakenTableResponse } from 'common/WCL_TYPES';
import fetchWcl from 'common/fetchWclApi';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { splitEarthShieldHeal } from './earthShieldHealSplit';
import Events, { ApplyBuffEvent, EventType, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { healingIncreases } from '../../restoration/constants';
import Combatants from 'parser/shared/modules/Combatants';
import { formatNumber } from 'common/format';
import { useEffect, useState } from 'react';

const LoadedNumber = ({ loaded, getValue }: { loaded: Promise<void>; getValue: () => number }) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    let mounted = true;
    const finish = () => mounted && setDone(true);
    loaded.then(finish, finish);
    return () => {
      mounted = false;
    };
  }, [loaded]);
  return <>{done ? formatNumber(getValue()) : '…'}</>;
};

class EarthenHarmony extends Analyzer.withDependencies({
  combatants: Combatants,
}) {
  prepullES: { start: number; targetID: number } | null = null;
  prepullEOES: { start: number; targetID: number } | null = null;
  pendingQueries: Promise<void>[] = [];
  loaded: Promise<void> = Promise.resolve();
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
    this.addEventListener(Events.fightend, this.onFightEnd);
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
      (this.damageTakenWithElementalOrbitEarthShield /
        (1 - healingIncreases.EARTHEN_HARMONY_DAMAGE_REDUCTION)) *
      healingIncreases.EARTHEN_HARMONY_DAMAGE_REDUCTION
    );
  }

  get totalDamageReduction() {
    return this.earthShielddamageReduced + this.elementalOrbitDamageReduced;
  }

  onEarthShieldApply(event: ApplyBuffEvent) {
    if (!event.prepull) {
      return;
    }
    const prepullWindow = {
      start: Math.max(event.timestamp, this.owner.fight.start_time),
      targetID: event.targetID,
    };
    if (event.ability.guid === talents.EARTH_SHIELD_TALENT.id) {
      this.prepullES = prepullWindow;
    } else {
      this.prepullEOES = prepullWindow;
    }
  }
  onEarthShieldRemove(event: RemoveBuffEvent) {
    if (event.ability.guid === talents.EARTH_SHIELD_TALENT.id) {
      this.closePrepullWindow(talents.EARTH_SHIELD_TALENT.id, event.timestamp);
    } else {
      this.closePrepullWindow(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp);
    }
  }

  onFightEnd() {
    // Prepull Earth Shield that was never removed covers the whole fight.
    this.closePrepullWindow(talents.EARTH_SHIELD_TALENT.id, this.owner.fight.end_time);
    this.closePrepullWindow(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, this.owner.fight.end_time);
    this.loaded = Promise.all(this.pendingQueries).then(() => undefined);
  }

  renderDamageReduced(getValue: () => number) {
    return <LoadedNumber loaded={this.loaded} getValue={getValue} />;
  }

  closePrepullWindow(spellId: number, end: number) {
    const isES = spellId === talents.EARTH_SHIELD_TALENT.id;
    const prepullWindow = isES ? this.prepullES : this.prepullEOES;
    if (!prepullWindow) {
      return;
    }
    this.loadFirstBuffDamageTakenDuringEarthShield(
      prepullWindow.start,
      end,
      spellId,
      prepullWindow.targetID,
    );
    if (isES) {
      this.prepullES = null;
    } else {
      this.prepullEOES = null;
    }
  }

  onEarthShieldHeal(event: HealEvent) {
    const target = this.deps.combatants.getEntity(event);
    if (!target) {
      return;
    }
    const split = splitEarthShieldHeal(event, this.selectedCombatant, target);
    if (!split) {
      return;
    }
    if (split.bucket === 'earthShield') {
      this.earthShieldHealing += split.earthenHarmony;
    } else {
      this.elementalOrbitEarthShieldHealing += split.earthenHarmony;
    }
  }

  loadFirstBuffDamageTakenDuringEarthShield(
    start: number,
    end: number,
    spellId: number,
    targetID: number,
  ) {
    const query = fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
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
        console.error('Earthen Harmony: damage-taken query failed', err);
      });
    this.pendingQueries.push(query);
  }

  loadDamageTakenDuringEarthShield(spellId: number) {
    const query = fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
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
        console.error('Earthen Harmony: damage-taken query failed', err);
      });
    this.pendingQueries.push(query);
  }
}

export default EarthenHarmony;
