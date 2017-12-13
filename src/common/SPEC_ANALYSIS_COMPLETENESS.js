const SPEC_ANALYSIS_COMPLETENESS = {
  GREAT: 'GREAT',
  GOOD: 'GOOD',
  NEEDS_MORE_WORK: 'NEEDS_MORE_WORK',
  NOT_ACTIVELY_MAINTAINED: 'NOT_ACTIVELY_MAINTAINED',
};
export default SPEC_ANALYSIS_COMPLETENESS;

export function getCompletenessLabel(completeness) {
  switch (completeness) {
    case SPEC_ANALYSIS_COMPLETENESS.GREAT:
      return 'Great!';
    case SPEC_ANALYSIS_COMPLETENESS.GOOD:
      return 'Good';
    case SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK:
      return 'Needs more work';
    case SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED:
      return 'Not actively maintained';
    default:
      return null;
  }
}
export function getCompletenessColor(completeness) {
  switch (completeness) {
    case SPEC_ANALYSIS_COMPLETENESS.GREAT:
      return '#ff8000';
    case SPEC_ANALYSIS_COMPLETENESS.GOOD:
      return '#a335ee';
    case SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK:
      return '#fff';
    case SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED:
      return '#9d9d9d';
    default:
      return null;
  }
}
export function getCompletenessExplanation(completeness) {
  switch (completeness) {
    case SPEC_ANALYSIS_COMPLETENESS.GREAT:
      return 'This spec\'s analysis is mostly complete and actively being maintained.';
    case SPEC_ANALYSIS_COMPLETENESS.GOOD:
      return 'This spec\'s analysis is ready for usage, but some work is still left to be done.';
    case SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK:
      return 'This spec\'s analysis needs some more work to be optimally usable.';
    case SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED:
      return 'This spec\'s analysis does not have an active maintainer and may be outdated.';
    default:
      return null;
  }
}
