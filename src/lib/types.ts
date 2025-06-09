import type { RESTGetAPICurrentUserGuildsResult, RESTGetAPICurrentUserResult } from 'discord-api-types/v10';

export interface LocalUserData extends RESTGetAPICurrentUserResult {
    guilds: RESTGetAPICurrentUserGuildsResult;
}