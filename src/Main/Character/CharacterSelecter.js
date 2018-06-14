import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import SelectSearch from 'react-select-search';

import REALMS from 'common/REALMS';

import makeUrl from './makeUrl';

class CharacterSelecter extends React.PureComponent {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
  };
  state = {
    currentRegion: 'EU',
    currentRealm: '',
  };

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.regionInput) {
      this.regionInput.focus();
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const region = this.regionInput.value;
    const realm = this.state.currentRealm;
    const char = this.charInput.value;

    if (!region || !realm || !char) {
      alert('Please select a region, realm and player.');
      return null;
    }

    //check if character has an key in localStorage, if so directly redirect to /character otherwise ask bnet-api
    //checking here makes it more userfriendly and saves WCL-requests when char doesn't even exist for the bnet-api
    const image = localStorage.getItem(`${region}/${realm}/${char}`);
    if (image) {
      this.props.history.push(makeUrl(region, realm, char));
      return null;
    }

    this.setState({
      loading: true,
    });
    return fetch(`https://${region}.api.battle.net/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(char)}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
      .then(response => response.json())
      .then((data) => {
        if (data.status === 'nok') {
          alert('Character doesn\'t exist');
          this.setState({ loading: false });
          return;
        }
        const image = data.thumbnail.replace('-avatar.jpg', '');
        localStorage.setItem(`${region}/${realm}/${char}`, image);
        this.props.history.push(makeUrl(region, realm, char));
      }).catch(e => {
        this.setState({ loading: false });
        alert('Something went wrong!');
      });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <div className="character-selector">
          <select
            className="form-control"
            ref={elem => {
              this.regionInput = elem;
            }}
            defaultValue={this.state.currentRegion}
            onChange={e => this.setState({ currentRegion: e.target.value })}
          >
            {Object.keys(REALMS).map(elem =>
              <option key={elem} value={elem}>{elem}</option>
            )}
          </select>
          <SelectSearch
            options={REALMS[this.state.currentRegion].realms.map(elem => ({
              value: elem.name,
              name: elem.name,
            }))}
            className="realm-search"
            onChange={value => {
              this.setState({ currentRealm: value.name });
            }}
            placeholder="Realm"
          />
          <input
            type="text"
            name="code"
            ref={elem => {
              this.charInput = elem;
            }}
            className="form-control"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="Character"
          />
          <button type="submit" className={`btn btn-primary analyze animated-button ${ this.state.loading ? 'fill-button' : ''}`}>
            Search <span className="glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </form>
    );
  }
}

export default withRouter(CharacterSelecter);
