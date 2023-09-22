import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { SpellLink } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';
import Events, { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamageReduction } from 'parser/core/EventCalculateLib';
import { formatNumber } from 'common/format';

const TALENT_DR = 0.1;

class LightsProtection extends Analyzer {
  roughDR = 0;
  glimmerBuffs = 0;

  constructor(options: Options) {
    super(options);

    // techinically currently its impossible to not have glimmer, but knowing blizzard this could change and I odn't wanna update code
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.LIGHTS_PROTECTION_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.GLIMMER_OF_LIGHT_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.applybuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.removebuff,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
  }

  applybuff(event: ApplyBuffEvent) {
    this.glimmerBuffs += 1;
  }

  removebuff(event: RemoveBuffEvent) {
    this.glimmerBuffs -= 1;
  }

  damageTaken(event: DamageEvent) {
    if (this.glimmerBuffs === 0) {
      return;
    }
    this.roughDR += calculateEffectiveDamageReduction(event, TALENT_DR);
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This value is calculated using the <i>Optional DRs</i> method. This results in the
            lowest possible damage reduction value being shown. This should be the correct value in
            most circumstances. <br />
            <br />
            Calculating the exact damage reduced by Light's Protection is very time and resource
            consuming. This method uses a very close estimation. The passive damage reduction is
            calculated by taking the exact damage reduction factor applicable and calculating the
            damage reduced if that full effect was applied to the Paladin. Even though the passive
            damage reduction is split among other players effected by Glimmer of Light, using your
            personal damage taken should average it out very closely.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.LIGHTS_PROTECTION_TALENT} /> Overall Damage Reduced
            </>
          }
        >
          ≈<img src="/img/shield.png" alt="Damage Taken" className="icon" />
          {`${formatNumber((this.roughDR / fightDuration) * 1000)}`} <small>EHPS</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default LightsProtection;
