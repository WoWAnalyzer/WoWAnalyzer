import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { getCurrentRSKTalent, getCurrentRSKTalentDamage, SPELL_COLORS } from '../../constants';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';

class JadefireTeachings extends Analyzer {
  atSourceSpell = 0;
  damageSpellToHealing = new Map<number, number>();
  damageSpellsCount = new Map<number, number>();
  damageSpellsToHealingCount = new Map<number, number>();
  lastDamageSpellID = 0;
  overhealing = 0;
  currentRskTalent: Talent;
  currentDamage: Spell;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
    this.currentDamage = getCurrentRSKTalentDamage(this.selectedCombatant);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          this.currentDamage,
          SPELLS.BLACKOUT_KICK,
          SPELLS.BLACKOUT_KICK_TOTM,
          SPELLS.TIGER_PALM,
          SPELLS.CRACKLING_JADE_LIGHTNING,
          SPELLS.JADEFIRE_STOMP_DAMAGE,
        ]),
      this.lastDamageEvent,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AT_HEAL),
      this.calculateEffectiveHealing,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AT_CRIT_HEAL),
      this.calculateEffectiveHealing,
    );
  }

  lastDamageEvent(event: DamageEvent) {
    if (event.ability.guid === SPELLS.JADEFIRE_STOMP_DAMAGE.id) console.log('JFS Damage: ', event);
    this.lastDamageSpellID = event.ability.guid;

    if (!this.damageSpellToHealing.has(this.lastDamageSpellID)) {
      this.damageSpellToHealing.set(this.lastDamageSpellID, 0);
    }
    const oldTotal = this.damageSpellsCount.get(this.lastDamageSpellID) || 0;
    this.damageSpellsCount.set(this.lastDamageSpellID, oldTotal + 1);
  }

  calculateEffectiveHealing(event: HealEvent) {
    const heal = (event.amount || 0) + (event.absorbed || 0);
    const oldHealingTotal = this.damageSpellToHealing.get(this.lastDamageSpellID) || 0;
    this.damageSpellToHealing.set(this.lastDamageSpellID, heal + oldHealingTotal);
    this.overhealing += event.overheal || 0;
  }

  talentHealingStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  get rskHealing() {
    return this.damageSpellToHealing.get(this.currentDamage.id) || 0;
  }

  get bokHealing() {
    return this.damageSpellToHealing.get(SPELLS.BLACKOUT_KICK.id) || 0;
  }

  get totmHealing() {
    return this.damageSpellToHealing.get(SPELLS.BLACKOUT_KICK_TOTM.id) || 0;
  }

  get tpHealing() {
    return this.damageSpellToHealing.get(SPELLS.TIGER_PALM.id) || 0;
  }

  get cjlHealing() {
    return this.damageSpellToHealing.get(SPELLS.CRACKLING_JADE_LIGHTNING.id) || 0;
  }

  get jfsHealing() {
    return this.damageSpellToHealing.get(SPELLS.JADEFIRE_STOMP_DAMAGE.id) || 0;
  }
  get totalHealing() {
    return (
      this.rskHealing +
      this.bokHealing +
      this.totmHealing +
      this.tpHealing +
      this.cjlHealing +
      this.jfsHealing
    );
  }

  getJadefireTeachingsDataItems() {
    const items = [
      {
        spell: this.currentRskTalent,
        amount: this.rskHealing,
        color: SPELL_COLORS.RISING_SUN_KICK,
        tooltip: this.getTooltip(getCurrentRSKTalentDamage(this.selectedCombatant).id),
        subSpecs: [
          {
            spell: SPELLS.JADEFIRE_STOMP_DAMAGE,
            color: SPELL_COLORS.RENEWING_MIST,
            amount: this.jfsHealing,
            tooltip: this.getTooltip(SPELLS.JADEFIRE_STOMP_DAMAGE.id),
          },
        ],
      },
      {
        spell: SPELLS.BLACKOUT_KICK,
        color: SPELL_COLORS.BLACKOUT_KICK,
        amount: this.bokHealing,
        tooltip: this.getTooltip(SPELLS.BLACKOUT_KICK.id),
        subSpecs: [
          {
            spell: SPELLS.BLACKOUT_KICK_TOTM,
            color: SPELL_COLORS.BLACKOUT_KICK_TOTM,
            amount: this.totmHealing,
            tooltip: this.getTooltip(
              SPELLS.BLACKOUT_KICK_TOTM.id,
              SPELLS.TEACHINGS_OF_THE_MONASTERY.id,
            ),
          },
        ],
      },
      {
        spell: SPELLS.TIGER_PALM,
        color: SPELL_COLORS.TIGER_PALM,
        amount: this.tpHealing,
        tooltip: this.getTooltip(SPELLS.TIGER_PALM.id),
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING,
        color: SPELL_COLORS.DANCING_MIST,
        amount: this.cjlHealing,
        tooltip: this.getTooltip(SPELLS.CRACKLING_JADE_LIGHTNING.id),
      },
    ];

    return items;
  }

  getTooltip(spellId: number, secondarySourceId?: number) {
    return (
      <ul>
        <li>
          {secondarySourceId && <SpellLink spell={secondarySourceId} />}{' '}
          <SpellLink spell={spellId} /> converted to healing{' '}
          {this.damageSpellsCount.get(spellId) || 0} times for a total of{' '}
          {formatNumber(this.damageSpellToHealing.get(spellId) || 0)} healing
        </li>
      </ul>
    );
  }

  statistic() {
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> -{' '}
            <ItemHealingDone amount={this.totalHealing} displayPercentage={false} />
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(6)}
        smallFooter
      >
        <TalentAggregateBars bars={this.getJadefireTeachingsDataItems()}></TalentAggregateBars>
      </TalentAggregateStatisticContainer>
    );
  }
}

export default JadefireTeachings;
