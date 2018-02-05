class MarkoftheCraneTarget {
  get motcTimestamp() {
    return this.motcTimestamp;
  }

  get id() {
    return this.motcTimestamp;
  }

  get instance() {
    return this.instance;
  }

  get timestamp() {
    return this.timestamp;
  }

  refreshMark(timestamp) {
    this.motcTimestamp = timestamp;
  }

  motcTimestamp = 0;
  constructor(id, instance, timestamp) {

    this.motcTimestamp = timestamp;
    this.motcTimestamp = Id;
    this.instance = instance;
  }

}
