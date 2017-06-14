import DarkmoonDeckPromisesCore from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';


class DarkmoonDeckPromises extends DarkmoonDeckPromisesCore {
  CARDS = { // Asuming 900
    191615: 770, // Ace
    191616: 1059, // 2
    191617: 1349, // 3
    191618: 1636, // 4
    191619: 1924, // 5
    191620: 2212, // 6
    191621: 2501, // 7
    191622: 3078, // 8
  };

  currentManaReduction = 1816;

  on_initialized() {
    super.on_initialized();
  }

  on_byPlayer_heal() {
  }
}

export default DarkmoonDeckPromises;
