// Round management service
import { supabase } from '../supabaseClient';

export const roundService = {
  // Create a new round with hole data
  async createRound(roundData, holesData, userEmail) {
    // Start a transaction-like operation
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert({
        user_email: userEmail,
        course_id: roundData.course_id,
        tee_box: roundData.tee_box,
        round_date: roundData.round_date,
        round_type: roundData.round_type,
        scoring_zone_level: roundData.scoring_zone_level,
        total_holes_played: roundData.total_holes_played,
        total_score: roundData.total_score,
        total_putts: roundData.total_putts,
        total_penalties: roundData.total_penalties
      })
      .select()
      .single();

    if (roundError) throw roundError;

    // Insert hole data
    const holeInserts = holesData.map(hole => ({
      round_id: round.id,
      hole_number: hole.hole_number,
      hole_score: parseInt(hole.hole_score) || null,
      par: parseInt(hole.par) || null,
      distance: parseInt(hole.distance) || null,
      putts: parseInt(hole.putts) || null,
      putts_within4ft: parseInt(hole.putts_within4ft) || 0,
      penalty_shots: parseInt(hole.penalty_shots) || 0,
      scoring_zone_in_regulation: hole.scoring_zone_in_regulation || false,
      holeout_from_outside_4ft: hole.holeout_from_outside_4ft || false,
      holeout_within_3_shots_scoring_zone: hole.holeout_within_3_shots_scoring_zone || false,
    }));

    const { data: holes, error: holesError } = await supabase
      .from('round_holes')
      .insert(holeInserts)
      .select();

    if (holesError) {
      // If hole insertion fails, we should ideally rollback the round
      // For now, we'll throw the error
      throw holesError;
    }

    return {
      round,
      holes
    };
  },

  // Get user's rounds with course information
  async getUserRounds(userEmail, limit = 50) {
    const { data, error } = await supabase
      .from('rounds')
      .select(`
        id, round_date, total_score, total_putts, total_holes_played, is_eligible_round, tee_box,
        courses ( name ),
        round_holes ( scoring_zone_in_regulation, holeout_within_3_shots_scoring_zone )
      `)
      .eq('user_email', userEmail)
      .order('round_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get specific round with hole details
  async getRoundWithHoles(roundId, userEmail) {
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select(`
        *,
        courses (
          name,
          country,
          city
        )
      `)
      .eq('id', roundId)
      .eq('user_email', userEmail)
      .single();

    if (roundError) throw roundError;

    const { data: holes, error: holesError } = await supabase
      .from('round_holes')
      .select('*')
      .eq('round_id', roundId)
      .order('hole_number');

    if (holesError) throw holesError;

    return {
      ...round,
      holes
    };
  },

  // Update round data
  async updateRound(roundId, roundData, holesData, userEmail) {
    // Update round summary
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .update({
        ...roundData,
        total_holes_played: roundData.total_holes_played,
        total_score: roundData.total_score,
        total_putts: roundData.total_putts,
        total_penalties: roundData.total_penalties,
        updated_at: new Date().toISOString()
      })
      .eq('id', roundId)
      .eq('user_email', userEmail)
      .select()
      .single();
    
    if (roundError) throw roundError;

    // Upsert hole data to handle both new and existing holes efficiently
    const holeInserts = holesData.map(hole => ({
      round_id: roundId,
      hole_number: hole.hole_number,
      hole_score: parseInt(hole.hole_score) || null,
      par: parseInt(hole.par) || null,
      distance: parseInt(hole.distance) || null,
      putts: parseInt(hole.putts) || null,
      putts_within4ft: parseInt(hole.putts_within4ft) || 0,
      scoring_zone_in_regulation: hole.scoring_zone_in_regulation || false,
      holeout_from_outside_4ft: hole.holeout_from_outside_4ft || false,
      holeout_within_3_shots_scoring_zone: hole.holeout_within_3_shots_scoring_zone || false,
    }));

    const { error: holesError } = await supabase
      .from('round_holes')
      .upsert(holeInserts, { onConflict: 'round_id, hole_number' });

    if (holesError) throw holesError;

    return {
      ...round,
      holes: holeInserts // Return the data that was upserted
    };
  },

  // Delete a round
  async deleteRound(roundId, userEmail) {
    const { error } = await supabase
      .from('rounds')
      .delete()
      .eq('id', roundId)
      .eq('user_email', userEmail);

    if (error) throw error;
    return true;
  },

  // Get user's round statistics
  async getUserStats(userEmail) {
    const { data, error } = await supabase
      .from('rounds')
      .select('total_score, total_putts, total_penalties, total_holes_played, round_date')
      .eq('user_email', userEmail)
      .order('round_date', { ascending: false });

    if (error) throw error;

    // Calculate basic stats
    const totalRounds = data.length;
    const totalHoles = data.reduce((sum, round) => sum + round.total_holes_played, 0);
    const averageScore = totalHoles > 0 ? 
      data.reduce((sum, round) => sum + round.total_score, 0) / totalHoles : 0;
    const averagePutts = totalHoles > 0 ? 
      data.reduce((sum, round) => sum + round.total_putts, 0) / totalHoles : 0;

    return {
      totalRounds,
      totalHoles,
      averageScore: averageScore.toFixed(1),
      averagePutts: averagePutts.toFixed(1),
      recentRounds: data.slice(0, 10)
    };
  },

  // Get data for the main dashboard
  async getDashboardStats(userEmail, limit = 5) {
    const { data, error } = await supabase
      .from('rounds')
      .select(`
        id,
        round_date,
        total_score,
        total_putts,
        total_holes_played,
        is_eligible_round,
        tee_box,
        courses ( name ),
        round_holes ( * )
      `)
      .eq('user_email', userEmail)
      .order('round_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get the current SZIR streak by calling the database function
  async getCurrentSzirStreak(userEmail) {
    const { data, error } = await supabase.rpc('calculate_user_szir_streak', {
      user_email_param: userEmail
    });

    if (error) throw error;

    return data;
  },

  // Get the current SZ Par streak by calling the database function
  async getCurrentSzParStreak(userEmail) {
    const { data, error } = await supabase.rpc('calculate_user_szpar_streak', {
      user_email_param: userEmail
    });

    if (error) throw error;

    return data;
  },

  // Get cumulative stats for a user by calling the database function
  async getCumulativeStats(userEmail) {
    const { data, error } = await supabase.rpc('get_user_cumulative_stats', {
      user_email_param: userEmail
    });

    if (error) throw error;

    // rpc returns an array, we want the single result object
    return data[0];
  },

  // Get recent rounds stats by calling the database function
  async getRecentRoundsStats(userEmail, limit, eligibleRoundsOnly) {
    const { data, error } = await supabase.rpc('get_recent_rounds_stats', {
      user_email_param: userEmail,
      round_limit: limit,
      eligible_rounds_only: eligibleRoundsOnly
    });

    if (error) throw error;

    return data[0];
  }
};