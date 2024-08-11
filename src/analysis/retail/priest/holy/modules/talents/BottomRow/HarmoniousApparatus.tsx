import HolyWordChastise from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordChastise';
import HolyWordSanctify from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSerenity';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/priest';

class HarmoniousApparatus extends Analyzer {
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
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOICE_OF_HARMONY_TALENT);
  }

  get reductionForAllSpells() {
    let totalReductionBySpell: { [spellID: string]: { [otherSpellID: string]: number } } = {};

    totalReductionBySpell = this.sumCooldown(
      totalReductionBySpell,
      this.sanctify.totalHolyWordReductionPerSpellPerTalent,
    );
    totalReductionBySpell = this.sumCooldown(
      totalReductionBySpell,
      this.serenity.totalHolyWordReductionPerSpellPerTalent,
    );
    totalReductionBySpell = this.sumCooldown(
      totalReductionBySpell,
      this.chastise.totalHolyWordReductionPerSpellPerTalent,
    );

    return totalReductionBySpell;
  }

  sumCooldown(
    currentList: { [spellID: string]: { [otherSpellID: string]: number } },
    newList: { [spellID: string]: { [otherSpellID: string]: number } },
  ) {
    for (const [key, value] of Object.entries(newList)) {
      if (currentList[key] == null) {
        currentList[key] = value;
      } else {
        for (const [innerKey, innerValue] of Object.entries(value)) {
          currentList[key][innerKey] = currentList[key][innerKey] || 0;
          currentList[key][innerKey] += innerValue;
        }
      }
    }
    return currentList;
  }

  reductionForSpell(spellId: number) {
    const reduction = this.reductionForAllSpells[spellId];
    if (reduction && reduction.base) {
      return reduction.base;
    }
    return 0;
  }

  statistic() {
    const totalHealingSpellReduction =
      this.reductionForSpell(TALENTS.CIRCLE_OF_HEALING_TALENT.id) +
      this.reductionForSpell(TALENTS.PRAYER_OF_MENDING_TALENT.id);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Serenity:{' '}
            {Math.ceil(this.reductionForSpell(TALENTS.CIRCLE_OF_HEALING_TALENT.id) / 1000)}
            s CDR
            <br />
            Sanctify:{' '}
            {Math.ceil(this.reductionForSpell(TALENTS.PRAYER_OF_MENDING_TALENT.id) / 1000)}s CDR
            <br />
            Chastise : {Math.ceil(this.reductionForSpell(SPELLS.HOLY_FIRE.id) / 1000)}s CDR
            <br />
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.VOICE_OF_HARMONY_TALENT}>
          {Math.ceil(totalHealingSpellReduction / 1000)}s{' '}
          <small>Healing Spell Cooldown Reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HarmoniousApparatus;
