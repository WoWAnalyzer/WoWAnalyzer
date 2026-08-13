import { SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import ShieldOfTheRighteousSection from '../../features/ShieldOfTheRighteousGuideSection';
import { TIMELINE_ANALYZERS } from './config';

const ActiveMitigation = () => {
  const timelineAnalyzers = useAnalyzers(TIMELINE_ANALYZERS);
  return (
    <>
      <HideExplanationsToggle id="hide-explanations-active-defensives" />
      <SubSection>
        <Explanation>
          <p>
            Shield of the Righteous increases your armour by a significant amount and it's important
            to have it active while taking physical damage.
          </p>
          <p>
            Consecration, through your mastery, reduces the damage you take and it's beneficial to
            have it active while taking any type of damage.
          </p>
        </Explanation>
      </SubSection>
      <ShieldOfTheRighteousSection />
      <SubSection title="Consecration">
        <Timeline analyzers={timelineAnalyzers} />
      </SubSection>
    </>
  );
};

export default ActiveMitigation;
