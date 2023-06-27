import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const COOLDOWN_REDUCTION_MS_PER_POINT = 1000;

class CrusadersMight extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    statTracker: StatTracker,
    globalCooldown: GlobalCooldown,
  };

  protected spellUsable!: SpellUsable;
  protected statTracker!: StatTracker;
  protected globalCooldown!: GlobalCooldown;

  talentedCooldownReductionMs = 0;
  effectiveHolyShockReductionMs = 0;
  wastedHolyShockReductionMs = 0;
  wastedHolyShockReductionCount = 0;
  holyShocksCastsLost = 0;

  constructor(options: Options) {
    super(options);
    this.talentedCooldownReductionMs =
      this.selectedCombatant.getTalentRank(TALENTS.CRUSADERS_MIGHT_TALENT) *
      COOLDOWN_REDUCTION_MS_PER_POINT;
    this.active = this.talentedCooldownReductionMs > 0;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const effectiveCdr = this.spellUsable.reduceCooldown(
      TALENTS.HOLY_SHOCK_TALENT.id,
      this.talentedCooldownReductionMs,
    );
    const wastedCdr = this.talentedCooldownReductionMs - effectiveCdr;

    this.effectiveHolyShockReductionMs += effectiveCdr;
    this.wastedHolyShockReductionMs += wastedCdr;

    if (effectiveCdr === 0) {
      this.wastedHolyShockReductionCount += 1;
      const timeWasted =
        this.talentedCooldownReductionMs +
        this.globalCooldown.getGlobalCooldownDuration(SPELLS.CRUSADER_STRIKE.id);
      const holyShockCooldown = this.spellUsable.fullCooldownDuration(TALENTS.HOLY_SHOCK_TALENT.id);
      this.holyShocksCastsLost += timeWasted / holyShockCooldown;

      // mark the event on the timeline
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = (
        <>
          Holy Shock was off cooldown when you cast Crusader Strike. You should cast Holy Shock
          before Crusader Strike for maximum healing or damage.
        </>
      );
    }
  }

  get holyShocksMissedThresholds() {
    return {
      actual: this.wastedHolyShockReductionCount,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.holyShocksMissedThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          <>
            You cast <SpellLink id={SPELLS.CRUSADER_STRIKE} /> {this.wastedHolyShockReductionCount}{' '}
            times when
            <SpellLink id={TALENTS.HOLY_SHOCK_TALENT} /> was off cooldown.{' '}
            <SpellLink id={SPELLS.CRUSADER_STRIKE} /> should be used to reduce the cooldown of
            <SpellLink id={TALENTS.HOLY_SHOCK_TALENT} /> and should never be cast when{' '}
            <SpellLink id={TALENTS.HOLY_SHOCK_TALENT} /> is avalible. This is a core component of
            the <SpellLink id={TALENTS.GLIMMER_OF_LIGHT_TALENT} />{' '}
            <a
              href="https://questionablyepic.com/glimmer-of-light/"
              target="_blank"
              rel="noopener noreferrer"
            >
              build.
            </a>
          </>
        </>,
      )
        .icon(TALENTS.HOLY_SHOCK_TALENT.icon)
        .actual(
          `${Math.floor(this.holyShocksCastsLost)} Holy Shock cast${
            Math.floor(this.holyShocksCastsLost) === 1 ? '' : 's'
          } missed.`,
        )
        .recommended(`Casting Holy Shock on cooldown is recommended.`),
    );
  }

  statistic() {
    const formatSeconds = (seconds: string) => <>{seconds}s</>;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(75)}
        icon={<SpellIcon id={TALENTS.CRUSADERS_MIGHT_TALENT} />}
        value={
          <>
            {formatSeconds((this.effectiveHolyShockReductionMs / 1000).toFixed(1))}{' '}
            <SpellIcon
              id={TALENTS.HOLY_SHOCK_TALENT}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />{' '}
          </>
        }
        label={<>Cooldown reduction</>}
        tooltip={
          <>
            <>
              You cast Crusader Strike <b>{this.wastedHolyShockReductionCount}</b> time
              {this.wastedHolyShockReductionCount === 1 ? '' : 's'} when Holy Shock was off
              cooldown.
              <br />
              This wasted <b>{(this.wastedHolyShockReductionMs / 1000).toFixed(1)}</b> seconds of
              Holy Shock cooldown reduction,
              <br />
              preventing you from <b>{Math.floor(this.holyShocksCastsLost)}</b> additional Holy
              Shock cast{this.holyShocksCastsLost === 1 ? '' : 's'}.<br />
            </>
          </>
        }
      />
    );
  }
}

export default CrusadersMight;
