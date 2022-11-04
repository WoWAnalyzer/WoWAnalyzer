import isLatestPatch from 'game/isLatestPatch';
import { ignoreSpecNotSupportedWarning } from 'interface/actions/specNotSupported';
import { RootState } from 'interface/reducers';
import SupportCheckerSpecOutOfDate from 'interface/report/SupportCheckerSpecOutOfDate';
import SupportCheckerSpecPartialSupport from 'interface/report/SupportCheckerSpecPartialSupport';
import { getSpecsIgnoredNotSupportedWarning } from 'interface/selectors/skipSpecNotSupported';
import { ReactElement } from 'react';
import { connect } from 'react-redux';
import { usePlayer } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import { useFight } from 'interface/report/context/FightContext';

import { useConfig } from './ConfigContext';

interface Props {
  children: ReactElement<any, any> | null;
  ignoreSpecNotSupportedWarning: (specId: number) => void;
  ignored: number[];
}

const SupportChecker = ({ children, ignored, ignoreSpecNotSupportedWarning }: Props) => {
  const config = useConfig();
  const { player } = usePlayer();
  const { report } = useReport();
  const { fight } = useFight();

  const handleClickContinue = () => {
    // I chose on purpose not to store this in a cookie since I don't want this to be forgotten. It should not be a big deal if this happens every time the page is loaded, so long as it isn't shown every fight.
    ignoreSpecNotSupportedWarning(config.spec.id);
  };

  const isIgnored = ignored.includes(config.spec.id);

  return (
    <>
      {!isIgnored && !isLatestPatch(config) ? (
        <SupportCheckerSpecOutOfDate
          report={report}
          fight={fight}
          player={player}
          config={config}
          onContinueAnyway={handleClickContinue}
        />
      ) : !isIgnored && config.isPartial ? (
        <SupportCheckerSpecPartialSupport
          report={report}
          fight={fight}
          player={player}
          config={config}
          onContinueAnyway={handleClickContinue}
        />
      ) : null}

      {children}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  ignored: getSpecsIgnoredNotSupportedWarning(state),
});
export default connect(mapStateToProps, {
  ignoreSpecNotSupportedWarning,
})(SupportChecker);
