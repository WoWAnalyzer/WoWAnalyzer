import { SubSection } from '../index';
import FoundationDowntimeSectionV2 from './FoundationDowntimeSectionV2';

export function FoundationDowntimeSection(): JSX.Element | null {
  return (
    <SubSection title="Always Be Casting">
      <FoundationDowntimeSectionV2 />
    </SubSection>
  );
}
