import { change, date } from 'common/changelog';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ToppleTheNun } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2023, 2, 8), <>Improve <ResourceLink id={RESOURCE_TYPES.FURY.id} /> waste display in Guide.</>, ToppleTheNun),

];
