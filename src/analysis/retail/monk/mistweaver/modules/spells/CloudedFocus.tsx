import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getVivifiesPerCast } from '../../normalizers/CastLinkNormalizer';
import DonutChart from 'parser/ui/DonutChart';
import { SPELL_COLORS } from '../../constants';
import WarningIcon from 'interface/icons/Warning';
import CheckmarkIcon from 'interface/icons/Checkmark';

const BUFF_AMOUNT_PER_STACK = 0.2;
const debug = false;
/**
 * Whenever you cast a vivify or enveloping mist during soothing mist's channel you gain a stack of clouded focus which increases their healing by 20% and descreases their
 * mana cost by 20% as well. You can have up to 3 stack but you lose all the stacks when you stop channeling soothing mist.
 */

interface CloudedFocusStacksMap {
  casts: number;
  healing: number;
  overhealing: number;
  manaSaved: number;
}

class CloudedFocus extends Analyzer {
  stackMap: Map<string, CloudedFocusStacksMap> = new Map<string, CloudedFocusStacksMap>();
  manaSaved: number = 0;
  healingDone: number = 0;
  cappedStacks: boolean = false;
  stacks: number = 0;
  manaStacks: number = 0;
  lastStack: number = 0;

  //viv
  primaryTargetHealing: number = 0;
  primaryTargetOverheal: number = 0;

  get buffIcon() {
    return this.primaryTargetPercentOverheal > 0.5 ? <WarningIcon /> : <CheckmarkIcon />;
  }

  get overhealMetric() {
    return (
      <>
        {this.buffIcon} {formatPercentage(this.primaryTargetPercentOverheal)}%{' '}
        <small> main target overheal </small>
      </>
    );
  }

  get primaryTargetPercentOverheal() {
    return this.primaryTargetOverheal / (this.primaryTargetOverheal + this.primaryTargetHealing);
  }

