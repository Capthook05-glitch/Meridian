import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CharacterCount from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Mention from '@tiptap/extension-mention'
const lowlight = createLowlight(common)

export function createEditorExtensions(
  placeholder = 'Start writing… Use [[ to link notes',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  suggestionOptions?: Record<string, any>
) {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
    }),

    CodeBlockLowlight.configure({ lowlight }),

    Highlight.configure({ multicolor: true }),

    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-[var(--color-accent-300)] underline underline-offset-2' },
    }),

    TaskList,
    TaskItem.configure({ nested: true }),

    CharacterCount,

    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),

    ...(suggestionOptions
      ? [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (Mention as any).configure({
            HTMLAttributes: { class: 'wikilink' },
            suggestion: suggestionOptions,
          }),
        ]
      : []),
  ]
}
