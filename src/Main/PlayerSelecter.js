import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { getReport } from 'selectors/report';
import { getCombatants } from 'selectors/combatants';

import DiscordButton from './DiscordButton';
import PatreonButton from './PatreonButton';
import GithubButton from './GithubButton';
import PlayerSelectionList from './PlayerSelectionList';

class PlayerSelecter extends Component {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      friendlies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })),
    }).isRequired,
    combatants: PropTypes.array,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report, combatants } = this.props;

    if (!combatants) {
      return (
        <div>
          <h1>Fetching players...</h1>

          <div className="spinner" />
        </div>
      );
    }

    return (
      <div>
        <h1>
          <div className="back-button">
            <Link to={`/report/${report.code}`} data-tip="Back to fight selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          Player selection
        </h1>

        <div className="panel">
          <div className="panel-heading">
            <h2>Select the player you wish to analyze</h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <PlayerSelectionList />
          </div>
        </div>

        <div className="panel">
          <div className="panel-body">
            <div className="flex">
              <div className="flex-main" style={{ paddingRight: 10 }}>
                If you're not in the list your spec may not be supported yet. Specs are added by enthusiastic players of the spec themselves. Adding specs is easy if you're familiar with JavaScript, find out more on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/CONTRIBUTING.md">GitHub</a> or <a href="https://discord.gg/AxphPxU" target="_blank" rel="noopener noreferrer">join the WoW Analyzer Discord</a> for additional help.
              </div>
              <div className="flex-sub hidden-xs">
                <DiscordButton style={{ marginLeft: 20 }} />
                <PatreonButton style={{ marginLeft: 20 }} />
                <GithubButton style={{ marginLeft: 20 }} text="Add your spec" href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/CONTRIBUTING.md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  report: getReport(state),
  combatants: getCombatants(state),
});

export default connect(mapStateToProps)(PlayerSelecter);
