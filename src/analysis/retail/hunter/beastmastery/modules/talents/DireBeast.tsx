import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventSourceString, encodeEventTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Damage from your bleed effects has a 4% chance of attracting a powerful wild beast
 * that attacks your target for 8 sec.
 */

class DireBeast extends Analyzer {
  damage = 0;
  activeDireBeasts: string[] = [];
  lastKillCommandCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIRE_BEAST_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_SUMMON),
      this.onDireSummon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
      this.killCommandCast,
    );
  }

  onPetDamage(event: DamageEvent) {
    const sourceId = encodeEventSourceString(event);
    if (!sourceId) {
      return;
    }
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  onDireSummon(event: SummonEvent) {
    if (
      event.timestamp - this.lastKillCommandCast < MS_BUFFER_100 &&
      this.selectedCombatant.hasTalent(TALENTS.DIRE_COMMAND_TALENT)
    ) {
      return;
    }
    const targetId = encodeEventTargetString(event);
    if (!targetId) {
      return;
    }
    this.activeDireBeasts.push(targetId);
  }

  killCommandCast(event: CastEvent) {
    this.lastKillCommandCast = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.DIRE_BEAST_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireBeast;
