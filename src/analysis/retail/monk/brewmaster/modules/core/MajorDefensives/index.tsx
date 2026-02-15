import type { JSX } from 'react';
import { SpellLink, TooltipElement } from 'interface';
import { GoodColor, Section, SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import AllCooldownUsagesList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import { Highlight } from 'interface/Highlight';
import { MAJOR_ANALYZERS } from './config';
import SPELLS from '../../../spell-list_Monk_Brewmaster.retail';

export default function MajorDefensivesSection(): JSX.Element | null {
  const analyzers = useAnalyzers(MAJOR_ANALYZERS);
  return (
    <Section title={<SpellLink spell={SPELLS.FORTIFYING_BREW} />}>
      <Explanation>
        <p>
          Effectively using your major defensive cooldowns is a core part of playing tank well.
          While Brewmaster has fewer cooldowns than in previous expansions, proper use of{' '}
          <SpellLink spell={SPELLS.FORTIFYING_BREW} /> is still important.
        </p>
        <p>There are two things you should look for in your cooldown usage:</p>
        <ol>
          <li>
            You should cover as many{' '}
            <TooltipElement
              content={
                <>
                  A <strong>damage spike</strong> is when you take much more damage than normal in a
                  small amount of time. These are visible on the Timeline below as tall spikes.
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
            defensives is a common problem! For Brewmasters, it is also likely to be fatal.
            <br />
            <small>
              Below the damage chart, your cooldowns are shown. Large gaps may indicate that you
              could get more uses&mdash;but remember that covering spikes is more important than
              maximizing total casts!
            </small>
          </li>
        </ol>
      </Explanation>
      <SubSection title="Timeline">
        <Timeline analyzers={analyzers} />
      </SubSection>
      <AllCooldownUsagesList analyzers={analyzers} />
    </Section>
  );
}
