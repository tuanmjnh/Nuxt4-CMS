<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { Markdown } from 'tiptap-markdown'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { Youtube } from '@tiptap/extension-youtube'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Icon Node to render and preserve plain HTML spans for icons
 */
const IconNode = Node.create({
  name: 'icon',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      class: {
        default: null,
      },
      'aria-hidden': {
        default: 'true',
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          if (element instanceof HTMLElement && element.classList.contains('iconify')) {
            return {
              class: element.getAttribute('class'),
              'aria-hidden': element.getAttribute('aria-hidden')
            }
          }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), '']
  },
})

// const colorMode = useColorMode()
const props = defineProps<{ modelValue: string }>()

const emit = defineEmits(['update:modelValue'])

const isFullscreen = ref(false)
const viewSource = ref(false)
const sourceContent = ref('')

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image,
    Link.configure({
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
    // Custom Icon Node
    IconNode,
    Markdown.configure({
      html: true,
      transformCopiedText: true,
      extensions: [
        {
          name: 'icon',
          serialize(state: any, node: any) {
            // Serialize to the exact HTML string expected by the user
            state.write(`<span class="${node.attrs.class}" aria-hidden="true"></span>`)
          }
        }
      ]
    } as any),
    BubbleMenuExtension
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

const isModalOpen = ref(false)
const modalType = ref<'link' | 'image' | 'youtube' | 'emoji' | 'icon'>('link')
const modalValue = ref('')
const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'link': return 'Link URL'
    case 'image': return 'Image URL'
    case 'youtube': return 'YouTube URL'
    case 'emoji': return 'Emoji'
    case 'icon': return 'Icon'
    default: return ''
  }
})

const setLink = () => {
  modalType.value = 'link'
  modalValue.value = editor.value?.getAttributes('link').href || ''
  isModalOpen.value = true
}

const addImage = () => {
  modalType.value = 'image'
  modalValue.value = ''
  isModalOpen.value = true
}

const addYoutube = () => {
  modalType.value = 'youtube'
  modalValue.value = ''
  isModalOpen.value = true
}

const addEmoji = () => {
  modalType.value = 'emoji'
  modalValue.value = ''
  isModalOpen.value = true
}

const addIcon = () => {
  modalType.value = 'icon'
  modalValue.value = ''
  isModalOpen.value = true
}

const handleModalSubmit = () => {
  const value = modalValue.value

  if (modalType.value === 'link') {
    if (value === '') {
      editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.value?.chain().focus().extendMarkRange('link').setLink({ href: value }).run()
    }
  } else if (modalType.value === 'image') {
    if (value) {
      editor.value?.chain().focus().setImage({ src: value }).run()
    }
  } else if (modalType.value === 'youtube') {
    if (value) {
      editor.value?.chain().focus().setYoutubeVideo({ src: value }).run()
    }
  } else if (modalType.value === 'emoji') {
    if (value) {
      editor.value?.chain().focus().insertContent(value).run()
    }
  } else if (modalType.value === 'icon') {
    if (value) {
      let iconClass = value
      if (value.startsWith('i-lucide-')) {
        iconClass = value.replace(/^i-lucide-/, 'i-lucide:')
      } else if (value.startsWith('i-simple-icons-')) {
        iconClass = value.replace(/^i-simple-icons-/, 'i-simple-icons:')
      }

      // This content matches the structure our IconNode parses
      const content = `<span class="iconify ${iconClass} size-5" aria-hidden="true"></span>`
      editor.value?.chain().focus().insertContent(content).run()
    }
  }

  isModalOpen.value = false
  modalValue.value = ''
}

// const toggleTheme = () => {
//   colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
// }
</script>

