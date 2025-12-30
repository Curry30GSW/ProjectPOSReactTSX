
export function StringColor(value: string): string {
    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = "#"

    for (let i = 0; i < 3; i++) {
        const v = (hash >> (i * 8)) & 0xff;
        color += ("00" + v.toString(16)).slice(-2);
    }

    return color;


}