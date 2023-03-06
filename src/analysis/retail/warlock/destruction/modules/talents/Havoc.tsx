import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { Talent } from 'common/TALENTS/types';

class Havoc extends Analyzer {
  get dps() {
    return (this.damage / this.owner.fightDuration) * 1000;
  }

  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damage = 0;
  talent: Talent = TALENTS.HAVOC_TALENT;

  HAVOCABLE_ABILITY_IDS = [
    SPELLS.CHAOS_BOLT,
    SPELLS.INCINERATE,
    SPELLS.CONFLAGRATE,
    TALENTS.SOUL_FIRE_TALENT,
    TALENTS.SOULBURN_TALENT,
    SPELLS.IMMOLATE,
  ].map((s) => s.id);

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS.MAYHEM_TALENT)) {
      this.talent = TALENTS.MAYHEM_TALENT;
    }
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.HAVOC_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.MAYHEM_TALENT);

    if (this.active) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    }
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    // filtering to just hits that can be duplicated will make this a little more accurate,
    // but it'll still also count spells cast directly on a target with havoc
    if (
      !enemy ||
      !enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp) ||
      !this.HAVOCABLE_ABILITY_IDS.includes(event.ability.guid)
    ) {
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
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>
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
