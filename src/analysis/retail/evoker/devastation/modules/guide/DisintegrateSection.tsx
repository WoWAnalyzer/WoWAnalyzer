import { GuideProps, PassFailCheckmark, Section, SubSection } from 'interface/guide';
import { SpellLink, TooltipElement } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import SPELLS from 'common/SPELLS';

import PassFailBar from 'interface/guide/components/PassFailBar';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { JSX } from 'react';
import Spell from 'common/SPELLS/Spell';
import { WarningIcon } from 'interface/icons';

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

export function DisintegrateSection(props: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Disintegrate">
      <div>
        <SubSection title="Explanation">
          <strong>
            <SpellLink spell={SPELLS.DISINTEGRATE} />
          </strong>{' '}
          is the main spender of Devastation Evoker. It is the most nuanced spell in the entire kit
          and as such also has a lot of avenues for optimization. The analysis below uses specific,
          agreed upon, terms which are explained here:
          <ul>
            <li>
              <strong>Chaining</strong> - Chaining refers to recasting{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> while already channeling a{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> after the penultimate (second to last) tick
              in order to channel two <SpellLink spell={SPELLS.DISINTEGRATE} /> in a row without
              downtime or losing a tick.
            </li>
            <li>
              <strong>Early Chaining</strong> - Early chaining refers to chaining two{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> casts before the penultimate tick. This
              wastes ticks but is occasionally useful.
            </li>
            <li>
              <strong>Clipping</strong> - Clipping refers to interrupting a channel of{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> early by using another spell.
            </li>
            <li>
              For further information, including which spells you should clip{' '}
              <SpellLink spell={SPELLS.DISINTEGRATE} /> for, see{' '}
              <a href="https://www.wowhead.com/guide/classes/evoker/devastation/rotation-cooldowns-pve-dps#advanced-disintegrate-chaining-and-clipping">
                Disintegrate Chaining and Clipping
              </a>{' '}
            </li>
          </ul>
          <div>
            <strong>
              <WarningIcon /> Clipping is usually a very minor DPS gain, if any at all. The modules
              below will elaborate whether clipping is relevant. Addtionally it is prefered to chain
              correctly if clipping incorrectly is likely
            </strong>
          </div>
        </SubSection>
      </div>
      <DisintegrateSubsection {...props} />
    </Section>
  );
}

function DisintegrateSubsection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const tickData = modules.disintegrate.tickData;
  if (tickData.regularTicks === 0) {
    return null;
  }

  const goodClipSpells: Spell[] = [];
  modules.disintegrate.goodClipSpells.forEach((spell) => {
    if (!goodClipSpells.find((x) => x.name === spell.name)) {
      goodClipSpells.push(spell);
    }
  });

  const clipLogic = modules.disintegrate.activeChainClipLogic;

  // Good Clipping Spells
  const elements: JSX.Element[] = [];
  goodClipSpells.forEach((id) => {
    elements.push(
      <li>
        <SpellLink spell={id}></SpellLink>
      </li>,
    );
  });
  const clippedSpellsContent = (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{elements}</ul>
  );

  return (
    <SubSection title="Overall Tick Efficiency">
      <ExplanationAndDataSubSection
        explanationPercent={EXPLANATION_PERCENTAGE}
        explanation={
          <div>
            <b>
              Efficiency outside of <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />
            </b>
            {clipLogic.thresholdEarlyChainTicks > 1 || clipLogic.allowGoodClipping ? (
              <p>
                {clipLogic.thresholdEarlyChainTicks > 1 && (
                  <>
                    You should be early chaining <SpellLink spell={SPELLS.DISINTEGRATE} />
                  </>
                )}
                {clipLogic.thresholdEarlyChainTicks > 1 && clipLogic.allowGoodClipping ? (
                  <> and you </>
                ) : clipLogic.allowGoodClipping ? (
                  <>You </>
                ) : (
                  <>.</>
                )}
                {clipLogic.allowGoodClipping && (
                  <>
                    should be clipping <SpellLink spell={SPELLS.DISINTEGRATE} /> in favor of{' '}
                    <TooltipElement content={clippedSpellsContent}>
                      high-value spells
                    </TooltipElement>
                    .
                  </>
                )}
              </p>
            ) : (
              <p>You should not be dropping any ticks here.</p>
            )}
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
            <b>
              Efficiency during <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />
            </b>
            {clipLogic.thresholdEarlyChainTicksDragonrage > 1 ||
            clipLogic.allowGoodClippingDragonrage ? (
              <p>
                During Dragonrage,{' '}
                {clipLogic.thresholdEarlyChainTicksDragonrage > 1 && (
                  <>
                    you should be early chaining <SpellLink spell={SPELLS.DISINTEGRATE} />
                  </>
                )}
                {clipLogic.thresholdEarlyChainTicksDragonrage > 1 &&
                clipLogic.allowGoodClippingDragonrage ? (
                  <> and you </>
                ) : clipLogic.allowGoodClippingDragonrage ? (
                  <>you </>
                ) : (
                  <>.</>
                )}
                {clipLogic.allowGoodClippingDragonrage && (
                  <>
                    should be clipping <SpellLink spell={SPELLS.DISINTEGRATE} /> in favor of{' '}
                    <TooltipElement content={clippedSpellsContent}>
                      high-value spells
                    </TooltipElement>
                    .
                  </>
                )}
              </p>
            ) : (
              <p>During Dragonrage, you should not be dropping any ticks.</p>
            )}
          </div>
        }
        data={
          <PassFail
            value={tickData.dragonRageTicks}
            total={tickData.totalPossibleDragonRageTicks}
            /*customTotal={tickData.totalPossibleDragonRageTicks * 0.75}*/
            passed={tickData.dragonRageTickRatio > 0.9}
          />
        }
      />

      {info.combatant.hasTalent(TALENTS_EVOKER.MASS_DISINTEGRATE_TALENT) && (
        <ExplanationAndDataSubSection
          explanationPercent={EXPLANATION_PERCENTAGE}
          explanation={
            <div>
              <b>
                Efficiency of <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />
              </b>
              <p>
                You should never drop ticks of <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />
              </p>
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
