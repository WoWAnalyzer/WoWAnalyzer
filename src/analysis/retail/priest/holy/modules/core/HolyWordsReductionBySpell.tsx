import HolyWordChastise from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordChastise';
import HolyWordSalvation from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSalvation';
import HolyWordSanctify from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from 'analysis/retail/priest/holy/modules/spells/holyword/HolyWordSerenity';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class HolyWordsReductionBySpell extends Analyzer {
  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
    salvation: HolyWordSalvation,
  };
  lightOfTheNaaruActive = false;
  apotheosisActive = false;
  harmoniousApparatusActive = false;

  protected sanctify!: HolyWordSanctify;
  protected serenity!: HolyWordSerenity;
  protected chastise!: HolyWordChastise;
  protected salvation!: HolyWordSalvation;

  constructor(options: Options) {
    super(options);
    this.lightOfTheNaaruActive = this.selectedCombatant.hasTalent(
      TALENTS.LIGHT_OF_THE_NAARU_TALENT,
    );
    this.apotheosisActive = this.selectedCombatant.hasTalent(TALENTS.APOTHEOSIS_TALENT);
    this.harmoniousApparatusActive = this.selectedCombatant.hasTalent(
      TALENTS.HARMONIOUS_APPARATUS_TALENT,
    );
  }

  get totalReduction() {
    return (
      this.sanctify.totalCooldownReduction +
      this.serenity.totalCooldownReduction +
      this.chastise.totalCooldownReduction
    );
  }

  get reductionBySpellNonApparatus() {
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
    totalReductionBySpell = this.sumCooldown(
      totalReductionBySpell,
      this.salvation.totalHolyWordReductionPerSpellPerTalent,
    );

    return totalReductionBySpell;
  }

  get reductionBySpellApparatus() {
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
    totalReductionBySpell = this.sumCooldown(
      totalReductionBySpell,
      this.salvation.totalHolyWordReductionPerSpellPerTalent,
    );

    return totalReductionBySpell;
  }

  sumCooldown(
    currentList: { [spellID: string]: { [otherSpellID: string]: number } },
    newList: { [spellID: string]: { [otherSpellID: string]: number } },
  ) {
    for (const [key, value] of Object.entries(newList)) {
      if (currentList[key] == null) {
        if (
          key === String(TALENTS.CIRCLE_OF_HEALING_TALENT.id) ||
          key === String(SPELLS.HOLY_FIRE.id) ||
          key === String(TALENTS.PRAYER_OF_MENDING_TALENT.id)
        ) {
          newList[key].apparatus = newList[key].base;
          newList[key].base = 0;
        } else {
          newList[key].apparatus = 0;
        }
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

  statistic() {
    const reductionRatio = this.totalReduction / (this.owner.fightDuration + this.totalReduction);
    const reductionBySpell = this.reductionBySpellNonApparatus;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip={
          <>
            This % shows the percentage of total CD reduction for your Holy Words throughout the
            fight
            <br />
            that your Holy Words passive has contributed (The other contributor being time).
            <br />
            <br />
            Talents like <strong>Light of the Naaru</strong>, <strong>Harmonious Apparatus</strong>,
            and <strong>Apotheosis</strong> which provide further CD reduction are taken into
            account when calculating these numbers.
            <br />
            <br />
            If you have talented <strong>Holy Word Salvation</strong> both{' '}
            <strong> Holy Word Sanctify </strong>
            and <strong> Serenity</strong> will show since they provide CD reduction for{' '}
            <strong>Holy World Salvation</strong>.
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-left">Spell</td>
                  <td>Base</td>
                  {this.apotheosisActive && <th>Apotheosis</th>}
                  {this.lightOfTheNaaruActive && <th>Light of the Naaru</th>}
                  {this.harmoniousApparatusActive && <th>Harmonious apparatus</th>}
                </tr>
              </thead>
              <tbody>
                {Object.keys(reductionBySpell).map((e, i) => (
                  <tr key={i}>
                    <td className="text-left">
                      <SpellIcon id={Number(e)} /> {SPELLS[Number(e)].name}
                    </td>
                    <td>{Math.ceil(reductionBySpell[e].base / 1000)}s</td>
                    {this.apotheosisActive && (
                      <td>{Math.ceil(reductionBySpell[e].apotheosis / 1000)}s</td>
                    )}
                    {this.lightOfTheNaaruActive && (
                      <td>{Math.ceil(reductionBySpell[e].lightOfTheNaaru / 1000)}s</td>
                    )}
                    {this.harmoniousApparatusActive && (
                      <td>{Math.ceil(reductionBySpell[e].apparatus / 1000)}s</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.HOLY_WORDS.id}>
          {formatPercentage(reductionRatio)}% Total Holy Word reduction
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HolyWordsReductionBySpell;
