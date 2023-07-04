import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_BONUS_PER_STACK = 0.005;
const AFFECTED_SPELLS = [
  SPELLS.ICICLE_DAMAGE,
  SPELLS.ICE_LANCE_DAMAGE,
  SPELLS.BLIZZARD_DAMAGE,
  SPELLS.FLURRY_DAMAGE,
  SPELLS.FROSTBOLT_DAMAGE,
  SPELLS.FROZEN_ORB_DAMAGE,
  SPELLS.COMET_STORM_DAMAGE,
  SPELLS.GLACIAL_SPIKE_DAMAGE,
  SPELLS.FROST_NOVA,
  SPELLS.EBONBOLT_DAMAGE,
  SPELLS.CONE_OF_COLD,
  TALENTS.RAY_OF_FROST_TALENT,
  TALENTS.ICE_NOVA_TALENT,
  SPELLS.WATERBOLT,
];

class BoneChilling extends Analyzer {
  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BONE_CHILLING_TALENT);
    if (this.active) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(AFFECTED_SPELLS),
        this.onAffectedDamage,
      );
    }
  }

  onAffectedDamage(event: DamageEvent) {
    const buffInfo: any = this.selectedCombatant.getBuff(SPELLS.BONE_CHILLING_BUFF.id);
    if (!buffInfo) {
      return;
    }
    const mod = buffInfo.stacks * DAMAGE_BONUS_PER_STACK;
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.BONE_CHILLING_BUFF.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Total damage increase: ${formatNumber(this.totalDamage)}`}
      >
        <BoringSpellValueText spell={TALENTS.BONE_CHILLING_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>Buff uptime</small>
          <br />
          {this.owner.formatItemDamageDone(this.totalDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BoneChilling;
