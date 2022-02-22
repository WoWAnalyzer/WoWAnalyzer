import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { ONE_SECOND_IN_MS } from '@wowanalyzer/hunter';
import {
  BRUTAL_PROJECTILES_DOUBLE_TAP_RAMP_CAP,
  BRUTAL_PROJECTILES_RAMP_CAP,
  BRUTAL_PROJECTILES_RAMP_DAMAGE,
} from '@wowanalyzer/hunter-marksmanship/src/constants';

/**
 * Your auto attacks have a 10% chance to cause your next Rapid Fire to deal 1.0% increased damage for each shot.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Mwf9KAbVP8JNhdHG#fight=26&type=damage-done&source=37
 *
 */
class BrutalProjectiles extends Analyzer {
  conduitRank = 0;
  addedDamage = 0;
  currentTick = 0;
  procs = 0;
  overwrittenProcs = 0;
  usedProcs = 0;
  targetID?: number;
  removeTimestamp = 0;
  doubleTappedRapidFire = false;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.BRUTAL_PROJECTILES_CONDUIT.id,
    );
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_DAMAGE),
      this.onRapidFireDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE),
      this.onRapidFireCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRUTAL_PROJECTILES_NEXT_RF_BUFF),
      this.onApplyBrutalProjectiles,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRUTAL_PROJECTILES_NEXT_RF_BUFF),
      this.onRefreshBrutalProjectiles,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BRUTAL_PROJECTILES_DURING_RF_BUFF),
      this.onRemoveBrutalProjectiles,
    );
  }

  onApplyBrutalProjectiles(event: ApplyBuffEvent) {
    this.procs += 1;
  }

  onRefreshBrutalProjectiles(event: RefreshBuffEvent) {
    this.procs += 1;
    this.overwrittenProcs += 1;
  }

  onRemoveBrutalProjectiles(event: RemoveBuffEvent) {
    this.removeTimestamp = event.timestamp;
  }

  onRapidFireCast(event: CastEvent) {
    this.currentTick = 0;
    if (this.selectedCombatant.hasBuff(SPELLS.BRUTAL_PROJECTILES_NEXT_RF_BUFF.id)) {
      this.usedProcs += 1;
      this.targetID = event.targetID;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.DOUBLE_TAP_TALENT.id)) {
      this.doubleTappedRapidFire = true;
    } else {
      this.doubleTappedRapidFire = false;
    }
  }

  onRapidFireDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.BRUTAL_PROJECTILES_DURING_RF_BUFF.id) &&
      //Some damage events hit after the buff has fallen off
      event.timestamp > this.removeTimestamp + ONE_SECOND_IN_MS
    ) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(
      event,
      BRUTAL_PROJECTILES_RAMP_DAMAGE[this.conduitRank] * this.currentTick,
    );
    if (
      //Only increase currentTick if main target has been hit (first target that will be hit always)
      this.targetID === event.targetID &&
      //Only increase currentTick if it's below the ramp cap which is determined by whether or not the Rapid Fire was affected by Double Tap
      (this.currentTick < BRUTAL_PROJECTILES_RAMP_CAP ||
        (this.doubleTappedRapidFire && this.currentTick > BRUTAL_PROJECTILES_DOUBLE_TAP_RAMP_CAP))
    ) {
      this.currentTick += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            You used {this.usedProcs} out of {this.procs} gained. You overwrote the Brutal
            Projectiles buff {this.overwrittenProcs} times.
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.BRUTAL_PROJECTILES_CONDUIT.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default BrutalProjectiles;
