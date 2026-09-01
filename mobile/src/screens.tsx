import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { C, F } from './theme';
import { Btn, Eyebrow, Input, Label, MailRow, Small, Stamp, Stars, TaskNote, Win } from './ui';
import { CUBES, JARGON, STAR_LABELS } from './prompts';
import type { Prompt } from './prompts';
import { pick, scoresForRound, totals, Player, Rating, Room, Submission } from './game';

/* ---------------- Home ---------------- */
export function HomeScreen({ savedName, onCreate, onJoin }: {
  savedName: string;
  onCreate: (name: string) => void;
  onJoin: (name: string, code: string) => void;
}) {
  const [name, setName] = useState(savedName);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState('');
  return (
    <View>
      <View style={s.hero}>
        <Text style={s.heroFire}>FIRE ME</Text>
        <View style={s.heroDont}>
          <Text style={s.heroDontText}>DON'T</Text>
        </View>
        <Text style={s.heroTag}>THE CORPORATE JARGON PARTY GAME</Text>
      </View>
      <Win title="CorpMail™ — Sign In" right="v0.1">
        <Label text="Name (as printed on your badge)" />
        <Input value={name} onChangeText={setName} maxLength={20} placeholder="e.g. Greg" autoCorrect={false} />
        <Btn label="Start a party" onPress={() => onCreate(name.trim())} />
        {joining ? (
          <>
            <Label text="Conference room code" />
            <Input code value={code} onChangeText={(t) => setCode(t.toUpperCase())} maxLength={4} placeholder="ABCD" autoCapitalize="characters" autoCorrect={false} />
            <Btn label="Join meeting" kind="red" onPress={() => onJoin(name.trim(), code)} />
          </>
        ) : (
          <Btn label="Join a party" kind="ghost" onPress={() => setJoining(true)} />
        )}
      </Win>
      <Text style={s.footer}>CORPMAIL™ ENTERPRISE EDITION · 3–12 PLAYERS · ONE PHONE EACH</Text>
    </View>
  );
}

/* ---------------- Lobby ---------------- */
export function LobbyScreen({ room, players, isHost, onStart, onCancel, onLeave }: {
  room: Room; players: Player[]; isHost: boolean;
  onStart: (rounds: number) => void; onCancel: () => void; onLeave: () => void;
}) {
  const [rounds, setRounds] = useState(3);
  return (
    <View>
      <Win title="Conference Room" right="Lobby">
        <Eyebrow text="Tell your coworkers the code" />
        <Text style={s.roomCode}>{room.code}</Text>
        <Small center text="They tap “Join a party” on their phone" />
      </Win>
      <Win title="Attendees" right={players.length + ' badged in'}>
        {players.map((p) => (
          <View key={p.id} style={s.badge}>
            <View style={s.badgeClip} />
            <View style={{ flex: 1 }}>
              <Text style={s.badgeName}>{p.name}</Text>
              <Text style={s.badgeTitle}>{p.title}</Text>
            </View>
            {p.is_host && <Text style={s.hostTag}>THE BOSS</Text>}
          </View>
        ))}
        {isHost ? (
          <>
            <Label text="Rounds" />
            <View style={s.seg}>
              {[2, 3, 4, 5].map((n) => (
                <Text
                  key={n}
                  onPress={() => setRounds(n)}
                  style={[s.segItem, rounds === n && s.segItemOn]}
                >
                  {n}
                </Text>
              ))}
            </View>
            <Btn label="Call the meeting to order" kind="red" disabled={players.length < 2} onPress={() => onStart(rounds)} />
            {players.length < 3 && <Small center text="Works best with 3+. Two players is just a 1:1." />}
            <Btn label="Cancel party" kind="ghost" slim onPress={onCancel} />
          </>
        ) : (
          <>
            <Text style={s.waiting}>WAITING FOR THE BOSS TO START…</Text>
            <Btn label="Leave quietly" kind="ghost" slim onPress={onLeave} />
          </>
        )}
      </Win>
    </View>
  );
}

/* ---------------- Timer ---------------- */
function Timer({ deadline }: { deadline: string | null }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 500);
    return () => clearInterval(t);
  }, []);
  if (!deadline) return null;
  const left = Math.floor((new Date(deadline).getTime() - Date.now()) / 1000);
  const late = left <= 30;
  const label = left <= 0 ? 'OVERDUE' : Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  return (
    <View style={[s.timer, late && { borderColor: C.stamp }]}>
      <Text style={[s.timerText, late && { color: C.stamp }]}>{label}</Text>
    </View>
  );
}

function TopBar({ left, deadline }: { left: string; deadline?: string | null }) {
  return (
    <View style={s.topbar}>
      <Text style={s.topbarRound}>{left.toUpperCase()}</Text>
      {deadline !== undefined && <Timer deadline={deadline} />}
    </View>
  );
}

