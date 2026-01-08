import getFightName from 'common/getFightName';
import prettyEncodeURI from 'common/prettyEncodeURI';
import Combatant from 'parser/core/Combatant';
import Report from 'parser/core/Report';
import CharacterProfile from 'parser/core/CharacterProfile';

export function makePlainUrl(
  reportCode?: string,
  fightId?: string,
  fightName?: string,
  playerId?: string,
  playerName?: string,
  tab = 'standard',
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
  build = 'standard',
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
          if (playerName) {
            parts.push(`${playerId}-${prettyEncodeURI(playerName)}`);
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

  const realm: string = profile.realm
    .replace(/'/g, '') // remove apostrophes to match armory (Blackhand special case)
    .replace('-', '') // remove dashes to match armory (Azjol-Nerub special case)
    .replace(/\s/g, '-')
    .toLowerCase();

  if (profile.region === 'CN') {
    return `https://www.wowchina.com/zh-cn/character/${profile.region.toLowerCase()}/${realm}/${player.name.toLowerCase()}`;
  }

  return `https://worldofwarcraft.com/en-us/character/${profile.region.toLowerCase()}/${realm}/${player.name.toLowerCase()}`;
}

export function makeThumbnailUrl(characterInfo: CharacterProfile, classic: boolean) {
  if (!characterInfo?.thumbnail) {
    return '/img/fallback-character.jpg';
  }
  if (characterInfo.thumbnail?.startsWith('https')) {
    return characterInfo.thumbnail;
  }

  return classic
    ? `https://render.worldofwarcraft.com/classic-${characterInfo.region}/character/${characterInfo.thumbnail}`
    : `https://render-${characterInfo.region}.worldofwarcraft.com/character/${characterInfo.thumbnail}`.replace(
        'avatar',
        'inset',
      );
}
