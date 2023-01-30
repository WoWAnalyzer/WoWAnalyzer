import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Example Report: https://www.warcraftlogs.com/reports/PGMqmyH1b86fW7F2/#fight=55&source=10
 */

interface ImmunedAbility {
  name: string;
}

class Netherwalk extends Analyzer {
  damageImmuned: ImmunedAbility[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.NETHERWALK_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onNetherwalkCast);
  }

  onNetherwalkCast(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_DEMON_HUNTER.NETHERWALK_TALENT.id)) {
      return;
    }
    this.damageImmuned.push({
      name: event.ability.name,
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        dropdown={
          this.damageImmuned.length !== 0 ? (
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(this.damageImmuned).map((e, i) => (
                    <tr key={i}>
                      <th>{this.damageImmuned[i].name}</th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            ''
          )
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.NETHERWALK_TALENT}>
          {this.damageImmuned.length} <small>spells immuned</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Netherwalk;
