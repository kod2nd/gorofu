// Course management service
import { supabase } from '../supabaseClient';

export const courseService = {
  // Search courses by name (fuzzy matching), with an optional country filter.
  async searchCourses(searchTerm = '', country = null) {
    let query = supabase
      .from('courses')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      .order('name');
    
    // Only apply the country filter if a country is provided.
    if (country) {
      query = query.eq('country', country);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async searchCoursesWithStats(searchTerm, countryFilter) {
    const { data, error } = await supabase.rpc('search_courses_with_stats', {
      search_term: searchTerm,
      country_filter: countryFilter,
    });

    if (error) {
      console.error('Error searching courses with stats:', error);
      throw error;
    }

    return data;
  },

  // Get all courses in a country
  async getCoursesByCountry(country = 'Singapore') {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('country', country)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Create a new course
  async createCourse(courseData, userEmail) {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        name: courseData.name,
        country: courseData.country || 'Singapore',
        city: courseData.city,
        created_by: userEmail
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get course with tee box data
  async getCourseWithTeeBoxes(roundId, userEmail) {
    // First, get the round to find out the course_id and tee_box
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('course_id, tee_box')
      .eq('id', roundId)
      .eq('user_email', userEmail)
      .single();

    if (roundError) throw roundError;

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', round.course_id)
      .single();
    
    if (courseError) throw courseError;

    const { data: teeBoxData, error: teeBoxError } = await supabase
      .from('course_tee_boxes')
      .select('*')
      .eq('course_id', round.course_id)
      .eq('tee_box', round.tee_box)
      .order('hole_number');
    
    if (teeBoxError) throw teeBoxError;

    return {
      ...course,
      holes: teeBoxData
    };
  },

  // Get only the tee box hole data for a course
  async getTeeBoxData(courseId, teeBox) {
    if (!courseId || !teeBox) return [];

    const { data, error } = await supabase
      .from('course_tee_boxes')
      .select('hole_number, par, distance, yards_or_meters_unit')
      .eq('course_id', courseId)
      .eq('tee_box', teeBox)
      .order('hole_number');

    if (error) throw error;
    return data;
  },

  // Get available tee boxes for a course
  async getCourseTeeBoxes(courseId) {
    const { data, error } = await supabase
      .from('course_tee_boxes')
      .select('tee_box')
      .eq('course_id', courseId)
      .order('tee_box');
    
    if (error) throw error;
    
    // Return unique tee boxes
    return [...new Set(data.map(item => item.tee_box))];
  },

   // Get a course and all its tee box data, formatted for the CourseForm
  async getCourseForEditing(courseId) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    const { data: teeBoxData, error: teeBoxError } = await supabase
      .from('course_tee_boxes')
      .select('*')
      .eq('course_id', courseId);

    if (teeBoxError) throw teeBoxError;

    // Transform the data into the "hole-centric" format the form expects
    const tee_boxes = [...new Map(teeBoxData.map(item => [item.tee_box, { name: item.tee_box, yards_or_meters_unit: item.yards_or_meters_unit }])).values()];

    const holes = Array.from({ length: 18 }, (_, i) => {
      const hole_number = i + 1;
      const distances = {};
      const par_overrides = {};
      let defaultPar = '';

      teeBoxData.forEach(tbh => {
        if (tbh.hole_number === hole_number) {
          distances[tbh.tee_box] = tbh.distance;
          // Assume the first par found is the default
          if (!defaultPar) defaultPar = tbh.par;
          // If a par differs from the default, it's an override
          if (tbh.par !== defaultPar) {
            par_overrides[tbh.tee_box] = tbh.par;
          }
        }
      });

      return { hole_number, par: defaultPar, distances, par_overrides };
    });

    return { ...course, tee_boxes, holes: holes };
  },

  // Create tee box data for a course
  async createTeeBoxData(courseId, teeBox, holesData, userEmail, yardsOrMeters = 'yards') {
    const teeBoxInserts = holesData.map(hole => ({
      course_id: courseId,
      tee_box: teeBox,
      hole_number: hole.hole_number,
      par: hole.par === '' ? null : parseInt(hole.par, 10),
      distance: hole.distance === '' ? null : parseInt(hole.distance, 10),
      yards_or_meters_unit: yardsOrMeters,
      last_updated_by: userEmail
    }));

    const { data, error } = await supabase
      .from('course_tee_boxes')
      .upsert(teeBoxInserts, { onConflict: 'course_id, tee_box, hole_number' })
      .select();
    
    if (error) throw error;
    return data;
  },

  // Create change request for course data
  async createChangeRequest(changeRequestData, userEmail) {
    const { data, error } = await supabase
      .from('course_change_requests')
      .insert({
        ...changeRequestData,
        requested_by: userEmail
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get countries with courses
  async getCountriesWithCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('country')
      .order('country');
    
    if (error) throw error;
    
    // Return unique countries
    return [...new Set(data.map(item => item.country))];
  },
    // Save a course and all its tee box data
  async saveCourseWithTeeBoxes(courseData, userEmail) {
    // Step 1: Upsert the course itself to get an ID
    const { data: savedCourse, error: courseError } = await supabase
      .from('courses')
      .upsert({
        id: courseData.id, // Will be null for new courses
        name: courseData.name,
        country: courseData.country,
        city: courseData.city,
        created_by: userEmail,
        is_verified: false, // Or handle verification logic
      })
      .select()
      .single();

    if (courseError) throw courseError;

    // Step 2: Prepare all hole data for all tee boxes
    const allHolesData = courseData.tee_boxes.flatMap(teeBox =>
      teeBox.holes
        // Ensure both par and distance have valid, non-empty values before attempting to save.
        .filter(hole => 
          (hole.par !== null && hole.par !== '') && 
          (hole.distance !== null && hole.distance !== ''))
        .map(hole => ({
          course_id: savedCourse.id,
          tee_box: teeBox.name,
          hole_number: hole.hole_number,
          par: parseInt(hole.par, 10),
          distance: parseInt(hole.distance, 10),
          yards_or_meters_unit: teeBox.yards_or_meters_unit,
          last_updated_by: userEmail,
        }))
    );

    // Step 3: Upsert the new, complete set of tee box data.
    // `upsert` will handle both creating new holes and updating existing ones
    // based on the unique constraint defined in `onConflict`.
    const { error: holesError } = await supabase
      .from('course_tee_boxes')
      .upsert(allHolesData, { onConflict: 'course_id, tee_box, hole_number' });

    if (holesError) throw holesError;

    return savedCourse;
  },

  // Delete a course
  async deleteCourse(courseId, adminEmail) {
    // The 'rounds' table has a foreign key to 'courses'. Deleting a course
    // that has associated rounds will fail unless cascading deletes are enabled
    // or the rounds are deleted first. The database schema has been updated
    // to handle this with ON DELETE CASCADE.
    const { error } = await supabase.from('courses').delete().eq('id', courseId);

    if (error) throw error;
  },
};
