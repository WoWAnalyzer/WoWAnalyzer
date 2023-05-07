import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const INCREASE_PER_STACK = 0.3;

interface CastInfo {
  timestamp: number;
  stacks: number;
}

class Ouroboros extends Analyzer {
  ebHealing: number = 0;
  echoEbHealing: number = 0;
  totalBuffedHits: number = 0;
  totalStacks: number = 0;
  currentStacks: number = 0;
  casts: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.OUROBOROS_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM_ECHO),
      this.onEchoHeal,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.OUROBOROS_BUFF),
      this.onRemoveBuff,
    );
  }

  onHeal(event: HealEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.OUROBOROS_BUFF.id);
    this.ebHealing += calculateEffectiveHealing(event, stacks * INCREASE_PER_STACK);
    this.totalBuffedHits += 1;
    this.totalStacks += stacks;
    this.currentStacks = stacks;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.casts.push({
      timestamp: event.timestamp,
      stacks: this.selectedCombatant.getBuffStacks(SPELLS.OUROBOROS_BUFF.id),
    });
  }

  onEchoHeal(event: HealEvent) {
    const stacks = this.currentStacks;
    this.echoEbHealing += calculateEffectiveHealing(event, stacks * INCREASE_PER_STACK);
    this.totalStacks += stacks;
    this.currentStacks = stacks;
    this.totalBuffedHits += 1;
  }

  get totalhealing() {
    return this.ebHealing + this.echoEbHealing;
  }

  get avgStacks() {
    return this.totalStacks / this.totalBuffedHits;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_EVOKER.OUROBOROS_TALENT.id} />
        </b>{' '}
        makes <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> grant a stack of a buff (max 5) that
        significantly increases the healing of <SpellLink spell={SPELLS.EMERALD_BLOSSOM} />. You
        should aim to only use <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> when you have at least 3
        stacks, as it will often be a waste of essence/mana otherwise.
      </p>
    );

    const entries: BoxRowEntry[] = [];
    this.casts.forEach((info) => {
      let value = QualitativePerformance.Good;
      if (info.stacks < 3) {
        value = QualitativePerformance.Fail;
      } else if (info.stacks < 4) {
        value = QualitativePerformance.Ok;
      }
      const tooltip = (
        <>
          <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} /> @{' '}
          {this.owner.formatTimestamp(info.timestamp)}: {info.stacks} stacks
        </>
      );
      entries.push({ value, tooltip });
    });

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_EVOKER.OUROBOROS_TALENT} /> consumptions
          </strong>
          <PerformanceBoxRow values={entries} />
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.DREAM_BREATH_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              <SpellLink id={TALENTS_EVOKER.OUROBOROS_TALENT} /> healing from hardcast:{' '}
              {formatNumber(this.ebHealing)}
            </li>
            <li>
              <SpellLink id={TALENTS_EVOKER.OUROBOROS_TALENT} /> healing from{' '}
              <SpellLink id={TALENTS_EVOKER.ECHO_TALENT} />: {formatNumber(this.echoEbHealing)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.OUROBOROS_TALENT}>
          <ItemHealingDone amount={this.totalhealing} /> <br />
          {this.avgStacks.toFixed(1)} <small>average stacks</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Ouroboros;
