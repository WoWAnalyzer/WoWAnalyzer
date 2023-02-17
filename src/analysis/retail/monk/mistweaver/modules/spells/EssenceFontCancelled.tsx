import { t } from '@lingui/macro';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EndChannelEvent,
  RefreshBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const debug = false;
const NUM_EF_BOLTS = 18;
const BOLT_BUFFER = 2;

class EssenceFontCancelled extends Analyzer {
  expectedNumBolts: number = 0;
  numCancelled: number = 0;
  hasUpwelling: boolean = false;
  numBoltHits: number = 0;
  lastCdEnd: number = 0;
  lastEf: CastEvent | null = null;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.castEssenceFont,
    );
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.onEndCooldown,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.onApply,
    );
    this.hasUpwelling = this.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT);
  }

  castEssenceFont(event: CastEvent) {
    this.expectedNumBolts = this.getExpectedApplies(event);
    this.numBoltHits = 0;
    debug &&
      console.log(
        `Number of expected bolts is ${
          this.expectedNumBolts
        } for cast at ${this.owner.formatTimestamp(event.timestamp)}`,
      );
    this.lastEf = event;
  }

  onApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.numBoltHits += 1;
  }

  onEndCooldown(event: UpdateSpellUsableEvent) {
    if (event.ability.guid !== TALENTS_MONK.ESSENCE_FONT_TALENT.id || !event.isAvailable) {
      return;
    }
    this.lastCdEnd = event.timestamp;
    debug && console.log(`Cooldown for EF ended at ${this.owner.formatTimestamp(event.timestamp)}`);
  }

  getPerformance(targetsHit: number) {
    const percentHit = targetsHit / this.getExpectedApplies(this.lastEf!);
    const diff = this.getExpectedApplies(this.lastEf!) - targetsHit;
    let perf = QualitativePerformance.Perfect;
    if (percentHit < 0.85) {
      // generally these will be counted as cancels but adding it here to be safe
      perf = QualitativePerformance.Fail;
    } else if (percentHit < 0.9) {
      perf = QualitativePerformance.Ok;
    } else if (percentHit < 1 && diff > 1) {
      perf = QualitativePerformance.Good;
    }
    return perf;
  }

  getExpectedApplies(event: CastEvent) {
    if (!this.hasUpwelling) {
      return NUM_EF_BOLTS;
    }
    // Every second that Essence Font is ready to be cast but isn't, another bolt gets added to its next cast, up to 18
    return Math.min(
      NUM_EF_BOLTS * 2,
      NUM_EF_BOLTS + Math.floor((event.timestamp - this.lastCdEnd) / 1000),
    );
  }

  // return true if cancelled, else return false
  handleEndChannel(event: EndChannelEvent) {
    let cancelled = false;
    if (this.numBoltHits < this.expectedNumBolts - BOLT_BUFFER) {
      debug &&
        console.log(
          `EF cancelled at ${this.owner.formatTimestamp(
            event.timestamp,
          )} when number of applies was ${this.numBoltHits} and expected was ${
            this.expectedNumBolts
          }`,
        );
      this.numCancelled += 1;
      cancelled = true;
      if (this.lastEf != null) {
        this.lastEf.meta = this.lastEf.meta || {};
        this.lastEf.meta.isInefficientCast = true;
        this.lastEf.meta.inefficientCastReason = `This Essence Font cast was canceled early.`;
      } else {
        debug &&
          console.log(
            'Last Essence Font is null when detecting cancellation, when event is ' + event,
          );
      }
    } else {
      debug &&
        console.log(`Didn't cancel EF ending at ${this.owner.formatTimestamp(event.timestamp)}`);
    }
    return cancelled;
  }

  get suggestionThresholds() {
    return {
      actual: this.numCancelled,
      isGreaterThanOrEqual: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cancelled <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} />
        </>,
      )
        .icon(TALENTS_MONK.ESSENCE_FONT_TALENT.icon)
        .actual(
          `${this.numCancelled} ${t({
            id: `monk.mistweaver.suggestions.essenceFont.cancelledCasts`,
            message: ` cancelled casts`,
          })}`,
        )
        .recommended(`0 cancelled casts is recommended`),
    );
  }
}

export default EssenceFontCancelled;
