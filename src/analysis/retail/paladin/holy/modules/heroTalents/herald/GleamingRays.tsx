import {
  DAMAGE_HOLY_POWER_SPENDERS,
  HEALING_HOLY_POWER_SPENDERS,
} from 'analysis/retail/paladin/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import {
  calculateEffectiveDamage,
  calculateEffectiveHealing,
  calculateOverhealing,
} from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { GLEAMING_RAYS_INCREASE } from '../../../constants';
import { formatNumber } from 'common/format';

class GleamingRays extends Analyzer {
  healingDone = 0;
  overhealing = 0;
  damageDone = 0;

  dawnlightsActive = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLEAMING_RAYS_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DAWNLIGHT_HEAL),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DAWNLIGHT_HEAL),
      this.onRemove,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DAWNLIGHT_DAMAGE),
      this.onApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DAWNLIGHT_DAMAGE),
      this.onRemove,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HEALING_HOLY_POWER_SPENDERS),
      this.onHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_HOLY_POWER_SPENDERS),
      this.onDamage,
    );
  }

  onHeal(event: HealEvent) {
    if (this.dawnlightsActive > 0) {
      this.healingDone += calculateEffectiveHealing(event, GLEAMING_RAYS_INCREASE);
      this.overhealing += calculateOverhealing(event, GLEAMING_RAYS_INCREASE);
    }
  }

  onDamage(event: DamageEvent) {
    if (this.dawnlightsActive > 0) {
      this.damageDone += calculateEffectiveDamage(event, GLEAMING_RAYS_INCREASE);
    }
  }

  onApply() {
    this.dawnlightsActive += 1;
  }

  onRemove() {
    this.dawnlightsActive -= 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            Effective Healing: {formatNumber(this.healingDone)} <br />
            Overhealing: {formatNumber(this.overhealing)} <br />
            Effective Damage: {formatNumber(this.damageDone)}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.GLEAMING_RAYS_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDone} />
          </div>
          {this.damageDone > 0 && (
            <div>
              <ItemDamageDone amount={this.damageDone} />
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default GleamingRays;
