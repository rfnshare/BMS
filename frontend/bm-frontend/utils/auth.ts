import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCurrentUser = async () => {
    const token = localStorage.getItem("access");
    if (!token) return null;

    try {
        const res = await axios.get(`${API_URL}/accounts/me/`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return res.data; // { username: "...", role: "...", ... }
    } catch (err) {
        console.error(err);
        return null;
    }
};


export const logout = async () => {
    try {
        const refresh = localStorage.getItem("refresh");
        const access = localStorage.getItem("access");
        if (!refresh || !access) return;

        await axios.post(
            `${API_URL}/accounts/logout/`,
            {refresh},
            {
                headers: {
                    Authorization: `Bearer ${access}`,
                },
            }
        );
    } catch (err) {
        console.error("Logout failed:", err);
    } finally {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
    }
};
export const isLoggedIn = () => {
    return !!localStorage.getItem("access");
};