(function() {
    const token = localStorage.getItem('jwt_token');

    const origFetch = window.fetch;
    window.fetch = function(url, opts) {
        opts = opts || {};
        opts.headers = opts.headers || {};
        if (token && !opts.headers['Authorization']) {
            opts.headers['Authorization'] = 'Bearer ' + token;
        }
        return origFetch.call(window, url, opts);
    };
})();
