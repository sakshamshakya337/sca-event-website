import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[150px] px-4 py-3 bg-surface-container-lowest text-sm text-on-surface'
      }
    }
  })

  // Update editor content if prop changes externally (e.g. initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary transition-all">
      <div className="flex flex-wrap gap-1 bg-surface-container-low p-2 border-b border-outline-variant shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-bold transition-colors ${editor.isActive('bold') ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm italic transition-colors ${editor.isActive('italic') ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm line-through transition-colors ${editor.isActive('strike') ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
        >
          S
        </button>
        <div className="w-px h-5 bg-outline-variant mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
        >
          H3
        </button>
        <div className="w-px h-5 bg-outline-variant mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${editor.isActive('orderedList') ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
        >
          1. List
        </button>
      </div>
      <div className="flex-1 cursor-text bg-surface-container-lowest" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
