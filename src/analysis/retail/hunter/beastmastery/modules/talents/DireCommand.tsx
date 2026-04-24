import { DIRE_COMMAND_PROC_CHANCE } from 'analysis/retail/hunter/beastmastery/constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventSourceString, encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Kill Command has a 20% chance to also summon a Dire Beast to attack your target for 8 sec.
 */
class DireCommand extends Analyzer {
  damage = 0;
  activeDireBeasts: string[] = [];
  direCommandProcs = 0;
  killCommandCasts = 0;
  lastKillCommandCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIRE_COMMAND_TALENT);

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_SUMMON),
      this.direBeastSummon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
      this.killCommandCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  direBeastSummon(event: SummonEvent) {
    if (this.lastKillCommandCast + MS_BUFFER_100 > event.timestamp) {
      this.direCommandProcs += 1;
      const targetId = encodeEventTargetString(event);
      if (targetId) {
        this.activeDireBeasts.push(targetId);
      }
    }
  }

  onPetDamage(event: DamageEvent) {
    const sourceId = encodeEventSourceString(event);
    if (!sourceId) {
      return;
    }
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  killCommandCast(event: CastEvent) {
    this.killCommandCasts += 1;
    this.lastKillCommandCast = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(
                this.direCommandProcs,
                this.killCommandCasts,
                DIRE_COMMAND_PROC_CHANCE,
              )}
              <p>
                Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given
                your number of <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} />{' '}
                casts.
              </p>
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.DIRE_COMMAND_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireCommand;
