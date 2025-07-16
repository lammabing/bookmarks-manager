import React, { useEffect, useState } from 'react';
import {
  fetchExtensions,
  addExtension,
  updateExtension,
  deleteExtension
} from '../utils/extensionApi';

const EXTENSION_TYPES = [
  { value: 'note', label: 'Note', icon: '📝' },
  { value: 'comment', label: 'Comment', icon: '💬' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'custom', label: 'Custom', icon: '⚙️' }
];

function ExtensionForm({ bookmarkId, onAdd }) {
  const [type, setType] = useState('note');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let parsedContent = content;
      if (type === 'custom') {
        parsedContent = JSON.parse(content);
      }
      await addExtension(bookmarkId, {
        type,
        content: parsedContent,
        metadata: metadata ? JSON.parse(metadata) : {}
      });
      setContent('');
      setMetadata('');
      setType('note');
      onAdd();
    } catch (err) {
      alert('Error adding extension: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mb-6" onSubmit={handleSubmit}>
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Extension</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {EXTENSION_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            className="md:col-span-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={type === 'image' ? 'Image URL' : type === 'custom' ? 'Custom JSON' : 'Content'}
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
        
        {type === 'custom' && (
          <input
            type="text"
            className="mt-3 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Metadata (JSON, optional)"
            value={metadata}
            onChange={e => setMetadata(e.target.value)}
          />
        )}
      </div>
    </form>
  );
}

function ExtensionItem({ ext, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(
    typeof ext.content === 'object' ? JSON.stringify(ext.content) : ext.content
  );
  const [metadata, setMetadata] = useState(
    ext.metadata ? JSON.stringify(ext.metadata) : ''
  );
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateExtension(ext._id, {
        type: ext.type,
        content: ext.type === 'custom' ? JSON.parse(content) : content,
        metadata: metadata ? JSON.parse(metadata) : {}
      });
      setEditing(false);
      onUpdate();
    } catch (err) {
      alert('Error updating extension: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getExtensionIcon = (type) => {
    return EXTENSION_TYPES.find(t => t.value === type)?.icon || '📄';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="text-lg mr-2">{getExtensionIcon(ext.type)}</span>
          <span className="font-semibold text-gray-700 capitalize">{ext.type}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setEditing(!editing)} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Delete this extension?')) {
                onDelete(ext._id);
              }
            }} 
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Metadata (JSON, optional)"
            value={metadata}
            onChange={e => setMetadata(e.target.value)}
          />
          <button 
            onClick={handleUpdate} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {ext.type === 'image' ? (
            <img 
              src={ext.content} 
              alt="Extension" 
              className="max-h-48 max-w-full rounded-lg border border-gray-200 object-contain"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          ) : (
            <div className="text-gray-700 text-sm leading-relaxed">
              {typeof ext.content === 'object' ? (
                <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(ext.content, null, 2)}
                </pre>
              ) : (
                <p>{ext.content}</p>
              )}
            </div>
          )}
          
          {ext.metadata && Object.keys(ext.metadata).length > 0 && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Metadata:</span>
              <pre className="bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                {JSON.stringify(ext.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookmarkExtensions({ bookmarkId }) {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExtensions = async () => {
    setLoading(true);
    try {
      const data = await fetchExtensions(bookmarkId);
      setExtensions(data);
    } catch (err) {
      setExtensions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExtensions();
  }, [bookmarkId]);

  const handleDelete = async (id) => {
    await deleteExtension(id);
    loadExtensions();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Extensions</h3>
        <span className="text-sm text-gray-500">
          {extensions.length} {extensions.length === 1 ? 'extension' : 'extensions'}
        </span>
      </div>
      
      <ExtensionForm bookmarkId={bookmarkId} onAdd={loadExtensions} />
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading extensions...</p>
        </div>
      ) : extensions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📄</div>
          <p className="text-gray-500">No extensions yet. Add one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {extensions.map(ext => (
            <ExtensionItem
              key={ext._id}
              ext={ext}
              onDelete={handleDelete}
              onUpdate={loadExtensions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
