import Spell from 'common/SPELLS/Spell';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import { Talent } from 'common/TALENTS/types';

interface Props {
  name?: string | JSX.Element;
  talent: Talent;
  /**
   * Spell that is actually cast when using a talent. Useful for passive talents.
   */
  actualCast?: Spell;
  includeNoCooldownEfficiency?: boolean;
  casts?: number;
  isMaxCasts?: boolean;
}

const TalentCastEfficiencyRequirement = ({
  actualCast,
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
      spell={actualCast ?? talent}
      castEfficiency={castEfficiency.getCastEfficiencyForSpell(
        actualCast ?? talent,
        includeNoCooldownEfficiency,
      )}
      {...props}
    />
  );
};

export default TalentCastEfficiencyRequirement;
