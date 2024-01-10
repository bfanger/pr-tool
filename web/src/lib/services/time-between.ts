export const SEC = 1000;
export const MIN = 60 * SEC;
export const HOUR = 60 * MIN;

export default function timeBetween(min: number, max: number, multiplier = 1) {
  return (Math.random() * (max - min) + min) * multiplier;
}
