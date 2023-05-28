import Combatant from 'parser/core/Combatant';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';

import { RequirementThresholds } from './Requirement';
import Spell from 'common/SPELLS/Spell';

export interface ChecklistProps {
  combatant: Combatant;
  castEfficiency: CastEfficiency;
  thresholds: { [name: string]: RequirementThresholds };
}

export interface AbilityRequirementProps {
  spell: number;
  name?: string | JSX.Element;
}

export interface TalentRequirementProps {
  talent: Spell;
  name?: string | JSX.Element;
}

export interface DotUptimeProps {
  id: number;
  thresholds: RequirementThresholds;
}
