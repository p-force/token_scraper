const PRIORITY_TIME_TAGS = {
  s: 1000,
  m: 60000,
  h: 3.6e6,
  d: 8.64e7,
  ms: 1,
};

const TIME_TAGS_HUMAN = {
  s: "Seconds",
  m: "Minutes",
  h: "Hours",
  d: "Days",
  ms: "Milliseconds",
};

export default function calculateMilliseconds(value) {
  // Get the target
  const target = Object.keys(PRIORITY_TIME_TAGS).find(
    (name) => value?.replace(/[0-9.\s]/g, "")?.toLowerCase() === name
  );

  if (!target) {
    throw new Error(`Your date "${value}" is not valid for conversion`);
  }

  // Get the base value
  const baseValue = PRIORITY_TIME_TAGS[target];

  // Clear the value
  const clearedValue = Number(value.replace(/[^\d.-]/g, ""));

  // Calculate the timestamp
  const timestamp = baseValue * clearedValue;

  return {
    timestamp,
    human: `${clearedValue} ${TIME_TAGS_HUMAN[target]} / ${timestamp} ms`,
  };
}
