import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent, CastEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { EYE_OF_INFINITY_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

class EyeOfInfinity extends Analyzer {
  eternitySurgeMainTargetDamage: number = 0;
  eyeOfInfinityDamage: number = 0;
  eternitySurgeMainTarget: number = 0;
  disintegrateMainTarget: number = 0;
  lastEternitySurgeHit: number = 0;
  hitCounter: number = 0;

  eternitySurge = [SPELLS.ETERNITY_SURGE, SPELLS.ETERNITY_SURGE_FONT];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_INFINITY_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ETERNITY_SURGE_DAM),
      this.onHit,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this.onDisintegrateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.eternitySurge),
      this.onEternitySurgeCast,
    );
  }

  onDisintegrateCast(event: CastEvent) {
    if (event.targetID !== undefined) {
      this.disintegrateMainTarget = event.targetID;
    }
  }
  onEternitySurgeCast(event: CastEvent) {
    if (event.targetID !== undefined) {
      this.eternitySurgeMainTarget = event.targetID;
    }
  }

  onHit(event: DamageEvent) {
    if (
      (event.targetID === this.disintegrateMainTarget ||
        event.targetID === this.eternitySurgeMainTarget) &&
      event.timestamp > this.lastEternitySurgeHit
    ) {
      this.lastEternitySurgeHit = event.timestamp;
      this.eternitySurgeMainTargetDamage += event.amount;
      if (event.absorbed !== undefined) {
        this.eternitySurgeMainTargetDamage += event.absorbed;
      }
      this.hitCounter += 1;
    }
  }

  statistic() {
    this.eyeOfInfinityDamage =
      this.eternitySurgeMainTargetDamage -
      this.eternitySurgeMainTargetDamage / (1 + EYE_OF_INFINITY_MULTIPLIER);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.eyeOfInfinityDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.EYE_OF_INFINITY_TALENT}>
          <ItemDamageDone amount={this.eyeOfInfinityDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EyeOfInfinity;
