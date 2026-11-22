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

const MON = 0;
const TUE = 1;
const WED = 2;
const THU = 3;

const MON_WED = [MON, WED];
const TUE_THU = [TUE, THU];

type ClassTemplate = {
  days: number[];
  hour: number;
  minutes: number;
  direction: string;
  teacher: string;
  hallId: string;
  maxStudents: number;
};

const classTemplates: ClassTemplate[] = [
  // Большой зал
  {
    days: MON_WED,
    hour: 18,
    minutes: 60,
    direction: "Choreo (beginners)",
    teacher: "Маша",
    hallId: HALL_BIG_ID,
    maxStudents: 30,
  },
  {
    days: MON_WED,
    hour: 19,
    minutes: 60,
    direction: "Choreo (pro)",
    teacher: "Маша",
    hallId: HALL_BIG_ID,
    maxStudents: 30,
  },
  {
    days: MON_WED,
    hour: 20,
    minutes: 60,
    direction: "High heels / Choreo",
    teacher: "Катя",
    hallId: HALL_BIG_ID,
    maxStudents: 30,
  },
  {
    days: [THU],
    hour: 12,
    minutes: 120,
    direction: "High heels (beginners)",
    teacher: "Катя",
    hallId: HALL_BIG_ID,
    maxStudents: 30,
  },
  {
    days: TUE_THU,
    hour: 19,
    minutes: 60,
    direction: "High heels",
    teacher: "Настя",
    hallId: HALL_BIG_ID,
    maxStudents: 30,
  },
  {
    days: TUE_THU,
    hour: 20,
    minutes: 90,
    direction: "High heels / Choreo",
    teacher: "Саша",
    hallId: HALL_BIG_ID,
    maxStudents: 30,
  },

  // Малый зал
  {
    days: MON_WED,
    hour: 18,
    minutes: 60,
    direction: "Twerk",
    teacher: "Ксюша",
    hallId: HALL_SMALL_ID,
    maxStudents: 15,
  },
  {
    days: MON_WED,
    hour: 21,
    minutes: 60,
    direction: "Dancehall female",
    teacher: "Настя",
    hallId: HALL_SMALL_ID,
    maxStudents: 15,
  },
  {
    days: TUE_THU,
    hour: 18,
    minutes: 60,
    direction: "High heels / Choreo",
    teacher: "Света",
    hallId: HALL_SMALL_ID,
    maxStudents: 15,
  },
  {
    days: TUE_THU,
    hour: 19,
    minutes: 60,
    direction: "Heels choreo",
    teacher: "Вика",
    hallId: HALL_SMALL_ID,
    maxStudents: 15,
  },
  {
    days: TUE_THU,
    hour: 20,
    minutes: 60,
    direction: "Freestyle",
    teacher: "Вика",
    hallId: HALL_SMALL_ID,
    maxStudents: 15,
  },
];

export const createSeed = (anchorMonday: Date, weeks = 4): SeedData => {
  const classes: GroupClass[] = [];

  for (let week = 0; week < weeks; week++) {
    for (const [index, template] of classTemplates.entries()) {
      for (const day of template.days) {
        const start = getIsoTimestampFromWeekStart(
          anchorMonday,
          week * 7 + day,
          template.hour,
        );
        classes.push({
          id: `class-w${week}-t${index}-d${day}`,
          direction: template.direction,
          teacher: template.teacher,
          hallId: template.hallId,
          start,
          end: addMinutesToIso(start, template.minutes),
          maxStudents: template.maxStudents,
        });
      }
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
