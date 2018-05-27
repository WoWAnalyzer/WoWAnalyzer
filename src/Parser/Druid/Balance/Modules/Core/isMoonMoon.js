import SPELLS from 'common/SPELLS';

export default function isMoonMoon(event) {
  return [SPELLS.FULL_MOON.id, SPELLS.HALF_MOON.id, SPELLS.NEW_MOON.id].includes(event.ability.guid);
}
