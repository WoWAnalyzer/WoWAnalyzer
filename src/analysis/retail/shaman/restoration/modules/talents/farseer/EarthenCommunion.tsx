/** EarthenCommunion
 * Earth Shield has an additional 3 charges and heals you for 25% more.
 */
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { splitEarthShieldHeal } from 'analysis/retail/shaman/shared/talents/earthShieldHealSplit';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';

export default class EarthenCommunion extends Analyzer.withDependencies({
  combatants: Combatants,
}) {
  baseBonusHealing = 0;
  orbitBonusHealing = 0;

  get bonusHealing() {
    return this.baseBonusHealing + this.orbitBonusHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
      this.onEarthShieldHeal,
    );
  }

  onEarthShieldHeal(event: HealEvent) {
    if (event.targetID !== this.owner.playerId) {
      return;
    }

    const combatant = this.deps.combatants.getEntity(event);
    if (!combatant) {
      return;
    }

    // Shared split, so this matches the Earth Shield breakdown when several talents stack.
    const split = splitEarthShieldHeal(event, this.selectedCombatant, combatant);
    if (!split) {
      return;
    }

    if (split.bucket === 'elementalOrbit') {
      this.orbitBonusHealing += split.earthenCommunion;
    } else {
      this.baseBonusHealing += split.earthenCommunion;
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.HERO_TALENTS} size="flexible" wide={false}>
        <TalentSpellText talent={TALENTS.EARTHEN_COMMUNION_TALENT}>
          {formatNumber(this.bonusHealing)}
          <p>
            <small>Bonus healing by talent over all</small>
          </p>
        </TalentSpellText>
      </Statistic>
    );
  }
}
