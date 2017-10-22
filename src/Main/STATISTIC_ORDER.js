export default {
  CORE(offset = 0) {
    return offset;
  },
  DEFAULT: 100,
  OPTIONAL(offset = 0) {
    return 1000 + offset;
  },
  UNIMPORTANT(offset = 0) {
    return 10000 + offset;
  },
};
