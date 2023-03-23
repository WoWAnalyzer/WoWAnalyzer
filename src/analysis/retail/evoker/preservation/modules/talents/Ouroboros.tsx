import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffStackEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getEchoHealEvents, getHealEvents } from '../../normalizers/CastLinkNormalizer';
import { SpellLink } from 'interface';

const INCREASE_PER_STACK = 0.3;

class Ouroboros extends Analyzer {
  ebHealing: number = 0;
  echoEbHealing: number = 0;
  totalConsumes: number = 0;
  lastConsume: number = 0;
  stacks: number = 0;
  totalStacksConsumed: number = 0;
  lastStacksConsumed: number = 0;
  countedTimestamps: Set<number> = new Set<number>();
  echoCountedTimestamps: Set<number> = new Set<number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.OUROBOROS_TALENT);
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.OUROBOROS_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.onHealBatch,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM_ECHO),
      this.onEbEcho,
    );
  }

  onBuffApply(event: ApplyBuffStackEvent) {
    this.stacks += 1;
  }

  onEbEcho(event: HealEvent) {
    if (
      this.echoCountedTimestamps.has(event.timestamp) ||
      Math.abs(event.timestamp - this.lastConsume) >= 1000
    ) {
      return;
    }
    const allHealingEvents = getEchoHealEvents(event);
    this.totalConsumes += 1;
    for (let i = 0; i < allHealingEvents.length; i += 1) {
      const ev = allHealingEvents[i];
      this.echoEbHealing += calculateEffectiveHealing(
        ev,
        this.lastStacksConsumed * INCREASE_PER_STACK,
      );
    }
    this.lastStacksConsumed = 0;
    this.lastConsume = 0;
    this.echoCountedTimestamps.add(event.timestamp);
  }

  onHealBatch(event: HealEvent) {
    if (this.countedTimestamps.has(event.timestamp)) {
      return;
    }

    const allHealingEvents = getHealEvents(event);
    this.totalConsumes += 1;
    for (let i = 0; i < allHealingEvents.length; i += 1) {
      const ev = allHealingEvents[i];
      this.ebHealing += calculateEffectiveHealing(ev, this.stacks * INCREASE_PER_STACK);
    }
    this.countedTimestamps.add(event.timestamp);
    this.lastStacksConsumed = this.stacks;
    this.lastConsume = event.timestamp;
    this.totalStacksConsumed += this.stacks;
    this.stacks = 0;
  }

  get totalhealing() {
    return this.ebHealing + this.echoEbHealing;
  }

  get avgStacks() {
    return this.totalStacksConsumed / this.totalConsumes;
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
