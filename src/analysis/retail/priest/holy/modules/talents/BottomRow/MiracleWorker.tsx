import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Holy Word: Serenity and Holy Word: Sanctify gain an additional charge.
 */
class MiracleWorker extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  extraSerenityCD = 0;
  extraSanctifyCD = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.MIRACLE_WORKER_TALENT.id);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_SERENITY_TALENT),
      this.trackExtraSerenityCD,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_SANCTIFY_TALENT),
      this.trackExtraSanctifyCD,
    );
  }

  getExtraCD(spellId: number) {
    const expectedDuration = this.spellUsable.fullCooldownDuration(spellId);
    const chargesOnCooldown = this.spellUsable.chargesOnCooldown(spellId);
    const remaining = this.spellUsable.cooldownRemaining(spellId);
    if (chargesOnCooldown === 1) {
      return remaining;
    } else {
      return expectedDuration - remaining;
    }
  }

  trackExtraSerenityCD(event: CastEvent) {
    this.extraSerenityCD += this.getExtraCD(TALENTS.HOLY_WORD_SERENITY_TALENT.id);
  }

  trackExtraSanctifyCD(event: CastEvent) {
    this.extraSanctifyCD += this.getExtraCD(TALENTS.HOLY_WORD_SANCTIFY_TALENT.id);
  }

  statistic() {
    const extraSerenityCasts = Math.floor(this.extraSerenityCD / 1000 / 60);
    const extraSanctifyCasts = Math.floor(this.extraSanctifyCD / 1000 / 60);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        tooltip={
          <>
            This statistic shows the estimated number of extra casts granted from having an
            additional charge of Holy Word: Serenity and Holy Word: Sanctify.
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.MIRACLE_WORKER_TALENT.id}>
          <>
            {extraSerenityCasts} extra Serenity cast{extraSerenityCasts > 1 ? 's' : ''}.
            <br />
            {extraSanctifyCasts} extra Sanctify cast{extraSanctifyCasts > 1 ? 's' : ''}.
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MiracleWorker;