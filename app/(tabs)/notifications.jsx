import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../lib/theme';

const DEMO_TODAY = [
  {
    id: '1',
    type: 'match',
    name: 'Kavya',
    photo: null,
    text: 'You matched with Kavya! Start a conversation.',
    time: '2m ago',
  },
  {
    id: '2',
    type: 'like',
    name: 'Ishaan',
    photo: null,
    text: 'Ishaan liked your profile.',
    time: '24m ago',
  },
  {
    id: '3',
    type: 'view',
    name: 'Rhea',
    photo: null,
    text: 'Rhea viewed your profile.',
    time: '1h ago',
  },
];

const DEMO_YESTERDAY = [
  {
    id: '4',
    type: 'message',
    name: 'Priya',
    photo: null,
    text: 'Priya sent you a message: "I have a 2BHK in Bandra…"',
    time: 'Yesterday',
  },
  {
    id: '5',
    type: 'like',
    name: 'Arjun',
    photo: null,
    text: 'Arjun liked your profile.',
    time: 'Yesterday',
  },
];

const NOTIF_META = {
  match:   { icon: 'heart',               bg: '#FFF0F3', color: '#FF4D6A' },
  like:    { icon: 'heart-outline',        bg: '#FFF0F3', color: '#FF4D6A' },
  message: { icon: 'chatbubble-outline',   bg: '#EEF1FF', color: colors.blue },
  view:    { icon: 'eye-outline',          bg: '#F0EEFF', color: '#8A5BFF' },
};

function NotifRow({ notif, last }) {
  const meta = NOTIF_META[notif.type] ?? NOTIF_META.like;
  return (
    <TouchableOpacity style={[s.row, !last && s.rowBorder]} activeOpacity={0.7}>
      <View style={[s.iconWrap, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={18} color={meta.color} />
      </View>
      <View style={s.rowBody}>
        <Text style={s.rowText}>{notif.text}</Text>
        <Text style={s.rowTime}>{notif.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[s.screen, { paddingTop: insets.top + 4 }]}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Text style={s.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={s.section}>
          <Text style={s.sectionLabel}>TODAY</Text>
          {DEMO_TODAY.map((n, i) => (
            <NotifRow key={n.id} notif={n} last={i === DEMO_TODAY.length - 1} />
          ))}
        </View>
        <View style={[s.section, { marginTop: 8 }]}>
          <Text style={s.sectionLabel}>YESTERDAY</Text>
          {DEMO_YESTERDAY.map((n, i) => (
            <NotifRow key={n.id} notif={n} last={i === DEMO_YESTERDAY.length - 1} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.ink },
  markAll: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 13, color: colors.blue },

  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel: { fontFamily: 'SpaceMono_400Regular', fontSize: 10, letterSpacing: 1.5, color: '#9AA0B2', marginBottom: 10 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowBody: { flex: 1 },
  rowText: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 14, color: colors.ink, lineHeight: 20, marginBottom: 3 },
  rowTime: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 12, color: '#9AA0B2' },
});
