import Panel from 'interface/Panel';
import { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Contributor, { ContributorType } from './ContributorButton';
import makeNewsUrl from './makeNewsUrl';

interface Props {
  title: string;
  bodyStyle?: CSSProperties;
  children: ReactNode;
  publishedAt: string;
  publishedBy: ContributorType;
}

const NewsRegularArticle = (props: Props) => {
  const { title, children, bodyStyle, publishedAt, publishedBy } = props;

  return (
    <article>
      <Panel
        title={
          <Link to={makeNewsUrl(title)} className="hidden-link">
            {title}
          </Link>
        }
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

export default NewsRegularArticle;
