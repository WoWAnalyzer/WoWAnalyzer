import { TooltipElement } from 'interface';
import { GoodColor, Section, SubSection } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import { Highlight } from 'interface/Highlight';
import AllCooldownUsagesList from './components/AllCooldownUsagesList';
import Timeline from './components/Timeline';

export default function MajorDefensivesSection(): JSX.Element | null {
  return (
    <Section title="Major Defensives">
      <Explanation>
        <p>
          Effectively using your major defensive cooldowns is a core part of playing tank well. This
          is especially true for Brewmasters, as we rely on our many cooldowns to deal with incoming
          damage.
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
        <Timeline />
      </SubSection>
      <AllCooldownUsagesList />
    </Section>
  );
}