  get cloudedFocusItems() {
    return [
      {
        color: SPELL_COLORS.VIVIFY,
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: this.getHealingForSpell(SPELLS.VIVIFY.id),
        valueTooltip: this.chartTooltip(SPELLS.VIVIFY.id),
        valuePercent: true,
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Enveloping Mist',
        spellId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        value: this.getHealingForSpell(TALENTS_MONK.ENVELOPING_MIST_TALENT.id),
        valueTooltip: this.chartTooltip(TALENTS_MONK.ENVELOPING_MIST_TALENT.id),
        valuePercent: true,
      },
      {
        color: SPELL_COLORS.MISTY_PEAKS,
        label: 'Enveloping Breath',
        spellId: SPELLS.ENVELOPING_BREATH_HEAL.id,
        value: this.getHealingForSpell(SPELLS.ENVELOPING_BREATH_HEAL.id),
        valueTooltip: this.chartTooltip(SPELLS.ENVELOPING_BREATH_HEAL.id),
        valuePercent: true,
      },
    ];
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CLOUDED_FOCUS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.applyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.refreshBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.applyBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.removeBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.VIVIFY, TALENTS_MONK.ENVELOPING_MIST_TALENT]),
      this.calculateManaEffect,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.VIVIFY, TALENTS_MONK.ENVELOPING_MIST_TALENT, SPELLS.ENVELOPING_BREATH_HEAL]),
      this.calculateHealingEffect,
    );
  }

  calculateManaEffect(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VIVIFY.id && this.stacks > 0) {
      this.tallyPrimaryTargetOverheal(event);
    }
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }
    debug && console.log('Current Stacks: ', this.stacks, 'Mana Stacks: ', this.manaStacks, event);

    let cost = event.rawResourceCost ? event.rawResourceCost[0] : 0;
    if (this.selectedCombatant.hasBuff(TALENTS_MONK.MANA_TEA_TALENT.id)) {
      cost /= 2;
    }

    this.addManaToStackMap(spellId, cost);
    this.manaSaved += cost - cost * (1 - this.manaStacks * BUFF_AMOUNT_PER_STACK);
  }

  calculateHealingEffect(event: HealEvent) {
    const spellId = event.ability.guid;
    if (this.stacks === 0) {
      return;
    }
    this.addHealingToStackMap(spellId, event);
    this.healingDone += calculateEffectiveHealing(event, this.stacks * BUFF_AMOUNT_PER_STACK);
  }

  applyBuff(event: ApplyBuffEvent) {
    this.stacks = 1;
  }

  applyBuffStack(event: ApplyBuffStackEvent) {
    this.lastStack = this.stacks;
    this.stacks = event.stack;
    this.manaStacks = event.stack - 1;
  }

  refreshBuff(event: RefreshBuffEvent) {
    //there is a refresh event when the 3rd applybuffstack event occurs for some reason
    if (this.lastStack === 2) {
      this.lastStack += 1;
      return;
    }
    this.manaStacks = this.stacks;
  }

  removeBuff(event: RemoveBuffEvent) {
    this.stacks = 0;
    this.manaStacks = 0;
  }

  tallyPrimaryTargetOverheal(event: CastEvent) {
    const vivifies = getVivifiesPerCast(event) as HealEvent[];
    if (!vivifies) {
      return;
    }
    const primaryVivify = vivifies.filter((viv) => event.targetID === viv.targetID)[0];
    if (!primaryVivify) {
      return;
    }
    this.primaryTargetHealing += primaryVivify.amount + (primaryVivify.absorbed || 0);
    this.primaryTargetOverheal += primaryVivify.overheal || 0;
  }

  addManaToStackMap(spellId: number, cost: number) {
    const mana = cost - cost * (1 - this.manaStacks * BUFF_AMOUNT_PER_STACK);
    const current = this.stackMap.get(this.makeKey(spellId, this.stacks));
    if (current) {
      current.manaSaved += mana;
      current.casts += 1;
    } else {
      this.stackMap.set(this.makeKey(spellId, this.stacks), {
        casts: 1,
        healing: 0,
        overhealing: 0,
        manaSaved: mana,
      });
    }
  }

  addHealingToStackMap(spellId: number, event: HealEvent) {
    const current = this.stackMap.get(this.makeKey(spellId, this.stacks));
    const effectiveHealing = calculateEffectiveHealing(event, this.stacks * BUFF_AMOUNT_PER_STACK);
    const overHealing = calculateOverhealing(event, this.stacks * BUFF_AMOUNT_PER_STACK);
    if (current) {
      current.healing += effectiveHealing;
      current.overhealing += overHealing;
    } else {
      this.stackMap.set(this.makeKey(spellId, this.stacks), {
        casts: 0,
        healing: effectiveHealing,
        overhealing: overHealing,
        manaSaved: 0,
      });
    }
  }

  makeKey(spellId: number, stacks: number) {
    return `${spellId}-${stacks}`;
  }

  getKeysForSpell(spellId: number) {
    const stacks = [1, 2, 3];
    const returnVal: string[] = [];
    stacks.forEach((stack) => {
      returnVal.push(`${spellId}-${stack}`);
    });
    return returnVal;
  }

  getHealingForSpell(spellId: number) {
    const keys = this.getKeysForSpell(spellId);
    return keys.reduce((sum, key) => sum + (this.stackMap.get(key)?.healing || 0), 0);
  }

  getManaForSpell(spellId: number) {
    const keys = this.getKeysForSpell(spellId);
    return keys.reduce((sum, key) => sum + (this.stackMap.get(key)?.manaSaved || 0), 0);
  }

  chartTooltip(spellId: number) {
    const keys = this.getKeysForSpell(spellId);
    const totalHealing = this.getHealingForSpell(spellId);
    const totalMana = this.getManaForSpell(spellId);
    return (
      <>
        <SpellLink spell={spellId} />:{' '}
        <b>
          {formatNumber(totalHealing)} healing, {formatNumber(totalMana)} mana
        </b>
        {keys.map((key) => {
          const map = this.stackMap.get(key);
          return map ? (
            <>
              <hr />
              Casts at {key.at(-1)} <SpellIcon id={TALENTS_MONK.CLOUDED_FOCUS_TALENT} /> stacks:{' '}
              <b>{map?.casts}</b>
              <ul>
                <li>
                  Healing: <b>{formatNumber(map.healing || 0)}</b>
                  <br />
                </li>
                <li>
                  Overhealing: <b>{formatNumber(map.overhealing || 0)}</b>
                </li>
                <li>
                  Mana Saved: <b>{formatNumber(map.manaSaved || 0)}</b>
                </li>
              </ul>
            </>
          ) : (
            <></>
          );
        })}
      </>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.CLOUDED_FOCUS_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.healingDone),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                <strong>{formatNumber(this.getManaForSpell(SPELLS.VIVIFY.id))}</strong> mana saved
                on <SpellLink id={SPELLS.VIVIFY} />
              </li>
              <li>
                <strong>
                  {formatNumber(this.getManaForSpell(TALENTS_MONK.ENVELOPING_MIST_TALENT.id))}
                </strong>{' '}
                mana saved on <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT} />
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.CLOUDED_FOCUS_TALENT}>
          <ItemHealingDone amount={this.healingDone} />
          <br />
          <ItemManaGained amount={this.manaSaved} useAbbrev />
          <br />
          {this.overhealMetric}
        </TalentSpellText>
        <aside className="pad">
          <hr />
          <DonutChart items={this.cloudedFocusItems} />
        </aside>
      </Statistic>
    );
  }
}

export default CloudedFocus;
