import React from 'react';
import PropTypes from 'prop-types';
import { Trans, Plural } from '@lingui/macro';
import { Link } from 'react-router-dom';

import isLatestPatch from 'game/isLatestPatch';
import ReadableList from 'interface/common/ReadableList';
import Warning from 'interface/common/Alert/Warning';
import Contributor from 'interface/contributor/Button';
import Panel from 'interface/others/Panel';

class About extends React.PureComponent {
  static propTypes = {
    config: PropTypes.shape({
      spec: PropTypes.shape({
        specName: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
      }).isRequired,
      description: PropTypes.node.isRequired,
      contributors: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.string.isRequired,
      })).isRequired,
      patchCompatibility: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const { spec, description, contributors, patchCompatibility } = this.props.config;

    const contributorinfo = (contributors.length !== 0) ? contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />) : <Trans>CURRENTLY UNMAINTAINED</Trans>;

    return (
      <Panel
        title={<Trans>About {spec.specName} {spec.className}</Trans>}
        actions={(
          <Link to="events">View all events</Link>
        )}
      >
        {description}

        <div className="row" style={{ marginTop: '1em' }}>
          <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
            <Plural
              value={contributors.length}
              one="Contributor"
              other="Contributors"
            />
          </div>
          <div className="col-lg-8">
            <ReadableList>
              {contributorinfo}
            </ReadableList>
          </div>
        </div>
        <div className="row" style={{ marginTop: '0.5em' }}>
          <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
            <Trans>Updated for patch</Trans>
          </div>
          <div className="col-lg-8">
            {patchCompatibility}
          </div>
        </div>
        {!isLatestPatch(patchCompatibility) && (
          <Warning style={{ marginTop: '1em' }}>
            <Trans>The analysis for this spec is outdated. It may be inaccurate for spells that were changed since patch {patchCompatibility}.</Trans>
          </Warning>
        )}
      </Panel>
    );
  }
}

export default About;
