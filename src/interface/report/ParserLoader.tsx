import Config from 'parser/Config';
import CombatLogParser from 'parser/core/CombatLogParser';
import { ReactNode } from 'react';

import useParser from '../useParser';

interface Props {
  children: (isLoading: boolean, parser: typeof CombatLogParser | undefined) => ReactNode;
  config: Config;
}

// TODO: Refactor Report to a functional component so this component can be
//  removed in favor of using the hook
const ParserLoader = ({ children, config }: Props) => {
  const parserClass = useParser(config);

  return children(!parserClass, parserClass);
};

export default ParserLoader;
