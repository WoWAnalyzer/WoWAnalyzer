---
applyTo: '**'
---

# Analyzer Patterns

## Overview

Analyzers are modules that process combat log events and generate statistics, suggestions, and guide content. They extend the `Analyzer` base class and use an event-driven architecture.

> Reference implementations: see `.github/instructions/reference-examples.md`.

## Basic Analyzer Structure

```typescript
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';

class Stormflurry extends Analyzer {
  constructor(options: Options) {
    super(options);

    // Conditionally activate based on talents
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.STORMFLURRY_TALENT);
    if (!this.active) {
      return;
    }

    // Register event listeners (see Event Listeners docs for patterns)
    // this.addEventListener(...)
  }
}

export default Stormflurry;
```

## Key Patterns

### 1. Conditional Activation

Always check if the analyzer should be active based on talents, items, or spec:

```typescript
constructor(options: Options) {
  super(options);

  // Deactivate if talent not selected
  this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ELEMENTAL_TALENT) ||
    this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT);

  if (!this.active) {
    return;
  }

  // ... rest of constructor
}
```

### 2. Dependencies

Use `withDependencies` to inject other modules:

```typescript
// Declare dependencies to inject via `withDependencies`
class Ascendance extends Analyzer.withDependencies({
  abilities: Abilities,
  enemies: Enemies,
  spellUsable: SpellUsable,
  maelstromTracker: MaelstromTracker,
}) {
  constructor(options: Options) {
    super(options);
    // Dependencies are automatically injected, and accessible via this.deps.{dependencyName}, including in the constructor
  }
}
```

Some analyzer types don't support the `withDependencies` pattern, such as `MajorCooldown`. Use `static dependencies` instead:

```typescript
class MyMajorCooldown extends MajorCooldown<MyCooldownCast> {
  static dependencies = {
    // parent dependencies must be spread
    ...MajorCooldown.dependencies,
    // any additional dependencies
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  // define properties for the additional dependencies
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super({ spell: SPELLS.BIG_COOLDOWN_SPELL }, options);
    // ⚠️ static dependencies are not present during the constructor
  }
}
```

### 3. State Tracking

Track state across events using instance properties:

```typescript
class FlameShock extends Analyzer {
  protected uptimeHistory: Array<{ start: number; end?: number }> = [];
  protected badLavaBursts = 0;
  protected currentDebuffStacks = 0;

  onApplyDebuff(event: ApplyDebuffEvent) {
    this.uptimeHistory.push({ start: event.timestamp });
    this.currentDebuffStacks += 1;
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    const lastEntry = this.uptimeHistory[this.uptimeHistory.length - 1];
    if (lastEntry) {
      lastEntry.end = event.timestamp;
    }
    this.currentDebuffStacks -= 1;
  }
}
```

### 4. Accessing Combatant Info

Use `this.selectedCombatant` to check player state:

```typescript
onCast(event: CastEvent) {
  // Check if player has a buff
  const hasBuff = this.selectedCombatant.hasBuff(SPELLS.ASCENDANCE_ELEMENTAL_BUFF.id);

  // Check talent rank (for multi-rank talents)
  const rank = this.selectedCombatant.getTalentRank(TALENTS_SHAMAN.STORMKEEPER_TALENT);

  // Check if player has talent
  if (this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT)) {
    // Do something
  }
}
```

### 5. Using Linked Events

Access related events that were linked by normalizers:

```typescript
onStormstrike(event: CastEvent) {
  if (!event._linkedEvents) {
    return;
  }

  // Get all linked damage events
  const damageEvents = event._linkedEvents
    .filter((le) => le.relation === EnhancementEventLinks.STORMSTRIKE_LINK)
    .map((le) => le.event as DamageEvent);

  // Process damage events
  damageEvents.forEach((damageEvent) => {
    this.extraDamage += damageEvent.amount + (damageEvent.absorb || 0);
  });
}
```

Or use helper functions:

```typescript
import { GetRelatedEvent, GetRelatedEvents } from 'parser/core/Events';

onCast(event: CastEvent) {
  // Get single related event
  const precast = GetRelatedEvent(event, 'precast');

  // Get multiple related events
  const damages = GetRelatedEvents<DamageEvent>(event, 'damage');
}
```

## Output Methods

### statistic()

Returns a UI component displayed in the statistics tab:

```typescript
statistic() {
  return (
    <Statistic
      position={STATISTIC_ORDER.OPTIONAL()}
      category={STATISTIC_CATEGORY.TALENTS}
      size="flexible"
      tooltip={<>Detailed tooltip content</>}
    >
      <TalentSpellText talent={TALENTS_SHAMAN.STORMFLURRY_TALENT}>
        <ItemDamageDone amount={this.extraDamage} />
      </TalentSpellText>
    </Statistic>
  );
}
```

### guideSubsection()

Returns a guide component for the analysis guide:

```typescript
get guideSubsection() {
  return (
    <SubSection title={<><SpellLink spell={SPELLS.FLAME_SHOCK} /></>}>
      <ExplanationAndDataSubSection
        explanation={<p>Keep Flame Shock active on your target.</p>}
        data={<div>{formatPercentage(this.uptime)}% uptime</div>}
      />
    </SubSection>
  );
}
```

## Common Helpers

### Owner Methods

```typescript
// Get total healing/damage done
this.owner.getPercentageOfTotalHealingDone(amount);
this.owner.getPercentageOfTotalDamageDone(amount);

// Fight duration
this.owner.fightDuration; // in milliseconds

// Fight info
this.owner.info.fightStart;
this.owner.info.fightEnd;
```

### Calculation Helpers

```typescript
import { calculateEffectiveHealing, calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

// Calculate effective increase from a multiplier
const effectiveHealing = calculateEffectiveHealing(event, 0.25); // 25% increase
```
