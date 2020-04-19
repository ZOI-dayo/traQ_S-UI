import { computed, SetupContext } from '@vue/composition-api'
import store from '@/store'
import { buildFilePath } from '@/lib/api'
import { mimeToFileType, prettifyFileSize } from '@/lib/util/file'
import useFileLink from '@/use/fileLink'

const useFileMeta = (props: { fileId: string }, context: SetupContext) => {
  const fileMeta = computed(
    () => store.state.entities.fileMetaData[props.fileId]
  )
  const { fileLink, onFileDownloadLinkClick, onFileLinkClick } = useFileLink(
    props,
    context
  )
  const fileRawPath = computed(() =>
    fileMeta.value ? buildFilePath(fileMeta.value.id) : ''
  )
  const fileType = computed(() =>
    fileMeta.value ? mimeToFileType(fileMeta.value.mime) : 'file'
  )
  const fileSize = computed(() =>
    fileMeta.value ? prettifyFileSize(fileMeta.value.size) : '0B'
  )
  const fileIconName = computed(() => {
    switch (fileType.value) {
      case 'file':
        return 'file'
      case 'audio':
        return 'file-music'
      default:
        return `file-${fileType.value}`
    }
  })
  return {
    fileMeta,
    fileLink,
    fileRawPath,
    fileType,
    fileSize,
    fileIconName,
    onFileLinkClick,
    onFileDownloadLinkClick
  }
}

export default useFileMeta
