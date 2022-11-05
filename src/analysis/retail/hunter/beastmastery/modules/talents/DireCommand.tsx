import {
  DIRE_BEAST_HASTE_PERCENT,
  DIRE_COMMAND_PROC_CHANCE,
} from 'analysis/retail/hunter/beastmastery/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Haste from 'interface/icons/Haste';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventSourceString, encodeTargetString } from 'parser/shared/modules/Enemies';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * TODO Find a log with both Dire Command and Dire Beast talent and account for them using the same spell for buff
 * Kill Command has a 20% chance to also summon a Dire Beast to attack your target.
 *
 * Example log:
 *
 */
class DireCommand extends Analyzer {
  damage: number = 0;
  activeDireBeasts: string[] = [];
  targetId: string = '';
  direCommandProcs: number = 0;
  killCommandHits: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIRE_COMMAND_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_SUMMON),
      this.direBeastSummon,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(TALENTS.KILL_COMMAND_SHARED_TALENT),
      this.killCommandDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration
    );
  }

  direBeastSummon(event: SummonEvent) {
    this.direCommandProcs += 1;
    this.targetId = encodeTargetString(event.targetID);
    this.activeDireBeasts = [];
    this.activeDireBeasts.push(this.targetId);
    this.targetId = '';
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

  killCommandDamage(event: DamageEvent) {
    this.killCommandHits += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={<>You had {formatPercentage(this.uptime)}% uptime on the Dire Beast Haste buff.</>}
        dropdown={
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(
                this.direCommandProcs,
                this.killCommandHits,
                DIRE_COMMAND_PROC_CHANCE,
              )}
              <p>
                Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given
                your number of <SpellLink id={TALENTS.KILL_COMMAND_SHARED_TALENT.id} /> casts.
              </p>
            </div>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.DIRE_COMMAND_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <Haste /> {formatPercentage(DIRE_BEAST_HASTE_PERCENT * this.uptime)}% <small>Haste</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireCommand;
