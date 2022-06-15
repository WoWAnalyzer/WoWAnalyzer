import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import StaminaIcon from 'interface/icons/Stamina';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
/**
 * Feral Druid Tier 28 - 4pc - Sickle of the Lion
 * Entering Berserk causes you to strike all nearby enemies, dealing (400.25% of Attack power)
 * Bleed damage over 10 sec. Deals reduced damage beyond 8 targets.
 */
class Tier28_4pc extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  abilityTracker!: AbilityTracker;

  /** Either Berserk or Incarnation depending on talent */
  cdSpell: Spell;
  /** The total number of times Sickle of the Lion was applied */
  totalApplications: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece();

    this.cdSpell = this.selectedCombatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)
      ? SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT
      : SPELLS.BERSERK;

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SICKLE_OF_THE_LION),
      this.onApplySickle,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SICKLE_OF_THE_LION),
      this.onApplySickle,
    );
  }

  onApplySickle(_: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.totalApplications += 1;
  }

  get totalDamage() {
    return this.abilityTracker.getAbility(SPELLS.SICKLE_OF_THE_LION.id).damageEffective;
  }

  get totalCasts() {
    return this.abilityTracker.getAbility(this.cdSpell.id).casts;
  }

  get avgHits() {
    return this.totalCasts === 0 ? 0 : this.totalApplications / this.totalCasts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(21)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            This is the effect granted by the <strong>Tier 28 4-piece set bonus</strong>.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SICKLE_OF_THE_LION.id}>
          <>
            <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamage))} %{' '}
            <small>{formatNumber((this.totalDamage / this.owner.fightDuration) * 1000)} DPS</small>
            <br />
            <StaminaIcon /> {this.avgHits.toFixed(1)} <small>avg. targets hit</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Tier28_4pc;
