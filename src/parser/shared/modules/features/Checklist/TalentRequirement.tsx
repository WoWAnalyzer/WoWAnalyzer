import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import { Talent } from 'common/TALENTS/types';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { ComponentProps } from 'react';

// Requirement provides its own setPerformance
interface Props extends Omit<ComponentProps<typeof Requirement>, 'setPerformance'> {
  talent: Talent;
}
const TalentRequirement = ({ talent, ...others }: Props) => {
  const { combatLogParser } = useCombatLogParser();
  if (!combatLogParser.selectedCombatant.hasTalent(talent)) {
    return null;
  }
  return <Requirement {...others} />;
};

export default TalentRequirement;
