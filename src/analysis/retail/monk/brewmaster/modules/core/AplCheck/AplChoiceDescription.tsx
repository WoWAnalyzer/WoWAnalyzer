import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/monk';
import { AlertWarning, SpellIcon, SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import { ChevronIcon } from 'interface/icons';
import { Fragment } from 'react';
import { BrewmasterApl } from '../AplCheck';

const aplTitle = (choice: BrewmasterApl) => {
  switch (choice) {
    case BrewmasterApl.BoC_TP:
      return (
        <>
          <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> +{' '}
          <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />
        </>
      );
    case BrewmasterApl.PTA:
      return <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} />;
    default:
      return <em>Fallback</em>;
  }
};

const SequenceContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 24px;

  & svg {
    transform: rotate(-90deg);
    height: 18px;
    margin-top: calc(24px / 2 - 18px / 2);
  }

  & img.icon {
    height: 24px;
  }
`;

const SpellSeq = ({ spells }: { spells: Spell[] }) => (
  <SequenceContainer>
    {spells.map((spell, index, array) => (
      <Fragment key={index}>
        <SpellIcon spell={spell} key={index} />
        {index < array.length - 1 && <ChevronIcon />}
      </Fragment>
    ))}
  </SequenceContainer>
);

const cooldown = {
  id: -1,
  name: 'Cooldown',
  icon: 'inv_misc_questionmark',
};

const BlackoutComboDescription = () => (
  <>
    <p>
      The {aplTitle(BrewmasterApl.BoC_TP)} rotation uses{' '}
      <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> to empower{' '}
      <SpellLink spell={SPELLS.TIGER_PALM} /> for immense single-target damage.
    </p>
    <p>
      This rotation is very different from normal. It is built around two alternating "blocks" based
      around <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} /> and{' '}
      <SpellLink spell={SPELLS.TIGER_PALM} />:
    </p>
    <ul>
      <li>
        The{' '}
        <SpellLink spell={talents.CHARRED_PASSIONS_TALENT}>
          <strong>ChP</strong>
        </SpellLink>{' '}
        block maintains <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />: Cast{' '}
        <SpellSeq
          spells={[
            SPELLS.BLACKOUT_KICK_BRM,
            SPELLS.TIGER_PALM,
            talents.KEG_SMASH_TALENT,
            talents.BREATH_OF_FIRE_TALENT,
          ]}
        />
      </li>
      <li>
        The <strong>Cooldown</strong> block spends your other cooldowns: Cast{' '}
        <SpellSeq spells={[SPELLS.BLACKOUT_KICK_BRM, SPELLS.TIGER_PALM, cooldown, cooldown]} />,
        filling in the <SpellIcon spell={cooldown} />s with spells like{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> or{' '}
        <SpellLink spell={talents.WEAPONS_OF_ORDER_TALENT} />.
      </li>
    </ul>
    <p>
      By alternating between these blocks, you balance efficiently spending cooldowns with effective
      use of <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} />.
    </p>
  </>
);

const ChPDfBDescription = ({ apl }: { apl: BrewmasterApl }) => {
  const info = useInfo();

  if (
    !info?.combatant.hasTalent(talents.CHARRED_PASSIONS_TALENT) &&
    !info?.combatant.hasTalent(talents.DRAGONFIRE_BREW_TALENT)
  ) {
    return <FallbackDescription />;
  }

  return (
    <>
      <p>
        The {aplTitle(apl)} rotation is idental to the core rotation, except that{' '}
        <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> becomes much higher priority.
      </p>
      {info?.combatant.hasTalent(talents.CHARRED_PASSIONS_TALENT) ? (
        <>
          <p>
            When playing <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />, you cast{' '}
            <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> as often as necessary to maintain
            the <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> damage buff.
          </p>
          <p>
            <small>
              <strong>Note:</strong> In previous patches, it was a damage boost to always use{' '}
              <SpellLink spell={SPELLS.SPINNING_CRANE_KICK_BRM} /> instead of{' '}
              <SpellLink spell={SPELLS.TIGER_PALM} /> when using{' '}
              <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />. That is no longer the
              case&mdash;use <SpellLink spell={SPELLS.TIGER_PALM} /> on single-target and{' '}
              <SpellLink spell={SPELLS.SPINNING_CRANE_KICK_BRM} /> on AoE!
            </small>
          </p>
        </>
      ) : (
        <p>
          With <SpellLink spell={talents.DRAGONFIRE_BREW_TALENT} />,{' '}
          <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> becomes one of your most important
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
      Using <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> or{' '}
      <SpellLink spell={talents.DRAGONFIRE_BREW_TALENT} /> is recommended, as both provide a large
      damage boost without making the rotation much more difficult.
    </AlertWarning>
  </>
);

const PTADescription = () => (
  <>
    <p>
      The {aplTitle(BrewmasterApl.PTA)} rotation is very similar to the normal rotation, except you
      play around casting <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> or{' '}
      <SpellLink spell={talents.KEG_SMASH_TALENT} /> with your 10-stack{' '}
      <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT}>PtA</SpellLink> buff.
    </p>
    <AlertWarning>
      Using <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} /> will result in many empty GCDs.
      While it may be tempting to use <SpellLink spell={SPELLS.SPINNING_CRANE_KICK_BRM} /> to fill
      them, SCK can cause you getting stacks of{' '}
      <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} />! If you are not playing around your
      swing timer, you should avoid casting <SpellLink spell={SPELLS.SPINNING_CRANE_KICK_BRM} /> on
      single target!
    </AlertWarning>
  </>
);

const Description = ({ aplChoice }: { aplChoice: BrewmasterApl }) => {
  switch (aplChoice) {
    case BrewmasterApl.BoC_TP:
      return <BlackoutComboDescription />;
    case BrewmasterApl.PTA:
      return <PTADescription />;
    default:
      return <ChPDfBDescription apl={aplChoice} />;
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
        choose. The core of the rotation remains the same in most cases: prioritize your
        low-cooldown, high-damage abilities like <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />,{' '}
        <SpellLink spell={talents.KEG_SMASH_TALENT} />, and{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />.
      </p>
      <p>
        <strong>Selected Rotation:</strong> {aplTitle(aplChoice)}
      </p>
      <Description aplChoice={aplChoice} />
    </>
  );
}
