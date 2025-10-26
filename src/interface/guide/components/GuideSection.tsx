import { ReactNode, type JSX } from 'react';
import Spell from 'common/SPELLS/Spell';
import { SubSection } from 'interface/guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Explanation from 'interface/guide/components/Explanation';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

interface GuideSectionProps {
  spell: Spell;
  title?: string;
  explanation: ReactNode;
  children: ReactNode;
  verticalLayout?: boolean;
  explanationPercent?: number;
}

/**
 * Guide section with explanation and data panel in side-by-side or vertical layout.
 * @param spell - The spell this section is about
 * @param title - Custom title (default: uses spell name)
 * @param explanation - Explanation content
 * @param children - Data panel content
 * @param verticalLayout - Use vertical instead of side-by-side layout (default: false)
 * @param explanationPercent - Width percentage for explanation in side-by-side mode (default: 40)
 */
export default function GuideSection({
  spell,
  title,
  explanation,
  children,
  verticalLayout = false,
  explanationPercent = 40,
}: GuideSectionProps): JSX.Element {
  const sectionTitle = title || spell.name;

  // Wrap children in divs with spacing
  const childArray = Array.isArray(children) ? children : [children];
  const data = (
    <RoundedPanel>
      <div style={{ minWidth: 0, maxWidth: '100%' }}>
        {childArray.map((component, index) => (
          <div key={index}>{component}</div>
        ))}
      </div>
    </RoundedPanel>
  );

  // Vertical layout
  if (verticalLayout) {
    return (
      <SubSection title={sectionTitle}>
        <div style={{ marginBottom: '16px' }}>
          <Explanation>{explanation}</Explanation>
        </div>
        {data}
      </SubSection>
    );
  }

  // Side-by-side layout
  return explanationAndDataSubsection(
    explanation as JSX.Element,
    data,
    explanationPercent,
    sectionTitle,
  );
}
