import { GoodColor, Section, SubSection, useAnalyzers } from 'interface/guide';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import Explanation from 'interface/guide/components/Explanation';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import { SpellLink, TooltipElement } from 'interface';
import { Highlight } from 'interface/Highlight';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import SurvivalOfTheFittest from 'analysis/retail/hunter/shared/talents/SurvivalOfTheFittest';

const MajorDefensives = () => {
  const defensiveAnalyzers = [SurvivalOfTheFittest];

  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>
        <p>
          Effectively using your major defensive cooldowns is an important aspect of your
          performance, as it will not only increase your own survivability, but also your entire
          raid by allowing healers to focus on keeping others alive.
          <br />
          As a <span className="Hunter">Survival Hunter</span> you have access to one relatively
          short CD defensive in <SpellLink spell={TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT} />, one
          heal in
          <SpellLink spell={SPELLS.EXHILARATION} />, and a Pseudo-Immunity in
          <SpellLink spell={SPELLS.ASPECT_OF_THE_TURTLE} />. Turtle will deflect nearly every attack
          cast <strong> after</strong>
          the ability is used. It will not deflect projectiles that are already traveling to you and
          care should be taken to not cancel it at inopportune times.
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
            You should <em>use</em> your cooldowns. This may seem silly&mdash;but not using
            defensives is a common problem! For <span className="Hunter">Hunters</span>, it is also
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
