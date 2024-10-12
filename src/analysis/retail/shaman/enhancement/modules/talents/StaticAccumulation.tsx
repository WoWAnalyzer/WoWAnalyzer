import Analyzer, { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { MaelstromWeaponTracker } from 'analysis/retail/shaman/enhancement/modules/resourcetracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellIcon, SpellLink } from 'interface';
import styled from '@emotion/styled';

const StaticAccumulationTable = styled.table`
  font-size: 16px;
  tr td:nth-child(2) {
    text-align: right;
  }
  width: 100%;
`;

class StaticAccumulation extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  protected maelstromWeaponTracker!: MaelstromWeaponTracker;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT);
    if (!this.active) {
      return;
    }
  }

  statistic() {
    const passive =
      this.maelstromWeaponTracker.buildersObj[TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id];
    const refund = this.maelstromWeaponTracker.buildersObj[TALENTS.STATIC_ACCUMULATION_TALENT.id];

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.STATIC_ACCUMULATION_TALENT}>
          <small>
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> breakdown
          </small>
          <br />
          <StaticAccumulationTable className="table-condensed">
            <tbody>
              {passive && (
                <tr>
                  <td>
                    <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> (passive)
                  </td>
                  <td>{passive.generated + passive.wasted}</td>
                </tr>
              )}
              {refund && (
                <tr>
                  <td>
                    <SpellIcon spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> Refunded from spells
                  </td>
                  <td>{refund.generated + refund.wasted}</td>
                </tr>
              )}
            </tbody>
            <tfoot style={{ fontStyle: 'italic' }}>
              <tr>
                <td>Total</td>
                <td>
                  {(passive ? passive.generated + passive.wasted : 0) +
                    (refund ? refund.generated + refund.wasted : 0)}
                </td>
              </tr>
            </tfoot>
          </StaticAccumulationTable>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default StaticAccumulation;
