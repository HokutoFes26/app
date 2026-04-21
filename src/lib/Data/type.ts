export type State<T> = React.Dispatch<React.SetStateAction<T>>;
export type jsonType = Record<string, Record<string, string>>;
export type ScheduleJSON = Record<string, { schedule: string[]; irregular: number }>;
export type jsonTimeScheduleType = Record<string, Record<string, number | string>>;
export type GASArraySubMapType = [string, [number, number, string | null][]];
export type GASArrayHWMapType = [string, [string, number][]];
export type GASArraySubType = GASArraySubMapType[];
export type GASArrayHWType = GASArrayHWMapType[];
export type GASArrayType = [GASArraySubType, GASArrayHWType];
export type DayStatusType = "holiday" | "event" | "exam" | "substitution" | "special" | "other";

export interface ScheduleEvent {
   name: string;
   type: DayStatusType;
   description?: string;
}

export interface SchedulePeriod {
   start: string;
   end: string;
   name: string;
   type: "holiday" | "exam" | "other";
}

export interface ScheduleOverride {
   label: string;
   asDay: number;
   type: "substitution" | "special";
}

export interface NewScheduleData {
   events: Record<string, ScheduleEvent[]>;
   periods: SchedulePeriod[];
   overrides: Record<string, ScheduleOverride>;
}

export interface DayStatus {
   date: string;
   appliedDay: number;
   label?: string;
   isHoliday: boolean;
   events: ScheduleEvent[];
   periodName?: string;
}
