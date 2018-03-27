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
    this.state = {
      list: [true, true],
    };
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

  toggleClass(index) {
    const stateList = this.state.list;
    stateList[index] = !stateList[index];
    this.setState({ list: stateList });
    this.forceUpdate();
  }

  additionalInfo(object) {
    if (object === undefined) {
      return;
    }

    const value = [];
    Object.keys(object).forEach((key) => {
      console.info(object[key], key);
      if (Array.isArray(object[key]) === true) {
        const subvalue = [];
        object[key].forEach((elem) => {
          subvalue.push(<div>{elem}</div>);
        });

        value.push(<div className="row">
          <div class="col-md-3"><b>{key}:</b></div>
            <div class="col-md-9">
              {subvalue}
            </div>
        </div>);

      } else if (typeof object[key] === "string") {
        value.push(<div className="row">
          <div class="col-md-3"><b>{key}:</b></div>
            <div class="col-md-9">
              {object[key]}
            </div>
        </div>);
      }
    });
    return value;
  }

  render() {
    const { contributorId } = this.props;
    const contributor = contributors[contributorId];
    let contributions = {
      'Core': CoreChangelog.filter(this.filterChangelog),
      'Blood Death Knight': BloodChangelog.filter(this.filterChangelog),
    };

    if (contributor.maintainer === undefined) {
      contributor.maintainer = [];
    }

    if (contributor.mains === undefined) {
      contributor.mains = [];
    }

    if (contributor.alts === undefined) {
      contributor.alts = [];
    }

    if (contributor.avatar === undefined) {
      contributor.avatar = "/favicon.png";
    }

    Object.keys(contributions).forEach((key) => (contributions[key].length === 0) && delete contributions[key]);

    return(
      <div className="container">
        <Link to="/">
          Home
        </Link> &gt;{' '}
        <Link to="/">
          Contributors
        </Link> &gt;{' '}
        {contributor.nickname} <br/><br/>

        <div className="flex-main">
          <div className="row">
            <div className="col-md-5">
              <div className="panel">
                <div style={{ textAlign: 'center' }}>
                  <h2>{contributor.nickname}</h2>
                  <img src={contributor.avatar} alt={'Avatar'} style={{ marginTop: 20, maxHeight: 200, borderRadius: '50%' }}/>
                </div>
                <div class="flex-main contributorlist" style={{ padding: 30 }}>
                  <div class="row">
                    <div class="col-md-3"><b>About me:</b></div>
                    <div class="col-md-9">
                      {contributor.desc}
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-3"><b>GitHub:</b></div>
                    <div class="col-md-9">
                      <a href={"https://github.com/" + contributor.github} target="_blank">{contributor.github}</a>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-3"><b>Maintainer:</b></div>
                    <div class="col-md-9">
                      {contributor.maintainer.map((char, index) =>
                        <div className={this.removeWhiteSpaces(char.className)}>
                          <img style={{ height: '1.5em', width: '1.5em', marginRight: 10 }} src={this.iconPath(char)} alt={"Spec Icon"} />
                          {char.specName} {char.className}
                        </div>
                      )}
                    </div>
                  </div>
                  <div class="row" style={{ marginTop: 30 }}>
                    <div class="col-md-3"><b>Mains:</b></div>
                    <div class="col-md-9">
                      {contributor.mains.map((char, index) => this.char(char) )}
                    </div>
                  </div>
                  <div class="row" style={{ marginBottom: 30 }}>
                    <div class="col-md-3"><b>Alts:</b></div>
                    <div class="col-md-9">
                      {contributor.alts.map((char, index) => this.char(char) )}
                    </div>
                  </div>
                  {this.additionalInfo(contributor.others)}
                </div>
              </div>
            </div>


            <div className="col-md-7">
              <div class="panel">
                {Object.keys(contributions).map((type, index) => 
                  <div key={index}>
                    <div className="panel-heading" style={{ cursor: 'pointer' }} onClick={() => this.toggleClass(index)}>
                      <h2>{type} ({contributions[type].length} commits)</h2>
                    </div>
                    <ul className="list text" style={{ marginBottom: 30, display: this.state.list[index] === true ? 'block' : 'none' }}>
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
    );
  }
}

export default ContributorDetails;