import { supabase } from '../supabaseClient'; // Corrected import path

/**
 * Fetches all data related to a user's bag, including clubs with their shots,
 * and all bag presets. This is done in a single function to minimize network requests.
 *
 * Supabase PostgREST allows for embedding related tables in a single query.
 * - `clubs(*, shots(*))`: Fetches all clubs and for each club, embeds all its related shots.
 * - `bags(*, bag_clubs(club_id))`: Fetches all bags and for each bag, embeds the IDs of the clubs it contains.
 */
export const getMyBagData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated for getMyBagData.");

  // Fetch clubs and bags in parallel for the current user
  const [clubsResponse, bagsResponse, shotTypesResponse] = await Promise.all([
    supabase
      .from('clubs')
      .select('*, shots(*)') // Fetch all clubs and their related shots
      .eq('user_id', user.id),
    supabase
      .from('bags')
      .select('*, bag_clubs(club_id)') // Fetch all bags and the IDs of clubs in them
      .eq('user_id', user.id),
    supabase
      .from('user_shot_types')
      .select('*')
      .eq('user_id', user.id)
  ]);

  if (clubsResponse.error) {
    console.error('Error fetching clubs:', clubsResponse.error);
    throw clubsResponse.error;
  }
  if (bagsResponse.error) {
    console.error('Error fetching bags:', bagsResponse.error);
    throw bagsResponse.error;
  }
  if (shotTypesResponse.error) {
    console.error('Error fetching shot types:', shotTypesResponse.error);
    throw shotTypesResponse.error;
  }

  const clubs = clubsResponse.data || [];
  const bags = bagsResponse.data || [];
  const shotTypes = shotTypesResponse.data || [];

  // The query for bags returns `bag_clubs` as an array of objects: [{club_id: 1}, {club_id: 2}].
  // We'll transform this into a simple array of IDs: [1, 2] for easier use in the frontend.
  const formattedBags = bags.map(bag => ({
    ...bag,
    clubIds: bag.bag_clubs ? bag.bag_clubs.map(bc => bc.club_id) : [],
  }));

  // Sort clubs by loft or name as a fallback
  const sortedClubs = clubs.sort((a, b) => {
    const loftA = parseInt(a.loft, 10);
    const loftB = parseInt(b.loft, 10);
    return a.name.localeCompare(b.name);
  });

  return {
    myClubs: sortedClubs,
    myBags: formattedBags,
    shotTypes: shotTypes,
  };
};

// --- Club Functions ---

/**
 * Creates a new club for the currently authenticated user.
 * @param {object} clubData - The club data to insert. e.g., { name, type, loft, ... }
 */
