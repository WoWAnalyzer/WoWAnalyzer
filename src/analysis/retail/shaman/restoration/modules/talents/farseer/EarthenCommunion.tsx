/** EarthenCommunion
 * Earth Shield has an additional 3 charges and heals you for 25% more.
 */
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import CooldownThroughputTracker from 'src/analysis/retail/shaman/restoration/modules/features/CooldownThroughputTracker';
import { formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';

const EARTHEN_COMMUNION_HEALING_INCREASE = 0.25;

export default class EarthenCommunion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;

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

    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }

    const bonus = calculateEffectiveHealing(event, EARTHEN_COMMUNION_HEALING_INCREASE);

    if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.orbitBonusHealing += bonus;
    } else if (combatant.hasBuff(TALENTS.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.baseBonusHealing += bonus;
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
