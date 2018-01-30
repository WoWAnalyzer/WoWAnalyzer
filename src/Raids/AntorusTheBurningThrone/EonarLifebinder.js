import Background from './Images/Backgrounds/Eonar-Lifebinder.jpg';
import Headshot from './Images/Headshots/Eonar-Lifebinder.png';

export default {
  id: 2075,
  name: 'Eonar Lifebinder',
  background: Background,
  headshot: Headshot,
  fight: {
    vantusRuneBuffId: 250150,
    resultsWarning: 'Because of the way this encounter was designed, some statistics and suggestions may be inaccurate. Therefore this encounter is not recommended for improving overall play. Instead you should use this encounter for improving on this encounter only.',
    disableDowntimeSuggestion: true,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
  },
};
