import { supabase } from './supabase';

// Deleting the match cascades to its messages and notifications (see
// SUPABASE_SQL.md #13), so this alone tears down the whole conversation.
export function unmatchUser(matchId) {
  if (!matchId) return Promise.resolve({ error: new Error('Missing match') });
  return supabase.from('matches').delete().eq('id', matchId);
}
