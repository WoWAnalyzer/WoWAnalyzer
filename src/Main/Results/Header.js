import React from 'react';
import PropTypes from 'prop-types';
import Textfit from 'react-textfit';
import Wrapper from 'common/Wrapper';
import SPEC_ANALYSIS_COMPLETENESS, { getCompletenessColor, getCompletenessExplanation } from 'common/SPEC_ANALYSIS_COMPLETENESS';
import getBossName from 'common/getBossName';
import Maintainer from 'Main/Maintainer';

import SkullRaidMarker from './Images/skull-raidmarker.png';

class Headers extends React.PureComponent {
  static propTypes = {
    config: PropTypes.shape({
      spec: PropTypes.shape({
        className: PropTypes.string.isRequired,
        specName: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    playerName: PropTypes.string.isRequired,
    boss: PropTypes.shape({
      headshot: PropTypes.string.isRequired,
    }),
    fight: PropTypes.object.isRequired,
  };

  render() {
    const { config: { spec, maintainers, completeness, compatibility }, playerName, boss, fight } = this.props;

    return (
      <header>
        <div className={`player ${spec.className.replace(' ', '')}`}>
          <img src={`/specs/${spec.className.replace(' ', '')}-${spec.specName.replace(' ', '')}.jpg`} alt="Player avatar" />{' '}
          <Textfit mode="single" max={80}>
            {playerName}
          </Textfit>
        </div>
        <div className="versus">versus</div>
        <div className="boss">
          <img src={boss ? boss.headshot : SkullRaidMarker} alt="Boss avatar" />
          <Textfit mode="single" max={80}>
            {getBossName(fight)}
          </Textfit>
        </div>

        <div className="about maintainers">
          {completeness && completeness === SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED ? '' : <Wrapper>{spec.specName} {spec.className} analysis is maintained by {maintainers.map(maintainer => <Maintainer key={maintainer.nickname} {...maintainer} />)}</Wrapper>}
          {completeness === SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK ? <Wrapper> and is considered <dfn className="completeness" data-tip={getCompletenessExplanation(completeness)} style={{ color: getCompletenessColor(completeness) }}>incomplete</dfn></Wrapper> : '' }
          {completeness === SPEC_ANALYSIS_COMPLETENESS.GOOD ? <Wrapper> and is considered <dfn className="completeness" data-tip={getCompletenessExplanation(completeness)} style={{ color: getCompletenessColor(completeness) }}>accurate</dfn></Wrapper> : ''}
          {completeness === SPEC_ANALYSIS_COMPLETENESS.GREAT ? <Wrapper> and is considered <dfn className="completeness" data-tip={getCompletenessExplanation(completeness)} style={{ color: getCompletenessColor(completeness) }}>complete</dfn></Wrapper> : ''}

          {!compatibility && completeness !== SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED ? '.' : ''}
          {compatibility && completeness === SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED ? ` Last Updated for Patch ${compatibility}.` : ''}
          {compatibility && (completeness === SPEC_ANALYSIS_COMPLETENESS.GOOD || completeness === SPEC_ANALYSIS_COMPLETENESS.GREAT) ? ` and updated for Patch ${compatibility}.` : ''}
        </div>
      </header>
    );
  }
}

export default Headers;
