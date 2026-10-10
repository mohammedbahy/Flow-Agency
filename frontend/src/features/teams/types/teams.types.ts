export interface MockTeam {
  id: string;
  name: string;
  focus: string;
  members: number;
  activeProjects: number;
  lead: string;
  initials: string[];
}

export interface Assignment {
  id: string;
  project: string;
  client: string;
  memberName: string;
  role: string;
  allocation: number;
}
