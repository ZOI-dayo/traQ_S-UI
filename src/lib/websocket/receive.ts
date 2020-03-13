import {
  UserJoinedEvent,
  onUserJoined,
  UserLeftEvent,
  onUserLeft,
  UserTagsUpdatedEvent,
  onUserTagsUpdated,
  UserIconUpdatedEvent,
  onUserIconUpdated,
  UserOnlineEvent,
  onUserOnline,
  UserOfflineEvent,
  onUserOffline,
  UserWebRTCStateChangedEvent,
  onUserWebRTCStateChanged,
  UserGroupCreatedEvent,
  onUserGroupCreated,
  UserGroupUpdatedEvent,
  onUserGroupUpdated,
  UserGroupDeletedEvent,
  onUserGroupDeleted
} from './user'
import {
  ChannelCreatedEvent,
  onChannelCreated,
  ChannelDeletedEvent,
  onChannelDeleted,
  ChannelUpdatedEvent,
  onChannelUpdated,
  ChannelStaredEvent,
  onChannelStared,
  ChannelUnstaredEvent,
  onChannelUnstared,
  ChannelViewersChangedEvent,
  onChannelViewersChanged
} from './channel'
import {
  MessageCreatedEvent,
  onMessageCreated,
  MessageUpdatedEvent,
  onMessageUpdated,
  MessageDeletedEvent,
  onMessageDeleted,
  MessageReadEvent,
  onMessageRead,
  MessageStampedEvent,
  onMessageStamped,
  MessageUnstampedEvent,
  onMessageUnstamped,
  MessagePinnedEvent,
  onMessagePinned,
  MessageUnpinnedEvent,
  onMessageUnpinned
} from './message'
import {
  StampCreatedEvent,
  onStampCreated,
  StampUpdatedEvent,
  onStampUpdated,
  StampDeletedEvent,
  onStampDeleted
} from './stamp'

type WebSocketEvent =
  | UserJoinedEvent
  | UserLeftEvent
  | UserTagsUpdatedEvent
  | UserIconUpdatedEvent
  | UserOnlineEvent
  | UserOfflineEvent
  | UserWebRTCStateChangedEvent
  | UserGroupCreatedEvent
  | UserGroupUpdatedEvent
  | UserGroupDeletedEvent
  | ChannelCreatedEvent
  | ChannelDeletedEvent
  | ChannelUpdatedEvent
  | ChannelStaredEvent
  | ChannelUnstaredEvent
  | ChannelViewersChangedEvent
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent
  | MessageReadEvent
  | MessageStampedEvent
  | MessageUnstampedEvent
  | MessagePinnedEvent
  | MessageUnpinnedEvent
  | StampCreatedEvent
  | StampUpdatedEvent
  | StampDeletedEvent

export const onReceive = (data: string) => {
  const event = JSON.parse(data) as WebSocketEvent

  if (event.type === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[WebSocket] Invalid Event Received: ${data}`)
    return
  }

  switch (event.type) {
    case 'USER_JOINED':
      onUserJoined(event.body)
      break
    case 'USER_LEFT':
      onUserLeft(event.body)
      break
    case 'USER_TAGS_UPDATED':
      onUserTagsUpdated(event.body)
      break
    case 'USER_ICON_UPDATED':
      onUserIconUpdated(event.body)
      break
    case 'USER_ONLINE':
      onUserOnline(event.body)
      break
    case 'USER_OFFLINE':
      onUserOffline(event.body)
      break
    case 'USER_WEBRTC_STATE_CHANGED':
      onUserWebRTCStateChanged(event.body)
      break
    case 'USER_GROUP_CREATED':
      onUserGroupCreated(event.body)
      break
    case 'USER_GROUP_UPDATED':
      onUserGroupUpdated(event.body)
      break
    case 'USER_GROUP_DELETED':
      onUserGroupDeleted(event.body)
      break
    case 'CHANNEL_CREATED':
      onChannelCreated(event.body)
      break
    case 'CHANNEL_DELETED':
      onChannelDeleted(event.body)
      break
    case 'CHANNEL_UPDATED':
      onChannelUpdated(event.body)
      break
    case 'CHANNEL_STARED':
      onChannelStared(event.body)
      break
    case 'CHANNEL_UNSTARED':
      onChannelUnstared(event.body)
      break
    case 'CHANNEL_VIEWERS_CHANGED':
      onChannelViewersChanged(event.body)
      break
    case 'MESSAGE_CREATED':
      onMessageCreated(event.body)
      break
    case 'MESSAGE_UPDATED':
      onMessageUpdated(event.body)
      break
    case 'MESSAGE_DELETED':
      onMessageDeleted(event.body)
      break
    case 'MESSAGE_READ':
      onMessageRead(event.body)
      break
    case 'MESSAGE_STAMPED':
      onMessageStamped(event.body)
      break
    case 'MESSAGE_UNSTAMPED':
      onMessageUnstamped(event.body)
      break
    case 'MESSAGE_PINNED':
      onMessagePinned(event.body)
      break
    case 'MESSAGE_UNPINNED':
      onMessageUnpinned(event.body)
      break
    case 'STAMP_CREATED':
      onStampCreated(event.body)
      break
    case 'STAMP_UPDATED':
      onStampUpdated(event.body)
      break
    case 'STAMP_DELETED':
      onStampDeleted(event.body)
      break
  }
}
