import SPELLS from 'common/SPELLS';
import EventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import { GIFT_OF_THE_OX_SPELL_IDS } from '../constants';

const CelestialFortuneHealOrder: EventOrder = {
  beforeEventId: SPELLS.EXPEL_HARM.id,
  beforeEventType: EventType.Cast,
  afterEventId: SPELLS.CELESTIAL_FORTUNE_HEAL.id,
  afterEventType: EventType.Heal,
  bufferMs: 50,
  anyTarget: true,
  updateTimestamp: true,
};

const ExpelHarmHealOrder: EventOrder = {
  beforeEventId: SPELLS.EXPEL_HARM.id,
  beforeEventType: EventType.Cast,
  afterEventId: SPELLS.EXPEL_HARM.id,
  afterEventType: EventType.Heal,
  bufferMs: 50,
  anyTarget: true,
  updateTimestamp: true,
};

const GiftOxOrder: EventOrder = {
  beforeEventId: SPELLS.EXPEL_HARM.id,
  beforeEventType: EventType.Cast,
  afterEventId: GIFT_OF_THE_OX_SPELL_IDS,
  afterEventType: EventType.Heal,
  bufferMs: 50,
  anyTarget: true,
  updateTimestamp: true,
};

/**
 * Expel Harm Normalizer reorders events so that Expel Harm Casts are parsed **before**:
 *  - Celestial Fortune Heals
 *  - Gift of the Ox Heals, that have been attracted by Expel Harm
 *  - Expel Harm Heal, the baseline part
 */
export default class ExpelHarm extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, [CelestialFortuneHealOrder, ExpelHarmHealOrder, GiftOxOrder]);
  }
}
