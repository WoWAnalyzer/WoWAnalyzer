import Config from 'parser/Config';
import { createContext, useContext } from 'react';

const ConfigContext = createContext<Config | undefined>(undefined);

export default ConfigContext;

export const useConfig = () => useContext(ConfigContext)!;
