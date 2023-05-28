import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import StatisticBox from 'parser/ui/StatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import DemoPets from '../pets/DemoPets';
import { isWildImp } from '../pets/helpers';

class SummonDemonicTyrant extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;
  demonicTyrantPower!: number[];
  _hasReignOfTyranny!: boolean;
  _petsPerCast!: Record<number, number>[];

  constructor(options: Options) {
    super(options);
    this.demonicTyrantPower = [];
    this._hasReignOfTyranny = this.selectedCombatant.hasTalent(TALENTS.REIGN_OF_TYRANNY_TALENT);
    this._petsPerCast = [];
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      this.summonDemonicTyrantCast,
    );
    this._hasReignOfTyranny = this.selectedCombatant.hasTalent(TALENTS.REIGN_OF_TYRANNY_TALENT);
  }

  summonDemonicTyrantCast() {
    const pets = this.demoPets.currentPets;
    const countsPerCast = pets.reduce<Record<number, number>>((countsObj, currPet) => {
      const { summonedBy } = currPet;
      return { ...countsObj, [summonedBy]: (countsObj[summonedBy] || 0) + 1 };
    }, {});
    const demonicServitudeStacks = pets.reduce((total, currPet) => {
      if (isWildImp(currPet.guid)) {
        return total + 1;
      } else {
        return total + 2;
      }
    }, 0);
    // pets.forEach((pet) => {
    //   if (isWildImp(pet.guid)) {
    //     demonicServitudeStacks += 1;
    //   } else {
    //     demonicServitudeStacks += 2;
    //   }
    //   countsPerCast[pet.summonedBy] = (countsPerCast[pet.summonedBy] || 0) + 1;
    // });

    this.demonicTyrantPower.push(demonicServitudeStacks);
    this._petsPerCast.push(countsPerCast);
  }

  myList = [
    { 1: 2, 3: 5, 6: 22 },
    { 1: 1, 3: 5 },
  ];

  statistic() {
    const avgPets =
      this._petsPerCast.reduce(
        (total, cast) =>
          total +
          Object.values(cast).reduce((totalPerSource, source) => totalPerSource + source, 0),
        0,
      ) / this._petsPerCast.length || 0;

    const mergedPets = this._petsPerCast.reduce((acc, curr) => {
      for (const [petIdString, numCasts] of Object.entries(curr)) {
        const petId = Number(petIdString);
        acc[petId] = (acc[petId] || 0) + numCasts;
      }
      return acc;
    }, {});

    // convert array of
    // const mergedPets = {};

    // const mergedPets = (Object.keys(cast) as Array<keyof typeof v>).reduce((acc, curr) => {

    // }, {})
    // this._petsPerCast.forEach((cast) => {

    //   Object.keys(cast).forEach((demonSource) => {
    //     mergedPets[demonSource] = (mergedPets[demonSource] || 0) + cast[demonSource];
    //   });
    // });

    const petTableRows = Object.keys(mergedPets).map((demonSource) => {
      return (
        <tr key={demonSource}>
          <td align="left">
            <SpellLink id={Number(demonSource)} />
          </td>
          <td align="center">
            {(mergedPets[Number(demonSource)] / this._petsPerCast.length).toFixed(2)}
          </td>
        </tr>
      );
    });

    const avgTyrantPower =
      this.demonicTyrantPower.reduce((acc, val) => acc + val, 0) /
      Math.max(this.demonicTyrantPower.length, 1);
    const tyrantFooter = this._hasReignOfTyranny
      ? `Average Reign of Tyranny Bonus Damage: ${avgTyrantPower.toFixed(2)}%`
      : null;

    const petTable =
      this._petsPerCast.length > 0 ? (
        <>
          <thead>
            <tr>
              <th>Pet Source</th>
              <th>Avg Pets per Cast</th>
            </tr>
          </thead>
          <tbody>{petTableRows}</tbody>
        </>
      ) : null;
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip="Number of pets empowered by each Demonic Tyrant summon."
        value={avgPets.toFixed(2)}
        dropdown={petTable}
        footer={tyrantFooter}
      >
        <BoringSpellValueText spellId={SPELLS.SUMMON_DEMONIC_TYRANT.id}>
          {`${avgPets.toFixed(2)}`} <small>Avg. demons empowered</small>
        </BoringSpellValueText>
      </StatisticBox>
    );
  }
}

export default SummonDemonicTyrant;
