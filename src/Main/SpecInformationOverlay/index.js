import React from 'react';
import PropTypes from 'prop-types';

import { getCompletenessColor, getCompletenessExplanation, getCompletenessLabel } from 'common/SPEC_ANALYSIS_COMPLETENESS';

import './style.css';

class SpecInformationOverlay extends React.PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    onCloseClick: PropTypes.func.isRequired,
  };

  componentDidMount() {
    document.body.classList.add('spec-information-overlay-active');
  }
  componentWillUnmount() {
    document.body.classList.remove('spec-information-overlay-active');
  }

  render() {
    const { config, onCloseClick } = this.props;

    return (
      <div id="spec-description-overlay">
        <main className="container">
          <div className="close" onClick={onCloseClick}>✕</div>
          <div className="row">
            <div className="spec-name col-xs-12">
              {config.spec.specName} {config.spec.className} analyzer
            </div>
          </div>
          <div className="row">
            <div className="maintainer-name col-xs-12 col-sm-8 col-sm-offset-2">
              by {config.maintainerAvatar && <img src={config.maintainerAvatar} alt="Avatar" />} {config.maintainer}
            </div>
          </div>

          <div className="row">
            <div className="description col-xs-12 col-md-6 col-md-offset-3">
              {config.description}
            </div>
          </div>

          <div className="row">
            <div className="actions col-xs-12 col-md-6 col-md-offset-3">
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
        </main>
      </div>
    );
  }
}

export default SpecInformationOverlay;
