import getFightName from 'common/getFightName';
import prettyEncodeURI from 'common/prettyEncodeURI';
import Combatant from 'parser/core/Combatant';
import Report from 'parser/core/Report';
import DEFAULT_BUILD from 'parser/DEFAULT_BUILD';
import CharacterProfile from 'parser/core/CharacterProfile';

export function makePlainUrl(
  reportCode?: string,
  fightId?: string,
  fightName?: string,
  playerId?: string,
  playerName?: string,
  tab: string = DEFAULT_BUILD.url,
) {
  const parts = [];
  if (reportCode) {
    parts.push(`report/${reportCode}`);
    if (fightId) {
      parts.push(fightName ? `${fightId}-${prettyEncodeURI(fightName)}` : `${fightId}`);
      if (playerId) {
        parts.push(playerName ? `${playerId}-${prettyEncodeURI(playerName)}` : `${playerId}`);
        if (tab) {
          parts.push(tab);
        }
      }
    }
  }
  return `/${parts.join('/')}`;
}

export default function makeReportUrl(
  report?: Report,
  fightId?: number,
  playerId?: number,
  tab?: string,
  build = DEFAULT_BUILD.url,
) {
  const parts = [];
  if (report) {
    parts.push(`report/${report.code}`);
    if (fightId) {
      const fight = report.fights.find((fight) => fight.id === fightId);
      const fightName = fight ? getFightName(report, fight) : null;
      if (fightName) {
        parts.push(`${fightId}-${prettyEncodeURI(fightName)}`);
        if (playerId) {
          const player = report.friendlies.find((friendly) => friendly.id === playerId);
          const playerName = player ? player.name : null;
          const duplicatePlayerNames = report.friendlies.filter(
            (friendly) => friendly.name === playerName,
          );
          if (playerName) {
            parts.push(
              duplicatePlayerNames.length > 1
                ? `${playerId}-${prettyEncodeURI(playerName)}`
                : prettyEncodeURI(playerName),
            );
            if (build) {
              parts.push(build);
              if (tab) {
                parts.push(tab);
              }
            }
          }
        }
      }
    }
  }
  return `/${parts.join('/')}`;
}

export function makeCharacterUrl(player: Combatant) {
  const profile = player.characterProfile;
  return profile ? `/character/${profile.region}/${profile.realm}/${player.name}` : '#';
}

export function makeArmoryUrl(player: Combatant) {
  const profile = player.characterProfile;
  if (!profile) {
    return '#';
  }
  let battleNetUrl = `https://worldofwarcraft.com/en-us/character/${profile.region}/${profile.realm
    .replace(/'/g, '')
    .replace(/\s/g, '-')
    .toLowerCase()}/${player.name}`;
  if (profile.region === 'CN') {
    battleNetUrl = `https://www.wowchina.com/zh-cn/character/${profile.realm
      .replace(/'/g, '')
      .replace(/\s/g, '-')
      .toLowerCase()}/${player.name}`;
  }
  return battleNetUrl;
}

export function makeThumbnailUrl(characterInfo: CharacterProfile, classic: boolean) {
  if (!characterInfo) {
    return '/img/fallback-character.jpg';
  }
  if (characterInfo.thumbnail.startsWith('https')) {
    return characterInfo.thumbnail;
  }

  return classic
    ? `https://render.worldofwarcraft.com/classic-${characterInfo.region}/character/${characterInfo.thumbnail}`
    : `https://render-${characterInfo.region}.worldofwarcraft.com/character/${characterInfo.thumbnail}`.replace(
        'avatar',
        'inset',
      );
}
