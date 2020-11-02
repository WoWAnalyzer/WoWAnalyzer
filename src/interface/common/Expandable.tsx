import React, {useState} from 'react';
import AnimateHeight from 'react-animate-height';

import './Expandable.scss';

interface Props {
  header: React.ReactNode;
  children: React.ReactNode;
  element: React.ElementType;
  className?: string;
  expanded?: boolean;
  setExpanded:  React.Dispatch<React.SetStateAction<boolean>>;
}

export const Expandable = (props: Omit<Props, 'expanded'|'setExpanded'>) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const handleToggle = () => {
    setExpanded((prevExpanded: boolean) => !prevExpanded)
  }

  const { header, children, element: Element, className } = props;
  
  return (
    <Element className={`expandable ${expanded ? 'expanded' : ''} ${className || ''}`}>
      <div className="meta" onClick={handleToggle}>
        {header}
      </div>
      <AnimateHeight className="details" height={expanded ? 'auto' : 0}>
        {children}
      </AnimateHeight>
    </Element>
  );
}

export const ControlledExpandable = (props: Props) =>  {
  const handleToggle = () => {
    props.setExpanded((prevExpanded: boolean) => !prevExpanded)
  }

  const { header, children, element: Element, className } = props;

  return (
    <Element className={`expandable ${props.expanded ? 'expanded' : ''} ${className || ''}`}>
      <div className="meta" onClick={handleToggle}>
        {header}
      </div>
      <AnimateHeight className="details" height={props.expanded ? 'auto' : 0}>
        {children}
      </AnimateHeight>
    </Element>
  );
}