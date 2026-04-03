import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import ReactCrop from 'react-image-crop';

const TOOLBAR_BUTTONS = [
  { label: 'B', title: 'Bold', action: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive('bold') },
  { label: 'I', title: 'Italic', action: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive('italic') },
  { label: 'S', title: 'Strike', action: (e) => e.chain().focus().toggleStrike().run(), active: (e) => e.isActive('strike') },
  { label: 'H2', title: 'Heading 2', action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e) => e.isActive('heading', { level: 2 }) },
  { label: 'H3', title: 'Heading 3', action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e) => e.isActive('heading', { level: 3 }) },
  { label: '¶', title: 'Paragraph', action: (e) => e.chain().focus().setParagraph().run(), active: (e) => e.isActive('paragraph') },
  { label: '•', title: 'Bullet list', action: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive('bulletList') },
  { label: '1.', title: 'Ordered list', action: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive('orderedList') },
  { label: '"', title: 'Blockquote', action: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive('blockquote') },
  { label: '</>', title: 'Code block', action: (e) => e.chain().focus().toggleCodeBlock().run(), active: (e) => e.isActive('codeBlock') },
  { label: '—', title: 'Horizontal rule', action: (e) => e.chain().focus().setHorizontalRule().run(), active: () => false },
  { label: '↩', title: 'Undo', action: (e) => e.chain().focus().undo().run(), active: () => false },
  { label: '↪', title: 'Redo', action: (e) => e.chain().focus().redo().run(), active: () => false },
];

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => ({ 'data-align': attributes.align }),
      },
      crop: {
        default: 'none',
        parseHTML: (element) => element.getAttribute('data-crop') || 'none',
        renderHTML: (attributes) => ({ 'data-crop': attributes.crop }),
      },
      size: {
        default: 'full',
        parseHTML: (element) => element.getAttribute('data-size') || 'full',
        renderHTML: (attributes) => ({ 'data-size': attributes.size }),
      },
      shape: {
        default: 'rounded',
        parseHTML: (element) => element.getAttribute('data-shape') || 'rounded',
        renderHTML: (attributes) => ({ 'data-shape': attributes.shape }),
      },
      frame: {
        default: 'none',
        parseHTML: (element) => element.getAttribute('data-frame') || 'none',
        renderHTML: (attributes) => ({ 'data-frame': attributes.frame }),
      },
      clipTop: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute('data-clip-top') || 0),
        renderHTML: (attributes) => ({ 'data-clip-top': attributes.clipTop ?? 0 }),
      },
      clipRight: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute('data-clip-right') || 0),
        renderHTML: (attributes) => ({ 'data-clip-right': attributes.clipRight ?? 0 }),
      },
      clipBottom: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute('data-clip-bottom') || 0),
        renderHTML: (attributes) => ({ 'data-clip-bottom': attributes.clipBottom ?? 0 }),
      },
      clipLeft: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute('data-clip-left') || 0),
        renderHTML: (attributes) => ({ 'data-clip-left': attributes.clipLeft ?? 0 }),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes.align || 'center';
    const crop = HTMLAttributes.crop || 'none';
    const size = HTMLAttributes.size || 'full';
    const shape = HTMLAttributes.shape || 'rounded';
    const frame = HTMLAttributes.frame || 'none';
    const clipTop = Number(HTMLAttributes.clipTop || 0);
    const clipRight = Number(HTMLAttributes.clipRight || 0);
    const clipBottom = Number(HTMLAttributes.clipBottom || 0);
    const clipLeft = Number(HTMLAttributes.clipLeft || 0);

    const styleParts = [];
    styleParts.push('max-width:100%');

    if (size === 'half') styleParts.push('width:min(48%,420px)');
    if (size === 'third') styleParts.push('width:min(33%,320px)');
    if (size === 'twoThird') styleParts.push('width:min(66%,620px)');
    if (size === 'full') styleParts.push('width:100%');

    if (align === 'left') styleParts.push('float:left;margin:0.25rem 1rem 0.75rem 0');
    if (align === 'right') styleParts.push('float:right;margin:0.25rem 0 0.75rem 1rem');
    if (align === 'center') styleParts.push('display:block;margin:1rem auto;clear:both');

    if (crop === 'none') styleParts.push('aspect-ratio:auto;object-fit:contain;height:auto');
    if (crop === 'landscape') styleParts.push('aspect-ratio:16/9;object-fit:cover;height:clamp(180px,28vw,420px)');
    if (crop === 'square') styleParts.push('aspect-ratio:1/1;object-fit:cover;height:min(60vw,420px)');

    if (shape === 'rounded') styleParts.push('border-radius:0.5rem');
    if (shape === 'square') styleParts.push('border-radius:0');

    if (frame === 'border') styleParts.push('border:1px solid rgba(120,120,120,0.35)');
    if (frame === 'shadow') styleParts.push('box-shadow:0 12px 20px -14px rgba(0,0,0,0.55)');
    if (clipTop || clipRight || clipBottom || clipLeft) {
      styleParts.push(`clip-path:inset(${clipTop}% ${clipRight}% ${clipBottom}% ${clipLeft}%)`);
    }

    const classes = [
      'editor-image',
      `align-${align}`,
      `crop-${crop}`,
      `size-${size}`,
      `shape-${shape}`,
      `frame-${frame}`,
      HTMLAttributes.class,
    ]
      .filter(Boolean)
      .join(' ');

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: classes,
        style: styleParts.join(';'),
      }),
    ];
  },
});

