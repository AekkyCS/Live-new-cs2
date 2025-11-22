export enum ColorId {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange'
}

export interface TeamColor {
  id: ColorId;
  name: string;
  hex: string;
  textColor: string;
}

export interface VoteCounts {
  [key: string]: number; // key is ColorId, value is count
}

export interface UserState {
  hasVoted: boolean;
  assignedColorId: ColorId | null;
  timestamp: number | null;
}

export interface DashboardData {
  colorId: string;
  name: string;
  count: number;
  fill: string;
}