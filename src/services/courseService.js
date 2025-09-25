// Course management service
import { supabase } from '../supabaseClient';

export const courseService = {
  // Search courses by country and name (fuzzy matching)
  async searchCourses(searchTerm = '', country = 'Singapore') {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('country', country)
      .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) throw error;
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
      .select('hole_number, par, distance')
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
  }
};