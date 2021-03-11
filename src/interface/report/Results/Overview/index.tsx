import { Issue } from 'parser/core/ParseResults';
import React from 'react';

import Checklist from './Checklist';
import Suggestions from './Suggestions';

interface Props {
  checklist?: React.ReactNode;
  issues: Issue[];
}

const Overview = (props: Props) => {
  const { checklist, issues } = props;
  return (
    <div className="container">
      <Checklist>{checklist}</Checklist>

      <Suggestions style={{ marginBottom: 0 }}>{issues}</Suggestions>
    </div>
  );
};

export default Overview;
