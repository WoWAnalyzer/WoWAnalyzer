import { spellIndexableList } from '../../Spell';

const covenants = spellIndexableList({
  //region Kyrian
  SHACKLE_THE_UNWORTHY: {
    id: 312202,
    name: 'Shackle the Unworthy',
    icon: 'ability_bastion_deathknight',
  },

  //endregion

  //region Necrolord
  ABOMINATION_LIMB: {
    id: 315443,
    name: 'Abomination Limb',
    icon: 'ability_maldraxxus_deathknight',
  },

  // recasts and applies damage every second on the environment, similar to what remorseless winter does
  ABOMINATION_LIMB_HIDDEN_CAST: {
    id: 323798,
    name: 'Abomination Limb',
    icon: 'ability_maldraxxus_deathknight',
  },

  // spell that performs the grip
  ABOMINATION_LIMB_GRIP: {
    id: 323710,
    name: 'Abomination Limb',
    icon: 'ability_maldraxxus_deathknight',
  },

  //endregion

  //region Night Fae
  DEATHS_DUE: {
    id: 324128,
    name: "Death's Due",
    icon: 'ability_ardenweald_deathknight',
  },

  DEATHS_DUE_DAMAGE_TICK: {
    id: 341340,
    name: "Death's Due",
    icon: 'ability_ardenweald_deathknight',
  },

  DEATHS_DUE_DEBUFF: {
    id: 324164,
    name: "Death's·Due",
    icon: 'ability_ardenweald_deathknight',
  },

  DEATHS_DUE_BUFF: {
    id: 324165,
    name: "Death's Due",
    icon: 'ability_ardenweald_deathknight',
  },

  //endregion

  //region Venthyr
  SWARMING_MIST: {
    id: 311648,
    name: 'Swarming Mist',
    icon: 'ability_revendreth_deathknight',
  },
  SWARMING_MIST_TICK: {
    id: 311730,
    name: 'Swarming Mist',
    icon: 'ability_revendreth_deathknight',
  },
  SWARMING_MIST_RUNIC_POWER_GAIN: {
    id: 312546,
    name: 'Swarming Mist',
    icon: 'ability_revendreth_deathknight',
  },

  //endregion
});
export default covenants;