<template>
  <div class="tiptap-editor border rounded-lg flex flex-col bg-white dark:bg-gray-900 dark:border-gray-700"
    :class="{ 'fixed inset-0 z-50 h-screen': isFullscreen }">
    <!-- Toolbar -->
    <div v-if="editor"
      class="border-b p-2 flex flex-wrap gap-1 items-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-10">
      <!-- History -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UTooltip :text="$t('editor.undo')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-undo" size="xs"
            @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()" />
        </UTooltip>
        <UTooltip :text="$t('editor.redo')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-redo" size="xs"
            @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()" />
        </UTooltip>
      </div>

      <!-- Text Formatting -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UTooltip :text="$t('editor.bold')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-bold" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('bold') }"
            @click="editor?.chain().focus().toggleBold().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.italic')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-italic" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('italic') }"
            @click="editor?.chain().focus().toggleItalic().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.underline')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-underline" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('underline') }"
            @click="editor?.chain().focus().toggleUnderline().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.strike')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-strikethrough" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('strike') }"
            @click="editor?.chain().focus().toggleStrike().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.highlight')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-highlighter" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('highlight') }"
            @click="editor?.chain().focus().toggleHighlight().run()" />
        </UTooltip>
      </div>

      <!-- Headings -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UTooltip :text="$t('editor.h1')">
          <UButton color="neutral" variant="ghost" label="H1" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('heading', { level: 1 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.h2')">
          <UButton color="neutral" variant="ghost" label="H2" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('heading', { level: 2 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.h3')">
          <UButton color="neutral" variant="ghost" label="H3" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('heading', { level: 3 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" />
        </UTooltip>
      </div>

      <!-- Lists & Alignment -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UTooltip :text="$t('editor.bullet_list')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-list" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('bulletList') }"
            @click="editor?.chain().focus().toggleBulletList().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.ordered_list')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-list-ordered" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('orderedList') }"
            @click="editor?.chain().focus().toggleOrderedList().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.task_list')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-check-square" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('taskList') }"
            @click="editor?.chain().focus().toggleTaskList().run()" />
        </UTooltip>

        <UTooltip :text="$t('editor.align_left')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-align-left" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive({ textAlign: 'left' }) }"
            @click="editor?.chain().focus().setTextAlign('left').run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.align_center')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-align-center" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive({ textAlign: 'center' }) }"
            @click="editor?.chain().focus().setTextAlign('center').run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.align_right')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-align-right" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive({ textAlign: 'right' }) }"
            @click="editor?.chain().focus().setTextAlign('right').run()" />
        </UTooltip>
      </div>

      <!-- Inserts -->
      <div class="flex gap-1 border-r pr-2 mr-1 dark:border-gray-700">
        <UTooltip :text="$t('editor.link')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-link" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('link') }" @click="setLink" />
        </UTooltip>
        <UTooltip :text="$t('editor.image')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-image" size="xs" @click="addImage" />
        </UTooltip>
        <UTooltip :text="$t('editor.youtube')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-youtube" size="xs" @click="addYoutube" />
        </UTooltip>
        <UTooltip :text="$t('editor.table')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-table" size="xs"
            @click="editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.quote')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-quote" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('blockquote') }"
            @click="editor?.chain().focus().toggleBlockquote().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.code')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-code" size="xs"
            :class="{ 'bg-gray-200 dark:bg-gray-700': editor?.isActive('codeBlock') }"
            @click="editor?.chain().focus().toggleCodeBlock().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.horizontal_rule')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-minus" size="xs"
            @click="editor?.chain().focus().setHorizontalRule().run()" />
        </UTooltip>
        <UTooltip :text="$t('editor.emoji')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-smile" size="xs" @click="addEmoji" />
        </UTooltip>
        <UTooltip :text="$t('editor.select_icon')">
          <UButton color="neutral" variant="ghost" icon="i-lucide-shapes" size="xs" @click="addIcon" />
        </UTooltip>
      </div>

      <!-- View Options -->
      <div class="flex gap-1 ml-auto">
        <UTooltip :text="viewSource ? $t('editor.view_preview') : $t('editor.view_source')">
          <UButton color="neutral" variant="ghost" :icon="viewSource ? 'i-lucide-eye' : 'i-lucide-code-2'" size="xs"
            @click="toggleViewSource" />
        </UTooltip>
        <!-- <UTooltip :text="colorMode.value === 'dark' ? $t('editor.light_mode') : $t('editor.dark_mode')">
          <UButton color="neutral" variant="ghost" :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            size="xs" @click="toggleTheme" />
        </UTooltip> -->
        <UTooltip :text="isFullscreen ? $t('editor.exit_fullscreen') : $t('editor.fullscreen')">
          <UButton color="neutral" variant="ghost" :icon="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
            size="xs" @click="toggleFullscreen" />
        </UTooltip>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 overflow-y-auto relative min-h-[300px]" :class="{ 'p-4': !viewSource }">
      <EditorContent v-show="!viewSource" :editor="editor"
        class="prose dark:prose-invert max-w-none focus:outline-none h-full" />

      <textarea v-if="viewSource" v-model="sourceContent"
        class="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border-none resize-none focus:outline-none"
        @input="updateFromSource"></textarea>
    </div>

    <!-- Bubble Menu for Links/Images -->
    <BubbleMenu v-if="editor" :editor="editor" :tippy-options="{ duration: 100 }" v-show="editor.isActive('link')">
      <div class="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg p-1 flex gap-1">
        <UButton color="neutral" variant="ghost" icon="i-lucide-external-link" size="xs" @click="setLink" />
        <UButton color="error" variant="ghost" icon="i-lucide-link-2-off" size="xs"
          @click="editor.chain().focus().unsetLink().run()" />
      </div>
    </BubbleMenu>

    <!-- Generic Input Modal -->
    <!-- <UModal v-model:open="isModalOpen" :title="$t('editor.' + (modalType === 'emoji' ? 'enter_emoji' : (modalType === 'icon' ? 'select_icon' :
      'enter_url')))"> -->
    <UModal v-model:open="isModalOpen" :model="false" :ui="{ header: 'justify-between', footer: 'justify-end' }"
      :title="$t('editor.' + (modalType === 'emoji' ? 'enter_emoji' : (modalType === 'icon' ? 'select_icon' : 'enter_url')))">
      <!-- <template #header>
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          {{
            $t('editor.' + (modalType === 'emoji' ? 'enter_emoji' :
              (modalType === 'icon' ? 'select_icon' :
                'enter_url')))
          }}
        </h3> -->
      <!-- <div class="flex gap-1"> -->
      <!-- <UButton type="submit" color="primary" @click="handleModalSubmit">{{ $t('editor.insert') }}</UButton> -->
      <!-- <UButton color="neutral" variant="ghost" icon="i-lucide-x" size="xs" @click="isModalOpen = false" /> -->
      <!-- </div> -->
      <!-- </template> -->
      <template #body>
        <div v-if="modalType === 'icon'" class="p-1">
          <IconSelector v-model="modalValue" @select="handleModalSubmit" />
        </div>
        <div v-else-if="modalType === 'emoji'" class="p-1 h-[400px]">
          <EmojiSelector v-model="modalValue" @select="handleModalSubmit" />
        </div>

        <form v-else @submit.prevent="handleModalSubmit" class="space-y-4">
          <UFormField :label="$t('editor.url')" name="value">
            <UInput v-model="modalValue" autofocus :placeholder="$t('editor.enter_url')" />
          </UFormField>
        </form>
      </template>
      <template v-if="modalType !== 'icon' && modalType !== 'emoji'" #footer>
        <UButton type="submit" color="primary" @click="handleModalSubmit">{{ $t('editor.insert') }}</UButton>
      </template>
    </UModal>
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
