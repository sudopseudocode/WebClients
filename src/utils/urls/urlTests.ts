import Logger from "electron-log";
import { getConfig } from "../config";

const sessionRegex = /(?!:\/u\/)(\d+)(?!:\/)/g;
export const getSessionID = (url?: string) => {
    if (!url) {
        return null;
    }

    try {
        const pathName = new URL(url).pathname;

        const sessionID = pathName.match(sessionRegex)?.[0];

        if (isNaN(Number(sessionID))) {
            return null;
        }

        return sessionID;
    } catch (error) {
        Logger.error("getSessionID", error);
        return null;
    }
};

export const isCalendar = (urlString: string) => {
    try {
        const configURL = getConfig().url;
        const url = new URL(urlString);
        return configURL.calendar === url.origin;
    } catch (error) {
        return false;
    }
};

export const isMail = (urlString: string) => {
    try {
        const configURL = getConfig().url;
        const url = new URL(urlString);
        return configURL.mail === url.origin;
    } catch (error) {
        return false;
    }
};

const isCalendarHome = (urlString: string) => {
    try {
        const configURL = getConfig().url;
        const url = new URL(urlString);

        if (configURL.calendar !== url.origin) {
            return false;
        }

        return url.pathname === "" || url.pathname === "/" || /^\/u\/(\d+)\/?$/.test(url.pathname);
    } catch (error) {
        return false;
    }
};

const isMailHome = (urlString: string) => {
    try {
        const configURL = getConfig().url;
        const url = new URL(urlString);

        if (configURL.mail !== url.origin) {
            return false;
        }

        return (
            url.pathname === "" ||
            url.pathname === "/" ||
            /^\/u\/(\d+)\/?$/.test(url.pathname) || // /u/0
            /^\/u\/(\d+)\/inbox\/?$/.test(url.pathname) // /u/0/inbox
        );
    } catch (error) {
        return false;
    }
};

export const isAccount = (urlString: string) => {
    try {
        const configURL = getConfig().url;
        const url = new URL(urlString);
        return configURL.account === url.origin;
    } catch (error) {
        return false;
    }
};

export const isAccountAuthorize = (urlString: string) => {
    try {
        const configURL = getConfig().url;
        const url = new URL(urlString);

        if (configURL.account !== url.origin) {
            return false;
        }

        return /^\/authorize\/?$/i.test(url.pathname);
    } catch (error) {
        return false;
    }
};

export const isAccountSwitch = (urlString: string) => {
    try {
        const configURL = getConfig().url;
        const url = new URL(urlString);

        if (configURL.account !== url.origin) {
            return false;
        }

        return /^\/switch\/?$/i.test(url.pathname);
    } catch (error) {
        return false;
    }
};

export const isAccoutLite = (host: string) => {
    try {
        const hostURl = new URL(host);
        return hostURl.pathname.includes("/lite");
    } catch (error) {
        Logger.error("isAccoutLite", error);
        return false;
    }
};

export const isUpgradeURL = (host: string) => {
    try {
        const hostURL = new URL(host);
        return hostURL.pathname.includes("/upgrade") && hostURL.searchParams.size > 0;
    } catch (error) {
        Logger.error("isUpgradeURL", error);
        return false;
    }
};

export const isUpsellURL = (host: string) => {
    try {
        const hostURl = new URL(host);
        const plan = hostURl.searchParams.get("plan");
        const billing = hostURl.searchParams.get("billing");
        const currency = hostURl.searchParams.get("currency");
        const coupon = hostURl.searchParams.get("coupon");
        return hostURl.pathname.includes("/signup") && (plan || billing || currency || coupon);
    } catch (error) {
        Logger.error("isUpsellURL", error);
        return false;
    }
};

export const isHostAllowed = (host: string) => {
    try {
        const configURL = getConfig().url;
        let finalURL = host;
        if (!finalURL.startsWith("https://")) {
            finalURL = "https://" + finalURL;
        }

        const hostURl = new URL(finalURL);

        return Object.values(configURL)
            .map((item) => new URL(item))
            .some((url) => {
                return url.host === hostURl.host;
            });
    } catch (error) {
        Logger.error("isHostAllowed", error);
        return false;
    }
};

export const isSameURL = (urlA: string, urlB: string) => {
    if (urlA === urlB) {
        return true;
    }

    if (urlA.replace(/\/$/, "") === urlB.replace(/\/$/, "")) {
        return true;
    }

    if (isMailHome(urlA) && isMailHome(urlB)) {
        return true;
    }

    if (isCalendarHome(urlA) && isCalendarHome(urlB)) {
        return true;
    }

    return false;
};
