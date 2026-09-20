const CAMPUS_TIMEZONE = process.env.CAMPUS_TIMEZONE || 'Africa/Nairobi';

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CAMPUS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getCampusDateTimeParts(date = new Date()) {
  return dateTimeFormatter.formatToParts(date).reduce((parts, part) => {
    if (part.type !== 'literal') parts[part.type] = part.value;
    return parts;
  }, {});
}

function toDateTimeString(parts) {
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function toDateString(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addOneDay(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  return nextDay.toISOString().slice(0, 10);
}

function getCampusNow(date = new Date()) {
  return toDateTimeString(getCampusDateTimeParts(date));
}

function getCampusDayBounds(date = new Date()) {
  const currentParts = getCampusDateTimeParts(date);
  const currentDate = toDateString(currentParts);
  const nextDate = addOneDay(currentDate);
  return {
    start: `${currentDate} 00:00:00`,
    end: `${nextDate} 00:00:00`,
  };
}

module.exports = {
  CAMPUS_TIMEZONE,
  getCampusNow,
  getCampusDayBounds,
};