export default function RichEditor({ content, onChange, onUploadImage }) {
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeImageSrc, setActiveImageSrc] = useState('');
  const [activeImagePos, setActiveImagePos] = useState(null);
  const [mouseCropOpen, setMouseCropOpen] = useState(false);
  const [mouseCropImage, setMouseCropImage] = useState('');
  const [mouseCropTargetPos, setMouseCropTargetPos] = useState(null);
  const [mouseCrop, setMouseCrop] = useState({ unit: '%', x: 10, y: 10, width: 80, height: 80 });

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here...\n\nAim for 800-1500 words. Use H2 headings to structure content. Include your focus keyword in the first paragraph.' }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'article-prose min-h-[400px] p-5 focus:outline-none',
      },
      handleClickOn(view, pos, node, nodePos) {
        if (node?.type?.name === 'image') {
          setActiveImageSrc(node.attrs?.src || '');
          setActiveImagePos(nodePos);
          const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos));
          view.dispatch(tr);
          view.focus();
        }
        return false;
      },
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target;
          if (!(target instanceof HTMLImageElement)) {
            setActiveImageSrc('');
            setActiveImagePos(null);
            return false;
          }

          const pos = view.posAtDOM(target, 0);
          const node = view.state.doc.nodeAt(pos);
          if (!node || node.type.name !== 'image') return false;

          setActiveImageSrc(node.attrs?.src || '');
          setActiveImagePos(pos);
          const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
          view.dispatch(tr);
          view.focus();
          return false;
        },
      },
    },
  });

  function addImage() {
    const url = prompt('Image URL:');
    if (url)
      editor
        ?.chain()
        .focus()
        .setImage({ src: url, align: 'center', crop: 'none', size: 'full' })
        .run();
  }

  function computeImageStyle(attrs = {}) {
    const align = attrs.align || 'center';
    const crop = attrs.crop || 'none';
    const size = attrs.size || 'full';
    const shape = attrs.shape || 'rounded';
    const frame = attrs.frame || 'none';
    const clipTop = Number(attrs.clipTop || 0);
    const clipRight = Number(attrs.clipRight || 0);
    const clipBottom = Number(attrs.clipBottom || 0);
    const clipLeft = Number(attrs.clipLeft || 0);

    const styleParts = ['max-width:100%'];

    if (size === 'half') styleParts.push('width:min(48%,420px)');
    if (size === 'third') styleParts.push('width:min(33%,320px)');
    if (size === 'twoThird') styleParts.push('width:min(66%,620px)');
    if (size === 'full') styleParts.push('width:100%');

    if (align === 'left') styleParts.push('float:left;margin:0.25rem 1rem 0.75rem 0');
    if (align === 'right') styleParts.push('float:right;margin:0.25rem 0 0.75rem 1rem');
    if (align === 'center') styleParts.push('display:block;margin:1rem auto;clear:both');

    if (crop === 'none') styleParts.push('aspect-ratio:auto;object-fit:contain;height:auto');
    if (crop === 'landscape') styleParts.push('aspect-ratio:16/9;object-fit:cover;height:clamp(180px,28vw,420px)');
    if (crop === 'square') styleParts.push('aspect-ratio:1/1;object-fit:cover;height:min(60vw,420px)');

    if (shape === 'rounded') styleParts.push('border-radius:0.5rem');
    if (shape === 'square') styleParts.push('border-radius:0');

    if (frame === 'border') styleParts.push('border:1px solid rgba(120,120,120,0.35)');
    if (frame === 'shadow') styleParts.push('box-shadow:0 12px 20px -14px rgba(0,0,0,0.55)');
    if (clipTop || clipRight || clipBottom || clipLeft) {
      styleParts.push(`clip-path:inset(${clipTop}% ${clipRight}% ${clipBottom}% ${clipLeft}%)`);
    }

    return styleParts.join(';');
  }

  function applyImageVisualSync(view, pos, attrs = {}) {
    const domNode = view.nodeDOM(pos);
    if (!(domNode instanceof HTMLImageElement)) return;

    domNode.style.cssText = computeImageStyle(attrs);
    domNode.setAttribute('data-align', attrs.align || 'center');
    domNode.setAttribute('data-crop', attrs.crop || 'none');
    domNode.setAttribute('data-size', attrs.size || 'full');
    domNode.setAttribute('data-shape', attrs.shape || 'rounded');
    domNode.setAttribute('data-frame', attrs.frame || 'none');
    domNode.setAttribute('data-clip-top', String(attrs.clipTop ?? 0));
    domNode.setAttribute('data-clip-right', String(attrs.clipRight ?? 0));
    domNode.setAttribute('data-clip-bottom', String(attrs.clipBottom ?? 0));
    domNode.setAttribute('data-clip-left', String(attrs.clipLeft ?? 0));
  }

  function resolveTargetImage() {
    if (!editor) return null;

    const { state, view } = editor;
    const validSelectedPos =
      activeImagePos != null && state.doc.nodeAt(activeImagePos)?.type?.name === 'image'
        ? activeImagePos
        : null;

    let srcMatchedPos = null;
    if (!validSelectedPos && activeImageSrc) {
      state.doc.descendants((node, pos) => {
        if (node.type.name !== 'image') return;
        if (node.attrs?.src === activeImageSrc) {
          srcMatchedPos = pos;
          return false;
        }
      });
    }

    const targetPos = validSelectedPos ?? srcMatchedPos;
    if (targetPos == null) return null;

    const targetNode = state.doc.nodeAt(targetPos);
    if (!targetNode || targetNode.type.name !== 'image') return null;

    return { state, view, targetPos, targetNode };
  }

  function clearImageSelection() {
    if (!editor) return;

    const { state, view } = editor;
    const pos = Math.max(1, Math.min(state.selection.from, state.doc.content.size));
    const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(pos)));
    view.dispatch(tr);
    view.focus();

    setActiveImageSrc('');
    setActiveImagePos(null);
  }

  function updateImageAttrs(attrs) {
    const target = resolveTargetImage();
    if (!target) return;
    const { state, view, targetPos } = target;

    const selectTr = state.tr.setSelection(NodeSelection.create(state.doc, targetPos));
    view.dispatch(selectTr);
    view.focus();

    editor.chain().focus().updateAttributes('image', attrs).run();

    const updatedNode = editor.state.doc.nodeAt(targetPos);
    if (updatedNode?.type?.name === 'image') {
      applyImageVisualSync(view, targetPos, updatedNode.attrs || {});
    }

    setActiveImagePos(targetPos);
    const latestAttrs = editor.getAttributes('image');
    if (latestAttrs?.src) setActiveImageSrc(latestAttrs.src);
  }

  function openMouseCrop() {
    const target = resolveTargetImage();
    if (!target) return;

    const { targetPos, targetNode } = target;
    const src = targetNode.attrs?.src || '';
    if (!src) return;

    const top = Number(targetNode.attrs?.clipTop || 0);
    const right = Number(targetNode.attrs?.clipRight || 0);
    const bottom = Number(targetNode.attrs?.clipBottom || 0);
    const left = Number(targetNode.attrs?.clipLeft || 0);
    const width = Math.max(10, 100 - left - right);
    const height = Math.max(10, 100 - top - bottom);

    selectImageByPos(targetPos);
    setMouseCropTargetPos(targetPos);
    setMouseCropImage(src);
    setMouseCrop({ unit: '%', x: left, y: top, width, height });
    setMouseCropOpen(true);
  }

  function applyMouseCrop() {
    if (mouseCropTargetPos == null) return;

    const left = Math.max(0, Math.min(90, Number(mouseCrop.x || 0)));
    const top = Math.max(0, Math.min(90, Number(mouseCrop.y || 0)));
    const width = Math.max(10, Math.min(100 - left, Number(mouseCrop.width || 0)));
    const height = Math.max(10, Math.min(100 - top, Number(mouseCrop.height || 0)));
    const right = Math.max(0, 100 - left - width);
    const bottom = Math.max(0, 100 - top - height);

    selectImageByPos(mouseCropTargetPos);
    updateImageAttrs({
      crop: 'custom',
      clipTop: Number(top.toFixed(2)),
      clipRight: Number(right.toFixed(2)),
      clipBottom: Number(bottom.toFixed(2)),
      clipLeft: Number(left.toFixed(2)),
    });

    setMouseCropOpen(false);
  }

  function getImageList() {
    if (!editor) return [];
    const items = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name !== 'image') return;
      items.push({ pos, src: node.attrs?.src || '', attrs: node.attrs || {} });
    });
    return items;
  }

  function getSelectedImageAttrs() {
    if (!editor) return null;

    if (editor.isActive('image')) {
      return editor.getAttributes('image');
    }

    let selectedAttrs = null;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name !== 'image') return;
      if (activeImagePos != null && pos === activeImagePos) {
        selectedAttrs = node.attrs;
        return false;
      }
      if (activeImageSrc && node.attrs?.src === activeImageSrc) {
        selectedAttrs = node.attrs;
      }
    });

    return selectedAttrs;
  }

  function addImageCaption() {
    const caption = prompt('Image caption text:');
    if (!caption) return;
    editor
      ?.chain()
      .focus()
      .insertContent(`<p class="image-caption">${caption}</p>`)
      .run();
  }

  async function uploadAndInsertImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onUploadImage) return;

    try {
      setUploadingImage(true);
      const imageUrl = await onUploadImage(file);
      if (imageUrl) {
        editor
          ?.chain()
          .focus()
          .setImage({ src: imageUrl, align: 'center', crop: 'none', size: 'full' })
          .run();
        const selectedPos = editor.state.selection.from;
        setActiveImagePos(selectedPos);
        setActiveImageSrc(imageUrl);
      }
    } finally {
      setUploadingImage(false);
    }
  }

  function addLink() {
    const url = prompt('URL:');
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  function selectImageByPos(pos) {
    if (!editor || pos == null) return;
    const node = editor.state.doc.nodeAt(pos);
    if (!node || node.type.name !== 'image') return;

    const tr = editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos));
    editor.view.dispatch(tr);
    editor.view.focus();
    setActiveImagePos(pos);
    setActiveImageSrc(node.attrs?.src || '');
  }

  function selectLastImage() {
    if (!editor) return;

    let lastImagePos = null;
    let lastImageSrc = '';
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name !== 'image') return;
      lastImagePos = pos;
      lastImageSrc = node.attrs?.src || '';
    });

    if (lastImagePos == null) return;
    selectImageByPos(lastImagePos);
    setActiveImageSrc(lastImageSrc);
  }

  if (!editor) return null;
  const selectedImageAttrs = getSelectedImageAttrs();
  const imageList = getImageList();
  const selectedImageIndex = imageList.findIndex((item) => item.pos === activeImagePos);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-stone-50 dark:bg-neutral-800 border-b border-stone-200 dark:border-neutral-700">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            onClick={() => btn.action(editor)}
            className={`px-2 py-1 rounded text-xs font-bold border transition-all
              ${btn.active(editor)
                ? 'bg-accent text-white border-accent'
                : 'bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent'}`}
          >
            {btn.label}
          </button>
        ))}
        <button type="button" onClick={addImage} title="Insert image"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all">
          IMG URL
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!onUploadImage || uploadingImage}
          title="Upload image"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all disabled:opacity-40"
        >
          {uploadingImage ? 'Uploading...' : 'Upload IMG'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={uploadAndInsertImage}
        />
        <button type="button" onClick={addLink} title="Insert link"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all">
          LINK
        </button>

        <div className="basis-full mt-1 rounded-md border border-stone-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-stone-700 dark:text-neutral-200">Image Editor</span>
            <span className="text-[10px] text-stone-500 dark:text-neutral-400">
              {selectedImageAttrs ? 'Image selected' : 'No image selected'}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-neutral-400 mb-2">
            Click an image in the editor, then use these controls.
          </p>
          {selectedImageAttrs && (
            <p className="text-[10px] text-stone-500 dark:text-neutral-400 mb-2">
              {`Current: align=${selectedImageAttrs.align || 'center'} | crop=${selectedImageAttrs.crop || 'none'} | size=${selectedImageAttrs.size || 'full'} | shape=${selectedImageAttrs.shape || 'rounded'} | frame=${selectedImageAttrs.frame || 'none'}`}
            </p>
          )}

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!imageList.length) return;
                const current = selectedImageIndex >= 0 ? selectedImageIndex : imageList.length - 1;
                const next = (current - 1 + imageList.length) % imageList.length;
                selectImageByPos(imageList[next].pos);
              }}
              className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
            >
              Prev
            </button>
            <select
              value={activeImagePos ?? ''}
              onChange={(e) => {
                const pos = Number(e.target.value);
                if (!Number.isNaN(pos)) selectImageByPos(pos);
              }}
              className="min-w-[220px] rounded border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs text-stone-700 dark:text-neutral-200"
            >
              <option value="">Select image...</option>
              {imageList.map((image, index) => (
                <option key={image.pos} value={image.pos}>
                  {`Image ${index + 1}${image.src ? ` - ${image.src.slice(-30)}` : ''}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (!imageList.length) return;
                const current = selectedImageIndex >= 0 ? selectedImageIndex : 0;
                const next = (current + 1) % imageList.length;
                selectImageByPos(imageList[next].pos);
              }}
              className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
            >
              Next
            </button>
          </div>

          <button
            type="button"
            onClick={selectLastImage}
            className="mb-2 px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
          >
            Select Last Image
          </button>

          <div className="flex flex-wrap gap-1">
            <span className="mx-1 text-[10px] text-stone-400 self-center">IMG</span>
        <button
          type="button"
          onClick={clearImageSelection}
          title="Deselect image"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          DeSelect
        </button>
        <button
          type="button"
          onClick={openMouseCrop}
          title="Mouse corner crop"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Mouse Crop
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ align: 'left', size: 'half' })}
          title="Image left"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ align: 'center' })}
          title="Image center"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Center
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ align: 'right', size: 'half' })}
          title="Image right"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Right
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ crop: 'none', clipTop: 0, clipRight: 0, clipBottom: 0, clipLeft: 0 })}
          title="No crop"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          NoCrop
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ crop: 'landscape', clipTop: 0, clipRight: 0, clipBottom: 0, clipLeft: 0 })}
          title="Crop 16:9"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          16:9
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ crop: 'square', clipTop: 0, clipRight: 0, clipBottom: 0, clipLeft: 0 })}
          title="Crop square"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          1:1
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ size: 'half' })}
          title="Half width"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ size: 'full' })}
          title="Full width"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          100%
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ size: 'third' })}
          title="One third width"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          33%
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ size: 'twoThird' })}
          title="Two third width"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          66%
        </button>

        <button
          type="button"
          onClick={() => updateImageAttrs({ shape: 'rounded' })}
          title="Rounded image"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Round
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ shape: 'square' })}
          title="Square corners"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Square
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ frame: 'none' })}
          title="No frame"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          NoFrame
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ frame: 'border' })}
          title="Border frame"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Border
        </button>
        <button
          type="button"
          onClick={() => updateImageAttrs({ frame: 'shadow' })}
          title="Shadow frame"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Shadow
        </button>
        <button
          type="button"
          onClick={addImageCaption}
          title="Insert image caption"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
        >
          Caption
        </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {mouseCropOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl rounded-lg border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-neutral-100">Mouse Corner Crop</h3>
              <button
                type="button"
                onClick={() => setMouseCropOpen(false)}
                className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700"
              >
                Close
              </button>
            </div>

            <div className="max-h-[62vh] overflow-auto rounded border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-950 p-2">
              {mouseCropImage && (
                <ReactCrop
                  crop={mouseCrop}
                  onChange={(nextCrop) => setMouseCrop(nextCrop)}
                  minWidth={10}
                  minHeight={10}
                  keepSelection
                >
                  <img src={mouseCropImage} alt="Crop target" className="max-h-[56vh] w-auto mx-auto" />
                </ReactCrop>
              )}
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMouseCropOpen(false)}
                className="px-3 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyMouseCrop}
                className="px-3 py-1 rounded text-xs font-bold border border-accent bg-accent text-white"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
