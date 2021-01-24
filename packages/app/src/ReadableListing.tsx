import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode | ReactNode[];
  groupType?: 'and' | 'or';
}

const ReadableListing = ({ children, groupType = 'and' }: Props) => {
  const numItems = React.Children.count(children);
  const results: React.ReactNode[] = [];
  React.Children.forEach(children, (child, index) => {
    const isFirst = index === 0;
    if (!isFirst) {
      const isLast = index === numItems - 1;
      if (isLast) {
        results.push(` ${groupType} `);
      } else {
        results.push(', ');
      }
    }
    results.push(child);
  });
  return <>{results}</>;
};

export default ReadableListing;
