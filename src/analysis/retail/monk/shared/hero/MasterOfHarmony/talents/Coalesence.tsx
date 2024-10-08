import { CAST_BUFFER_MS } from 'analysis/retail/monk/mistweaver/normalizers/EventLinks/EventLinkConstants';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { COALESENCE_INCREASE } from '../constants';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

class Coalesence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };
  protected combatants!: Combatants;
  protected enemies!: Enemies;
  totalDmg: number = 0;
  totalHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.COALESCENCE_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  private onHeal(event: HealEvent) {
    if (event.ability.guid === SPELLS.ASPECT_OF_HARMONY_HOT.id) {
      return;
    }
    const target = this.combatants.getEntity(event);
    if (
      !target ||
      !target.hasBuff(
        SPELLS.ASPECT_OF_HARMONY_HOT,
        event.timestamp,
        CAST_BUFFER_MS,
        0,
        this.selectedCombatant.player.id,
      )
    ) {
      return;
    }
    this.totalHealing += calculateEffectiveHealing(event, COALESENCE_INCREASE);
  }

  private onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.ASPECT_OF_HARMONY_DOT.id) {
      return;
    }
    const target = this.enemies.getEntity(event);
    if (
      !target ||
      !target.hasBuff(
        SPELLS.ASPECT_OF_HARMONY_DOT,
        event.timestamp,
        CAST_BUFFER_MS,
        0,
        this.selectedCombatant.player.id,
      )
    ) {
      return;
    }
    this.totalDmg += calculateEffectiveDamage(event, COALESENCE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.COALESCENCE_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} />
          </div>
          <div>
            <ItemDamageDone amount={this.totalDmg} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Coalesence;
