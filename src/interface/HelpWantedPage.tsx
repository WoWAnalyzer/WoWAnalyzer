import DocumentTitle from 'interface/DocumentTitle';
import Panel from 'interface/Panel';
import { Link } from 'react-router-dom';
import { usePageView } from './useGoogleAnalytics';

const HelpWanted = () => {
  usePageView('HelpWantedPage');
  return (
    <>
      <DocumentTitle title="Help wanted" />

      <Panel
        title={<>Help wanted</>}
        bodyStyle={{
          textAlign: 'justify',
          padding: 0,
          overflow: 'hidden',
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
        }}
      >
        <div style={{ padding: '15px 20px', marginBottom: 5 }}>
          <>
            WoWAnalyzer is completely open source and relies on mostly volunteer contributors to
            implement spec-specific analysis. You don't need to to do anything special to
            contribute. See the{' '}
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer#contributing">
              contributing guidelines
            </a>{' '}
            if you want to give it a try.
            <br />
            <br />
            If you're unable to help out with improving our analysis, please consider signing up for{' '}
            <Link to="/premium">Premium</Link> instead.
          </>
        </div>

        <img
          src="https://media.giphy.com/media/l1J3vV5lCmv8qx16M/giphy.gif"
          style={{ width: '100%' }}
          alt="Sharing is caring"
        />
      </Panel>
    </>
  );
};

export default HelpWanted;
