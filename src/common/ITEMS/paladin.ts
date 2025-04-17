import type { Enchant } from 'common/SPELLS/Spell';

const items = {
  //region Holy
  //endregion
  //region Protection
  //endregion
  //region Retribution
  //endregion
  //region Shared
  RITE_OF_SANCTIFICATION: {
    id: 433568,
    name: 'Rite of Sanctification',
    icon: 'inv_inscription_weaponscroll01',
    effectId: 7143,
  },
  RITE_OF_ADJURATION: {
    id: 433583,
    name: 'Rite of Adjuration',
    icon: 'inv_inscription_armorscroll02',
    effectId: 7144,
  },
  //endregion
} satisfies Record<string, Enchant>;
export default items;
