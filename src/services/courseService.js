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
  async getCourseWithTeeBoxes(courseId, teeBox) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError) throw courseError;

    const { data: teeBoxData, error: teeBoxError } = await supabase
      .from('course_tee_boxes')
      .select('*')
      .eq('course_id', courseId)
      .eq('tee_box', teeBox)
      .order('hole_number');
    
    if (teeBoxError) throw teeBoxError;

    return {
      ...course,
      holes: teeBoxData
    };
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
      par: hole.par,
      distance: hole.distance,
      yards_or_meters_unit: yardsOrMeters,
      last_updated_by: userEmail
    }));

    const { data, error } = await supabase
      .from('course_tee_boxes')
      .insert(teeBoxInserts)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Check if course and tee box combination exists
  async courseAndTeeBoxExists(courseId, teeBox) {
    const { data, error } = await supabase
      .from('course_tee_boxes')
      .select('hole_number')
      .eq('course_id', courseId)
      .eq('tee_box', teeBox)
      .limit(1);
    
    if (error) throw error;
    return data.length > 0;
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