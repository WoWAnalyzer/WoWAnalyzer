import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ignoreSpecNotSupportedWarning } from 'interface/actions/specNotSupported';
import { getSpecsIgnoredNotSupportedWarning } from 'interface/selectors/skipSpecNotSupported';
import SupportCheckerSpecPartialSupport from 'interface/report/SupportCheckerSpecPartialSupport';
import isLatestPatch from 'game/isLatestPatch';

import SupportCheckerSpecOutOfDate from './SupportCheckerSpecOutOfDate';

class SupportChecker extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    config: PropTypes.shape({
      patchCompatibility: PropTypes.string,
      isPartial: PropTypes.bool.isRequired,
      spec: PropTypes.shape({
        id: PropTypes.number.isRequired,
        className: PropTypes.string.isRequired,
        specName: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    report: PropTypes.object.isRequired,
    fight: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
    player: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    ignoreSpecNotSupportedWarning: PropTypes.func.isRequired,
    ignored: PropTypes.array.isRequired,
  };

  constructor() {
    super();
    this.handleClickContinue = this.handleClickContinue.bind(this);
  }

  handleClickContinue() {
    // I chose on purpose not to store this in a cookie since I don't want this to be forgotten. It should not be a big deal if this happens every time the page is loaded, so long as it isn't shown every fight.
    this.props.ignoreSpecNotSupportedWarning(this.props.config.spec.id);
  }

  get continue() {
    return this.props.ignored.includes(this.props.config.spec.id);
  }

  render() {
    const { children, config, report, fight, player } = this.props;

    if (
      !this.continue &&
      (!config.patchCompatibility || !isLatestPatch(config.patchCompatibility))
    ) {
      return (
        <SupportCheckerSpecOutOfDate
          report={report}
          fight={fight}
          player={player}
          config={config}
          onContinueAnyway={this.handleClickContinue}
        />
      );
    }
    if (!this.continue && config.isPartial) {
      return (
        <SupportCheckerSpecPartialSupport
          report={report}
          fight={fight}
          player={player}
          config={config}
          onContinueAnyway={this.handleClickContinue}
        />
      );
    }

    return children;
  }
}

const mapStateToProps = (state) => ({
  ignored: getSpecsIgnoredNotSupportedWarning(state),
});
export default connect(mapStateToProps, {
  ignoreSpecNotSupportedWarning,
})(SupportChecker);
