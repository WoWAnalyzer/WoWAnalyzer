
import AlertWarning from 'interface/AlertWarning';

const ClassicLogWarning = () => (
  <div className="container">
    <AlertWarning style={{ marginBottom: 30 }}>
      <h2>
        <>
          Classic WoW encounters detected
        </>
      </h2>
      <>
        The current report contains encounters from World of Warcraft: Classic. Currently
        WoWAnalyzer does not support, and does not have plans to support, Classic WoW logs.
      </>
    </AlertWarning>
  </div>
);

export default ClassicLogWarning;
