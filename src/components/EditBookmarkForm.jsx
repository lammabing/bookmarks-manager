import React, { useState, useEffect } from 'react';

const EditBookmarkForm = ({ bookmark, onSave, onCancel }) => {
    const [url, setUrl] = useState(bookmark.url);
    const [title, setTitle] = useState(bookmark.title);
    const [description, setDescription] = useState(bookmark.description);
    const [tags, setTags] = useState(bookmark.tags.join(','));
    const [visibility, setVisibility] = useState(bookmark.visibility);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...bookmark,
            url,
            title,
            description,
            tags: tags.split(',').map((tag) => tag.trim()),
            visibility
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <input
                type="url"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
            />
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg"
            />
            <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2 border rounded-lg"
            />
            <div className="flex items-center space-x-4">
                <span>Visibility:</span>
                <div className="flex space-x-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="visibility"
                            value="private"
                            checked={visibility === 'private'}
                            onChange={() => setVisibility('private')}
                            className="mr-1"
                        />
                        Private
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="visibility"
                            value="public"
                            checked={visibility === 'public'}
                            onChange={() => setVisibility('public')}
                            className="mr-1"
                        />
                        Public
                    </label>
                </div>
            </div>
            <div className="flex space-x-2">
                <button type="submit" className="w-full p-2 bg-green-500 text-white rounded-lg">
                    Save
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full p-2 bg-gray-500 text-white rounded-lg"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditBookmarkForm;
