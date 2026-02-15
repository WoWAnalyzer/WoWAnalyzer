import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';

import TALENTS from 'common/TALENTS/priest';

import Events from 'parser/core/Events';

class DepthOfShadows extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  petsSummoned = 0; //total pets made during fight
  casts = 0; //total times the pet was cast during the fight.
  //Depth of Shadows causes other spells to create this pet.

  constructor(options: Options) {
    super(options);

    // Depth of Shadows was removed / baked into the Shadowfiend talent
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHADOWFIEND_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MINDBENDER_SHADOW_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOWFIEND_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(TALENTS.MINDBENDER_SHADOW_TALENT),
      this.onSummon,
    );

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(TALENTS.SHADOWFIEND_TALENT),
      this.onSummon,
    );
  }

  onCast() {
    this.casts += 1;
  }

  onSummon() {
    this.petsSummoned += 1;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.SHADOWFIEND_TALENT}>
          <div>
            {this.petsSummoned - this.casts}{' '}
            <small>
              extra{' '}
              {this.owner.selectedCombatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT) && (
                <SpellLink spell={TALENTS.MINDBENDER_SHADOW_TALENT} />
              )}
              {!this.owner.selectedCombatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT) && (
                <SpellLink spell={TALENTS.SHADOWFIEND_TALENT} />
              )}{' '}
              summoned
            </small>{' '}
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DepthOfShadows;
