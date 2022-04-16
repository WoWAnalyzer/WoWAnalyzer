import { SpellIcon, TooltipElement } from 'interface';
import { SpellLink } from 'interface';
import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';
import { ReactNode } from 'react';

interface Props {
  spellId: number;
  /** @deprecated We can figure out the rank with just the id, so no need to pass in */
  rank?: number;
  children: ReactNode;
  className?: string;
}

interface Context {
  parser: CombatLogParser;
}

/**
 * Component to display statistics for a conduit. Pass the spell ID of the conduit in the `spellId` prop.
 *
 * Component will link to the conduit with the equipped itemlevel, as well as print out "Rank x".
 */
const ConduitSpellText = (
  { spellId, children, className }: Props,
  { parser: { selectedCombatant } }: Context,
) => {
  const { itemLevel, rank } = selectedCombatant.conduitsByConduitID[spellId];

  const likelyEmpowered = selectedCombatant.likelyHasEmpoweredConduits();
  const effectiveItemlevel = itemLevel != null && likelyEmpowered ? itemLevel + 26 : itemLevel;
  const effectiveRank = likelyEmpowered ? rank + 2 : rank;
  return (
    <div className={`pad boring-text ${className || ''}`}>
      <label>
        <SpellIcon id={spellId} /> <SpellLink id={spellId} icon={false} ilvl={effectiveItemlevel} />{' '}
        -{' '}
        {likelyEmpowered ? (
          <TooltipElement
            content={`Equipped rank ${rank} (itemlevel: ${itemLevel}) but empowered to rank ${effectiveRank} (itemlevel: ${effectiveItemlevel})`}
          >
            Rank {effectiveRank}
          </TooltipElement>
        ) : (
          <>Rank {rank}</>
        )}
      </label>
      <div className="value">{children}</div>
    </div>
  );
};
ConduitSpellText.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ConduitSpellText;
