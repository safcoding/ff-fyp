import { createMiddleware } from "@tanstack/react-start";
import { getSessionFn } from "./auth-serverFn";

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