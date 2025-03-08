import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/BloodboundHorror.jpg';

export const BloodboundHorror = buildBoss({
  id: 2917,
  name: 'The Bloodbound Horror',
  background,
  timeline: {
    abilities: [
      {
        // Gruesome Disgorge (go-down frontal)
        id: 444363,
        type: 'cast',
      },
      {
        // Spewing Hemorrhage (beams)
        id: 445936,
        type: 'cast',
      },
      {
        // Goresplatter (run away circle)
        id: 442530,
        type: 'begincast',
      },
    ],
    debuffs: [
      {
        // Gruesome Disgorge (you are downstairs)
        id: 443612,
      },
      {
        // Grasp from Beyond (tentacle drops)
        id: 443042,
      },
    ],
  },
});
