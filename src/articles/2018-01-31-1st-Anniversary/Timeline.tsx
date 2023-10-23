import { ReactNode } from 'react';

import './Timeline.css';

interface TimelineProps {
  children: ReactNode;
}
const Timeline = ({ children }: TimelineProps) => (
  <div className="timeline year-recap">{children}</div>
);

export default Timeline;
