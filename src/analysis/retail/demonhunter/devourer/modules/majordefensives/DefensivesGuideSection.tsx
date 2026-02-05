import { GoodColor, Section, SubSection, useAnalyzers } from 'interface/guide';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import BlurAnalyzer from './BlurAnalyzer';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import Explanation from 'interface/guide/components/Explanation';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'interface/Tooltip';
import { Highlight } from 'interface/Highlight';

function DefensivesSection() {
  const defensiveAnalyzers = useAnalyzers([BlurAnalyzer]);
  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>
        <p>
          Effectively using your major defensive cooldowns is an important aspect of your
          performance, as it will not only increase your own survivability, but also your entire
          raid by allowing healers to focus on keeping others alive.
          <div>
            As an <span className="DemonHunter">Demon Hunter</span> you have access to a frequent
            defensive CD in <SpellLink spell={SPELLS.BLUR} />.
          </div>
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
            <div>
              <small>
                In the damage chart below, a spike highlighted in{' '}
                <Highlight color={GoodColor} textColor="black">
                  green
                </Highlight>{' '}
                was covered by a defensive.
              </small>
            </div>
          </li>
          <li>
            You should <em>use</em> your cooldowns. This may seem silly&mdash;but not using
            defensives is a common problem!
            <div>
              <small>
                Below the damage chart, your cooldowns are shown. Large gaps may indicate that you
                could get more uses&mdash;but remember that covering spikes is more important than
                maximizing total casts!
              </small>
            </div>
          </li>
        </ol>
      </Explanation>
      <SubSection title="Damage Taken">
        <Timeline analyzers={defensiveAnalyzers} />
      </SubSection>
      <AllCooldownUsageList analyzers={defensiveAnalyzers} />
    </Section>
  );
}

export default DefensivesSection;
