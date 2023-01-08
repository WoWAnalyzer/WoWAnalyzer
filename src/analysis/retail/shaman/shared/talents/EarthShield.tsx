import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD } from '../constants';

export const EARTHSHIELD_HEALING_INCREASE = 0.2;

class EarthShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healing = 0;
  buffHealing = 0;
  earthShieldHealingIncrease = EARTHSHIELD_HEALING_INCREASE;
  category = STATISTIC_CATEGORY.TALENTS;

  constructor(options: Options) {
    super(options);
    const isRsham = this.selectedCombatant.specId === SPECS.RESTORATION_SHAMAN.id;
    this.active = isRsham || this.selectedCombatant.hasTalent(TALENTS_SHAMAN.EARTH_SHIELD_TALENT);

    if (!this.active) {
      return;
    }

    if (isRsham) {
      this.category = STATISTIC_CATEGORY.GENERAL;
    }
    // TODO: Update for dragonflight
    // const conduitRank = 0;
    //
    // if (conduitRank) {
    //   this.earthShieldHealingIncrease += EMBRACE_OF_EARTH_RANKS[conduitRank] / 100;
    // }

    // event listener for direct heals when taking damage with earth shield
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
      this.onEarthShieldHeal,
    );

    const HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD_FILTERED = HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD.filter(
      (p) => p !== SPELLS.EARTH_SHIELD_HEAL,
    );
    // event listener for healing being buffed by having earth shield on the target
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD_FILTERED),
      this.onEarthShieldAmpSpellHeal,
    );
  }

  get uptime() {
    return Object.values(this.combatants.players).reduce(
      (uptime, player) =>
        uptime + player.getBuffUptime(TALENTS_SHAMAN.EARTH_SHIELD_TALENT.id, this.owner.playerId),
      0,
    );
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onEarthShieldHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  onEarthShieldAmpSpellHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (combatant && combatant.hasBuff(TALENTS_SHAMAN.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.buffHealing += calculateEffectiveHealing(event, this.earthShieldHealingIncrease);
    }
  }

  statistic() {
    return (
      <StatisticBox
        label={<SpellLink id={TALENTS_SHAMAN.EARTH_SHIELD_TALENT.id} />}
        category={this.category}
        position={STATISTIC_ORDER.OPTIONAL(45)}
        tooltip={
          <Trans id="shaman.shared.earthShield.statistic.tooltip">
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% from the
            HoT and {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.buffHealing))}
            % from the healing increase.
          </Trans>
        }
        value={
          <div>
            <UptimeIcon /> {formatPercentage(this.uptimePercent)}% <small>uptime</small>
            <br />
            <ItemHealingDone amount={this.healing + this.buffHealing} />
          </div>
        }
      />
    );
  }
}

export default EarthShield;
