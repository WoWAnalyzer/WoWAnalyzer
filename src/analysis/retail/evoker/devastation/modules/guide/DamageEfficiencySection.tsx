import { GuideProps, PassFailCheckmark, Section, SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import SPELLS from 'common/SPELLS';

import PassFailBar from 'interface/guide/components/PassFailBar';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';

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
      {props.modules.shatteringStarGuide.guideSubsection()}
    </Section>
  );
}

function DisintegrateSubsection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const tickData = modules.disintegrate.tickData;
  if (tickData.regularTicks === 0) {
    return null;
  }

  return (
    <SubSection title="Clipping/Chaining Disintegrate">
      <p>
        You should always aim to chain <SpellLink spell={SPELLS.DISINTEGRATE} />. Chaining refers to
        recasting <SpellLink spell={SPELLS.DISINTEGRATE} /> while already channeling a{' '}
        <SpellLink spell={SPELLS.DISINTEGRATE} /> after the penultimate (second to last) tick in
        order to channel two <SpellLink spell={SPELLS.DISINTEGRATE} /> in a row without downtime or
        losing a tick. This is essentially just the same Pandemic effect that DoTs have since{' '}
        <SpellLink spell={SPELLS.DISINTEGRATE} /> functions as a DoT.
      </p>
      <p>
        Inside of <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> you should be clipping{' '}
        <SpellLink spell={SPELLS.DISINTEGRATE} /> after the third tick with more important spells
        such <SpellLink spell={SPELLS.FIRE_BREATH} />, <SpellLink spell={SPELLS.ETERNITY_SURGE} />,{' '}
        <SpellLink spell={SPELLS.SHATTERING_STAR} /> or <SpellLink spell={SPELLS.BURNOUT_BUFF} />.
        As well as early chaining your <SpellLink spell={SPELLS.DISINTEGRATE} /> after the third
        tick to maximize resources generation and expenditure.
      </p>
      <p>
        See{' '}
        <a href="https://www.wowhead.com/guide/classes/evoker/devastation/rotation-cooldowns-pve-dps#chaining-disintegrate-casts">
          Chaining Disintegrate casts
        </a>{' '}
        section on wowhead for a more in-depth explanation.
      </p>
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <div>
            <p>
              <SpellLink spell={SPELLS.DISINTEGRATE} /> efficiency outside of{' '}
              <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />
            </p>
            <p>
              Currently it is optimal to always clip ticks, even outside of{' '}
              <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />
            </p>
          </div>
        }
        data={
          <PassFail
            value={tickData.regularTicks}
            total={tickData.totalPossibleRegularTicks}
            passed={tickData.regularTickRatio > 0.8}
          />
        }
      />

      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <div>
            <p>
              <SpellLink spell={SPELLS.DISINTEGRATE} /> efficiency during
              <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />
            </p>
            <p>
              Aim to drop 70%-90% of ticks (i.e. clip) so you can consume resources faster, as well
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

      {info.combatant.hasTalent(TALENTS_EVOKER.MASS_DISINTEGRATE_TALENT) && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <div>
              <p>
                <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} /> efficiency
              </p>
              <p>You should not be dropping any ticks here.</p>
            </div>
          }
          data={
            <PassFail
              value={tickData.massDisintegrateTicks}
              total={tickData.totalPossibleMassDisintegrateTicks}
              passed={
                tickData.massDisintegrateTicks === tickData.totalPossibleMassDisintegrateTicks
              }
            />
          }
        />
      )}
      {modules.disintegrate.guideSubSection()}
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
            <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> procs are essential because they help
            you cast your primary damaging spells,
            <SpellLink spell={SPELLS.DISINTEGRATE} /> and{' '}
            <SpellLink spell={TALENTS_EVOKER.PYRE_TALENT} />, for free. None should go to waste.
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
            <SpellLink spell={TALENTS_EVOKER.BURNOUT_TALENT} /> procs allow you to cast{' '}
            <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> instantly. Ideally none should go to
            waste, but some may drop during an intense{' '}
            <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> window.
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
              <SpellLink spell={TALENTS_EVOKER.SNAPFIRE_TALENT} /> procs allow you to cast{' '}
              <SpellLink spell={TALENTS_EVOKER.FIRESTORM_TALENT} />. None should to go waste
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
