import { ControlledExpandable } from 'interface/Expandable';
import React, { useState } from 'react';
import './Guide.scss';
import SectionHeader from './SectionHeader';

/**
 * An expandable guide section. Defaults to expanded.
 */
const Section = ({
  children,
  title,
  expanded = true,
}: React.PropsWithChildren<{ title: string; expanded?: boolean }>) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <ControlledExpandable
      header={<SectionHeader>{title}</SectionHeader>}
      element="section"
      inverseExpanded={() => setIsExpanded(!isExpanded)}
      expanded={isExpanded}
    >
      {children}
    </ControlledExpandable>
  );
};

export default Section;
