import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { GoodColor, Section, SubSection, useAnalyzers, useInfo } from 'interface/guide';
import { Highlight } from 'interface/Highlight';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import VerticallyAlignedToggle from 'interface/VerticallyAlignedToggle';
import { useState } from 'react';
import ElusiveMists from './ElusiveMists';
import FortifyingBrew from './FortifyingBrew';
import JadeSanctuary from './JadeSanctuary';

const USAGE_ANALYZERS = [FortifyingBrew, JadeSanctuary];

export default function DefensivesGuide() {
  const info = useInfo();
  const usageAnalyzers = useAnalyzers(USAGE_ANALYZERS);
  const elusiveMists = useAnalyzers([ElusiveMists]);
  const [showElusiveMists, setShowElusiveMists] = useState(false);

  if (!info) return null;

  const hasJadeSanctuary = info.combatant.hasTalent(TALENTS_MONK.JADE_SANCTUARY_TALENT);
  const hasElusiveMists = info.combatant.hasTalent(TALENTS_MONK.ELUSIVE_MISTS_TALENT);
  const hasSpiritfont = info.combatant.hasTalent(TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT);
  const timelineAnalyzers = showElusiveMists
    ? [...usageAnalyzers, ...elusiveMists]
    : usageAnalyzers;

  return (
    <Section title="Defensives">
      <SubSection>
        <p>
          <b>
            <SpellLink spell={TALENTS_MONK.FORTIFYING_BREW_TALENT} />
          </b>{' '}
          is Mistweaver's only major defensive cooldown. It does not need to be used on cooldown,
          but it should be active <strong>before</strong> big hits land, and any spare uses should
          cover periods of heavy sustained damage.
          {hasJadeSanctuary && (
            <>
              {' '}
              <SpellLink spell={TALENTS_MONK.JADE_SANCTUARY_TALENT} /> turns{' '}
              <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_MISTWEAVER_TALENT} /> into a second
              damage reduction window, ideally spaced out from Fortifying Brew.
            </>
          )}
          {hasElusiveMists && (
            <>
              {' '}
              <SpellLink spell={TALENTS_MONK.ELUSIVE_MISTS_TALENT} /> adds a small reduction to you
              and your target whenever you are channeling{' '}
              <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} />
              {hasSpiritfont && (
                <>
                  , and to the targets of your active{' '}
                  <SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} /> beams
                </>
              )}
              . Only the reduction on you from your personal channel is tracked here, since this
              section covers your personal defensives.
            </>
          )}
        </p>
      </SubSection>
      <SubSection>
        <strong>Damage Taken Graph</strong> - this graph shows the damage you took over the fight. A
        spike highlighted in{' '}
        <Highlight color={GoodColor} textColor="black">
          green
        </Highlight>{' '}
        was covered by one of your damage reductions. The cooldown bars below the chart show when
        each was available, so large gaps next to uncovered spikes are the uses to look for.
        {hasElusiveMists && (
          <div className="flex">
            <div className="flex-main" />
            <div className="flex-sub">
              <VerticallyAlignedToggle
                id="mistweaver-defensives-show-elusive-mists"
                enabled={showElusiveMists}
                setEnabled={setShowElusiveMists}
                label={
                  <>
                    Show <SpellLink spell={TALENTS_MONK.ELUSIVE_MISTS_TALENT} />
                  </>
                }
                tooltipContent="Soothing Mist channels are frequent and short, which can clutter the chart. Turn this off to see only your cooldown-based defensives."
              />
            </div>
          </div>
        )}
        <Timeline analyzers={timelineAnalyzers} />
      </SubSection>
      <AllCooldownUsageList analyzers={usageAnalyzers} showTitles />
    </Section>
  );
}
