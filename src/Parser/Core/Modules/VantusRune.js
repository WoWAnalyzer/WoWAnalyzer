import React from 'react';

import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatNumber } from 'common/format';

import StatisticBox from 'Main/StatisticBox';

import Module from 'Parser/Core/Module';

// http://www.wowhead.com/uncategorized-spells/name:Vantus+Rune:?filter=29;42;0 $.makeArray($('.listview-cleartext[href^="/spell="]')).map(item => `${item.href.replace(/^.*spell=([0-9]+)$/, '$1')}, // ${item.innerText}`).join("\n")
// buff id: boss id
const VANTUS_RUNE_SPELL_IDS = {
  192761: 1853, // Vantus Rune: Nythendra
  192765: 1876, // Vantus Rune: Elerethe Renferal
  192762: 1873, // Vantus Rune: Il'gynoth, The Heart of Corruption
  191464: 1841, // Vantus Rune: Ursoc
  192763: 1854, // Vantus Rune: Dragons of Nightmare
  192766: 1877, // Vantus Rune: Cenarius
  192764: 1864, // Vantus Rune: Xavius
  // Trial of Valor
  229174: 1958, // Vantus Rune: Odyn
  229175: 1962, // Vantus Rune: Guarm
  229176: 2008, // Vantus Rune: Helya
  // The Nighthold
  192767: 1849, // Vantus Rune: Skorpyron
  192768: 1865, // Vantus Rune: Chronomatic Anomaly
  192769: 1867, // Vantus Rune: Trilliax
  192770: 1871, // Vantus Rune: Spellblade Aluriel
  192771: 1862, // Vantus Rune: Tichondrius
  192773: 1842, // Vantus Rune: Krosus
  192772: 1886, // Vantus Rune: High Botanist Tel'arn
  192774: 1863, // Vantus Rune: Star Augur Etraeus
  192775: 1872, // Vantus Rune: Grand Magistrix Elisande
  192776: 1866, // Vantus Rune: Gul'dan
  // Tomb of Sargeras
  237821: 2032, // Vantus Rune: Goroth
  237828: 2048, // Vantus Rune: Demonic Inquisition
  237824: 2036, // Vantus Rune: Harjatan
  237826: 2037, // Vantus Rune: Mistress Sassz'ine
  237822: 2050, // Vantus Rune: Sisters of the Moon
  237827: 2054, // Vantus Rune: The Desolate Host
  237820: 2038, // Vantus Rune: Fallen Avatar
  237825: 2051, // Vantus Rune: Kil'jaeden
};
const VANTUS_RUNE_VERSATILITY = 1500;
const VERSATILITY_PER_PERCENT_THROUGHPUT = 47500;
const VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION = VERSATILITY_PER_PERCENT_THROUGHPUT * 2;
const VANTUS_RUNE_PERCENTAGE_THROUGHPUT = VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_THROUGHPUT;
const VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION  = VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION;

class VantusRune extends Module {
  activeRune = null;
  on_initialized() {
    if (!this.owner.error) {
      const fight = this.owner.fight;
      const bossId = fight.boss;

      Object.keys(VANTUS_RUNE_SPELL_IDS).forEach(spellId => {
        if (VANTUS_RUNE_SPELL_IDS[spellId] !== bossId) {
          // Vantus Runes only work on 1 boss each
          return;
        }
        const match = this.owner.selectedCombatant.getBuff(spellId);
        if (match !== undefined) {
          this.activeRune = match;
        }
      });

      this.active = this.activeRune !== null;
    }
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    const damageDone = this.owner.totalDamageDone - (this.owner.totalDamageDone / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT));
    const healingDone = this.owner.totalHealing - (this.owner.totalHealing / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT));
    const damageReduced = (this.owner.totalDamageTaken / (1 - VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION)) - this.owner.totalDamageTaken;

    return (
      <StatisticBox
        icon={(
          <SpellLink id={this.activeRune.ability.guid}>
            <Icon icon={this.activeRune.ability.abilityIcon} />
          </SpellLink>
        )}
        value={damageDone > healingDone ? `${formatNumber(damageDone / fightDuration * 1000)} DPS` : `${formatNumber(healingDone / fightDuration * 1000)} HPS`}
        label="Vantus Rune gain"
        tooltip={`The throughput gain from using a Vantus Rune. You gained ${formatNumber(damageDone / fightDuration * 1000)} damage per second (DPS) and ${formatNumber(healingDone / fightDuration * 1000)} healing per second (HPS), and reduced your damage taken by ${formatNumber(damageReduced / fightDuration * 1000)} per second (DRPS).`}
      />
    );
  }
}

export default VantusRune;
