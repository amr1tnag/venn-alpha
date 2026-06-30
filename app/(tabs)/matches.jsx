import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

const DEMO_NEW = [
  { id: 'n1', name: 'Kavya', age: 22, photo: null, online: true },
  { id: 'n2', name: 'Ishaan', age: 25, photo: null, online: false },
  { id: 'n3', name: 'Rhea', age: 23, photo: null, online: false },
];

const DEMO_YOUR_TURN = [
  { id: 'y1', name: 'Priya', age: 24, photo: null, lastMsg: "I have a 2BHK in Bandra West, looking for a flatmate 🙂", online: true },
  { id: 'y2', name: 'Meera', age: 23, photo: null, lastMsg: "Sounds amazing, I'd love a balcony too! 🌿", online: false },
];

const DEMO_THEIR_TURN = [
  { id: 't1', name: 'Ananya', age: 26, photo: null, lastMsg: "You: Open to anywhere central. What about you?", online: false },
];

function Avatar({ photo, name, size = 60, online = false, gradient = false }) {
  const initials = (name ?? '?')[0].toUpperCase();
  const content = (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' }}>
      {photo
        ? <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        : <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: size * 0.38, color: colors.slate }}>{initials}</Text>
      }
    </View>
  );

  return (
    <View style={{ position: 'relative' }}>
      {gradient ? (
        <LinearGradient colors={['#335CFF', '#8A5BFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ width: size + 5, height: size + 5, borderRadius: (size + 5) / 2, padding: 2.5, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ borderRadius: size / 2, overflow: 'hidden', borderWidth: 2.5, borderColor: '#fff' }}>
            {content}
          </View>
        </LinearGradient>
      ) : content}
      {online && (
        <View style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' }} />
      )}
    </View>
  );
}

export default function Matches() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [newMatches, setNewMatches] = useState(DEMO_NEW);
  const [yourTurn, setYourTurn] = useState(DEMO_YOUR_TURN);
  const [theirTurn, setTheirTurn] = useState(DEMO_THEIR_TURN);
  const [hasUnread] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const uid = authData?.user?.id;
        if (!uid) return;

        const { data: matchRows } = await supabase
          .from('matches')
          .select('id, created_at, user1_id, user2_id')
          .or(`user1_id.eq.${uid},user2_id.eq.${uid}`);
        if (!matchRows || matchRows.length === 0) {
          setNewMatches([]); setYourTurn([]); setTheirTurn([]);
          return;
        }

        const otherIds = matchRows.map(m => m.user1_id === uid ? m.user2_id : m.user1_id);
        const { data: profileRows } = await supabase
          .from('profiles').select('id, name, birthday, photos').in('id', otherIds);
        const profileMap = {};
        profileRows?.forEach(p => { profileMap[p.id] = p; });

        const matchIds = matchRows.map(m => m.id);
        const { data: msgRows } = await supabase
          .from('messages').select('match_id, content, sender_id, created_at')
          .in('match_id', matchIds).order('created_at', { ascending: false });
        const latestMsg = {};
        msgRows?.forEach(msg => { if (!latestMsg[msg.match_id]) latestMsg[msg.match_id] = msg; });

        const newM = [], yourT = [], theirT = [];
        matchRows.forEach(match => {
          const otherId = match.user1_id === uid ? match.user2_id : match.user1_id;
          const p = profileMap[otherId];
          const age = p?.birthday
            ? Math.floor((Date.now() - new Date(p.birthday).getTime()) / (365.25 * 24 * 3600 * 1000))
            : null;
          const entry = { id: match.id, name: p?.name ?? '?', age, photo: Array.isArray(p?.photos) ? p.photos[0] ?? null : null, online: false };
          const last = latestMsg[match.id];
          if (!last) {
            newM.push(entry);
          } else {
            const lastMsgText = last.sender_id === uid ? `You: ${last.content}` : last.content;
            if (last.sender_id !== uid) yourT.push({ ...entry, lastMsg: lastMsgText });
            else theirT.push({ ...entry, lastMsg: lastMsgText });
          }
        });
        setNewMatches(newM);
        setYourTurn(yourT);
        setTheirTurn(theirT);
      } catch (_) {}
    }
    load();
  }, []);

  function openChat(match) {
    router.push({ pathname: '/(tabs)/chat', params: { name: match.name, matchId: match.id ?? '' } });
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top + 12 }]}>
      <View style={s.topBar}>
        <Text style={s.title}>Matches</Text>
        <TouchableOpacity style={s.bellBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)/notifications')}>
          <Ionicons name="notifications-outline" size={18} color={colors.ink} />
          {hasUnread && <View style={s.bellDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={s.whiteCard} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>New Matches</Text>
            <Text style={s.sectionCount}>{newMatches.length} new</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 18 }}>
            {newMatches.map(m => (
              <TouchableOpacity key={m.id} style={s.newMatchItem} onPress={() => openChat(m)} activeOpacity={0.8}>
                <Avatar photo={m.photo} name={m.name} size={60} online={m.online} gradient />
                <Text style={s.newMatchName}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.divider} />
        </View>

        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Your turn ({yourTurn.length})</Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0B2" />
          </View>
          {yourTurn.map((m, i) => (
            <TouchableOpacity key={m.id} style={[s.chatRow, i < yourTurn.length - 1 && s.chatRowBorder]} onPress={() => openChat(m)} activeOpacity={0.8}>
              <Avatar photo={m.photo} name={m.name} size={52} online={m.online} />
              <View style={s.chatInfo}>
                <Text style={s.chatName}>{m.name}</Text>
                <Text style={s.chatMsg} numberOfLines={1}>{m.lastMsg}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C0C5D0" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[s.section, { paddingTop: 10 }]}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Their turn ({theirTurn.length})</Text>
            <Ionicons name="chevron-down" size={18} color="#9AA0B2" />
          </View>
          {theirTurn.map((m, i) => (
            <TouchableOpacity key={m.id} style={[s.chatRow, i < theirTurn.length - 1 && s.chatRowBorder]} onPress={() => openChat(m)} activeOpacity={0.8}>
              <Avatar photo={m.photo} name={m.name} size={52} />
              <View style={s.chatInfo}>
                <Text style={s.chatName}>{m.name}</Text>
                <Text style={[s.chatMsg, { color: '#9AA0B2' }]} numberOfLines={1}>{m.lastMsg}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C0C5D0" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.03 * 28 },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 2, position: 'relative' },
  bellDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D6A', borderWidth: 2, borderColor: colors.canvas },

  whiteCard: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },

  section: { paddingHorizontal: 20, paddingTop: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: colors.ink },
  sectionCount: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 12, color: colors.blue },
  divider: { height: 1, backgroundColor: '#F0F1F5', marginTop: 6 },

  newMatchItem: { alignItems: 'center', gap: 6 },
  newMatchName: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 11, color: colors.ink },

  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  chatRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  chatInfo: { flex: 1, minWidth: 0 },
  chatName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: colors.ink, marginBottom: 3 },
  chatMsg: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 13, color: colors.ink },
});
