---
applyTo: '**'
---

# Verification and Validation

## Never Assume - Always Verify

**Critical Rule**: Never assume a spell, talent, buff, event type, or module exists in the codebase. Always verify by searching for it or asking follow-up questions.

## Search Before Coding

### Finding Spells

Search for spells by:

- Spell name (e.g. "Flame Shock")
- Spell ID (e.g. "188389")
- Related terms (e.g. "Ascendance")

Where to look:

- Check `src/common/SPELLS/` for manually-defined spells
- Check class-specific SPELLS files like `src/analysis/retail/shaman/enhancement/SPELLS.ts`

### Finding Talents

Search for talents by:

- Talent constant name (e.g. "STORMKEEPER_TALENT")
- Display name (e.g. "Stormkeeper")

Talents are auto-generated in `src/common/TALENTS/{class}.ts`

### Finding Modules

Search for modules/analyzers by:

- Filename/class name (e.g. "Stormflurry")
- Similar implementations (e.g. look for classes that extend `Analyzer` in adjacent specs)

### Finding Event Types

Verify event types by:

- Checking `src/parser/core/Events.ts` for the enum/type definitions
- Searching for existing usage in analyzers (e.g. other specs listening for the same event type)

## Verification Checklist

Before writing code, verify:

### ✅ Spell/Talent Exists

```typescript
// ❌ Don't assume
import SPELLS from 'common/SPELLS';
const spell = SPELLS.NONEXISTENT_SPELL; // Might not exist!

// ✅ Search first
// (search for "LAVA_BURST" in the repo)
// Found in TALENTS
import { TALENTS_SHAMAN } from 'common/TALENTS';
const spell = TALENTS_SHAMAN.LAVA_BURST_TALENT;
```

### ✅ Event Type Exists

Verify the event type exists in `src/parser/core/Events.ts` before writing listeners.

### ✅ Module Exists

Before importing a module, search for it in the codebase:

- Search by filename (e.g. "_Tracker_"), exported symbol name, or directory name.
- Prefer finding a real import site first, then follow the import path.

### ✅ Property Exists on Event

```typescript
// ❌ Don't assume
onCast(event: CastEvent) {
  const damage = event.damage; // CastEvent doesn't have damage!
}

// ✅ Check event type definition
onDamage(event: DamageEvent) {
  const damage = event.amount; // DamageEvent has amount
}
```
