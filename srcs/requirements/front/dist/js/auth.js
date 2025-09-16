export async function getCurrentUser() {
    const res = await fetch("/auth/me", {
        credentials: "include",
    });
    if (res.ok) {
        return await res.json();
    }
    else {
        return null;
    }
}
