import { createMiddleware } from "@tanstack/react-start";
import { getSessionFn } from "./auth-serverFn";
import { assertAdminSession } from "./authz";

const authMiddleware = createMiddleware({ type: "function" }).server(
    async ({ next }) => {
        const session = await getSessionFn();

        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        return next({ context: { session } });
    },
);

export default authMiddleware;

export const adminOnlyMiddleware = createMiddleware({ type: "function" }).server(
    async ({ next }) => {
        const session = await getSessionFn();

        assertAdminSession(session);

        return next({ context: { session } });
    },
);
