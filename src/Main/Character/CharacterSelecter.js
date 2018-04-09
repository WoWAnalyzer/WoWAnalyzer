import React  from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
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
    };
  }

  handleSubmit(e) {
    e.preventDefault();

    const region = this.regionInput.value;
    const realm = this.realmInput.value;
    const char = this.charInput.value;

    if (!region || !realm || !char) {
      // eslint-disable-next-line no-alert
      alert('Please enter stuff.');
      return;
    }

    this.props.history.push(makeUrl(region, realm, char));
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <div className="report-selector">
          <select 
            style={{ width: 113 }}
            className="form-control"
            ref={elem => this.regionInput = elem}
            value={this.state.currentRegion}
            onChange={e => this.setState({ currentRegion: e.target.value })}
          >
            <option value="EU">EU</option>
            <option value="US">US</option>
          </select>
          <select 
            style={{ width: 113, margin: '0 10px' }}
            className="form-control"
            ref={elem => this.realmInput = elem}  
          >
            {REALMS[this.state.currentRegion].realms.map(elem => 
              <option>{elem.name}</option>
            )}
          </select>
          <input
            type="text"
            name="code"
            style={{ width: 113 }}
            ref={elem => this.charInput = elem}
            className="form-control"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button type="submit" className="btn btn-primary analyze">
            Analyze <span className="glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </form>
    );
  }
}

export default withRouter(CharacterSelecter);