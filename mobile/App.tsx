import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, IBMPlexMono_400Regular, IBMPlexMono_700Bold } from '@expo-google-fonts/ibm-plex-mono';
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexSerif_400Regular, IBMPlexSerif_400Regular_Italic } from '@expo-google-fonts/ibm-plex-serif';
import { C, F } from './src/theme';
import { useGame } from './src/useGame';
import {
  FinalScreen, HomeScreen, LobbyScreen, RatingScreen, ResultsScreen, WritingScreen,
} from './src/screens';

export default function App() {
  const [fontsLoaded] = useFonts({
    IBMPlexMono_400Regular, IBMPlexMono_700Bold,
    IBMPlexSans_400Regular, IBMPlexSans_600SemiBold, IBMPlexSans_700Bold,
    IBMPlexSerif_400Regular, IBMPlexSerif_400Regular_Italic,
  });
  const g = useGame();
  const { st } = g;

  // Auto-dismiss error toast
  useEffect(() => {
    if (!st.error) return;
    const t = setTimeout(() => g.setError(null), 2800);
    return () => clearTimeout(t);
  }, [st.error]);

  if (!fontsLoaded || !st.booted) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.loading}>BOOTING CORPMAIL™…</Text>
      </View>
    );
  }

  const me = st.players.find((p) => p.id === st.playerId);
  const isHost = !!me?.is_host;
  const room = st.room;

  let screen: React.ReactNode;
  if (!st.code || !room) {
    screen = (
      <HomeScreen
        savedName={st.name}
        onCreate={(name) => { if (name) g.createParty(name); else g.setError('HR requires a name for your badge.'); }}
        onJoin={(name, code) => { if (name) g.joinParty(name, code); else g.setError('HR requires a name for your badge.'); }}
      />
    );
  } else if (room.phase === 'lobby') {
    screen = (
      <LobbyScreen
        room={room} players={st.players} isHost={isHost}
        onStart={(rounds) => g.startRound(rounds)}
        onCancel={() => g.cancelParty()}
        onLeave={() => g.leaveParty()}
      />
    );
  } else if (room.phase === 'writing') {
    const submitted =
      st.submittedRound === room.round ||
      st.subs.some((x) => x.round === room.round && x.player_id === st.playerId);
    screen = (
      <WritingScreen
        key={'writing-' + room.round}
        room={room} players={st.players} subs={st.subs}
        submitted={submitted} isHost={isHost}
        onSubmit={(subject, body) => g.submitEmail(subject, body)}
        onCloseEarly={() => g.advance('rating')}
      />
    );
  } else if (room.phase === 'rating') {
    screen = (
      <RatingScreen
        room={room} players={st.players} subs={st.subs} ratings={st.ratings}
        playerId={st.playerId!} isHost={isHost}
        onRate={(id, n) => g.rate(id, n)}
        onReveal={() => g.advance('results')}
      />
    );
  } else if (room.phase === 'results') {
    screen = (
      <ResultsScreen
        room={room} players={st.players} subs={st.subs} ratings={st.ratings}
        isHost={isHost} onNext={() => g.nextOrFinal()}
      />
    );
  } else {
    screen = (
      <FinalScreen
        room={room} players={st.players} subs={st.subs} ratings={st.ratings}
        isHost={isHost} onPlayAgain={() => g.playAgain()} onLeave={() => g.leave()}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {screen}
          </ScrollView>
        </KeyboardAvoidingView>
        {st.error && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{st.error}</Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  loading: { fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }), fontSize: 12, letterSpacing: 2, color: C.muted },
  scroll: { padding: 14, paddingBottom: 60, maxWidth: 540, width: '100%', alignSelf: 'center' },
  toast: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: C.ink, paddingVertical: 10, paddingHorizontal: 16, maxWidth: '90%',
  },
  toastText: { color: '#fff', fontFamily: F.monoRegular, fontSize: 13, textAlign: 'center' },
});
