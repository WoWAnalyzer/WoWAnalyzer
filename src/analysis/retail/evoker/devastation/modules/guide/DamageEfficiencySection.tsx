import { GuideProps, PassFailCheckmark, Section, SubSection } from 'interface/guide';
import { ResourceLink, SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import SPELLS from 'common/SPELLS';

import PassFailBar from 'interface/guide/components/PassFailBar';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import DonutChart from 'parser/ui/DonutChart';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

const EXPLANATION_PERCENTAGE = 70;
function PassFail({ value, total, passed }: { value: number; total: number; passed: boolean }) {
  return (
    <div>
      <PassFailBar pass={value} total={total} />
      &nbsp; <PassFailCheckmark pass={passed} />
      <p>
        {value} / {total} ({((value / total) * 100).toFixed(2)}%)
      </p>
    </div>
  );
}

export function DamageEfficiency(props: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Damage Efficiency">
      <DisintegrateSubsection {...props} />
      <NoWastedProcsSubsection {...props} />
      <ShatteringStarSubsection {...props} />
    </Section>
  );
}

function DisintegrateSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  const tickData = modules.disintegrate.tickData;
  console.log({ tickData });
  if (tickData.regularTicks === 0) {
    return null;
  }

  return (
    <SubSection title="Clipping Disintegrate">
      <p>
        It's possible to clip <SpellLink id={SPELLS.DISINTEGRATE.id} /> short and still achieve the
        full amount of damage (see{' '}
        <a href="https://www.wowhead.com/guide/classes/evoker/devastation/faq">
          Disintegrate ticks
        </a>{' '}
        section on wowhead). Clipping is essential for mastery over Devastation, but the risk of
        failing can impact your DPS as your primary damage dealer is{' '}
        <SpellLink id={SPELLS.DISINTEGRATE.id} /> for Single Target. e.g 90% efficiency means a 10%
        DPS loss for Disintegrate, which can be a 5% DPS loss overall.
      </p>
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <div>
            <p>
              <SpellLink id={SPELLS.DISINTEGRATE.id} /> efficiency outside of{' '}
              <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} />
            </p>
            <p>You should not be dropping any ticks here.</p>
          </div>
        }
        data={
          <PassFail
            value={tickData.regularTicks}
            total={tickData.totalPossibleRegularTicks}
            passed={tickData.regularTickRatio > 0.95}
          />
        }
      />

      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <div>
            <p>
              <SpellLink id={SPELLS.DISINTEGRATE.id} /> efficiency during
              <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} />
            </p>
            <p>
              Aim to drop 70%-85% of ticks so you can consume{' '}
              <SpellLink id={SPELLS.ESSENCE_BURST_BUFF} /> procs faster (read Dragonrage section).
            </p>
          </div>
        }
        data={
          <PassFail
            value={tickData.dragonRageTicks}
            total={tickData.totalPossibleDragonRageTicks}
            passed={tickData.dragonRageTickRatio > 0.85 || tickData.dragonRageTickRatio > 0.7}
          />
        }
      />
    </SubSection>
  );
}

function NoWastedProcsSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="No Wasted Procs">
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <p>
            <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id} /> procs are essential because
            they help you cast your primary damaging spells,
            <SpellLink id={SPELLS.DISINTEGRATE.id} /> and{' '}
            <SpellLink id={TALENTS_EVOKER.PYRE_TALENT.id} />, for free. None should go to waste.
          </p>
        }
        data={
          <PassFail
            value={modules.essenceBurst.consumedProcs}
            total={modules.essenceBurst.procs}
            passed={modules.essenceBurst.consumedProcs === modules.essenceBurst.procs}
          />
        }
      />
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <p>
            <SpellLink id={TALENTS_EVOKER.BURNOUT_TALENT.id} /> procs allow you to cast{' '}
            <SpellLink id={SPELLS.LIVING_FLAME_CAST.id} />. Ideally none should go to waste, but
            some may drop during an intense <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} />{' '}
            window.
          </p>
        }
        data={
          <PassFail
            value={modules.burnout.consumedProcs}
            total={modules.burnout.procs}
            passed={modules.burnout.consumedProcs === modules.burnout.procs}
          />
        }
      />
    </SubSection>
  );
}

function ShatteringStarSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="Shattering Star">
      <p>
        <SpellLink id={TALENTS_EVOKER.SHATTERING_STAR_TALENT} /> provides us with a small window
        where our damage gets amplified. To maximize this window aim to have at least 1-2 uses of{' '}
        <SpellLink id={SPELLS.DISINTEGRATE} /> or <SpellLink id={SPELLS.PYRE} /> by pooling{' '}
        <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> and/or{' '}
        <SpellLink id={SPELLS.ESSENCE_BURST_BUFF.id} /> when{' '}
        <SpellLink id={TALENTS_EVOKER.SHATTERING_STAR_TALENT.id} /> is nearing CD. Using{' '}
        <SpellLink id={SPELLS.ETERNITY_SURGE} /> is also good, but don't hold the CD for this
        window. For more tips, check out mentions of Shattering Star in the{' '}
        <a href="https://www.wowhead.com/guide/classes/evoker/devastation/rotation-cooldowns-pve-dps">
          Wowhead guide
        </a>
        .
      </p>
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <RoundedPanel>
            <strong>Per cast breakdown</strong>
            <small> Try to get 2+ strong spells as much as possible!</small>

            <PerformanceBoxRow values={modules.shatteringStar.windowEntries} />
          </RoundedPanel>
        }
        data={
          <div>
            <strong>Summary</strong>
            <DonutChart items={modules.shatteringStar.donutItems} />
          </div>
        }
      />
    </SubSection>
  );
}

// https://www.icy-veins.com/wow/devastation-evoker-pve-dps-rotation-cooldowns-abilities
