import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from "raids/index";

import Background from './images/backgrounds/TheCouncilOfBlood.jpg';
import Headshot from './images/headshots/TheCouncilOfBlood.jpg';

const TheCouncilOfBlood: Boss = {
  id: 2412,
  name: 'The Council of Blood',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_nobilitycouncil',
  fight: {
    vantusRuneBuffId: 311450,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P: {
        key: "P",
        name: 'Stage 1: The Council of Blood',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      I: {
        key: "I",
        name: 'Intermission: The Dance Macabre',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
    },
  },
};

export default TheCouncilOfBlood;