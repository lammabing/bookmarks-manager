import React, { useEffect, useState } from 'react';
import {
  fetchExtensions,
  addExtension,
  updateExtension,
  deleteExtension
} from '../utils/extensionApi';

const EXTENSION_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'comment', label: 'Comment' },
  { value: 'image', label: 'Image (URL)' },
  { value: 'custom', label: 'Custom (JSON)' }
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
    <form className="mb-4 p-2 border rounded" onSubmit={handleSubmit}>
      <div className="flex gap-2 mb-2">
        <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1">
          {EXTENSION_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder={type === 'image' ? 'Image URL' : type === 'custom' ? 'Custom JSON' : 'Content'}
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="Metadata (JSON, optional)"
          value={metadata}
          onChange={e => setMetadata(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded" disabled={loading}>
          Add
        </button>
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

  return (
    <div className="border rounded p-2 mb-2 bg-gray-50">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm text-gray-700">{ext.type}</span>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-blue-500 text-xs">{editing ? 'Cancel' : 'Edit'}</button>
          <button onClick={() => onDelete(ext._id)} className="text-red-500 text-xs">Delete</button>
        </div>
      </div>
      {editing ? (
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={metadata}
            onChange={e => setMetadata(e.target.value)}
            placeholder="Metadata (JSON, optional)"
          />
          <button onClick={handleUpdate} className="bg-green-500 text-white px-2 py-1 rounded text-xs" disabled={loading}>
            Save
          </button>
        </div>
      ) : (
        <div className="mt-1 text-sm">
          {ext.type === 'image' ? (
            <img src={ext.content} alt="Extension" className="max-h-32 max-w-full rounded" />
          ) : (
            <span>{typeof ext.content === 'object' ? JSON.stringify(ext.content) : ext.content}</span>
          )}
          {ext.metadata && (
            <div className="text-xs text-gray-500 mt-1">Metadata: {JSON.stringify(ext.metadata)}</div>
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
    // eslint-disable-next-line
  }, [bookmarkId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this extension?')) return;
    await deleteExtension(id);
    loadExtensions();
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Extensions</h3>
      <ExtensionForm bookmarkId={bookmarkId} onAdd={loadExtensions} />
      {loading ? (
        <div>Loading extensions...</div>
      ) : extensions.length === 0 ? (
        <div className="text-gray-500">No extensions yet.</div>
      ) : (
        extensions.map(ext => (
          <ExtensionItem
            key={ext._id}
            ext={ext}
            onDelete={handleDelete}
            onUpdate={loadExtensions}
          />
        ))
      )}
    </div>
  );
}
