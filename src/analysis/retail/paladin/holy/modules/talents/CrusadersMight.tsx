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
import { formatDuration } from 'common/format';

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
  effectiveReductionMs = 0;
  wastedReductionMs = 0;
  castsLost = 0;
  wastedHolyShockCDRCount = 0;
  wastedCrusaderStrikeCDRCount = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_MIGHT_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.CRUSADER_STRIKE, TALENTS.HOLY_SHOCK_TALENT]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const effectiveCdr = this.spellUsable.reduceCooldown(
      SPELLS.JUDGMENT_CAST_HOLY.id,
      CRUSADERS_MIGHT_REDUCTION,
    );
    const wastedCdr = CRUSADERS_MIGHT_REDUCTION - effectiveCdr;

    this.effectiveReductionMs += effectiveCdr;
    this.wastedReductionMs += wastedCdr;

    if (effectiveCdr === 0) {
      if (event.ability.guid === TALENTS.HOLY_SHOCK_TALENT.id) {
        this.wastedHolyShockCDRCount += 1;
      } else if (event.ability.guid === SPELLS.CRUSADER_STRIKE.id) {
        this.wastedCrusaderStrikeCDRCount += 1;
      }
      const timeWasted =
        CRUSADERS_MIGHT_REDUCTION +
        this.globalCooldown.getGlobalCooldownDuration(event.ability.guid);
      const judgmentCd = this.spellUsable.fullCooldownDuration(SPELLS.JUDGMENT_CAST_HOLY.id);
      this.castsLost += timeWasted / judgmentCd;

      addInefficientCastReason(
        event,
        <>
          You cast <SpellLink spell={event.ability.guid} /> while{' '}
          <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> was available, losing cooldown reduction
          from <SpellLink spell={TALENTS.CRUSADERS_MIGHT_TALENT} />.
        </>,
      );
    }
  }

  get wastedCDRCount() {
    return this.wastedHolyShockCDRCount + this.wastedCrusaderStrikeCDRCount;
  }

  get holyShocksMissedThresholds() {
    return {
      actual: this.wastedCDRCount,
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
            <ul>
              <li>
                Wasted <b>{formatDuration(this.wastedReductionMs)}</b> of CDR
              </li>
              <li>
                {Math.floor(this.castsLost)} additional casts lost from:{' '}
                <ul>
                  <li>
                    <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} />: {this.wastedHolyShockCDRCount}{' '}
                    casts with <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> available
                  </li>
                  <li>
                    <SpellLink spell={SPELLS.CRUSADER_STRIKE} />:{' '}
                    {this.wastedCrusaderStrikeCDRCount} casts with{' '}
                    <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> available
                  </li>
                </ul>
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.CRUSADERS_MIGHT_TALENT}>
          <div>
            <SpellIcon spell={SPELLS.JUDGMENT_CAST_HOLY} />{' '}
            <ItemCooldownReduction effective={this.effectiveReductionMs} />
          </div>
          {Math.floor(this.castsLost)}{' '}
          <small>
            additional <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> casts lost
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CrusadersMight;
