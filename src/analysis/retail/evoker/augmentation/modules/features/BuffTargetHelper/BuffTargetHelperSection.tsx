import { useState } from 'react';
import './BuffTargetHelper.scss';

interface Props {
  loader: () => Promise<void>;
  value: () => JSX.Element | undefined;
}

function BuffTargetHelperSection({ loader, value }: Props) {
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<JSX.Element | undefined>(undefined);

  const handleButtonClick = async () => {
    setLoading(true);
    await loader();
    setLoading(false);
    setHtmlContent(value);
  };

  return (
    <>
      {!htmlContent && !loading && (
        <button onClick={handleButtonClick} disabled={loading} className="copyButton">
          {loading ? 'Loading...' : 'Load Data'}
        </button>
      )}
      {loading ? <p>Loading data...</p> : htmlContent}
    </>
  );
}

export default BuffTargetHelperSection;
