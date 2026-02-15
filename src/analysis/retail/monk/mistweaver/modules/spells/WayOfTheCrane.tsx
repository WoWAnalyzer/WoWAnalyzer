import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { SpellLink } from 'interface/index';
import { formatPercentage, formatNumber } from 'common/format';
import {
  AT_BLACKOUT_KICK,
  AT_TIGER_PALM,
  BLACKOUT_KICK_CAST_LINK,
  TIGER_PALM_CAST_LINK,
} from '../../normalizers/EventLinks/EventLinkConstants';
import { WAY_OF_THE_CRANE_BOK_CLEAVE } from '../../constants';
import HIT_TYPES from 'game/HIT_TYPES';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';

const BOK_CLEAVE_TOLERANCE = 0.05;

class WayOfTheCrane extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
  };

  protected critEffectBonus!: CritEffectBonus;

  tigerPalmDamage: number = 0;
  tigerPalmHealing: number = 0;
  tigerPalmOverheal: number = 0;
  blackoutKickDamage: number = 0;
  blackoutKickHealing: number = 0;
  blackoutKickOverheal: number = 0;
  spinningCraneKickDamage: number = 0;
  spinningCraneKickHealing: number = 0;
  spinningCraneKickOverheal: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.WAY_OF_THE_CRANE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM),
      this.onTigerPalmCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.onBlackoutKickCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onSpinningCraneKickDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.WOTC_HEAL, SPELLS.WOTC_CRIT_HEAL]),
      this.onHeal,
    );
  }

  private getNormalizedDamage(event: DamageEvent): number {
    const totalDamage = effectiveDamage(event);
    return event.hitType === HIT_TYPES.CRIT
      ? totalDamage / this.critEffectBonus.getBonus(event)
      : totalDamage;
  }

  onTigerPalmCast(event: CastEvent) {
    const tigerPalmEvents = GetRelatedEvents<DamageEvent>(event, TIGER_PALM_CAST_LINK);
    if (tigerPalmEvents.length === 0) return;

    // just take the latest tiger palm as the extra cast from wotc
    const wotcTigerPalm = tigerPalmEvents.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest,
    );

    const ATEvents = GetRelatedEvents<HealEvent>(wotcTigerPalm, AT_TIGER_PALM);
    this.tigerPalmHealing += ATEvents.reduce((total, event) => total + effectiveHealing(event), 0);
    this.tigerPalmOverheal += ATEvents.reduce((total, event) => total + (event.overheal || 0), 0);

    this.tigerPalmDamage += effectiveDamage(wotcTigerPalm);
  }

  onBlackoutKickCast(event: CastEvent) {
    const blackoutKickEvents = GetRelatedEvents<DamageEvent>(event, BLACKOUT_KICK_CAST_LINK);
    if (blackoutKickEvents.length === 0) return;

    // rough checks for bok cleaves with a 5% tolerance on their dmg values
    // crits normalized in order to avoid skewing only counting crits
    const normalizedDamages = blackoutKickEvents.map((e) => this.getNormalizedDamage(e));
    const maxNormalizedDamage = Math.max(...normalizedDamages);

    blackoutKickEvents.forEach((blackoutKick, i) => {
      const damageRatio = normalizedDamages[i] / maxNormalizedDamage;
      if (Math.abs(damageRatio - WAY_OF_THE_CRANE_BOK_CLEAVE) > BOK_CLEAVE_TOLERANCE) return;

      const ATEvents = GetRelatedEvents<HealEvent>(blackoutKick, AT_BLACKOUT_KICK);
      ATEvents.forEach((event) => {
        this.blackoutKickHealing += effectiveHealing(event);
        this.blackoutKickOverheal += event.overheal || 0;
      });

      this.blackoutKickDamage += effectiveDamage(blackoutKick);
    });
  }

  onSpinningCraneKickDamage(event: DamageEvent) {
    this.spinningCraneKickDamage += effectiveDamage(event);
  }

  onHeal(event: HealEvent) {
    this.spinningCraneKickHealing += effectiveHealing(event);
    this.spinningCraneKickOverheal += event.overheal || 0;
  }

  get totalHealing(): number {
    return this.tigerPalmHealing + this.blackoutKickHealing + this.spinningCraneKickHealing;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.WAY_OF_THE_CRANE_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Spell</th>
                  <th>Healing</th>
                  <th>Damage</th>
                  <th>Effective Heal %</th>
                </tr>
              </thead>
              <tbody>
                <tr key="tigerPalm">
                  <td>
                    <SpellLink spell={SPELLS.TIGER_PALM} />
                  </td>
                  <td>{formatNumber(this.tigerPalmHealing)}</td>
                  <td>{formatNumber(this.tigerPalmDamage)}</td>
                  <td>
                    {formatPercentage(
                      this.tigerPalmHealing / (this.tigerPalmHealing + this.tigerPalmOverheal),
                    )}
                    %
                  </td>
                </tr>
                <tr key="blackoutKick">
                  <td>
                    <SpellLink spell={SPELLS.BLACKOUT_KICK} />
                  </td>
                  <td>{formatNumber(this.blackoutKickHealing)}</td>
                  <td>{formatNumber(this.blackoutKickDamage)}</td>
                  <td>
                    {formatPercentage(
                      this.blackoutKickHealing /
                        (this.blackoutKickHealing + this.blackoutKickOverheal),
                    )}
                    %
                  </td>
                </tr>
                <tr key="spinningCraneKick">
                  <td>
                    <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} />
                  </td>
                  <td>{formatNumber(this.spinningCraneKickHealing)}</td>
                  <td>{formatNumber(this.spinningCraneKickDamage)}</td>
                  <td>
                    {formatPercentage(
                      this.spinningCraneKickHealing /
                        (this.spinningCraneKickHealing + this.spinningCraneKickOverheal),
                    )}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
            <div>
              <small>* Effective Heal % is the ratio of total actualized healing to overheal</small>
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.WAY_OF_THE_CRANE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <ItemDamageDone amount={this.tigerPalmDamage + this.blackoutKickDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default WayOfTheCrane;
