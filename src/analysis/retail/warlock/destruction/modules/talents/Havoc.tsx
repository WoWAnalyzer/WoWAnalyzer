import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { Talent } from 'common/TALENTS/types';

const HAVOCABLE_ABILITIES = [
  SPELLS.CHAOS_BOLT,
  SPELLS.INCINERATE,
  SPELLS.CONFLAGRATE,
  TALENTS.SOUL_FIRE_TALENT,
  TALENTS.SOULBURN_TALENT,
  SPELLS.IMMOLATE,
];

class Havoc extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damage = 0;
  talent: Talent = TALENTS.HAVOC_TALENT;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS.MAYHEM_TALENT)) {
      this.talent = TALENTS.MAYHEM_TALENT;
    }
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.HAVOC_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.MAYHEM_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(HAVOCABLE_ABILITIES),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    // filtering to just hits that can be duplicated will make this a little more accurate,
    // but it'll still also count spells cast directly on a target with havoc
    if (!enemy || !enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp)) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.HAVOC.id) / this.owner.fightDuration;
  }

  shouldShowUptime() {
    return this.selectedCombatant.hasTalent(TALENTS.MAYHEM_TALENT);
  }

  // TODO: this could perhaps be reworked somehow to be more accurate but not sure how yet. Take it as a Havoc v1.0
  statistic() {
    if (this.damage === 0) {
      return null;
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You cleaved {formatThousands(this.damage)} damage to targets afflicted by your Havoc.
            <br />
            <br />
            Note: This number is probably higher than it should be, as it also counts the damage you
            did directly to the Havoc target (not just the cleaved damage).
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          <ItemDamageDone amount={this.damage} />
          {this.shouldShowUptime() && (
            <>
              <br />
              <UptimeIcon />
              {formatPercentage(this.uptime, 0)}%<small> uptime</small>
            </>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Havoc;
