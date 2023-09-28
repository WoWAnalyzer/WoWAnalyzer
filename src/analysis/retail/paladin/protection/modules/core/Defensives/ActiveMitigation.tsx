import { SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import { TIMELINE_ANALYZERS } from './config';

const ActiveMitigation = () => {
  const timelineAnalyzers = useAnalyzers(TIMELINE_ANALYZERS);
  return (
    <>
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <SubSection>
        <Explanation>
          <p>Paladin sotr good</p>
          <p>Conmsc is okay</p>
        </Explanation>
      </SubSection>
      <SubSection title="Timeline">
        <Timeline analyzers={timelineAnalyzers} />
      </SubSection>
    </>
  );
};

export default ActiveMitigation;
