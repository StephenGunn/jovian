import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import isBetween from "dayjs/plugin/isBetween.js";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";

// plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(isToday);

// set default timezone used like .tz()
dayjs.tz.setDefault("America/Chicago");
// take a stab the user's timezone
const guess = dayjs.tz.guess();

export const blog_update_no_time = (date: string) => dayjs.utc(date).local().format("MMMM DD, YYYY");

export const blog_update_time_since = (date: string) => {
  if (dayjs(date).isToday()) {
    return "Shit hot";
  }
  return dayjs.tz(date).tz(guess).fromNow();
};
