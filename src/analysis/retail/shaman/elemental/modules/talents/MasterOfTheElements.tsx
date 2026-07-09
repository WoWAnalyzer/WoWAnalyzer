import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { addAdditionalCastInformation } from 'parser/core/EventMetaLib';
import cssComponent from 'interface/utils/css-component';
import styles from './MasterOfTheElements.module.scss';
import { isMythicPlus } from 'common/isMythicPlus';
import { EVENT_LINKS, MASTER_OF_THE_ELEMENTS_SPELL_WHITELIST } from '../../constants';

const MasterOfTheElementsTable = cssComponent(
  'table',
  styles.MasterOfTheElementsTable,
  [] as const,
);

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

    this.moteSpellIds = MASTER_OF_THE_ELEMENTS_SPELL_WHITELIST.map((s) => s.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(MASTER_OF_THE_ELEMENTS_SPELL_WHITELIST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (
      this.moteSpellIds.includes(event.ability.guid) &&
      GetRelatedEvent(event, EVENT_LINKS.MasterOfTheElementsConsume) !== undefined
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
          <MasterOfTheElementsTable className="table table-condensed">
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
          </MasterOfTheElementsTable>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MasterOfTheElements;