/* ---------------- Prompt card ---------------- */
function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <Win title="Inbox (1 unread)" right="URGENT">
      <View style={s.mailHead}>
        <MailRow k="From" v={prompt.from} />
        <MailRow k="To" v="You" />
        <MailRow k="Subject" v={prompt.subject} />
      </View>
      {prompt.thread ? (
        prompt.thread.map((m, i) => (
          <View key={i} style={s.threadMsg}>
            <Text style={s.threadFrom}>{m.from.toUpperCase()}</Text>
            <Text style={s.mailBody}>{m.text}</Text>
          </View>
        ))
      ) : (
        <Text style={s.mailBody}>{prompt.body}</Text>
      )}
      <TaskNote text={prompt.task} />
    </Win>
  );
}

/* ---------------- Writing ---------------- */
export function WritingScreen({ room, players, subs, submitted, isHost, onSubmit, onCloseEarly }: {
  room: Room; players: Player[]; subs: Submission[]; submitted: boolean; isHost: boolean;
  onSubmit: (subject: string, body: string) => void; onCloseEarly: () => void;
}) {
  const prompt = room.prompt;
  const [subject, setSubject] = useState('RE: ' + (prompt?.subject || ''));
  const [body, setBody] = useState('');
  const bodyRef = useRef<TextInput>(null);
  const selRef = useRef({ start: 0, end: 0 });
  const [sending, setSending] = useState(false);

  const roundSubs = subs.filter((x) => x.round === room.round);
  const waitingOn = players.filter((p) => !roundSubs.some((x) => x.player_id === p.id)).map((p) => p.name);

  function insertJargon() {
    const phrase = pick(JARGON);
    const { start, end } = selRef.current;
    const cur = body;
    const next = cur.slice(0, start) + phrase + cur.slice(end);
    setBody(next);
    const np = start + phrase.length;
    selRef.current = { start: np, end: np };
    bodyRef.current?.focus();
  }

  if (submitted) {
    return (
      <View>
        <TopBar left={'Round ' + room.round + ' of ' + room.total_rounds} deadline={room.deadline} />
        <Win title="Outbox" right="sent ✓">
          <Stamp text="SENT" color={C.approve} />
          <Text style={s.progressLine}>
            {roundSubs.length} OF {players.length} EMAILS IN
          </Text>
          {waitingOn.length > 0 && <Small center text={'Still typing: ' + waitingOn.join(', ')} />}
          {isHost && waitingOn.length > 0 && (
            <Btn label="Close submissions early" kind="ghost" slim onPress={onCloseEarly} />
          )}
        </Win>
      </View>
    );
  }

  return (
    <View>
      <TopBar left={'Round ' + room.round + ' of ' + room.total_rounds} deadline={room.deadline} />
      {prompt && <PromptCard prompt={prompt} />}
      <Win title="Compose reply" right="draft">
        <Label text="Subject" />
        <Input value={subject} onChangeText={setSubject} maxLength={80} autoCorrect={false} />
        <Label text="Message" />
        <Input
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={1200}
          placeholder="Dear team,"
          style={s.bodyInput}
          // @ts-ignore ref type
          ref={bodyRef}
          onSelectionChange={(e) => { selRef.current = e.nativeEvent.selection; }}
        />
        <Btn label="📎 Insert corporate jargon" kind="ghost" slim onPress={insertJargon} />
        <Btn
          label="Send (and pray)"
          kind="red"
          disabled={sending}
          onPress={() => {
            if (body.trim().length < 3) return;
            setSending(true);
            onSubmit(subject, body);
          }}
        />
      </Win>
    </View>
  );
}

