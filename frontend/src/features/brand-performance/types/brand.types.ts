export interface MockBrand {
  id: string;
  name: string;
  retainer: string;
  health: number;
  onTime: string;
  tasksDone: string;
}

export interface TeamPerformanceRow {
  id: string;
  team: string;
  lead: string;
  completion: number;
  delayed: number;
  throughput: string;
}
