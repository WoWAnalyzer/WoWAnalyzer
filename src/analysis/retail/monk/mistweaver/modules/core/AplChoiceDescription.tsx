import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { AlertWarning, SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import { MistweaverApl } from './AplCheck';

const aplTitle = (choice: MistweaverApl) => {
  switch (choice) {
    case MistweaverApl.RisingMistAncientTeachings:
      return (
        <>
          <SpellLink id={talents.RISING_MIST_TALENT} /> /{' '}
          <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} />
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
  const info = useInfo();
  return (
    <>
      <SpellLink id={talents.ESSENCE_FONT_TALENT} />
      {info?.combatant.hasTalent(talents.FAELINE_STOMP_TALENT) ? (
        <>
          or <SpellLink id={talents.FAELINE_STOMP_TALENT} />
        </>
      ) : (
        <></>
      )}{' '}
      to empower your damaging abilities <SpellLink id={talents.RISING_SUN_KICK_TALENT} />,{' '}
      <SpellLink id={SPELLS.BLACKOUT_KICK} />, and <SpellLink id={SPELLS.TIGER_PALM} /> to heal via{' '}
      <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} />.
    </>
  );
};

const RisingMistAncientTeachingsDescription = () => {
  const info = useInfo();
  return (
    <>
      <p>
        The {aplTitle(MistweaverApl.RisingMistAncientTeachings)} rotation uses{' '}
        <RisingMistDescription />
        <AncientTeachingsDescription />
      </p>
      <p>
        When playing <SpellLink id={talents.RISING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} />, you cast{' '}
        <SpellLink id={talents.RENEWING_MIST_TALENT} /> and{' '}
        <SpellLink id={talents.RISING_SUN_KICK_TALENT} /> as often as possible, and cast{' '}
        <SpellLink id={talents.ESSENCE_FONT_TALENT} />
        {info?.combatant.hasTalent(talents.FAELINE_STOMP_TALENT) ? (
          <>
            or <SpellLink id={talents.FAELINE_STOMP_TALENT} /> if{' '}
            <SpellLink id={talents.ESSENCE_FONT_TALENT} /> is on cooldown
          </>
        ) : (
          <></>
        )}{' '}
        as often as necessary to maintain the <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} />{' '}
        buff.
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
    case MistweaverApl.RisingMistAncientTeachings:
      return <RisingMistAncientTeachingsDescription />;
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
