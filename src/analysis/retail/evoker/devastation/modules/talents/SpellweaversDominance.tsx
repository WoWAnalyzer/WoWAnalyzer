import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamageFromCritDamageIncrease } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { DEEP_BREATH_SPELLS } from 'analysis/retail/evoker/shared';

class SpellweaversDominance extends Analyzer {
  SpellweaversDominanceDamage: number = 0;
  heatWaveDamageCritMultiplier: number = SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER;
  spellsToTrack = [
    SPELLS.DISINTEGRATE,
    SPELLS.FIRE_BREATH_DOT,
    SPELLS.ETERNITY_SURGE_DAM,
    SPELLS.LIVING_FLAME_DAMAGE,
    SPELLS.PYRE,
    SPELLS.FIRESTORM_DAMAGE,
    SPELLS.SHATTERING_STAR,
    ...DEEP_BREATH_SPELLS,
    SPELLS.AZURE_STRIKE,
    SPELLS.UNRAVEL,
  ];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPELLWEAVERS_DOMINANCE_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.spellsToTrack), this.onHit);
  }

  onHit(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.SpellweaversDominanceDamage += calculateEffectiveDamageFromCritDamageIncrease(
        event,
        SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<li>Damage: {formatNumber(this.SpellweaversDominanceDamage)}</li>}
      >
        <TalentSpellText talent={TALENTS.SPELLWEAVERS_DOMINANCE_TALENT}>
          <ItemDamageDone amount={this.SpellweaversDominanceDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SpellweaversDominance;
