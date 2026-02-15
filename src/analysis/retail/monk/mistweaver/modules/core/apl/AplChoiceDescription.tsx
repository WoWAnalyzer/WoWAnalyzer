import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import { MistweaverApl } from './AplCheck';

const aplTitle = (choice: MistweaverApl) => {
  switch (choice) {
    case MistweaverApl.RisingMistJadefireTeachings:
      return (
        <>
          <SpellLink spell={talents.RISING_MIST_TALENT} /> /{' '}
          <SpellLink spell={talents.JADEFIRE_TEACHINGS_TALENT} /> /{' '}
        </>
      );
    case MistweaverApl.RisingMistRushingWindKick:
      return (
        <>
          <SpellLink spell={talents.RISING_MIST_TALENT} /> /{' '}
          <SpellLink spell={talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT} /> /{' '}
        </>
      );
    case MistweaverApl.WayOfTheCrane:
      return (
        <>
          <SpellLink spell={talents.WAY_OF_THE_CRANE_TALENT} />
        </>
      );
    case MistweaverApl.TearOfMorning:
      return (
        <>
          <SpellLink spell={talents.TEAR_OF_MORNING_TALENT} />
        </>
      );
    default:
      return <em>Fallback</em>;
  }
};

const JadefireTeachingsDescription = () => {
  return (
    <>
      <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> to extend hots and convert damage to
      healing through <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />
      , <SpellLink spell={SPELLS.BLACKOUT_KICK} />, <SpellLink spell={SPELLS.TIGER_PALM} />, and{' '}
      <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} />.
    </>
  );
};

const RushingWindKickDescription = () => {
  return (
    <>
      <SpellLink spell={talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT} /> to extend hots to accrue
      high counts of <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> and amplify their healing.
    </>
  );
};

const ThunderFocusTeaRem = () => {
  return (
    <>
      <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} /> is primarily used on{' '}
      <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> with this build.
    </>
  );
};

const ThunderFocusTeaRemRsk = () => {
  return (
    <>
      <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} /> can be used with both{' '}
      <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> and{' '}
      <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> with this build.
    </>
  );
};

const RisingMistJadefireTeachingsShaohaosDescription = () => {
  return (
    <>
      <p>
        The {aplTitle(MistweaverApl.RisingMistJadefireTeachings)} rotation uses{' '}
        <JadefireTeachingsDescription />
      </p>
      <p>
        When playing <SpellLink spell={talents.RISING_MIST_TALENT} /> and{' '}
        <SpellLink spell={talents.JADEFIRE_TEACHINGS_TALENT} /> with{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> as often as possible, and cast{' '}
        <SpellLink spell={talents.JADEFIRE_STOMP_TALENT} /> or{' '}
        <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} /> as often as necessary to maintain the{' '}
        <SpellLink spell={talents.JADEFIRE_TEACHINGS_TALENT} /> buff.
        <ThunderFocusTeaRemRsk />
      </p>
    </>
  );
};

const RisingMistRushingWindKickShaohaosDescription = () => {
  return (
    <>
      <p>
        The {aplTitle(MistweaverApl.RisingMistRushingWindKick)} rotation uses{' '}
        <RushingWindKickDescription />
      </p>
      When playing <SpellLink spell={talents.RISING_MIST_TALENT} /> with{' '}
      <SpellLink spell={talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT} /> and{' '}
      <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> on cooldown and cast{' '}
      <SpellLink spell={talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT} /> as often as possible.{' '}
      <ThunderFocusTeaRem />
    </>
  );
};

const CleaveBuildNotYetSupportedDescription = () => {
  return (
    <>
      <p>
        <strong>
          The <SpellLink spell={talents.WAY_OF_THE_CRANE_TALENT} /> rotation is not currently
          supported.
        </strong>
      </p>
    </>
  );
};

const TomDescription = () => {
  return (
    <>
      <p>
        <strong>
          The <SpellLink spell={talents.TEAR_OF_MORNING_TALENT} /> rotation is not currently
          supported.
        </strong>
      </p>
    </>
  );
};

const FallbackDescription = () => {
  return (
    <>
      <p>
        The {aplTitle(MistweaverApl.Fallback)} rotation is used when you aren't using a recommended
        raid build. Regardless of talent choices it is still important for you to follow the core
        priority: high mana efficient spells and short cooldowns, then filler damage spells. This is
        the simplest rotation, but practicing it will build good habits that work with the other
        variations.
      </p>
    </>
  );
};

const Description = ({ aplChoice }: { aplChoice: MistweaverApl }) => {
  switch (aplChoice) {
    case MistweaverApl.RisingMistJadefireTeachings:
      return <RisingMistJadefireTeachingsShaohaosDescription />;
    case MistweaverApl.RisingMistRushingWindKick:
      return <RisingMistRushingWindKickShaohaosDescription />;
    case MistweaverApl.WayOfTheCrane:
      return <CleaveBuildNotYetSupportedDescription />;
    case MistweaverApl.TearOfMorning:
      return <TomDescription />;
    default:
      return <FallbackDescription />;
  }
};

export default function AplChoiceDescription({
  aplChoice,
}: {
  aplChoice: MistweaverApl;
}): JSX.Element {
  return (
    <>
      <p>
        Mistweavers have a few different variations to their core rotation, depending on your talent
        selection. The core of the rotations does not change with{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />,{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />/
        <SpellLink spell={talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT} />, and{' '}
        <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} /> always being the top priority
        abilities.
      </p>
      <p>
        <strong>Selected Build:</strong> {aplTitle(aplChoice)}
      </p>
      <Description aplChoice={aplChoice} />
    </>
  );
}
