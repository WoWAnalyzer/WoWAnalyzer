---
applyTo: '**'
---

# Tech Stack

## Version Policy

This project upgrades dependencies over time. Do not assume specific version numbers from this document.

- Source of truth for library/tool versions: `package.json` (and `pnpm-lock.yaml` for the exact resolved tree).
- Source of truth for TypeScript/JS features and module resolution: `tsconfig.json`.
- When using a library/framework feature that may be version-specific, verify it exists in the current dependency versions before relying on it.

## Core Technologies

### TypeScript & React

- **Language**: TypeScript (strict mode enabled)
- **UI Framework**: React with React Hooks
- **JSX Transform**: `react-jsx` (automatic runtime)
- **Styling**: Emotion (`@emotion/react`, `@emotion/styled`)

```typescript
// Example component with Emotion styling
import styled from '@emotion/styled';
import { Trans } from '@lingui/macro';

const Container = styled.div`
  padding: 20px;
  background: #222;
`;

function MyComponent() {
  return (
    <Container>
      <Trans>Hello World</Trans>
    </Container>
  );
}
```

### Build System

- **Build Tool**: Vite
- **Package Manager**: pnpm (see `package.json#packageManager`)
- **Module Resolution**: Bundler mode with path aliases

```typescript
// Path aliases available in tsconfig.json
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer from 'parser/core/Analyzer';
import { SpellIcon } from 'interface';
```

### State Management

- **Redux**: Redux Toolkit with Redux Thunk
- **React Redux**: react-redux

### Testing

- **Test Runner**: Vitest
- **Testing Library**: @testing-library/react
- **E2E Testing**: Playwright

### Linting & Formatting

- **Linter**: ESLint with typescript-eslint
- **Formatter**: Prettier
- **Pre-commit**: Husky with lint-staged

## Project Structure

```
src/
├── analysis/retail/          # Spec-specific analyzers
│   ├── shaman/
│   │   ├── enhancement/
│   │   │   ├── CombatLogParser.tsx    # Registers all modules
│   │   │   ├── CONFIG.tsx             # Spec configuration
│   │   │   ├── modules/
│   │   │   │   ├── talents/           # Talent analyzers
│   │   │   │   ├── spells/            # Spell analyzers
│   │   │   │   ├── normalizers/       # Event normalizers
│   │   │   │   ├── core/              # Core modules
│   │   │   │   └── features/          # Feature modules
│   │   │   └── Guide.tsx              # Guide component
│   │   ├── elemental/
│   │   └── shared/                    # Shared shaman code
│   └── [other classes]/
├── common/
│   ├── SPELLS/              # Spell definitions
│   └── TALENTS/             # Talent definitions (generated)
├── game/                    # Game constants (RESOURCE_TYPES, etc)
├── interface/               # UI components
├── parser/
│   ├── core/                # Core parser framework
│   ├── shared/              # Shared parser modules
│   └── retail/              # Retail-specific modules
└── localization/            # Translation files
```

## Key Conventions

### File Organization

- Talent analyzers: `src/analysis/retail/{class}/{spec}/modules/talents/`
- Spell analyzers: `src/analysis/retail/{class}/{spec}/modules/spells/`
- Normalizers: `src/analysis/retail/{class}/{spec}/modules/normalizers/`
- Core modules: `src/analysis/retail/{class}/{spec}/modules/core/`
- Feature modules: `src/analysis/retail/{class}/{spec}/modules/features/`
- Guide components: `src/analysis/retail/{class}/{spec}/guide/`

> Note: Some older specs use different structures (e.g., `analyzers/` instead of `modules/talents/`).
> Prefer the Brewmaster monk/Enhancement shaman structure for new code.

### Naming Conventions

- Classes: PascalCase (`ArcaneBarrage`, `SpellUsable`)
- Files: PascalCase for components/classes (`ArcaneBarrage.tsx`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_ARCANE_CHARGES`)

## Dependencies to Know

### Parser Core

- `parser/core/Analyzer` - Base class for all analyzers
- `parser/core/Events` - Event types and utilities
- `parser/core/EventFilter` - Event filtering for listeners
- `parser/core/EventLinkNormalizer` - Links related events
- `parser/core/EventOrderNormalizer` - Reorders events

### Parser Shared Modules

- `parser/shared/modules/SpellUsable` - Track spell cooldowns
- `parser/shared/modules/Combatants` - Access to combatant info
- `parser/shared/modules/StatTracker` - Track stat changes
- `parser/shared/modules/resources/resourcetracker/ResourceTracker` - Track resources

### Common Data

- `common/SPELLS` - Spell definitions (manually maintained)
- `common/TALENTS/{class}` - Talent definitions (auto-generated)
- `game/RESOURCE_TYPES` - Resource type constants

### UI Components

- `interface` - Reusable UI components (SpellIcon, SpellLink, etc)
- `parser/ui` - Parser-specific UI components
