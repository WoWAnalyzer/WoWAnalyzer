import { Fragment, ReactNode } from 'react';
import * as React from 'react';

interface SeparatorProps {
  idx: number;
  size: number;
  groupType?: 'and' | 'or';
}
const Separator = ({ idx, groupType, size }: SeparatorProps) => {
  if (idx === 0) {
    return null;
  }
  if (idx === size - 1) {
    return <> {groupType} </>;
  }
  return <>, </>;
};

interface Props {
  children: ReactNode | ReactNode[];
  groupType?: 'and' | 'or';
}

const ReadableListing = ({ children, groupType = 'and' }: Props) => {
  if (!Array.isArray(children)) {
    return <>{children}</>;
  }

  return (
    <>
      {children.map((child, idx, arr) => (
        <Fragment key={`readable-listing-item-${idx}`}>
          <Separator idx={idx} groupType={groupType} size={arr.length} /> {child}
        </Fragment>
      ))}
    </>
  );
};

export default ReadableListing;
