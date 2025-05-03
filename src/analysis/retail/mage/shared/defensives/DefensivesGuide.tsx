import { GoodColor, Section, SubSection, useAnalyzers } from 'interface/guide';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import Explanation from 'interface/guide/components/Explanation';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import { SpellLink, TooltipElement } from 'interface';
import { Highlight } from 'interface/Highlight';
import TALENTS from 'common/TALENTS/mage';
import GreaterInvisibility from './GreaterInvisibility';
import IceBlock from './IceBlock';
import IceCold from './IceCold';
import MirrorImage from './MirrorImage';

const MajorDefensives = () => {
  const defensiveAnalyzers = useAnalyzers([MirrorImage, GreaterInvisibility, IceBlock, IceCold]);

  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>
        <p>
          Effectively using your major defensive cooldowns is an important aspect of your
          performance, as it will not only increase your own survivability, but also your entire
          raid by allowing healers to focus on keeping others alive.
          <br />
          As an <span className="Mage">Mage</span> you have access to many defensives CDs such as{' '}
          <SpellLink spell={TALENTS.MIRROR_IMAGE_TALENT} />,{' '}
          <SpellLink spell={TALENTS.GREATER_INVISIBILITY_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.ICE_BLOCK_TALENT} />/
          <SpellLink spell={TALENTS.ICE_COLD_TALENT} />.
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
            defensives is a common problem! For <span className="Mage">Mages</span>, it is also
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
        <Timeline analyzers={defensiveAnalyzers} />
      </SubSection>
      <AllCooldownUsageList analyzers={defensiveAnalyzers} />
    </Section>
  );
};

export default MajorDefensives;
