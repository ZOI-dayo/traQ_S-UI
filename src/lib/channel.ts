import { count } from '@/lib/util/string'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from '@traptitech/traq'
import { dmParentUuid } from '@/lib/util/uuid'
import { ChannelLike } from './channelTree'

const MAX_CHANNEL_DEPTH = 5
const MAX_CHANNEL_PATH_SLASHES = MAX_CHANNEL_DEPTH - 1

export const canCreateChildChannel = (
  channelPath: string,
  isArchived = false
) => !isArchived && count(channelPath, '/') < MAX_CHANNEL_PATH_SLASHES

export type SimpleChannel = {
  id: ChannelId
  name: string
}

export const channelIdToSimpleChannelPath = (
  channelId: ChannelId,
  channelMap: ReadonlyMap<ChannelId, Channel>
): SimpleChannel[] => {
  let channel = channelMap.get(channelId)
  if (!channel) {
    return []
  }

  const res = [{ id: channel.id, name: channel.name }]
  while (channel?.parentId && channel.parentId !== dmParentUuid) {
    channel = channelMap.get(channel.parentId)
    if (channel) {
      res.unshift({ id: channel.id, name: channel.name })
    }
  }
  return res
}

export const channelIdToPathString = (
  channelId: ChannelId,
  channelMap: ReadonlyMap<ChannelId, Channel>
): string => {
  const simpleChannelPath = channelIdToSimpleChannelPath(channelId, channelMap)
  return simpleChannelPath.map(c => c.name).join('/')
}

export type CheckResult = 'none' | 'match' | 'perfect'

export interface MatchResult<T extends ChannelLike> {
  perfectMatched: T[]
  matched: T[]
}

const checkMatchChannel = (
  channel: ChannelLike,
  query: string
): CheckResult => {
  if (channel.name === query) return 'perfect'
  if (channel.name.includes(query)) return 'match'
  return 'none'
}

/**
 * 連続するチャンネルに対し、連続する条件を満たすようなチャンネルを得る関数
 * @param channelMap チャンネルの id とチャンネル情報を対応付ける map
 * @param querys 連続するクエリ
 * @param targetChannelMap 対象のチャンネルの map
 * @returns 条件を満たすようなチャンネルの配列
 */
export const channelDeepMatching = <T extends ChannelLike>(
  channelMap: ReadonlyMap<ChannelId, T>,
  querys: readonly [string, ...string[]],
  targetChannelMap: ReadonlySet<ChannelId> = new Set(channelMap.keys())
): MatchResult<T> => {
  const results = [...channelMap.values()].map(channel =>
    channelRecursiveDeepMatching(
      channelMap,
      querys,
      channel.id,
      targetChannelMap
    )
  )
  return {
    perfectMatched: results.flatMap(result => result.perfectMatched),
    matched: results.flatMap(result => result.matched)
  }
}

const channelRecursiveDeepMatching = <T extends ChannelLike>(
  channelMap: ReadonlyMap<ChannelId, T>,
  restQuery: readonly [string, ...string[]],
  nowChannelId: ChannelId,
  targetChannelMap: ReadonlySet<ChannelId>,
  stillPerfect = true
): MatchResult<T> => {
  const nowChannel = channelMap.get(nowChannelId)
  if (nowChannel === undefined) return { perfectMatched: [], matched: [] }
  const check = checkMatchChannel(nowChannel, restQuery[0])
  if (check === 'none') return { perfectMatched: [], matched: [] }
  if (restQuery.length === 1) {
    if (!targetChannelMap.has(nowChannelId)) {
      return { perfectMatched: [], matched: [] }
    }
    return stillPerfect && check === 'perfect'
      ? { perfectMatched: [nowChannel], matched: [] }
      : { perfectMatched: [], matched: [nowChannel] }
  }
  const res = nowChannel.children.map(id =>
    channelRecursiveDeepMatching(
      channelMap,
      restQuery.slice(1) as [string, ...string[]],
      id,
      targetChannelMap,
      stillPerfect && check === 'perfect'
    )
  )
  return {
    perfectMatched: res.flatMap(result => result.perfectMatched),
    matched: res.flatMap(result => result.matched)
  }
}
