import { defineMessage, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import Statistic from 'parser/ui/Statistic';
import { CRUSADERS_MIGHT_REDUCTION } from '../../constants';

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
      CRUSADERS_MIGHT_REDUCTION;
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
      addInefficientCastReason(
        event,
        defineMessage({
          id: 'paladin.holy.modules.talents.crusadersMight.inefficientCast',
          message:
            'Holy Shock was off cooldown when you cast Crusader Strike. You should cast Holy Shock before Crusader Strike for maximum healing or damage.',
        }),
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

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(75)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <Trans id="paladin.holy.modules.talents.crusadersMight.tooltip">
              You cast Crusader Strike <b>{this.wastedHolyShockReductionCount}</b> time
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
        <TalentSpellText talent={TALENTS.CRUSADERS_MIGHT_TALENT}>
          <div>
            <SpellIcon spell={TALENTS.HOLY_SHOCK_TALENT} />{' '}
            <ItemCooldownReduction
              effective={this.effectiveHolyShockReductionMs}
              waste={this.wastedHolyShockReductionMs}
            />
          </div>
          {Math.floor(this.holyShocksCastsLost)}{' '}
          <small>
            additional <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> casts lost
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CrusadersMight;
