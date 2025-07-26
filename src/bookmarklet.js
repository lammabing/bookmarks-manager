javascript:(function(){
    // Get current page information
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title || '');
    
    // Get description from meta tag or use empty string
    let description = '';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        description = encodeURIComponent(metaDesc.getAttribute('content') || '');
    }
    
    // Get favicon or generate default
    let favicon = '';
    const faviconLink = document.querySelector('link[rel*="icon"]');
    if (faviconLink && faviconLink.href) {
        favicon = encodeURIComponent(faviconLink.href);
    } else {
        try {
            favicon = encodeURIComponent(`https://www.google.com/s2/favicons?domain=${window.location.hostname}`);
        } catch (e) {
            favicon = '';
        }
    }
    
    // Construct app URL with parameters
    const appUrl = `http://localhost:5170/?url=${url}&title=${title}&description=${description}&favicon=${favicon}`;
    
    // Open in new window with specific dimensions
    const width = 600;
    const height = 700;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    window.open(
        appUrl,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
})();