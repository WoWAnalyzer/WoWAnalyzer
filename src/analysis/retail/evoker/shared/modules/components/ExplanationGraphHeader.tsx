import './Styling.scss';
import { GraphDataType } from './types';

type Props = {
  graphData: GraphDataType[];
  currentWindowIndex: number;
  onChangeCurrentWindowIndex: (index: number) => void;
};

const ExplanationGraphHeader = ({
  graphData,
  currentWindowIndex,
  onChangeCurrentWindowIndex,
}: Props) => {
  const goToNextWindow = () => {
    onChangeCurrentWindowIndex((currentWindowIndex + 1) % graphData.length);
  };
  const goToPrevWindow = () => {
    onChangeCurrentWindowIndex((currentWindowIndex - 1 + graphData.length) % graphData.length);
  };

  return (
    <header>
      <span>
        {graphData[currentWindowIndex].title ? graphData[currentWindowIndex].title : 'Fight'}:{' '}
        {currentWindowIndex + 1} out of {graphData.length}
      </span>
      <div className="btn-group">
        <button onClick={goToPrevWindow} disabled={currentWindowIndex === 0}>
          <span className="icon-button glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
        </button>
        <button onClick={goToNextWindow} disabled={currentWindowIndex === graphData.length - 1}>
          <span className="icon-button glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
};

export default ExplanationGraphHeader;
