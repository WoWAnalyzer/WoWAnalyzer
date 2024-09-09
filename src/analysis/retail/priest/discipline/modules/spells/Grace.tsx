import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import PRIEST_SPELLS from 'common/SPELLS/priest';
import { default as PRIEST_TALENTS } from 'common/TALENTS/priest';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { AbsorbedEvent, ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import StatisticBox from 'parser/ui/StatisticBox';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import isAtonement from '../core/isAtonement';

// Use the priest spell list to whitelist abilities
const PRIEST_WHITELIST: number[] = Object.values({
  ...PRIEST_SPELLS,
  ...PRIEST_TALENTS,
}).map((ability) => ability.id);

class Grace extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };
  applyAbsorbEvents: Array<{
    applyBuffEvent: ApplyBuffEvent;
    masteryBuffed: boolean;
    eventsAssociated: ApplyBuffEvent[];
  }> = [];
  graceHealing = 0;
  graceHealingToAtonement = 0;
  healingUnaffectedByMastery = 0;
  healingUnbuffedByMastery = 0;
  healingBuffedByMastery = 0;
  atonement = 0;
  private combatants!: Combatants;
  private statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorb);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
  }

  getGraceHealing(event: HealEvent | AbsorbedEvent) {
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const masteryContribution = calculateEffectiveHealing(event, currentMastery);
    return masteryContribution;
  }

  onAbsorb(event: AbsorbedEvent) {
    const spellId = event.ability.guid;

    if (event.ability.guid === SPELLS.SPIRIT_SHELL_TALENT_BUFF.id) {
      return;
    }

    if (!PRIEST_WHITELIST.includes(spellId)) {
      this.healingUnaffectedByMastery += event.amount;
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    if (this.absorbApplicationWasMasteryBuffed(event)) {
      this.graceHealing += this.getGraceHealing(event);
      this.healingBuffedByMastery += event.amount;
    } else {
      this.healingUnbuffedByMastery += event.amount;
    }
  }

  absorbApplicationWasMasteryBuffed(event: AbsorbedEvent) {
    const findRight = (arr: any, fn: any) => [...arr].reverse().find(fn);
    const applyEvent = findRight(
      this.applyAbsorbEvents,
      (x: any) =>
        x.applyBuffEvent.targetID === event.targetID &&
        x.applyBuffEvent.ability.guid === event.ability.guid,
    );
    return applyEvent ? applyEvent.masteryBuffed : false;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;

    if (!(PRIEST_WHITELIST.includes(spellId) && event.absorb)) {
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    this.applyAbsorbEvents.push({
      applyBuffEvent: event,
      masteryBuffed: target.hasBuff(SPELLS.ATONEMENT_BUFF.id),
      eventsAssociated: [],
    });
  }

  onHeal(event: HealEvent) {
    if (isAtonement(event)) {
      return;
    } // Now handled by AtonementAnalyzer listener

    const spellId = event.ability.guid;

    if (!PRIEST_WHITELIST.includes(spellId)) {
      this.healingUnaffectedByMastery += event.amount;
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    if (!target.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      this.healingUnbuffedByMastery += event.amount;
      return;
    }

    this.healingBuffedByMastery += event.amount;
    this.graceHealing += this.getGraceHealing(event);
  }

  onAtone(event: AtonementAnalyzerEvent) {
    const { healEvent } = event;

    this.atonement += healEvent.amount;
    this.graceHealingToAtonement += this.getGraceHealing(healEvent);
    this.healingBuffedByMastery += healEvent.amount;
    this.graceHealing += this.getGraceHealing(healEvent);
  }

  statistic() {
    const graceHealingPerc = this.owner.getPercentageOfTotalHealingDone(this.graceHealing);
    const healingUnaffectedByMasteryPerc = this.owner.getPercentageOfTotalHealingDone(
      this.healingUnaffectedByMastery,
    );
    const healingUnbuffedByMasteryPerc = this.owner.getPercentageOfTotalHealingDone(
      this.healingUnbuffedByMastery,
    );
    const healingBuffedByMasteryPerc = this.owner.getPercentageOfTotalHealingDone(
      this.healingBuffedByMastery - this.graceHealing,
    );
    const atonementPerc = this.owner.getPercentageOfTotalHealingDone(
      this.atonement - this.graceHealingToAtonement,
    );
    const nonAtonementPerc = this.owner.getPercentageOfTotalHealingDone(
      this.healingBuffedByMastery -
        this.graceHealing -
        (this.atonement - this.graceHealingToAtonement),
    );

    return (
      <StatisticBox
        icon={<SpellIcon spell={SPELLS.GRACE} />}
        value={`${formatNumber((this.graceHealing / this.owner.fightDuration) * 1000)} HPS`}
        label="Mastery Healing"
        tooltip={
          <>
            Your mastery provided <strong>{formatPercentage(graceHealingPerc)}%</strong> healing
            <ul>
              <li>
                <strong>{formatPercentage(healingBuffedByMasteryPerc)}%</strong> of your healing was
                buffed by mastery
                <ul>
                  <li>
                    Atonement: <strong>{formatPercentage(atonementPerc)}%</strong>
                  </li>
                  <li>
                    Non-Atonement: <strong>{formatPercentage(nonAtonementPerc)}%</strong>
                  </li>
                </ul>
              </li>
              <li>
                <strong>{formatPercentage(healingUnbuffedByMasteryPerc)}%</strong> of your healing
                was spells unbuffed by mastery
              </li>
              <li>
                <strong>{formatPercentage(healingUnaffectedByMasteryPerc)}%</strong> of your healing
                was spells unaffected by mastery
              </li>
            </ul>
            <br />
            <strong>Unbuffed</strong> healing is healing done to targets without atonement with
            spells that can benefit from mastery. <br />
            <strong>Unaffected</strong> healing is healing done with spells that can't benefit from
            mastery (Trinkets, procs, etc...)
          </>
        }
      />
    );
  }
}

export default Grace;
