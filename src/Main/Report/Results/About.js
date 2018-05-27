import React from 'react';
import PropTypes from 'prop-types';

import ReadableList from 'common/ReadableList';
import parseVersionString from 'common/parseVersionString';
import Warning from 'common/Alert/Warning';
import Contributor from 'Main/Contributor';

class About extends React.PureComponent {
  static propTypes = {
    config: PropTypes.shape({
      spec: PropTypes.shape({
        specName: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
      }).isRequired,
      description: PropTypes.string.isRequired,
      contributors: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.string.isRequired,
      })).isRequired,
      patchCompatibility: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const { spec, description, contributors, patchCompatibility } = this.props.config;
    const specPatchCompatibility = parseVersionString(patchCompatibility);
    const latestPatch = parseVersionString(process.env.REACT_APP_CURRENT_GAME_PATCH);
    const isOutdated = specPatchCompatibility.major < latestPatch.major || specPatchCompatibility.minor < latestPatch.minor || specPatchCompatibility.patch < latestPatch.patch;

    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>About {spec.specName} {spec.className}</h2>
        </div>
        <div className="panel-body">
          {description}

          <div className="row" style={{ marginTop: '1em' }}>
            <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
              Contributor{contributors.length > 1 && 's'}
            </div>
            <div className="col-lg-8">
              <ReadableList>
                {contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />)}
              </ReadableList>
            </div>
          </div>
          <div className="row" style={{ marginTop: '0.5em' }}>
            <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
              Updated for patch
            </div>
            <div className="col-lg-8">
              {patchCompatibility}
            </div>
          </div>
          {isOutdated && (
            <Warning style={{ marginTop: '1em' }}>
              The analysis for this spec is outdated. It may be inaccurate for spells that were changed since patch {patchCompatibility}.
            </Warning>
          )}
        </div>
      </div>
    );
  }
}

export default About;
