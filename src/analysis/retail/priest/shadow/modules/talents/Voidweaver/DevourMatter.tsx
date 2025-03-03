import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';

class DevourMatter extends Analyzer {
  damage = 0;
  hits = 0;
  insanityGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEVOUR_MATTER_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    if (event.absorbed !== undefined) {
      //console.log(event.absorbed, "absorbed")
      //Since Devour Matter deals a set amount of damage that is not seperated from SW:D in the logs,
      //and that SW:D has several different buffs effecting its damage, I don't know how to seperate the damage contribution.
      //this.damage += calculateEffectiveDamage(event, 0);
      this.hits += 1;
      this.insanityGained += 5; //gain 5 insanity when hitting an absorb shield.
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.HERO_TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.DEVOUR_MATTER_TALENT}>
          <div>
            <>{this.hits}</> <small>shields consumed</small>
          </div>
          <div>
            <ItemInsanityGained amount={this.insanityGained} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DevourMatter;
