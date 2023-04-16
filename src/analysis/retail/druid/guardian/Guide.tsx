import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/guardian/CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Explanation from 'interface/guide/components/Explanation';
import { Highlight } from 'analysis/retail/monk/brewmaster/modules/spells/Shuffle/GuideSection';
import colorForPerformance from 'common/colorForPerformance';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function CoreSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rage and Ironfur">
      <p>
        Guardian's core defensive loop involves generating Rage with your rotational spells and then
        spending most of it on <SpellLink spell={SPELLS.IRONFUR} />. Ironfur dramatically reduces
        the amount of incoming melee damage - you should always have at least one stack while you
        are the active tank.
      </p>
      <IronfurSection />
      <RageSection />
    </Section>
  );
}

// TODO move to own Ironfur class?
const red = colorForPerformance(0);
function IronfurSection(): JSX.Element {
  return (
    <SubSection title="Ironfur">
      <Explanation>
        <p>
          <SpellLink spell={SPELLS.IRONFUR} /> greatly increases your armor, which greatly reduces
          incoming damage while tanking. The benefit from each additional stack of Ironfur
          progressively reduces - the first stack is by far the most important one.
        </p>
        <p>
          This chart shows your <SpellLink spell={SPELLS.IRONFUR} /> uptime along with the damage
          that you took.{' '}
          <strong>
            You do not need overall 100% uptime, but you should have full uptime while actively
            tanking!
          </strong>
          Melee damage taken without <SpellLink spell={SPELLS.IRONFUR} /> active (shown in{' '}
          <Highlight color={red}>red</Highlight>) is very dangerous!
        </p>
      </Explanation>
      {/*<IronfurOverview info={info} shuffle={shuffle} />*/}
    </SubSection>
  );
}

// TODO move to own Rage class?
function RageSection(): JSX.Element {
  return <SubSection title="Rage"></SubSection>;
}

function RotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return <Section title="Rotation">TODO TODO TODO</Section>;
}

function CooldownSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return <Section title="Cooldowns">TODO TODO TODO</Section>;
}
