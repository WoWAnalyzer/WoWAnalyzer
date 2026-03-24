import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  DamageEvent,
  RemoveDebuffEvent,
  CastEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Doom extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  enemies!: Enemies;
  doom = {
    applyDebuffCount: 0,
    removeDebuffCount: 0,
    damage: 0,
    hits: 0,
  };

  demonboltCasts = 0;
  demonboltWithCoreCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DOOM_TALENT);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_DEBUFF),
      this.onDoomApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_DEBUFF),
      this.onDoomRemove,
    );
    // Listen for Doom damage events (uses different spell ID than debuff)
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DOOM_DAMAGE),
      this.onDoomDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltCast,
    );
  }

  onDoomApply(event: ApplyDebuffEvent) {
    this.doom.applyDebuffCount += 1;
  }

  onDoomRemove(event: RemoveDebuffEvent) {
    this.doom.removeDebuffCount += 1;
  }

  onDoomDamage(event: DamageEvent) {
    this.doom.hits += 1;
    const damage = event.amount + (event.absorbed || 0);
    this.doom.damage += damage;
  }

  onDemonboltCast(event: CastEvent) {
    this.demonboltCasts += 1;

    // Check if player has Demonic Core buff when casting Demonbolt
    const hasCore = this.selectedCombatant.hasBuff(SPELLS.DEMONIC_CORE_BUFF.id, event.timestamp);
    if (hasCore) {
      this.demonboltWithCoreCasts += 1;
    }
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.DOOM_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.doom.damage)} damage
            <br />
            Doom tracking - 20s debuff applied by Demonbolt when consuming Demonic Core
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.DOOM_DEBUFF}>
          <ItemDamageDone amount={this.doom.damage} />
          <br />
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>Uptime</small>
          <br />
          {this.doom.applyDebuffCount} <small>Applications</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Doom;
