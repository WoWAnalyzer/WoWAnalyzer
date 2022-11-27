import { t } from '@lingui/macro';
import {
  SERPENT_STING_SV_BASE_DURATION,
  SV_SERPENT_STING_COST,
} from 'analysis/retail/hunter/survival/constants';
import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  DamageEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Volatile Bomb:
 * Reacts violently with poison, causing an extra explosion against enemies suffering from your Serpent Sting and refreshes your Serpent Stings.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class VolatileBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;
  casts = 0;
  extendedSerpentStings = 0;
  extendedInMs = 0;
  focusSaved = 0;
  missedSerpentResets = 0;
  activeSerpentStings: {
    [key: string]: {
      targetName: string;
      cast: number;
      expectedEnd: number;
      extendStart: number;
      extendExpectedEnd: number;
    };
  } = {
    /*
    [encodedTargetString]: {
        targetName: name,
        cast: timestamp,
        expectedEnd: timestamp,
        extendStart: timestamp || null,
        extendExpectedEnd: timestamp || null,
      },
     */
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.WILDFIRE_INFUSION_TALENT.id);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this._serpentApplication,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this._serpentApplication,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onDebuffRemoval,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VOLATILE_BOMB_WFI_DOT),
      this._maybeSerpentStingExtend,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOLATILE_BOMB_WFI),
      this.onBombCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.VOLATILE_BOMB_WFI_DOT, SPELLS.VOLATILE_BOMB_WFI_IMPACT]),
      this.onBombDamage,
    );
  }

  get missedResetsThresholds() {
    return {
      actual: this.missedSerpentResets,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  _serpentApplication(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.activeSerpentStings[target] = {
      targetName: enemy.name,
      cast: event.timestamp,
      expectedEnd: event.timestamp + SERPENT_STING_SV_BASE_DURATION,
      extendStart: 0,
      extendExpectedEnd: 0,
    };
  }

  _maybeSerpentStingExtend(event: ApplyDebuffEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this.activeSerpentStings[target]) {
      this.activeSerpentStings[target].extendStart = event.timestamp;
      this.activeSerpentStings[target].extendExpectedEnd =
        event.timestamp +
        (this.activeSerpentStings[target].expectedEnd - this.activeSerpentStings[target].cast);

      this.extendedInMs +=
        this.activeSerpentStings[target].extendExpectedEnd -
        this.activeSerpentStings[target].expectedEnd;
      this.focusSaved += SV_SERPENT_STING_COST;
      this.extendedSerpentStings += 1;
    } else {
      this.missedSerpentResets += 1;
    }
  }

  onDebuffRemoval(event: RemoveDebuffEvent) {
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    delete this.activeSerpentStings[encoded];
  }

  onBombDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onBombCast() {
    this.casts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Refreshes</th>
                  <th>Avg</th>
                  <th>Total</th>
                  <th>Focus saved</th>
                  <th>Missed refreshes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{this.extendedSerpentStings}</td>
                  <td>{formatDuration(this.extendedInMs / this.casts)}</td>
                  <td>{formatDuration(this.extendedInMs)}</td>
                  <td>{this.focusSaved}</td>
                  <td>{this.missedSerpentResets}</td>
                </tr>
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.VOLATILE_BOMB_WFI.id}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.missedResetsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You shouldn't cast <SpellLink id={SPELLS.VOLATILE_BOMB_WFI.id} /> if your target doesn't
          have <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> on.
        </>,
      )
        .icon(SPELLS.VOLATILE_BOMB_WFI.icon)
        .actual(
          t({
            id: 'hunter.survival.suggestions.wildfireInfusion.castsWithoutSerpentSting',
            message: `${actual} casts without ${(
              <SpellLink id={SPELLS.SERPENT_STING_SV.id} />
            )} on`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
    );
  }
}

export default VolatileBomb;
