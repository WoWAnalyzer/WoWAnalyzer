import { GuideProps, Section, SubSection } from 'interface/guide';
import { ResourceLink, SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import SPELLS from 'common/SPELLS';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA } from 'analysis/retail/evoker/shared';
import { STRAFING_RUN_DURATION } from 'analysis/retail/evoker/devastation/constants';
import { formatDurationMillisMinSec } from 'common/format';
import { ProcAnalysisWrapper } from '../components/ProcAnalysis';
import { TipBox } from 'interface/guide/components';

export function DamageEfficiency({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Damage Efficiency">
      <SubSection title="Explanation">
        Devastation is a specialization thats heavily reliant on consistent performance. Every
        single proc and buff charge matters for your performance and with that comes some detailed
        data on all of your relevant procs
        <TipBox type="note" title="End of Fights">
          Procs that weren't used by the time the fight ended are usually excluded from statistics
          and seperately marked, usually inside of brackets in tooltips.
        </TipBox>
        <ProcAnalysisWrapper
          analysisData={modules.essenceBurst.procUsageData}
          explanation={
            <>
              <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> procs are essential because they help
              you cast your primary damaging spells,
              <SpellLink spell={SPELLS.DISINTEGRATE} /> and{' '}
              <SpellLink spell={TALENTS_EVOKER.PYRE_TALENT} />, for free.
            </>
          }
          usageInstructions={<>None should go to waste.</>}
        />
        <ProcAnalysisWrapper
          analysisData={modules.burnout.procUsageData}
          explanation={
            <>
              <SpellLink spell={TALENTS_EVOKER.BURNOUT_TALENT} /> procs allow you to cast{' '}
              <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> instantly.
            </>
          }
          usageInstructions={
            <>
              Ideally none should go to waste, but some may drop during an intense{' '}
              <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> window.
            </>
          }
        />
        <ProcAnalysisWrapper
          analysisData={modules.leapingFlames.procUsageData}
          explanation={
            <>
              <SpellLink spell={TALENTS_EVOKER.LEAPING_FLAMES_TALENT} /> allow your next{' '}
              <SpellLink spell={SPELLS.LIVING_FLAME_DAMAGE} /> to hit additional targets based on
              the empower rank of the previous <SpellLink spell={SPELLS.FIRE_BREATH} /> cast.
            </>
          }
          usageInstructions={
            <>
              Ideally none should go to waste, but some may drop during an intense{' '}
              <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> window.
            </>
          }
        />
        <ProcAnalysisWrapper
          analysisData={modules.risingFury.procUsageData}
          explanation={
            <>
              <strong>
                <SpellLink spell={SPELLS.UNBOUND_FLAME} />
              </strong>{' '}
              is a powerful spell, gained after Dragonrage expires. It is your highest priority
              filler spell, because it has a guaranteed chance to produce an{' '}
              <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} />.
            </>
          }
          usageInstructions={<>None should go to waste.</>}
        />
        <ProcAnalysisWrapper
          analysisData={modules.massDisintegrate.procUsageData}
          explanation={
            <>
              <strong>
                <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />
              </strong>{' '}
              is a powerful buff gained by casting Empowers which increases the damage of{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> and allows it to strike multiple targets.
            </>
          }
          usageInstructions={<>None should go to waste.</>}
        />
        <ProcAnalysisWrapper
          analysisData={modules.imminentDestruction.procUsageData}
          explanation={
            <>
              <strong>
                <SpellLink spell={TALENTS_EVOKER.IMMINENT_DESTRUCTION_DEVASTATION_TALENT} />
              </strong>{' '}
              reduces the <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> cost of your next{' '}
              <strong>{IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA}</strong>{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> and <SpellLink spell={SPELLS.PYRE} />.
            </>
          }
          usageInstructions={<>None should go to waste.</>}
        />
        <ProcAnalysisWrapper
          analysisData={modules.strafingRun.procUsageData}
          explanation={
            <>
              <strong>
                <SpellLink spell={TALENTS_EVOKER.STRAFING_RUN_TALENT} />
              </strong>{' '}
              allows <SpellLink spell={SPELLS.DEEP_BREATH} /> to be cast again within{' '}
              {formatDurationMillisMinSec(STRAFING_RUN_DURATION, 0)} of being used.
              {info.combatant.hasTalent(TALENTS_EVOKER.MASS_DISINTEGRATE_TALENT) && (
                <>
                  {' '}
                  When playing as Scalecommander, you should wait as long as possible with
                  re-casting.
                </>
              )}
            </>
          }
          usageInstructions={<>None should go to waste.</>}
        />
        <ProcAnalysisWrapper
          analysisData={modules.azureSweep.procUsageData}
          explanation={
            <>
              <strong>
                <SpellLink spell={TALENTS_EVOKER.AZURE_SWEEP_TALENT} />
              </strong>{' '}
              is an upgraded version of <SpellLink spell={SPELLS.AZURE_STRIKE} /> that is gained
              after casting <SpellLink spell={SPELLS.ETERNITY_SURGE} />.
            </>
          }
          usageInstructions={<>None should go to waste.</>}
        />
      </SubSection>
    </Section>
  );
}
