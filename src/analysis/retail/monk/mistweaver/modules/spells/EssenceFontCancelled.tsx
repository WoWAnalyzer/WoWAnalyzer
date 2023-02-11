import { t } from '@lingui/macro';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  EndChannelEvent,
  HealEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';

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
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.handleEndChannel,
    );
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.onEndCooldown,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.onApply,
    );
    this.hasUpwelling = this.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT);
  }

  castEssenceFont(event: CastEvent) {
    this.expectedNumBolts = this.getExpectedApplies(event);
    debug &&
      console.log(
        `Number of expected bolts is ${
          this.expectedNumBolts
        } for cast at ${this.owner.formatTimestamp(event.timestamp)}`,
      );
    this.lastEf = event;
  }

  onApply(event: HealEvent) {
    // only want ef bolt heals
    if (event.tick) {
      return;
    }
    this.numBoltHits += 1;
  }

  onEndCooldown(event: UpdateSpellUsableEvent) {
    if (event.ability.guid !== TALENTS_MONK.ESSENCE_FONT_TALENT.id || !event.isAvailable) {
      return;
    }
    this.lastCdEnd = event.timestamp;
    debug && console.log(`Cooldown for EF ended at ${this.owner.formatTimestamp(event.timestamp)}`);
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

  handleEndChannel(event: EndChannelEvent) {
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
    this.numBoltHits = 0;
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
