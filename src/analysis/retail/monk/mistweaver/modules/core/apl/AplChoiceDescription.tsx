import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import { MistweaverApl } from './AplCheck';

const aplTitle = (choice: MistweaverApl) => {
  switch (choice) {
    case MistweaverApl.RisingMistAncientTeachingsShaohaos:
      return (
        <>
          <SpellLink spell={talents.RISING_MIST_TALENT} /> /{' '}
          <SpellLink spell={talents.ANCIENT_TEACHINGS_TALENT} /> /{' '}
          <SpellLink spell={talents.SHAOHAOS_LESSONS_TALENT} />
        </>
      );
    case MistweaverApl.AwakenedFaeline:
      return (
        <>
          <SpellLink spell={talents.AWAKENED_JADEFIRE_TALENT} />
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

const RisingMistDescription = () => {
  return (
    <>
      <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> to extend hots and{' '}
    </>
  );
};

const AncientTeachingsDescription = () => {
  return (
    <>
      to heal by using your damaging abilities (<SpellLink spell={talents.RISING_SUN_KICK_TALENT} />
      , <SpellLink spell={SPELLS.BLACKOUT_KICK} />, and <SpellLink spell={SPELLS.TIGER_PALM} />) via{' '}
      <SpellLink spell={talents.ANCIENT_TEACHINGS_TALENT} />.
    </>
  );
};

const ShaohaosDescription = () => {
  return (
    <>
      You will aim to cast <SpellLink spell={talents.SHEILUNS_GIFT_TALENT} /> to align with your
      cooldown usage and moments of heavy healing to make use of the various{' '}
      <SpellLink spell={talents.SHAOHAOS_LESSONS_TALENT} /> buffs.{' '}
    </>
  );
};

const ThunderFocusTeaREM = () => {
  return (
    <>
      <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} /> is primarily used on{' '}
      <SpellLink spell={talents.RENEWING_MIST_TALENT} /> with this build.
    </>
  );
};

const RisingMistAncientTeachingsShaohaosDescription = () => {
  return (
    <>
      <p>
        The {aplTitle(MistweaverApl.RisingMistAncientTeachingsShaohaos)} rotation uses{' '}
        <RisingMistDescription />
        <AncientTeachingsDescription />
      </p>
      <p>
        When playing <SpellLink spell={talents.RISING_MIST_TALENT} /> and{' '}
        <SpellLink spell={talents.ANCIENT_TEACHINGS_TALENT} /> with{' '}
        <SpellLink spell={talents.SHAOHAOS_LESSONS_TALENT} />, you cast{' '}
        <SpellLink spell={talents.RENEWING_MIST_TALENT} /> and{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> as often as possible, and cast{' '}
        <SpellLink spell={talents.JADEFIRE_STOMP_TALENT} /> as often as necessary to maintain the{' '}
        <SpellLink spell={talents.ANCIENT_TEACHINGS_TALENT} /> buff. <ShaohaosDescription />
        <ThunderFocusTeaREM />
      </p>
    </>
  );
};

const CleaveBuildNotYetSupportedDescription = () => {
  return (
    <>
      <p>
        <strong>
          The <SpellLink spell={talents.AWAKENED_JADEFIRE_TALENT} /> rotation is not currently
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
    case MistweaverApl.RisingMistAncientTeachingsShaohaos:
      return <RisingMistAncientTeachingsShaohaosDescription />;
    case MistweaverApl.AwakenedFaeline:
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
        <SpellLink spell={talents.RENEWING_MIST_TALENT} />,{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />, and{' '}
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
