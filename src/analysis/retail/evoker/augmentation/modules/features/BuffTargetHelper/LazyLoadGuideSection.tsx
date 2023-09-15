import { useState } from 'react';
import './BuffTargetHelper.scss';

interface Props {
  loader: () => Promise<void>;
  value: () => JSX.Element | undefined;
  className?: string;
}
/**
 * @loader function to run on button press
 * @value function to return JSX element to be rendered
 * @className optional class name for button
 */
function LazyLoadGuideSection({ loader, value, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<JSX.Element | undefined>(undefined);

  const handleButtonClick = async () => {
    setLoading(true);
    await loader();
    setLoading(false);
    setContent(value);
  };

  return (
    <>
      {!content && !loading && (
        <button onClick={handleButtonClick} disabled={loading} className={className}>
          {loading ? 'Loading...' : 'Click to load'}
        </button>
      )}
      {loading ? <p>Loading data...</p> : content}
    </>
  );
}

export default LazyLoadGuideSection;
