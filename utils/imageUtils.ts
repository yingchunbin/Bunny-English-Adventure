
/**
 * Converts a Google Drive sharing link into a direct image source URL.
 * Also handles standard URLs.
 * 
 * @param url The image URL (can be a Google Drive share link or standard URL)
 * @returns A usable src string for <img> tags
 */
export const resolveImage = (url: string | undefined): string | undefined => {
    if (!url) return undefined;

    // Check if it's a Google Drive link or ID
    // ID format often looks like: 12UCwL_Pd3Y10eT74MqUg9dhB_3D7qAxA (long alphanumeric string)
    if (url.includes('drive.google.com') || (url.length > 20 && !url.includes('/') && !url.includes('.'))) {
        let id = '';
        
        // Case 1: Full URL provided
        if (url.includes('drive.google.com')) {
            const parts = url.split('/');
            
            // Handle: https://drive.google.com/file/d/FILE_ID/view...
            if (url.includes('/file/d/')) {
                const index = parts.indexOf('d');
                if (index !== -1 && parts.length > index + 1) {
                    id = parts[index + 1];
                }
            } 
            // Handle: https://drive.google.com/open?id=FILE_ID
            else if (url.includes('id=')) {
                const match = url.match(/id=([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    id = match[1];
                }
            }
        } 
        // Case 2: Just the ID was provided (fallback)
        else {
            id = url;
        }

        if (id) {
            // Remove any query parameters if they got stuck to the ID
            if (id.includes('?')) {
                id = id.split('?')[0];
            }
            
            // Use the export=view endpoint which is more reliable for direct embedding
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
    }

    return url;
};
