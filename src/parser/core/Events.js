import EventFilter from './EventFilter';

const Events = {
  get cast() {
    return new EventFilter('cast');
  },
  get heal() {
    return new EventFilter('heal');
  },
};

export default Events;
