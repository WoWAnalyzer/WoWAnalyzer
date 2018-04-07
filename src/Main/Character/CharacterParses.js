import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWcl';

import SPECS from 'common/SPECS';
import DIFFICULTIES from 'common/DIFFICULTIES';
import ITEMS from 'common/ITEMS';

import { formatNumber, formatPercentage } from 'common/format';
import { makePlainUrl } from 'Main/makeAnalyzerUrl';

import SpellIcon from 'common/SpellIcon';
import ItemLink from 'common/ItemLink';
import Icon from 'common/Icon';

class CharacterParses extends React.Component {

  static propTypes = {
    region: PropTypes.string.isRequired,
    realm: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      specs: [],
      class: "",
      activeSpec: [],
      activeDifficulty: [],
      filteredParses: [],
      parses: [],
      trinkets: ITEMS,
    };

    this.updateDifficulty = this.updateDifficulty.bind(this);
    this.updateSpec = this.updateSpec.bind(this);

    this.load = this.load.bind(this);
    this.filterParses = this.filterParses.bind(this);
    this.iconPath = this.iconPath.bind(this);
    this.fillMissingTrinkets = this.fillMissingTrinkets.bind(this);
    this.load();
  }

  iconPath(specName) {
    return `/specs/${this.state.class.replace(" ", "")}-${specName.replace(" ", "")}.jpg`;
  }

  updateDifficulty(diff) {
    let newDiff = this.state.activeDifficulty;
    if (newDiff.includes(diff)) {
      newDiff = newDiff.filter((elem, index) => {
        return elem !== diff;
      });
    } else {
      newDiff.push(diff);
    }

    this.setState({
      activeDifficulty: newDiff,
    });

    this.filterParses();
  }

  updateSpec(spec) {
    let newSpec = this.state.activeSpec;
    if (newSpec.includes(spec)) {
      newSpec = newSpec.filter((elem, index) => {
        return elem !== spec;
      });
    } else {
      newSpec.push(spec);
    }

    this.setState({
      activeSpec: newSpec,
    });

    this.filterParses();
  }

  fillMissingTrinkets() {
    Object.values(this.state.trinkets).forEach(trinket => {
      console.info(trinket);
      return fetch(`https://eu.api.battle.net/wow/item/${trinket.id}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
        .then(response => response.json())
        .then((data) => {
          console.info(data);
          const updatedTrinkets = this.state.trinkets;
          updatedTrinkets[trinket.id] = {
            icon: data.icon,
            id: trinket.id,
            name: trinket.name,
            quality: trinket.quality,
          };

          this.setState({
            trinkets: updatedTrinkets,
          });

          this.forceUpdate();
        });
    });
  }

  filterParses() {
    let filteredParses = this.state.parses;

    filteredParses = filteredParses.filter((elem, index) => {
      return this.state.activeDifficulty.includes(elem.difficulty);
    }).filter((elem, index) => {
      return this.state.activeSpec.includes(elem.spec);
    }).sort((a, b) => { 
      return b.start_time - a.start_time; 
    }).slice(0, 15);

    this.setState({
      filteredParses: filteredParses,
    });

    console.info(this.state);
    console.info(filteredParses);
  }

  load() {
    return fetchWcl(`parses/character/${ this.props.name }/${ this.props.realm }/${ this.props.region }`, {
      
    }).then((rawParses) => {
      const charClass = rawParses[0].specs[0].class;
      const specs = Object.values(SPECS).map((elem, index) => { 
        if (elem.className.replace(" ", "") !== charClass) {
          return undefined;
        }
        return elem.specName;
      }).filter((elem, index) => {
        return elem;
      });

      console.log(rawParses);

      const parses = [];
      const trinkets = { };
      //resolve the boss+difficulty->spec->parse structure to make sorting & filtering easiery
      rawParses.forEach((elem, index) => {
        const name = elem.name;
        const difficulty = DIFFICULTIES[elem.difficulty];

        elem.specs.filter((item) => { return item.spec !== "Melee" && item.spec !== "Ranged"; }).forEach(element => {
          const spec = element.spec;
          element.data.forEach(singleParse => {
            const finalParse = Object.assign({
              name: name,
              spec: spec,
              difficulty: difficulty,
            }, singleParse);

            if (Object.values(singleParse.talents).filter((talent) => { return talent.id === 0; }).length === 0) {
              parses.push(finalParse);
            }

            if (!ITEMS[singleParse.gear[12].id]) {
              trinkets[singleParse.gear[12].id] = {
                name: singleParse.gear[12].name,
                id: singleParse.gear[12].id,
                icon: ITEMS[0].icon,
                quality: singleParse.gear[13].quality,
              };
            }

            if (!ITEMS[singleParse.gear[13].id]) {
              trinkets[singleParse.gear[13].id] = {
                name: singleParse.gear[13].name,
                id: singleParse.gear[13].id,
                icon: ITEMS[0].icon,
                quality: singleParse.gear[13].quality,
              };
            }
          });
        });
      });

      this.setState({
        specs: [...new Set(specs)],
        activeSpec: [...new Set(specs.map(elem => { return elem.replace(" ", ""); }))],
        activeDifficulty: DIFFICULTIES.filter(elem => { return elem; }),
        class: charClass,
        parses: parses,
        trinkets: trinkets,
      });

      console.log(this.state);

      this.fillMissingTrinkets();
      this.filterParses();
    });
  }

  render() {
    return (
      <div className="container charparse">
        <div className="flex-main">
          <div className="row">
            <div className="col-md-7">
              <div className="panel" stlye={{ overflow: 'auto' }}>
                <div className="flex-main">
                  {this.state.filteredParses.map((elem, index) =>
                    <div className="row character-parse">
                      <div className="col-md-8">
                        <img src={this.iconPath(elem.spec)} style={{ height: 30, marginRight: 10 }} alt="Icon" />
                        {elem.difficulty} - {elem.name}
                      </div>
                      <div className="col-md-2">
                        {formatPercentage(elem.historical_percent / 100)}%
                      </div>
                      <div className="col-md-2" style={{ textAlign: 'right' }}>
                        {new Date(elem.start_time).toLocaleDateString()}
                      </div>
                      
                      <div className="col-md-8" style={{ paddingLeft: 55 }}>
                        {elem.talents.map(talent => 
                          <SpellIcon 
                            id={talent.id}
                            style={{ width: '1.8em', height: '1.8em', marginRight: 2 }}
                          />
                        )}
                        <span style={{ marginRight: 10 }}></span>
                        {elem.gear.filter((item, index) => { return index === 12 || index === 13 || item.quality === "legendary"; }).map(item =>
                          <ItemLink id={item.id} class={item.quality}>
                            <Icon 
                              icon={ITEMS[item.id] ? ITEMS[item.id].icon : this.state.trinkets[item.id].icon} 
                              style={{ width: '1.8em', height: '1.8em', border: '1px solid', marginRight: 2 }}
                            />
                          </ItemLink>
                        )}
                      </div>
                      <div className="col-md-2">
                        {formatNumber(elem.persecondamount)} DPS 
                      </div>
                      <div className="col-md-2" style={{ textAlign: 'right' }}>
                        <a href={makePlainUrl(elem.report_code, elem.report_fight, elem.difficulty + " " + elem.name, " ", elem.character_name)} target="_blank">analyze</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-md-5">
              <div className="panel">
                <div className="flex-main">
                  <div className="row filter">
                    <div className="col-md-5">
                      <select className="form-control">
                        <option selected>Antorus the Burning Throne</option>
                      </select>
                      <select className="form-control">
                        <option selected>All bosses</option>
                        <option>Aggramar</option>
                      </select>
                      <select className="form-control">
                        <option selected>DPS</option>
                      </select>
                      <select className="form-control">
                        <option selected>Date</option>
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      {DIFFICULTIES.filter((elem) => { return elem; }).map((elem, index) => 
                      <div onClick={() => this.updateDifficulty(elem)} className={ this.state.activeDifficulty.includes(elem) ? 'selected form-control' : 'form-control'}>
                        {elem}
                      </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      {this.state.specs.map((elem, index) => 
                        <div onClick={() => this.updateSpec(elem.replace(" ", ""))} className={this.state.activeSpec.includes(elem.replace(" ", "")) ? 'selected form-control' : 'form-control'}>
                          <img src={this.iconPath(elem)} style={{ height: 20, marginRight: 10 }} alt="Icon" />
                          {elem}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-muted" style={{ padding: 10, display: 'block' }}>
                  Some logs are missing? We hide logs that were logged without 'advanced combatlog' since those are not detailed enough to be analyzed.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterParses;
