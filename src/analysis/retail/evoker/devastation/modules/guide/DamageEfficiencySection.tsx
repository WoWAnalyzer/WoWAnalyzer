import { GuideProps, PassFailCheckmark, Section, SubSection } from 'interface/guide';
import { ResourceLink, SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import SPELLS from 'common/SPELLS';

import PassFailBar from 'interface/guide/components/PassFailBar';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { TIERS } from 'game/TIERS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA } from 'analysis/retail/evoker/shared';
import { STRAFING_RUN_DURATION } from 'analysis/retail/evoker/devastation/constants';
import { formatDurationMillisMinSec } from 'common/format';
import { InformationIcon } from 'interface/icons';

const EXPLANATION_PERCENTAGE = 70;
function PassFail({
  value,
  total,
  passed,
  customTotal,
}: {
  value: number;
  total: number;
  passed: boolean;
  customTotal?: number;
}) {
  return (
    <div>
      <PassFailBar pass={value} total={customTotal ?? total} />
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
      <NoWastedProcsSubsection {...props} />
      <NoWastedBuffsSubsection {...props} />
    </Section>
  );
}

function NoWastedProcsSubsection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const hasMID1TierSet = info.combatant.has2PieceByTier(TIERS.MID1);

  return (
    <SubSection title="No Wasted Procs">
      <p>
        <InformationIcon /> Note that procs that weren't used by the time the fight ended are
        counted as wasted.
      </p>
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <p>
            <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> procs are essential because they help
            you cast your primary damaging spells,
            <SpellLink spell={SPELLS.DISINTEGRATE} /> and{' '}
            <SpellLink spell={TALENTS_EVOKER.PYRE_TALENT} />, for free.
            <div>
              <strong>None should go to waste.</strong>
            </div>
          </p>
        }
        data={
          <PassFail
            value={modules.essenceBurst.consumedProcs}
            total={Math.max(modules.essenceBurst.procs, modules.essenceBurst.consumedProcs)}
            passed={
              modules.essenceBurst.consumedProcs ===
              Math.max(modules.essenceBurst.procs, modules.essenceBurst.consumedProcs)
            }
          />
        }
      />
      {!hasMID1TierSet && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <p>
              <SpellLink spell={TALENTS_EVOKER.BURNOUT_TALENT} /> procs allow you to cast{' '}
              <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> instantly.
              <div>
                <strong>
                  Ideally none should go to waste, but some may drop during an intense{' '}
                  <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> window.
                </strong>
              </div>
            </p>
          }
          data={
            <PassFail
              value={modules.burnout.consumedProcs}
              total={Math.max(modules.burnout.procs, modules.burnout.consumedProcs)}
              passed={
                modules.burnout.consumedProcs ===
                Math.max(modules.burnout.procs, modules.burnout.consumedProcs)
              }
            />
          }
        />
      )}
    </SubSection>
  );
}

function NoWastedBuffsSubsection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const hasImminentDestruction = info.combatant.hasTalent(
    TALENTS_EVOKER.IMMINENT_DESTRUCTION_DEVASTATION_TALENT,
  );
  const hasStrafingRun = info.combatant.hasTalent(TALENTS_EVOKER.STRAFING_RUN_TALENT);
  const hasMassDisintegrate = info.combatant.hasTalent(TALENTS_EVOKER.MASS_DISINTEGRATE_TALENT);
  const hasAzureSweep = info.combatant.hasTalent(TALENTS_EVOKER.AZURE_SWEEP_TALENT);

  if (!hasImminentDestruction && !hasStrafingRun && !hasMassDisintegrate && !hasAzureSweep) {
    return null;
  }

  //console.log(modules.azureSweep.buffRatio);

  return (
    <SubSection title="No Wasted Buffs">
      <p>
        <InformationIcon /> Note that buffs that weren't used by the time the fight ended are
        counted as wasted.
      </p>
      {hasMassDisintegrate && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <p>
              <strong>
                <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />
              </strong>{' '}
              is a powerful buff gained by casting Empowers which increases the damage of{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> and allows it to strike multiple targets.
              <div>
                <strong>None should go to waste.</strong>
              </div>
            </p>
          }
          data={
            <PassFail
              value={modules.massDisintegrate.consumedBuffs}
              total={modules.massDisintegrate.totalBuffs}
              passed={modules.massDisintegrate.wastedBuffs === 0}
            />
          }
        />
      )}
      {hasImminentDestruction && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <p>
              <strong>
                <SpellLink spell={TALENTS_EVOKER.IMMINENT_DESTRUCTION_DEVASTATION_TALENT} />
              </strong>{' '}
              reduces the <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> cost of your next{' '}
              <strong>{IMMINENT_DESTRUCTION_INITIAL_STACKS_DEVA}</strong>{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> and <SpellLink spell={SPELLS.PYRE} />.
              <div>
                <strong>None should go to waste.</strong>
              </div>
            </p>
          }
          data={
            <PassFail
              value={modules.imminentDestruction.consumedBuffs}
              total={modules.imminentDestruction.totalBuffs}
              passed={modules.imminentDestruction.wastedBuffs === 0}
            />
          }
        />
      )}
      {hasStrafingRun && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <p>
              <strong>
                <SpellLink spell={TALENTS_EVOKER.STRAFING_RUN_TALENT} />
              </strong>{' '}
              allows <SpellLink spell={SPELLS.DEEP_BREATH} /> to be cast again within{' '}
              {formatDurationMillisMinSec(STRAFING_RUN_DURATION, 0)} of being used.
              {hasMassDisintegrate && (
                <div>
                  When playing as Scalecommander, you should wait with re-casting{' '}
                  <SpellLink spell={SPELLS.DEEP_BREATH} /> until{' '}
                  <SpellLink spell={TALENTS_EVOKER.MELT_ARMOR_TALENT} /> runs out.
                </div>
              )}
              <div>
                <strong>None should go to waste.</strong>
              </div>
            </p>
          }
          data={
            <PassFail
              value={modules.strafingRun.consumedBuffs}
              total={modules.strafingRun.totalBuffs}
              passed={modules.strafingRun.wastedBuffs === 0}
            />
          }
        />
      )}
      {hasAzureSweep && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <p>
              <strong>
                <SpellLink spell={TALENTS_EVOKER.AZURE_SWEEP_TALENT} />
              </strong>{' '}
              is an upgraded version of <SpellLink spell={SPELLS.AZURE_STRIKE} /> that is gained
              after casting <SpellLink spell={SPELLS.ETERNITY_SURGE} />.
              <div>
                <strong>
                  Ideally none should go to waste, but some may be wasted due to having to cast
                  higher priority spells.
                </strong>
              </div>
            </p>
          }
          data={
            <PassFail
              value={modules.azureSweep.consumedBuffs}
              total={modules.azureSweep.totalBuffs}
              passed={modules.azureSweep.buffRatio > 0.9}
            />
          }
        />
      )}
    </SubSection>
  );
}
