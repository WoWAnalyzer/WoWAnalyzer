import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, { DamageEvent } from 'parser/core/Events';
import {
  WINGLEADER_CDR_PER_HIT_MS,
  WINGLEADER_MAX_HITS,
} from 'analysis/retail/evoker/shared/constants';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPECS from 'game/SPECS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import DonutChart from 'parser/ui/DonutChart';
import Spell from 'common/SPELLS/Spell';

const BUFFER = 50;

/** Bombardments reduce the cooldown of Deep Breath by 1 sec for each target struck,
 * up to 3 sec. */
class Wingleader extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  damageRecord: Record<
    number,
    {
      initialTimestamp: number;
      hits: number;
    }
  > = {};

  effectiveCDR = 0;
  wastedCDR = 0;
  breathSpell: Spell;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WINGLEADER_TALENT);

    this.breathSpell =
      this.owner.selectedCombatant.specId === SPECS.DEVASTATION_EVOKER.id
        ? SPELLS.DEEP_BREATH_SCALECOMMANDER
        : SPELLS.BREATH_OF_EONS_SCALECOMMANDER;

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BOMBARDMENTS_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    /** When you proc Bombas yourself, you will get both the
     * natty damage event and the supportID damage event.
     * We only want to track one of them.
     * We track the natty event since sometimes the supportID event doesn't
     * show up */
    if (event.supportID === this.owner.selectedCombatant.id) {
      return;
    }

    const sourceId = event.supportID ?? this.owner.selectedCombatant.id;

    if (!this.damageRecord[sourceId]) {
      this.damageRecord[sourceId] = {
        initialTimestamp: event.timestamp,
        hits: 0,
      };
    }

    const record = this.damageRecord[sourceId];

    if (event.timestamp - record.initialTimestamp > BUFFER) {
      record.initialTimestamp = event.timestamp;
      record.hits = 0;
    }

    if (record.hits === WINGLEADER_MAX_HITS) {
      return;
    }

    record.hits += 1;
    const effectiveCDR = this.spellUsable.reduceCooldown(
      this.breathSpell.id,
      WINGLEADER_CDR_PER_HIT_MS,
    );
    const wastedCDR = WINGLEADER_CDR_PER_HIT_MS - effectiveCDR;

    this.effectiveCDR += effectiveCDR / 1000;
    this.wastedCDR += wastedCDR / 1000;
  }

  statistic() {
    const donutItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effective CDR',
        valueTooltip: this.effectiveCDR.toFixed(2) + 's effective CDR',
        value: this.effectiveCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip:
          this.wastedCDR.toFixed(2) + `s CDR wasted whilst ${this.breathSpell.name} was ready`,
        value: this.wastedCDR,
      },
    ];

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.WINGLEADER_TALENT} /> usage
          </label>
          <strong>CDR efficiency:</strong>
          <DonutChart items={donutItems} />
        </div>
      </Statistic>
    );
  }
}

export default Wingleader;
