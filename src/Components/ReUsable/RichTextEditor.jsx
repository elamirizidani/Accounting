import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const toolbarButtons = [
  {
    label: 'Bold',
    icon: 'bi-type-bold',
    isActive: (editor) => editor.isActive('bold'),
    action: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: 'Italic',
    icon: 'bi-type-italic',
    isActive: (editor) => editor.isActive('italic'),
    action: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: 'Bullets',
    icon: 'bi-list-ul',
    isActive: (editor) => editor.isActive('bulletList'),
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Numbers',
    icon: 'bi-list-ol',
    isActive: (editor) => editor.isActive('orderedList'),
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'Quote',
    icon: 'bi-quote',
    isActive: (editor) => editor.isActive('blockquote'),
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

function RichTextEditor({ value = '', onChange, placeholder = 'Write terms and conditions...' }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content',
        'data-placeholder': placeholder,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const nextHtml = value || '';

    if (nextHtml !== currentHtml) {
      editor.commands.setContent(nextHtml, false);
    }
  }, [editor, value]);

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" aria-label="Text formatting toolbar">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            className={editor && button.isActive(editor) ? 'active' : ''}
            disabled={!editor}
            onClick={() => editor && button.action(editor)}
            title={button.label}
          >
            <i className={`bi ${button.icon}`} />
            <span>{button.label}</span>
          </button>
        ))}
        <span className="rich-text-toolbar-divider" />
        <button
          type="button"
          disabled={!editor}
          onClick={() => editor?.chain().focus().undo().run()}
          title="Undo"
        >
          <i className="bi bi-arrow-counterclockwise" />
          <span>Undo</span>
        </button>
        <button
          type="button"
          disabled={!editor}
          onClick={() => editor?.chain().focus().redo().run()}
          title="Redo"
        >
          <i className="bi bi-arrow-clockwise" />
          <span>Redo</span>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
