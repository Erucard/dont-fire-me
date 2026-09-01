import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sb } from './supabase';
import { PROMPTS, TITLES } from './prompts';
import { genCode, pick, Phase, Player, Rating, Room, Submission } from './game';

const SESSION_KEY = 'dfm-session';
const WRITE_SECONDS = 300;

type Session = { code: string; playerId: string; name: string };

export type GameState = {
  booted: boolean;
  code: string | null;
  playerId: string | null;
  name: string;
  room: Room | null;
  players: Player[];
  subs: Submission[];
  ratings: Rating[];
  submittedRound: number;
  error: string | null;
};

export function useGame() {
  const [st, setSt] = useState<GameState>({
    booted: false, code: null, playerId: null, name: '',
    room: null, players: [], subs: [], ratings: [], submittedRound: 0, error: null,
  });
  const stRef = useRef(st);
  stRef.current = st;
  const channelRef = useRef<ReturnType<typeof sb.channel> | null>(null);
  const advancingRef = useRef(false);

  const setError = (msg: string | null) => setSt((s) => ({ ...s, error: msg }));

  const refresh = useCallback(async () => {
    const code = stRef.current.code;
    if (!code) return;
    try {
      const [room, players, subs, ratings] = await Promise.all([
        sb.from('rooms').select('*').eq('code', code).maybeSingle(),
        sb.from('players').select('*').eq('room_code', code).order('joined_at'),
        sb.from('submissions').select('*').eq('room_code', code),
        sb.from('ratings').select('*').eq('room_code', code),
      ]);
      if (room.error) throw room.error;
      if (!room.data) {
        await leave('That party has been dissolved by management.');
        return;
      }
      setSt((s) => ({
        ...s,
        room: room.data as Room,
        players: (players.data as Player[]) || [],
        subs: (subs.data as Submission[]) || [],
        ratings: (ratings.data as Rating[]) || [],
      }));
    } catch {
      // transient network errors: keep last good state, poller will retry
    }
  }, []);

  // Realtime subscription + polling fallback while in a room
  useEffect(() => {
    if (!st.code) return;
    const code = st.code;
    const ch = sb.channel('room-' + code);
    (['rooms', 'players', 'submissions', 'ratings'] as const).forEach((t) => {
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: t, filter: (t === 'rooms' ? 'code' : 'room_code') + '=eq.' + code },
        () => refresh(),
      );
    });
    ch.subscribe();
    channelRef.current = ch;
    const poll = setInterval(refresh, 3000);
    refresh();
    return () => {
      clearInterval(poll);
      sb.removeChannel(ch);
      channelRef.current = null;
    };
  }, [st.code, refresh]);

  // Host autopilot: advance phases when everyone is done
  useEffect(() => {
    const { room, players, subs, ratings, playerId } = st;
    if (!room || !playerId) return;
    const me = players.find((p) => p.id === playerId);
    if (!me?.is_host || advancingRef.current) return;
    const P = players.length;
    const roundSubs = subs.filter((x) => x.round === room.round);
    if (room.phase === 'writing' && P > 0 && roundSubs.length >= P) {
      void advance('rating');
    } else if (room.phase === 'rating') {
      const expected = roundSubs.length * (P - 1);
      const got = ratings.filter((x) => x.round === room.round).length;
      if (expected > 0 && got >= expected) void advance('results');
    }
  }, [st.room, st.players, st.subs, st.ratings]);

  // Boot: restore session
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          const sess: Session = JSON.parse(raw);
          const p = await sb.from('players').select('*').eq('id', sess.playerId).maybeSingle();
          if (p.data) {
            setSt((s) => ({ ...s, booted: true, code: sess.code, playerId: sess.playerId, name: sess.name }));
            return;
          }
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      } catch {}
      setSt((s) => ({ ...s, booted: true }));
    })();
  }, []);

  async function saveSession(sess: Session) {
    try { await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sess)); } catch {}
  }

  async function createParty(name: string) {
    setError(null);
    let code = genCode();
    let r = await sb.from('rooms').insert({ code }).select().single();
    if (r.error) {
      code = genCode();
      r = await sb.from('rooms').insert({ code }).select().single();
    }
    if (r.error) { setError('Could not open a conference room. Try again.'); return; }
    const p = await sb.from('players').insert({ room_code: code, name, title: pick(TITLES), is_host: true }).select().single();
    if (p.error) { setError('Badge printer jammed. Try again.'); return; }
    await saveSession({ code, playerId: p.data.id, name });
    setSt((s) => ({ ...s, code, playerId: p.data.id, name, submittedRound: 0 }));
  }

  async function joinParty(name: string, codeRaw: string) {
    setError(null);
    const code = codeRaw.trim().toUpperCase();
    if (code.length !== 4) { setError('Room codes are 4 letters.'); return; }
    const r = await sb.from('rooms').select('*').eq('code', code).maybeSingle();
    if (r.error || !r.data) { setError('No meeting found in room ' + code + '.'); return; }
    if (r.data.phase !== 'lobby') { setError('That meeting is already in progress.'); return; }
    const p = await sb.from('players').insert({ room_code: code, name, title: pick(TITLES), is_host: false }).select().single();
    if (p.error) { setError('Badge printer jammed. Try again.'); return; }
    await saveSession({ code, playerId: p.data.id, name });
    setSt((s) => ({ ...s, code, playerId: p.data.id, name, submittedRound: 0 }));
  }

  async function startRound(totalRounds?: number) {
    const room = stRef.current.room;
    if (!room) return;
    const used = room.used_prompts || [];
    let pool = PROMPTS.filter((p) => !used.includes(p.id));
    if (!pool.length) pool = PROMPTS;
    const prompt = pick(pool);
    const deadline = new Date(Date.now() + WRITE_SECONDS * 1000).toISOString();
    await sb.from('rooms').update({
      phase: 'writing' as Phase,
      round: (room.round || 0) + 1,
      prompt,
      used_prompts: [...used, prompt.id],
      deadline,
      total_rounds: totalRounds ?? room.total_rounds,
    }).eq('code', room.code);
    await refresh();
  }

  async function submitEmail(subject: string, body: string) {
    const { room, playerId, code } = stRef.current;
    if (!room || !playerId || !code) return;
    const r = await sb.from('submissions').insert({
      room_code: code, round: room.round, player_id: playerId,
      subject: subject.trim() || '(no subject)', body: body.trim(),
    });
    if (r.error && r.error.code !== '23505') {
      setError('Send failed. The server is circling back.');
      return;
    }
    setSt((s) => ({ ...s, submittedRound: room.round }));
    await refresh();
  }

  async function rate(submissionId: string, stars: number) {
    const { room, playerId, code } = stRef.current;
    if (!room || !playerId || !code) return;
    await sb.from('ratings').upsert(
      { room_code: code, round: room.round, submission_id: submissionId, rater_id: playerId, stars },
      { onConflict: 'submission_id,rater_id' },
    );
    await refresh();
  }

  async function advance(phase: Phase) {
    const code = stRef.current.code;
    if (!code || advancingRef.current) return;
    advancingRef.current = true;
    try {
      await sb.from('rooms').update({ phase }).eq('code', code);
      await refresh();
    } finally {
      advancingRef.current = false;
    }
  }

  async function nextOrFinal() {
    const room = stRef.current.room;
    if (!room) return;
    if (room.round < room.total_rounds) await startRound();
    else await advance('final');
  }

  async function playAgain() {
    const code = stRef.current.code;
    if (!code) return;
    await sb.from('submissions').delete().eq('room_code', code);
    await sb.from('ratings').delete().eq('room_code', code);
    await sb.from('rooms').update({ phase: 'lobby', round: 0, prompt: null, used_prompts: [], deadline: null }).eq('code', code);
    setSt((s) => ({ ...s, submittedRound: 0 }));
    await refresh();
  }

  async function cancelParty() {
    const code = stRef.current.code;
    if (code) await sb.from('rooms').delete().eq('code', code);
    await leave('Party dissolved.');
  }

  async function leaveParty() {
    const pid = stRef.current.playerId;
    if (pid) await sb.from('players').delete().eq('id', pid);
    await leave('You slipped out of the meeting.');
  }

  async function leave(msg?: string) {
    try { await AsyncStorage.removeItem(SESSION_KEY); } catch {}
    setSt((s) => ({
      ...s, code: null, playerId: null, room: null,
      players: [], subs: [], ratings: [], submittedRound: 0, error: msg ?? null,
    }));
  }

  return {
    st, setError,
    createParty, joinParty, startRound, submitEmail, rate,
    advance, nextOrFinal, playAgain, cancelParty, leaveParty, leave,
  };
}
