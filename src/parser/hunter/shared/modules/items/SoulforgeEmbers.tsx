import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellIcon } from 'interface';

/**
 * Launching a Flare into your Tar Trap causes all enemies inside of the Tar Trap to burn for (150% of Attack power) Fire damage over 12 sec.
 *
 * Example log:
 *
 */
class SoulforgeEmbers extends Analyzer {

  damage: number = 0;
  flareCasts: number = 0;
  lastFlareCastTimestamp: number = 0;
  tarTrapCasts: number = 0;
  lastTarTrapCastTimestamp: number = 0;
  lostEmberApplications: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SOULFORGE_EMBERS_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLARE), this.onFlare);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TAR_TRAP), this.onTarTrap);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SOULFORGE_EMBERS_DAMAGE), this.onEmbersDamage);
  }

  onFlare(event: CastEvent) {
    this.flareCasts += 1;
    this.lastFlareCastTimestamp = event.timestamp;
  }

  onTarTrap(event: CastEvent) {
    this.tarTrapCasts += 1;
    this.lastTarTrapCastTimestamp = event.timestamp;
  }

  onEmbersDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.SOULFORGE_EMBERS_EFFECT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          {this.flareCasts} <SpellIcon id={SPELLS.FLARE.id} noLink /> / {this.tarTrapCasts} <SpellIcon id={SPELLS.TAR_TRAP.id} noLink />
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default SoulforgeEmbers;
