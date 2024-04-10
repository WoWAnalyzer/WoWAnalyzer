import isLatestPatch from 'game/isLatestPatch';
import SupportCheckerSpecOutOfDate from 'interface/report/SupportCheckerSpecOutOfDate';
import SupportCheckerSpecPartialSupport from 'interface/report/SupportCheckerSpecPartialSupport';
import { getSpecsIgnoredNotSupportedWarning } from 'interface/selectors/skipSpecNotSupported';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { usePlayer } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import { useFight } from 'interface/report/context/FightContext';
import { useWaSelector } from 'interface/utils/useWaSelector';

import { useConfig } from './ConfigContext';
import { ignoreSpecNotSupportedWarning } from 'interface/reducers/specsIgnoredNotSupportedWarning';

interface Props {
  children: ReactElement<any, any> | null;
}

const SupportChecker = ({ children }: Props) => {
  const config = useConfig();
  const { player } = usePlayer();
  const { report } = useReport();
  const { fight } = useFight();
  const ignored = useWaSelector((state) => getSpecsIgnoredNotSupportedWarning(state));
  const dispatch = useDispatch();

  const handleClickContinue = () => {
    // I chose on purpose not to store this in a cookie since I don't want this to be forgotten. It should not be a big deal if this happens every time the page is loaded, so long as it isn't shown every fight.
    dispatch(ignoreSpecNotSupportedWarning(config.spec.id));
  };

  const isIgnored =
    // Avoid the support-warning modal while developing to ease testing.
    import.meta.env.DEV || ignored.includes(config.spec.id);

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

export default SupportChecker;
