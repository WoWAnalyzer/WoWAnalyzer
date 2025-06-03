import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  BeaconHealEvent,
  DamageEvent,
  GetRelatedEvents,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BeaconHealSource from '../beacons/BeaconHealSource';
import STAT, { getName } from 'parser/shared/modules/features/STAT';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import SpellLink from 'interface/SpellLink';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import { SPELL_COLORS } from '../../constants';
import {
  AC_CRUSADER_STRIKE,
  AC_JUDGMENT,
  BLESSED_ASSURANCE,
} from '../../normalizers/EventLinks/EventLinkConstants';

/**
 * Avenging Crusader
 *
 *  You become the ultimate crusader of light, increasing your Crusader Strike, Judgment, and auto-attack damage by 30%.
 *  Crusader Strike and Judgment cool down 30% faster and heal up to 5 injured allies for 500% of the damage done, split evenly among them. Lasts 20 sec.
 *  Example Log: https://www.warcraftlogs.com/reports/Ht1XgQxaCGc8kbrA#fight=4&type=healing&source=13
 */
class AvengingCrusader extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  blessedAssuranceCrusaderStrikes: number[] = [];

  hits = 0;
  crits = 0;

  healingSource = {
    [SPELLS.CRUSADER_STRIKE.id]: [0, 0],
    [SPELLS.JUDGMENT_CAST_HOLY.id]: [0, 0],
    [TALENTS.BLESSED_ASSURANCE_TALENT.id]: [0, 0],
    [SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id]: [0, 0],
  };

  overhealSource = {
    [SPELLS.AVENGING_CRUSADER.id]: 0,
    [SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id]: 0,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_CRUSADER_HEAL_NORMAL),
      this.onHit,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_CRUSADER_HEAL_CRIT),
      this.onCrit,
    );
    this.addEventListener(Events.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
    this.addEventListener(
      Events.applybuff.spell(TALENTS.AVENGING_CRUSADER_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.spell(TALENTS.AVENGING_CRUSADER_TALENT),
      this.onRemoveBuff,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSED_ASSURANCE_BUFF),
      this.onRemove,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCSDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST_HOLY),
      this.onJudgmentDamage,
    );
  }

  onHit(event: HealEvent) {
    this.hits += 1;
    this.overhealSource[SPELLS.AVENGING_CRUSADER.id] += event.overheal || 0;
  }

  onCrit(event: HealEvent) {
    this.crits += 1;
    this.onHit(event);
  }

  onRemove(event: RemoveBuffEvent) {
    const events = GetRelatedEvents<DamageEvent>(event, BLESSED_ASSURANCE);
    for (const event of events) {
      this.blessedAssuranceCrusaderStrikes.push(event.timestamp);
    }
  }

  onCSDamage(event: DamageEvent) {
    const events = GetRelatedEvents<HealEvent>(event, AC_CRUSADER_STRIKE);

    for (const healEvent of events) {
      const amount = healEvent.amount + (healEvent.absorbed || 0);

      const spellId = this.blessedAssuranceCrusaderStrikes.includes(event.timestamp)
        ? TALENTS.BLESSED_ASSURANCE_TALENT.id
        : SPELLS.CRUSADER_STRIKE.id;

      this.addToHealingSource(spellId, amount);
    }
  }

  onJudgmentDamage(event: DamageEvent) {
    const events = GetRelatedEvents<HealEvent>(event, AC_JUDGMENT);

    for (const healEvent of events) {
      const amount = healEvent.amount + (healEvent.absorbed || 0);
      this.addToHealingSource(SPELLS.JUDGMENT_CAST_HOLY.id, amount);
    }
  }

  onBeaconTransfer(event: BeaconHealEvent) {
    const spellId = event.originalHeal.ability.guid;
    if (
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id &&
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id
    ) {
      return;
    }

    const amount = event.amount + (event.absorbed || 0);
    this.addToHealingSource(SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id, amount);
    this.overhealSource[SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id] += event.overheal || 0;
  }

  addToHealingSource(spellId: number, amount: number) {
    const [currentAmount, currentCount] = this.healingSource[spellId];
    this.healingSource[spellId] = [currentAmount + amount, currentCount + 1];
  }

  getHealingSourceAmount(spellId: number) {
    return this.healingSource[spellId][0] || 0;
  }

  getHealingSourceCount(spellId: number) {
    return this.healingSource[spellId][1] || 0;
  }

  onApplyBuff() {
    this.spellUsable.applyCooldownRateChange(
      [SPELLS.JUDGMENT_CAST_HOLY.id, SPELLS.CRUSADER_STRIKE.id],
      1.3,
    );
  }

  onRemoveBuff() {
    this.spellUsable.removeCooldownRateChange(
      [SPELLS.JUDGMENT_CAST_HOLY.id, SPELLS.CRUSADER_STRIKE.id],
      1.3,
    );
  }

  get critRate() {
    return this.crits / this.hits || 0;
  }

  get totalHealing() {
    return Object.values(this.healingSource).reduce((sum, [healing]) => sum + healing, 0);
  }

  get totalOverhealing() {
    return Object.values(this.overhealSource).reduce((sum, value) => sum + value, 0);
  }

  getAvengingCrusaderDataItems() {
    const items = [
      {
        spell: SPELLS.CRUSADER_STRIKE,
        amount: this.getHealingSourceAmount(SPELLS.CRUSADER_STRIKE.id),
        color: SPELL_COLORS.CRUSADER_STRIKE,
        subSpecs: [
          {
            spell: TALENTS.BLESSED_ASSURANCE_TALENT,
            color: SPELL_COLORS.BLESSED_ASSURANCE,
            amount: this.getHealingSourceAmount(TALENTS.BLESSED_ASSURANCE_TALENT.id),
            tooltip: this.getTooltip(
              SPELLS.CRUSADER_STRIKE.id,
              TALENTS.BLESSED_ASSURANCE_TALENT.id,
            ),
          },
        ],
        tooltip: this.getTooltip(SPELLS.CRUSADER_STRIKE.id),
      },
      {
        spell: SPELLS.JUDGMENT_CAST_HOLY,
        color: SPELL_COLORS.JUDGMENT,
        amount: this.getHealingSourceAmount(SPELLS.JUDGMENT_CAST_HOLY.id),
        tooltip: this.getTooltip(SPELLS.JUDGMENT_CAST_HOLY.id),
      },
      {
        spell: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF,
        color: SPELL_COLORS.BEACON_OF_LIGHT,
        amount: this.getHealingSourceAmount(SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id),
        tooltip: this.getTooltip(SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id),
      },
    ];

    return items;
  }

  getTooltip(spellId: number, secondarySourceId?: number) {
    const effectiveId = secondarySourceId ?? spellId;
    const count = this.getHealingSourceCount(effectiveId);
    const amount = this.getHealingSourceAmount(effectiveId);

    return (
      <>
        <div>
          <ItemHealingDone amount={amount} />
        </div>
        <div>
          {secondarySourceId && <SpellLink spell={secondarySourceId} />}{' '}
          <SpellLink spell={spellId} /> converted to healing {count} times for a total of{' '}
          {formatNumber(amount)} healing
        </div>
      </>
    );
  }

  statistic() {
    const critName = getName(STAT.CRITICAL_STRIKE);
    const overheal = this.overhealSource[SPELLS.AVENGING_CRUSADER.id];
    const beaconOverheal = this.overhealSource[SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id];

    return (
      <TalentAggregateStatisticContainer
        tooltip={
          <>
            <ItemHealingDone amount={this.totalHealing} /> <br />
            Hits: <b>{this.hits}</b> Crits: <b>{this.crits}</b> <br />
            Overhealed: <b>{formatPercentage(overheal / (this.totalHealing + overheal))}%</b>
            <br />
            Beacon healing:{' '}
            <b>
              {formatNumber(this.getHealingSourceAmount(SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id))}
            </b>
            <br />
            Beacon overhealed:{' '}
            <b>
              {formatPercentage(
                beaconOverheal /
                  (beaconOverheal +
                    this.getHealingSourceAmount(SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id)),
              )}
              %
            </b>
            <br />
          </>
        }
        title={
          <>
            <SpellLink spell={TALENTS.AVENGING_CRUSADER_TALENT} /> -{' '}
            <ItemHealingDone amount={this.totalHealing} displayPercentage={false} />
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(6)}
        smallFooter
        footer={
          <>
            {' '}
            {formatPercentage(this.critRate)}% <small>{critName} rate</small>
          </>
        }
      >
        <TalentAggregateBars bars={this.getAvengingCrusaderDataItems()}></TalentAggregateBars>
      </TalentAggregateStatisticContainer>
    );
  }
}

export default AvengingCrusader;
