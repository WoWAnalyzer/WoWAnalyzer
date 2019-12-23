import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Contributor from 'interface/ContributorButton';
import makeNewsUrl from 'interface/news/makeUrl';
import Panel from 'interface/others/Panel';

const RegularArticle = props => {
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

RegularArticle.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  bodyStyle: PropTypes.object,
  publishedAt: PropTypes.string.isRequired,
  publishedBy: PropTypes.shape({
    nickname: PropTypes.string.isRequired,
  }).isRequired,
};

export default RegularArticle;
