import { useEffect, useState } from 'react';

import CombatLogParser from 'parser/core/CombatLogParser';
import Config from 'parser/Config';

const useParser = (config: Config) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [parserClass, setParserClass] = useState<typeof CombatLogParser>();
  const load = async (parser: () => Promise<typeof CombatLogParser>) => {
    const parserClass = await parser();
    setLoading(false);
    setParserClass(parserClass);
  };

  useEffect(() => {
    setLoading(true);
    setParserClass(undefined);
    load(config.parser);
  }, [config]);

  return { isLoading, parserClass };
};

export default useParser;
