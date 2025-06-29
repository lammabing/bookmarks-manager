javascript: (function () { 
    const url = encodeURIComponent(window.location.href); 
    const title = encodeURIComponent(document.title); 
    const metaDesc = document.querySelector('meta[name="description"]'); 
    const description = encodeURIComponent(metaDesc ? metaDesc.getAttribute('content') : 'No Description'); 
    const favicon = encodeURIComponent(document.querySelector('link[rel*="icon"]')?.href || `https://www.google.com/s2/favicons?domain=${window.location.hostname}`); 
    const appUrl = `http://localhost:5170/?url=${url}&title=${title}&description=${description}&favicon=${favicon}`; 
    window.open(appUrl, '_blank'); 
})();