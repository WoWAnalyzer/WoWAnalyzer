import Combatant from 'parser/core/Combatant';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { RequirementThresholds } from 'parser/shared/modules/features/Checklist/Requirement';

export interface ChecklistProps {
  combatant: Combatant,
  castEfficiency: CastEfficiency,
  thresholds: { [name: string]: RequirementThresholds }
}

export interface AbilityRequirementProps {
  spell: number,
  name?: string | JSX.Element,
}

