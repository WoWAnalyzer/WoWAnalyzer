import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Contributor from 'interface/contributor/Button';
import makeNewsUrl from 'interface/news/makeUrl';
import Panel from 'interface/others/Panel';

class RegularArticle extends React.PureComponent {
  static propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    bodyStyle: PropTypes.object,
    publishedAt: PropTypes.string.isRequired,
    publishedBy: PropTypes.shape({
      nickname: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const { title, children, bodyStyle, publishedAt, publishedBy } = this.props;

    return (
      <article>
        <Panel
          title={<Link to={makeNewsUrl(title)} className="hidden-link">{title}</Link>}
          bodyStyle={bodyStyle}
        >
          {children}

          <div style={{ marginTop: '1em' }}>
            Published at {publishedAt} by <Contributor {...publishedBy} />.
          </div>
        </Panel>
      </article>
    );
  }
}

export default RegularArticle;
