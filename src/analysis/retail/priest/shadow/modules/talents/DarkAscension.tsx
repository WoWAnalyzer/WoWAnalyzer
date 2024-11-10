import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import { DARK_ASCENSION_MULTIPLIER } from '../../constants'; //gives damage to non-periodic Shadow Damage.  It does this by buffing specific spells

class DarkAscension extends Analyzer {
  totalDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_ASCENSION_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.MIND_SPIKE_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_CRASH_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWFIEND),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.MINDBENDER_SHADOW_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.VOIDWRAITH_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INESCAPABLE_TORMENT_TALENT_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    if (
      !event.tick &&
      this.selectedCombatant.hasBuff(TALENTS.DARK_ASCENSION_TALENT.id, event.timestamp)
    ) {
      //nonperiodic damage is increased by Dark Ascension,
      this.totalDamage += calculateEffectiveDamage(event, DARK_ASCENSION_MULTIPLIER);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip="This is the bonus damage to nonperiodic spells from Dark Ascension"
      >
        <BoringSpellValueText spell={TALENTS.DARK_ASCENSION_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default DarkAscension;
