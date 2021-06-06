import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';
import { Attribution } from 'parser/shared/modules/HotTracker';
import HotTrackerRestoDruid from '../core/hottracking/HotTrackerRestoDruid';
import { REJUVENATION_BUFFS } from '../../constants';
import ConvokeSpiritsResto from '../shadowlands/covenants/ConvokeSpiritsResto';

const REGROWTH_HEALING_INCREASE = 2;
const REJUVENATION_HEALING_INCREASE = 2;
const WILD_GROWTH_HEALING_INCREASE = 0.75;

const BUFFER_MS = 100;

/**
 * **Soul of the Forest**
 * Talent - Level 40
 *
 * Swiftmend increases the healing of your next Regrowth or Rejuvenation by 200%,
 * or your next Wild Growth by 75%.
 */
class SoulOfTheForest extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    convokeSpirits: ConvokeSpiritsResto,
  };

  hotTracker!: HotTrackerRestoDruid;
  convokeSpirits!: ConvokeSpiritsResto;

  rejuvAtt: Attribution = HotTrackerRestoDruid.getNewAttribution('SotF Rejuvenation');
  regrowthAtt: Attribution = HotTrackerRestoDruid.getNewAttribution('SotF Regrowth');
  wgAtt: Attribution = HotTrackerRestoDruid.getNewAttribution('SotF Wild Growth');

  /** True iff a SotF buff has been applied and we haven't yet tallied a consume */
  sotfPending: boolean = false;
  /** Timestamp of the most recent WG application benefitting from SotF - used to match to other target applications from same spell */
  sotfWgTimestamp?: number;
  /** Timestamp of the most recent Regrowth application or direct heal benefitting from SotF - used to boost both direct and HoT */
  sotfRegrowthTimestamp?: number;
  /** Number of SotF consumed by a Rejuv HARDCAST (Convoke not counted) */
  rejuvHardcastUses: number = 0;
  /** Number of SotF consumed by a Regrowth HARDCAST (Convoke not counted) */
  regrowthHardcastUses: number = 0;
  /** Number of SotF consumed by a Wild Growth HARDCAST (Convoke not counted) */
  wgHardcastUses: number = 0;
  /** Number of SotF consumed by a Rejuv */
  rejuvTotalUses: number = 0;
  /** Number of SotF consumed by a Regrowth */
  regrowthTotalUses: number = 0;
  /** Number of SotF consumed by a Wild Growth (per spell not per HoT) */
  wgTotalUses: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF),
      this.onSotfApply,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onRejuvApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onRejuvApply,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onWgApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onWgApply,
    );
  }

  onSotfApply(event: ApplyBuffEvent) {
    this.sotfPending = true;
  }

  onRejuvApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!this.sotfPending) {
      return;
    }
    this.sotfPending = false;
    this.rejuvTotalUses += 1;
    if (!this.convokeSpirits.isConvoking()) {
      this.rejuvHardcastUses += 1;
    }
    this.hotTracker.addBoostFromApply(this.rejuvAtt, REJUVENATION_HEALING_INCREASE, event);
  }

  onRegrowthApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const sameSpell =
      this.sotfRegrowthTimestamp && this.sotfRegrowthTimestamp + BUFFER_MS >= event.timestamp;
    if (!this.sotfPending && !sameSpell) {
      return;
    }
    this.sotfPending = false;
    if (!sameSpell) {
      this.sotfRegrowthTimestamp = event.timestamp;
      this.regrowthTotalUses += 1;
      if (!this.convokeSpirits.isConvoking()) {
        this.regrowthHardcastUses += 1;
      }
    }
    this.hotTracker.addBoostFromApply(this.regrowthAtt, REGROWTH_HEALING_INCREASE, event);
  }

  onRegrowthHeal(event: HealEvent) {
    const sameSpell =
      this.sotfRegrowthTimestamp && this.sotfRegrowthTimestamp + BUFFER_MS >= event.timestamp;
    if (!this.sotfPending && !sameSpell) {
      return;
    }
    if (!sameSpell) {
      this.sotfRegrowthTimestamp = event.timestamp;
      this.regrowthTotalUses += 1;
      if (!this.convokeSpirits.isConvoking()) {
        this.regrowthHardcastUses += 1;
      }
    }
    this.sotfPending = false;
    this.regrowthAtt.healing += calculateEffectiveHealing(event, REGROWTH_HEALING_INCREASE);
  }

  onWgApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const sameSpell = this.sotfWgTimestamp && this.sotfWgTimestamp + BUFFER_MS >= event.timestamp;
    if (!this.sotfPending && !sameSpell) {
      return;
    }
    this.sotfPending = false;
    if (!sameSpell) {
      this.sotfWgTimestamp = event.timestamp;
      this.wgTotalUses += 1;
      if (!this.convokeSpirits.isConvoking()) {
        this.wgTotalUses += 1;
      }
    }
    this.hotTracker.addBoostFromApply(this.wgAtt, WILD_GROWTH_HEALING_INCREASE, event);
  }

  get totalUses() {
    return this.wgTotalUses + this.regrowthTotalUses + this.rejuvTotalUses;
  }

  get totalHardcastUses() {
    return this.wgHardcastUses + this.regrowthHardcastUses + this.rejuvHardcastUses;
  }

  get rejuvConvokeUses() {
    return this.rejuvTotalUses - this.rejuvHardcastUses;
  }

  get regrowthConvokeUses() {
    return this.regrowthTotalUses - this.regrowthHardcastUses;
  }

  get wgConvokeUses() {
    return this.wgTotalUses - this.wgHardcastUses;
  }

  /** Percent of hardcast consumes that were with WG - for suggest */
  get wgUsagePercent() {
    return this.wgHardcastUses / this.totalHardcastUses;
  }

  get totalHealing() {
    return this.wgAtt.healing + this.regrowthAtt.healing + this.rejuvAtt.healing;
  }

  get suggestionThresholds() {
    return {
      actual: this.wgUsagePercent,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // TODO update
  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You did not consume all of your{' '}
          <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> buffs with{' '}
          <SpellLink id={SPELLS.WILD_GROWTH.id} />. Try to use{' '}
          <SpellLink id={SPELLS.WILD_GROWTH.id} /> every time you get a{' '}
          <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> buff.
          {this.convokeSpirits.active &&
            ` This stat considers only the buffs consumed by hardcasts (it does not consider buffs consumed during Convoke)`}
        </>,
      )
        .icon(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.soulOfTheForest.efficiency',
            message: `Wild growth consumed ${formatPercentage(
              this.wgUsagePercent,
              1,
            )}% of the buffs.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  _spellReportLine(totalUses: number, hardcastUses: number, healing: number): React.ReactNode {
    return this.convokeSpirits.active ? (
      <>
        {' '}consumed <strong>{hardcastUses}</strong> hardcast /{' '}
        <strong>{totalUses - hardcastUses}</strong> convoke :{' '}
        <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing), 1)}%</strong>{' '}
        healing
      </>
    ) : (
      <>
        {' '}consumed <strong>{totalUses}</strong> procs :{' '}
        <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing), 1)}%</strong>{' '}
        healing
      </>
    );
  }

  // TODO update
  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(40)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You used <strong>{this.totalUses}</strong> Soul of the Forest procs.
            <ul>
              <li>
                <SpellLink id={SPELLS.REJUVENATION.id} />
                {this._spellReportLine(
                  this.rejuvTotalUses,
                  this.rejuvHardcastUses,
                  this.rejuvAtt.healing,
                )}
              </li>
              <li>
                <SpellLink id={SPELLS.REGROWTH.id} />
                {this._spellReportLine(
                  this.regrowthTotalUses,
                  this.regrowthHardcastUses,
                  this.regrowthAtt.healing,
                )}
              </li>
              <li>
                <SpellLink id={SPELLS.WILD_GROWTH.id} />
                {this._spellReportLine(this.wgTotalUses, this.wgHardcastUses, this.wgAtt.healing)}
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulOfTheForest;
