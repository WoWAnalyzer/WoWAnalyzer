---
applyTo: '**'
---

# Reference Examples

When you need a known-good implementation to copy patterns from, start with these specs.

## Primary Examples

- `src/analysis/retail/shaman/enhancement/`
- `src/analysis/retail/shaman/elemental/`

## What To Look For

- **Analyzer structure**: conditional activation, dependencies, state tracking, statistics/guide output
- **Event listeners**: tight filters, correct event types, minimal work per event
- **Normalizers**: conservative buffers, clear link relations, correct registration order

## Where Patterns Live

- Analyzer architecture and dependency injection: `.github/instructions/analyzer-patterns.md`
- Event listener API and filters: `.github/instructions/event-listeners.md`
- Normalizer configuration and registration: `.github/instructions/normalizers.md`
- Search/verification discipline: `.github/instructions/verification.md`
