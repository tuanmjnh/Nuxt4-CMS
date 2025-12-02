<script setup lang="ts">
import { Markdown } from 'tiptap-markdown'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { Youtube } from '@tiptap/extension-youtube'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const isFullscreen = ref(false)
const viewSource = ref(false)
const sourceContent = ref('')

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    TiptapStarterKit,
    TiptapImage,
    TiptapLink.configure({
      openOnClick: false,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Youtube.configure({
      controls: false,
    }),
    Markdown.configure({
      html: true,
      transformPastedText: true,
      transformCopiedText: true
    })
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none min-h-[150px]',
    },
  },
  onUpdate: ({ editor }) => {
    // Emit markdown content for Nuxt Content compatibility
    const markdown = (editor.storage as any).markdown.getMarkdown()
    emit('update:modelValue', markdown)
    if (viewSource.value) {
      sourceContent.value = markdown
    }
  },
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== (editor.value.storage as any).markdown.getMarkdown()) {
    editor.value.commands.setContent(newValue)
    sourceContent.value = newValue
  }
})

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const toggleViewSource = () => {
  viewSource.value = !viewSource.value
  if (viewSource.value && editor.value) {
    sourceContent.value = (editor.value.storage as any).markdown.getMarkdown()
  }
}

const updateFromSource = () => {
  if (editor.value) {
    editor.value.commands.setContent(sourceContent.value)
    emit('update:modelValue', sourceContent.value)
  }
}

const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  // cancelled
  if (url === null) {
    return
  }

  // empty
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // update
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const addImage = () => {
  const url = window.prompt('Image URL')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

const addYoutube = () => {
  const url = window.prompt('YouTube URL')
  if (url) {
    editor.value?.chain().focus().setYoutubeVideo({ src: url }).run()
  }
}
</script>

<template>
  <div class="tiptap-editor border rounded-lg flex flex-col bg-white dark:bg-gray-900 dark:border-gray-700"
    :class="{ 'fixed inset-0 z-50 h-screen': isFullscreen }">
    <!-- Toolbar -->
    <div v-if="editor"
      class="border-b p-2 flex flex-wrap gap-1 items-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-10">
      <!-- History -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UButton color="neutral" variant="ghost" icon="i-lucide-undo" size="xs"
          @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-redo" size="xs"
          @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()" />
      </div>

      <!-- Text Formatting -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UButton color="neutral" variant="ghost" icon="i-lucide-bold" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('bold') }"
          @click="editor?.chain().focus().toggleBold().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-italic" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('italic') }"
          @click="editor?.chain().focus().toggleItalic().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-underline" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('underline') }"
          @click="editor?.chain().focus().toggleUnderline().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-strikethrough" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('strike') }"
          @click="editor?.chain().focus().toggleStrike().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-highlighter" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('highlight') }"
          @click="editor?.chain().focus().toggleHighlight().run()" />
      </div>

      <!-- Headings -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UButton color="neutral" variant="ghost" label="H1" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('heading', { level: 1 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" />
        <UButton color="neutral" variant="ghost" label="H2" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('heading', { level: 2 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" />
        <UButton color="neutral" variant="ghost" label="H3" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('heading', { level: 3 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" />
      </div>

      <!-- Lists & Alignment -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UButton color="neutral" variant="ghost" icon="i-lucide-list" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('bulletList') }"
          @click="editor?.chain().focus().toggleBulletList().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-list-ordered" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('orderedList') }"
          @click="editor?.chain().focus().toggleOrderedList().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-check-square" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('taskList') }"
          @click="editor?.chain().focus().toggleTaskList().run()" />

        <UButton color="neutral" variant="ghost" icon="i-lucide-align-left" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive({ textAlign: 'left' }) }"
          @click="editor?.chain().focus().setTextAlign('left').run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-align-center" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive({ textAlign: 'center' }) }"
          @click="editor?.chain().focus().setTextAlign('center').run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-align-right" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive({ textAlign: 'right' }) }"
          @click="editor?.chain().focus().setTextAlign('right').run()" />
      </div>

      <!-- Inserts -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UButton color="neutral" variant="ghost" icon="i-lucide-link" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('link') }" @click="setLink" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-image" size="xs" @click="addImage" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-youtube" size="xs" @click="addYoutube" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-table" size="xs"
          @click="editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-quote" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('blockquote') }"
          @click="editor?.chain().focus().toggleBlockquote().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-code" size="xs"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('codeBlock') }"
          @click="editor?.chain().focus().toggleCodeBlock().run()" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-minus" size="xs"
          @click="editor?.chain().focus().setHorizontalRule().run()" />
      </div>

      <!-- View Options -->
      <div class="flex gap-1 ml-auto">
        <UButton color="neutral" variant="ghost" :icon="viewSource ? 'i-lucide-eye' : 'i-lucide-code-2'" size="xs"
          @click="toggleViewSource" :title="viewSource ? 'View Preview' : 'View Source'" />
        <UButton color="neutral" variant="ghost" :icon="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
          size="xs" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'" />
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 overflow-y-auto relative min-h-[300px]" :class="{ 'p-4': !viewSource }">
      <TiptapEditorContent v-show="!viewSource" :editor="editor"
        class="prose dark:prose-invert max-w-none focus:outline-none h-full" />

      <textarea v-if="viewSource" v-model="sourceContent"
        class="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border-none resize-none focus:outline-none"
        @input="updateFromSource"></textarea>
    </div>

    <!-- Bubble Menu for Links/Images -->
    <TiptapBubbleMenu v-if="editor" :editor="editor" :tippy-options="{ duration: 100 }"
      v-show="editor.isActive('link')">
      <div class="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg p-1 flex gap-1">
        <UButton color="neutral" variant="ghost" icon="i-lucide-external-link" size="xs" @click="setLink" />
        <UButton color="error" variant="ghost" icon="i-lucide-link-2-off" size="xs"
          @click="editor.chain().focus().unsetLink().run()" />
      </div>
    </TiptapBubbleMenu>
  </div>
</template>

<style>
/* Basic Editor Styles */
.tiptap-editor .ProseMirror {
  outline: none;
  min-height: 100%;
}

.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Table Styles */
.tiptap-editor table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 0;
  overflow: hidden;
}

.tiptap-editor td,
.tiptap-editor th {
  min-width: 1em;
  border: 2px solid #ced4da;
  padding: 3px 5px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

.tiptap-editor th {
  font-weight: bold;
  text-align: left;
  background-color: #f1f3f5;
}

.dark .tiptap-editor th {
  background-color: #343a40;
  border-color: #495057;
}

.dark .tiptap-editor td {
  border-color: #495057;
}

.tiptap-editor .selectedCell:after {
  z-index: 2;
  position: absolute;
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}

/* Task List Styles */
.tiptap-editor ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}

.tiptap-editor ul[data-type="taskList"] li {
  display: flex;
}

.tiptap-editor ul[data-type="taskList"] li>label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

.tiptap-editor ul[data-type="taskList"] li>div {
  flex: 1 1 auto;
}
</style>
