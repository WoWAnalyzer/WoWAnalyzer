import Elevator from './js/elevator';
import music from './audio/elevator-music.mp3';
import ding from './audio/ding.mp3';

const elevator = new Elevator({
  mainAudio: music,
  endAudio: ding,
});

export default function elevate() {
  elevator.elevate();
}
