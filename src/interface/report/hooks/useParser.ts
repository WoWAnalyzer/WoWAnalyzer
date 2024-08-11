import retryingPromise from 'common/retryingPromise';
import Config from 'parser/Config';
import CombatLogParser from 'parser/core/CombatLogParser';
import { useEffect, useState } from 'react';

const useParser = (config: Config) => {
  const [parserClass, setParserClass] = useState<typeof CombatLogParser>();

  useEffect(() => {
    const load = async (parser: () => Promise<typeof CombatLogParser>) => {
      const parserClass = await retryingPromise(parser);
      // A state setting can also be a function, since parserClass is considered
      // a function during runtime as well, we need to always set the value with
      // the function method to avoid the setter from trying to execute the
      // parser.
      setParserClass(() => parserClass);
    };

    setParserClass(undefined);
    if (config.parser) {
      // noinspection JSIgnoredPromiseFromCall
      load(config.parser);
    }
  }, [config]);

  return config.parser ? parserClass : undefined;
};

export default useParser;
