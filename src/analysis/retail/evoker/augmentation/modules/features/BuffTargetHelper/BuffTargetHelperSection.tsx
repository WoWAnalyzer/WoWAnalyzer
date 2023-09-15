import { useState } from 'react';
import './BuffTargetHelper.scss';
import { SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

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
    <SubSection title="Buff Helper">
      <p>
        This is a tool to help you find the optimal buff targets for Ebon Might. It will show you
        the top 4 pumpers for each 30 second interval (27 with{' '}
        <SpellLink spell={TALENTS.INTERWOVEN_THREADS_TALENT} />)
        <br />
        This module will also produce a MRT note for prescience timings.
      </p>
      {!htmlContent && !loading && (
        <button onClick={handleButtonClick} disabled={loading} className="copyButton">
          {loading ? 'Loading...' : 'Load Data'}
        </button>
      )}
      {loading ? <p>Loading data...</p> : htmlContent}
    </SubSection>
  );
}

export default BuffTargetHelperSection;
