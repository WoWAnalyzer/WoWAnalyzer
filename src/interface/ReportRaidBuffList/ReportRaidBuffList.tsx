import React from 'react';

import SPECS from 'game/SPECS';

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
    icon: string;
    count: number;
  };
}

class ReportRaidBuffList extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      stamina: {
        icon: 'spell_holy_wordfortitude',
        count: 0,
      },
      attackPower: {
        icon: 'ability_warrior_battleshout',
        count: 0,
      },
      intellect: {
        icon: 'spell_holy_magicalsentry',
        count: 0,
      },
      magicVulnerability: {
        icon: 'ability_demonhunter_empowerwards',
        count: 0,
      },
      physicalVulnerability: {
        icon: 'ability_monk_sparring',
        count: 0,
      },
      bloodlust: {
        icon: 'spell_nature_bloodlust',
        count: 0,
      },
      battleRes: {
        icon: 'spell_nature_reincarnation',
        count: 0,
      },
      rallyingCry: {
        icon: 'ability_warrior_rallyingcry',
        count: 0,
      },
      darkness: {
        icon: 'ability_demonhunter_darkness',
        count: 0,
      },
      auraMastery: {
        icon: 'spell_holy_auramastery',
        count: 0,
      },
      spiritLink: {
        icon: 'spell_shaman_spiritlink',
        count: 0,
      },
      healingTide: {
        icon: 'ability_shaman_healingtide',
        count: 0,
      },
      revival: {
        icon: 'spell_monk_revival',
        count: 0,
      },
      barrier: {
        icon: 'spell_holy_powerwordbarrier',
        count: 0,
      },
      divineHymn: {
        icon: 'spell_holy_divinehymn',
        count: 0,
      },
      salvation: {
        icon: 'ability_priest_archangel',
        count: 0,
      },
      tranquility: {
        icon: 'spell_nature_tranquility',
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
        <h1>Raid Cooldowns</h1>
        {Object.keys(this.state).map(key => (
          <ReportRaidBuffListItem
            key={key}
            icon={this.state[key].icon}
            count={this.state[key].count}
          />
        ))}
      </div>
    );
  }
}

export default ReportRaidBuffList;
