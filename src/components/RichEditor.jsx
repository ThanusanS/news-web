import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

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

export default function RichEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
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
    },
  });

  function addImage() {
    const url = prompt('Image URL:');
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  function addLink() {
    const url = prompt('URL:');
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return null;

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
          📷
        </button>
        <button type="button" onClick={addLink} title="Insert link"
          className="px-2 py-1 rounded text-xs font-bold border bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-accent hover:text-white hover:border-accent transition-all">
          🔗
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
