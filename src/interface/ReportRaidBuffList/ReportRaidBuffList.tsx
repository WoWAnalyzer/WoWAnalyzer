import React from 'react';

import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS';

import './ReportRaidBuffList.scss';

import ReportRaidBuffListItem from '../ReportRaidBuffListItem';

interface CombatantInfo {
  specID: number;
}
interface Player {
  type: string;
  combatant: CombatantInfo;
}

interface Props {
  players: Player[];
}
interface State {
  [key: string]: {
    spellId: number;
    count: number;
  };
}

class ReportRaidBuffList extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      stamina: {
        spellId: SPELLS.POWER_WORD_FORTITUDE.id,
        count: 0,
      },
      attackPower: {
        spellId: SPELLS.BATTLE_SHOUT.id,
        count: 0,
      },
      intellect: {
        spellId: SPELLS.ARCANE_INTELLECT.id,
        count: 0,
      },
      magicVulnerability: {
        spellId: SPELLS.CHAOS_BRAND.id,
        count: 0,
      },
      physicalVulnerability: {
        spellId: SPELLS.MYSTIC_TOUCH.id,
        count: 0,
      },
      bloodlust: {
        spellId: SPELLS.BLOODLUST.id,
        count: 0,
      },
      battleRes: {
        spellId: SPELLS.REBIRTH.id,
        count: 0,
      },
      rallyingCry: {
        spellId: SPELLS.RALLYING_CRY.id,
        count: 0,
      },
      darkness: {
        spellId: SPELLS.DARKNESS.id,
        count: 0,
      },
      auraMastery: {
        spellId: SPELLS.AURA_MASTERY.id,
        count: 0,
      },
      spiritLink: {
        spellId: SPELLS.SPIRIT_LINK_TOTEM.id,
        count: 0,
      },
      healingTide: {
        spellId: SPELLS.HEALING_TIDE_TOTEM_CAST.id,
        count: 0,
      },
      revival: {
        spellId: SPELLS.REVIVAL.id,
        count: 0,
      },
      barrier: {
        spellId: SPELLS.POWER_WORD_BARRIER_CAST.id,
        count: 0,
      },
      divineHymn: {
        spellId: SPELLS.DIVINE_HYMN_CAST.id,
        count: 0,
      },
      salvation: {
        spellId: SPELLS.HOLY_WORD_SALVATION_TALENT.id,
        count: 0,
      },
      tranquility: {
        spellId: SPELLS.TRANQUILITY_CAST.id,
        count: 0,
      },
    };
  }

  componentWillMount() {
    this.calculateCompositionBreakdown(this.props.players);
  }

  incrementBuff(buff: string) {
    this.setState(prevState => ({
      [buff]: { ...this.state[buff], count: prevState[buff].count + 1 },
    }));
  }

  calculateCompositionBreakdown(players: Player[]) {
    players.forEach(player => {
      this.calculateRaidBuffs(player);
      this.calculateHealingCds(player);
    });
  }

  calculateRaidBuffs(player: Player) {
    if (player.type === 'Priest') {
      this.incrementBuff('stamina');
    }

    if (player.type === 'Warrior') {
      this.incrementBuff('attackPower');
      this.incrementBuff('rallyingCry');
    }

    if (player.type === 'Mage') {
      this.incrementBuff('intellect');
    }

    if (player.type === 'DemonHunter') {
      this.incrementBuff('magicVulnerability');
      if (player.combatant.specID === SPECS.HAVOC_DEMON_HUNTER.id) {
        this.incrementBuff('darkness');
      }
    }

    if (player.type === 'Monk') {
      this.incrementBuff('physicalVulnerability');
    }

    if (player.type === 'Shaman' || player.type === 'Mage') {
      // TODO: Make faction specific
      this.incrementBuff('bloodlust');
    }

    if (
      player.type === 'Druid' ||
      player.type === 'DeathKnight' ||
      player.type === 'Warlock'
    ) {
      this.incrementBuff('battleRes');
    }
  }

  calculateHealingCds(player: Player) {
    if (player.combatant.specID === SPECS.HOLY_PALADIN.id) {
      this.incrementBuff('auraMastery');
    }

    if (player.combatant.specID === SPECS.RESTORATION_SHAMAN.id) {
      this.incrementBuff('spiritLink');
      this.incrementBuff('healingTide');
    }

    if (player.combatant.specID === SPECS.MISTWEAVER_MONK.id) {
      this.incrementBuff('revival');
    }

    if (player.combatant.specID === SPECS.DISCIPLINE_PRIEST.id) {
      this.incrementBuff('barrier');
    }

    if (player.combatant.specID === SPECS.HOLY_PRIEST.id) {
      this.incrementBuff('divineHymn');
      this.incrementBuff('salvation');
    }

    if (player.combatant.specID === SPECS.RESTORATION_DRUID.id) {
      this.incrementBuff('tranquility');
    }
  }

  render() {
    return (
      <div className="raidbuffs">
        <h1>Raid Buffs</h1>
        {Object.keys(this.state).map(key => (
          <ReportRaidBuffListItem
            key={key}
            spellId={this.state[key].spellId}
            count={this.state[key].count}
          />
        ))}
      </div>
    );
  }
}

export default ReportRaidBuffList;
