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
import { TIERS } from 'game/TIERS';

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
      <DisintegrateSubsection {...props} />
      <NoWastedProcsSubsection {...props} />
      <ShatteringStarSubsection {...props} />
      <BlazeShardsSubsection {...props} />
    </Section>
  );
}

function DisintegrateSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  const tickData = modules.disintegrate.tickData;
  if (tickData.regularTicks === 0) {
    return null;
  }

  return (
    <SubSection title="Clipping/Chaining Disintegrate">
      <p>
        You should always aim to chain <SpellLink id={SPELLS.DISINTEGRATE.id} />. Chaining refers to
        recasting <SpellLink id={SPELLS.DISINTEGRATE.id} /> while already channeling a{' '}
        <SpellLink id={SPELLS.DISINTEGRATE.id} /> after the penultimate (second to last) tick in
        order to channel two <SpellLink id={SPELLS.DISINTEGRATE.id} /> in a row without downtime or
        losing a tick. This is essentially just the same Pandemic effect that DoTs have since{' '}
        <SpellLink id={SPELLS.DISINTEGRATE.id} /> funcions as a DoT.
      </p>
      <p>
        Inside of <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} /> you should be clipping{' '}
        <SpellLink id={SPELLS.DISINTEGRATE.id} /> after the third tick with more important spells
        such <SpellLink id={SPELLS.FIRE_BREATH.id} />, <SpellLink id={SPELLS.ETERNITY_SURGE.id} />,{' '}
        <SpellLink id={SPELLS.SHATTERING_STAR.id} /> or <SpellLink id={SPELLS.BURNOUT_BUFF.id} />.
        Aswell as early chaining your <SpellLink id={SPELLS.DISINTEGRATE.id} /> after the third tick
        to maximize ressource generation and expenditure.
      </p>
      <p>
        See{' '}
        <a href="https://www.wowhead.com/guide/classes/evoker/devastation/rotation-cooldowns-pve-dps#chaining-disintegrate-casts">
          Chaining Disintegrate casts
        </a>{' '}
        section on wowhead for a more indepth explanation.
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
              Aim to drop 70%-90% of ticks (i.e. clip) so you can consume ressources faster, aswell
              as getting off more casts of important spells.
            </p>
          </div>
        }
        data={
          <PassFail
            value={tickData.dragonRageTicks}
            total={tickData.totalPossibleDragonRageTicks}
            customTotal={tickData.totalPossibleDragonRageTicks * 0.75}
            passed={tickData.dragonRageTickRatio < 0.9 && tickData.dragonRageTickRatio > 0.7}
          />
        }
      />
    </SubSection>
  );
}

function NoWastedProcsSubsection({ modules, info }: GuideProps<typeof CombatLogParser>) {
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
            total={Math.max(modules.essenceBurst.procs, modules.essenceBurst.consumedProcs)}
            passed={
              modules.essenceBurst.consumedProcs ===
              Math.max(modules.essenceBurst.procs, modules.essenceBurst.consumedProcs)
            }
          />
        }
      />
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <p>
            <SpellLink id={TALENTS_EVOKER.BURNOUT_TALENT.id} /> procs allow you to cast{' '}
            <SpellLink id={SPELLS.LIVING_FLAME_CAST.id} /> instantly. Ideally none should go to
            waste, but some may drop during an intense{' '}
            <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} /> window.
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
      {info.combatant.hasTalent(TALENTS_EVOKER.SNAPFIRE_TALENT) && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <p>
              <SpellLink id={TALENTS_EVOKER.SNAPFIRE_TALENT.id} /> procs allow you to cast{' '}
              <SpellLink id={TALENTS_EVOKER.FIRESTORM_TALENT.id} />. None should to go waste
            </p>
          }
          data={
            <PassFail
              value={modules.snapfire.consumedProcs}
              total={Math.max(modules.snapfire.procs, modules.snapfire.consumedProcs)}
              passed={
                modules.snapfire.consumedProcs ===
                Math.max(modules.snapfire.procs, modules.snapfire.consumedProcs)
              }
            />
          }
        />
      )}
    </SubSection>
  );
}

function ShatteringStarSubsection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  if (!info.combatant.hasTalent(TALENTS_EVOKER.SHATTERING_STAR_TALENT)) {
    return null;
  }

  return (
    <SubSection title="Shattering Star">
      <p>
        <SpellLink id={TALENTS_EVOKER.SHATTERING_STAR_TALENT} /> provides us with a small window
        where our damage gets amplified. To maximize this window aim to have at least 1-2 uses of{' '}
        <SpellLink id={SPELLS.DISINTEGRATE} /> or <SpellLink id={SPELLS.PYRE} /> by pooling{' '}
        <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> and/or{' '}
        <SpellLink id={SPELLS.ESSENCE_BURST_BUFF.id} /> when{' '}
        <SpellLink id={TALENTS_EVOKER.SHATTERING_STAR_TALENT.id} /> is almost off CD. Using{' '}
        <SpellLink id={SPELLS.ETERNITY_SURGE} /> is also good, but don't hold the CD for this
        window. With <SpellLink id={TALENTS_EVOKER.ARCANE_VIGOR_TALENT} /> talented, you should
        always have atleast one use of <SpellLink id={SPELLS.DISINTEGRATE} />. For more tips, check
        out mentions of Shattering Star in the{' '}
        <a href="https://www.wowhead.com/guide/classes/evoker/devastation/rotation-cooldowns-pve-dps#rotation">
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

function BlazeShardsSubsection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  if (!info.combatant.has4PieceByTier(TIERS.T30)) {
    return null;
  }

  return (
    <SubSection title="Blazing Shards">
      <p>
        <SpellLink id={SPELLS.BLAZING_SHARDS} /> is a buff you gain from using{' '}
        <SpellLink id={SPELLS.ETERNITY_SURGE} /> or <SpellLink id={SPELLS.FIRE_BREATH.id} />.
        <SpellLink id={SPELLS.BLAZING_SHARDS} /> gives your{' '}
        <SpellLink id={SPELLS.OBSIDIAN_SHARDS.id} /> DoT a 200% damage amp. This buff is fully
        active during <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} />.{' '}
        <SpellLink id={SPELLS.BLAZING_SHARDS} /> isn't extended when you cast your empowers back to
        back, it instead gets overriden. It is therefore important to stagger out your empowers to
        maximize uptime of <SpellLink id={SPELLS.BLAZING_SHARDS} />.
      </p>
      <p>
        Total uptime lost is: <strong>{modules.T30devaTier4P.lostUptime.toFixed(2)}s</strong>.
      </p>
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <RoundedPanel>
            <strong>Buff breakdown</strong>
            <small> Try not to override Blazing Shards!</small>

            <PerformanceBoxRow values={modules.T30devaTier4P.windowEntries} />
          </RoundedPanel>
        }
        data={
          <div>
            <strong>Summary</strong>
            <DonutChart items={modules.T30devaTier4P.donutItems} />
          </div>
        }
      />
    </SubSection>
  );
}

// https://www.icy-veins.com/wow/devastation-evoker-pve-dps-rotation-cooldowns-abilities
