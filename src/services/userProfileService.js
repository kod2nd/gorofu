import { supabase } from '../supabaseClient';

export const userProfileService = {
  /**
   * Fetches a user's profile by their user ID.
   * @param {string} userId - The UUID of the user from auth.users.
   * @returns {Promise<object>} The user profile data.
   */
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Updates a user's profile.
   * @param {string} userId - The UUID of the user to update.
   * @param {object} profileData - An object with the profile fields to update.
   */
  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },
};