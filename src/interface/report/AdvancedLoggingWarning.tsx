import AlertWarning from 'interface/AlertWarning';

const AdvancedLoggingWarning = () => (
  <div className="container">
    <AlertWarning style={{ marginBottom: 30 }}>
      <h2>
        <>Advanced Combat Logging not Enabled</>
      </h2>
      <>
        Without Advanced Combat Logging, we are unable to get critical information about players
        including specs, talents, and gear. Without this information we are unable to provide
        analysis for this encounter. Please ensure that Advanced Combat Logging is enabled in game
        (Can be found in the game settings under System/Network).
      </>
    </AlertWarning>
  </div>
);

export default AdvancedLoggingWarning;
