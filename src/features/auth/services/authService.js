const USERS = [
    {
        username: "admin",
        password: "123456",
        role: "administrator",
        name: "Administrator"
    },
    {
        username: "moderator",
        password: "123456",
        role: "moderator",
        name: "Moderator"
    }
];

export function login(username, password) {

    const user = USERS.find(
        u =>
            u.username === username &&
            u.password === password
    );

    if (!user) {
        return null;
    }

    localStorage.setItem(
        "bp_user",
        JSON.stringify(user)
    );

    return user;

}

export function logout() {

    localStorage.removeItem("bp_user");

}

export function getCurrentUser() {

    const user = localStorage.getItem("bp_user");

    if (!user) {
        return null;
    }

    return JSON.parse(user);

}