import Cookies from 'js-cookie';

const TokenKey = 'User-Token';
const UserInfoKey = 'User-Info';

export function getToken() {
    return Cookies.get(TokenKey);
}

export function setToken(token) {
    return Cookies.set(TokenKey, token);
}

export function removeToken() {
    return Cookies.remove(TokenKey);
}

export function getUserInfo() {
    const userInfo = Cookies.get(UserInfoKey);
    return userInfo ? JSON.parse(userInfo) : null;
}

export function setUserInfo(userInfo) {
    return Cookies.set(UserInfoKey, JSON.stringify(userInfo));
}

export function removeUserInfo() {
    return Cookies.remove(UserInfoKey);
}

export function isAdmin() {
    const userInfo = getUserInfo();
    return userInfo && userInfo.isAdmin === true;
}

export function clearLoginInfo() {
    removeToken();
    removeUserInfo();
}