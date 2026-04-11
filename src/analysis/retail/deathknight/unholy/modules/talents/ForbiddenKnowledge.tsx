import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Spell from 'common/SPELLS/Spell';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Events, { DamageEvent } from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import { UptimeIcon } from 'interface/icons';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import DonutChart from 'parser/ui/DonutChart';

export default class ForbiddenKnowledge extends ExecuteHelper.withDependencies({
  abilities: Abilities,
}) {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [SPELLS.FORBIDDEN_KNOWLEDGE_BUFF];
  static executeSpells: Spell[] = [SPELLS.NECROTIC_COIL, SPELLS.GRAVEYARD];
  static countCooldownAsExecuteTime = true;

  private necroticCoilDamage = 0;
  private graveyardDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FORBIDDEN_KNOWLEDGE_1_UNHOLY_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.NECROTIC_COIL_DAMAGE_HIT, SPELLS.NECROTIC_COIL_DAMAGE_PIERCE]),
      this.onNecroticCoilDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GRAVEYARD_DAMAGE),
      this.onGraveyardDamage,
    );

    this.deps.abilities.add({
      spell: SPELLS.NECROTIC_COIL.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: {
        base: 1500,
      },
      range: 30,
    });

    this.deps.abilities.add({
      spell: SPELLS.GRAVEYARD.id,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
      gcd: {
        base: 1500,
      },
      range: 20,
    });
  }

  private onNecroticCoilDamage(event: DamageEvent) {
    this.necroticCoilDamage += event.amount + (event.absorbed || 0);
  }

  private onGraveyardDamage(event: DamageEvent) {
    this.graveyardDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const fightDurationSec = this.owner.fightDuration / 1000;
    const necroticCoilDps = this.necroticCoilDamage / fightDurationSec;
    const graveyardDps = this.graveyardDamage / fightDurationSec;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.FORBIDDEN_KNOWLEDGE_1_UNHOLY_TALENT}>
          <div>
            <UptimeIcon />{' '}
            {formatPercentage(this.totalExecuteDuration / this.owner.fightDuration, 1)}%{' '}
            <small>buff uptime</small>
          </div>
          <div>
            <ItemDamageDone amount={this.necroticCoilDamage + this.graveyardDamage} />
          </div>
        </BoringSpellValueText>
        <div style={{ padding: '8px' }}>
          <DonutChart
            items={[
              {
                color: '#8b5cf6',
                label: 'Necrotic Coil',
                spellId: SPELLS.NECROTIC_COIL.id,
                value: this.necroticCoilDamage,
                valueTooltip: `${formatNumber(necroticCoilDps)} DPS — ${formatNumber(this.necroticCoilDamage)} total`,
              },
              {
                color: '#22c55e',
                label: 'Graveyard',
                spellId: SPELLS.GRAVEYARD.id,
                value: this.graveyardDamage,
                valueTooltip: `${formatNumber(graveyardDps)} DPS — ${formatNumber(this.graveyardDamage)} total`,
              },
            ]}
          />
        </div>
      </Statistic>
    );
  }
}
