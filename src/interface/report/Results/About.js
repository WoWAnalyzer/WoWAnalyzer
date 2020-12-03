import React from 'react';
import PropTypes from 'prop-types';
import { Trans, Plural } from '@lingui/macro';
import { Link } from 'react-router-dom';

import isLatestPatch from 'game/isLatestPatch';
import ReadableListing from 'interface/ReadableListing';
import Warning from 'interface/Alert/Warning';
import Contributor from 'interface/ContributorButton';
import Panel from 'interface/others/Panel';

const About = (
  {
    config,
  },
) => {
  const { spec, description, contributors, patchCompatibility } = config;

  const contributorinfo = (contributors.length !== 0) ? contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />) : <Trans id="interface.report.results.about.unmaintained">CURRENTLY UNMAINTAINED</Trans>;

  return (
    <Panel
      title={<Trans id="interface.report.results.about.aboutSpecnameClassname">About {spec.specName} {spec.className}</Trans>}
      actions={(
        <Link to="events"><Trans id="interface.report.results.about.viewEvents">View all events</Trans></Link>
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
          <ReadableListing>
            {contributorinfo}
          </ReadableListing>
        </div>
      </div>
      <div className="row" style={{ marginTop: '0.5em' }}>
        <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
          <Trans id="interface.report.results.about.updatedForPatch">Updated for patch</Trans>
        </div>
        <div className="col-lg-8">
          {patchCompatibility}
        </div>
      </div>
      {!isLatestPatch(patchCompatibility) && (
        <Warning style={{ marginTop: '1em' }}>
          <Trans id="interface.report.results.about.outdated">The analysis for this spec is outdated. It may be inaccurate for spells that were changed since patch {patchCompatibility}.</Trans>
        </Warning>
      )}
    </Panel>
  );
};

About.propTypes = {
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

export default About;
