import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { AlertWarning, SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import { MistweaverApl } from './AplCheck';

const aplTitle = (choice: MistweaverApl) => {
  switch (choice) {
    case MistweaverApl.RisingMistAncientTeachingsShaohaos:
      return (
        <>
          <SpellLink id={talents.RISING_MIST_TALENT} /> /{' '}
          <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} /> /{' '}
          <SpellLink id={talents.SHAOHAOS_LESSONS_TALENT} />
        </>
      );
    case MistweaverApl.RisingMistAncientTeachingsUpwellFls:
      return (
        <>
          <SpellLink id={talents.RISING_MIST_TALENT} /> /{' '}
          <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} /> /{' '}
          <SpellLink id={talents.UPWELLING_TALENT} />
        </>
      );
      case MistweaverApl.RisingMistCloudedFocusShaohaos:
        return (
          <>
            <SpellLink id={talents.RISING_MIST_TALENT} /> /{' '}
          <SpellLink id={talents.CLOUDED_FOCUS_TALENT} /> /{' '}
          <SpellLink id={talents.SHAOHAOS_LESSONS_TALENT} />
          </>
        );
    default:
      return <em>Fallback</em>;
  }
};

const RisingMistDescription = () => {
  return (
    <>
      <SpellLink id={talents.RISING_SUN_KICK_TALENT} /> to extend hots and{' '}
    </>
  );
};

const AncientTeachingsDescription = () => {
  return (
    <>
      to heal by using your damaging abilities (<SpellLink id={talents.RISING_SUN_KICK_TALENT} />,{' '}
      <SpellLink id={SPELLS.BLACKOUT_KICK} />, and <SpellLink id={SPELLS.TIGER_PALM} />) via{' '}
      <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} />.
    </>
  );
};

const CloudedFocusDescription = () => {
  return (
    <>
      to make optimal use of your high <SpellLink id={talents.RENEWING_MIST_TALENT}/> count with <SpellLink id={talents.CLOUDED_FOCUS_TALENT}/>,{' '}
      which further empowers <SpellLink id={SPELLS.VIVIFY}/>
    </>
  );
};

const ShaohaosDescription = () => {
  return (
    <>
    You will aim to cast{' '}
        <SpellLink id={talents.SHEILUNS_GIFT_TALENT} /> to align with your cooldown usage and
        moments of heavy healing to make use of the various{' '}
        <SpellLink id={talents.SHAOHAOS_LESSONS_TALENT} /> buffs.{' '}
    </>
  );
};

const ThunderFocusTeaREM = () => {
  return (
    <>
      <SpellLink id={talents.THUNDER_FOCUS_TEA_TALENT} /> is primarily used on{' '}
      <SpellLink id={talents.RENEWING_MIST_TALENT} /> with this build.
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
        When playing <SpellLink id={talents.RISING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} /> with{' '}
        <SpellLink id={talents.SHAOHAOS_LESSONS_TALENT} />, you cast{' '}
        <SpellLink id={talents.RENEWING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.RISING_SUN_KICK_TALENT} /> as often as possible, and cast{' '}
        <SpellLink id={talents.ESSENCE_FONT_TALENT} /> as often as necessary to maintain the{' '}
        <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} /> buff.{' '}
        <ShaohaosDescription/>
        <ThunderFocusTeaREM/>
      </p>
    </>
  );
};

const RisingMistAncientTeachingsUpwelFlsDescription = () => {
  const info = useInfo();
  return (
    <>
      <p>
        The {aplTitle(MistweaverApl.RisingMistAncientTeachingsUpwellFls)} rotation uses{' '}
        <RisingMistDescription />
        <AncientTeachingsDescription />
      </p>
      <p>
        When playing <SpellLink id={talents.RISING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} />, you cast{' '}
        <SpellLink id={talents.RENEWING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.RISING_SUN_KICK_TALENT} /> as often as possible, and cast{' '}
        <SpellLink id={talents.ESSENCE_FONT_TALENT} />{' '}
        {info?.combatant.hasTalent(talents.FAELINE_STOMP_TALENT) ? (
          <>
            or <SpellLink id={talents.FAELINE_STOMP_TALENT} /> if{' '}
            <SpellLink id={talents.ESSENCE_FONT_TALENT} /> is on cooldown
          </>
        ) : (
          <></>
        )}{' '}
        as often as necessary to maintain the <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} />{' '}
        buff. <SpellLink id={talents.THUNDER_FOCUS_TEA_TALENT} /> is primarily used on{' '}
        <SpellLink id={talents.ESSENCE_FONT_TALENT} /> with this build.
      </p>
    </>
  );
};

const RisingMistCloudedFocusShaohaosDescription = () => {
  return (
    <>
      <p>
        The {aplTitle(MistweaverApl.RisingMistCloudedFocusShaohaos)} rotation uses{' '}
        <RisingMistDescription />
        <CloudedFocusDescription />
      </p>
      <p>
        When playing <SpellLink id={talents.RISING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.CLOUDED_FOCUS_TALENT} /> with{' '}
        <SpellLink id={talents.SHAOHAOS_LESSONS_TALENT} />, you cast{' '}
        <SpellLink id={talents.RENEWING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.RISING_SUN_KICK_TALENT} /> as often as possible, and cast{' '}
        <SpellLink id={talents.SOOTHING_MIST_TALENT} /> prior to casting {' '}
        <SpellLink id={SPELLS.VIVIFY}/> as your main source of healing.{' '} 
        <ShaohaosDescription/>
        <ThunderFocusTeaREM/>
      </p>
    </>
  );
};

const FallbackDescription = () => (
  <>
    <p>
      The {aplTitle(MistweaverApl.Fallback)} rotation is used when you don't have any
      rotation-changing talents selected. You follow the core priority: high mana efficient spells
      and short cooldowns, then filler damage spells. This is the simplest rotation, but practicing
      it will build good habits that work with the other variations.
    </p>
    <AlertWarning>
      Using <SpellLink id={talents.RISING_MIST_TALENT} /> is recommended, as it brings the entire
      spec's toolkit together by creating multiple synergies between talents.
    </AlertWarning>
  </>
);

const Description = ({ aplChoice }: { aplChoice: MistweaverApl }) => {
  switch (aplChoice) {
    case MistweaverApl.RisingMistAncientTeachingsShaohaos:
      return <RisingMistAncientTeachingsShaohaosDescription />;
    case MistweaverApl.RisingMistAncientTeachingsUpwellFls:
      return <RisingMistAncientTeachingsUpwelFlsDescription />;
      case MistweaverApl.RisingMistCloudedFocusShaohaos:
        return <RisingMistCloudedFocusShaohaosDescription/>;
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
        <SpellLink id={talents.RENEWING_MIST_TALENT} />,{' '}
        <SpellLink id={talents.RISING_SUN_KICK_TALENT} />, and{' '}
        <SpellLink id={talents.THUNDER_FOCUS_TEA_TALENT} /> always being the top priority abilities.
      </p>
      <p>
        <strong>Selected Build:</strong> {aplTitle(aplChoice)}
      </p>
      <Description aplChoice={aplChoice} />
    </>
  );
}
