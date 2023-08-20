import { formatPercentage } from 'common/format';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';

import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPECS from 'game/SPECS';
import {
  HOLY_SPEC_HOLY_POWER_GENERATORS,
  PROT_SPEC_HOLY_POWER_GENERATORS,
  RET_SPEC_HOLY_POWER_GENERATORS,
} from './constants';
import Spell from 'common/SPELLS/Spell';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

export class DuskAndDawn extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  hasDuskAndDawn = false;
  hasSealOfOrder = false;
  holyPowerGenerators: readonly Spell[] = [];

  constructor(options: Options) {
    super(options);
    this.active = false;
    // FIXME: disabled due to major changes to Dusk & Dawn
    // this.hasDuskAndDawn = this.selectedCombatant.hasTalent(TALENTS.OF_DUSK_AND_DAWN_TALENT);
    this.hasSealOfOrder = this.selectedCombatant.hasTalent(TALENTS.SEAL_OF_ORDER_TALENT);
    // this.active = this.hasDuskAndDawn;
    if (!this.active) {
      return;
    }

    if (this.selectedCombatant.spec === SPECS.RETRIBUTION_PALADIN) {
      this.holyPowerGenerators = RET_SPEC_HOLY_POWER_GENERATORS;
    } else if (this.selectedCombatant.spec === SPECS.HOLY_PALADIN) {
      this.holyPowerGenerators = HOLY_SPEC_HOLY_POWER_GENERATORS;
    } else if (this.selectedCombatant.spec === SPECS.PROTECTION_PALADIN) {
      this.holyPowerGenerators = PROT_SPEC_HOLY_POWER_GENERATORS;
    }

    this.addEventListener(Events.applybuff.spell(SPELLS.BLESSING_OF_DUSK), this.onDuskApplied);
    this.addEventListener(Events.removebuff.spell(SPELLS.BLESSING_OF_DUSK), this.onDuskRemoved);

    this.addEventListener(Events.applybuff.spell(SPELLS.BLESSING_OF_DAWN), this.onDawnApplied);
    this.addEventListener(Events.removebuff.spell(SPELLS.BLESSING_OF_DAWN), this.onDawnRemoved);
  }

  duskUptime = 0;
  dawnUptime = 0;

  duskAppliedTime: number | undefined;
  dawnAppliedTime: number | undefined;

  get holyPowerGeneratorIds() {
    return this.holyPowerGenerators.map((spell) => spell.id);
  }

  onDuskApplied(event: ApplyBuffEvent) {
    this.duskAppliedTime = event.timestamp;

    // TODO: track DR
    if (this.hasSealOfOrder) {
      this.spellUsable.applyCooldownRateChange(this.holyPowerGeneratorIds, 1.1);
    }
  }
  onDuskRemoved(event: RemoveBuffEvent) {
    if (this.duskAppliedTime !== undefined) {
      this.duskUptime += event.timestamp - this.duskAppliedTime;
      if (this.hasSealOfOrder) {
        this.spellUsable.removeCooldownRateChange(this.holyPowerGeneratorIds, 1.1);
      }
    }
  }

  onDawnApplied(event: ApplyBuffEvent) {
    this.dawnAppliedTime = event.timestamp;
    // TODO: track damage/healing
  }
  onDawnRemoved(event: RemoveBuffEvent) {
    if (this.dawnAppliedTime !== undefined) {
      this.dawnUptime += event.timestamp - this.dawnAppliedTime;
    }
  }

  get duskUptimePct() {
    return this.duskUptime / this.owner.fightDuration;
  }

  get dawnUptimePct() {
    return this.dawnUptime / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        key="Statistic"
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.DEFAULT}
      >
        <BoringSpellValueText spell={TALENTS.OF_DUSK_AND_DAWN_HOLY_TALENT}>
          <BoringSpellValue
            spell={SPELLS.BLESSING_OF_DUSK}
            value={`${formatPercentage(this.duskUptimePct)}%`}
            label="Dusk Uptime"
          />
          <BoringSpellValue
            spell={SPELLS.BLESSING_OF_DAWN}
            value={`${formatPercentage(this.dawnUptimePct)}%`}
            label="Dawn Uptime"
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
