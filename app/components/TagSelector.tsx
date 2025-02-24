import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Tag } from '../types';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      
      if (!tag) return;
      if (selectedTags.includes(tag)) {
        setTagInput('');
        return;
      }

      // Check if tag exists
      const existingTag = availableTags.find(t => t.name === tag);
      if (!existingTag) {
        // Create new tag
        try {
          const { data, error } = await supabase
            .from('tags')
            .insert({ name: tag })
            .select()
            .single();

          if (error) throw error;
          setAvailableTags(prev => [...prev, data]);
        } catch (err) {
          setError((err as Error).message);
          return;
        }
      }

      onChange([...selectedTags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags (press Enter or comma to add)"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
        />

        {/* Tag suggestions */}
        {tagInput && filteredTags.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
            <ul className="max-h-48 overflow-auto py-1">
              {filteredTags.map(tag => (
                <li
                  key={tag.id}
                  onClick={() => {
                    onChange([...selectedTags, tag.name]);
                    setTagInput('');
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
} 