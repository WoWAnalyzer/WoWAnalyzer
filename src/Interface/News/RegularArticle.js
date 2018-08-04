import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Contributor from 'Interface/Contributor/Button';
import makeNewsUrl from 'Interface/News/makeUrl';

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
        <div className="panel">
          <div className="panel-heading">
            <Link to={makeNewsUrl(title)} className="hidden-link"><h2>{title}</h2></Link>
          </div>
          <div className="panel-body" style={bodyStyle}>
            {children}

            <div style={{ marginTop: '1em' }}>
              Published at {publishedAt} by <Contributor {...publishedBy} />.
            </div>
          </div>
        </div>
      </article>
    );
  }
}

export default RegularArticle;
