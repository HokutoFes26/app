export type StatusLevel = 0 | 1 | 2; // 0:green, 1:yellow, 2:red

export interface StallStatus {
  id: number | string;
  stallName: string;
  crowdLevel: StatusLevel;
  stockLevel: StatusLevel;
}
