import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { hasPremium } from 'selectors/user';
import Ad from 'Main/Ad';

import './SectionDivider.css';

const SectionDivider = ({ premium }) => (
  premium ? (
    <div className="section-divider" />
  ) : (
    <div className="text-center" style={{ margin: '40px 0' }}>
      <Ad format="leaderboard" />
    </div>
  )
);
SectionDivider.propTypes = {
  premium: PropTypes.bool,
};
SectionDivider.defaultProps = {
  premium: false,
};

const mapStateToProps = state => ({
  premium: hasPremium(state),
});
export default connect(
  mapStateToProps
)(SectionDivider);
