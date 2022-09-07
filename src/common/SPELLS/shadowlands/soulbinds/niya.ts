import { spellIndexableList } from '../../Spell';

const soulbindPowers = spellIndexableList({
  GROVE_INVIGORATION: {
    id: 322721,
    name: 'Grove Invigoration',
    icon: 'ability_druid_manatree',
  },
  REDIRECTED_ANIMA: {
    // Buff from the Grove Invigoration soulbind conduit
    id: 342814,
    name: 'Redirected Anima',
    icon: 'ability_druid_manatree',
  },
});
export default soulbindPowers;
