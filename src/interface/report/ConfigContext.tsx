import Config from 'parser/Config';
import { createContext, useContext, ReactNode } from 'react';
import { usePlayer } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import getConfig from 'parser/getConfig';
import { wclGameVersionToExpansion } from 'game/VERSIONS';

const ConfigContext = createContext<Config | undefined>(undefined);

export default ConfigContext;

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (ctx === undefined) {
    throw new Error('Unable to get Config for selected report/player combination');
  }
  return ctx;
};

interface ConfigProviderProps {
  children: ReactNode;
  config: Config | undefined;
}
export const ConfigProvider = ({ children, config }: ConfigProviderProps) => (
  <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
);

interface ReportPlayerConfigProviderProps {
  children: ReactNode;
}
export const ReportPlayerConfigProvider = ({ children }: ReportPlayerConfigProviderProps) => {
  const { combatant, player } = usePlayer();
  const { report } = useReport();
  return (
    <ConfigProvider
      config={getConfig(
        wclGameVersionToExpansion(report.gameVersion),
        combatant.specID,
        player,
        combatant,
      )}
    >
      {children}
    </ConfigProvider>
  );
};
