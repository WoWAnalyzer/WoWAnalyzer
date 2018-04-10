import React  from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import SelectSearch from 'react-select-search';

import makeUrl from './makeUrl';

import REALMS from './REALMS';

class CharacterSelecter extends React.PureComponent {

  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
  };

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      currentRegion: 'EU',
      currentRealm: '',
    };
  }

  handleSubmit(e) {
    e.preventDefault();

    const region = this.regionInput.value;
    const realm = this.state.currentRealm;
    const char = this.charInput.value;

    if (!realm) {  //allows enter-key on realm-input
      return;
    }

    if (!region || !realm || !char) {
      // eslint-disable-next-line no-alert
      alert('Please enter stuff.');
      return;
    }

    this.props.history.push(makeUrl(region, realm, char));
  }

  render() {
    const options = REALMS[this.state.currentRegion].realms.map(elem => {
      return {
        value: elem.name,
        name: elem.name,
      };
    });

    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <div className="character-selector">
          <select
            className="form-control"
            style={{ left: 0, width: 100 }}
            ref={elem => this.regionInput = elem}
            value={this.state.currentRegion}
            onChange={e => this.setState({ currentRegion: e.target.value })}
          >
            {Object.keys(REALMS).map(elem => 
              <option value={elem}>{elem}</option>
            )}
          </select>
          <SelectSearch 
            options={options}
            className="realm-search"
            onChange={(value, state, props) => { this.setState({ currentRealm: value.name });}}
            placeholder='Realm'
          />
          <input
            type="text"
            name="code"
            style={{ left: 300, width: 180 }}
            ref={elem => this.charInput = elem}
            className="form-control"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="Character"
          />
          <button type="submit" style={{ left: 490 }} className="btn btn-primary analyze">
            Search <span className="glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </form>
    );
  }
}

export default withRouter(CharacterSelecter);