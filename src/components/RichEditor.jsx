import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import CharacterCount from '@tiptap/extension-character-count';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import ReactCrop from 'react-image-crop';

const TOOLBAR_BUTTONS = [
  {
    label: 'B',
    title: 'Bold',
    action: (e) => e.chain().focus().toggleBold().run(),
    active: (e) => e.isActive('bold'),
  },
  {
    label: 'I',
    title: 'Italic',
    action: (e) => e.chain().focus().toggleItalic().run(),
    active: (e) => e.isActive('italic'),
  },
  {
    label: 'S',
    title: 'Strike',
    action: (e) => e.chain().focus().toggleStrike().run(),
    active: (e) => e.isActive('strike'),
  },
  {
    label: 'U',
    title: 'Underline',
    action: (e) => e.chain().focus().toggleUnderline().run(),
    active: (e) => e.isActive('underline'),
  },
  {
    label: 'H1',
    title: 'Heading 1',
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    active: (e) => e.isActive('heading', { level: 1 }),
  },
  {
    label: 'H2',
    title: 'Heading 2',
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    active: (e) => e.isActive('heading', { level: 2 }),
  },
  {
    label: 'H3',
    title: 'Heading 3',
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    active: (e) => e.isActive('heading', { level: 3 }),
  },
  {
    label: 'H4',
    title: 'Heading 4',
    action: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(),
    active: (e) => e.isActive('heading', { level: 4 }),
  },
  {
    label: '¶',
    title: 'Paragraph',
    action: (e) => e.chain().focus().setParagraph().run(),
    active: (e) => e.isActive('paragraph'),
  },
  {
    label: '•',
    title: 'Bullet list',
    action: (e) => e.chain().focus().toggleBulletList().run(),
    active: (e) => e.isActive('bulletList'),
  },
  {
    label: '1.',
    title: 'Ordered list',
    action: (e) => e.chain().focus().toggleOrderedList().run(),
    active: (e) => e.isActive('orderedList'),
  },
  {
    label: '"',
    title: 'Blockquote',
    action: (e) => e.chain().focus().toggleBlockquote().run(),
    active: (e) => e.isActive('blockquote'),
  },
  {
    label: '</>',
    title: 'Code block',
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
    active: (e) => e.isActive('codeBlock'),
  },
  {
    label: '<c>',
    title: 'Inline code',
    action: (e) => e.chain().focus().toggleCode().run(),
    active: (e) => e.isActive('code'),
  },
  {
    label: 'L',
    title: 'Align left',
    action: (e) => e.chain().focus().setTextAlign('left').run(),
    active: (e) => e.isActive({ textAlign: 'left' }),
  },
  {
    label: 'C',
    title: 'Align center',
    action: (e) => e.chain().focus().setTextAlign('center').run(),
    active: (e) => e.isActive({ textAlign: 'center' }),
  },
  {
    label: 'R',
    title: 'Align right',
    action: (e) => e.chain().focus().setTextAlign('right').run(),
    active: (e) => e.isActive({ textAlign: 'right' }),
  },
  {
    label: '—',
    title: 'Horizontal rule',
    action: (e) => e.chain().focus().setHorizontalRule().run(),
    active: () => false,
  },
  {
    label: '↩',
    title: 'Undo',
    action: (e) => e.chain().focus().undo().run(),
    active: () => false,
    can: (e) => e.can().chain().focus().undo().run(),
  },
  {
    label: '↪',
    title: 'Redo',
    action: (e) => e.chain().focus().redo().run(),
    active: () => false,
    can: (e) => e.can().chain().focus().redo().run(),
  },
];

