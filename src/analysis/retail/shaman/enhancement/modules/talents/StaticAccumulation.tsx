import Analyzer, { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { MaelstromWeaponTracker } from 'analysis/retail/shaman/enhancement/modules/resourcetracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellIcon, SpellLink } from 'interface';

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
    const ranks = this.selectedCombatant.getTalentRank(TALENTS.STATIC_ACCUMULATION_TALENT);
    const uptime = Math.floor(
      this.selectedCombatant.getBuffUptime(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id) / 1000,
    );
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
          <table className="table-condensed" style={{ width: '100%' }}>
            <tbody>
              <tr style={{ fontSize: 16 }}>
                <td>
                  <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> (passive)
                </td>
                <td>{uptime * ranks}</td>
              </tr>
              <tr style={{ fontSize: 16 }}>
                <td>
                  <SpellIcon spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> Refunded
                </td>
                <td>{refund.generated + refund.wasted}</td>
              </tr>
            </tbody>
          </table>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default StaticAccumulation;
