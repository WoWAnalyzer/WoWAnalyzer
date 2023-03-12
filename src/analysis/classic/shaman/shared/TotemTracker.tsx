import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DeathEvent, FightEndEvent, SummonEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';

import SPELLS from 'common/SPELLS/classic/shaman';
import {
  AllTotemsFilter,
  GetTotemElement,
  TotemDurations,
  TotemElements,
  TotemElementsList,
  TOTEMS_BY_ELEMENT,
} from './totems/totemConstants';

export interface TotemEventTracker {
  [TotemElements.Fire]: TotemEvent[];
  [TotemElements.Water]: TotemEvent[];
  [TotemElements.Earth]: TotemEvent[];
  [TotemElements.Air]: TotemEvent[];
}

export interface TotemEvent {
  totemSpellId: number;
  totemName: string; // This is just to make debugging easier
  summonedAt: number;
  dismissedAt?: number;
  dismissReason?: string;
  duration?: number;
  targetID?: number;
  damageDone: number;
  healingDone: number;
  manaRestored: number;
  spellsGrounded?: any;
}

class TotemTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  public totemElementEvents: TotemEventTracker = {
    [TotemElements.Fire]: [],
    [TotemElements.Water]: [],
    [TotemElements.Earth]: [],
    [TotemElements.Air]: [],
  };

  public totemEvents(totemSpellId: number) {
    const events: TotemEvent[] = [];
    const totemElement = GetTotemElement(totemSpellId);
    if (totemElement === null) {
      return events;
    }
    return this.totemElementEvents[totemElement].filter(
      (e: TotemEvent) => e.totemSpellId === totemSpellId,
    );
  }

  activeTotem(element: TotemElements) {
    if (this.totemElementEvents[element].length === 0) {
      return null;
    }
    const lastTotemSummoned =
      this.totemElementEvents[element][this.totemElementEvents[element].length - 1];
    if (lastTotemSummoned.dismissedAt) {
      return null;
    }
    return lastTotemSummoned;
  }

  totalTotemUptime(totemIdOrElement: TotemElements | number) {
    if (Number.isInteger(totemIdOrElement)) {
      const totemId = totemIdOrElement as number;
      if (this.totemEvents(totemId).length === 0) {
        return 0;
      }
      return this.totemEvents(totemId)
        .map((event) => event.duration || 0)
        .reduce((a: number, b: number) => a + b);
    }
    const totemElement = totemIdOrElement as TotemElements;
    if (this.totemElementEvents[totemElement].length === 0) {
      return 0;
    }
    return this.totemElementEvents[totemElement]
      .map((event) => event.duration || 0)
      .reduce((a: number, b: number) => a + b);
  }

  totemUptimePercentage(totemIdOrElement: TotemElements | number): number {
    return this.totalTotemUptime(totemIdOrElement) / this.owner.fightDuration;
  }

  // Duration is hard to get perfect, but we can do a few things to make the number we get not look so outlandish.
  markTotemAsDismissed(element: TotemElements, timestamp: number, reason = '') {
    if (this.totemElementEvents[element].length === 0) {
      return;
    }
    if (this.totemElementEvents[element][this.totemElementEvents[element].length - 1].dismissedAt) {
      return;
    }

    const totemEvent: TotemEvent =
      this.totemElementEvents[element][this.totemElementEvents[element].length - 1];
    const possibleDuration: number = timestamp - totemEvent.summonedAt;
    const maxDuration: number = (TotemDurations as any)[totemEvent.totemSpellId] as number;
    const duration = Math.min(possibleDuration, maxDuration);
    totemEvent.dismissedAt = timestamp;
    totemEvent.dismissReason = reason;
    totemEvent.duration = duration;
  }

  markAllTotemsDismissed(timestamp: number, reason = '') {
    for (const element of TotemElementsList) {
      this.markTotemAsDismissed(element, timestamp, reason);
    }
  }

  allTotemUptimePercentage() {
    return (
      (this.totemUptimePercentage(TotemElements.Fire) +
        this.totemUptimePercentage(TotemElements.Water) +
        this.totemUptimePercentage(TotemElements.Earth) +
        this.totemUptimePercentage(TotemElements.Air)) /
      4
    );
  }

  // Returns the ID of the totem that has the highest uptime for each element.
  primaryTotemUsed(element: TotemElements) {
    let primaryTotemId = TOTEMS_BY_ELEMENT[element][0];
    if (TOTEMS_BY_ELEMENT[element].length === 0) {
      return primaryTotemId;
    }
    for (const totemId of TOTEMS_BY_ELEMENT[element]) {
      if (this.totalTotemUptime(totemId) > this.totalTotemUptime(primaryTotemId)) {
        primaryTotemId = totemId;
      }
    }
    return primaryTotemId;
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(AllTotemsFilter()),
      this.totemSummoned,
    );

    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.totemDeathEvent);

    this.addEventListener(Events.cast, this.totemCastEvent);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell({ id: SPELLS.TOTEMIC_CALL.id }),
      this.totemPurgeEvent,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.totemPurgeEvent);
    this.addEventListener(Events.fightend, this.totemPurgeEvent);
  }

  totemSummoned(event: SummonEvent) {
    const totemSpellId = event.ability.guid;
    const totemName = event.ability.name;
    const totemElement = GetTotemElement(totemSpellId);
    if (!totemElement) {
      return;
    }

    this.markTotemAsDismissed(totemElement, event.timestamp, event.type);

    this.totemElementEvents[totemElement].push({
      totemSpellId,
      totemName,
      summonedAt: event.timestamp,
      targetID: event.targetID || event.target?.id,
      damageDone: 0,
      healingDone: 0,
      manaRestored: 0,
    });
  }

  getTotemElementByTargetId(targetId: number) {
    for (const element of TotemElementsList) {
      if (this.activeTotem(element as TotemElements)?.targetID === targetId) {
        return element;
      }
    }
    return null;
  }

  totemDeathEvent(event: any) {
    const targetId = event?.targetID || event.target?.id;
    const targetTotemelement = this.getTotemElementByTargetId(targetId);
    if (targetTotemelement) {
      this.markTotemAsDismissed(targetTotemelement as TotemElements, event.timestamp, event.type);
    }
  }

  // Used to track what spells are absorbed by grounding totem.
  totemCastEvent(event: any) {
    const targetId = event?.targetID || event?.target?.id;
    const targetTotemelement = this.getTotemElementByTargetId(targetId);

    if (targetTotemelement !== TotemElements.Air) {
      return;
    }
    if (this.activeTotem(TotemElements.Air)?.totemSpellId !== SPELLS.GROUNDING_TOTEM.id) {
      return;
    }

    this.totemElementEvents[TotemElements.Air][
      this.totemElementEvents[TotemElements.Air].length - 1
    ].spellsGrounded = event.ability;
    this.markTotemAsDismissed(TotemElements.Air, event.timestamp, event.type);
  }

  totemPurgeEvent(event: FightEndEvent | DeathEvent | CastEvent) {
    this.markAllTotemsDismissed(event.timestamp, event.type);
  }
}

export default TotemTracker;
