import React from 'react';

interface ReadableListingProps {
  children: React.ReactNode[];
  groupType?: 'and' | 'or';
}

const ReadableListing = ({
  children,
  groupType = 'and',
}: ReadableListingProps) => {
  const numItems = children.length;
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
