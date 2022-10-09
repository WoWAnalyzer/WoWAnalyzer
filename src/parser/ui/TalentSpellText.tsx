import { SpellIcon, TooltipElement } from 'interface';
import { SpellLink } from 'interface';
import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';
import { ReactNode } from 'react';

interface Props {
  spellId: number;
  maxRanks: number;
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
  { spellId, maxRanks, children, className }: Props,
  { parser: { selectedCombatant } }: Context,
) => {
  const rank = selectedCombatant.getTalentRank(spellId);
  return (
    <div className={`pad boring-text ${className || ''}`}>
      <label>
        <SpellIcon id={spellId} /> <SpellLink id={spellId} icon={false} /> -{' '}
        <TooltipElement
            content={`Talented into with ${rank} point${
              rank > 1 ? 's' : ''
            } out of ${maxRanks} point${maxRanks > 1 ? 's' : ''}`}
          >
            {rank}/{maxRanks}
          </TooltipElement>
      </label>
      <div className="value">{children}</div>
    </div>
  );
};
TalentSpellText.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default TalentSpellText;
