import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import fetchWcl from 'common/fetchWcl';
import ActivityIndicator from 'Main/ActivityIndicator';

import ZONES from 'common/ZONES';
import REALMS from 'common/REALMS';
import SPECS from 'common/SPECS';
import DIFFICULTIES from 'common/DIFFICULTIES';
import ITEMS from 'common/ITEMS';

import './CharacterParses.css';
import CharacterParsesList from './CharacterParsesList';

//rendering 400+ parses takes quite some time
const RENDER_LIMIT = 100;

const ORDER_BY = {
  DATE: 0,
  DPS: 1,
  PERCENTILE: 2,
};
const ZONE_DEFAULT_ANTORUS = 17;
const BOSS_DEFAULT_ALL_BOSSES = 0;
const TRINKET_SLOTS = [12, 13];

//Hunter or rogues have the same log multiple times with 'Ranged' or 'Melee' as spec
//probably only there to allow filtering by multiple specs on WCLs character-page
//we don't want those logs tho
const EXCLUDED_GENERIC_SPECS_FROM_PARSES = ['Ranged', 'Melee']; 

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
      class: '',
      activeSpec: [],
      activeDifficulty: DIFFICULTIES,
      activeZoneID: ZONE_DEFAULT_ANTORUS,
      activeEncounter: BOSS_DEFAULT_ALL_BOSSES,
      sortBy: ORDER_BY.DATE,
      metric: 'dps',
      image: null,
      parses: [],
      isLoading: true,
      error: false,
    };

    this.updateDifficulty = this.updateDifficulty.bind(this);
    this.updateSpec = this.updateSpec.bind(this);

    this.load = this.load.bind(this);
    this.changeParseStructure = this.changeParseStructure.bind(this);
    this.iconPath = this.iconPath.bind(this);
    this.fetchImage = this.fetchImage.bind(this);
    this.updateZoneMetricBoss = this.updateZoneMetricBoss.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  iconPath(specName) {
    return `/specs/${this.state.class.replace(' ', '')}-${specName.replace(' ', '')}.jpg`;
  }

  updateZoneMetricBoss(zone, metric, boss) {
    this.setState({ 
      activeZoneID: zone, 
      metric: metric,
      activeEncounter: boss,
    }, () => {
      this.load();
    });
  }

  updateDifficulty(diff) {
    let newDiff = this.state.activeDifficulty;
    if (newDiff.includes(diff)) {
      newDiff = newDiff.filter(elem => elem !== diff);
    } else {
      newDiff = [...newDiff, diff];
    }

    this.setState({
      activeDifficulty: newDiff,
    });
  }

  updateSpec(spec) {
    let newSpec = this.state.activeSpec;
    if (newSpec.includes(spec)) {
      newSpec = newSpec.filter(elem => elem !== spec);
    } else {
      newSpec = [...newSpec, spec];
    }

    this.setState({
      activeSpec: newSpec,
    });
  }

  get filterParses() {
    let filteredParses = this.state.parses;
    filteredParses = filteredParses
      .filter(elem => this.state.activeDifficulty.includes(elem.difficulty))
      .filter(elem => this.state.activeSpec.includes(elem.spec))
      .sort((a, b) => { 
        if (this.state.sortBy === ORDER_BY.DATE) {
          return b.start_time - a.start_time; 
        } else if (this.state.sortBy === ORDER_BY.DPS) {
          return b.persecondamount - a.persecondamount;
        }
        return b.historical_percent - a.historical_percent;
      });

    if (Number(this.state.activeEncounter) === BOSS_DEFAULT_ALL_BOSSES) {
      return filteredParses.slice(0, RENDER_LIMIT);
    }

    filteredParses = filteredParses.filter((elem, index) => {
      return elem.name === this.state.activeEncounter;
    });

    return filteredParses.slice(0, RENDER_LIMIT);
  }

  //resolve the boss+difficulty->spec->parse structure to make sorting & filtering easier
  changeParseStructure(rawParses) {
    const parses = [];
    rawParses.forEach((elem, index) => {
      const name = elem.name;
      const difficulty = DIFFICULTIES[elem.difficulty];

      elem.specs
        .filter(item => !EXCLUDED_GENERIC_SPECS_FROM_PARSES.includes(item.spec))
        .forEach(element => {
          const spec = element.spec;
          element.data.forEach(singleParse => {
            const finalParse = Object.assign({
              name: name,
              spec: spec,
              difficulty: difficulty,
            }, singleParse);

            //filter all logs that have missing talents (logs that were logged without advanced logging)
            if (Object.values(singleParse.talents).filter(talent => talent.id === 0).length === 0) {
              finalParse.advanced = true;
            }
            parses.push(finalParse);

            //get missing trinket-icons later
            TRINKET_SLOTS.forEach(slotID => {
              if (!ITEMS[singleParse.gear[slotID].id]) {
                ITEMS[singleParse.gear[slotID].id] = {
                  name: singleParse.gear[slotID].name,
                  id: singleParse.gear[slotID].id,
                  icon: ITEMS[0].icon,
                  quality: singleParse.gear[slotID].quality,
                };
              }
            });
          });
      });
    });

    Object.values(ITEMS).forEach(trinket => {
      if (trinket.icon === ITEMS[0].icon && trinket.id !== 0) {
        return fetch(`https://eu.api.battle.net/wow/item/${trinket.id}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
          .then(response => response.json())
          .then((data) => {
            ITEMS[trinket.id].icon = data.icon;
          });
      }
    });

    return parses;
  }

  get zoneBosses() {
    return ZONES.find(zone => zone.id === this.state.activeZoneID).encounters;
  }

  fetchImage(refresh = false) {
    //save the chars image URL to localstore
    const image = localStorage.getItem(`${this.props.region}/${this.props.realm}/${this.props.name}`);
    if (image && !refresh) {
      this.setState({
        image: image,
      });
      return;
    }
    
    return fetch(`https://${this.props.region}.api.battle.net/wow/character/${encodeURIComponent(this.props.realm)}/${encodeURIComponent(this.props.name)}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
      .then(response => response.json())
      .then((data) => {
        if (data.status === 'nok') {
          alert('Character doesn\'t exist');
          return;
        }
        const image = data.thumbnail.replace('-avatar.jpg', '');
        localStorage.setItem(`${this.props.region}/${this.props.realm}/${this.props.name}`, image);
        this.setState({
          image: image,
        });
      });
  }

  load(refresh = false) {
    this.fetchImage(refresh);
    this.setState({
      isLoading: true,
    });

    const charName = encodeURIComponent(this.props.name);
    //use the slug from REALMS when available, otherwise try realm-prop and fail
    let charRealm = REALMS[this.props.region] ? REALMS[this.props.region].realms.find(elem => elem.name === this.props.realm).slug : this.props.realm;
    charRealm = encodeURIComponent(charRealm);

    return fetchWcl(`parses/character/${charName}/${charRealm}/${this.props.region}`, {
      metric: this.state.metric,
      zone: this.state.activeZoneID,
      _: refresh ? +new Date() : undefined,
    }).then((rawParses) => {
      if (rawParses.status === 400) {
        // means char was not found on WCL
        this.setState({
          error: true,
        });
        return;
      }

      if (rawParses.length === 0) { //happens when the character has no logs for the selected raid
        this.setState({
          parses: [],
          isLoading: false,
        });
        return;
      }

      if (this.state.class !== '') { //only update parses when class was already parsed (since its only a metric/raid change)
        const parses = this.changeParseStructure(rawParses);
        this.setState({
          parses: parses,
          isLoading: false,
        });

        return;
      }

      const charClass = rawParses[0].specs[0].class;
      const specs = Object.values(SPECS)
        .map(elem => elem.className.replace(' ', '') !== charClass ? undefined : elem.specName)
        .filter(elem => elem)
        .filter((item, index, self) => self.indexOf(item) === index);

      const parses = this.changeParseStructure(rawParses);
      this.setState({
        specs: specs,
        activeSpec: specs.map(elem => elem.replace(' ', '')),
        class: charClass,
        parses: parses,
        isLoading: false,
      });
    });
  }

  render() {
    return (
      <div className="container charparse">
        <div className="flex-main">
          <div className="col-md-5">
            <div className="panel">
              <div className="row filter">
                <div className="col-md-12" style={{ marginBottom: 20, position: 'relative', height: 280 }}>
                  {this.state.image && (
                    <div className="char-image">
                      <img 
                        src={`https://render-${this.props.region}.worldofwarcraft.com/character/${this.state.image}-main.jpg`}
                        alt={"Character render of " + this.props.name }
                        onError={e => this.setState({ image: null })}
                        style={{ width: '100%' }} 
                      />
                    </div>
                  )}
                  <h2 style={{ fontSize: '1.8em', marginTop: 10 }}>{this.props.region} - {this.props.realm}</h2>
                  <h2 style={{ fontSize: '2.4em', margin: '10px 10px' }}>
                    {this.props.name}
                  </h2>
                  {this.state.class && (
                      <img
                        src={`/specs/${this.state.class}-New.png`}
                        alt={`Class icon of ${this.state.class}s`}
                        style={{ height: 50, position: 'absolute', right: 12, top: 10 }}
                      />
                    )}
                </div>
                <div className="col-md-4">
                  Specs:
                  {this.state.specs.map((elem, index) => 
                    <div 
                      key={index} 
                      onClick={() => this.updateSpec(elem.replace(" ", ""))}
                      className={this.state.activeSpec.includes(elem.replace(" ", "")) ? 'selected form-control' : 'form-control'}
                    >
                      <img src={this.iconPath(elem)} style={{ height: 18, marginRight: 10 }} alt="Icon" />
                      {elem}
                    </div>
                  )}
                </div>
                
                <div className="col-md-4">
                  Difficulties:
                  {DIFFICULTIES.filter(elem => elem).map((elem, index) => 
                    <div 
                      key={index} 
                      onClick={() => this.updateDifficulty(elem)} 
                      className={ this.state.activeDifficulty.includes(elem) ? 'selected form-control' : 'form-control'}
                    >
                      {elem}
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  Raid:
                  <select 
                    className="form-control" 
                    value={this.state.activeZoneID}
                    onChange={e => this.updateZoneMetricBoss(Number(e.target.value), this.state.metric, BOSS_DEFAULT_ALL_BOSSES)}
                  >
                    {Object.values(ZONES).reverse().map(elem =>
                      <option key={elem.id} value={elem.id}>{elem.name}</option>
                    )}
                  </select>
                  Boss:
                  <select 
                    className="form-control" 
                    value={this.state.activeEncounter} 
                    onChange={e => this.setState({ activeEncounter: e.target.value })}
                  >
                    <option value={BOSS_DEFAULT_ALL_BOSSES} defaultValue>All bosses</option>
                    {this.zoneBosses.map(e => 
                      <option key={e.id} value={e.name}>{e.name}</option>
                    )}
                  </select>
                  Metric:
                  <select 
                    className="form-control" 
                    value={this.state.metric}
                    onChange={e => this.updateZoneMetricBoss(this.state.activeZoneID, e.target.value, this.state.activeEncounter)}
                  >
                    <option defaultValue value="dps">DPS</option>
                    <option value="hps">HPS</option>
                  </select>
                  Sort by:
                  <select 
                    className="form-control"
                    value={this.state.sortBy}
                    onChange={e => this.setState({ sortBy: Number(e.target.value) })}
                  >
                    <option defaultValue value={ORDER_BY.DATE}>Date</option>
                    <option value={ORDER_BY.DPS}>DPS / HPS</option>
                    <option value={ORDER_BY.PERCENTILE}>Percentile</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-7">
            {this.state.error && (
              <span>
                <Link to="/">
                  Home
                </Link> &gt;{' '}
                <span>
                  {this.props.region}  &gt; {this.props.realm}  &gt; {this.props.name}
                </span>
                <br /><br />
              </span>
            )}
            <div className="panel" stlye={{ overflow: 'auto' }}>
              <div className="flex-main">
                {this.state.isLoading && !this.state.error && (
                  <div style={{ textAlign: 'center', fontSize: '2em', margin: '20px 0' }}>
                    <ActivityIndicator text="Fetching logs..." />
                  </div>
                )}
                {!this.state.isLoading && (
                  <div className="panel-heading">
                    <h2 style={{ display: 'inline' }}>Parses</h2>
                    <Link 
                      to={''} 
                      className="pull-right"
                      onClick={e => {
                        e.preventDefault();
                        this.load(true);
                      }}
                    >
                      <span className="glyphicon glyphicon-refresh" aria-hidden="true" /> Refresh
                    </Link>
                  </div>
                )}
                {this.state.error && (
                  <div>
                    <div className="panel-heading">
                      <h2>We couldn't find your character on Warcraft Logs.</h2>
                    </div>
                    <div style={{ padding: 20 }}>
                      Please check your input and make sure that you've selected the correct region and realm.<br/>
                      If your input was correct, then make sure that someone in your raid logged the fight for you or check <a href="https://www.warcraftlogs.com/help/start/" target="_blank" rel="noopener noreferrer">Warcraft Logs guide</a> to get started with logging on your own.<br/><br/>
                      When you know for sure that you have logs on Warcraft Logs and you still get this error, please message us on <a href="https://discord.gg/AxphPxU" target="_blank" rel="noopener noreferrer">Discord</a> or create an issue on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer" target="_blank" rel="noopener noreferrer">Github</a>.
                    </div>
                  </div>
                )}
                {this.filterParses.length === 0 && !this.state.isLoading && !this.state.error && (
                  <div style={{ padding: 20 }}>
                    We couldn't find any logs.<br/>
                    Please check your filters and make sure that you logged those fights on Warcraft Logs.<br/><br/>
                    You don't know how to log your fights? Check <a href="https://www.warcraftlogs.com/help/start/" target="_blank" rel="noopener noreferrer">Warcraft Logs guide</a> to get startet.
                  </div>
                )}
                {!this.state.isLoading && (
                  <CharacterParsesList parses={this.filterParses} class={this.state.class} metric={this.state.metric} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterParses;
