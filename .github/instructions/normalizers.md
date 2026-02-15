---
applyTo: '**'
---

# Normalizers

## Overview

Normalizers pre-process combat log events to fix ordering issues, link related events, and transform event data. They run before analyzers process events.

> Reference implementations: see `.github/instructions/reference-examples.md`.

## Types of Normalizers

### 1. EventLinkNormalizer

Links related events together for easier access in analyzers.

```typescript
import { Options } from 'parser/core/Analyzer';
import BaseEventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';

const EVENT_LINKS = {
  Stormkeeper: 'stormkeeper-link',
  ChainLightning: 'chain-lightning-link',
};

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      // Link Stormkeeper buff to cast
      {
        linkRelation: EVENT_LINKS.Stormkeeper,
        linkingEventId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
        referencedEventId: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        referencedEventType: EventType.BeginCast,
        forwardBufferMs: -1, // Only look backwards
        backwardBufferMs: 2000, // Up to 2s before
        anySource: true,
        anyTarget: true,
        maximumLinks: 1,
        isActive: (c) => c.hasTalent(TALENTS.STORMKEEPER_TALENT),
      },

      // Link cast to damage
      {
        linkRelation: EVENT_LINKS.ChainLightning,
        linkingEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
        linkingEventType: [EventType.Cast, EventType.FreeCast],
        referencedEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
        referencedEventType: EventType.Damage,
        forwardBufferMs: 500, // Look up to 500ms forward
        anyTarget: true,
        reverseLinkRelation: EVENT_LINKS.ChainLightning, // Bidirectional
      },
    ]);
  }
}

export default EventLinkNormalizer;
```

### 2. EventOrderNormalizer

Ensures events occur in the correct order.

```typescript
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.LIGHTNING_BOLT.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.LIGHTNING_BOLT.id,
    afterEventType: EventType.Damage,
    bufferMs: 50,
    anyTarget: true,
  },
];

class MyEventOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default MyEventOrderNormalizer;
```

### 3. Custom Normalizers

Extend `EventsNormalizer` for custom event transformations:

```typescript
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Analyzer';
import { AnyEvent, EventType } from 'parser/core/Events';

class CustomNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    // Transform events
    const modifiedEvents: AnyEvent[] = [];

    for (const event of events) {
      // Modify or filter events
      if (event.type === EventType.Cast) {
        // Transform cast event
        modifiedEvents.push(this.transformCast(event));
      } else {
        modifiedEvents.push(event);
      }
    }

    return modifiedEvents;
  }

  transformCast(event: AnyEvent): AnyEvent {
    // Custom transformation logic
    return event;
  }
}

export default CustomNormalizer;
```

## EventLink Configuration

### Basic EventLink

```typescript
const basicLink: EventLink = {
  linkRelation: 'my-link-relation',
  linkingEventId: SPELLS.FLAME_SHOCK.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.FLAME_SHOCK.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: 500,
  anyTarget: true,
};
```

### EventLink Properties

```typescript
interface EventLink {
  // REQUIRED: Key describing the relationship
  linkRelation: string;

  // REQUIRED: Ability ID(s) of linking event (null matches any)
  linkingEventId: null | number | number[];

  // REQUIRED: Event type(s) of linking event
  linkingEventType: EventType | EventType[];

  // REQUIRED: Ability ID(s) of referenced event (null matches any)
  referencedEventId: null | number | number[];

  // REQUIRED: Event type(s) of referenced event
  referencedEventType: EventType | EventType[];

  // OPTIONAL: Max ms forward to search (default: 0)
  forwardBufferMs?: number;

  // OPTIONAL: Max ms backward to search (default: 0)
  backwardBufferMs?: number;

  // OPTIONAL: Allow different sources (default: false)
  anySource?: boolean;

  // OPTIONAL: Allow different targets (default: false)
  anyTarget?: boolean;

  // OPTIONAL: Create reverse link with this relation
  reverseLinkRelation?: string;

  // OPTIONAL: Maximum links to create
  maximumLinks?: number | ((c: Combatant) => number);

  // OPTIONAL: Additional condition function
  additionalCondition?: (linking: AnyEvent, referenced: AnyEvent) => boolean;

  // OPTIONAL: Check if link should be active
  isActive?: (c: Combatant) => boolean;
}
```

## EventLink Examples

### Cast to Damage Link

```typescript
const stormstrike: EventLink = {
  linkRelation: 'stormstrike-damage',
  linkingEventId: [SPELLS.STORMSTRIKE.id, SPELLS.WINDSTRIKE_CAST.id],
  linkingEventType: EventType.Cast,
  referencedEventId: [SPELLS.STORMSTRIKE_DAMAGE.id, SPELLS.WINDSTRIKE_DAMAGE.id],
  referencedEventType: EventType.Damage,
  forwardBufferMs: 500,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS_SHAMAN.STORMFLURRY_TALENT),
};
```

