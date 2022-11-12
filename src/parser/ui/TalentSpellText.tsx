import { SpellIcon, TooltipElement } from 'interface';
import { SpellLink } from 'interface';
import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';
import { ReactNode } from 'react';
import { Talent } from 'common/TALENTS/types';

const TalentRankTooltip = ({ rank, maxRanks }: { rank: number; maxRanks: number }) => (
  <>
    {' '}
    -{' '}
    <TooltipElement
      content={`Talented into with ${rank} out of ${maxRanks} point${maxRanks > 1 ? 's' : ''}`}
    >
      {rank}/{maxRanks}
    </TooltipElement>
  </>
);

interface Props {
  talent: Talent;
  children: ReactNode;
  className?: string;
}

interface Context {
  parser: CombatLogParser;
}

/**
 * Component to display rank/maxrank for a talent. Pass the spell ID and maxranks of the talent in the `spellId` prop.
 *
 * Component will link to the talent with the current rank as well".
 */
const TalentSpellText = (
  { talent, children, className }: Props,
  { parser: { selectedCombatant } }: Context,
) => {
  const spellId = talent.id;
  const rank = selectedCombatant.getTalentRank(spellId);
  const maxRanks = talent.maxRanks;
  return (
    <div className={`pad boring-text ${className || ''}`}>
      <label>
        <SpellIcon id={spellId} /> <SpellLink id={spellId} icon={false} />
        {maxRanks === 1 ? null : <TalentRankTooltip rank={rank} maxRanks={maxRanks} />}
      </label>
      <div className="value">{children}</div>
    </div>
  );
};
TalentSpellText.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default TalentSpellText;
