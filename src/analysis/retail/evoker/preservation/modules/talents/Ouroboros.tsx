import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';

const INCREASE_PER_STACK = 0.3;

class Ouroboros extends Analyzer {
  ebHealing: number = 0;
  echoEbHealing: number = 0;
  totalBuffedHits: number = 0;
  totalStacks: number = 0;
  currentStacks: number = 0;

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
  }

  onHeal(event: HealEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.OUROBOROS_BUFF.id);
    this.ebHealing += calculateEffectiveHealing(event, stacks * INCREASE_PER_STACK);
    this.totalBuffedHits += 1;
    this.totalStacks += stacks;
    this.currentStacks = stacks;
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
