import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { Ability, DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { BLAZE_OF_LIGHT_INCREASE } from '../../../constants';
import { getDamageEvent } from '../../../normalizers/AtonementTracker';
import BlazeOfLightSourceDonut from './BlazeOfLightSourceDonut';

const BLAZE_OF_LIGHT_SPELLS = [
  SPELLS.SMITE,
  SPELLS.VOID_BLAST_DAMAGE_DISC,
  SPELLS.PENANCE,
  SPELLS.DARK_REPRIMAND_DAMAGE,
];

const BLAZE_OF_LIGHT_SPELL_IDS = BLAZE_OF_LIGHT_SPELLS.map((spell) => spell.id);

class BlazeOfLight extends Analyzer {
  damage = 0;
  blazeOfLightIncrease = 0;
  healing = 0;
  healingMap: Map<number, number> = new Map();
  abilityMap: Map<number, Ability> = new Map();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.BLAZE_OF_LIGHT_TALENT);

    this.blazeOfLightIncrease =
      BLAZE_OF_LIGHT_INCREASE[
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.BLAZE_OF_LIGHT_TALENT) - 1
      ];

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(BLAZE_OF_LIGHT_SPELLS),
      this.onDamage,
    );

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
  }

  onAtoneHeal(event: HealEvent) {
    const damageEvent = getDamageEvent(event);
    if (!damageEvent) {
      return;
    }
    if (!BLAZE_OF_LIGHT_SPELL_IDS.includes(damageEvent.ability.guid)) {
      return;
    }

    this.attributeToMap(event.amount, damageEvent);
    this.healing += calculateEffectiveHealing(event, this.blazeOfLightIncrease);
  }

  private attributeToMap(amount: number, sourceEvent?: DamageEvent) {
    if (!sourceEvent) {
      return;
    }
    const { ability } = sourceEvent;

    // Set ability in map
    this.abilityMap.set(ability.guid, ability);

    // Attribute healing
    const currentValue = this.healingMap.get(ability.guid) || 0;
    this.healingMap.set(ability.guid, currentValue + amount);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.blazeOfLightIncrease);
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={TALENTS_PRIEST.BLAZE_OF_LIGHT_TALENT}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
        <BlazeOfLightSourceDonut abilityMap={this.abilityMap} healingMap={this.healingMap} />
      </Statistic>
    );
  }
}

export default BlazeOfLight;
