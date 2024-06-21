import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  GetRelatedEvents,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { ECHO_HEALS } from '../../constants';
import {
  didEchoExpire,
  getEchoTypeForGoldenHour,
  getEchoTypeForLifebind,
  isFromHardcastEcho,
  isFromTAEcho,
} from '../../normalizers/EventLinking/helpers';
import { ECHO, ECHO_TEMPORAL_ANOMALY, ECHO_TYPE } from '../../normalizers/EventLinking/constants';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';

class Echo extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerPrevoker,
  };

  protected hotTracker!: HotTrackerPrevoker;

  consumptionsBySpell: Map<number, number> = new Map<number, number>();
  // Map<spellId, totalHealing>, only update for echo healing
  echoHealingBySpell: Map<number, number> = new Map<number, number>();
  taEchoHealingBySpell: Map<number, number> = new Map<number, number>();
  totalApplied: number = 0;
  totalExpired: number = 0;

  constructor(options: Options) {
    super(options);
    ECHO_HEALS.forEach((spell) => {
      this.echoHealingBySpell.set(spell.id, 0);
      this.taEchoHealingBySpell.set(spell.id, 0);
      this.consumptionsBySpell.set(spell.id, 0);
    });
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(ECHO_HEALS), this.handleEchoHeal);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onRemove,
    );
  }

  onRemove(event: RemoveBuffEvent) {
    if (didEchoExpire(event)) {
      this.totalExpired += 1;
    } else {
      // consumed echo with a spell
      const relatedEvents = GetRelatedEvents(event, ECHO).concat(
        GetRelatedEvents(event, ECHO_TEMPORAL_ANOMALY),
      );
      const spellID = (relatedEvents[0] as CastEvent).ability.guid;
      this.consumptionsBySpell.set(spellID, this.consumptionsBySpell.get(spellID)! + 1);
    }
  }

  handleEchoHeal(event: HealEvent) {
    if (!this.isEchoHeal(event)) {
      return;
    }
    const spellID = event.ability.guid;
    const mapRef = this.isFromTaEcho(event) ? this.taEchoHealingBySpell : this.echoHealingBySpell;
    mapRef.set(spellID, mapRef.get(spellID)! + (event.amount || 0) + (event.absorbed || 0));
  }

  isEchoHeal(event: HealEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (spellID === SPELLS.LIFEBIND_HEAL.id) {
      return getEchoTypeForLifebind(event) !== ECHO_TYPE.NONE;
    } else if (spellID === SPELLS.GOLDEN_HOUR_HEAL.id) {
      return getEchoTypeForGoldenHour(event) !== ECHO_TYPE.NONE;
    }
    if (event.tick) {
      if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
        return false;
      }
      const hot = this.hotTracker.hots[targetID][spellID];
      return this.hotTracker.fromEchoHardcast(hot) || this.hotTracker.fromEchoTA(hot);
    }
    return isFromHardcastEcho(event) || isFromTAEcho(event);
  }

  isFromTaEcho(event: HealEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (spellID === SPELLS.LIFEBIND_HEAL.id) {
      return getEchoTypeForLifebind(event) === ECHO_TYPE.TA;
    } else if (spellID === SPELLS.GOLDEN_HOUR_HEAL.id) {
      return getEchoTypeForGoldenHour(event) === ECHO_TYPE.TA;
    }
    if (event.tick) {
      if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
        return;
      }
      const hot = this.hotTracker.hots[targetID][spellID];
      return this.hotTracker.fromEchoTA(hot);
    }
    return isFromTAEcho(event);
  }

  isFromHardcast(event: HealEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (spellID === SPELLS.LIFEBIND_HEAL.id) {
      return getEchoTypeForLifebind(event) === ECHO_TYPE.HARDCAST;
    } else if (spellID === SPELLS.GOLDEN_HOUR_HEAL.id) {
      return getEchoTypeForGoldenHour(event) === ECHO_TYPE.HARDCAST;
    }
    if (event.tick) {
      if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
        return;
      }
      const hot = this.hotTracker.hots[targetID][spellID];
      return this.hotTracker.fromEchoHardcast(hot);
    }
    return isFromHardcastEcho(event);
  }

  get suggestionThresholds() {
    return {
      actual: this.totalExpired,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get totalTaEchoHealing() {
    let result = 0;
    for (const amount of this.taEchoHealingBySpell.values()) {
      result += amount;
    }
    return result;
  }

  get totalHardcastEchoHealing() {
    let result = 0;
    for (const amount of this.echoHealingBySpell.values()) {
      result += amount;
    }
    return result;
  }

  totalEchoHealingForSpell(spellId: number) {
    return (
      (this.echoHealingBySpell.get(spellId) || 0) + (this.taEchoHealingBySpell.get(spellId) || 0)
    );
  }

  hardcastEchoHealingForSpell(spellId: number) {
    return this.echoHealingBySpell.get(spellId) || 0;
  }

  taEchoHealingForSpell(spellId: number) {
    return this.taEchoHealingBySpell.get(spellId) || 0;
  }

  getEchoHealingForSpell(isHardcast: boolean, spellId: number) {
    return isHardcast
      ? this.hardcastEchoHealingForSpell(spellId)
      : this.taEchoHealingForSpell(spellId);
  }
}

export default Echo;