/* ---------------- Rating ---------------- */
export function RatingScreen({ room, players, subs, ratings, playerId, isHost, onRate, onReveal }: {
  room: Room; players: Player[]; subs: Submission[]; ratings: Rating[]; playerId: string; isHost: boolean;
  onRate: (submissionId: string, stars: number) => void; onReveal: () => void;
}) {
  const roundSubs = subs.filter((x) => x.round === room.round).sort((a, b) => (a.id < b.id ? -1 : 1));
  const roundRatings = ratings.filter((x) => x.round === room.round);
  const mine: Record<string, number> = {};
  roundRatings.forEach((r) => { if (r.rater_id === playerId) mine[r.submission_id] = r.stars; });
  const toRate = roundSubs.filter((x) => x.player_id !== playerId).length;
  const expected = roundSubs.length * (players.length - 1);
  return (
    <View>
      <TopBar left={'Round ' + room.round + ' — Performance Review'} />
      <Win title="360° Peer Review" right="anonymous">
        <Small text="Rate each email. Authors are confidential until the results. Your own is sealed." />
      </Win>
      {roundSubs.map((sub, i) => {
        const own = sub.player_id === playerId;
        const st = mine[sub.id] || 0;
        return (
          <Win key={sub.id} title={'From: [REDACTED] — Cubicle ' + CUBES[i % CUBES.length]} right={'exhibit ' + (i + 1) + '/' + roundSubs.length}>
            <View style={s.mailHead}>
              <MailRow k="Subject" v={sub.subject} />
            </View>
            <Text style={s.mailBody}>{sub.body}</Text>
            {own ? (
              <View style={{ paddingTop: 12 }}>
                <Stamp text="Your email" />
                <Small center text="You may not review your own performance." />
              </View>
            ) : (
              <>
                <Stars value={st} onRate={(n) => onRate(sub.id, n)} />
                <Text style={s.starsLabel}>{st ? STAR_LABELS[st].toUpperCase() : 'TAP TO RATE'}</Text>
              </>
            )}
          </Win>
        );
      })}
      <Text style={s.progressLine}>
        YOU'VE REVIEWED {Object.keys(mine).length} OF {toRate} · OFFICE-WIDE: {roundRatings.length}/{expected}
      </Text>
      {isHost && <Btn label="Everyone's done — reveal results" kind="ghost" slim onPress={onReveal} />}
    </View>
  );
}

/* ---------------- Results ---------------- */
export function ResultsScreen({ room, players, subs, ratings, isHost, onNext }: {
  room: Room; players: Player[]; subs: Submission[]; ratings: Rating[]; isHost: boolean;
  onNext: () => void;
}) {
  const rows = scoresForRound(subs, ratings, room.round);
  const standing = totals(players, subs, ratings, room.round);
  const last = room.round >= room.total_rounds;
  const nameOf = (pid: string) => players.find((p) => p.id === pid)?.name ?? '???';
  return (
    <View>
      <TopBar left={'Round ' + room.round + ' of ' + room.total_rounds + ' — Results'} />
      <Win title="Performance Review Results" right={'round ' + room.round}>
        {rows.map((row, i) => {
          const first = i === 0;
          const bottom = i === rows.length - 1 && rows.length > 1;
          return (
            <View key={row.sub.id} style={[s.resultRow, first && s.resultFirst, bottom && s.resultLast]}>
              <View style={s.resultTop}>
                <Text style={s.resultWho}>
                  {nameOf(row.sub.player_id)}{first ? ' 🏆' : bottom ? ' — PIP' : ''}
                </Text>
                <Text style={s.resultScore}>{row.avg.toFixed(2)}★ · +{row.pts} pts</Text>
              </View>
              <Text style={s.resultSubj}>“{row.sub.subject}”</Text>
            </View>
          );
        })}
        <Small center text="Read the winners aloud. That's the whole point." />
      </Win>
      <Win title="Running Standings" right="confidential">
        {standing.map((x, i) => (
          <View key={x.player.id} style={s.standingRow}>
            <Text style={s.standingText}>{i + 1}. {x.player.name}</Text>
            <Text style={s.standingText}>{x.pts} pts</Text>
          </View>
        ))}
      </Win>
      {isHost ? (
        <Btn label={last ? 'Deliver the final verdict' : 'Next round'} kind={last ? 'red' : 'navy'} onPress={onNext} />
      ) : (
        <Text style={s.waiting}>WAITING FOR THE BOSS…</Text>
      )}
    </View>
  );
}

/* ---------------- Final ---------------- */
export function FinalScreen({ room, players, subs, ratings, isHost, onPlayAgain, onLeave }: {
  room: Room; players: Player[]; subs: Submission[]; ratings: Rating[]; isHost: boolean;
  onPlayAgain: () => void; onLeave: () => void;
}) {
  const t = totals(players, subs, ratings, room.round);
  if (!t.length) return null;
  const winner = t[0];
  const loser = t[t.length - 1];
  return (
    <View>
      <Win title="Final Verdict" right="HR-approved">
        <Eyebrow text="Employee of the Month" />
        <Text style={s.finalName}>{winner.player.name}</Text>
        <View style={{ marginTop: 8 }}>
          <Stamp text="PROMOTED" color={C.gold} big />
        </View>
        <Small center text={winner.pts + ' performance points'} />
      </Win>
      {t.length > 1 && (
        <Win title="Also in the mail…" right="regrettable">
          <Text style={[s.finalName, { fontSize: 24 }]}>{loser.player.name}</Text>
          <View style={{ marginTop: 8 }}>
            <Stamp text="YOU'RE FIRED" big />
          </View>
          <Small center text="Security will help you find a box for your things." />
        </Win>
      )}
      <Win title="Full Standings">
        {t.map((x, i) => (
          <View key={x.player.id} style={s.standingRow}>
            <Text style={s.standingText}>
              {i + 1}. {x.player.name} <Text style={{ color: C.muted, fontSize: 11 }}>({x.player.title})</Text>
            </Text>
            <Text style={s.standingText}>{x.pts} pts</Text>
          </View>
        ))}
      </Win>
      {isHost && <Btn label="Rehire everyone (play again)" onPress={onPlayAgain} />}
      <Btn label="Back to the parking lot" kind="ghost" slim onPress={onLeave} />
    </View>
  );
}

