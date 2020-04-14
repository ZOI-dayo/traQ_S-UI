import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messagesView } from './index'
import { ChannelId, MessageId } from '@/types/entity-ids'
import { Message } from '@traptitech/traq'
import { render } from '@/lib/markdown'
import { embeddingExtractor } from '@/lib/embeddingExtractor'

export const messagesViewActionContext = (context: any) =>
  moduleActionContext(context, messagesView)

export const actions = defineActions({
  async changeCurrentChannel(context, channelId: ChannelId) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (state.currentChannelId === channelId) return

    commit.setCurrentChannelId(channelId)
    commit.unsetLoadedMessageOldestDate()
    commit.unsetLoadedMessageLatestDate()
    commit.setMessageIds([])
    commit.setRenderedContent({})

    if (state.entryMessageId) {
      commit.setIsReachedEnd(false)
      commit.setIsReachedLatest(false)
      dispatch.fetchAndRenderChannelMessageAroundEntryMessage()
    } else {
      commit.setIsReachedEnd(false)
      commit.setIsReachedLatest(true)
      dispatch.fetchAndRenderChannelFormerMessages()
    }
  },

  /** 読み込まれているメッセージより前のメッセージを取得し、HTMLにレンダリングする */
  async fetchAndRenderChannelFormerMessages(context) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    const messageIds = await dispatch.fetchChannelFormerMessages()
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds([...messageIds.reverse(), ...state.messageIds])
  },

  /** 読み込まれているメッセージより後のメッセージを取得し、HTMLにレンダリングする */
  async fetchAndRenderChannelLatterMessages(context) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    const messageIds = await dispatch.fetchChannelLatterMessages()
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds([...state.messageIds, ...messageIds])
  },

  /** エントリーメッセージ周辺のメッセージを取得し、HTMLにレンダリングする */
  async fetchAndRenderChannelMessageAroundEntryMessage(context) {
    const { state, commit, dispatch } = messagesViewActionContext(context)
    if (!state.entryMessageId) {
      return
    }
    const [formerMessageIds, latterMessageIds] = await Promise.all([
      dispatch.fetchChannelFormerMessages(),
      dispatch.fetchChannelFormerMessages()
    ])
    const messageIds = [
      ...formerMessageIds.reverse(),
      state.entryMessageId,
      ...latterMessageIds
    ]
    await Promise.all(
      messageIds.map(messageId => dispatch.renderMessageContent(messageId))
    )
    commit.setMessageIds(messageIds)
  },

  /** 読み込まれているメッセージより前のメッセージを取得し、idを返す */
  async fetchChannelFormerMessages(context): Promise<ChannelId[]> {
    const { state, commit, rootDispatch } = messagesViewActionContext(context)
    if (state.isReachedEnd) return []
    const {
      messages,
      hasMore
    } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: state.fetchLimit,
      order: 'desc',
      until: state.loadedMessageOldestDate
    })

    if (!hasMore) {
      commit.setIsReachedEnd(true)
    }

    const oldestMessage = messages[messages.length - 1]
    const oldestMessageDate = new Date(oldestMessage.createdAt)
    if (
      !state.loadedMessageOldestDate ||
      oldestMessageDate < state.loadedMessageOldestDate
    ) {
      commit.setLoadedMessageOldestDate(oldestMessageDate)
    }

    return messages.map((message: Message) => message.id ?? '')
  },

  /** 読み込まれているメッセージより後のメッセージを取得し、idを返す */
  async fetchChannelLatterMessages(context): Promise<ChannelId[]> {
    const { state, commit, rootDispatch } = messagesViewActionContext(context)
    if (state.isReachedLatest) return []
    const {
      messages,
      hasMore
    } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: state.fetchLimit,
      order: 'asc',
      since: state.loadedMessageLatestDate
    })

    if (!hasMore) {
      commit.setIsReachedLatest(true)
    }

    const latestMessage = messages[messages.length - 1]
    const latestMessageDate = new Date(latestMessage.createdAt)
    if (
      !state.loadedMessageLatestDate ||
      latestMessageDate > state.loadedMessageLatestDate
    ) {
      commit.setLoadedMessageLatestDate(latestMessageDate)
    }

    return messages.map((message: Message) => message.id ?? '')
  },

  async fetchChannelLatestMessage(context) {
    const { state, commit, dispatch, rootDispatch } = messagesViewActionContext(
      context
    )
    const { messages } = await rootDispatch.entities.fetchMessagesByChannelId({
      channelId: state.currentChannelId,
      limit: 1,
      offset: 0
    })
    if (messages.length !== 1) return
    commit.setLoadedMessageLatestDate(new Date(messages[0].createdAt))
    const messageId = messages[0].id
    await dispatch.renderMessageContent(messageId)
    commit.setMessageIds([...state.messageIds, messageId])
  },
  async renderMessageContent(context, messageId: string) {
    const { commit, rootState, rootDispatch } = messagesViewActionContext(
      context
    )
    const content = rootState.entities.messages[messageId]?.content ?? ''

    const extracted = embeddingExtractor(content)

    await Promise.all(
      extracted.embeddings.map(async e =>
        rootDispatch.entities.fetchFileMetaByFileId(e.id)
      )
    )

    const renderedContent = render(extracted.text)
    commit.addRenderedContent({ messageId, renderedContent })
    commit.addEmbededFile({ messageId, files: extracted.embeddings })
  }
})
