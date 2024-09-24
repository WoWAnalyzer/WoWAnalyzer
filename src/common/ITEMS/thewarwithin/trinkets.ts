import Item from '../Item';

const trinkets = {
  SHADOW_BINDING_RITUAL_KNIFE: {
    id: 215178,
    name: 'Shadow-Binding Ritual Knife',
    icon: 'inv_knife_1h_grimbatolraid_d_03',
  },
  SIGNET_OF_THE_PRIORY: {
    id: 219308,
    name: 'Signet of the Priory',
    icon: 'inv_arathordungeon_signet_color1',
  },
} satisfies Record<string, Item>;

export default trinkets;
