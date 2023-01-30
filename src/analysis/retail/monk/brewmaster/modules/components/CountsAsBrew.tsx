import { formatDurationMinSec } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink, TooltipElement } from 'interface';
import { ReactNode } from 'react';

const ESTIMATED_BREW_CDR = 0.45;

/**
 * Brew cooldown for display, rounded up the nearest `basis` seconds.
 */
export const brewCooldownDisplay = (baseCooldown: number, basis: number = 5) =>
  Math.ceil((baseCooldown * ESTIMATED_BREW_CDR) / basis) * basis;

const lbCooldown = (baseCooldown: number) => brewCooldownDisplay(baseCooldown * 0.8);

const CountsAsBrew = ({
  baseCooldown,
  lightBrewing,
  cdTooltip,
}: {
  baseCooldown: number;
  lightBrewing?: boolean;
  cdTooltip?: ReactNode;
}) => {
  const cdText = (
    <>
      {lightBrewing ? <>{formatDurationMinSec(lbCooldown(baseCooldown))}&ndash;</> : null}
      {formatDurationMinSec(brewCooldownDisplay(baseCooldown))}.
    </>
  );
  return (
    <>
      It counts as a{' '}
      <TooltipElement
        hoverable
        content={
          <>
            This means that it benefits from the cooldown reduction on spells like{' '}
            <SpellLink id={talents.KEG_SMASH_TALENT} /> and <SpellLink id={SPELLS.TIGER_PALM} />.
          </>
        }
      >
        Brew
      </TooltipElement>
      , with a typical cooldown of about{' '}
      {cdTooltip ? (
        <TooltipElement hoverable content={cdTooltip}>
          {cdText}
        </TooltipElement>
      ) : (
        cdText
      )}
    </>
  );
};

export default CountsAsBrew;
