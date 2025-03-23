import { buildBoss } from '../builders';
import background from './backgrounds/MugZee.jpg';

export default buildBoss({
  id: 3015,
  background,
  name: "Mug'Zee, Heads of Security",
  timeline: {
    debuffs: [
      {
        // Earthshaker Gaol --- placement
        id: 472631,
      },
      {
        // Golden Drip
        id: 467202,
      },
      {
        // Frostshatter Boots --- on heroic and above you need to run and hide
        id: 466476,
      },
      {
        // Goblin-Guided Rocket
        id: 467380,
      },
    ],
    abilities: [
      {
        // Earthshaker Gaol
        id: 474461,
        type: 'begincast',
      },
      {
        // Doubly Whammy Shot
        id: 1223085,
        type: 'begincast',
      },
      {
        // Unstable Crawler Mines
        id: 472458,
        type: 'begincast',
      },
      {
        // Elemental Carnage / Mug Taking Charge
        id: 468658,
        type: 'cast',
      },
      {
        // Uncontrolled Destruction / Zee Taking Charge
        id: 468694,
        type: 'cast',
      },
      {
        // Goblin-Guided Rocket
        id: 467379,
        type: 'begincast',
      },
    ],
  },
});