const TEXT_COLORS = [
  { label: 'Black', value: '#111827' },
  { label: 'White', value: '#ffffff' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Green', value: '#059669' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Purple', value: '#7c3aed' },
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
    if (crop === 'landscape')
      styleParts.push('aspect-ratio:16/9;object-fit:cover;height:clamp(180px,28vw,420px)');
    if (crop === 'square')
      styleParts.push('aspect-ratio:1/1;object-fit:cover;height:min(60vw,420px)');

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
  const editorAreaRef = useRef(null);
  const isNormalizingRef = useRef(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeImageSrc, setActiveImageSrc] = useState('');
  const [activeImagePos, setActiveImagePos] = useState(null);
  const [mouseCropOpen, setMouseCropOpen] = useState(false);
  const [mouseCropImage, setMouseCropImage] = useState('');
  const [mouseCropTargetPos, setMouseCropTargetPos] = useState(null);
  const [mouseCrop, setMouseCrop] = useState({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [inlineImageEditorPos, setInlineImageEditorPos] = useState(null);
  const [isInlineEditorPinned, setIsInlineEditorPinned] = useState(false);

  function normalizeLegacyListMarkup(html) {
    let normalized = String(html || '').replace(/&nbsp;/g, ' ');

    // Drop standalone marker lines that create empty bullet rows.
    normalized = normalized.replace(/<p>\s*(?:[•·▪◦*\-]|✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)\s*<\/p>/giu, '');

    // Convert check/cross/point marker paragraphs to proper list items.
    normalized = normalized.replace(
      /<p>\s*(?:✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)\s+([\s\S]*?)<\/p>/giu,
      '<ul><li>$1</li></ul>'
    );

    normalized = normalized.replace(
      /<p>\s*(?:•|·|▪|\*)\s*<\/p>\s*<p>([\s\S]*?)<\/p>/gi,
      '<ul><li>$1</li></ul>'
    );

    normalized = normalized.replace(
      /<p>\s*(?:•|·|▪|\*|-)\s+([\s\S]*?)<\/p>/gi,
      '<ul><li>$1</li></ul>'
    );

    normalized = normalized.replace(/<\/ul>\s*<ul>/gi, '');

    // Clean malformed list items from rich HTML paste.
    normalized = normalized.replace(/<li>\s*(?:[•·▪◦*\-]|✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)?\s*<\/li>/giu, '');
    normalized = normalized.replace(
      /<li>\s*(?:✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)\s+([\s\S]*?)<\/li>/giu,
      '<li>$1</li>'
    );
    normalized = normalized.replace(
      /<li>\s*(?:[-–—_=~*|.•▪◦·]|✅|✔|✓|❌|✖|✗|👉|⚠️|⚠){1,}\s*<\/li>/giu,
      ''
    );
    normalized = normalized.replace(
      /<li>\s*(?:<p[^>]*>)?\s*(?:<br\s*\/?>|&nbsp;|\u00a0|[\u200B-\u200D\uFEFF]|\s)*(?:<\/p>)?\s*<\/li>/giu,
      ''
    );
    normalized = normalized.replace(/<ul>\s*<\/ul>/gi, '');
    normalized = normalized.replace(/<ol>\s*<\/ol>/gi, '');

    return normalized;
  }

  function normalizePastedHtml(html) {
    let normalized = String(html || '');

    // Strip aggressive alignment from copied rich text (e.g., ChatGPT/Docs/MS Word)
    normalized = normalized.replace(/\sstyle="([^"]*)"/gi, (_, styleText) => {
      const cleaned = styleText
        .replace(/(^|;)\s*text-align\s*:\s*(left|right|center|justify)\s*;?/gi, '$1')
        .replace(/;;+/g, ';')
        .replace(/^;|;$/g, '')
        .trim();

      return cleaned ? ` style="${cleaned}"` : '';
    });

    // Remove Word/Docs class noise that can break editor formatting
    normalized = normalized.replace(/\sclass="Mso[^"]*"/gi, '');

    return normalizeLegacyListMarkup(normalized);
  }

  function convertPlainTextToStructuredHtml(text) {
    const escapeHtml = (value) =>
      String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const lines = String(text || '').split(/\r?\n/);
    const out = [];
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
    };

    for (let i = 0; i < lines.length; i += 1) {
      const line = String(lines[i] || '').trim();

      if (!line) {
        closeLists();
        continue;
      }

      // If a marker is on its own line and content appears on a following line,
      // merge them into a single bullet item.
      const isMarkerOnly = /^(?:[-*•▪◦·●]|✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)$/u.test(line);
      if (isMarkerOnly) {
        let j = i + 1;
        while (j < lines.length && !String(lines[j] || '').trim()) {
          j += 1;
        }

        const nextLine = j < lines.length ? String(lines[j] || '').trim() : '';
        const nextIsMarkerOnly = /^(?:[-*•▪◦·●]|✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)$/u.test(nextLine);
        const nextIsSeparatorOnly = /^[-–—_=~*|.]{1,}$/u.test(nextLine);
        if (nextLine && !nextIsMarkerOnly && !nextIsSeparatorOnly) {
          if (inOl) {
            out.push('</ol>');
            inOl = false;
          }
          if (!inUl) {
            out.push('<ul>');
            inUl = true;
          }
          out.push(`<li>${escapeHtml(nextLine)}</li>`);
          i = j;
        }
        continue;
      }

      const bulletMatch = line.match(/^(?:(?:[-*•▪◦·●])|(?:✅|✔|✓|❌|✖|✗|👉|⚠️|⚠))\s*(.+)$/u);
      if (bulletMatch) {
        const bulletText = String(bulletMatch[1] || '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/\u00a0/g, ' ')
          .trim()
          .replace(/^(?:[-*•▪◦·●]|✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)\s+/u, '');
        if (!bulletText || /^[-–—_=~*|.]{1,}$/u.test(bulletText)) {
          continue;
        }
        if (inOl) {
          out.push('</ol>');
          inOl = false;
        }
        if (!inUl) {
          out.push('<ul>');
          inUl = true;
        }
        out.push(`<li>${escapeHtml(bulletText)}</li>`);
        continue;
      }

      const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
      if (orderedMatch) {
        if (inUl) {
          out.push('</ul>');
          inUl = false;
        }
        if (!inOl) {
          out.push('<ol>');
          inOl = true;
        }
        out.push(`<li>${escapeHtml(orderedMatch[1])}</li>`);
        continue;
      }

      closeLists();
      out.push(`<p>${escapeHtml(line)}</p>`);
    }

    closeLists();
    return out.join('');
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-6',
        },
      }),
      CharacterCount,
      CustomImage.configure({ inline: false, allowBase64: true }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'editor-table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder:
          'Write your article here...\n\nAim for 800-1500 words. Use H2 headings to structure content. Include your focus keyword in the first paragraph.',
      }),
    ],
    content,
    onUpdate({ editor }) {
      if (isNormalizingRef.current) return;

      const rawHtml = editor.getHTML();
      const normalizedHtml = normalizeLegacyListMarkup(rawHtml);

      if (normalizedHtml !== rawHtml) {
        isNormalizingRef.current = true;
        editor.commands.setContent(normalizedHtml, false);
        isNormalizingRef.current = false;
        onChange(normalizedHtml);
        return;
      }

      onChange(rawHtml);
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
        mousemove(view, event) {
          if (isInlineEditorPinned) return false;

          const target = event.target;
          if (!(target instanceof HTMLImageElement)) return false;

          const pos = view.posAtDOM(target, 0);
          const node = view.state.doc.nodeAt(pos);
          if (!node || node.type.name !== 'image') return false;

          if (activeImagePos !== pos || activeImageSrc !== (node.attrs?.src || '')) {
            setActiveImagePos(pos);
            setActiveImageSrc(node.attrs?.src || '');
          }
          return false;
        },
        mousedown(view, event) {
          const target = event.target;
          if (!(target instanceof HTMLImageElement)) {
            if (isInlineEditorPinned) return false;
            setActiveImageSrc('');
            setActiveImagePos(null);
            return false;
          }

          const pos = view.posAtDOM(target, 0);
          const node = view.state.doc.nodeAt(pos);
          if (!node || node.type.name !== 'image') return false;

          setActiveImageSrc(node.attrs?.src || '');
          setActiveImagePos(pos);
          setIsInlineEditorPinned(true);
          const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
          view.dispatch(tr);
          view.focus();
          return false;
        },
        paste(view, event) {
          const clipboard = event.clipboardData;
          if (!clipboard) return false;

          const html = clipboard.getData('text/html');
          const plainText = clipboard.getData('text/plain');

          const hasListLikePlainText =
            plainText &&
            /(?:^|\n)\s*(?:(?:[-*•▪◦·]|✅|✔|✓|❌|✖|✗|👉|⚠️|⚠)|\d+[.)])\s*/mu.test(plainText);

          // Prefer plain-text normalization for ChatGPT-style pasted lists.
          if (hasListLikePlainText) {
            event.preventDefault();
            const structuredHtml = convertPlainTextToStructuredHtml(plainText);
            editor?.chain().focus().insertContent(structuredHtml).run();
            return true;
          }

          if (html) {
            event.preventDefault();
            const normalizedHtml = normalizePastedHtml(html);
            editor?.chain().focus().insertContent(normalizedHtml).run();
            return true;
          }

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
    if (crop === 'landscape')
      styleParts.push('aspect-ratio:16/9;object-fit:cover;height:clamp(180px,28vw,420px)');
    if (crop === 'square')
      styleParts.push('aspect-ratio:1/1;object-fit:cover;height:min(60vw,420px)');

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
    setIsInlineEditorPinned(false);
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
    editor?.chain().focus().insertContent(`<p class="image-caption">${caption}</p>`).run();
  }

  function setImageAltText() {
    const target = resolveTargetImage();
    if (!target) return;
    const currentAlt = target.targetNode.attrs?.alt || '';
    const alt = prompt('Image alt text (for SEO/accessibility):', currentAlt);
    if (alt === null) return;
    updateImageAttrs({ alt: alt.trim() });
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

  function normalizeUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^javascript:/i.test(raw)) return '';
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(raw)) return raw;
    return `https://${raw}`;
  }

  function addLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href || '';
    const rawUrl = prompt('URL (leave empty to remove link):', previousUrl);
    if (rawUrl === null) return;

    const trimmedUrl = rawUrl.trim();

    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const href = normalizeUrl(trimmedUrl);
    const openInNewTab = window.confirm('Open link in a new tab?');
    const attrs = {
      href,
      target: openInNewTab ? '_blank' : null,
      rel: openInNewTab ? 'noopener noreferrer nofollow' : null,
    };

    const { from, empty } = editor.state.selection;
    if (empty) {
      const text = prompt('Link text:', href) || href;
      if (!text.trim()) return;

      editor
        .chain()
        .focus()
        .insertContent(text)
        .setTextSelection({ from, to: from + text.length })
        .setLink(attrs)
        .run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
  }

  function insertResourceLink(defaultText, promptTitle) {
    if (!editor) return;

    const rawUrl = prompt(`${promptTitle} URL:`);
    if (rawUrl === null) return;

    const href = normalizeUrl(rawUrl);
    if (!href) return;

    const text = (prompt('Link text:', defaultText) || defaultText).trim() || defaultText;
    const safeHref = href.replace(/"/g, '&quot;');
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    editor
      .chain()
      .focus()
      .insertContent(
        `<p><a href="${safeHref}" target="_blank" rel="noopener noreferrer nofollow">${safeText}</a></p>`
      )
      .run();
  }

  function addVideoLink() {
    insertResourceLink('Watch Video', 'Video');
  }

  function addPdfLink() {
    insertResourceLink('Open PDF', 'PDF');
  }

  function addYouTube() {
    if (!editor) return;
    const url = prompt('YouTube URL:');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url.trim() });
  }

  function addSocialEmbed(platform) {
    if (!editor) return;
    const url = prompt(`${platform} post URL:`);
    if (!url) return;

    const href = normalizeUrl(url);
    if (!href) return;

    const platformLabel = platform.toUpperCase();
    const safeHref = href.replace(/"/g, '&quot;');
    editor
      .chain()
      .focus()
      .insertContent(
        `<div class="social-embed" data-platform="${platform}"><p><strong>${platformLabel} Embed:</strong> <a href="${safeHref}" target="_blank" rel="noopener noreferrer nofollow">${safeHref}</a></p></div>`
      )
      .run();
  }

  function setTextColor(color) {
    if (!editor) return;

    editor.commands.focus();

    if (!color) {
      if (typeof editor.commands.unsetColor === 'function') {
        editor.commands.unsetColor();
      } else {
        editor.commands.setMark('textStyle', { color: null });
        if (typeof editor.commands.removeEmptyTextStyle === 'function') {
          editor.commands.removeEmptyTextStyle();
        }
      }
      return;
    }

    if (typeof editor.commands.setColor === 'function') {
      editor.commands.setColor(color);
    } else {
      editor.commands.setMark('textStyle', { color });
    }
  }

  function insertTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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

  function syncInlineImageEditorPosition() {
    if (!editor || activeImagePos == null || !editorAreaRef.current) {
      setInlineImageEditorPos(null);
      return;
    }

    const imageNode = editor.view.nodeDOM(activeImagePos);
    if (!(imageNode instanceof HTMLImageElement)) {
      setInlineImageEditorPos(null);
      return;
    }

    const wrapperRect = editorAreaRef.current.getBoundingClientRect();
    const imageRect = imageNode.getBoundingClientRect();
    const top = imageRect.bottom - wrapperRect.top + 8;
    const left = Math.max(0, imageRect.left - wrapperRect.left);
    const width = Math.max(280, Math.min(imageRect.width, wrapperRect.width));

    setInlineImageEditorPos({ top, left, width });
  }

  useEffect(() => {
    syncInlineImageEditorPosition();

    if (activeImagePos == null) return undefined;

    const handleReposition = () => syncInlineImageEditorPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [editor, activeImagePos]);

  const selectedImageAttrs = editor ? getSelectedImageAttrs() : null;
  const imageList = editor ? getImageList() : [];
  const selectedImageIndex = imageList.findIndex((item) => item.pos === activeImagePos);
  const currentTextColor = editor?.getAttributes('textStyle')?.color || '';
  const words = editor?.storage.characterCount?.words?.() || 0;
  const characters = editor?.storage.characterCount?.characters?.() || 0;
  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[130] overflow-auto bg-stone-50 p-3 dark:bg-neutral-950'
    : '';

  useEffect(() => {
    if (!selectedImageAttrs && isInlineEditorPinned) {
      setIsInlineEditorPinned(false);
    }
  }, [selectedImageAttrs, isInlineEditorPinned]);

  useEffect(() => {
    if (!editor) return undefined;

    function onKeyDown(event) {
      if (!editor.isFocused) return;

      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;

      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        editor.chain().focus().undo().run();
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        editor.chain().focus().redo().run();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={wrapperClass}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-stone-200 bg-stone-50 p-2 dark:border-neutral-700 dark:bg-neutral-800">
        {TOOLBAR_BUTTONS.map((btn) =>
          (() => {
            const disabled = typeof btn.can === 'function' ? !btn.can(editor) : false;
            return (
              <button
                key={btn.label}
                type="button"
                title={btn.title}
                disabled={disabled}
                onClick={() => !disabled && btn.action(editor)}
                className={`rounded border px-2 py-1 text-xs font-bold transition-all ${
                  btn.active(editor)
                    ? 'border-accent bg-accent text-white'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-accent hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
                }`}
              >
                {btn.label}
              </button>
            );
          })()
        )}
        <button
          type="button"
          onClick={addImage}
          title="Insert image"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          IMG URL
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!onUploadImage || uploadingImage}
          title="Upload image"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
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
        <button
          type="button"
          onClick={addLink}
          title="Insert link"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          LINK
        </button>
        <button
          type="button"
          onClick={addVideoLink}
          title="Insert video link"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          VIDEO URL
        </button>
        <button
          type="button"
          onClick={addPdfLink}
          title="Insert PDF link"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          PDF URL
        </button>
        <button
          type="button"
          onClick={addYouTube}
          title="Embed YouTube"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          YOUTUBE
        </button>
        <button
          type="button"
          onClick={() => addSocialEmbed('x')}
          title="Embed X/Twitter post"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          X POST
        </button>
        <button
          type="button"
          onClick={() => addSocialEmbed('instagram')}
          title="Embed Instagram post"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          INSTAGRAM
        </button>
        <button
          type="button"
          onClick={() => addSocialEmbed('tiktok')}
          title="Embed TikTok post"
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          TIKTOK
        </button>
        <button
          type="button"
          onClick={() => setIsFocusMode((v) => !v)}
          title="Distraction-free mode"
          className={`rounded border px-2 py-1 text-xs font-bold transition-all ${
            isFocusMode
              ? 'border-accent bg-accent text-white'
              : 'border-stone-200 bg-white text-stone-600 hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
          }`}
        >
          FOCUS
        </button>
        <button
          type="button"
          onClick={() => setIsFullscreen((v) => !v)}
          title="Fullscreen editor"
          className={`rounded border px-2 py-1 text-xs font-bold transition-all ${
            isFullscreen
              ? 'border-accent bg-accent text-white'
              : 'border-stone-200 bg-white text-stone-600 hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
          }`}
        >
          FULL
        </button>
        <div className="flex basis-full flex-wrap items-center gap-1 rounded border border-stone-200 bg-white/70 p-2 dark:border-neutral-700 dark:bg-neutral-900/60">
          <span className="mr-2 text-[10px] font-semibold tracking-wide text-stone-500 dark:text-neutral-400">
            TEXT & TABLE
          </span>
          <div
            className="flex items-center gap-1 rounded border border-stone-200 bg-white px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-900"
            title="Text color"
          >
            {TEXT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTextColor(color.value)}
                title={color.label}
                className={`h-5 w-5 rounded border transition-all ${currentTextColor === color.value ? 'border-accent ring-1 ring-accent' : 'border-stone-300 dark:border-neutral-600'}`}
                style={{ backgroundColor: color.value }}
                aria-label={`Set ${color.label} text color`}
              />
            ))}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setTextColor('')}
            title="Clear text color"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            CLR COLOR
          </button>
          <button
            type="button"
            onClick={insertTable}
            title="Insert table"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            TABLE
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.isActive('table')}
            title="Add row"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            +ROW
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.isActive('table')}
            title="Delete row"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            -ROW
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.isActive('table')}
            title="Add column"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            +COL
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.isActive('table')}
            title="Delete column"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            -COL
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            disabled={!editor.isActive('table')}
            title="Toggle header row"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            HEADER
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.isActive('table')}
            title="Delete table"
            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            DEL TABLE
          </button>
        </div>

        <div className="mt-1 basis-full rounded-md border border-stone-200 bg-white/70 p-2 dark:border-neutral-700 dark:bg-neutral-900/60">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-700 dark:text-neutral-200">
              Image Editor
            </span>
            <span className="text-[10px] text-stone-500 dark:text-neutral-400">
              {selectedImageAttrs ? 'Image selected' : 'No image selected'}
            </span>
          </div>
          <p className="mb-2 text-[10px] text-stone-500 dark:text-neutral-400">
            Click an image in the editor, then use these controls.
          </p>
          {selectedImageAttrs && (
            <p className="mb-2 text-[10px] text-stone-500 dark:text-neutral-400">
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
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Prev
            </button>
            <select
              value={activeImagePos ?? ''}
              onChange={(e) => {
                const pos = Number(e.target.value);
                if (!Number.isNaN(pos)) selectImageByPos(pos);
              }}
              className="min-w-[220px] rounded border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
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
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Next
            </button>
          </div>

          <button
            type="button"
            onClick={selectLastImage}
            className="mb-2 rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
          >
            Select Last Image
          </button>

          <div className="flex flex-wrap gap-1">
            <span className="mx-1 self-center text-[10px] text-stone-400">IMG</span>
            <button
              type="button"
              onClick={clearImageSelection}
              title="Deselect image"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              DeSelect
            </button>
            <button
              type="button"
              onClick={openMouseCrop}
              title="Mouse corner crop"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Mouse Crop
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ align: 'left', size: 'half' })}
              title="Image left"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ align: 'center' })}
              title="Image center"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ align: 'right', size: 'half' })}
              title="Image right"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Right
            </button>
            <button
              type="button"
              onClick={() =>
                updateImageAttrs({
                  crop: 'none',
                  clipTop: 0,
                  clipRight: 0,
                  clipBottom: 0,
                  clipLeft: 0,
                })
              }
              title="No crop"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              NoCrop
            </button>
            <button
              type="button"
              onClick={() =>
                updateImageAttrs({
                  crop: 'landscape',
                  clipTop: 0,
                  clipRight: 0,
                  clipBottom: 0,
                  clipLeft: 0,
                })
              }
              title="Crop 16:9"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              16:9
            </button>
            <button
              type="button"
              onClick={() =>
                updateImageAttrs({
                  crop: 'square',
                  clipTop: 0,
                  clipRight: 0,
                  clipBottom: 0,
                  clipLeft: 0,
                })
              }
              title="Crop square"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              1:1
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ size: 'half' })}
              title="Half width"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ size: 'full' })}
              title="Full width"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ size: 'third' })}
              title="One third width"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              33%
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ size: 'twoThird' })}
              title="Two third width"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              66%
            </button>

            <button
              type="button"
              onClick={() => updateImageAttrs({ shape: 'rounded' })}
              title="Rounded image"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Round
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ shape: 'square' })}
              title="Square corners"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Square
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ frame: 'none' })}
              title="No frame"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              NoFrame
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ frame: 'border' })}
              title="Border frame"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Border
            </button>
            <button
              type="button"
              onClick={() => updateImageAttrs({ frame: 'shadow' })}
              title="Shadow frame"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Shadow
            </button>
            <button
              type="button"
              onClick={addImageCaption}
              title="Insert image caption"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Caption
            </button>
            <button
              type="button"
              onClick={setImageAltText}
              title="Set image alt text"
              className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Alt Text
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div ref={editorAreaRef} className={`relative ${isFocusMode ? 'mx-auto max-w-3xl' : ''}`}>
        <EditorContent editor={editor} />

        {selectedImageAttrs && inlineImageEditorPos && (
          <div
            className="absolute z-20 rounded-md border border-stone-200 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95"
            style={{
              top: `${inlineImageEditorPos.top}px`,
              left: `${inlineImageEditorPos.left}px`,
              width: `${inlineImageEditorPos.width}px`,
            }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-wide text-stone-600 dark:text-neutral-300">
                Image Quick Editor
              </span>
              <button
                type="button"
                onClick={clearImageSelection}
                className="rounded border border-stone-200 bg-white px-2 py-0.5 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => updateImageAttrs({ align: 'left', size: 'half' })}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => updateImageAttrs({ align: 'center' })}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => updateImageAttrs({ align: 'right', size: 'half' })}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Right
              </button>
              <button
                type="button"
                onClick={() => updateImageAttrs({ size: 'half' })}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => updateImageAttrs({ size: 'full' })}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() =>
                  updateImageAttrs({
                    crop: 'landscape',
                    clipTop: 0,
                    clipRight: 0,
                    clipBottom: 0,
                    clipLeft: 0,
                  })
                }
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                16:9
              </button>
              <button
                type="button"
                onClick={() =>
                  updateImageAttrs({
                    crop: 'square',
                    clipTop: 0,
                    clipRight: 0,
                    clipBottom: 0,
                    clipLeft: 0,
                  })
                }
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() =>
                  updateImageAttrs({
                    crop: 'none',
                    clipTop: 0,
                    clipRight: 0,
                    clipBottom: 0,
                    clipLeft: 0,
                  })
                }
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                NoCrop
              </button>
              <button
                type="button"
                onClick={openMouseCrop}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Mouse Crop
              </button>
              <button
                type="button"
                onClick={setImageAltText}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600 transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Alt Text
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-stone-200 bg-white px-3 py-2 text-xs text-stone-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        <span>Words: {words}</span>
        <span>Characters: {characters}</span>
        <span className="hidden sm:inline">Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Y redo</span>
      </div>

      {mouseCropOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl rounded-lg border border-stone-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
                Mouse Corner Crop
              </h3>
              <button
                type="button"
                onClick={() => setMouseCropOpen(false)}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Close
              </button>
            </div>

            <div className="max-h-[62vh] overflow-auto rounded border border-stone-200 bg-stone-50 p-2 dark:border-neutral-700 dark:bg-neutral-950">
              {mouseCropImage && (
                <ReactCrop
                  crop={mouseCrop}
                  onChange={(nextCrop) => setMouseCrop(nextCrop)}
                  minWidth={10}
                  minHeight={10}
                  keepSelection
                >
                  <img
                    src={mouseCropImage}
                    alt="Crop target"
                    className="mx-auto max-h-[56vh] w-auto"
                  />
                </ReactCrop>
              )}
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMouseCropOpen(false)}
                className="rounded border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-stone-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyMouseCrop}
                className="rounded border border-accent bg-accent px-3 py-1 text-xs font-bold text-white"
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
