import type { CurrentGuildResponse } from "@daalbot/api/dist/src/modules/currentGuild";
import type { DBAPI } from "@daalbot/api";

function createState() {
    let guild = $state<CurrentGuildResponse | undefined>(undefined);
    let api = $state<DBAPI | undefined>(undefined);

    return {
        get guild() { return guild },
        set guild(value) { guild = value },
        get api() { return api },
        set api(value) { api = value }
    }
}

export const state = createState();