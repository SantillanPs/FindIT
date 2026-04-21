/**
 * Lost Item AI Service
 * Handles the analysis and synthesis of lost item descriptions.
 */

import { supabase } from './supabase';

/**
 * Analyzes a raw narrative description to extract metadata and generate a clean synthesis.
 * @param {string} description The raw narrative from the student.
 * @returns {Promise<Object>} The analysis result including extracted fields and synthesis.
 */
export const analyzeLostNarrative = async (description) => {
    if (!description || description.length < 10) {
        throw new Error('Description is too short to analyze.');
    }

    try {
        console.group('%c🚀 [Narrative-First] AI INTAKE INITIATED', 'background: #1e293b; color: #38bdf8; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
        console.log('%cStory Analysis starting...', 'color: #94a3b8; font-style: italic;');
        console.log('Payload Length:', description.length);
        
        const { data, error } = await supabase.functions.invoke('analyze-lost-description', {
            body: { description }
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
            console.groupEnd();
        }
        
        console.groupEnd();

        if (error && !data) throw error; // Real network error

        return {
            category: data?.category || 'Other',
            attributes: data?.attributes || {},
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
            location_hints: [],
            timeframe_hint: null,
            synthesized_description: description,
            original_description: description,
            error: err.message
        };
    }
};
