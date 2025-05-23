import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType, GetRelatedEvent, ResourceChangeEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SECOND_SUNRISE } from '../../../normalizers/EventLinks/EventLinkConstants';
import { SECOND_SUNRISE_CHANCE } from '../../../constants';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';

class SecondSunrise extends Analyzer {
  healingDone = 0;
  overhealing = 0;
  damageDone = 0;

  resourceChange = 0;
  wastedResource = 0;

  totalChances = 0;
  procProbabilities: number[] = [];

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SECOND_SUNRISE_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SECOND_SUNRISE_HOLY_POWER),
      this.onResourceChange,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.LIGHT_OF_DAWN_TALENT, TALENTS.HOLY_SHOCK_TALENT]),
      this.onCast,
    );
  }

  onCast() {
    this.totalChances += 1;
    this.procProbabilities.push(SECOND_SUNRISE_CHANCE);
  }

  onResourceChange(event: ResourceChangeEvent) {
    const secondSunrise = GetRelatedEvent(event, SECOND_SUNRISE);
    if (secondSunrise) {
      this.resourceChange += event.resourceChange;
      this.wastedResource += event.waste;
      switch (secondSunrise.type) {
        case EventType.Heal:
          this.healingDone += (secondSunrise.amount || 0) + (secondSunrise.absorb || 0);
          this.overhealing += secondSunrise.overheal || 0;
          break;
        case EventType.Damage:
          this.damageDone += secondSunrise.amount || 0;
          break;
        default:
          break;
      }
    }
  }

  // WCL Pin:
  // 2$Separate$#244F4B$healing|damage$-1$0.0.0.Any$0.0.0.Any$true$0.0.0.Any$true$25914$or$resources$-1$0.0.0.Any$0.0.0.Any$true$0.0.0.Any$true$456766$0$or$casts$-1$0.0.0.Any$0.0.0.Any$true$0.0.0.Any$true$375576$or$casts$-1$0.0.0.Any$0.0.0.Any$true$0.0.0.Any$true$20473$or$resources$-1$0.0.0.Any$0.0.0.Any$true$0.0.0.Any$true$20473|25914$0

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={<>Holy Power Wasted: {this.wastedResource}</>}
      >
        <TalentSpellText talent={TALENTS.SECOND_SUNRISE_TALENT}>
          <ItemHealingDone amount={this.healingDone} /> <br />
          {this.damageDone > 0 && (
            <>
              <ItemDamageDone amount={this.damageDone} /> <br />
            </>
          )}
          {this.resourceChange} <small>extra Holy Power generated</small>
          <br />
        </TalentSpellText>
        {plotOneVariableBinomChart(
          this.resourceChange + this.wastedResource,
          this.totalChances,
          this.procProbabilities,
        )}
      </Statistic>
    );
  }
}

export default SecondSunrise;
