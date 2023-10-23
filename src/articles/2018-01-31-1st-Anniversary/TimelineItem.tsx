import { ReactNode } from 'react';

interface TimelineItemProps {
  title: ReactNode;
  date: string;
  children: ReactNode;
}
const TimelineItem = ({ title, date, children }: TimelineItemProps) => (
  <div className="panel">
    <div className="date">{date}</div>
    <div className="panel-heading">
      <h2>{title}</h2>
    </div>
    <div className="panel-body">{children}</div>
  </div>
);

export default TimelineItem;
