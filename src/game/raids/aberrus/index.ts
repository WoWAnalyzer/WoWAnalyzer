import Kazarra from 'game/raids/aberrus/Kazarra';
import AmalgamationChamber from 'game/raids/aberrus/AmalgamationChamber';
import ForgottenExperiments from 'game/raids/aberrus/ForgottenExperiments';
import AssaultOfTheZaqali from 'game/raids/aberrus/AssaultOfTheZaqali';
import Rashok from 'game/raids/aberrus/Rashok';
import Zskarn from 'game/raids/aberrus/Zskarn';
import Magmorax from 'game/raids/aberrus/Magmorax';
import EchoOfNeltharion from 'game/raids/aberrus/EchoOfNeltharion';
import Sarkareth from 'game/raids/aberrus/Sarkareth';

import Background from './backgrounds/overview.jpg';

export default {
  name: 'Vault of the Incarnates',
  background: Background,
  bosses: {
    Kazarra,
    AmalgamationChamber,
    ForgottenExperiments,
    AssaultOfTheZaqali,
    Rashok,
    Zskarn,
    Magmorax,
    EchoOfNeltharion,
    Sarkareth,
  },
};
