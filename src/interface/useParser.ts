import { useEffect, useState } from 'react';

import CombatLogParser from 'parser/core/CombatLogParser';
import Config from 'parser/Config';
import retryingPromise from '../common/retryingPromise';

const useParser = (config: Config) => {
  const [parserClass, setParserClass] = useState<typeof CombatLogParser>();
  const load = async (parser: () => Promise<typeof CombatLogParser>) => {
    const parserClass = await retryingPromise(parser);
    setParserClass(() => parserClass);
  };

  useEffect(() => {
    setParserClass(undefined);
    load(config.parser);
  }, [config]);

  return parserClass;
};

export default useParser;
