import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { TeachingsOfTheMonestary } from 'analysis/retail/monk/shared';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

// a stack gain and its paired refresh land on the same timestamp
const REFRESH_PAIR_WINDOW_MS = 10;
// a stack gain lands within ~100ms of the tiger palm that caused it
const TIGER_PALM_GAIN_WINDOW_MS = 250;

class TeachingsOfTheMonastery extends TeachingsOfTheMonestary {
  stacks = 0;
  stacksBeforeChange = 0;
  lastChange = -1;
  lastGain = Number.MIN_SAFE_INTEGER;
  unpairedGains = 0;
  overcaps = new Set<RefreshBuffEvent>();
  lastTigerPalm?: CastEvent;
  // celestial harmony always grants 4 on chi-ji's cast, so any stacks held beforehand are wasted
  entryWasted = 0;
  lastEntryWasted = 0;
  // overcap refreshes logged at the chi-ji cast are already part of entryWasted
  entryOvercaps = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM),
      (event: CastEvent) => {
        this.lastTigerPalm = event;
      },
    );
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
        this.onChijiCast,
      );
    }
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      (event: ApplyBuffEvent) => this.onGain(event.timestamp, 1),
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      (event: ApplyBuffStackEvent) => this.onGain(event.timestamp, event.stack),
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      (event: RemoveBuffEvent) => this.setStacks(event.timestamp, 0),
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onRefresh,
    );
  }

  // changes at the same timestamp as a cast are logged before it, so keep the stacks from before them
  private setStacks(timestamp: number, stacks: number) {
    if (timestamp !== this.lastChange) {
      this.stacksBeforeChange = this.stacks;
      this.lastChange = timestamp;
    }
    this.stacks = stacks;
  }

  private onGain(timestamp: number, stacks: number) {
    this.setStacks(timestamp, stacks);
    if (timestamp - this.lastGain > REFRESH_PAIR_WINDOW_MS) {
      this.unpairedGains = 0;
    }
    this.unpairedGains += 1;
    this.lastGain = timestamp;
  }

  // refreshes also fire alongside normal stack gains, so a refresh only counts as an overcap
  // when there is no gain on the same timestamp to pair it with
  private onRefresh(event: RefreshBuffEvent) {
    if (event.timestamp - this.lastGain <= REFRESH_PAIR_WINDOW_MS && this.unpairedGains > 0) {
      this.unpairedGains -= 1;
      return;
    }
    this.overcaps.add(event);
    if (
      this.lastTigerPalm &&
      event.timestamp - this.lastTigerPalm.timestamp <= TIGER_PALM_GAIN_WINDOW_MS
    ) {
      addInefficientCastReason(
        this.lastTigerPalm,
        <>
          Overcapped <SpellLink spell={SPELLS.TEACHINGS_OF_THE_MONASTERY} /> stacks.
        </>,
      );
    }
  }

  private onChijiCast(event: CastEvent) {
    this.lastEntryWasted = this.selectedCombatant.hasTalent(TALENTS_MONK.CELESTIAL_HARMONY_TALENT)
      ? this.stacksBeforeCast(event.timestamp)
      : 0;
    this.entryWasted += this.lastEntryWasted;
    this.entryOvercaps += [...this.overcaps].filter(
      (overcap) => overcap.timestamp === event.timestamp,
    ).length;
  }

  isOvercap(event: RefreshBuffEvent) {
    return this.overcaps.has(event);
  }

  stacksBeforeCast(timestamp: number) {
    return this.lastChange === timestamp ? this.stacksBeforeChange : this.stacks;
  }

  get tooltip() {
    const gainedAtMax = this.overcaps.size - this.entryOvercaps;
    const totalWasted = gainedAtMax + this.entryWasted;
    if (this.averageStacks === 0 || totalWasted === 0) {
      return undefined;
    }
    return (
      <>
        <SpellLink spell={SPELLS.TEACHINGS_OF_THE_MONASTERY} /> stacks wasted: {totalWasted}
        <ul>
          {gainedAtMax > 0 && <li>{gainedAtMax} from gaining stacks at max</li>}
          {this.entryWasted > 0 && (
            <li>
              {this.entryWasted} from casting{' '}
              <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} /> with stacks
              already built
            </li>
          )}
        </ul>
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={this.tooltip}
      >
        <TalentSpellText talent={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT}>
          {this.averageStacks.toFixed(2)} <small> average stacks</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TeachingsOfTheMonastery;
