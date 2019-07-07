import React from "react";
import PropTypes from 'prop-types';

import RaidBuff from "./RaidBuff";
import "./RaidBuffs.scss";

class RaidBuffs extends React.Component {
  static propTypes = {
    players: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      stamina: {
        icon: "spell_holy_wordfortitude",
        count: 0,
      },
      attackPower: {
        icon: "ability_warrior_battleshout",
        count: 0,
      },
      intellect: {
        icon: "spell_holy_magicalsentry",
        count: 0,
      },
      magicVulnerability: {
        icon: "ability_demonhunter_empowerwards",
        count: 0,
      },
      physicalVulnerability: {
        icon: "ability_monk_sparring",
        count: 0,
      },
      bloodlust: {
        icon: "spell_nature_bloodlust",
        count: 0,
      },
      battleRes: {
        icon: "spell_nature_reincarnation",
        count: 0,
      },
      rallyingCry: {
        icon: "ability_warrior_rallyingcry",
        count: 0,
      },
      darkness: {
        icon: "ability_demonhunter_darkness",
        count: 0,
      },
      auraMastery: {
        icon: "spell_holy_auramastery",
        count: 0,
      },
      spiritLink: {
        icon: "spell_shaman_spiritlink",
        count: 0,
      },
      healingTide: {
        icon: "ability_shaman_healingtide",
        count: 0,
      },
      revival: {
        icon: "spell_monk_revival",
        count: 0,
      },
      barrier: {
        icon: "spell_holy_powerwordbarrier",
        count: 0,
      },
      divineHymn: {
        icon: "spell_holy_divinehymn",
        count: 0,
      },
      salvation: {
        icon: "ability_priest_archangel",
        count: 0,
      },
      tranquility: {
        icon: "spell_nature_tranquility",
        count: 0,
      },
    };
  }

  componentWillMount() {
    this.calculateCompositionBreakdown(this.props.players);
  }

  incrementBuff(buff) {
    this.setState((prevState, props) => ({[buff]: { ...this.state[buff], count: prevState[buff].count + 1 } }));
  }

  calculateCompositionBreakdown(players) {
    players.forEach(player => {
      this.calculateRaidBuffs(player);
      this.calculateHealingCds(player);
    });
  }

  calculateRaidBuffs(player) {
    if (player.type === "Priest") {
      this.incrementBuff("stamina");
    }
  
    if (player.type === "Warrior") {
      this.incrementBuff("attackPower");
      this.incrementBuff("rallyingCry");
    }
  
    if (player.type === "Mage") {
      this.incrementBuff("intellect");
    }
  
    if (player.type === "DemonHunter") {
      this.incrementBuff("magicVulnerability");
      if (player.combatant.specID === 577) {
        this.incrementBuff("darkness");
      }
    }
  
    if (player.type === "Monk") {
      this.incrementBuff("physicalVulnerability");
    }
  
    if (player.type === "Shaman" || player.type === "Mage") {
      this.incrementBuff("bloodlust");
    }
    
    if (player.type === "Druid" || player.type === "DeathKnight" || player.type === "Warlock") {
      this.incrementBuff("battleRes");
    }
  }

  calculateHealingCds(player) {
    if (player.combatant.specID === 65) {
      this.incrementBuff("auraMastery");
    }
  
    if (player.combatant.specID === 264) {
      this.incrementBuff("spiritLink");
      this.incrementBuff("healingTide");
    }
  
    if (player.combatant.specID === 270) {
      this.incrementBuff("revival");
    }
  
    if (player.combatant.specID === 256) {
      this.incrementBuff("barrier");
    }
  
    if (player.combatant.specID === 257) {
      this.incrementBuff("divineHymn");
      this.incrementBuff("salvation");
    }
  
    if (player.combatant.specID === 105) {
      this.incrementBuff("tranquility");
    }
  }

  render() {
    return (
      <div className="raidbuffs">
        <h1>Raid Cooldowns</h1>
        {Object.keys(this.state).map(key => <RaidBuff key={key} icon={this.state[key].icon} count={this.state[key].count} />)}
      </div>
    );
  }
}

export default RaidBuffs;