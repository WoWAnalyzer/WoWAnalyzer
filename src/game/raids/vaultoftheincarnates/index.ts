import Background from './backgrounds/overview.jpg';
import Eranog from 'game/raids/vaultoftheincarnates/Eranog';
import PrimalCouncil from 'game/raids/vaultoftheincarnates/PrimalCouncil';
import Terros from 'game/raids/vaultoftheincarnates/Terros';
import Sennarth from 'game/raids/vaultoftheincarnates/Sennarth';
import Dathea from 'game/raids/vaultoftheincarnates/Dathea';
import KurogGrimtotem from 'game/raids/vaultoftheincarnates/KurogGrimtotem';
import BroodkeeperDiurna from 'game/raids/vaultoftheincarnates/BroodkeeperDiurna';
import Raszageth from 'game/raids/vaultoftheincarnates/Raszageth';
import type { Raid } from 'game/raids';

export default {
  name: 'Vault of the Incarnates',
  background: Background,
  bosses: {
    Eranog,
    Terros,
    PrimalCouncil,
    Sennarth,
    Dathea,
    KurogGrimtotem,
    BroodkeeperDiurna,
    Raszageth,
  },
} satisfies Raid;
