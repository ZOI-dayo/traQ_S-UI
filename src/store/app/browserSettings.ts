import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, toRefs } from 'vue'
import { replacePrefix } from '/@/lib/basic/string'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/use/indexedDbValue'
import { channelTreeMitt } from '/@/vuex/domain/channelTree'

type State = {
  openMode: OpenMode
  lastOpenChannelName: string
  openChannelName: string
  sendWithModifierKey: SendKey
  modifierKey: SendKeys
  ecoMode: boolean
  activityMode: ActivityMode
  filterStarChannel: boolean
}

export type SendKey = 'modifier' | 'none'
export interface SendKeys {
  /**
   * Windows: Alt, Mac: ⌥(Option)
   */
  alt: boolean
  /**
   * Windows: Ctrl, Mac: ⌘(Command)
   */
  ctrl: boolean
  /**
   * Windows: Shift, Mac: Shift
   */
  shift: boolean
  /**
   * Windows: なし, Mac: Ctrl
   */
  macCtrl: boolean
}
export type OpenMode = 'lastOpen' | 'particular'
export interface ActivityMode {
  all: boolean
  perChannel: boolean
}

const useBrowserSettingsPinia = defineStore('app/browserSettings', () => {
  const initialValue: State = {
    openMode: 'particular',
    lastOpenChannelName: 'general',
    openChannelName: 'general',
    sendWithModifierKey: 'modifier',
    modifierKey: { alt: true, ctrl: true, shift: true, macCtrl: true },
    ecoMode: false,
    activityMode: { all: false, perChannel: false },
    filterStarChannel: false
  }

  const [state, loading, loadingPromise] = useIndexedDbValue(
    'app/browserSettings',
    1,
    {
      0: async (db, tx) => {
        // TODO: migrate from vuex
        //
        // const vuexStore = indexedDBStorage.getItem('vuex')
        // if (!vuexStore) return
        // if (!isObjectAndHasKey(vuexStore, 'app')) return
        // if (!isObjectAndHasKey(vuexStore.app, 'browserSettings')) return
        // tx.objectStore('store').add(vuexStore.app.browserSettings, 'key')
      }
    },
    initialValue
  )

  const defaultChannelName = computed(() => {
    switch (state.openMode) {
      case 'lastOpen':
        return state.lastOpenChannelName
      case 'particular':
        return state.openChannelName
      default: {
        const invalid: never = state.openMode
        // eslint-disable-next-line no-console
        console.warn('Invalid app/browserSettings.openMode:', invalid)
        return state.openChannelName
      }
    }
  })

  const updateOpenChannelNames = async ({
    oldName,
    newName
  }: {
    oldName: string
    newName: string
  }) => {
    await loadingPromise.value

    state.openChannelName = replacePrefix(
      state.openChannelName,
      oldName,
      newName
    )
    state.lastOpenChannelName = replacePrefix(
      state.lastOpenChannelName,
      oldName,
      newName
    )
  }

  channelTreeMitt.on('moved', ({ oldPath, newPath }) => {
    updateOpenChannelNames({
      oldName: oldPath,
      newName: newPath
    })
  })

  return { ...toRefs(state), loading, loadingPromise, defaultChannelName }
})

export const useBrowserSettings = convertToRefsStore(useBrowserSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useBrowserSettingsPinia, import.meta.hot)
  )
}
