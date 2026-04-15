// src/hooks/useCatalog.js
// Shared hook that fetches skills and wilayas from the backend catalog.
// Use this in any page that needs filter options or form dropdowns.
//
// Usage:
//   const { skills, wilayas, loading } = useCatalog();
//   skills  → ['React', 'Python', ...]          (array of name strings)
//   wilayas → ['Algiers', 'Sétif', 'Oran', ...]  (array of name strings)

import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useCatalog() {
  const [skills,  setSkills]  = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        // These are public routes — no auth needed
        const [skillsRes, wilayasRes] = await Promise.all([
          api.get('/catalog/skills'),
          api.get('/catalog/wilayas'),
        ]);

        // Extract just the names for easy use in dropdowns and chips
        setSkills((skillsRes.data.data  || []).map(s => s.name));
        setWilayas((wilayasRes.data.data || []).map(w => w.name));
      } catch (err) {
        console.error('Failed to load catalog:', err.message);
        // Fallback to empty arrays — UI degrades gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  return { skills, wilayas, loading };
}