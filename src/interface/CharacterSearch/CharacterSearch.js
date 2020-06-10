import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import SelectSearch from 'react-select-search';
import { Trans, t } from '@lingui/macro';

import REALMS from 'common/REALMS';
import { makeCharacterApiUrl } from 'common/makeApiUrl';
import { i18n } from 'interface/RootLocalizationProvider';
import makeCharacterPageUrl from 'common/makeCharacterPageUrl';

class CharacterSearch extends React.PureComponent {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
  };
  state = {
    currentRegion: 'EU',
    currentRealm: '',
  };

  regionInput = null;
  charInput = null;
  constructor() {
    super();
    this.regionInput = React.createRef();
    this.charInput = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.changeRegion = this.changeRegion.bind(this);
  }

  componentDidMount() {
    if (this.regionInput.current) {
      this.regionInput.current.focus();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const region = this.regionInput.current.value;
    const realm = this.state.currentRealm;
    const char = this.charInput.current.value;

    if (!region || !realm || !char) {
      alert(i18n._(t`Please select a region, realm and player.`));
      return;
    }
    if (this.state.loading) {
      alert(i18n._(t`Still working...`));
      return;
    }

    // Checking here makes it more userfriendly and saves WCL-requests when char doesn't even exist for the bnet-api
    this.setState({
      loading: true,
    });

    // Skip CN-API due to blizzard restrictions (aka there is no API for CN)
    if (region !== 'CN') {
      const response = await fetch(makeCharacterApiUrl(null, region, realm, char));
      if (response.status === 500) {
        alert(i18n._(t`It looks like we couldn't get a response in time from the API. Try and paste your report-code manually.`));
        this.setState({
          loading: false,
        });
        return;
      } else if (response.status === 404) {
        alert(i18n._(t`${char} could not be found within the ${realm} realm. They're probably located elsewhere.`));
        this.setState({
          loading: false,
        });
        return;
      } else if (!response.ok) {
        alert(i18n._(t`It looks like we couldn't get a response in time from the API, this usually happens when the servers are under heavy load. Please try and use your report-code or try it again later.`));
        this.setState({
          loading: false,
        });
        return;
      }
    }
    this.props.history.push(makeCharacterPageUrl(region, realm, char));
  }

  changeRegion(targetRegion) {
    let newRealm = this.state.currentRealm;
    // If the new region doesn't have a realm by the same name, clear the input
    if (!REALMS[targetRegion].some(realm => realm.name === newRealm)) {
      newRealm = '';
    }
    this.setState({
      currentRegion: targetRegion,
      currentRealm: newRealm,
    });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="character-selector">
        <select
          className="form-control region"
          ref={this.regionInput}
          defaultValue={this.state.currentRegion}
          onChange={e => this.changeRegion(e.target.value)}
        >
          {Object.keys(REALMS).map(elem =>
            <option key={elem} value={elem}>{elem}</option>,
          )}
        </select>
        <SelectSearch
          options={REALMS[this.state.currentRegion].map(elem => ({
            value: elem.name,
            name: elem.name,
          }))}
          className="realm"
          value={this.state.currentRealm}
          onChange={value => {
            this.setState({ currentRealm: value.name });
          }}
          placeholder={i18n._(t`Realm`)}
          key={this.state.currentRegion}
        />
        <input
          type="text"
          name="code"
          ref={this.charInput}
          className="character form-control"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={i18n._(t`Character`)}
        />
        <button type="submit" className={`btn btn-primary analyze animated-button ${this.state.loading ? 'fill-button' : ''}`}>
          <Trans>Search</Trans> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </form>
    );
  }
}

export default withRouter(CharacterSearch);
