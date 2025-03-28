import { change, date } from 'common/changelog';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SamuelMaverick, ToppleTheNun } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2025, 3, 25), 'Fix: update spell references for Echoing Reprimand and Thistle Tea', SamuelMaverick),
  change(date(2023, 10, 9), 'Start updating for 10.2.', ToppleTheNun),
  change(date(2023, 2, 23), 'Improve types for FilteredDamageTracker.', ToppleTheNun),
  change(date(2023, 2, 8), <>Improve <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> waste display in Guide.</>, ToppleTheNun),
];
