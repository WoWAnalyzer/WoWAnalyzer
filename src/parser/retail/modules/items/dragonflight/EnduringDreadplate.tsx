import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS/dragonflight/trinkets';
import SPELLS from 'common/SPELLS/dragonflight/trinkets';
import { isPresent } from 'common/typeGuards';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  Item as EventsItem,
  Item,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { calculateEffectScaling } from 'parser/core/stats';
import HIT_TYPES from 'game/HIT_TYPES';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import BoringValue from 'parser/ui/BoringValueText';
import ItemLink from 'interface/ItemLink';
import ItemsItem from 'common/ITEMS/Item';

const ENDURING_DREADPLATE_BUFF_STACK_REMOVAL_BUFFER = 15000;
const ENDURING_DREADPLATE_BUFF_STACK_REMOVAL = 'EnduringDreadplateBuffStackRemoval';

const ENDURING_DREADPLATE_EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ENDURING_DREADPLATE_BUFF_STACK_REMOVAL,
    referencedEventId: SPELLS.HELLSTEEL_PLATING.id,
    referencedEventType: EventType.RemoveBuffStack,
    linkingEventId: SPELLS.HELLSTEEL_PLATING.id,
    linkingEventType: EventType.ApplyBuff,
    forwardBufferMs: ENDURING_DREADPLATE_BUFF_STACK_REMOVAL_BUFFER,
    backwardBufferMs: 0,
    maximumLinks: 1,
  },
];

export class EnduringDreadplateEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, ENDURING_DREADPLATE_EVENT_LINKS);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.ENDURING_DREADPLATE.id);
  }
}

function getFirstBuffStackDrop(event: ApplyBuffEvent): RemoveBuffStackEvent | undefined {
  return GetRelatedEvents<RemoveBuffStackEvent>(
    event,
    ENDURING_DREADPLATE_BUFF_STACK_REMOVAL,
    (e): e is RemoveBuffStackEvent => e.type === EventType.RemoveBuffStack,
  ).pop();
}

interface EnduringDreadplateUse {
  timestamp: number;
  damageReduced: number;
  firstStackRemovalTimestamp: number | undefined;
}

export default class EnduringDreadplate extends Analyzer {
  private drPerPlate: number = 0;
  private trinket: Item | undefined;
  private uses: EnduringDreadplateUse[] = [];

  constructor(options: Options) {
    super(options);
    this.trinket = this.selectedCombatant.getTrinket(ITEMS.ENDURING_DREADPLATE.id);
    if (!isPresent(this.trinket)) {
      this.active = false;
      return;
    }
    const itemLevel = this.trinket?.itemLevel ?? 415;
    this.drPerPlate = Math.ceil(calculateEffectScaling(415, 4860, itemLevel) as number);
    console.info(`[EnduringDreadplate] DR per plate = ${this.drPerPlate}`);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HELLSTEEL_PLATING),
      this.onHellsteelPlatingApply,
    );

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  statistic() {
    const isEventsItem = (item: EventsItem | ItemsItem): item is EventsItem => 'quality' in item;
    const item = this.trinket ?? ITEMS.ENDURING_DREADPLATE;
    const itemLinkProps = {
      id: item.id,
      ...(isEventsItem(item) && {
        quality: item.quality,
        details: item,
      }),
    };

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Use</th>
                  <th>Timestamp</th>
                  <th>Damage Mitigated</th>
                </tr>
              </thead>
              <tbody>
                {this.uses.map((use, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{this.owner.formatTimestamp(use.timestamp)}</td>
                    <td>{formatNumber(use.damageReduced)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringValue
          label={
            <>
              <ItemLink {...itemLinkProps} /> Damage Mitigated
            </>
          }
        >
          <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
          {formatNumber(this.uses.reduce((acc, use) => acc + use.damageReduced, 0))}
        </BoringValue>
      </Statistic>
    );
  }

  private onHellsteelPlatingApply(event: ApplyBuffEvent) {
    this.uses.push({
      timestamp: event.timestamp,
      damageReduced: 0,
      firstStackRemovalTimestamp: getFirstBuffStackDrop(event)?.timestamp,
    });
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HELLSTEEL_PLATING.id)) {
      return;
    }
    if (event.hitType !== HIT_TYPES.NORMAL && event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const currentUseFirstBuffStackRemovalTimestamp =
      this.uses[this.uses.length - 1].firstStackRemovalTimestamp;
    let buffStacks = this.selectedCombatant.getBuffStacks(SPELLS.HELLSTEEL_PLATING.id);

    // The applybuff is logged as 1 stack but is actually 5; we check if we have a stack break and if not, we treat the buff
    // as having 5 stacks. If we do have a break, but it's after our current damage event, we also treat as 5 stacks.
    if (
      !currentUseFirstBuffStackRemovalTimestamp ||
      currentUseFirstBuffStackRemovalTimestamp > event.timestamp
    ) {
      buffStacks = 5;
    }

    this.uses[this.uses.length - 1].damageReduced += this.drPerPlate * buffStacks;
  }
}
