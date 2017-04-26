let helpers = {
    loadJSON: function(filePath) {
        return new Promise(function(resolve, reject) {
            let xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/jsonp");
            xobj.open('GET', filePath, true);
            xobj.onreadystatechange = function() {
                if (xobj.readyState === 4 && xobj.status === "200") {
                    let data = JSON.parse(xobj.responseText);
                    resolve(data);
                } else {
                    reject({
                        'error': xobj.status
                    });
                }
            };
            xobj.send(null);
        });
    }
}
