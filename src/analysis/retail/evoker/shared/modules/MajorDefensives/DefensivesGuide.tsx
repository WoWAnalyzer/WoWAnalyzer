import { GoodColor, Section, SubSection, useAnalyzers } from 'interface/guide';
import ObsidianScales from './ObsidianScales';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import Explanation from 'interface/guide/components/Explanation';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import { SpellLink, TooltipElement } from 'interface';
import { Highlight } from 'interface/Highlight';
import TALENTS from 'common/TALENTS/evoker';

const MajorDefensives = () => {
  const defensiveAnalyzers = [ObsidianScales];

  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>
        <p>
          Effectively using your major defensive cooldowns is an important aspect of your
          performance, as it will not only increase your own survivability, but also your entire
          raid by allowing healers to focus on keeping others alive.
          <br />
          As an <span className="Evoker">Evoker</span> you have access to many short CD defensives
          such as <SpellLink spell={TALENTS.OBSIDIAN_SCALES_TALENT} />,{' '}
          <SpellLink spell={TALENTS.RENEWING_BLAZE_TALENT} />,{' '}
          <SpellLink spell={TALENTS.ZEPHYR_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.TWIN_GUARDIAN_TALENT} />.
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
            defensives is a common problem! For <span className="Evoker">Evokers</span>, it is also
            likely to be fatal, since most of your mitigation lies in your active cooldowns.
            <br />
            <small>
              Below the damage chart, your cooldowns are shown. Large gaps may indicate that you
              could get more uses&mdash;but remember that covering spikes is more important than
              maximizing total casts!
            </small>
          </li>
        </ol>
      </Explanation>
      <SubSection title="Damage Taken">
        <Timeline analyzers={useAnalyzers(defensiveAnalyzers)} />
      </SubSection>
      <AllCooldownUsageList analyzers={useAnalyzers(defensiveAnalyzers)} />
    </Section>
  );
};

export default MajorDefensives;
