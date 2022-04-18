import useCharacterProfile from 'interface/useCharacterProfile';
import CharacterProfile from 'parser/core/CharacterProfile';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import * as React from 'react';

interface Props {
  report: Report;
  player: PlayerInfo;
  children: (isLoading: boolean, characterProfile: CharacterProfile | null) => React.ReactNode;
}

// TODO: Refactor Report to a functional component so this component can be
//  removed in favor of using the hook
const CharacterProfileLoader = ({ report, player, children }: Props) => {
  const characterProfile = useCharacterProfile({ report, player });

  return children(!characterProfile, characterProfile);
};

export default CharacterProfileLoader as React.ComponentType<Props>;
