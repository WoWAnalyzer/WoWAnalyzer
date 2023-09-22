import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { DamageEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Atonement from './Atonement';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const RESPLENDENT_LIGHT_RANK_INCREASE = 0.02;
const LIGHTS_WRATH_INCREASE = 0.06;

class ResplendentLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    atonement: Atonement,
  };
  bonusDamage = 0;
  bonusHealing = 0;
  protected atonement!: Atonement;
  protected combatants!: Combatants;

  talentRank = 0;
  resplendentLightIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.RESPLENDENT_LIGHT_TALENT);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.LIGHTS_WRATH_TALENT),
      this.onDamage,
    );
    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS_PRIEST.RESPLENDENT_LIGHT_TALENT);
    this.resplendentLightIncrease = this.talentRank * RESPLENDENT_LIGHT_RANK_INCREASE;
  }

  onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;

    if (damageEvent?.ability.guid !== TALENTS_PRIEST.LIGHTS_WRATH_TALENT.id) {
      return;
    }
    const atonementCount = this.atonement.numAtonementsActive;
    const ampWithRL = atonementCount * (this.resplendentLightIncrease + LIGHTS_WRATH_INCREASE);
    const ampWithoutRL = atonementCount * LIGHTS_WRATH_INCREASE;

    this.bonusHealing += calculateEffectiveHealing(healEvent, ampWithRL / ampWithoutRL - 1);
  }

  onDamage(event: DamageEvent) {
    const atonementCount = this.atonement.numAtonementsActive;
    const ampWithRL = atonementCount * (this.resplendentLightIncrease + LIGHTS_WRATH_INCREASE);
    const ampWithoutRL = atonementCount * LIGHTS_WRATH_INCREASE;

    this.bonusDamage += calculateEffectiveDamage(event, ampWithRL / ampWithoutRL - 1);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(15)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.RESPLENDENT_LIGHT_TALENT}>
          <>
            <ItemHealingDone amount={this.bonusHealing} /> <br />
            <ItemDamageDone amount={this.bonusDamage} /> <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ResplendentLight;
