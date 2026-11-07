import { supabase } from "./supabase";

export const apiBaseUrl = (
    import.meta.env.VITE_API_URL || ""
).replace(/\/+$/, "");

export function apiUrl(path: string): string {
    return `${apiBaseUrl}${path}`;
}

export async function apiFetch(
    input: RequestInfo | URL,
    init: RequestInit = {},
): Promise<Response> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const headers = new Headers(init.headers);
    if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
    }
    const requestUrl =
        typeof input === "string" && input.startsWith("/")
            ? apiUrl(input)
            : input;
    return fetch(requestUrl, { ...init, headers });
}
