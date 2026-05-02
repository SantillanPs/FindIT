/**
 * Lost Item AI Service
 * Handles the analysis and synthesis of lost item descriptions.
 */

import { supabase } from './supabase';

/**
 * Analyzes a raw narrative description to extract metadata and generate a clean synthesis.
 * @param {string} description The raw narrative from the student.
 * @param {string} photoUrl Primary photo URL.
 * @param {Array} secondaryPhotos List of secondary photo URLs.
 * @returns {Promise<Object>} The analysis result including extracted fields and synthesis.
 */
export const analyzeLostNarrative = async (description, photoUrl = null, secondaryPhotos = []) => {
    if (!description || description.length < 10) {
        throw new Error('Description is too short to analyze.');
    }

    try {
        console.group('%c🚀 [Narrative-First] AI INTAKE INITIATED', 'background: #1e293b; color: #38bdf8; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
        console.log('%cStory Analysis starting...', 'color: #94a3b8; font-style: italic;');
        console.log('Payload Length:', description.length);
        console.log('Has Image:', !!photoUrl);
        
        const { data, error } = await supabase.functions.invoke('analyze-lost-description', {
            body: { 
                description,
                photo_url: photoUrl,
                secondary_photos: secondaryPhotos
            }
        });

        if (error || data?.error) {
            console.group('%c❌ ANALYSIS FAILURE DETECTED', 'color: #f43f5e; font-weight: bold;');
            console.error('System Message:', error?.message || data?.error);
            if (data?.debug) console.table(data.debug);
            console.log('%cFALLBACK ACTIVATED: Routing original narrative to Step 2.', 'color: #fbbf24; font-weight: bold;');
            console.groupEnd();
        } else {
            console.group('%c✨ SYNTHESIS SUCCESSFUL', 'color: #22c55e; font-weight: bold;');
            console.log('Detected Category:', data.category);
            console.log('Attributes Found:', data.attributes);
            console.log('Matching DNA:', data.ai_matching_dna);
            console.groupEnd();
        }
        
        console.groupEnd();

        if (error && !data) throw error; // Real network error

        // Normalization Helper to map AI variations to strict master list
        const normalizeCategory = (cat) => {
            if (!cat) return 'Other';
            const masterList = [
                'Cellphone', 'Laptop', 'Tablet', 'ID Card', 'Wallet', 
                'Bag / Backpack', 'Keys', 'Headphones / Earbuds', 'Watch / Wearable', 
                'Water Bottle', 'Eyewear', 'Book', 'Notebook', 'Stationery', 
                'Clothing', 'Accessories', 'Electronics Accessories', 
                'Computer Peripheral', 'Umbrella', 'Other'
            ];
            
            const lowerCat = cat.toLowerCase();
            
            // Direct matches
            const match = masterList.find(m => m.toLowerCase() === lowerCat);
            if (match) return match;

            // Common variations
            if (lowerCat.includes('bag')) return 'Bag / Backpack';
            if (lowerCat.includes('phone') || lowerCat.includes('mobile')) return 'Cellphone';
            if (lowerCat.includes('headphone') || lowerCat.includes('earbud')) return 'Headphones / Earbuds';
            if (lowerCat.includes('id') || lowerCat.includes('identification')) return 'ID Card';
            if (lowerCat.includes('glass') || lowerCat.includes('eye')) return 'Eyewear';
            if (lowerCat.includes('watch') || lowerCat.includes('wearable')) return 'Watch / Wearable';
            if (lowerCat.includes('computer') || lowerCat.includes('peripheral')) return 'Computer Peripheral';
            if (lowerCat.includes('electronics')) return 'Electronics Accessories';
            
            return 'Other';
        };

        return {
            category: normalizeCategory(data?.category),
            suggested_title: data?.suggested_title || null,
            attributes: data?.attributes || {},
            ai_matching_dna: data?.ai_matching_dna || { tags: [] },
            location_hints: data?.location_hints || [],
            timeframe_hint: data?.timeframe_hint || null,
            synthesized_description: data?.synthesized_description || description,
            original_description: description
        };
    } catch (err) {
        console.error('%c[CRITICAL] Service Layer Exception:', 'color: white; background: red; padding: 2px 4px;', err);
        return {
            category: 'Other',
            attributes: {},
            ai_matching_dna: { tags: [] },
            location_hints: [],
            timeframe_hint: null,
            synthesized_description: description,
            original_description: description,
            error: err.message
        };
    }
};

