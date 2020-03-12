import { StampId } from '@/types/entity-ids'
import apis from '@/lib/api'
import store from '@/store'

export interface StampCreatedEvent {
  type: 'STAMP_CREATED'
  body: {
    id: StampId
  }
}
export const onStampCreated = async ({ id }: StampCreatedEvent['body']) => {
  const res = await apis.getStamp(id)
  store.commit.entities.addStamp({ id, entity: res.data })
}

export interface StampModifiedEvent {
  type: 'STAMP_MODIFIED'
  body: {
    id: StampId
  }
}
export const onStampModified = async ({ id }: StampModifiedEvent['body']) => {
  const res = await apis.getStamp(id)
  store.commit.entities.extendStamps({ [id]: res.data })
}

export interface StampDeletedEvent {
  type: 'STAMP_DELETED'
  body: {
    id: StampId
  }
}
export const onStampDeleted = ({ id }: StampDeletedEvent['body']) => {
  store.commit.entities.deleteStamp(id)
}

/*
      FAVORITE_STAMP_ADDED
        "id": ev.Fields["stamp_id"].(uuid.UUID),
      FAVORITE_STAMP_REMOVED
        "id": ev.Fields["stamp_id"].(uuid.UUID),
*/
