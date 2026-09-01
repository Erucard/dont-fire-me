# Don't Fire Me

The corporate jargon party game. Everyone gets an absurd office email — HR incident reports, all-staff reply-all disasters, impossible requests — and has 5 minutes to write the reply that saves their career. Then everyone anonymously star-rates each other's emails. Best average wins Employee of the Month; worst gets fired.

**Play it:** https://erucard.github.io/dont-fire-me/

Meant to be played in the same room, each player on their own phone. One person taps **Start a party** and reads out the 4-letter room code; everyone else taps **Join a party**.

## The iOS app

`mobile/` is the real thing: an Expo (React Native) app with the same game against the same backend — web players and app players can join the same party. To ship it to TestFlight/App Store from Windows (no Mac needed), run the guided script in Git Bash:

```bash
./ship-ios.sh
```

It walks through Expo login, EAS project setup, the cloud iOS build, and TestFlight submission. Prompts for the app live in `mobile/src/prompts.ts` (same content as the web version — edit both if you change one). Test locally with `cd mobile && npx expo start` (press `w` for web, or scan the QR with the Expo Go iPhone app).

## How the web version works

- `index.html` — the whole game. Single file: UI, game logic, and all the prompts.
- Backend: Supabase project `dont-fire-me` (`thijolchfiisfxmufkvh`). Tables: `rooms`, `players`, `submissions`, `ratings`. Clients sync via Supabase Realtime with a 3-second polling fallback. The host's phone drives phase transitions (writing → rating → results).
- Hosting: GitHub Pages, straight from this repo's `main` branch.

## Editing prompts

Open `index.html` and find `var PROMPTS = [`. Each prompt is an incoming email:

```js
{id:'ex1', cat:'excuse', from:'HR <hr@corp.biz>', subject:'Incident Report: Break Room',
 body:'It has come to our attention that...', task:'Explain yourself. Admit nothing.'}
```

- `id` must be unique (it's how the game avoids repeats within a party).
- `cat` is one of `excuse | announce | request | replyall` (currently cosmetic).
- Reply-all prompts use `thread:[{from, text}, ...]` instead of `body`.
- `JARGON` and `TITLES` arrays nearby are also fair game.

Commit and push to `main` — Pages redeploys automatically in about a minute.

## Notes / known trade-offs (prototype)

- No auth: room codes are the only gate, and database policies are wide open. Fine for a party game with throwaway data; not fine for anything else.
- If the host's phone dies mid-game, the party stalls (host drives all phase changes). Host also has manual "close early / reveal" buttons if someone walks off.
- Old parties are never cleaned up automatically yet.
