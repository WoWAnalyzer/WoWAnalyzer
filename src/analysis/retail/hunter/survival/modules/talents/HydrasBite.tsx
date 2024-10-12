import { HYDRAS_BITE_DOT_MODIFIER } from 'analysis/retail/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  HasTarget,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Serpent Sting fires arrows at 2 additional enemies near your target, and its damage over time is increased by 10%.
 *
 * Example log: https://www.warcraftlogs.com/reports/6XmjYqTnc3DM7VQx/#fight=6&source=21
 */

class HydrasBite extends Analyzer {
  private casts: number = 0;
  private spreadDamage: number = 0;
  private increasedMainTargetDamage: number = 0;
  private extraApplications: number = 0;
  private mainTargets: string[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.HYDRAS_BITE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SURVIVAL),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SURVIVAL),
      this.onDamage,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SURVIVAL),
      this.onDebuffApplication,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SURVIVAL),
      this.onDebuffApplication,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SURVIVAL),
      this.onRemoveDebuff,
    );
  }

  onCast(event: CastEvent) {
    if (!HasTarget(event)) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.mainTargets.push(target);
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this.mainTargets.includes(target)) {
      this.increasedMainTargetDamage += calculateEffectiveDamage(event, HYDRAS_BITE_DOT_MODIFIER);
    } else {
      this.spreadDamage += event.amount + (event.absorbed || 0);
    }
  }

  onDebuffApplication(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this.mainTargets.includes(target)) {
      return;
    }
    this.extraApplications += 1;
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    const index = this.mainTargets.indexOf(target);
    if (index !== -1) {
      this.mainTargets.splice(index, 1);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Damage</th>
                  <th>Debuffs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Main</td>
                  <td>
                    <ItemDamageDone amount={this.increasedMainTargetDamage} />
                  </td>
                  <td>{this.casts}</td>
                </tr>
                <tr>
                  <td>Other</td>
                  <td>
                    <ItemDamageDone amount={this.spreadDamage} />
                  </td>
                  <td>{this.extraApplications}</td>
                </tr>
              </tbody>
            </table>
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.HYDRAS_BITE_TALENT}>
          <>
            <ItemDamageDone amount={this.increasedMainTargetDamage + this.spreadDamage} /> <br />
            {(this.extraApplications / this.casts).toFixed(1)} <small>extra dots/cast</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HydrasBite;