export const createClub = async (clubData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('clubs')
    .insert([{ ...clubData, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Creates multiple clubs in a single request for the currently authenticated user.
 * @param {object[]} clubsData - An array of club data objects to insert.
 */
export const bulkCreateClubs = async (clubsData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // Add user_id to each club object
  const clubsToInsert = clubsData.map(club => ({ ...club, user_id: user.id }));

  const { data, error } = await supabase
    .from('clubs')
    .insert(clubsToInsert)
    .select();

  if (error) {
    console.error('Error bulk creating clubs:', error);
    throw error;
  }
  return data;
};
/**
 * Updates an existing club.
 * @param {number} clubId - The ID of the club to update.
 * @param {object} updates - An object with the fields to update.
 */
export const updateClub = async (clubId, updates) => {
  const { data, error } = await supabase
    .from('clubs')
    .update(updates)
    .eq('id', clubId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Deletes a club. RLS ensures users can only delete their own clubs.
 * Cascade delete in the DB will handle related shots and bag_clubs entries.
 * @param {number} clubId - The ID of the club to delete.
 */
export const deleteClub = async (clubId) => {
  const { error } = await supabase.from('clubs').delete().eq('id', clubId);
  if (error) throw error;
};

// --- Shot Functions ---

/**
 * Creates a new shot for a specific club.
 * @param {object} shotData - The shot data to insert. Must include `club_id`.
 */
export const createShot = async (shotData) => {
  const { data, error } = await supabase.from('shots').insert([shotData]).select().single();
  if (error) throw error;
  return data;
};

/**
 * Updates an existing shot.
 * @param {number} shotId - The ID of the shot to update.
 * @param {object} updates - An object with the fields to update.
 */
export const updateShot = async (shotId, updates) => {
  const { data, error } = await supabase.from('shots').update(updates).eq('id', shotId).select().single();
  if (error) throw error;
  return data;
};

/**
 * Deletes a shot.
 * @param {number} shotId - The ID of the shot to delete.
 */
export const deleteShot = async (shotId) => {
  const { error } = await supabase.from('shots').delete().eq('id', shotId);
  if (error) throw error;
};

// --- User Shot Type Functions ---

/**
 * Creates a new custom shot type for the user.
 * @param {object} shotTypeData - e.g., { name, category_ids }
 */
export const createShotType = async (shotTypeData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('user_shot_types')
    .insert([{ ...shotTypeData, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Updates a user's custom shot type.
 * @param {number} shotTypeId - The ID of the shot type to update.
 * @param {object} updates - An object with the fields to update (e.g., { name, category_ids }).
 */
export const updateShotType = async (shotTypeId, updates) => {
  const { data, error } = await supabase
    .from('user_shot_types')
    .update(updates)
    .eq('id', shotTypeId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Deletes a user's custom shot type.
 * @param {number} shotTypeId - The ID of the shot type to delete.
 */
export const deleteShotType = async (shotTypeId) => {
  const { error } = await supabase.from('user_shot_types').delete().eq('id', shotTypeId);
  if (error) throw error;
};

// --- Bag (Preset) Functions ---

/**
 * Creates a new bag preset for the user.
 * @param {object} bagData - The bag data, e.g., { name, tags, is_default }.
 * @param {number[]} clubIds - An array of club IDs to associate with this bag.
 */
export const createBag = async (bagData, clubIds = []) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // If this bag is being set as default, unset any other default bag for this user in a transaction.
  if (bagData.is_default) {
    const { error: unsetError } = await supabase
      .from('bags')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true);

    if (unsetError) throw unsetError;
  }

  // Create the bag
  const { data: newBag, error: bagError } = await supabase
    .from('bags')
    .insert([{ ...bagData, user_id: user.id }])
    .select()
    .single();

  if (bagError) throw bagError;

  // If there are clubs to add, link them in the bag_clubs table
  if (clubIds.length > 0) {
    const links = clubIds.map(club_id => ({ bag_id: newBag.id, club_id }));
    const { error: linkError } = await supabase.from('bag_clubs').insert(links);
    if (linkError) throw linkError;
  }

  return newBag;
};

/**
 * Updates a bag preset's details (name, tags, etc.) and syncs its clubs.
 * @param {number} bagId - The ID of the bag to update.
 * @param {object} updates - The bag data to update, e.g., { name, tags }.
 * @param {number[]} clubIds - The complete list of club IDs that should be in the bag.
 */
export const updateBag = async (bagId, updates, clubIds) => {
  // If this bag is being set as default, unset any other default bag for this user.
  if (updates.is_default) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const { error: unsetError } = await supabase
      .from('bags')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
      .neq('id', bagId); // Don't unset the current bag we are updating

    if (unsetError) throw unsetError;
  }
  // 1. Update the bag details
  const { data: updatedBag, error: updateError } = await supabase
    .from('bags')
    .update(updates)
    .eq('id', bagId)
    .select()
    .single();

  if (updateError) throw updateError;

  // 2. Sync the clubs in the bag_clubs table
  // Delete all existing links for this bag
  const { error: deleteError } = await supabase.from('bag_clubs').delete().eq('bag_id', bagId);
  if (deleteError) throw deleteError;

  // Insert the new links
  if (clubIds && clubIds.length > 0) {
    const links = clubIds.map(club_id => ({ bag_id: bagId, club_id }));
    const { error: insertError } = await supabase.from('bag_clubs').insert(links);
    if (insertError) throw insertError;
  }

  return updatedBag;
};

/**
 * Deletes a bag preset. Cascade delete handles the `bag_clubs` entries.
 * @param {number} bagId - The ID of the bag to delete.
 */
export const deleteBag = async (bagId) => {
  const { error } = await supabase.from('bags').delete().eq('id', bagId);
  if (error) throw error;
};

/**
 * Syncs the bags that a single club belongs to.
 * This is a "delete then insert" operation for simplicity and robustness.
 * @param {number} clubId - The ID of the club to update assignments for.
 * @param {number[]} newBagIds - The complete list of bag IDs this club should be in.
 */
export const syncClubInBags = async (clubId, newBagIds) => {
  // 1. Delete all existing assignments for this club
  const { error: deleteError } = await supabase
    .from('bag_clubs')
    .delete()
    .eq('club_id', clubId);

  if (deleteError) throw deleteError;

  // 2. If there are new assignments, insert them
  if (newBagIds && newBagIds.length > 0) {
    const links = newBagIds.map(bag_id => ({ club_id: clubId, bag_id }));
    const { error: insertError } = await supabase.from('bag_clubs').insert(links);
    if (insertError) throw insertError;
  }
};