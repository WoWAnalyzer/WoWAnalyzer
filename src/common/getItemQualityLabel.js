import ITEM_QUALITIES from './ITEM_QUALITIES';

export default function getItemQualityLabel(quality) {
  switch (quality) {
    case ITEM_QUALITIES.LEGENDARY:
      return 'legendary';
    case ITEM_QUALITIES.EPIC:
      return 'epic';
    case ITEM_QUALITIES.ARTIFACT:
      return 'artifact';
    default:
      return 'unknown';
  }
}
