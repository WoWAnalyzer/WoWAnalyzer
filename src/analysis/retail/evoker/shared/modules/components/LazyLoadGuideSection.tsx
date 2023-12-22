import { useState } from 'react';
import './Styling.scss';

interface Props {
  loader: () => Promise<void>;
  value: () => JSX.Element | undefined;
  element?: JSX.Element;
}
/**
 * @loader function to run on button press
 * @value function to return JSX element to be rendered
 * @className optional class name for button
 */
function LazyLoadGuideSection({ loader, value, element }: Props) {
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
        <>
          <button onClick={handleButtonClick} disabled={loading} className="button">
            {loading ? 'Loading...' : 'Click to load'}
          </button>

          <div className="flex" style={{ marginTop: '10px' }}>
            {element}
          </div>
        </>
      )}
      {loading ? <p>Loading data...</p> : content}
    </>
  );
}

export default LazyLoadGuideSection;
