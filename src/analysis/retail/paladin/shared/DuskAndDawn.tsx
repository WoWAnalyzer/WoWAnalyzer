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
    // replacing with dusk and dawn check for now for typechecks
    this.hasDuskAndDawn =
      this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_DAWN_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_DUSK_TALENT);
    this.hasSealOfOrder = false; // talent was removed. future maintainers can remove the related code
    this.active = this.hasDuskAndDawn;

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
  }

  get holyPowerGeneratorIds() {
    return this.holyPowerGenerators.map((spell) => spell.id);
  }

  onDuskApplied(event: ApplyBuffEvent) {
    // TODO: track DR
    if (this.hasSealOfOrder) {
      this.spellUsable.applyCooldownRateChange(this.holyPowerGeneratorIds, 1.1);
    }
  }
  onDuskRemoved(event: RemoveBuffEvent) {
    if (this.hasSealOfOrder) {
      this.spellUsable.removeCooldownRateChange(this.holyPowerGeneratorIds, 1.1);
    }
  }

  get duskUptimePct() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.BLESSING_OF_DUSK.id) / this.owner.fightDuration
    );
  }

  get dawnUptimePct() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.BLESSING_OF_DAWN.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        key="Statistic"
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.DEFAULT}
      >
        <BoringSpellValueText spell={TALENTS.BLESSING_OF_DUSK_TALENT}>
          <BoringSpellValue
            spell={SPELLS.BLESSING_OF_DUSK}
            value={`${formatPercentage(this.duskUptimePct)}%`}
            label="Dusk Uptime"
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
