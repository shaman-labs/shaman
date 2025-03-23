export type ChartDataPoint = {
  day: string;
  executions: number;
};

export type DayExecutions = {
  [key: string]: number;
};
