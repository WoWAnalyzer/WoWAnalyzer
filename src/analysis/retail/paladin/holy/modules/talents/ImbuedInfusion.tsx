import { defineMessage, Trans } from '@lingui/macro';
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
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

// its one point right now but I already had this so w/e
const COOLDOWN_REDUCTION_MS_PER_POINT = 1000;

class ImbuedInfusion extends Analyzer {
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
      this.selectedCombatant.getTalentRank(TALENTS.IMBUED_INFUSIONS_TALENT) *
      COOLDOWN_REDUCTION_MS_PER_POINT;
    this.active = this.talentedCooldownReductionMs > 0;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FLASH_OF_LIGHT, SPELLS.HOLY_LIGHT, SPELLS.JUDGMENT_CAST_HOLY]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.INFUSION_OF_LIGHT.id)) {
      return;
    }

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
      addInefficientCastReason(
        event,
        <Trans id="paladin.holy.modules.talents.imbuedInfusion.inefficientCast">
          Holy Shock was off cooldown when you consumed Infusion of Light. You should cast Holy
          Shock before Crusader Strike for maximum healing or damage.
        </Trans>,
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
          <Trans id="paladin.holy.modules.talents.imbuedinfusion.suggestion">
            You consumed <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} />{' '}
            {this.wastedHolyShockReductionCount} times when{' '}
            <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> was off cooldown.{' '}
            <SpellLink spell={TALENTS.IMBUED_INFUSIONS_TALENT} /> should be used to reduce the
            cooldown of <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> and should never be consumed
            when <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> is available.
            <a
              href="https://questionablyepic.com/glimmer-of-light/"
              target="_blank"
              rel="noopener noreferrer"
            >
              build.
            </a>
          </Trans>
        </>,
      )
        .icon(TALENTS.HOLY_SHOCK_TALENT.icon)
        .actual(
          defineMessage({
            id: 'paladin.holy.modules.talents.imbuedinfusion.actual',

            message: `${Math.floor(this.holyShocksCastsLost)} Holy Shock cast${
              Math.floor(this.holyShocksCastsLost) === 1 ? '' : 's'
            } missed.`,
          }),
        )
        .recommended(
          defineMessage({
            id: 'paladin.holy.modules.talents.imbuedinfusion.recommended',
            message: `Casting Holy Shock on cooldown is recommended.`,
          }),
        ),
    );
  }

  statistic() {
    const formatSeconds = (seconds: string) => (
      <Trans id="paladin.holy.modules.talents.imbuedinfusion.formatSeconds">{seconds}s</Trans>
    );

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(75)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <Trans id="paladin.holy.modules.talents.imbuedinfusion.tooltip">
              You consumed Infusion of Light <b>{this.wastedHolyShockReductionCount}</b> time
              {this.wastedHolyShockReductionCount === 1 ? '' : 's'} when Holy Shock was off
              cooldown.
              <br />
              This wasted <b>{(this.wastedHolyShockReductionMs / 1000).toFixed(1)}</b> seconds of
              Holy Shock cooldown reduction,
              <br />
              preventing you from <b>{Math.floor(this.holyShocksCastsLost)}</b> additional Holy
              Shock cast{this.holyShocksCastsLost === 1 ? '' : 's'}.<br />
            </Trans>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.IMBUED_INFUSIONS_TALENT}>
          <>
            {formatSeconds((this.effectiveHolyShockReductionMs / 1000).toFixed(1))}{' '}
            <SpellIcon
              spell={TALENTS.HOLY_SHOCK_TALENT}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ImbuedInfusion;
