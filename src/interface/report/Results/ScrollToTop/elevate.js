import ding from './audio/ding.mp3';
import music from './audio/elevator-music.mp3';
import Elevator from './js/elevator';

const elevator = new Elevator({
  mainAudio: music,
  endAudio: ding,
});

export default function elevate() {
  elevator.elevate();
}
