import Tindral from 'game/raids/amirdrassil/Tindral';
import generatePhaseDowntimes from 'parser/shared/normalizers/ForcedDowntime/generatePhaseDowntimes';
import { DowntimeSpec } from 'parser/shared/normalizers/ForcedDowntime/index';

export const amidrassil_downtime_specs: DowntimeSpec[] = [
  {
    encounterId: Tindral.id,
    reason: 'Intermission',
    generateWindows: generatePhaseDowntimes({
      downtimePhaseKey: 'I1',
    }),
  },
  {
    encounterId: Tindral.id,
    reason: 'Intermission',
    generateWindows: generatePhaseDowntimes({
      downtimePhaseKey: 'I2',
    }),
  },
  // TODO Fyrakk P1->I1 (or too short to bother?)
  // TODO Fyrakk P2->P3 (or too short to bother?)
];
