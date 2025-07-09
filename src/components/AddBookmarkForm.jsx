import React, { useState, useEffect } from 'react';
import { fetchMetadata } from '../utils/fetchMetadata';

const AddBookmarkForm = ({ onAdd, onCancel, initialData }) => {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [favicon, setFavicon] = useState(''); // Add favicon state
    const [tags, setTags] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle initial data if provided (e.g., from bookmarklet)
    useEffect(() => {
        if (initialData) {
            setUrl(initialData.url || '');
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setFavicon(initialData.favicon || ''); // Set favicon from initialData
        }
    }, [initialData]);

    // Handle URL metadata fetching
    const handleUrlBlur = async () => {
        if (!url) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            const metadata = await fetchMetadata(url);
            if (!title) setTitle(metadata.title || '');
            if (!description) setDescription(metadata.description || '');
        } catch (err) {
            setError('Failed to fetch URL metadata');
            console.error('Error fetching metadata:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!url) {
            setError('URL is required');
            return;
        }

        const bookmark = {
            url: url.trim(),
            title: title.trim(),
            description: description.trim(),
            favicon: favicon.trim(), // Include favicon in bookmark object
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            visibility
        };

        try {
            await onAdd(bookmark);
            // Reset form
            setUrl('');
            setTitle('');
            setDescription('');
            setTags('');
            setVisibility('private');
            setError('');
            onCancel(); // Close the form after successful submission
        } catch (err) {
            setError('Failed to add bookmark');
            console.error('Error adding bookmark:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow">
            {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            
            <div>
                <label className="block text-base font-medium text-gray-700 pb-1">
                    URL
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={handleUrlBlur}
                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-base font-medium text-gray-700 pb-1">
                    Title
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                    />
                </label>
            </div>

            <div>
                <label className="block text-base font-medium text-gray-700 pb-1">
                    Description
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        rows="3"
                    />
                </label>
            </div>

            <div>
                <label className="block text-base font-medium text-gray-700 pb-1">
                    Tags (comma-separated)
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        placeholder="tag1, tag2, tag3"
                    />
                </label>
            </div>

            <div>
                <label className="block text-base font-medium text-gray-700 pb-1">
                    Visibility
                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                    >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                    </select>
                </label>
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isLoading ? 'Adding...' : 'Add Bookmark'}
                </button>
            </div>
        </form>
    );
};

export default AddBookmarkForm;
