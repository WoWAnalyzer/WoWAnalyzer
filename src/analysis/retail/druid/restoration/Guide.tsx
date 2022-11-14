import SPELLS from 'common/SPELLS';
import { ControlledExpandable, SpellLink } from 'interface';
import { GuideProps, PerformanceMark, Section, SubSection } from 'interface/guide';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { useState } from 'react';

import CombatLogParser from './CombatLogParser';
import { TALENTS_DRUID } from 'common/TALENTS';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells">
        {modules.rejuvenation.guideSubsection}
        {modules.wildGrowth.guideSubsection}
        {modules.regrowthAndClearcasting.guideSubsection}
        {modules.lifebloom.guideSubsection}
        {modules.efflorescence.guideSubsection}
        {modules.swiftmend.guideSubsection}
        {info.combatant.hasTalent(TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT) &&
          modules.soulOfTheForest.guideSubsection}
        {info.combatant.hasTalent(TALENTS_DRUID.CENARION_WARD_TALENT) &&
          modules.cenarionWard.guideSubsection}
      </Section>
      <Section title="Healing Cooldowns">
        <p>
          Resto Druids have access to a variety of powerful healing cooldowns. These cooldowns are
          very mana efficient and powerful, and you should aim to use them frequently. The
          effectiveness of your cooldowns will be greatly increased by "ramping" or pre-casting many{' '}
          <SpellLink id={SPELLS.REJUVENATION.id} /> and a <SpellLink id={SPELLS.WILD_GROWTH.id} />{' '}
          in order to maximize the number of <SpellLink id={SPELLS.MASTERY_HARMONY.id} /> stacks
          present when you activate your cooldown. Plan ahead by starting your ramp in the seconds
          before major raid damage hits. You should always have a Wild Growth out before activating
          one of your cooldowns.
        </p>
        <HotGraphSubsection modules={modules} events={events} info={info} />
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
        <CooldownBreakdownSubsection modules={modules} events={events} info={info} />
      </Section>
    </>
  );
}

function HotGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>HoT Graph</strong> - this graph shows how many Rejuvenation and Wild Growths you had
      active over the course of the encounter, with rule lines showing when you activated your
      healing cooldowns. Did you have a Wild Growth out before every cooldown? Did you ramp
      Rejuvenations well before big damage?
      {modules.hotCountGraph.plot}
    </SubSection>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
        <CastEfficiencyBar
          spellId={SPELLS.CONVOKE_SPIRITS.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.FLOURISH_TALENT.id) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.FLOURISH_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      <CastEfficiencyBar
        spellId={SPELLS.TRANQUILITY_CAST.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      <CastEfficiencyBar
        spellId={SPELLS.INNERVATE.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
    </SubSection>
  );
}

function CooldownBreakdownSubsection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Spell Breakdowns</strong>
      <p />
      {info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) &&
        modules.convokeSpirits.guideCastBreakdown}
      {info.combatant.hasTalent(TALENTS_DRUID.FLOURISH_TALENT.id) &&
        modules.flourish.guideCastBreakdown}
      {info.combatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id) &&
        modules.treeOfLife.guideCastBreakdown}
      {modules.tranquility.guideCastBreakdown}
      {modules.innervate.guideCastBreakdown}
    </SubSection>
  );
}

// TODO replace this with a properly styled and better implemented version in core modules
export function CooldownExpandable({
  header,
  checklistItems,
  detailItems,
  perf,
}: {
  header: React.ReactNode;
  checklistItems?: CooldownExpandableItem[];
  detailItems?: CooldownExpandableItem[];
  perf?: QualitativePerformance;
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const combinedHeader =
    perf !== undefined ? (
      <div>
        {header} &mdash; <PerformanceMark perf={perf} />
      </div>
    ) : (
      header
    );
  return (
    <ControlledExpandable
      header={combinedHeader}
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      <div>
        {checklistItems && checklistItems.length !== 0 && (
          <section>
            <header style={{ fontWeight: 'bold' }}>Checklist</header>
            <tbody>
              <table>
                {checklistItems.map((item, ix) => (
                  <tr key={'checklist-' + ix}>
                    <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: '25em' }}>
                      {item.label}
                    </td>
                    <td style={{ paddingRight: '1em', textAlign: 'right' }}>{item.result}</td>
                    {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
                  </tr>
                ))}
              </table>
            </tbody>
          </section>
        )}
        {detailItems && detailItems.length !== 0 && (
          <section>
            <tbody>
              <header style={{ fontWeight: 'bold' }}>Details</header>
              <table>
                {detailItems.map((item, ix) => (
                  <tr key={'details-' + ix}>
                    <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: '25em' }}>
                      {item.label}
                    </td>
                    <td style={{ paddingRight: '1em', textAlign: 'right' }}>{item.result}</td>
                    {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
                  </tr>
                ))}
              </table>
            </tbody>
          </section>
        )}
      </div>
    </ControlledExpandable>
  );
}

export interface CooldownExpandableItem {
  label: React.ReactNode;
  result: React.ReactNode;
  details?: React.ReactNode;
}
