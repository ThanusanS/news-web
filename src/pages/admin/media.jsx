import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { storage, BUCKET_ID, ID } from '../../lib/appwrite';
import toast from 'react-hot-toast';
import { FiUpload, FiTrash2, FiCopy, FiImage, FiFile } from 'react-icons/fi';

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => { fetchFiles(); }, []);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await storage.listFiles(BUCKET_ID);
      setFiles(res.files);
    } catch { setFiles([]); }
    setLoading(false);
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      await Promise.all(files.map((f) => storage.createFile(BUCKET_ID, ID.unique(), f)));
      toast.success(`${files.length} file(s) uploaded!`);
      fetchFiles();
    } catch { toast.error('Upload failed. Check file size and type.'); }
    setUploading(false);
    fileInputRef.current.value = '';
  }

  async function handleDelete(fileId) {
    if (!confirm('Delete this file permanently?')) return;
    try {
      await storage.deleteFile(BUCKET_ID, fileId);
      setFiles((prev) => prev.filter((f) => f.$id !== fileId));
      if (selected?.$id === fileId) setSelected(null);
      toast.success('File deleted.');
    } catch { toast.error('Delete failed.'); }
  }

  function getPreviewUrl(fileId) {
    return storage.getFilePreview(BUCKET_ID, fileId, 400, 300).href;
  }

  function getFullUrl(fileId) {
    return storage.getFileView(BUCKET_ID, fileId).href;
  }

  function copyUrl(fileId) {
    navigator.clipboard.writeText(getFullUrl(fileId));
    toast.success('URL copied!');
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  return (
    <AdminLayout title="Media Library" description="Upload and manage images for your articles.">
      <Head><title>Media Library | CeylonUpdates Admin</title></Head>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-stone-300 dark:border-neutral-700 rounded-xl p-8 text-center mb-6 hover:border-accent transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload({ target: { files: e.dataTransfer.files } }); }}
      >
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleUpload} />
        <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 transition-colors">
          <FiUpload size={22} className="text-stone-400 group-hover:text-accent transition-colors" />
        </div>
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-accent">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Uploading...
          </div>
        ) : (
          <>
            <p className="font-semibold text-stone-700 dark:text-neutral-300 mb-1">Drop files here or click to upload</p>
            <p className="text-xs text-stone-400 dark:text-neutral-600">JPG, PNG, WebP, GIF, PDF — max 5MB each</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-12 text-center">
              <FiImage size={40} className="mx-auto mb-3 text-stone-300 dark:text-neutral-700" />
              <p className="text-stone-400 dark:text-neutral-600">No media uploaded yet. Upload your first image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {files.map((file) => (
                <div
                  key={file.$id}
                  onClick={() => setSelected(file)}
                  className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selected?.$id === file.$id ? 'border-accent' : 'border-transparent hover:border-stone-300 dark:hover:border-neutral-600'}`}
                >
                  {file.mimeType?.startsWith('image/') ? (
                    <img src={getPreviewUrl(file.$id)} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-stone-100 dark:bg-neutral-800 flex items-center justify-center">
                      <FiFile size={28} className="text-stone-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(file.$id); }}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected file details */}
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 h-fit">
          {selected ? (
            <>
              <div className="aspect-video rounded-lg overflow-hidden bg-stone-100 dark:bg-neutral-800 mb-4">
                {selected.mimeType?.startsWith('image/') ? (
                  <img src={getPreviewUrl(selected.$id)} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FiFile size={40} className="text-stone-400" /></div>
                )}
              </div>
              <h3 className="font-semibold text-sm text-stone-900 dark:text-neutral-100 mb-3 break-all">{selected.name}</h3>
              <div className="space-y-1.5 text-xs text-stone-500 dark:text-neutral-500 mb-4">
                <div className="flex justify-between"><span>Size</span><span>{formatSize(selected.sizeOriginal)}</span></div>
                <div className="flex justify-between"><span>Type</span><span>{selected.mimeType}</span></div>
                <div className="flex justify-between"><span>ID</span><span className="font-mono text-[10px]">{selected.$id.slice(0, 16)}...</span></div>
              </div>
              <div className="space-y-2">
                <button onClick={() => copyUrl(selected.$id)} className="w-full flex items-center justify-center gap-2 btn-secondary text-xs py-2">
                  <FiCopy size={12} /> Copy URL
                </button>
                <button onClick={() => handleDelete(selected.$id)} className="w-full flex items-center justify-center gap-2 text-xs py-2 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 transition-colors font-semibold">
                  <FiTrash2 size={12} /> Delete File
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-stone-400 dark:text-neutral-600">
              <FiImage size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Select a file to see details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
