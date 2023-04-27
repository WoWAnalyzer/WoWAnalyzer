import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
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
const debug = true;
/**
 * Whenever you cast a vivify or enveloping mist during soothing mist's channel you gain a stack of clouded focus which increases their healing by 20% and descreases their
 * mana cost by 20% as well. You can have up to 3 stack but you lose all the stacks when you stop channeling soothing mist.
 */
class CloudedFocus extends Analyzer {
  manaSaved: number = 0;
  healingDone: number = 0;
  cappedStacks: boolean = false;
  stacks: number = 0;
  manaStacks: number = 0;
  lastStack: number = 0;

  //envM
  envelopingMistHealing: number = 0;
  envelopingMistMana: number = 0;

  //viv
  vivifyHealing: number = 0;
  vivifyMana: number = 0;
  primaryTargetHealing: number = 0;
  primaryTargetOverheal: number = 0;
  //envBreath
  envelopingBreathHealing: number = 0;

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
        value: this.vivifyHealing,
        valueTooltip: formatThousands(this.vivifyHealing),
        valuePercent: true,
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Enveloping Mist',
        spellId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        value: this.envelopingMistHealing,
        valueTooltip: formatThousands(this.envelopingMistHealing),
        valuePercent: true,
      },
      {
        color: SPELL_COLORS.MISTY_PEAKS,
        label: 'Enveloping Breath',
        spellId: SPELLS.ENVELOPING_BREATH_HEAL.id,
        value: this.envelopingBreathHealing,
        valueTooltip: formatThousands(this.envelopingBreathHealing),
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

    if (spellId === SPELLS.VIVIFY.id) {
      this.vivifyMana += cost - cost * (1 - this.manaStacks * BUFF_AMOUNT_PER_STACK);
    } else if (spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id) {
      this.envelopingMistMana += cost - cost * (1 - this.manaStacks * BUFF_AMOUNT_PER_STACK);
    }

    this.manaSaved += cost - cost * (1 - this.manaStacks * BUFF_AMOUNT_PER_STACK);
  }

  calculateHealingEffect(event: HealEvent) {
    const spellId = event.ability.guid;
    switch (spellId) {
      case SPELLS.VIVIFY.id:
        this.vivifyHealing += calculateEffectiveHealing(event, this.stacks * BUFF_AMOUNT_PER_STACK);
        break;
      case SPELLS.ENVELOPING_BREATH_HEAL.id:
        this.envelopingBreathHealing += calculateEffectiveHealing(
          event,
          this.stacks * BUFF_AMOUNT_PER_STACK,
        );
        break;
      case TALENTS_MONK.ENVELOPING_MIST_TALENT.id:
        this.envelopingMistHealing += calculateEffectiveHealing(
          event,
          this.stacks * BUFF_AMOUNT_PER_STACK,
        );
        break;
    }
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
    this.primaryTargetHealing += primaryVivify.amount + (primaryVivify.absorb || 0);
    this.primaryTargetOverheal += primaryVivify.overheal || 0;
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
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                <strong>{formatNumber(this.vivifyMana)}</strong> mana saved on{' '}
                <SpellLink id={SPELLS.VIVIFY} />
              </li>
              <li>
                <strong>{formatNumber(this.envelopingMistMana)}</strong> mana saved on{' '}
                <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT} />
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
