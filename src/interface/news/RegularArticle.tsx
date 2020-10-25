import React, { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Contributor from 'interface/ContributorButton';
import makeNewsUrl from 'interface/news/makeUrl';
import Panel from 'interface/others/Panel';
import { ContributorType } from 'interface/ContributorButton/ContributorButton';

interface Props {
  title: ReactNode;
  bodyStyle?: CSSProperties;
  children: ReactNode,
  publishedAt: string,
  publishedBy: ContributorType
}

const RegularArticle = (props: Props) => {
  const { title, children, bodyStyle, publishedAt, publishedBy } = props;

  return (
    <article>
      <Panel
        title={<Link to={makeNewsUrl(title)} className="hidden-link">{title}</Link>}
        bodyStyle={bodyStyle}
      >
        {children}

        <small style={{ display: 'block', marginTop: '1em' }}>
          Published at {publishedAt} by <Contributor {...publishedBy} />.
        </small>
      </Panel>
    </article>
  );
};

export default RegularArticle;
