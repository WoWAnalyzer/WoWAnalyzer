import DropdownIcon from 'interface/icons/Dropdown';
import React from 'react';
import './Guide.scss';

/**
 * The header for a `<Section />`. Exported as a convenient way for others to
 * use the same structure. If you're building a section of your guide, you
 * probably want `Section` instead.
 */
// eslint-disable-next-line react/prop-types
const SectionHeader = ({ children, className, ...props }: React.ComponentProps<'header'>) => (
  <header className={`flex ${className ?? ''}`} {...props}>
    <div className="flex-main name">{children}</div>
    <div className="flex-sub chevron">
      <DropdownIcon />
    </div>
  </header>
);

export default SectionHeader;
