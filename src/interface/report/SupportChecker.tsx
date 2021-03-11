import isLatestPatch from 'game/isLatestPatch';
import { ignoreSpecNotSupportedWarning } from 'interface/actions/specNotSupported';
import { RootState } from 'interface/reducers';
import SupportCheckerSpecOutOfDate from 'interface/report/SupportCheckerSpecOutOfDate';
import SupportCheckerSpecPartialSupport from 'interface/report/SupportCheckerSpecPartialSupport';
import { getSpecsIgnoredNotSupportedWarning } from 'interface/selectors/skipSpecNotSupported';
import Config from 'parser/Config';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import React from 'react';
import { connect } from 'react-redux';

interface Props {
  children: React.ReactNode;
  config: Config;
  report: Report;
  fight: WCLFight;
  player: PlayerInfo;
  ignoreSpecNotSupportedWarning: (specId: number) => void;
  ignored: number[];
}

class SupportChecker extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
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

const mapStateToProps = (state: RootState) => ({
  ignored: getSpecsIgnoredNotSupportedWarning(state),
});
export default connect(mapStateToProps, {
  ignoreSpecNotSupportedWarning,
})(SupportChecker);
