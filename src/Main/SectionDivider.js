import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getUser } from 'selectors/user';

import './SectionDivider.css';

const SectionDivider = ({ premium }) => (
  premium ? (
    <div className="section-divider" />
  ) : (
    <div className="text-center" style={{ margin: '40px 0' }}>
      <a href="https://www.patreon.com/wowanalyzer">
        <img src={`/img/patreon${Math.floor(Math.random() * 6 + 1)}.jpg`} alt="Patreon" style={{ width: 728, height: 90 }} />
      </a>
    </div>
  )
);
SectionDivider.propTypes = {
  premium: PropTypes.bool,
};
SectionDivider.defaultProps = {
  premium: false,
};

const mapStateToProps = state => {
  const user = getUser(state);
  return {
    premium: user ? user.premium : false,
  };
};

export default connect(
  mapStateToProps
)(SectionDivider);
