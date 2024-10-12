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
  SPYMASTERS_WEB: {
    id: 220202,
    name: "Spymaster's Web",
    icon: 'inv_11_0_raid_spymastersweb_purple',
  },
  TREACHEROUS_TRANSMITTER: {
    id: 221023,
    name: 'Treacherous Transmitter',
    icon: 'inv_etherealraid_communicator_color1',
  },
} satisfies Record<string, Item>;

export default trinkets;
