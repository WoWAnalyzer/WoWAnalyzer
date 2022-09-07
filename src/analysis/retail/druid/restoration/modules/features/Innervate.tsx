import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { CooldownExpandable, CooldownExpandableItem } from '../../Guide';

export const GREED_INNERVATE = 9000;
export const SMART_INNERVATE = GREED_INNERVATE / 2;

class Innervate extends Analyzer {
  casts = 0;
  castsOnYourself = 0;
  manaSaved = 0;
  reduction = 0;

  castTrackers: InnervateCast[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.trackCastsDuringInnervate);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INNERVATE),
      this.handleInnervateCasts,
    );
  }

  trackCastsDuringInnervate(event: CastEvent) {
    const manaEvent = event.rawResourceCost;
    if (manaEvent === undefined) {
      return;
    }

    // don't count innervate because its kind of implied
    if (event.ability.guid === SPELLS.INNERVATE.id) {
      return;
    }

    //okay what did we actually do in innervate
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      if (!CASTS_THAT_ARENT_CASTS.includes(event.ability.guid) && this.castTrackers.length > 0) {
        // we want to at least keep track of all abilites during the innervate, not just ones that cost mana
        this.castTrackers[this.castTrackers.length - 1].casts.push(event);
      }

      //checks if the spell costs anything (we don't just use cost since some spells don't play nice)
      if (Object.keys(manaEvent).length !== 0) {
        const manaSavedFromThisCast = manaEvent[0] * this.reduction;
        this.manaSaved += manaSavedFromThisCast;
        if (this.castTrackers.length > 0) {
          this.castTrackers[this.castTrackers.length - 1].manaSaved += manaSavedFromThisCast;
        }
      }
    }
  }

  handleInnervateCasts(event: CastEvent) {
    this.reduction = 0.5;
    this.casts += 1;

    const castTracker: InnervateCast = {
      timestamp: event.timestamp,
      casts: [],
      manaSaved: 0,
    };
    this.castTrackers.push(castTracker);

    if (event.targetID === event.sourceID) {
      this.castsOnYourself += 1;
      this.reduction = 1;
    } else {
      castTracker.targetId = event.targetID;
    }
  }

  get selfCastThresholds() {
    return {
      actual: this.castsOnYourself,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get manaSavedPerInnervate() {
    if (this.casts === 0) {
      return 0;
    }
    return this.manaSaved / this.casts;
  }

  // tldr they could cheese this threshold if they just cast on self the whole time so we scale it for that
  get realManaSavedThreshold() {
    if (this.casts === 0) {
      return SMART_INNERVATE;
    }
    return (
      (this.castsOnYourself * GREED_INNERVATE +
        (this.casts - this.castsOnYourself) * SMART_INNERVATE) /
      this.casts
    );
  }

  get manaSavedThresholds() {
    const minor = this.realManaSavedThreshold;
    return {
      actual: this.manaSavedPerInnervate,
      isLessThan: {
        minor: minor,
        average: minor * 0.8,
        major: minor * 0.6,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get guideCastBreakdown() {
    return (
      <>
        <strong>
          <SpellLink id={SPELLS.INNERVATE.id} />
        </strong>{' '}
        is best used during your ramp, or any time when you expect to spam cast. Typically it should
        be used as soon as it's available. Remember to fit a Wild Growth inside the Innervate, as
        it's one of your most expensive spells.
        <p />
        {this.castTrackers.map((cast, ix) => {
          const isSelfCast = cast.targetId === undefined;
          const targetName = cast.targetId === undefined ? 'SELF' : 'ALLY';
          const metThresholdMana = isSelfCast
            ? cast.manaSaved >= GREED_INNERVATE
            : cast.manaSaved >= SMART_INNERVATE;
          const castWildGrowth =
            cast.casts.filter((c) => c.ability.guid === SPELLS.WILD_GROWTH.id).length > 0;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={SPELLS.INNERVATE.id} /> ({formatNumber(cast.manaSaved)} mana saved)
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: 'Chain-cast expensive spells',
            result: <PassFailCheckmark pass={metThresholdMana} />,
            details: (
              <>
                {isSelfCast
                  ? `(for a self-cast, save at least ${GREED_INNERVATE} mana)`
                  : `(for an ally-cast, save at least ${SMART_INNERVATE} mana)`}
              </>
            ),
          });
          checklistItems.push({
            label: (
              <>
                Cast <SpellLink id={SPELLS.WILD_GROWTH.id} />
              </>
            ),
            result: <PassFailCheckmark pass={castWildGrowth} />,
          });

          const detailItems: CooldownExpandableItem[] = [];
          detailItems.push({
            label: 'Used on',
            result: '',
            details: <>{targetName}</>,
          });
          detailItems.push({
            label: 'Casts during Innervate',
            result: '',
            details: (
              <>
                {cast.casts.map((c, iix) => (
                  <>
                    <SpellIcon id={c.ability.guid} key={iix} />{' '}
                  </>
                ))}
              </>
            ),
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              detailItems={detailItems}
              key={ix}
            />
          );
        })}
        <p />
      </>
    );
  }

  suggestions(when: When) {
    when(this.selfCastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should aim to cast <SpellLink id={SPELLS.INNERVATE.id} /> on your allies to maximize
          the amount of mana saved over the raid.
        </>,
      )
        .icon(SPELLS.INNERVATE.icon)
        .actual(
          `${this.castsOnYourself} ${t({
            id: 'druid.resto.suggestions.innervate.selfCasts',
            message: `time(s) you casted innervate on yourself`,
          })}`,
        )
        .recommended(`0 self casts are recommended.`),
    );

    when(this.manaSavedThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your mana spent during <SpellLink id={SPELLS.INNERVATE.id} /> can be improved. Aim to cast{' '}
          <SpellLink id={SPELLS.EFFLORESCENCE_HEAL.id} /> and{' '}
          <SpellLink id={SPELLS.WILD_GROWTH.id} /> during this window while filling the remaining
          gcds with <SpellLink id={SPELLS.REJUVENATION.id} />.
        </>,
      )
        .icon(SPELLS.INNERVATE.icon)
        .actual(
          `${formatNumber(this.manaSavedPerInnervate)} ${t({
            id: 'druid.resto.suggestions.innervate.avgManaSaved',
            message: `average mana saved per Innervate cast`,
          })}`,
        )
        .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.INNERVATE.id} /> Average mana saved
            </>
          }
        >
          <>{formatNumber(this.manaSavedPerInnervate)}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

interface InnervateCast {
  /** Timestamp of the start of the Tranquility channel */
  timestamp: number;
  /** The spells the player cast during Innervate, in order */
  casts: CastEvent[];
  /** The mana saved by the player */
  manaSaved: number;
  /** ID of the player this Innervate was cast on, or undefined for a self cast */
  targetId?: number;
}

export default Innervate;
