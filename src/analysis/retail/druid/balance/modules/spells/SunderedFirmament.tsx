import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import SPELLS from 'common/SPELLS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ResourceIcon } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const AP_PER_TICK = 0.5;

/**
 * **Sundered Firmament**
 * Spec Talent
 *
 * Every other Eclipse creates a Fury of Elune at 25% effectiveness that follows your current target for 8 sec.
 */
export default class SunderedFirmament extends Analyzer {
  totalDamage = 0;
  gainedAP = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FURY_OF_ELUNE_DAMAGE_SUNDERED_FIRMAMENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SUNDERED_FIRMAMENT_RESOURCE),
      this.onEnergize,
    );
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount;
  }

  onEnergize(_: ResourceChangeEvent) {
    // each tick gives 0.5 AsP, but the resourceChange in events truncates and so will list as 'zero'
    // we hardcode here to get around that
    this.gainedAP += AP_PER_TICK;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(15)} size="flexible">
        <TalentSpellText talent={TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT}>
          <>
            <ResourceIcon id={RESOURCE_TYPES.ASTRAL_POWER.id} />{' '}
            {formatNumber(this.owner.getPerMinute(this.gainedAP))}{' '}
            <small>Astral Power per minute</small>
            <br />
            <ItemPercentDamageDone amount={this.totalDamage} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
