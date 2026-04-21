const isProd = process.env.NODE_ENV === "production";
export const BASE_PATH = "";

export const getPath = (path: string): string => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE_PATH}${normalizedPath}`;
};