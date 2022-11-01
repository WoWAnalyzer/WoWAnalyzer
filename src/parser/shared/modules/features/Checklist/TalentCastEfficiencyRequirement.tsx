import Spell from 'common/SPELLS/Spell';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

interface Props {
  name?: string | JSX.Element;
  talent: Spell;
  includeNoCooldownEfficiency?: boolean;
  casts?: number;
  isMaxCasts?: boolean;
}

const TalentCastEfficiencyRequirement = ({
  talent,
  includeNoCooldownEfficiency = false,
  ...props
}: Props) => {
  const { combatLogParser } = useCombatLogParser();
  if (!combatLogParser.selectedCombatant.hasTalent(talent)) {
    return null;
  }
  const castEfficiency = combatLogParser.getModule(CastEfficiency);
  return (
    <GenericCastEfficiencyRequirement
      spell={talent}
      castEfficiency={castEfficiency.getCastEfficiencyForSpell(talent, includeNoCooldownEfficiency)}
      {...props}
    />
  );
};

export default TalentCastEfficiencyRequirement;
