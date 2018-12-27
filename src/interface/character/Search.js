import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import SelectSearch from 'react-select-search';
import { Trans, t } from '@lingui/macro';

import REALMS from 'common/REALMS';
import { makeCharacterApiUrl } from 'common/makeApiUrl';
import { i18n } from 'interface/RootLocalizationProvider';

import makeUrl from './makeUrl';

class Search extends React.PureComponent {
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

  async handleSubmit(e) {
    e.preventDefault();

    const region = this.regionInput.value;
    const realm = this.state.currentRealm;
    const char = this.charInput.value;

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
    this.props.history.push(makeUrl(region, realm, char));
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
            options={REALMS[this.state.currentRegion].map(elem => ({
              value: elem.name,
              name: elem.name,
            }))}
            className="realm-search"
            onChange={value => {
              this.setState({ currentRealm: value.name });
            }}
            placeholder={i18n._(t`Realm`)}
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
            placeholder={i18n._(t`Character`)}
          />
          <button type="submit" className={`btn btn-primary analyze animated-button ${this.state.loading ? 'fill-button' : ''}`}>
            <Trans>Search</Trans> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </form>
    );
  }
}

export default withRouter(Search);
