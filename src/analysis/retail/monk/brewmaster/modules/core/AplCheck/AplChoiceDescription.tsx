import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { AlertWarning, SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import { BrewmasterApl } from '../AplCheck';

const aplTitle = (choice: BrewmasterApl) => {
  switch (choice) {
    case BrewmasterApl.BlackoutCombo:
      return <SpellLink id={talents.BLACKOUT_COMBO_TALENT} />;
    case BrewmasterApl.ChPDfB:
      return (
        <>
          <SpellLink id={talents.CHARRED_PASSIONS_TALENT} /> /{' '}
          <SpellLink id={talents.DRAGONFIRE_BREW_TALENT} />
        </>
      );
    default:
      return <em>Fallback</em>;
  }
};

const BlackoutComboDescription = () => (
  <>
    <p>
      The {aplTitle(BrewmasterApl.BlackoutCombo)} rotation uses{' '}
      <SpellLink id={talents.BLACKOUT_COMBO_TALENT} /> to empower{' '}
      <SpellLink id={talents.KEG_SMASH_TALENT} /> and{' '}
      <SpellLink id={talents.BREATH_OF_FIRE_TALENT} /> for increased tankiness.
    </p>
    <p>
      Your highest priority is to use <SpellLink id={SPELLS.BLACKOUT_KICK_BRM} /> as often as
      possible, and use <SpellLink id={talents.BLACKOUT_COMBO_TALENT} /> to maintain{' '}
      <SpellLink id={talents.BREATH_OF_FIRE_TALENT} /> with the buffed 10% damage reduction.
    </p>
    <small>
      <strong>Note:</strong> Casting <SpellLink id={talents.BREATH_OF_FIRE_TALENT} />{' '}
      <em>without</em> the buff will reduce your damage reduction back to 5%! If your targets are
      already debuffed, you should skip <SpellLink id={talents.BREATH_OF_FIRE_TALENT} /> unless you
      have the <SpellLink id={talents.BLACKOUT_COMBO_TALENT} /> buff!
    </small>
  </>
);

const ChPDfBDescription = () => {
  const info = useInfo();

  return (
    <>
      <p>
        The {aplTitle(BrewmasterApl.ChPDfB)} rotation is idental to the core rotation, except that{' '}
        <SpellLink id={talents.BREATH_OF_FIRE_TALENT} /> becomes much higher priority.
      </p>
      {info?.combatant.hasTalent(talents.CHARRED_PASSIONS_TALENT) ? (
        <>
          <p>
            When playing <SpellLink id={talents.CHARRED_PASSIONS_TALENT} />, you cast{' '}
            <SpellLink id={talents.BREATH_OF_FIRE_TALENT} /> as often as necessary to maintain the{' '}
            <SpellLink id={talents.CHARRED_PASSIONS_TALENT} /> damage buff.
          </p>
          <p>
            <small>
              <strong>Note:</strong> In previous patches, it was a damage boost to always use{' '}
              <SpellLink id={SPELLS.SPINNING_CRANE_KICK_BRM} /> instead of{' '}
              <SpellLink id={SPELLS.TIGER_PALM} /> when using{' '}
              <SpellLink id={talents.CHARRED_PASSIONS_TALENT} />. That is no longer the
              case&mdash;use <SpellLink id={SPELLS.TIGER_PALM} /> on single-target and{' '}
              <SpellLink id={SPELLS.SPINNING_CRANE_KICK_BRM} /> on AoE!
            </small>
          </p>
        </>
      ) : (
        <p>
          With <SpellLink id={talents.DRAGONFIRE_BREW_TALENT} />,{' '}
          <SpellLink id={talents.BREATH_OF_FIRE_TALENT} /> becomes one of your most important
          spells. Cast it as often as possible.
        </p>
      )}
    </>
  );
};

const FallbackDescription = () => (
  <>
    <p>
      The {aplTitle(BrewmasterApl.Fallback)} rotation is used when you don't have any
      rotation-changing talents selected. You follow the core priority: high damage spells, then
      low-damage "filler" spells. This is the simplest rotation, but practicing it will build good
      habits that work with the other variations.
    </p>
    <AlertWarning>
      Using <SpellLink id={talents.CHARRED_PASSIONS_TALENT} /> or{' '}
      <SpellLink id={talents.DRAGONFIRE_BREW_TALENT} /> is recommended, as both provide a large
      damage boost without making the rotation much more difficult.
    </AlertWarning>
  </>
);

const Description = ({ aplChoice }: { aplChoice: BrewmasterApl }) => {
  switch (aplChoice) {
    case BrewmasterApl.BlackoutCombo:
      return <BlackoutComboDescription />;
    case BrewmasterApl.ChPDfB:
      return <ChPDfBDescription />;
    default:
      return <FallbackDescription />;
  }
};

export default function AplChoiceDescription({
  aplChoice,
}: {
  aplChoice: BrewmasterApl;
}): JSX.Element {
  return (
    <>
      <p>
        Brewmasters have three variations on their core rotation, depending on which talents you
        choose. The core of the rotation remains the same (prioritize your low-cooldown, high-damage
        abilities: <SpellLink id={SPELLS.BLACKOUT_KICK_BRM} />,{' '}
        <SpellLink id={talents.KEG_SMASH_TALENT} />, and{' '}
        <SpellLink id={talents.RISING_SUN_KICK_TALENT} />
        ). The <strong>main difference</strong> is how important casting{' '}
        <SpellLink id={talents.BREATH_OF_FIRE_TALENT} /> is.
      </p>
      <p>
        <strong>Selected Rotation:</strong> {aplTitle(aplChoice)}
      </p>
      <Description aplChoice={aplChoice} />
    </>
  );
}
