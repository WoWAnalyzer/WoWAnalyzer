import { SharedCode } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class CombustionCasts extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    eventHistory: EventHistory,
  };
  protected sharedCode!: SharedCode;
  protected eventHistory!: EventHistory;

  statistic() {
    return (
      <Statistic
        wide
        size="flexible"
        position={STATISTIC_ORDER.CORE(30)}
        tooltip={
          <>
            When Combustion is active, you want to ensure you are only using damage spells that will
            allow you to get as many Pyroblast casts in as possible. Typically, you should be aiming
            to use up your charges of Phoenix Flames and Fire Blast first since they are both
            guaranteed to crit during Combustion. Then if you run out of charges and still have time
            left on Combustion, you can use Scorch to get an additional Pyroblast or two in before
            Combustion ends.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.COMBUSTION_TALENT.id}>
          <>
            <table className="table table-condensed">
              <tbody>
                <tr>
                  <td>
                    <small>Spells cast during Combust</small>
                  </td>
                  <td>
                    <small>Total Casts</small>
                  </td>
                  <td>
                    <small>% of Total Combust Casts</small>
                  </td>
                </tr>
                {this.sharedCode
                  .castBreakdownByBuff(true, TALENTS.COMBUSTION_TALENT)
                  .sort((a, b) => b[1] - a[1])
                  .map((spell) => (
                    <tr key={Number(spell)} style={{ fontSize: 16 }}>
                      <td>
                        <SpellLink id={Number(spell[0])} />
                      </td>
                      <td style={{ textAlign: 'center' }}>{spell[1]}</td>
                      <td style={{ textAlign: 'center' }}>
                        {formatPercentage(
                          spell[1] /
                            this.eventHistory.getEventsWithBuff(
                              TALENTS.COMBUSTION_TALENT,
                              EventType.Cast,
                            ).length || 0,
                        )}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CombustionCasts;