### Buff Application to Cast Link

```typescript
const pomLink: EventLink = {
  linkRelation: 'presence-of-mind-consume',
  linkingEventId: TALENTS.PRESENCE_OF_MIND_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.ARCANE_BLAST.id,
  referencedEventType: EventType.Cast,
  forwardBufferMs: 15000,
  anyTarget: true,
  maximumLinks: 2, // POM gives 2 instant casts
};
```

### Buff to Buff Link (Procs)

```typescript
const hotHandLink: EventLink = {
  linkRelation: 'hot-hand-whirling-fire',
  linkingEventId: SPELLS.HOT_HAND_BUFF.id,
  linkingEventType: EventType.ApplyBuff,
  referencedEventId: SPELLS.WHIRLING_FIRE.id,
  referencedEventType: EventType.RemoveBuff,
  reverseLinkRelation: 'hot-hand-whirling-fire',
  forwardBufferMs: 5,
};
```

### Conditional Link

```typescript
const conditionalLink: EventLink = {
  linkRelation: 'special-case',
  linkingEventId: SPELLS.ABILITY_A.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.ABILITY_B.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: 1000,
  anyTarget: true,
  additionalCondition: (linking, referenced) => {
    // Custom condition
    return linking.timestamp > this.owner.fight.start_time + 30000;
  },
};
```

## Normalizer Registration

Register normalizers in `CombatLogParser.tsx`:

```typescript
class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers should be registered first
    // They run in order of priority (or registration order if priority is same)
    eventOrderNormalizer: EventOrderNormalizer,
    eventLinkNormalizer: EventLinkNormalizer,
    maelstromResourceNormalizer: MaelstromResourceNormalizer,

    // Then analyzers
    abilities: Abilities,
    stormflurry: Stormflurry,
    // ...
  };
}
```

### Normalizer Priority

Set priority to control execution order:

```typescript
class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
    // Priority is optional; lower runs first
    this.priority = -100;
  }
}

class EventOrderNormalizer extends BaseEventOrderNormalizer {
  constructor(options: Options) {
    super(options, orders);
    this.priority = -50;
  }
}
```

Lower priority value = runs first. Default priority is 0.

## Best Practices

1. **Link Related Events**: Use EventLinkNormalizer instead of searching for events in analyzers.

2. **Conservative Buffers**: Use small `forwardBufferMs` and `backwardBufferMs` to avoid false matches.

3. **Talent Checks**: Use `isActive` to only create links when relevant talents are taken.

4. **Bidirectional Links**: Use `reverseLinkRelation` when both events need to reference each other.

5. **Maximum Links**: Use `maximumLinks` when you know the exact number of expected links.

6. **Type Safety**: Export link relation constants and use them consistently:

```typescript
export const STORMSTRIKE_LINK = 'stormstrike-link';
export const CHAIN_LIGHTNING_LINK = 'chain-lightning-link';
export const TEMPEST_LINK = 'tempest-link';
```

7. **Order Matters**: Register normalizers in the correct order based on dependencies. If an EventLinkNormalizer expects events in a certain order, ensure EventOrderNormalizer has a lower priority

## Common Patterns

### AOE Cast to Multiple Damages

```typescript
const aoeLink: EventLink = {
  linkRelation: 'chain-lightning-damage',
  linkingEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: 500,
  anyTarget: true, // Hits multiple targets
  // No maximumLinks - can hit many targets
};
```

### Buff Consumption

```typescript
const consumeLink: EventLink = {
  linkRelation: 'buff-consume',
  linkingEventId: SPELLS.BUFF.id,
  linkingEventType: EventType.RemoveBuff,
  referencedEventId: SPELLS.SPENDER.id,
  referencedEventType: EventType.Cast,
  backwardBufferMs: 50, // Cast happened just before
  maximumLinks: 1,
};
```

### Proc Chain

```typescript
// Link proc to trigger
const procTrigger: EventLink = {
  linkRelation: 'proc-trigger',
  linkingEventId: SPELLS.TRIGGER.id,
  linkingEventType: EventType.Damage,
  referencedEventId: SPELLS.PROC_BUFF.id,
  referencedEventType: EventType.ApplyBuff,
  forwardBufferMs: 50,
  maximumLinks: 1,
};

// Link buff to consumption
const procConsume: EventLink = {
  linkRelation: 'proc-consume',
  linkingEventId: SPELLS.PROC_BUFF.id,
  linkingEventType: EventType.ApplyBuff,
  referencedEventId: SPELLS.PROC_BUFF.id,
  referencedEventType: EventType.RemoveBuff,
  forwardBufferMs: 15000, // Buff duration
  maximumLinks: 1,
};
```
