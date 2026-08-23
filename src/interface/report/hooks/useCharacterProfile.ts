import CharacterProfile from 'parser/core/CharacterProfile';
import { PlayerDetails } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';
import { useAnalysisDataSource } from 'report-data/AnalysisDataSourceContext';

const useCharacterProfile = ({ report, player }: { report: Report; player: PlayerDetails }) => {
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dataSource = useAnalysisDataSource();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      if (!dataSource.loadCharacterProfile) {
        setCharacterProfile(null);
        setIsLoading(false);
        return;
      }
      try {
        setCharacterProfile(await dataSource.loadCharacterProfile(report, player));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [report, player, dataSource]);

  return { characterProfile, isLoading };
};

export default useCharacterProfile;
