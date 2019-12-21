import { useEffect, useState } from 'react';

import CombatLogParser from 'parser/core/CombatLogParser';
import Config from 'parser/Config';
import retryingPromise from '../common/retryingPromise';

const useParser = (config: Config) => {
  const [parserClass, setParserClass] = useState<typeof CombatLogParser>();
  const load = async (parser: () => Promise<typeof CombatLogParser>) => {
    const parserClass = await retryingPromise(parser);
    // A state setting can also be a function, since parserClass is considered
    // a function during runtime as well, we need to always set the value with
    // the function method to avoid the setter from trying to execute the
    // parser.
    setParserClass(() => parserClass);
  };

  useEffect(() => {
    setParserClass(undefined);
    load(config.parser);
  }, [config]);

  return parserClass;
};

export default useParser;
