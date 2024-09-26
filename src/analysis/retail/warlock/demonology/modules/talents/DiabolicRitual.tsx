import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DiabolicRitual extends Analyzer {
  felseeker_damage = 0;
  wicked_cleave_damage = 0;
  chaos_salvo_damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIABOLIC_RITUAL_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.FELSEEKER_DAMAGE),
      this.handleFelseekerDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.WICKED_CLEAVE_DAMAGE),
      this.handleWickedCleaveDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.CHAOS_SALVO_DAMAGE),
      this.handleChaosSalvoDamage,
    );
  }

  handleFelseekerDamage(event: DamageEvent) {
    this.felseeker_damage += event.amount + (event.absorbed || 0);
  }

  handleWickedCleaveDamage(event: DamageEvent) {
    this.wicked_cleave_damage += event.amount + (event.absorbed || 0);
  }

  handleChaosSalvoDamage(event: DamageEvent) {
    this.chaos_salvo_damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.felseeker_damage + this.wicked_cleave_damage + this.chaos_salvo_damage)} damage`}
      >
        <BoringSpellValueText spell={TALENTS.DIABOLIC_RITUAL_TALENT}>
          <small>Mother of Chaos, Pit Lord, Overlord damage</small>
          <br />
          <ItemDamageDone
            amount={this.felseeker_damage + this.wicked_cleave_damage + this.chaos_salvo_damage}
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DiabolicRitual;
