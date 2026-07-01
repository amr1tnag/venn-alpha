import { supabase } from './supabase';

// Deleting the match cascades to its messages and notifications (see
// SUPABASE_SQL.md #13). Also clear both directions of the mutual like that
// formed the match, so the pair can like each other again later instead of
// hitting the likes unique-constraint on re-like.
export async function unmatchUser(matchId, uid, otherId) {
  if (!matchId) return { error: new Error('Missing match') };
  const deletes = [supabase.from('matches').delete().eq('id', matchId)];
  if (uid && otherId) {
    deletes.push(supabase.from('likes').delete().eq('from_user_id', uid).eq('to_user_id', otherId));
    deletes.push(supabase.from('likes').delete().eq('from_user_id', otherId).eq('to_user_id', uid));
  }
  const [{ error }] = await Promise.all(deletes);
  return { error };
}
