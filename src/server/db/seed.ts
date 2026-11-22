import type { GroupClass } from "@entities/group-class";
import type { Hall } from "@entities/hall";
import type { HallBooking } from "@entities/hall-booking";

export type SeedData = {
  halls: Hall[];
  classes: GroupClass[];
  hallBookings: HallBooking[];
};

export const HALL_BIG_ID = "big";
export const HALL_SMALL_ID = "small";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const getIsoTimestampFromWeekStart = (
  monday: Date,
  day: number,
  hour: number,
): string => new Date(monday.getTime() + day * DAY + hour * HOUR).toISOString();

const addMinutesToIso = (iso: string, minutes: number): string =>
  new Date(Date.parse(iso) + minutes * MINUTE).toISOString();

export const mondayOfWeekUtc = (date: Date): Date => {
  const day = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const shift = (day.getUTCDay() + 6) % 7; // понедельник = 0
  return new Date(day.getTime() - shift * DAY);
};

const halls: Hall[] = [
  { id: HALL_BIG_ID, name: "Большой зал", capacity: 30 },
  { id: HALL_SMALL_ID, name: "Малый зал", capacity: 15 },
];

const classTemplates = [
  {
    day: 0,
    hour: 20,
    minutes: 60,
    direction: "Contemporary",
    teacher: "Анна",
    hallId: HALL_BIG_ID,
    maxStudents: 25,
  },
  {
    day: 1,
    hour: 20,
    minutes: 90,
    direction: "Hip-hop",
    teacher: "Игорь",
    hallId: HALL_BIG_ID,
    maxStudents: 28,
  },
  {
    day: 2,
    hour: 20,
    minutes: 60,
    direction: "Contemporary",
    teacher: "Анна",
    hallId: HALL_BIG_ID,
    maxStudents: 25,
  },
  {
    day: 3,
    hour: 20,
    minutes: 90,
    direction: "Hip-hop",
    teacher: "Игорь",
    hallId: HALL_BIG_ID,
    maxStudents: 28,
  },
  {
    day: 1,
    hour: 18,
    minutes: 60,
    direction: "Растяжка",
    teacher: "Мария",
    hallId: HALL_SMALL_ID,
    maxStudents: 12,
  },
  {
    day: 3,
    hour: 18,
    minutes: 60,
    direction: "Растяжка",
    teacher: "Мария",
    hallId: HALL_SMALL_ID,
    maxStudents: 12,
  },
];

export const createSeed = (anchorMonday: Date, weeks = 4): SeedData => {
  const classes: GroupClass[] = [];

  for (let week = 0; week < weeks; week++) {
    const monday = new Date(anchorMonday.getTime() + week * 7 * DAY);
    for (const [index, template] of classTemplates.entries()) {
      const start = getIsoTimestampFromWeekStart(
        monday,
        template.day,
        template.hour,
      );
      classes.push({
        id: `class-w${week}-${index}`,
        direction: template.direction,
        teacher: template.teacher,
        hallId: template.hallId,
        start,
        end: addMinutesToIso(start, template.minutes),
        maxStudents: template.maxStudents,
      });
    }
  }

  const hallBookings: HallBooking[] = [
    {
      id: "booking-1",
      hallId: HALL_BIG_ID,
      type: "self-practice",
      ownerId: "user-student",
      participants: 3,
      start: getIsoTimestampFromWeekStart(anchorMonday, 4, 23),
      end: getIsoTimestampFromWeekStart(anchorMonday, 5, 1),
      status: "confirmed",
    },
    {
      id: "booking-2",
      hallId: HALL_SMALL_ID,
      type: "masterclass",
      ownerId: "user-admin",
      participants: 14,
      start: getIsoTimestampFromWeekStart(anchorMonday, 5, 12),
      end: getIsoTimestampFromWeekStart(anchorMonday, 5, 15),
      status: "confirmed",
    },
    {
      id: "booking-3",
      hallId: HALL_SMALL_ID,
      type: "individual",
      ownerId: "user-student",
      participants: 1,
      start: getIsoTimestampFromWeekStart(anchorMonday, 2, 12),
      end: getIsoTimestampFromWeekStart(anchorMonday, 2, 13),
      status: "confirmed",
    },
  ];

  return { halls, classes, hallBookings };
};
