import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Tracker } from 'parser/shared/modules/HotTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import HotTrackerMW from '../core/HotTrackerMW';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { BASE_EF_BOLTS } from '../../constants';

/**
 * Upwelling is a talent that increases essence font's hot by 4 seconds and for every second off cooldown up to 18 seconds it provides an extra bolt for the next ef cast
 * NOTE the buff this provides for extra bolts is invisible so we get to do some ugly coding
 * Things to Track
 * Extra bolts from Upwelling
 * Extra hot time from NON-upwelling bolts
 * Total hot time from upwelling bolts
 */
class Upwelling extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  totalAbsorbs: number = 0;
  castEF: number = 0; //casts of ef
  extraHots: number = 0; //number of extra hots
  extraBolts: number = 0; //number of extra bolts
  efHotHeal: number = 0; //healing from hots
  efHotOverheal: number = 0; //overhealing from hots
  flsHotHeal: number = 0; // extra healing from fls hots
  flsHotOverheal: number = 0; //overhealing from fls hots
  boltCount: number = 0;
  totalBolts: number = 0;
  fromExtraBolts: Set<number> = new Set(); //tracking people with EF hot from extra bolt
  masteryTickTock: boolean = false;
  masteryHit: number = 0;
  masteryHealing: number = 0;
  masteryOverhealing: number = 0;
  masteryAbsorbed: number = 0;
  baseEfHealing: number = 0; // count healing from base ef and then subtract it out at end to account for missing ef casts
  protected hotTracker!: HotTrackerMW;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.efHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_ESSENCE_FONT),
      this.efHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.efcast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.applyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.removeBuff,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.GUST_OF_MISTS_CHIJI, SPELLS.GUSTS_OF_MISTS]),
      this.handleMastery,
    );
  }

  get averageStacks() {
    return this.extraBolts / this.castEF;
  }

  get lostEfHealing() {
    const lostBolts = this.averageStacks / 2; // you lose .5 bolts a second
    return this.baseEfHealing * (lostBolts / BASE_EF_BOLTS);
  }

  get totalHealingAll() {
    return (
      this.totalHealing +
      this.totalAbsorbs +
      this.efHotHeal +
      this.masteryHealing +
      this.masteryAbsorbed -
      this.lostEfHealing
    );
  }

  get overhealingBolt() {
    return this.totalOverhealing / (this.totalOverhealing + this.totalHealing);
  }

  get overhealingHot() {
    return this.efHotOverheal / (this.efHotHeal + this.efHotOverheal);
  }

  get overhealingMastery() {
    return (
      this.masteryOverhealing /
      (this.masteryHealing + this.masteryOverhealing + this.masteryAbsorbed)
    );
  }

  efHeal(event: HealEvent) {
    if (event.tick) {
      this.hotHeal(event);
    } else {
      this.boltHeal(event);
    }
  }

  fromExtraDuration(event: HealEvent, hot: Tracker) {
    if (!hot) {
      return false;
    }
    // ef hot duration is normally 8 seconds and upwelling adds 4, so 8/(8+4) = 2/3
    const expectedBaseEnd = Math.floor((hot.originalEnd - hot.start) * (2 / 3) + hot.start);
    return event.timestamp > expectedBaseEnd && event.timestamp < hot.originalEnd;
  }

  hotHeal(event: HealEvent) {
    const targetID = event.targetID; //short hand
    const spellID = event.ability.guid;
    if (
      !this.hotTracker.hots[targetID] ||
      (!this.hotTracker.hots[targetID][SPELLS.ESSENCE_FONT_BUFF.id] &&
        !this.hotTracker.hots[targetID][SPELLS.FAELINE_STOMP_ESSENCE_FONT.id])
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetID][spellID];
    if (
      (spellID === SPELLS.ESSENCE_FONT_BUFF.id && this.fromExtraBolts.has(targetID)) ||
      this.fromExtraDuration(event, hot)
    ) {
      //check if its an extra bolt from ef or was part of the core 18
      this.efHotHeal += (event.amount || 0) + (event.absorbed || 0);
      this.efHotOverheal += event.overheal || 0;
    } else {
      this.baseEfHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  boltHeal(event: HealEvent) {
    const targetID = event.targetID; //short hand
    if (event.ability.guid !== SPELLS.ESSENCE_FONT_BUFF.id) {
      return;
    }
    this.totalBolts += 1; //told number of bolts
    if (this.boltCount + 1 > BASE_EF_BOLTS) {
      //only get bolts that are from upwelling
      this.totalHealing += event.amount || 0;
      this.totalOverhealing += event.overheal || 0;
      this.totalAbsorbs += event.absorbed || 0;
      this.extraBolts += 1;
      this.fromExtraBolts.add(targetID);
    } else {
      this.baseEfHealing += (event.amount || 0) + (event.absorbed || 0);
    }
    this.boltCount += 1; //increase current bolt
  }

  efcast(event: CastEvent) {
    this.castEF += 1;
    this.boltCount = 0;
    this.fromExtraBolts.clear();
  }

  applyBuff(event: ApplyBuffEvent) {
    if (this.boltCount + 1 > BASE_EF_BOLTS) {
      //Hots from extra bolts
      this.extraHots += 1;
    }
  }

  removeBuff(event: RemoveBuffEvent) {
    this.fromExtraBolts.delete(event.targetID);
  }

  handleMastery(event: HealEvent) {
    const targetID = event.targetID; //short hand

    if (
      !this.hotTracker.hots[targetID] ||
      (!this.hotTracker.hots[targetID][SPELLS.ESSENCE_FONT_BUFF.id] &&
        !this.hotTracker.hots[targetID][SPELLS.FAELINE_STOMP_ESSENCE_FONT.id])
    ) {
      return;
    }

    const efHot = this.hotTracker.hots[targetID][SPELLS.ESSENCE_FONT_BUFF.id];
    const flsHot = this.hotTracker.hots[targetID][SPELLS.FAELINE_STOMP_ESSENCE_FONT.id];

    //do they have the hot
    const fromExtraDuration =
      this.fromExtraDuration(event, efHot) || this.fromExtraDuration(event, flsHot);
    if (this.fromExtraBolts.has(targetID) || fromExtraDuration) {
      if (!this.masteryTickTock) {
        this.masteryHit += 1;
        this.masteryHealing += event.amount || 0;
        this.masteryOverhealing += event.overheal || 0;
        this.masteryAbsorbed += event.absorbed || 0;
      }
    } else if ((efHot || flsHot) && !this.fromExtraBolts.has(targetID) && !fromExtraDuration) {
      // base ef mastery event
      if (!this.masteryTickTock) {
        this.baseEfHealing += event.amount + (event.absorbed || 0);
      }
    }
    this.masteryTickTock = !this.masteryTickTock;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.UPWELLING_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealingAll),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              Counts healing from extra bolts, healing from the extra 4 second of a hot on a normal
              bolt (first 18), healing from the full hot on{' '}
              <SpellLink spell={TALENTS_MONK.UPWELLING_TALENT} /> bolts (post 18), and any mastery
              event from the hot under the same idea as hot counting. We then subtract out the
              healing from estimated missed casts of{' '}
              <SpellLink spell={TALENTS_MONK.ESSENCE_FONT_TALENT} /> to account for less casts from
              utilizing <SpellLink spell={TALENTS_MONK.UPWELLING_TALENT} /> stacks.
            </div>
            <ul>
              <li>Extra Bolts: {formatNumber(this.extraBolts)}</li>
              <li>
                Extra Bolts Healing: {formatNumber(this.totalHealing)} (
                {formatPercentage(this.overhealingBolt)}% overhealing)
              </li>
              <li>Extra Hots: {formatNumber(this.extraHots)}</li>
              <li>
                Hots Healing: {formatNumber(this.efHotHeal)} (
                {formatPercentage(this.overhealingHot)}% overhealing)
              </li>
              <li>Extra Mastery Hits: {formatNumber(this.masteryHit)}</li>
              <li>
                Extra Mastery Healing: {formatNumber(this.masteryHealing)} (
                {formatPercentage(this.overhealingMastery)}% overhealing)
              </li>
              <li>
                Average <SpellLink spell={TALENTS_MONK.UPWELLING_TALENT} /> stacks:{' '}
                {this.averageStacks.toFixed(2)}
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.UPWELLING_TALENT}>
          <ItemHealingDone amount={this.totalHealingAll} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Upwelling;
