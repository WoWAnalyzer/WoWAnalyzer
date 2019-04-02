const aprilFools = {
  month: 3,
  date: 1,
};

export function isItAprilFoolDay() {
  const now = new Date();
  return (now.getMonth() === aprilFools.month && now.getDate() === aprilFools.date);
}
