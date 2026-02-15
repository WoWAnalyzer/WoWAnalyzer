import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Combatant from 'parser/core/Combatant';
import Spell from 'common/SPELLS/Spell';
import { addAdditionalCastInformation } from 'parser/core/EventMetaLib';
import styled from '@emotion/styled';
import { isMythicPlus } from 'common/isMythicPlus';

interface MasterOfTheElementsSpellConfig {
  castSpell: Spell | Spell[];
  condition?: ((c: Combatant) => boolean) | boolean | undefined;
}

const MasterOfTheElementsTable = styled.table`
  font-size: 16px;
  tr td:nth-child(2) {
    text-align: right;
  }
  width: 100%;
`;

const MASTER_OF_THE_ELEMENTS_CONFIG: Record<string, MasterOfTheElementsSpellConfig> = {
  FROST_SHOCK: {
    castSpell: TALENTS.FROST_SHOCK_TALENT,
    condition: (c) => c.hasTalent(TALENTS.FROST_SHOCK_TALENT),
  },
  LIGHTNING_BOLT: {
    castSpell: SPELLS.LIGHTNING_BOLT,
  },
  CHAIN_LIGHTNING: {
    castSpell: TALENTS.CHAIN_LIGHTNING_TALENT,
  },
  TEMPEST: {
    castSpell: SPELLS.TEMPEST_CAST,
  },
  ELEMENTAL_BLAST: {
    castSpell: TALENTS.ELEMENTAL_BLAST_TALENT,
    condition: (c) => c.hasTalent(TALENTS.ELEMENTAL_BLAST_TALENT),
  },
  EARTH_SHOCK: {
    castSpell: TALENTS.EARTH_SHOCK_TALENT,
    condition: (c) => c.hasTalent(TALENTS.EARTH_SHOCK_TALENT),
  },
  EARTHQUAKE: {
    castSpell: [TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT, TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT],
    condition: (c) =>
      c.hasTalent(TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT) ||
      c.hasTalent(TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT),
  },
};

class MasterOfTheElements extends Analyzer {
  moteBuffedAbilities = new Map<number, number>();
  moteSpellIds: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      !isMythicPlus(this.owner.fight) &&
      this.selectedCombatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    const castSpellFilter: Spell[] = [];

    Object.keys(MASTER_OF_THE_ELEMENTS_CONFIG).forEach((spell) => {
      const config = MASTER_OF_THE_ELEMENTS_CONFIG[spell];
      if (
        !config.condition ||
        (typeof config.condition === 'boolean' && config.condition) ||
        config.condition(this.selectedCombatant)
      ) {
        const castSpells = Array.isArray(config.castSpell) ? config.castSpell : [config.castSpell];
        castSpellFilter.push(...castSpells);
        this.moteSpellIds.push(...castSpells.map((s) => s.id));
      }
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(castSpellFilter), this.onCast);
  }

  onCast(event: CastEvent) {
    if (
      this.moteSpellIds.includes(event.ability.guid) &&
      this.selectedCombatant.hasBuff(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF, event.timestamp)
    ) {
      this.moteBuffedAbilities.set(
        event.ability.guid,
        (this.moteBuffedAbilities.get(event.ability.guid) || 0) + 1,
      );
      addAdditionalCastInformation(
        event,
        <>
          Cast was buffed by <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} />
        </>,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT}>
          <MasterOfTheElementsTable>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Number of Buffed Casts</th>
                </tr>
              </thead>
              <tbody>
                {[...this.moteBuffedAbilities.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .filter(([_, casts]) => casts > 0)
                  .map(([spellId, casts]) => (
                    <tr key={spellId}>
                      <td>
                        <SpellLink spell={spellId} />
                      </td>
                      <td>{casts}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </MasterOfTheElementsTable>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MasterOfTheElements;
