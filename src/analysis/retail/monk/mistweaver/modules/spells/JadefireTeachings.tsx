import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { getCurrentRSKTalent, getCurrentRSKTalentDamage, SPELL_COLORS } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';

class JadefireTeachings extends Analyzer {
  atSourceSpell: number = 0;
  damageSpellToHealing: Map<number, number> = new Map();
  damageSpellsCount: Map<number, number> = new Map();
  missedDamageSpells: Map<number, number> = new Map();
  damageSpellsToHealingCount: Map<number, number> = new Map();
  lastDamageSpellID: number = 0;
  uptimeWindows: OpenTimePeriod[] = [];
  overhealing: number = 0;
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
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.JT_BUFF), this.onApply);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.JT_BUFF),
      this.onRemove,
    );
  }

  lastDamageEvent(event: DamageEvent) {
    this.lastDamageSpellID = event.ability.guid;

    if (!this.selectedCombatant.hasBuff(SPELLS.JT_BUFF.id)) {
      const oldMissedTotal = this.missedDamageSpells.get(this.lastDamageSpellID) || 0;
      this.missedDamageSpells.set(this.lastDamageSpellID, oldMissedTotal + 1);
    }

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

  onApply(event: ApplyBuffEvent) {
    this.uptimeWindows.push({
      start: event.timestamp,
    });
  }

  onRemove(event: RemoveBuffEvent) {
    this.uptimeWindows.at(-1)!.end = event.timestamp;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <strong>
          <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} />
        </strong>{' '}
        is a powerful buff that enables you to do consistent healing while doing damage, a core
        identity of Mistweaver Monk. Try to maintain your buff at all times by casting{' '}
        <SpellLink spell={TALENTS_MONK.JADEFIRE_STOMP_TALENT} /> to keep it active.
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> uptime
          </strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
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

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT],
      uptimes: mergeTimePeriods(this.uptimeWindows, this.owner.currentTimestamp),
      color: SPELL_COLORS.RISING_SUN_KICK,
    });
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

  get totalHealing() {
    return this.rskHealing + this.bokHealing + this.totmHealing + this.tpHealing + this.cjlHealing;
  }

  getJadefireTeachingsDataItems() {
    const items = [
      {
        spell: this.currentRskTalent,
        amount: this.rskHealing,
        color: SPELL_COLORS.RISING_SUN_KICK,
        tooltip: this.getTooltip(getCurrentRSKTalentDamage(this.selectedCombatant).id),
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
      <>
        From your {this.damageSpellsCount.get(spellId) || 0} <SpellLink spell={spellId} />{' '}
        {secondarySourceId && (
          <>
            from <SpellLink spell={secondarySourceId} />
          </>
        )}
        :
        <ul>
          <li>
            {secondarySourceId && <SpellLink spell={secondarySourceId} />}{' '}
            <SpellLink spell={spellId} /> did damage {this.missedDamageSpells.get(spellId) || 0}{' '}
            times without the <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> buff
            active
          </li>
          <li>
            {secondarySourceId && <SpellLink spell={secondarySourceId} />}{' '}
            <SpellLink spell={spellId} /> converted to healing{' '}
            {(this.damageSpellsCount.get(spellId) || 0) -
              (this.missedDamageSpells.get(spellId) || 0)}{' '}
            times for a total of {formatNumber(this.damageSpellToHealing.get(spellId) || 0)} healing
          </li>
        </ul>
      </>
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
        footer={
          <>
            {' '}
            {formatPercentage(
              this.selectedCombatant.getBuffUptime(SPELLS.JT_BUFF.id) / this.owner.fightDuration,
            )}
            % Uptime *
          </>
        }
      >
        <TalentAggregateBars bars={this.getJadefireTeachingsDataItems()}></TalentAggregateBars>
      </TalentAggregateStatisticContainer>
    );
  }
}

export default JadefireTeachings;
