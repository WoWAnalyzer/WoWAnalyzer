import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, {
  AbsorbedEvent,
  ApplyDebuffEvent,
  DamageEvent,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { SHATTERED_PERCEPTIONS_INCREASE } from '../../../../constants';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../../core/AtonementAnalyzer';
import ShatteredPerceptionsGraph from './ShatteredPerceptionsGraph';

const MIND_GAMES_DURATION = 5000;

interface Timestamped {
  timestamp: number;
}

const isWithinDuration = (duration: number) =>
  function withinDuration<T extends Timestamped, U extends Timestamped>(evt1: T, evt2: U) {
    return evt1.timestamp - duration <= evt2.timestamp;
  };

const isWithinMindgamesDuration = isWithinDuration(MIND_GAMES_DURATION);

class ShatteredPerceptions extends Analyzer {
  private conduitRank: number = 0;
  conduitIncrease: number = 0;

  // General Statistics
  bonusAtoneHealing: number = 0;
  bonusHealing: number = 0;
  bonusAbsorb: number = 0;
  bonusDamage: number = 0;

  // Extension Statistics
  extensionBonusDamage: number = 0;
  extensionBonusHealing: number = 0;
  private lastApplication?: ApplyDebuffEvent;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SHATTERED_PERCEPTIONS.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.conduitIncrease = SHATTERED_PERCEPTIONS_INCREASE[this.conduitRank];

    /**
     * Debuff Listeners
     */
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES),
      this.handleDebuffApplication,
    );

    /**
     * Healing Listeners
     */
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES_HEAL),
      this.handleHeal,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES_ABSORB),
      this.handleAbsorb,
    );

    /**
     * Damage Listeners
     */
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES),
      this.handleBonusDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES_REVERSAL),
      this.handleBonusReversal,
    );
  }

  /**
   * Handles the bonus from the Mindgames cast
   * @param event The damage event from a Mindgames cast
   */
  handleBonusDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, this.conduitIncrease);
  }

  /**
   * Handles the bonus damage from the Mindgames healing reversal
   * @param event The damage event from a Mindgames healing reversal
   */
  handleBonusReversal(event: DamageEvent) {
    if (!this.lastApplication) {
      return;
    }

    if (isWithinMindgamesDuration(event, this.lastApplication)) {
      this.bonusDamage += calculateEffectiveDamage(event, this.conduitIncrease);
    } else {
      this.bonusDamage += event.amount + (event.absorbed || 0);
      this.extensionBonusDamage += event.amount + (event.absorbed || 0);
    }
  }

  /**
   * Keeps track of the previous cast of Mindgames so that the value of the
   * duration extension from Shattered Perceptions can be calculated
   * @param event The debuff application event for Mindgames
   */
  handleDebuffApplication(event: ApplyDebuffEvent) {
    this.lastApplication = event;
  }

  /**
   * Handles the Spirit Shell + Atonement healing of Mindgames
   * @param event An event emitted by the Atonement analysis module
   */
  handleAtone(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;

    if (!damageEvent) {
      return;
    }

    if (
      damageEvent.ability.guid !== SPELLS.MINDGAMES.id &&
      damageEvent.ability.guid !== SPELLS.MINDGAMES_REVERSAL.id
    ) {
      return;
    }

    // Atone healing from the initial Mindgames cast
    if (damageEvent.ability.guid === SPELLS.MINDGAMES.id) {
      this.bonusAtoneHealing += calculateEffectiveHealing(healEvent, this.conduitIncrease);
      return;
    }

    // Precast Mindgames?
    if (!this.lastApplication) {
      return;
    }

    // Atone healing from the heal reversal damage portion
    if (isWithinMindgamesDuration(event, this.lastApplication)) {
      this.bonusAtoneHealing += calculateEffectiveHealing(healEvent, this.conduitIncrease);
    } else {
      this.extensionBonusHealing += healEvent.amount;
      this.bonusAtoneHealing += healEvent.amount;
    }
  }

  /**
   * Handles the healing from the reversal portion of Mindgames
   * @param event
   */
  handleHeal(event: HealEvent) {
    if (!this.lastApplication) {
      return;
    }

    if (isWithinMindgamesDuration(event, this.lastApplication)) {
      this.bonusHealing += calculateEffectiveHealing(event, this.conduitIncrease);
    } else {
      this.extensionBonusHealing += event.amount + (event.absorbed || 0);
      this.bonusHealing += event.amount + (event.absorbed || 0);
    }
  }

  /**
   * Handles the absorb from the reversal portion of Mindgames
   * @param event
   */
  handleAbsorb(event: AbsorbedEvent) {
    if (!this.lastApplication) {
      return;
    }

    if (isWithinMindgamesDuration(event, this.lastApplication)) {
      this.bonusAbsorb += calculateEffectiveHealing(event, this.conduitIncrease);
    } else {
      this.extensionBonusHealing += event.amount;
      this.bonusAbsorb += event.amount;
    }
  }

  get bonusHealingTotal(): number {
    return this.bonusAtoneHealing + this.bonusAbsorb + this.bonusHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip="Shows the contribution given by Shattered Perceptions, if no graph shows you got no benefit from the duration extension portion of Shattered Perceptions"
      >
        <ConduitSpellText spell={SPELLS.SHATTERED_PERCEPTIONS} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusHealingTotal} />
          </>
        </ConduitSpellText>

        <ShatteredPerceptionsGraph
          bonusHealing={this.bonusHealingTotal - this.extensionBonusHealing}
          durationBonusHealing={this.extensionBonusHealing}
          bonusDamage={this.bonusDamage - this.extensionBonusDamage}
          durationBonusDamage={this.extensionBonusDamage}
        />
      </Statistic>
    );
  }
}

export default ShatteredPerceptions;
