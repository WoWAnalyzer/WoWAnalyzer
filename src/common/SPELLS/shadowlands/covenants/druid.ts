import { spellIndexableList } from '../../Spell';

const covenants = spellIndexableList({
  //region Kyrian
  KINDRED_SPIRITS: {
    id: 326434,
    name: 'Kindred Spirits',
    icon: 'ability_bastion_druid',
  },
  LONE_MEDITATION: {
    // healer solo cast + buff
    id: 338035,
    name: 'Lone Meditation',
    icon: 'spell_animabastion_beam',
  },
  // TODO DPS and Tank Solos
  EMPOWER_BOND_TANK: {
    // bond activation cast targetting a Tank
    id: 326462,
    name: 'Empower Bond',
    icon: 'spell_animabastion_beam',
  },
  EMPOWER_BOND_DAMAGE: {
    // bond activation cast targetting a DPS
    id: 326446,
    name: 'Empower Bond',
    icon: 'spell_animabastion_beam',
  },
  EMPOWER_BOND_HEALER: {
    // bond activation cast targetting a healer
    id: 326647,
    name: 'Empower Bond',
    icon: 'spell_animabastion_beam',
  },
  KINDRED_FOCUS_BUFF_OUTGOING: {
    // healer buff from you to target
    id: 327071,
    name: 'Kindred Focus',
    icon: 'spell_animabastion_buff',
  },
  KINDRED_FOCUS_BUFF_INCOMING: {
    // healer buff from target to you
    id: 327148,
    name: 'Kindred Focus',
    icon: 'spell_animabastion_beam',
  },
  KINDRED_EMPOWERMENT_BUFF_OUTGOING: {
    // DPS buff from you to target
    id: 327139,
    name: 'Kindred Empowerment',
    icon: 'spell_animabastion_beam',
  },
  KINDRED_EMPOWERMENT_BUFF_ABSORB_INCOMING: {
    // DPS buff from target to you (and also absorb ID)
    id: 327022,
    name: 'Kindred Empowerment',
    icon: 'spell_animabastion_buff',
  },
  KINDRED_PROTECTION_BUFF: {
    // Tank buff from target to you (and also damage from you to target)
    id: 327037,
    name: 'Kindred Protection',
    icon: 'spell_animabastion_buff',
  },
  KINDRED_FOCUS_HEAL: {
    // Heal ID when you heal others
    id: 327149,
    name: 'Kindred Focus',
    icon: 'spell_animabastion_beam',
  },
  KINDRED_EMPOWERMENT_DPS_HEAL: {
    // Heal ID from you when targeted DPS does damage
    id: 338525,
    name: 'Kindred Empowerment',
    icon: 'spell_animabastion_beam',
  },
  //endregion

  //region Necrolord
  ADAPTIVE_SWARM: {
    // cast
    id: 325727,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  ADAPTIVE_SWARM_HEAL: {
    // buff, heal
    id: 325748,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  ADAPTIVE_SWARM_DAMAGE: {
    // debuff, damage
    id: 325733,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  //endregion

  //region Night Fae
  CONVOKE_SPIRITS: {
    id: 323764,
    name: 'Convoke the Spirits',
    icon: 'ability_ardenweald_druid',
  },
  //endregion

  //region Venthyr
  RAVENOUS_FRENZY: {
    id: 323546,
    name: 'Ravenous Frenzy',
    icon: 'ability_revendreth_druid',
  },
  SINFUL_HYSTERIA_BUFF: {
    // spellId for the 'lingering' Ravenous Frenzy procced by the Sinful Hysteria legendary
    id: 355315,
    name: 'Ravenous Frenzy',
    icon: 'ability_revendreth_druid',
  },

  //endregion
});
export default covenants;
