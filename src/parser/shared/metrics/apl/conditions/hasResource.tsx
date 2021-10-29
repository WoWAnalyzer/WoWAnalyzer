import type { Resource } from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import { EventType } from 'parser/core/Events';
import React from 'react';

import { Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';

// TODO: this doesn't handle natural regen (mana, energy)
export default function hasResource(resource: Resource, range: Range): Condition<number> {
  return {
    key: `hasResource-${resource.id}`,
    init: () => 0,
    update: (state, event) => {
      if (event.type === EventType.Energize && event.resourceChangeType === resource.id) {
        return event.resourceChange - event.waste + state;
      } else if (
        event.type === EventType.SpendResource &&
        event.resourceChangeType === resource.id
      ) {
        return state - event.resourceChange;
      } else {
        return state;
      }
    },
    validate: (state, _event) =>
      state >= (range.atLeast || 0) && (range.atMost === undefined || state <= range.atMost),
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {formatRange(range)}{' '}
        <ResourceLink id={resource.id} icon />
      </>
    ),
  };
}
