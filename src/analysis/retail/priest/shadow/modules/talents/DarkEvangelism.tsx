import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import { DARK_EVANGELISM_DAMAGE_MULTIPLIER } from '../../constants';

class DarkEvangelism extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_MADNESS_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VAMPIRIC_TOUCH),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
  }

  //Dark Evangelism buffs the perodic damage of Vampiric Touch, Shadow Word: Pain, Devouring Plague, Void Torrent, Mind Flay, and Mind Flay Insanity.
  onDamage(event: DamageEvent) {
    if (event.tick) {
      this.damage += calculateEffectiveDamage(event, DARK_EVANGELISM_DAMAGE_MULTIPLIER);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="This talent buffs the periodic damage from Vampiric Touch, Shadow Word: Pain, Devouring Plague, Mind Flay, Mind Flay: Insanity and Void Torrent"
      >
        <BoringSpellValueText spell={TALENTS.DARK_EVANGELISM_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DarkEvangelism;
