import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { C, F } from './theme';

export function Win({ title, right, children, style }: {
  title: string; right?: string; children: React.ReactNode; style?: ViewStyle;
}) {
  return (
    <View style={[s.win, style]}>
      <View style={s.winBar}>
        <Text style={s.winDots}>●●●</Text>
        <Text style={s.winTitle} numberOfLines={1}>{title.toUpperCase()}</Text>
        <Text style={s.winRight} numberOfLines={1}>{(right || '').toUpperCase()}</Text>
      </View>
      <View style={s.winBody}>{children}</View>
    </View>
  );
}

export function Stamp({ text, color = C.stamp, big = false }: { text: string; color?: string; big?: boolean }) {
  return (
    <View style={[s.stamp, { borderColor: color }, big && s.stampBig, { transform: [{ rotate: '-5deg' }] }]}>
      <Text style={[s.stampText, { color }, big && s.stampTextBig]}>{text.toUpperCase()}</Text>
    </View>
  );
}

export function Btn({ label, onPress, kind = 'navy', slim = false, disabled = false }: {
  label: string; onPress: () => void; kind?: 'navy' | 'red' | 'ghost'; slim?: boolean; disabled?: boolean;
}) {
  const bg = kind === 'navy' ? C.navy : kind === 'red' ? C.stamp : C.surface2;
  const edge = kind === 'navy' ? C.navyD : kind === 'red' ? C.stampD : C.line;
  const fg = kind === 'ghost' ? C.navy : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderColor: edge, shadowColor: edge },
        slim && s.btnSlim,
        pressed && { transform: [{ translateY: 2 }] },
        disabled && { opacity: 0.45 },
        { borderBottomWidth: pressed ? 1 : 3, borderBottomColor: edge },
      ]}
    >
      <Text style={[s.btnText, { color: fg }, slim && { fontSize: 12 }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

export function Label({ text }: { text: string }) {
  return <Text style={s.label}>{text.toUpperCase()}</Text>;
}

export function Eyebrow({ text }: { text: string }) {
  return <Text style={s.eyebrow}>{text.toUpperCase()}</Text>;
}

export function Small({ text, center = false }: { text: string; center?: boolean }) {
  return <Text style={[s.small, center && { textAlign: 'center' }]}>{text}</Text>;
}

export function Input(props: React.ComponentProps<typeof TextInput> & { code?: boolean }) {
  const { code, style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={C.muted}
      {...rest}
      style={[s.input, code && s.inputCode, style]}
    />
  );
}

export function TaskNote({ text }: { text: string }) {
  return (
    <View style={s.taskNote}>
      <Text style={s.taskNoteK}>YOUR ASSIGNMENT</Text>
      <Text style={s.taskNoteText}>{text}</Text>
    </View>
  );
}

export function MailRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.mailRow}>
      <Text style={s.mailK}>{k.toUpperCase()}</Text>
      <Text style={s.mailV}>{v}</Text>
    </View>
  );
}

export function Stars({ value, onRate }: { value: number; onRate: (n: number) => void }) {
  return (
    <View style={s.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onRate(n)} hitSlop={6} accessibilityLabel={n + ' stars'}>
          <Text style={[s.star, { color: n <= value ? C.gold : C.starOff }]}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  win: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.navyD,
    marginBottom: 16,
    shadowColor: C.navyD,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 0,
    elevation: 2,
  },
  winBar: {
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 8,
  },
  winDots: { color: '#fff', fontSize: 9, opacity: 0.85, letterSpacing: 2 },
  winTitle: { color: '#fff', fontFamily: F.mono, fontSize: 11, letterSpacing: 1.4, flex: 1, textAlign: 'center' },
  winRight: { color: '#fff', fontFamily: F.monoRegular, fontSize: 9, opacity: 0.8, maxWidth: 110 },
  winBody: { padding: 16 },

  stamp: { alignSelf: 'center', borderWidth: 3, paddingVertical: 3, paddingHorizontal: 12 },
  stampBig: { borderWidth: 4, paddingVertical: 6, paddingHorizontal: 18 },
  stampText: { fontFamily: F.mono, fontSize: 14, letterSpacing: 2.5 },
  stampTextBig: { fontSize: 22, letterSpacing: 3.5 },

  btn: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  btnSlim: { paddingVertical: 9, paddingHorizontal: 12, marginTop: 8 },
  btnText: { fontFamily: F.mono, fontSize: 14, letterSpacing: 1.7 },

  label: { fontFamily: F.monoRegular, fontSize: 11, letterSpacing: 1.5, color: C.muted, marginTop: 12, marginBottom: 4 },
  eyebrow: { fontFamily: F.monoRegular, fontSize: 11, letterSpacing: 1.8, color: C.muted, marginBottom: 6, textAlign: 'center' },
  small: { fontSize: 13, color: C.muted, fontFamily: F.sans },

  input: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    fontFamily: F.sans,
    fontSize: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
    color: C.ink,
  },
  inputCode: {
    fontFamily: F.mono,
    fontSize: 22,
    letterSpacing: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  taskNote: {
    backgroundColor: C.sticky,
    borderWidth: 1,
    borderColor: C.stickyBorder,
    padding: 12,
    marginTop: 12,
    transform: [{ rotate: '0.4deg' }],
    shadowColor: C.ink,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 1,
  },
  taskNoteK: { fontFamily: F.monoRegular, fontSize: 10, letterSpacing: 1.4, color: C.stickyD, marginBottom: 2 },
  taskNoteText: { fontFamily: F.sansSemi, fontSize: 14, color: C.ink },

  mailRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  mailK: { fontFamily: F.monoRegular, fontSize: 11, letterSpacing: 1, color: C.muted, width: 64, paddingTop: 2 },
  mailV: { fontFamily: F.sansSemi, fontSize: 13, color: C.ink, flex: 1 },

  stars: { flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: 6, paddingBottom: 2 },
  star: { fontSize: 34, lineHeight: 40, paddingHorizontal: 6 },
});