/* ---------------- styles ---------------- */
const s = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 34, paddingBottom: 20 },
  heroFire: { fontFamily: F.sansBold, fontSize: 64, letterSpacing: -2, color: C.ink, lineHeight: 64 },
  heroDont: {
    position: 'absolute', top: 8, borderWidth: 4, borderColor: C.stamp,
    backgroundColor: 'rgba(255,255,255,0.72)', paddingVertical: 2, paddingHorizontal: 14,
    transform: [{ rotate: '-9deg' }, { translateX: -40 }],
  },
  heroDontText: { fontFamily: F.mono, fontSize: 26, letterSpacing: 5, color: C.stamp },
  heroTag: { marginTop: 14, fontFamily: F.monoRegular, fontSize: 12, letterSpacing: 2, color: C.muted },
  footer: { marginTop: 26, textAlign: 'center', fontFamily: F.monoRegular, fontSize: 10, letterSpacing: 1.4, color: C.muted },

  roomCode: { fontFamily: F.mono, fontSize: 44, letterSpacing: 14, textAlign: 'center', color: C.ink, paddingVertical: 6 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2,
    paddingVertical: 10, paddingHorizontal: 12, marginTop: 8,
  },
  badgeClip: { width: 10, height: 26, borderWidth: 2, borderColor: C.muted, borderRadius: 5, backgroundColor: C.surface },
  badgeName: { fontFamily: F.sansBold, fontSize: 16, color: C.ink },
  badgeTitle: { fontFamily: F.monoRegular, fontSize: 12, color: C.muted },
  hostTag: { fontFamily: F.monoRegular, fontSize: 10, letterSpacing: 1.2, color: C.approve, borderWidth: 1, borderColor: C.approve, paddingHorizontal: 6, paddingVertical: 1 },
  seg: { flexDirection: 'row', gap: 6, marginTop: 4 },
  segItem: {
    flex: 1, textAlign: 'center', paddingVertical: 9, fontFamily: F.monoRegular, fontSize: 14,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line, color: C.ink, overflow: 'hidden',
  },
  segItemOn: { backgroundColor: C.navy, color: '#fff', borderColor: C.navyD, fontFamily: F.mono },
  waiting: { textAlign: 'center', paddingVertical: 22, fontFamily: F.monoRegular, fontSize: 12, letterSpacing: 1.6, color: C.muted },

  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10 },
  topbarRound: { fontFamily: F.monoRegular, fontSize: 11, letterSpacing: 1.8, color: C.muted },
  timer: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, paddingVertical: 3, paddingHorizontal: 10 },
  timerText: { fontFamily: F.mono, fontSize: 15, color: C.ink },

  mailHead: { borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 10, marginBottom: 10 },
  mailBody: { fontFamily: F.serif, fontSize: 15, lineHeight: 24, color: C.ink },
  threadMsg: { borderLeftWidth: 3, borderLeftColor: C.line, paddingLeft: 12, paddingVertical: 6, marginTop: 10 },
  threadFrom: { fontFamily: F.monoRegular, fontSize: 11, letterSpacing: 0.9, color: C.muted, marginBottom: 2 },

  bodyInput: { fontFamily: F.serif, minHeight: 170, textAlignVertical: 'top', lineHeight: 24 },

  progressLine: { fontFamily: F.monoRegular, fontSize: 12, letterSpacing: 1.2, color: C.muted, textAlign: 'center', marginVertical: 8 },
  starsLabel: { textAlign: 'center', fontFamily: F.monoRegular, fontSize: 11, letterSpacing: 1.3, color: C.muted, minHeight: 16 },

  resultRow: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, marginBottom: 8 },
  resultFirst: { borderColor: C.gold, backgroundColor: '#FBF4DF' },
  resultLast: { borderColor: C.stamp, backgroundColor: '#F9E9E6' },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  resultWho: { fontFamily: F.sansBold, fontSize: 15, color: C.ink, flex: 1 },
  resultScore: { fontFamily: F.mono, fontSize: 13, color: C.ink },
  resultSubj: { fontFamily: F.serif, fontStyle: 'italic', fontSize: 13, color: C.muted, marginTop: 2 },

  standingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 7, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: C.line, borderStyle: 'dashed',
  },
  standingText: { fontFamily: F.monoRegular, fontSize: 14, color: C.ink },

  finalName: { fontFamily: F.sansBold, fontSize: 30, color: C.ink, textAlign: 'center' },
});
