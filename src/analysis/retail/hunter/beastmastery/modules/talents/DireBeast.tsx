import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Haste from 'interface/icons/Haste';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventSourceString, encodeEventTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { DIRE_BEAST_HASTE_PERCENT } from '../../constants';

/**
 * Summons a powerful wild beast that attacks the target and roars, increasing your Haste by 5% for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/TY846VxkCwAfPLbG#fight=46&type=damage-done&source=411
 *
 * TODO: Ensure it doesn't conflict with Dire Command legendary.
 */

class DireBeast extends Analyzer {
  damage = 0;
  activeDireBeasts: string[] = [];
  targetId: string | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIRE_BEAST_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_SUMMON),
      this.onDireSummon,
    );
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration
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
    this.targetId = encodeEventTargetString(event);
    if (!this.targetId) {
      return;
    }
    this.activeDireBeasts = [];
    this.activeDireBeasts.push(this.targetId);
    this.targetId = null;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>You had {formatPercentage(this.uptime)}% uptime on the Dire Beast Haste buff.</>}
      >
        <BoringSpellValueText spellId={TALENTS.DIRE_BEAST_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <Haste /> {formatPercentage(DIRE_BEAST_HASTE_PERCENT * this.uptime)}% Haste
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireBeast;
