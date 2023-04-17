import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellUsable from '../core/SpellUsable';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { SpellLink } from 'interface';

const KILL_COMMAND_INCREASED_DAMAGE = 0.1;

/**
 * Hunter Beast Mastery Class Set 2pc
 * Kill Command damage increased by 10% and it has a 10% chance to reset the cooldown on Barbed Shot.
 */
export default class T29BMTier2P extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  totalDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T29);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_SHARED_DAMAGE),
      this.onKillCommandDamage,
    );
  }

  onKillCommandDamage(event: DamageEvent) {
    this.totalDamage += calculateEffectiveDamage(event, KILL_COMMAND_INCREASED_DAMAGE);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.T29_2P_BONUS_BEAST_MASTERY}>
          <ItemDamageDone amount={this.totalDamage} />
          <br />≈{this.spellUsable.barbedShotResetsFromT29}{' '}
          <small>
            <SpellLink id={TALENTS_HUNTER.BARBED_SHOT_TALENT.id} /> Resets
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
