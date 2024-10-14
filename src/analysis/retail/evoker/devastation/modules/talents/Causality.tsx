import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import {
  CAUSALITY_DISINTEGRATE_CDR_MS,
  CAUSALITY_PYRE_CDR_MS,
} from 'analysis/retail/evoker/devastation/constants';
import DonutChart from 'parser/ui/DonutChart';
import { isMassDisintegrateTick } from '../normalizers/CastLinkNormalizer';

class Causality extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  combatant = this.selectedCombatant;
  protected spellUsable!: SpellUsable;

  enemyHitCounter: number[][] = [];

  maxPyreCount: number = 5;
  previousPyreDamageEvent: number = 0;
  pyreCounter: number = 0;

  eternitySurgeSpell = this.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)
    ? SPELLS.ETERNITY_SURGE_FONT
    : SPELLS.ETERNITY_SURGE;

  fireBreathSpell = this.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)
    ? SPELLS.FIRE_BREATH_FONT
    : SPELLS.FIRE_BREATH;

  spellIds = [this.eternitySurgeSpell.id, this.fireBreathSpell.id];

  sourceData = {
    [SPELLS.PYRE.id]: {
      CDR: 0,
      wastedCDR: 0,
      wastedCDRDuringBlazing: 0,
    },
    [SPELLS.DISINTEGRATE.id]: {
      CDR: 0,
      wastedCDR: 0,
      wastedCDRDuringBlazing: 0,
    },
  };

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CAUSALITY_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this.disReduceCooldown,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYRE),
      this.pyreReduceCooldown,
    );
  }

  /** Pyre triggers CDR events based on amount of targets hit, up to a maximum of 5.
   * Pyres have a traveltime and therefore sometimes we have some funky behaviour
   * eg. Dragonrage casts out 3 Pyres, at 3 different targets, these will not always
   * land at the same time; whilst these Pyres are traveling you can also cast a
   * new Pyre before the previous ones have landed.
   * Ontop of this we also have the talent Volatility, which gives your Pyre a
   * chance to flare up and "recast". These procs can also chain of themselves.
   *
   * An example would be you casting Pyre->Dragonrage, you now have 4 active pyres,
   * each one has a chance to proc Volatility.
   * In this example we now expect to have 4 seperate sets of damage events in perfect order.
   * but with differing traveltime and Volatility to take into account we will have a
   * mix match of events along with a, potentially, infinite extra sets of
   * damage events. Each individual pyre *should* have all it's damage events in the same tick.
   *
   * Due to all of this, it is fairly annoying to attribute damage events to any singular
   * Pyre.
   * Solution used is to count amount of targets hit on a given tick, if the same target is
   * hit twice, we assume it's a new pyre event and start to recount.
   * We will also reset counter once a new hit later than the buffer amount happens.
   * From my testing this provides very accurate results.
   * There are potentially some very specific edgecases that would break this, but
   * so far I haven't experienced this. */
  private pyreReduceCooldown(event: DamageEvent) {
    const targetId = event.targetID;
    const targetInstance = event.targetInstance;
    const currentTimestamp = event.timestamp;
    const buffer = 20;

    // Buffer here helps when event timings are slightly off
    if (
      this.previousPyreDamageEvent + buffer < currentTimestamp ||
      (this.enemyHitCounter[targetId] && this.enemyHitCounter[targetId][targetInstance])
    ) {
      this.previousPyreDamageEvent = currentTimestamp;
      this.enemyHitCounter = [];
      this.pyreCounter = 0;
    }

    if (!this.enemyHitCounter[targetId]) {
      this.enemyHitCounter[targetId] = [];
    }

    if (!this.enemyHitCounter[targetId][targetInstance]) {
      this.enemyHitCounter[targetId][targetInstance] = 1;
    }

    if (this.pyreCounter < this.maxPyreCount) {
      this.pyreCounter += 1;
      this.calculateCDR(CAUSALITY_PYRE_CDR_MS, SPELLS.PYRE.id);
    }
  }

  private disReduceCooldown(event: DamageEvent) {
    // Mass Disintegrate doesn't provide CDR sadge
    if (isMassDisintegrateTick(event)) {
      return;
    }

    this.calculateCDR(CAUSALITY_DISINTEGRATE_CDR_MS, SPELLS.DISINTEGRATE.id);
  }

  calculateCDR(CDRAmount: number, sourceId: number) {
    for (const spellId of this.spellIds) {
      const source = this.sourceData[sourceId];

      const effectiveCDR = this.spellUsable.reduceCooldown(spellId, CDRAmount);
      const wastedCDR = CDRAmount - effectiveCDR;

      source.CDR += effectiveCDR / 1000;
      if (this.combatant.hasBuff(SPELLS.BLAZING_SHARDS.id)) {
        source.wastedCDRDuringBlazing += wastedCDR / 1000;
      } else {
        source.wastedCDR += wastedCDR / 1000;
      }
    }
  }

  statistic() {
    const effectiveCDR =
      this.sourceData[SPELLS.PYRE.id].CDR + this.sourceData[SPELLS.DISINTEGRATE.id].CDR;
    const blazingCDR =
      this.sourceData[SPELLS.PYRE.id].wastedCDRDuringBlazing +
      this.sourceData[SPELLS.DISINTEGRATE.id].wastedCDRDuringBlazing;
    const wastedCDR =
      this.sourceData[SPELLS.PYRE.id].wastedCDR + this.sourceData[SPELLS.DISINTEGRATE.id].wastedCDR;

    const cdrSourceItems = [
      {
        color: 'rgb(183,65,14)',
        label: 'Pyre',
        spellId: SPELLS.PYRE.id,
        valueTooltip: this.sourceData[SPELLS.PYRE.id].CDR.toFixed(2) + 's CDR',
        value: this.sourceData[SPELLS.PYRE.id].CDR,
      },
      {
        color: 'rgb(41,134,204)',
        label: 'Disintegrate',
        spellId: SPELLS.DISINTEGRATE.id,
        valueTooltip: this.sourceData[SPELLS.DISINTEGRATE.id].CDR.toFixed(2) + 's CDR',
        value: this.sourceData[SPELLS.DISINTEGRATE.id].CDR,
      },
    ];

    const effectiveCDRItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effetive CDR',
        valueTooltip: effectiveCDR.toFixed(2) + 's effective CDR',
        value: effectiveCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip: wastedCDR.toFixed(2) + 's CDR wasted whilst an Empower was ready',
        value: wastedCDR,
      },
      ...(blazingCDR > 0
        ? [
            {
              color: 'rgb(248,233,190)',
              label: SPELLS.BLAZING_SHARDS.name,
              spellId: SPELLS.BLAZING_SHARDS.id,
              valueTooltip: blazingCDR.toFixed(2) + 's CDR wasted during Blazing Shards',
              value: blazingCDR,
            },
          ]
        : []),
    ];

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.CAUSALITY_TALENT} /> usage
          </label>
          <strong>CDR source:</strong>
          <DonutChart items={cdrSourceItems} />
        </div>
        <div className="pad">
          <strong>CDR effeciency:</strong>
          <DonutChart items={effectiveCDRItems} />
        </div>
      </Statistic>
    );
  }
}

export default Causality;
