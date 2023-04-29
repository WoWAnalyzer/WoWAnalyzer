import { GoodColor, SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import { TooltipElement } from 'interface';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import { Highlight } from 'interface/Highlight';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsagesList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import { MAJOR_ANALYZERS, TIMELINE_ANALYZERS } from './config';

const MajorDefensives = () => {
  const timelineAnalyzers = useAnalyzers(TIMELINE_ANALYZERS);
  const cdAnalyzers = useAnalyzers(MAJOR_ANALYZERS);
  return (
    <>
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <SubSection>
        <Explanation>
          <p>
            Effectively using your major defensive cooldowns is a core part of playing tank well.
            This is especially true for Vengeance Demon Hunters, as we rely on our cooldowns to deal
            with incoming damage.
          </p>
          <p>There are two things you should look for in your cooldown usage:</p>
          <ol>
            <li>
              You should cover as many{' '}
              <TooltipElement
                content={
                  <>
                    A <strong>damage spike</strong> is when you take much more damage than normal in
                    a small amount of time. These are visible on the Timeline below as tall spikes.
                  </>
                }
              >
                damage spikes
              </TooltipElement>{' '}
              as possible, and use any left over to cover periods of heavy, consistent damage.
              <br />
              <small>
                In the damage chart below, a spike highlighted in{' '}
                <Highlight color={GoodColor} textColor="black">
                  green
                </Highlight>{' '}
                was covered by a defensive.
              </small>
            </li>
            <li>
              You should <em>use</em> your cooldowns. This may seem silly&mdash;but not using major
              defensives is a common problem! For Vengeance Demon Hunters, it is also likely to be
              fatal.
              <br />
              <small>
                Below the damage chart, your cooldowns are shown. Large gaps may indicate that you
                could get more uses&mdash;but remember that covering spikes is more important than
                maximizing total casts!
              </small>
            </li>
          </ol>
          <p>
            Vengeance Demon Hunter is unique in that two of our major defensives (
            <SpellLink spell={TALENTS.FIERY_BRAND_TALENT} /> and{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> [with{' '}
            <SpellLink spell={TALENTS.VOID_REAVER_TALENT} />
            ]) are applied to enemies instead of ourselves. This leads to some headaches when trying
            to diagram how certain spells/talents (like{' '}
            <SpellLink spell={TALENTS.BURNING_ALIVE_TALENT} />) affect your damage intake. Until we
            get around to allowing you to toggle which enemy you're looking at in the below
            timeline, <SpellLink spell={TALENTS.FIERY_BRAND_TALENT} /> and{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> are excluded.
          </p>
        </Explanation>
      </SubSection>
      <SubSection title="Timeline">
        <Timeline analyzers={timelineAnalyzers} />
      </SubSection>
      <AllCooldownUsagesList analyzers={cdAnalyzers} />
    </>
  );
};

export default MajorDefensives;
