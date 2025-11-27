
import React, { useState, useRef } from 'react';

const Documents: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [requests, setRequests] = useState<Record<string, { email: string; loading: boolean; signingUrl?: string; error?: string }>>({});
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
      <div className="mb-4">
        <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Check MailHog (email inbox)</a>
      </div>
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
              <div className="ml-4 flex items-center gap-2">
                {!requests[doc.id]?.signingUrl && (
                  <>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={requests[doc.id]?.email || ''}
                      onChange={(e) => setRequests(prev => ({ ...prev, [doc.id]: { ...(prev[doc.id] || { loading:false }), email: e.target.value } }))}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <button
                      onClick={async () => {
                        const email = requests[doc.id]?.email;
                        if (!email) return alert('Enter recipient email');
                        setRequests(prev => ({ ...prev, [doc.id]: { ...(prev[doc.id] || {}), loading: true, error: undefined } }));
                        try {
                          const resp = await fetch('/api/opensign/requests', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ documentId: doc.id, recipientEmail: email })
                          });
                          const json = await resp.json().catch(() => ({}));
                          if (!resp.ok) throw new Error(json?.error || 'Request failed');
                          setRequests(prev => ({ ...prev, [doc.id]: { ...(prev[doc.id] || {}), loading: false, signingUrl: json.signingUrl } }));
                        } catch (e: any) {
                          console.error(e);
                          setRequests(prev => ({ ...prev, [doc.id]: { ...(prev[doc.id] || {}), loading: false, error: e?.message || 'Failed' } }));
                        }
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                      disabled={requests[doc.id]?.loading}
                    >
                      {requests[doc.id]?.loading ? 'Sending...' : 'Request Signature'}
                    </button>
                  </>
                )}

                {requests[doc.id]?.signingUrl && (
                  <div className="flex items-center gap-2">
                    <a href={requests[doc.id].signingUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded text-sm">Open Signing Link</a>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(requests[doc.id]!.signingUrl || '');
                        alert('Signing URL copied to clipboard');
                      }}
                      className="px-3 py-1 bg-gray-200 rounded text-sm"
                    >
                      Copy Link
                    </button>
                  </div>
                )}

                {requests[doc.id]?.error && (
                  <div className="text-red-600 text-sm">{requests[doc.id].error}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Documents;
