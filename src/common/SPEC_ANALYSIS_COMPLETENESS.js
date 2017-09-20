const SPEC_ANALYSIS_COMPLETENESS = {
  GREAT: 'GREAT',
  GOOD: 'GOOD',
  NEEDS_MORE_WORK: 'NEEDS_MORE_WORK',
  NOT_YET_SUPPORTED: 'NOT_YET_SUPPORTED',
};
export default SPEC_ANALYSIS_COMPLETENESS;

export function getCompletenessLabel(completeness) {
  switch (completeness) {
    case SPEC_ANALYSIS_COMPLETENESS.GREAT: return 'Great!';
    case SPEC_ANALYSIS_COMPLETENESS.GOOD: return 'Good';
    case SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK: return 'Needs more work';
    case SPEC_ANALYSIS_COMPLETENESS.NOT_YET_SUPPORTED: return 'Not yet supported';
    default: return null;
  }
}
export function getCompletenessColor(completeness) {
  switch (completeness) {
    case SPEC_ANALYSIS_COMPLETENESS.GREAT: return 'gold';
    case SPEC_ANALYSIS_COMPLETENESS.GOOD: return 'green';
    case SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK: return 'orange';
    case SPEC_ANALYSIS_COMPLETENESS.NOT_YET_SUPPORTED: return 'red';
    default: return null;
  }
}
export function getCompletenessExplanation(completeness) {
  switch (completeness) {
    case SPEC_ANALYSIS_COMPLETENESS.GREAT: return 'This spec\'s analysis is (almost) complete and actively being maintained.';
    case SPEC_ANALYSIS_COMPLETENESS.GOOD: return 'This spec\'s analysis is ready for public usage, but some work is still left to be done.';
    case SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK: return 'This spec\'s analysis needs some more work; it doesn\'t have a USP complete yet.';
    case SPEC_ANALYSIS_COMPLETENESS.NOT_YET_SUPPORTED: return 'This spec\'s analysis is not yet supported and does not have an active maintainer.';
    default: return null;
  }
}
