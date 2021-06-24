import isLatestPatch from 'game/isLatestPatch';
import { ignoreSpecNotSupportedWarning } from 'interface/actions/specNotSupported';
import { RootState } from 'interface/reducers';
import SupportCheckerSpecOutOfDate from 'interface/report/SupportCheckerSpecOutOfDate';
import SupportCheckerSpecPartialSupport from 'interface/report/SupportCheckerSpecPartialSupport';
import { getSpecsIgnoredNotSupportedWarning } from 'interface/selectors/skipSpecNotSupported';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { useConfig } from './ConfigContext';

interface Props {
  children: ReactElement<any, any> | null;
  report: Report;
  fight: WCLFight;
  player: PlayerInfo;
  ignoreSpecNotSupportedWarning: (specId: number) => void;
  ignored: number[];
}

const SupportChecker = (props: Props) => {
  const { children, report, fight, player, ignored, ignoreSpecNotSupportedWarning } = props;
  const config = useConfig();

  const handleClickContinue = () => {
    // I chose on purpose not to store this in a cookie since I don't want this to be forgotten. It should not be a big deal if this happens every time the page is loaded, so long as it isn't shown every fight.
    ignoreSpecNotSupportedWarning(config.spec.id);
  };

  const isIgnored = ignored.includes(config.spec.id);

  if (!isIgnored && (!config.patchCompatibility || !isLatestPatch(config.patchCompatibility))) {
    return (
      <SupportCheckerSpecOutOfDate
        report={report}
        fight={fight}
        player={player}
        config={config}
        onContinueAnyway={handleClickContinue}
      />
    );
  }
  if (!isIgnored && config.isPartial) {
    return (
      <SupportCheckerSpecPartialSupport
        report={report}
        fight={fight}
        player={player}
        config={config}
        onContinueAnyway={handleClickContinue}
      />
    );
  }

  return children;
};

const mapStateToProps = (state: RootState) => ({
  ignored: getSpecsIgnoredNotSupportedWarning(state),
});
export default connect(mapStateToProps, {
  ignoreSpecNotSupportedWarning,
})(SupportChecker);
