import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventSourceString, encodeEventTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Marksmanship
 * Black Arrow's periodic damage has a small chance to rouse the dead, summoning a Dark Minion to fight alongside you for 20 sec.
 *
 * Beast Mastery
 * When summoning a Dire Beast, you have a 10% chance to instead summon a Dark Hound that deals significantly increased damage.
 */

class DarkHound extends Analyzer {
  damage = 0;
  activeDarkHounds: string[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.CORPSECALLER_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.WAILING_DEAD_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DARK_HOUND_SUMMON),
      this.onSummon,
    );
  }

  onPetDamage(event: DamageEvent) {
    const sourceId = encodeEventSourceString(event);
    if (!sourceId) {
      return;
    }
    if (this.activeDarkHounds.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  onSummon(event: SummonEvent) {
    const targetId = encodeEventTargetString(event);
    if (!targetId) {
      return;
    }
    this.activeDarkHounds.push(targetId);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.DARK_HOUND_SUMMON}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DarkHound;
