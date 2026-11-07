export function renew(data: unknown) {
    return JSON.parse(JSON.stringify(data));
}