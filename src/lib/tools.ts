export function truncateStr(str: string, goal: number) {
  if (str.length <= goal) return str;
  const halfGoal = Math.floor(goal / 2);
  return str.slice(0, halfGoal) + (str.length >= goal ? '...' : '') + str.slice(-halfGoal);
}