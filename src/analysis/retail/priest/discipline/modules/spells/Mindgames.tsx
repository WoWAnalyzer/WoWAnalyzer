import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import AtonementDamageSource from '../features/AtonementDamageSource';
import { getDamageEvent } from '../../normalizers/AtonementTracker';

class Mindgames extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };
  atonementHealing = 0;
  directHealing = 0;
  preventedDamage = 0;
  protected atonementDamageSource!: AtonementDamageSource;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_PRIEST.MINDGAMES_TALENT) &&
      this.selectedCombatant.spec === SPECS.DISCIPLINE_PRIEST;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES_ABSORB),
      this.onMindgamesAbsorbed,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
  }

  onAtoneHeal(event: any) {
    const damageEvent = getDamageEvent(event);
    if (!damageEvent) {
      return;
    }

    if (
      damageEvent.ability.guid !== TALENTS_PRIEST.MINDGAMES_TALENT.id &&
      damageEvent.ability.guid !== SPELLS.MINDGAMES_HEAL_REVERSAL.id
    ) {
      return;
    }
    this.atonementHealing += event.amount + (event.absorbed || 0);
  }

  onAtonement(event: any) {
    const { healEvent, damageEvent } = event;

    if (damageEvent.ability.guid !== TALENTS_PRIEST.MINDGAMES_TALENT.id) {
      return;
    }

    this.atonementHealing += healEvent.amount + (event.absorbed || 0);
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MINDGAMES_HEAL.id) {
      this.directHealing += event.amount + (event.absorbed || 0);
      return;
    }
  }

  onMindgamesAbsorbed(event: AbsorbedEvent) {
    this.preventedDamage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>{formatNumber(this.atonementHealing)} Atonement Healing</li>
              <li>{formatNumber(this.directHealing)} Direct Healing</li>
              <li>{formatNumber(this.preventedDamage)} Prevented Damage</li>
            </ul>
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.MINDGAMES_TALENT}>
          <>
            <ItemHealingDone
              amount={this.atonementHealing + this.directHealing + this.preventedDamage}
            />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Mindgames;
