
import React, { useState, useRef } from 'react';

const Documents: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    const res = await fetch('/api/documents');
    const data = await res.json();
    setDocuments(data);
  };

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
    }
    setFiles([]);
    setUploading(false);
    fetchDocuments();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => fileInputRef.current?.click()}
        >
          Select Files
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {files.length > 0 && (
          <span className="ml-2 text-sm text-gray-600">{files.length} file(s) selected</span>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Uploaded Documents</h2>
        <ul className="divide-y divide-gray-200">
          {documents.map(doc => (
            <li key={doc.id} className="py-2 flex items-center justify-between">
              <div>
                <span className="font-medium">{doc.originalName}</span>
                <span className="ml-2 text-xs text-gray-500">({doc.mimetype})</span>
              </div>
              <a
                href={`/api/documents/${doc.id}`}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Documents;
