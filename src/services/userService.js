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

  // Admin: Get users by a specific role
  async getUsersByRole(role) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .contains('roles', [role])
      .order('full_name');

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
        roles: newRole, // newRole should be an array
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
      old_values: { roles: currentProfile.roles },
      new_values: { roles: newRole },
      notes: notes || `Role changed from ${currentProfile.roles.join(', ')} to ${newRole.join(', ')}`
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
  },

  // Impersonation
  async startImpersonation(userEmail) {
    const { data, error } = await supabase.rpc('set_impersonation', {
      user_email_to_impersonate: userEmail,
    });
    if (error) throw error;
    return data;
  },

  async stopImpersonation() {
    // Setting the variable to null or an empty string effectively clears it.
    const { data, error } = await supabase.rpc('set_impersonation', {
      user_email_to_impersonate: '',
    });
    if (error) throw error;
    return data;
  },

  // Coach/Admin: Get all students for a specific coach
  async getStudentsForCoach(coachId) {
    const { data, error } = await supabase
      .from('coach_student_mappings')
      .select('...user_profiles!fk_student(*)')
      .eq('coach_user_id', coachId);

    if (error) throw error;
    // The data is now directly on the item, so we can just return it.
    return data;
  },

  // Get all users with the 'student' role, for coaches to view
  async getAllStudents() {
    // A user is a student if they exist in the coach_student_mappings table.
    // Step 1: Get all unique student IDs from the mapping table.
    const { data: studentIdsData, error: idsError } = await supabase
      .from('coach_student_mappings')
      .select('student_user_id');

    if (idsError) throw idsError;

    // Create a unique set of IDs.
    const studentIds = [...new Set(studentIdsData.map(mapping => mapping.student_user_id))];

    if (studentIds.length === 0) {
      return []; // No students found
    }

    // Step 2: Fetch the profiles for those student IDs.
    const { data: students, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', studentIds)
      .order('full_name', { ascending: true });

    if (profilesError) throw profilesError;

    return students;
  },

  // Admin: Assign a list of students to a coach
  async assignStudentsToCoach(coachId, studentIds, adminEmail) {
    // Step 1: Remove all existing assignments for this coach to ensure a clean slate.
    const { error: deleteError } = await supabase
      .from('coach_student_mappings')
      .delete()
      .eq('coach_user_id', coachId);

    if (deleteError) throw deleteError;

    // Step 2: If there are new students to assign, insert them.
    if (studentIds && studentIds.length > 0) {
      const newMappings = studentIds.map(studentId => ({
        coach_user_id: coachId,
        student_user_id: studentId,
      }));

      const { error: insertError } = await supabase
        .from('coach_student_mappings')
        .insert(newMappings);

      if (insertError) throw insertError;
    }

    // Optional: Create an audit log entry
    await this.createAuditLog({
      target_user_email: `coach_id:${coachId}`,
      action: 'student_assignment_changed',
      performed_by: adminEmail,
      new_values: { assigned_student_ids: studentIds },
    });
  },

  // Admin: Get all coach-student mappings
  async getAllCoachStudentMappings() {
    const { data, error } = await supabase
      .from('coach_student_mappings')
      .select('coach_user_id, student_user_id');

    if (error) throw error;
    return data;
  },

  // Get a user's profile by their ID
  async getUserProfileById(userId) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is not a critical error here.
      console.error('Error fetching user profile by ID:', error);
      throw error;
    }

    return data;
  },

  // Get all notes for a specific student
  async getNotesForStudent(options) {
    const { studentId, searchTerm, startDate, endDate, page = 0, limit = 10, sortOrder = 'desc', showFavoritesOnly = false } = options;
    if (!studentId) return [];

    let query = supabase
      .from('coach_notes')
      .select('*, author:user_profiles!author_id(full_name, email, roles)', { count: 'exact' })
      .eq('student_id', studentId);

    if (showFavoritesOnly) {
      query = query.eq('is_favorited', true);
    }

    if (searchTerm) {
      // Search in both subject and note content
      query = query.or(`subject.ilike.%${searchTerm}%,note.ilike.%${searchTerm}%`);
    }

    if (startDate) {
      query = query.gte('lesson_date', startDate.toISOString());
    }

    if (endDate) {
      // Add 1 day to the end date to make it inclusive of the selected day
      const inclusiveEndDate = new Date(endDate);
      inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
      query = query.lt('lesson_date', inclusiveEndDate.toISOString());
    }

    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('lesson_date', { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query;
    if (error) throw error;

    return { notes: data, hasMore: to < count - 1 };
  },

  // Save a new note for a student
  async saveNoteForStudent(noteData) {
    const { data, error } = await supabase
      .from('coach_notes')
      .insert(noteData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing note for a student
  async updateNoteForStudent(noteId, noteData) {
    const { data, error } = await supabase
      .from('coach_notes')
      .update({ ...noteData, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle the favorite status of a note
  async toggleNoteFavorite(noteId) {
    const { data: currentNote, error: fetchError } = await supabase
      .from('coach_notes')
      .select('is_favorited')
      .eq('id', noteId)
      .single();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('coach_notes')
      .update({ is_favorited: !currentNote.is_favorited, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a specific note
  async deleteNote(noteId) {
    const { error } = await supabase
      .from('coach_notes')
      .delete()
      .eq('id', noteId);
    if (error) throw error;
  },
};