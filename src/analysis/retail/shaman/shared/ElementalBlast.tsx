import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ELEMENTAL_BLAST_BUFFS } from './constants';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import { Talent } from 'common/TALENTS/types';
import SPECS from 'game/SPECS';

class ElementalBlast extends Analyzer {
  currentBuffAmount = 0;
  lastFreshApply = 0;
  resultDuration = 0;
  buffAmounts: Record<number, number> = {
    [SPELLS.ELEMENTAL_BLAST_CRIT.id]: 0,
    [SPELLS.ELEMENTAL_BLAST_MASTERY.id]: 0,
    [SPELLS.ELEMENTAL_BLAST_HASTE.id]: 0,
  };

  talent: Talent;

  constructor(options: Options) {
    super(options);

    this.talent =
      this.selectedCombatant.spec?.id === SPECS.ELEMENTAL_SHAMAN.id
        ? TALENTS_SHAMAN.ELEMENTAL_BLAST_ELEMENTAL_TALENT
        : TALENTS_SHAMAN.ELEMENTAL_BLAST_ENHANCEMENT_TALENT;

    this.active = this.selectedCombatant.hasTalent(this.talent);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(ELEMENTAL_BLAST_BUFFS),
      this.onRemoveBuff,
    );

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(ELEMENTAL_BLAST_BUFFS),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(ELEMENTAL_BLAST_BUFFS),
      (event) => (this.buffAmounts[event.ability.guid] += 1),
    );
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.currentBuffAmount -= 1;
    if (this.currentBuffAmount === 0) {
      this.resultDuration += event.timestamp - this.lastFreshApply;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (this.currentBuffAmount === 0) {
      this.lastFreshApply = event.timestamp;
    }
    this.currentBuffAmount += 1;
    this.buffAmounts[event.ability.guid] += 1;
  }

  get hasteUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) /
      this.owner.fightDuration
    );
  }

  get critUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) /
      this.owner.fightDuration
    );
  }

  get masteryUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) /
      this.owner.fightDuration
    );
  }

  get elementalBlastUptime() {
    return this.resultDuration / this.owner.fightDuration;
  }

  elementalBlastDonut() {
    const items = [
      {
        color: '#9256ff',
        label: <>Mastery</>,
        spellId: SPELLS.ELEMENTAL_BLAST_MASTERY.id,
        value: this.buffAmounts[SPELLS.ELEMENTAL_BLAST_MASTERY.id],
      },
      {
        color: '#0ed59b',
        label: <>Haste</>,
        spellId: SPELLS.ELEMENTAL_BLAST_HASTE.id,
        value: this.buffAmounts[SPELLS.ELEMENTAL_BLAST_HASTE.id],
      },
      {
        color: '#e01c1c',
        label: <>Crit</>,
        spellId: SPELLS.ELEMENTAL_BLAST_CRIT.id,
        value: this.buffAmounts[SPELLS.ELEMENTAL_BLAST_CRIT.id],
      },
    ];
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} category={STATISTIC_CATEGORY.TALENTS}>
        <div className="pad">
          <label>
            <SpellLink spell={this.talent} /> stat distribution
          </label>
          {this.elementalBlastDonut()}
        </div>
      </Statistic>
    );
  }
}

export default ElementalBlast;
