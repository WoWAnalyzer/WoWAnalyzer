import { makeCharacterApiUrl } from 'common/makeApiUrl';
import CharacterProfile from 'parser/core/CharacterProfile';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';

const CHINESE_REGION = 'cn';

export type CharacterProfileStatus = {
  characterProfile: CharacterProfile | null;
  isLoading?: boolean;
};

const useCharacterProfile = ({ report, player }: { report: Report; player: PlayerInfo }) => {
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const id = player.guid;
      // TODO: Since the player selection loads this data now too, store it in Redux and use a cached version if available.
      let region;
      let realm;
      let name;
      const exportedCharacter = report.exportedCharacters
        ? report.exportedCharacters.find((char) => char.name === player.name)
        : null;
      if (exportedCharacter) {
        region = exportedCharacter.region.toLowerCase();
        realm = exportedCharacter.server;
        name = exportedCharacter.name;
        if (region === CHINESE_REGION) {
          setIsLoading(false);
          // China doesn't have an API
          return null;
        }
      }

      try {
        const result = await fetch(makeCharacterApiUrl(id, region, realm, name));

        if (!result.ok) {
          console.warn(new Error('Character profile loading failed'));
        } else {
          setCharacterProfile(await result.json());
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [report, player]);

  return { characterProfile, isLoading };
};

export default useCharacterProfile;
