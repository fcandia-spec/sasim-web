import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Inicio.css'; // Assuming you have your CSS for mobile-first styles here

const supabaseUrl = 'https://xyzcompany.supabase.co'; // Your Supabase URL
const supabaseAnonKey = 'your-anon-key'; // Your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Inicio = () => {
    const [courses, setCourses] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingBlogPosts, setLoadingBlogPosts] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [errorBlogPosts, setErrorBlogPosts] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                const { data, error } = await supabase.from('courses').select('*').limit(7);
                if (error) throw error;
                setCourses(data);
            } catch (error) {
                setErrorCourses(error.message);
            } finally {
                setLoadingCourses(false);
            }
        };

        const fetchBlogPosts = async () => {
            try {
                setLoadingBlogPosts(true);
                const { data, error } = await supabase.from('blog_posts').select('*').limit(4);
                if (error) throw error;
                setBlogPosts(data);
            } catch (error) {
                setErrorBlogPosts(error.message);
            } finally {
                setLoadingBlogPosts(false);
            }
        };

        fetchCourses();
        fetchBlogPosts();
    }, []);

    return (
        <div className="inicio">
            <h1>Recent Courses</h1>
            {loadingCourses ? (<p>Loading courses...</p>) : errorCourses ? (<p>Error loading courses: {errorCourses}</p>) : (
                <div className="scroll-container">
                    {courses.map(course => (
                        <div key={course.id} className="card">
                            <div className="icon">🏷️</div> {/* Placeholder for actual icon */}
                            <h3>{course.title}</h3>
                        </div>
                    ))}
                </div>
            )}
            <button className="cta-button">Explorar Cursos</button>

            <h1>Recent Blog Posts</h1>
            {loadingBlogPosts ? (<p>Loading blog posts...</p>) : errorBlogPosts ? (<p>Error loading blog posts: {errorBlogPosts}</p>) : (
                <div className="scroll-container">
                    {blogPosts.map(post => (
                        <div key={post.id} className="card">
                            <div className="icon">📝</div> {/* Placeholder for actual icon */}
                            <h3>{post.title}</h3>
                        </div>
                    ))}
                </div>
            )}
            <button className="cta-button">Leer Blog</button>
        </div>
    );
};

export default Inicio;