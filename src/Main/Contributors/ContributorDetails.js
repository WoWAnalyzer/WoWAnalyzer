import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import * as contributors from 'CONTRIBUTORS';

import CoreChangelog from 'CHANGELOG';
import BloodChangelog from 'Parser/DeathKnight/Blood/CHANGELOG';

class ContributorDetails extends React.PureComponent {

  static propTypes = {
    contributorId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.filterChangelog = this.filterChangelog.bind(this);
  }

  removeWhiteSpaces(string) {
    return string.replace(" ", "");
  }

  iconPath(spec) {
    return `/specs/${this.removeWhiteSpaces(spec.className)}-${this.removeWhiteSpaces(spec.specName)}.jpg`;
  }

  char(char) {
    return (
      <div>
        <a href={char.link} target="_blank" className={this.removeWhiteSpaces(char.spec.className)}>
          <img style={{ height: '1.5em', width: '1.5em', marginRight: 10 }} src={this.iconPath(char.spec)} alt="spec icon" />
          {char.name}
        </a><br/>
      </div>
    );
  }

  filterChangelog(contribution) {
    return contribution.contributors.includes(contributors[this.props.contributorId]);
  }

  render() {
    const { contributorId } = this.props;
    const contributor = contributors[contributorId];
    const contributions = {
      'Core': CoreChangelog.filter(this.filterChangelog),
      'Blood Death Knight': BloodChangelog.filter(this.filterChangelog),
    };

    const rowStyle = {
      margin: '10px 0px',
    };

    return(
      <div className="container">
        <Link to="/">
          Home
        </Link> &gt;{' '}
        <Link to="/">
          Contributors
        </Link> &gt;{' '}
        {contributor.nickname} <br/><br/>

        <div className="panel">
          <div className="panel-body">
            <div className="flex-main">
              <div className="row">

                <div className="col-md-6">
                  <div style={{ textAlign: 'center' }}>
                    <h2>{contributor.nickname}</h2>
                    <img src={contributor.avatar} alt={'Avatar'} style={{ marginTop: 20 }}/>
                  </div>
                  <div class="flex-main" style={{ padding: 30 }}>
                  <div class="row" style={ rowStyle }>
                      <div class="col-md-3"><b>Maintainer</b></div>
                      <div class="col-md-9">
                        {contributor.maintainer.map((spec) => 
                          <div className={this.removeWhiteSpaces(spec.className)}>
                            <img style={{ height: '1.5em', width: '1.5em', marginRight: 10 }} src={this.iconPath(spec)} alt="spec icon" />
                            {spec.className} - {spec.specName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div class="row" style={ rowStyle }>
                      <div class="col-md-3"><b>GitHub</b></div>
                      <div class="col-md-9">
                        <a href={"https://github.com/" + contributor.github} target="_blank">{contributor.github}</a>
                      </div>
                    </div>
                    <div class="row" style={ rowStyle }>
                      <div class="col-md-3"><b>Mains</b></div>
                      <div class="col-md-9">
                        {contributor.mains.map((char, index) => this.char(char) )}
                      </div>
                    </div>
                    <div class="row" style={ rowStyle }>
                      <div class="col-md-3"><b>Alts</b></div>
                      <div class="col-md-9">
                        {contributor.alts.map((char, index) => this.char(char) )}
                      </div>
                    </div>
                  </div>
                </div>


                <div className="col-md-6">
                  {Object.keys(contributions).map((type) => {
                    <div>
                      <div className="panel-heading">
                        <h2>{type}</h2>
                      </div>
                      <ul className="list text">
                        {contributions[type].map((contribution) => 
                          <li className="row">
                            <div className="col-md-2">
                              {contribution.date.toLocaleDateString()}
                            </div>
                            <div className="col-md-10">
                              {contribution.changes}
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContributorDetails;