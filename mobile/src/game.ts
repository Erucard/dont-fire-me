import type { Prompt } from './prompts';

export type Phase = 'lobby' | 'writing' | 'rating' | 'results' | 'final';

export type Room = {
  code: string;
  phase: Phase;
  round: number;
  total_rounds: number;
  prompt: Prompt | null;
  used_prompts: string[];
  deadline: string | null;
};

export type Player = {
  id: string;
  room_code: string;
  name: string;
  title: string;
  is_host: boolean;
  joined_at: string;
};

export type Submission = {
  id: string;
  room_code: string;
  round: number;
  player_id: string;
  subject: string;
  body: string;
};

export type Rating = {
  id: string;
  room_code: string;
  round: number;
  submission_id: string;
  rater_id: string;
  stars: number;
};

export type RoundScore = { sub: Submission; avg: number; n: number; pts: number };

export function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

export function genCode(): string {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

export function scoresForRound(subs: Submission[], ratings: Rating[], round: number): RoundScore[] {
  return subs
    .filter((x) => x.round === round)
    .map((sub) => {
      const rs = ratings.filter((x) => x.submission_id === sub.id);
      const avg = rs.length ? rs.reduce((a, x) => a + x.stars, 0) / rs.length : 0;
      return { sub, avg, n: rs.length, pts: Math.round(avg * 20) };
    })
    .sort((a, b) => b.avg - a.avg || (a.sub.id < b.sub.id ? -1 : 1));
}

export function totals(players: Player[], subs: Submission[], ratings: Rating[], upToRound: number) {
  const t: Record<string, { player: Player; pts: number }> = {};
  players.forEach((p) => (t[p.id] = { player: p, pts: 0 }));
  for (let r = 1; r <= upToRound; r++) {
    scoresForRound(subs, ratings, r).forEach((row) => {
      if (t[row.sub.player_id]) t[row.sub.player_id].pts += row.pts;
    });
  }
  return Object.values(t).sort((a, b) => b.pts - a.pts);
}
