import { GenericTalentInterface, ISpellpower, ResourceTypes } from './talent-tree-types';
import { slugify } from 'scripts/utils/helpers';

export function printTalents(
  talentObj: Array<{ key: string; value: GenericTalentInterface }> | undefined,
) {
  if (!talentObj) {
    return "\n//Class doesn't exist in data yet\n";
  }
  return talentObj
    .sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      } else if (a.key > b.key) {
        return 1;
      } else {
        return 0;
      }
    })
    .map(({ key, value }) => {
      //Spec was only used during generation, so we remove it before writing to file
      delete value.spec;
      delete value.sourceTree;
      // deduplicate the entry ids. this is not done at earlier steps so we can tell when a talent
      // is repeated across trees for the shared/spec disambiguation method
      value.entryIds = Array.from(new Set(value.entryIds));
      return `${key}: ${JSON.stringify(value)},`;
    })
    .join('\n');
}

//Right now in the alpha build there are a bunch of talents between class and spec trees that share the same name
//This is fixed by adding the spec name to the exported talent name
export function createTalentKey(talentName: string, specName?: string) {
  //A lot of the cleaning in here is due to the weirdnamings of stuff in alpha data
  //Examples of weird names
  //Fury of the Skies (1/2%)
  //Celestial Alignment [SL version, No initial damage]
  //Moonfire/Sunfire + 3/6s
  //This tries to clean it as good as possible, without spending too much time on it since these names will probably be fixed as alpha progresses
  const cleanedTalentName = slugify(talentName);

  return `${cleanedTalentName.toUpperCase()}${
    specName ? `_${specName.toUpperCase().replace(' ', '_')}` : ''
  }_TALENT`;
}

export function findResourceCost(
  entryInSpellPowerTable: ISpellpower,
  resourceId: number,
  baseMaxResource: number,
) {
  if (parseInt(entryInSpellPowerTable.PowerCostPct) > 0) {
    return Math.round((Number(entryInSpellPowerTable.PowerCostPct) / 100) * baseMaxResource);
  } else if (
    [
      ResourceTypes.RunicPower,
      ResourceTypes.Rage,
      ResourceTypes.SoulShards,
      ResourceTypes.Pain,
    ].includes(resourceId)
  ) {
    return Number(entryInSpellPowerTable.ManaCost) / 10;
  } else {
    return Number(entryInSpellPowerTable.ManaCost);
  }
}

export function findResourceCostPerSecond(
  entryInSpellPowerTable: ISpellpower,
  resourceId: number,
  baseMaxResource: number,
) {
  if (parseFloat(entryInSpellPowerTable.PowerPctPerSecond) > 0) {
    return Math.round((Number(entryInSpellPowerTable.PowerPctPerSecond) / 100) * baseMaxResource);
  } else if (
    [
      ResourceTypes.RunicPower,
      ResourceTypes.Rage,
      ResourceTypes.SoulShards,
      ResourceTypes.Pain,
    ].includes(resourceId)
  ) {
    return Number(entryInSpellPowerTable.ManaPerSecond) / 10;
  } else {
    return Number(entryInSpellPowerTable.ManaPerSecond);
  }
}
