import { CraftedItem } from 'common/ITEMS/Item';

const gems = {
  EMPTY_GEM_SOCKET: {
    //In this codebase everywhere this needs to be used is the same as a gem
    id: -818, //Number is signed taking advantage of that to mark pseudo items
    name: 'Empty Gem Socket',
    icon: 'equipment_empty_gem_socket',
    craftQuality: 1,
  },
} satisfies Record<string, CraftedItem>;

export default gems;
