import { GuideProps, Section } from 'interface/guide';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from './CombatLogParser';
import FoundationDowntimeSectionV2 from 'interface/guide/foundation/FoundationDowntimeSectionV2';
import CooldownGraphSubsection from './guide/CooldownGraphSubSection';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from './modules/core/AplCheck';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Preface & Disclaimers">
        <>
          <p>
            When reviewing this information, keep in mind that WoWAnalyzer is limited to the
            information that is present in your combat log. As a result, we have no way of knowing
            if you were intentionally doing something suboptimal because the fight or strat required
            it (such as forced downtime or holding cooldowns for a burn phase). Because of this, we
            recommend comparing your analysis against a top 100 log for the same boss.
          </p>
          <p>
            For additional assistance in improving your gameplay, or to have someone look more in
            depth at your combat logs, please visit the{' '}
            <a href="https://discord.gg/skyhold">Skyhold</a> discord.
          </p>
          <p>
            If you notice any issues or errors in this analysis or if there is additional analysis
            you would like added, please ping <code>@Bigbowwl</code> in the{' '}
            <a href="https://discord.gg/skyhold">Skyhold</a> discord (please don't DM me).
          </p>
        </>
      </Section>
      <Section title="Always Be Casting">
        <FoundationDowntimeSectionV2 />
      </Section>
      <CooldownSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <CooldownGraphSubsection />
    </Section>
  );
}

function RotationSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <p>
        This single target rotation analyzer is based on a number of sources, including the guides
        at{' '}
        <a
          href="https://www.wowhead.com/guide/classes/warrior/arms/rotation-cooldowns-pve-dps"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wowhead
        </a>
        {' and '}
        <a
          href="https://maxroll.gg/wow/class-guides/arms-warrior-raid-guide"
          target="_blank"
          rel="noopener noreferrer"
        >
          Maxroll
        </a>{' '}
        (credit to Archimtiros and Revvez for writing these guides).
      </p>
      <p>
        This should be used as a reference point for improvement when comparing against other logs.
        It does not cover the full set of priorites used by Simulationcraft/Raidbots (much like the
        written guides) as the list would be far too long and too complex to follow.
      </p>
      <div>
        Potential areas of inaccuracy:
        <ul>
          <li>Holding abilities for upcoming add spawns or damage amps</li>
          <li>Multiple targets</li>
          <li>Movement or periods of downtime</li>
        </ul>
      </div>
      <p>
        <strong> NOTE:</strong> The priority list below does not include{' '}
        <SpellLink spell={TALENTS.REND_TALENT} icon />
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl(info)} />
    </Section>
  );
}
