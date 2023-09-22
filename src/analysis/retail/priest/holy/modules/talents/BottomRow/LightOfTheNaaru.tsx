import HolyWordChastise from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordChastise';
import HolyWordSanctify from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSerenity';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/Gvxt7CgLya2W1TYj/5-Normal+Zek'voz+-+Kill+(3:57)/13-弥砂丶
class LightOfTheNaaru extends Analyzer {
  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
  };
  protected sanctify!: HolyWordSanctify;
  protected serenity!: HolyWordSerenity;
  protected chastise!: HolyWordChastise;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LIGHT_OF_THE_NAARU_TALENT);
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Serenity: {Math.ceil(this.serenity.lightOfTheNaaruCooldownReduction / 1000)}s CDR
            <br />
            Sanctify: {Math.ceil(this.sanctify.lightOfTheNaaruCooldownReduction / 1000)}s CDR
            <br />
            Chastise: {Math.ceil(this.chastise.lightOfTheNaaruCooldownReduction / 1000)}s CDR
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={TALENTS.LIGHT_OF_THE_NAARU_TALENT}>
          {Math.ceil(
            (this.sanctify.lightOfTheNaaruCooldownReduction +
              this.serenity.lightOfTheNaaruCooldownReduction) /
              1000,
          )}
          s <small>Healing Spell Cooldown Reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LightOfTheNaaru;
