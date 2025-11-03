// User management service
import { supabase } from '../supabaseClient';

export const userService = {
  // Get current user's profile
  async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Create or update user profile
  async upsertUserProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        email: user.email,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id', // This tells Supabase to UPDATE if a row with this user_id already exists.
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: Get all users
  async getAllUsers(filters = {}) {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Admin: Update user profile
  async updateUserProfile(userId, updates, adminEmail) {
    // Get current profile for audit log
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Update profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Create audit log entry
    await this.createAuditLog({
      target_user_email: currentProfile.email,
      action: 'profile_updated',
      performed_by: adminEmail,
      old_values: currentProfile,
      new_values: data,
      notes: `Profile updated by admin`
    });

    return data;
  },

  // Admin: Change user role
  async changeUserRole(userId, newRole, adminEmail, notes = '') {
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await this.createAuditLog({
      target_user_email: currentProfile.email,
      action: 'role_changed',
      performed_by: adminEmail,
      old_values: { role: currentProfile.role },
      new_values: { role: newRole },
      notes: notes || `Role changed from ${currentProfile.role} to ${newRole}`
    });

    return data;
  },

  // Admin: Suspend/Activate user
  async changeUserStatus(userId, newStatus, adminEmail, notes = '') {
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await this.createAuditLog({
      target_user_email: currentProfile.email,
      action: 'status_changed',
      performed_by: adminEmail,
      old_values: { status: currentProfile.status },
      new_values: { status: newStatus },
      notes: notes || `Status changed from ${currentProfile.status} to ${newStatus}`
    });

    return data;
  },

  // Admin: Send invitation
  async sendInvitation(email, role, adminEmail) {
    // Use Supabase's built-in crypto to generate a UUID for the token
    const { data: invitationToken, error: uuidError } = await supabase.rpc('uuid_generate_v4');
    if (uuidError || !invitationToken) throw new Error('Failed to generate invitation token.');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data, error } = await supabase
      .from('user_invitations')
      .insert({
        email: email.toLowerCase(),
        invited_by: adminEmail,
        role,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      invitation_link: `${window.location.origin}/invite/${invitationToken}`
    };
  },

  // Get pending invitations
  async getPendingInvitations() {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Accept invitation
  async acceptInvitation(invitationToken) {
    const { data: invitation, error: inviteError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_token', invitationToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError) throw new Error('Invalid or expired invitation');

    // Update invitation status
    const { error: updateError } = await supabase
      .from('user_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateError) throw updateError;

    return invitation;
  },

  // Create audit log entry
  async createAuditLog(logData) {
    const { error } = await supabase
      .from('user_audit_log')
      .insert(logData);

    if (error) throw error;
  },

  // Get audit logs
  async getAuditLogs(filters = {}, limit = 100) {
    let query = supabase
      .from('user_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters.target_user_email) {
      query = query.eq('target_user_email', filters.target_user_email);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.performed_by) {
      query = query.eq('performed_by', filters.performed_by);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Check if user has admin privileges
  async isAdmin() {
    const profile = await this.getCurrentUserProfile();
    return profile && ['admin', 'super_admin'].includes(profile.role);
  },

  // Check if user has super admin privileges
  async isSuperAdmin() {
    const profile = await this.getCurrentUserProfile();
    return profile && profile.role === 'super_admin';
  }
};