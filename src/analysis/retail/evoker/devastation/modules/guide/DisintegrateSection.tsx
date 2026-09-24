import { GuideProps, Section, SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import SPELLS from 'common/SPELLS';

import { JSX, ReactNode } from 'react';
import Spell from 'common/SPELLS/Spell';
import { CastOverview, TipBox } from 'interface/guide/components';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

function Explanation({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div>
        <strong style={{ fontSize: 16 }}>{title}</strong>
      </div>
      {children}
    </div>
  );
}

export function DisintegrateSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const tickData = modules.disintegrate.tickData;

  if (tickData.regularTicks + tickData.dragonRageTicks + tickData.massDisintegrateTicks === 0) {
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
    <ul style={{ listStyle: 'none', padding: '0px', margin: 0 }}>{elements}</ul>
  );

  const stats = [];

  if (tickData.totalPossibleRegularTicks > 0) {
    stats.push({
      label: 'Basic Tick Efficiency',
      value: `${tickData.regularTicks}/${tickData.totalPossibleRegularTicks}`,
      tooltip: (
        <>
          <div>
            <strong>
              Efficiency outside of <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />
            </strong>
          </div>
          {clipLogic.thresholdEarlyChainTicks > 1 || clipLogic.allowGoodClipping ? (
            <>
              {clipLogic.thresholdEarlyChainTicks > 1 && (
                <>
                  You should be early chaining <SpellLink spell={SPELLS.DISINTEGRATE} />.
                </>
              )}
              {clipLogic.allowGoodClipping && (
                <>
                  You should be clipping <SpellLink spell={SPELLS.DISINTEGRATE} /> in favor of:
                  {clippedSpellsContent}
                </>
              )}
            </>
          ) : (
            <>You should not be dropping any ticks here.</>
          )}
        </>
      ),
      performance: tickData.regularTickPerformance,
    });
  }
  if (tickData.totalPossibleDragonRageTicks > 0) {
    stats.push({
      label: 'Dragonrage Tick Efficiency',
      value: `${tickData.dragonRageTicks}/${tickData.totalPossibleDragonRageTicks}`,
      tooltip: (
        <>
          <div>
            <strong>
              Efficiency during <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />
            </strong>
          </div>
          {clipLogic.thresholdEarlyChainTicksDragonrage > 1 ||
          clipLogic.allowGoodClippingDragonrage ? (
            <>
              {clipLogic.thresholdEarlyChainTicksDragonrage > 1 && (
                <>
                  You should be early chaining <SpellLink spell={SPELLS.DISINTEGRATE} />.
                </>
              )}
              {clipLogic.allowGoodClippingDragonrage && (
                <>
                  You should be clipping <SpellLink spell={SPELLS.DISINTEGRATE} /> in favor of:
                  {clippedSpellsContent}
                </>
              )}
            </>
          ) : (
            <>You should not be dropping any ticks here.</>
          )}
        </>
      ),
      performance: tickData.dragonRageTickPerformance,
    });
  }
  if (tickData.totalPossibleMassDisintegrateTicks > 0) {
    stats.push({
      label: 'Mass Disintegrate Tick Efficiency',
      value: `${tickData.massDisintegrateTicks}/${tickData.totalPossibleMassDisintegrateTicks}`,
      tooltip: (
        <>
          <div>
            <strong>
              Efficiency of <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />
            </strong>
          </div>
          <>
            You should never drop ticks of <SpellLink spell={SPELLS.MASS_DISINTEGRATE_BUFF} />
          </>
        </>
      ),
      performance: tickData.massDisintegrateTickPerformance,
    });
  }

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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              columnGap: '10px',
              padding: '10px 0px',
            }}
          >
            <Explanation title="Chaining">
              Chaining refers to recasting <SpellLink spell={SPELLS.DISINTEGRATE} /> while already
              channeling a <SpellLink spell={SPELLS.DISINTEGRATE} /> after the penultimate (second
              to last) tick in order to channel two <SpellLink spell={SPELLS.DISINTEGRATE} /> in a
              row without downtime or losing a tick.
            </Explanation>
            <Explanation title="Early Chaining">
              Early chaining refers to chaining two <SpellLink spell={SPELLS.DISINTEGRATE} /> casts
              before the penultimate tick. This wastes ticks but is occasionally useful.
            </Explanation>
            <Explanation title="Clipping">
              Clipping refers to interrupting a channel of <SpellLink spell={SPELLS.DISINTEGRATE} />{' '}
              early by using another spell.
            </Explanation>
          </div>
          <TipBox type="warning" title="">
            Clipping is usually a very minor DPS gain, if any at all. The modules below will
            elaborate whether clipping is relevant. Additionally it is preferred to chain correctly
            if clipping incorrectly is likely
          </TipBox>
          <TipBox type="note">
            For further information, including which spells you should clip{' '}
            <SpellLink spell={SPELLS.DISINTEGRATE} /> for, see{' '}
            <a href="https://www.wowhead.com/guide/classes/evoker/devastation/rotation-cooldowns-pve-dps#advanced-disintegrate-chaining-and-clipping">
              Disintegrate Chaining and Clipping
            </a>
          </TipBox>
        </SubSection>
      </div>
      <SubSection title="">
        <RoundedPanel style={{ marginBottom: '10px' }}>
          <CastOverview spell={SPELLS.DISINTEGRATE} title="Overall Tick Efficiency" stats={stats} />
          {modules.disintegrate.guideSubSection()}
        </RoundedPanel>
      </SubSection>
    </Section>
  );
}
