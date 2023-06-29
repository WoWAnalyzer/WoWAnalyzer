
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, HealEvent } from 'parser/core/Events';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import './ManaTideTotem.scss';
import ManaTideTotem, { MANA_REGEN_PER_SECOND } from './ManaTideTotem';
import WaterShield from './WaterShield';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemManaGained from 'parser/ui/ItemManaGained';

const SPELLS_PROCCING_RESURGENCE = {
  [SPELLS.HEALING_SURGE.id]: 0.006,
  [TALENTS.HEALING_WAVE_TALENT.id]: 0.01,
  [TALENTS.CHAIN_HEAL_TALENT.id]: 0.0025,
  [TALENTS.UNLEASH_LIFE_TALENT.id]: 0.006,
  [TALENTS.RIPTIDE_TALENT.id]: 0.006,
};

interface ResurgenceInfo {
  spellId: number;
  resurgenceTotal: number;
  castAmount: number;
}

class Resurgence extends Analyzer {
  static dependencies = {
    manaTracker: ManaTracker,
    manaTideTotem: ManaTideTotem,
    waterShield: WaterShield,
  };

  protected manaTracker!: ManaTracker;
  protected manaTideTotem!: ManaTideTotem;
  protected waterShield!: WaterShield;

  resurgence: ResurgenceInfo[] = [];
  totalResurgenceGain = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RESURGENCE_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.HEALING_SURGE,
          TALENTS.HEALING_WAVE_TALENT,
          TALENTS.CHAIN_HEAL_TALENT,
          TALENTS.UNLEASH_LIFE_TALENT,
          TALENTS.RIPTIDE_TALENT,
        ]),
      this.onRelevantHeal,
    );
    this.addEventListener(
      Events.resourcechange.to(SELECTED_PLAYER).spell(SPELLS.RESURGENCE),
      this.onResurgenceProc,
    );
  }

  onRelevantHeal(event: HealEvent) {
    if (event.tick) {
      return;
    }
    const spellId = event.ability.guid;

    if (!this.resurgence[spellId]) {
      this.resurgence[spellId] = {
        spellId: spellId,
        resurgenceTotal: 0,
        castAmount: 0,
      };
    }

    if (event.hitType === HIT_TYPES.CRIT) {
      this.resurgence[spellId].resurgenceTotal +=
        SPELLS_PROCCING_RESURGENCE[spellId] * this.manaTracker.maxResource;
      this.resurgence[spellId].castAmount += 1;
    }
  }

  onResurgenceProc(event: ResourceChangeEvent) {
    this.totalResurgenceGain += event.resourceChange;
  }

  get totalMana() {
    const naturalManaRegen = (this.owner.fightDuration / 1000) * MANA_REGEN_PER_SECOND;
    const mttMana = this.manaTideTotem.regenOnPlayer;
    const wsMana = this.waterShield.regenOnPlayer;
    return (
      naturalManaRegen + this.totalResurgenceGain + this.manaTracker.maxResource + mttMana + wsMana
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT(90)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <SpellLink id={SPELLS.RESURGENCE.id} iconStyle={{ height: '1.25em' }} /> accounted for{' '}
            {formatPercentage(this.totalResurgenceGain / this.totalMana, 0)}% of your total
            available mana over the fight ({formatNumber(this.totalMana)} mana).
          </>
        }
        dropdown={
          <>
            <div></div>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>
                    <>
                      Spell
                    </>
                  </th>
                  <th>
                    <>
                      Amount
                    </>
                  </th>
                  <th>
                    <>
                      Crits
                    </>
                  </th>
                  <th>
                    <>
                      % of mana
                    </>
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.resurgence.map((spell) => (
                  <tr key={spell.spellId}>
                    <th scope="row">
                      <SpellIcon id={spell.spellId} style={{ height: '2.5em' }} />
                    </th>
                    <td>{formatNumber(spell.resurgenceTotal)}</td>
                    <td>{formatNumber(spell.castAmount)}</td>
                    <td>{formatPercentage(spell.resurgenceTotal / this.totalMana)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RESURGENCE_TALENT}>
          <ItemManaGained amount={this.totalResurgenceGain} useAbbrev />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Resurgence;
