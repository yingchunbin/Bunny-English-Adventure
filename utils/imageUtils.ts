
/**
 * Converts a Google Drive sharing link or ID into a direct image source URL.
 * Uses the thumbnail endpoint which is more reliable for embedding than the download endpoint.
 * 
 * @param url The image URL (can be a Google Drive share link, full URL, or just the ID)
 * @returns A usable src string for <img> tags
 */
export const resolveImage = (url: string | undefined): string | undefined => {
    if (!url) return undefined;

    let id = '';

    // Check if it's a URL
    if (url.includes('/') || url.includes('.')) {
        // Try to extract ID from various Google Drive URL formats
        if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
            // Match pattern like .../d/ID/...
            const pathMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (pathMatch && pathMatch[1]) {
                id = pathMatch[1];
            } else {
                // Match pattern like ...id=ID...
                const paramMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (paramMatch && paramMatch[1]) {
                    id = paramMatch[1];
                }
            }
        }
    } else {
        // Assume it is the ID itself if it's long enough and has no slashes
        // Google IDs are typically alphanumeric with - and _
        if (url.length > 20) {
            id = url;
        }
    }

    if (id) {
        // Use the thumbnail endpoint with large size (w1000)
        // This bypasses the 'virus scan' warning page for download links and avoids strict quota limits
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }

    return url;
};
