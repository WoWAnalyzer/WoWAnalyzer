import React from 'react';
import PropTypes from 'prop-types';
import Textfit from 'react-textfit';

import GitHubMarkIcon from 'Icons/GitHubMark';
import TwitterIcon from 'Icons/Twitter';

import { getCompletenessColor, getCompletenessExplanation, getCompletenessLabel } from 'common/SPEC_ANALYSIS_COMPLETENESS';
import Maintainer from 'Main/Maintainer';

class AboutTab extends React.Component {
  static propTypes = {
    config: PropTypes.shape({

    }),
  };

  render() {
    const { config } = this.props;

    return (
      <div style={{ padding: '10px 22px' }}>
        <h1 style={{ fontWeight: 'bold' }}>
          <Textfit mode="single">
            The {config.spec.specName} {config.spec.className} analyzer
          </Textfit>
          {config.compatibility && (
            <h3 align="left" style={{ fontWeight: 'bold', marginLeft: 20 }}>
              Updated for Patch {config.compatibility}
            </h3>
          )}
        </h1>

        <div className="row">
          <div className="col-xs-12" style={{ fontSize: 15, textAlign: 'justify' }}>
            {config.description}
          </div>
        </div>

        <h1>Maintainers</h1>
        {config.maintainers.map(maintainer => (
          <div
            style={{
              background: 'rgba(20, 20, 20, 0.4)',
              borderRadius: 5,
              padding: '10px 15px',
              border: '1px solid #000',
              display: 'inline-block',
              minWidth: 300,
              textAlign: 'center',
            }}
          >
            <Maintainer key={maintainer.nickname} {...maintainer} style={{ fontSize: '2em' }} />
            <div className="flex wrapable" style={{ fontSize: '2em' }}>
              {maintainer.github && (
                <div className="flex-main">
                  <a href={`https://github.com/${maintainer.github}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
                    <GitHubMarkIcon />
                  </a>
                </div>
              )}
              {' '}
              {maintainer.twitter && (
                <div className="flex-main">
                  <a href={`https://twitter.com/${maintainer.twitter}`} target="_blank" rel="noopener noreferrer">
                    <TwitterIcon />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="row">
          <div className="col-xs-12">
            <div className="row">
              <div className="col-sm-4">
                <h1>Completeness</h1>
                <main>
                  <dfn data-tip={getCompletenessExplanation(config.completeness)} style={{ color: getCompletenessColor(config.completeness) }}>{getCompletenessLabel(config.completeness)}</dfn>
                </main>
              </div>
              <div className="col-sm-4">
                <h1>Spec discussion</h1>
                <main>
                  {config.specDiscussionUrl ? (
                    <a href={config.specDiscussionUrl}>
                      GitHub issue
                    </a>
                  ) : 'Unavailable'}
                </main>
              </div>
              <div className="col-sm-4">
                <h1>Source code</h1>
                <main>
                  <a href={`https://github.com/WoWAnalyzer/WoWAnalyzer/tree/master/${config.path}`}>
                    &lt;SpecSource /&gt;
                  </a>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AboutTab;
