import Panel from 'interface/Panel';
import Report from 'parser/core/Report';

import './FightSelection.scss';
import FightSelectionPanelList from './FightSelectionPanelList';

interface Props {
  report: Report;
  killsOnly: boolean;
}

const FightSelectionPanel = (props: Props) => {
  const { report, killsOnly } = props;

  return (
    <>
      <Panel pad={false}>
        <FightSelectionPanelList report={report} fights={report.fights} killsOnly={killsOnly} />
      </Panel>
    </>
  );
};

export default FightSelectionPanel;
