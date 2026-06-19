import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { timeServerTask } from "@/lib/server-timing";

export const getSessionFn = createServerFn({ method: "GET" }).handler(
    async () => {
        const session = await timeServerTask('auth.getSession', async () => {
            const headers = getRequestHeaders();
            return auth.api.getSession({
                headers,
            });
        });

        return session;
    },
);
