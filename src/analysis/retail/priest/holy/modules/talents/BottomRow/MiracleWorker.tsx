import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';

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

    this.active = this.selectedCombatant.hasTalent(TALENTS.MIRACLE_WORKER_TALENT);

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
            The estimated number of additional casts granted from having an second charge of{' '}
            <SpellLink id={TALENTS.HOLY_WORD_SERENITY_TALENT.id} /> and{' '}
            <SpellLink id={TALENTS.HOLY_WORD_SANCTIFY_TALENT.id} />.
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS.MIRACLE_WORKER_TALENT}>
          <>
            {extraSerenityCasts}{' '}
            <small>
              extra <SpellLink id={TALENTS.HOLY_WORD_SERENITY_TALENT.id} /> cast
              {extraSerenityCasts > 1 ? 's' : ''}.
            </small>
            <br />
            {extraSanctifyCasts}{' '}
            <small>
              extra <SpellLink id={TALENTS.HOLY_WORD_SANCTIFY_TALENT.id} /> cast
              {extraSerenityCasts > 1 ? 's' : ''}.
            </small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MiracleWorker;
