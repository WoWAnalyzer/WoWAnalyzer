import SPELLS from 'common/SPELLS/shaman';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { STORMSTRIKE_CAST_SPELLS, STORMSTRIKE_DAMAGE_SPELLS } from '../../constants';

const STORMBRINGER_DAMAGE_MODIFIER = 0.25;

class Stormbringer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  protected damageGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STORMBRINGER_BUFF),
      this.onStormbringerApplied,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STORMBRINGER_BUFF),
      this.onStormbringerApplied,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(STORMSTRIKE_CAST_SPELLS),
      this.onStormstrikeUseWithStormbringerBuff,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStrikeDamage,
    );
  }

  onStormbringerApplied() {
    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.STORMSTRIKE_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS_SHAMAN.STORMSTRIKE_TALENT.id);
    }

    if (this.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id);
    }
  }

  onStormstrikeUseWithStormbringerBuff() {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }
  }

  onStrikeDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }

    this.damageGained += calculateEffectiveDamage(event, STORMBRINGER_DAMAGE_MODIFIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="small"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spellId={SPELLS.STORMBRINGER.id}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormbringer;
