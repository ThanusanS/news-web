import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { storage, BUCKET_ID, ID, getFilePreviewUrl, getFileViewUrl } from '../../lib/appwrite';
import toast from 'react-hot-toast';
import { FiUpload, FiTrash2, FiCopy, FiImage, FiFile } from 'react-icons/fi';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

function isAllowedMediaType(file) {
  const type = String(file?.type || '').toLowerCase();
  return type.startsWith('image/') || type.startsWith('video/') || type === 'application/pdf';
}

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await storage.listFiles(BUCKET_ID);
      setFiles(res.files);
    } catch {
      setFiles([]);
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const invalidType = files.filter((f) => !isAllowedMediaType(f));
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);

    if (invalidType.length) {
      toast.error('Only images, videos, and PDF files are allowed.');
      fileInputRef.current.value = '';
      return;
    }
    if (oversized.length) {
      toast.error('Each file must be 20MB or less.');
      fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      await Promise.all(files.map((f) => storage.createFile(BUCKET_ID, ID.unique(), f)));
      toast.success(`${files.length} file(s) uploaded!`);
      fetchFiles();
    } catch {
      toast.error('Upload failed. Check file size and type.');
    }
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
    } catch {
      toast.error('Delete failed.');
    }
  }

  function getPreviewUrl(fileId) {
    return getFilePreviewUrl(fileId, 400, 300);
  }

  function getFullUrl(fileId) {
    return getFileViewUrl(fileId);
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
      <Head>
        <title>Media Library | CeylonUpdates Admin</title>
      </Head>

      {/* Upload area */}
      <div
        className="group mb-6 cursor-pointer rounded-xl border-2 border-dashed border-stone-300 p-8 text-center transition-colors hover:border-accent dark:border-neutral-700"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload({ target: { files: e.dataTransfer.files } });
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={handleUpload}
        />
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 transition-colors group-hover:bg-accent/10 dark:bg-neutral-800">
          <FiUpload
            size={22}
            className="text-stone-400 transition-colors group-hover:text-accent"
          />
        </div>
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-accent">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Uploading...
          </div>
        ) : (
          <>
            <p className="mb-1 font-semibold text-stone-700 dark:text-neutral-300">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-stone-400 dark:text-neutral-600">
              JPG, PNG, WebP, GIF, MP4, WebM, PDF - max 20MB each
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-stone-100 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <FiImage size={40} className="mx-auto mb-3 text-stone-300 dark:text-neutral-700" />
              <p className="text-stone-400 dark:text-neutral-600">
                No media uploaded yet. Upload your first image above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {files.map((file) => (
                <div
                  key={file.$id}
                  onClick={() => setSelected(file)}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${selected?.$id === file.$id ? 'border-accent' : 'border-transparent hover:border-stone-300 dark:hover:border-neutral-600'}`}
                >
                  {file.mimeType?.startsWith('image/') ? (
                    <img
                      src={getPreviewUrl(file.$id)}
                      alt={file.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : file.mimeType?.startsWith('video/') ? (
                    <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-neutral-800">
                      <span className="rounded bg-black/75 px-2 py-1 text-[10px] font-bold text-white">
                        VIDEO
                      </span>
                    </div>
                  ) : file.mimeType === 'application/pdf' ? (
                    <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-neutral-800">
                      <span className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
                        PDF
                      </span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-neutral-800">
                      <FiFile size={28} className="text-stone-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.$id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
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
        <div className="h-fit rounded-xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          {selected ? (
            <>
              <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-stone-100 dark:bg-neutral-800">
                {selected.mimeType?.startsWith('image/') ? (
                  <img
                    src={getPreviewUrl(selected.$id)}
                    alt={selected.name}
                    className="h-full w-full object-cover"
                  />
                ) : selected.mimeType?.startsWith('video/') ? (
                  <video
                    src={getFullUrl(selected.$id)}
                    controls
                    className="h-full w-full object-cover"
                  >
                    <track kind="captions" label="Captions" />
                  </video>
                ) : selected.mimeType === 'application/pdf' ? (
                  <iframe
                    title={selected.name}
                    src={getFullUrl(selected.$id)}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FiFile size={40} className="text-stone-400" />
                  </div>
                )}
              </div>
              <h3 className="mb-3 break-all text-sm font-semibold text-stone-900 dark:text-neutral-100">
                {selected.name}
              </h3>
              <div className="mb-4 space-y-1.5 text-xs text-stone-500 dark:text-neutral-500">
                <div className="flex justify-between">
                  <span>Size</span>
                  <span>{formatSize(selected.sizeOriginal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span>{selected.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="font-mono text-[10px]">{selected.$id.slice(0, 16)}...</span>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => copyUrl(selected.$id)}
                  className="btn-secondary flex w-full items-center justify-center gap-2 py-2 text-xs"
                >
                  <FiCopy size={12} /> Copy URL
                </button>
                <button
                  onClick={() => handleDelete(selected.$id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30"
                >
                  <FiTrash2 size={12} /> Delete File
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-stone-400 dark:text-neutral-600">
              <FiImage size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Select a file to see details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
