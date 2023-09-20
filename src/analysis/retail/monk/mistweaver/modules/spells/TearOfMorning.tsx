import talents from 'common/TALENTS/monk';
import spells from 'common/SPELLS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';

const TEAR_OF_MORNING_INCREASE = 0.2;
class TearOfMorning extends Analyzer {
  static dependencies = {};

  duplicatedRems: number = 0;
  invigoratingMistHealing: number = 0;
  envelopingMisthealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.TEAR_OF_MORNING_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(spells.INVIGORATING_MISTS_HEAL),
      this.handleVivify,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(talents.ENVELOPING_MIST_TALENT),
      this.handleEnv,
    );
  }

  get totalHealing() {
    return this.invigoratingMistHealing + this.envelopingMisthealing;
  }

  handleVivify(event: HealEvent) {
    this.invigoratingMistHealing += calculateEffectiveHealing(event, TEAR_OF_MORNING_INCREASE);
  }

  handleEnv(event: HealEvent) {
    if (event.tick) {
      return;
    }
    this.envelopingMisthealing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              <SpellLink spell={spells.INVIGORATING_MISTS_HEAL} /> healing:{' '}
              {formatNumber(this.invigoratingMistHealing)}
            </li>
            <li>
              <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> healing:{' '}
              {formatNumber(this.envelopingMisthealing)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={talents.TEAR_OF_MORNING_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          {this.duplicatedRems}{' '}
          <small>
            duplicated <SpellLink spell={talents.RENEWING_MIST_TALENT} /> (NYI)
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TearOfMorning;
