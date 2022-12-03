import { formatDurationMinSec } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink, TooltipElement } from 'interface';

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
}: {
  baseCooldown: number;
  lightBrewing?: boolean;
}) => (
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
    {lightBrewing ? <>{formatDurationMinSec(lbCooldown(baseCooldown))}&ndash;</> : null}
    {formatDurationMinSec(brewCooldownDisplay(baseCooldown))}.
  </>
);

export default CountsAsBrew;
