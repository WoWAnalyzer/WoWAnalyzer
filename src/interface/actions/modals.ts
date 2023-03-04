export const OPEN_MODAL = 'OPEN_MODAL';
export function openModal(key: string) {
  return {
    type: OPEN_MODAL,
    key,
  };
}
export const CLOSE_MODAL = 'CLOSE_MODAL';
export function closeModal(key: string) {
  return {
    type: CLOSE_MODAL,
    key,
  };
}
