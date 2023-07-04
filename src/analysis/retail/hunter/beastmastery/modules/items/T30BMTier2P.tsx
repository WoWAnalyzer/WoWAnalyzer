import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';

const DAMAGE_AMP = 0.15;
/**
 * https://www.wowhead.com/spell=405524/hunter-beast-mastery-10-1-class-set-2pc
 * Cobra Shot and Kill Command damage increased by 15%.
 */
export default class T30BMTier2P extends Analyzer {
  killCommandDamage: number = 0;
  cobraShotDamage: number = 0;
  totalDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_SHARED_DAMAGE),
      this.onKillCommandDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.COBRA_SHOT_TALENT),
      this.onCobraShotDamage,
    );
  }

  onCobraShotDamage(event: DamageEvent) {
    this.cobraShotDamage += calculateEffectiveDamage(event, DAMAGE_AMP);
  }
  onKillCommandDamage(event: DamageEvent) {
    this.killCommandDamage += calculateEffectiveDamage(event, DAMAGE_AMP);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Cobra Shot damage: {formatNumber(this.cobraShotDamage)}
            <br />
            Kill Command damage: {formatNumber(this.killCommandDamage)}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.T30_2P_BONUS_BEAST_MASTERY}>
          <ItemDamageDone amount={this.cobraShotDamage + this.killCommandDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
