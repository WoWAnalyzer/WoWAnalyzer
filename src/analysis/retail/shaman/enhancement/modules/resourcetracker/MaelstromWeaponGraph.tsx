import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import MaelstromWeaponTracker from './MaelstromWeaponTracker';

class MaelstromWeaponGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  maelstromWeaponTracker!: MaelstromWeaponTracker;

  tracker() {
    return this.maelstromWeaponTracker;
  }
}

export default MaelstromWeaponGraph;
