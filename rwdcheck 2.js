//Responsive Web Design Checker v1.0
//2015.11.06, Brandon Kang

var http = require('http');
var async = require('async');

//Read domains from a text file line by line
var rl = require('readline').createInterface({
    input: require('fs').createReadStream('./domain.txt')
});

//HTTP request options
var options = {
    path: '/',
    port: 80,
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 4.4.2; sdk Build/KK) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36'
    }
};


rl.on('line', function(result) {
    //console.log(result);

    options.hostname = result;

    async.waterfall([
        function(cb) {
            var print = '';
            var mobileFriendly = false;
            var req = http.request(options, function(res) {
                //console.log('STATUS: ' + res.statusCode);
                //console.log('HEADERS: ' + JSON.stringify(res.headers));
                var data = '';
                var msg = '';
                
                //Redirection check
                if ((res.statusCode == 302 || res.statusCode == 301) && res.headers['location']) {

                	//m.dot site redirection
                    if (res.headers['location'].indexOf('//m.') > -1) {
                       console.log(result + ',Mobile Friendly Detected! : m.dot site redirection,' + res.headers['location']);
                    } 

                    //m path redirection
                    else if (res.headers['location'].indexOf('/m/') > -1) {
                       console.log(result + ',Mobile Friendly Detected! : /m/ path redirection,' + res.headers['location']);
                    } 

                    //track other reidrected paths
                    else if (res.headers['location']) {
                        options.path = res.headers['location'];
                        options.orihost = options.host;
                        res.headers['location'] = '';
                        cb(options, result);
                    }
                }

                if (res.statusCode == 200) {
                    //get HTML body
                    res.setEncoding('utf8');
                    res.on('data', function(chunk) {
                        data += chunk;
                    });
                    res.on('end', function() {
                        //console.log('HTML : ' + data);
                        var finalPath;
                        if (options.path.indexOf('://') > -1)
                            redirPath = options.path;
                        else
                            redirPath = ',' + options.path;

                        redirPath = '';
                        if (data.indexOf('@media') > -1) {
                            console.log(result + ',Mobile Friendly Detected! : @Media Query for RWD detected' + redirPath);
                            mobileFriendly = true;
                          } 
                        if (data.indexOf('row-fluid') > -1) {
                            console.log(result + ',Mobile Friendly Detected! : JQUERY for RWD detected' + redirPath);
                            mobileFriendly = true;
                            //return;
                        }
                        if (data.indexOf('bootstrap.min.css') > -1) {
                            console.log(result + ',Mobile Friendly Detected! : Bootstrap CSS for RWD detected' + redirPath);
                            mobileFriendly = true;
                            //return;
                        }
                        if (data.indexOf('viewport') > -1) {
                            console.log(result + ',Mobile Friendly Detected! : viewport meta for RWD detected' + redirPath);
                            mobileFriendly = true;
                            //return;
                        }

                        if (mobileFriendly == false) {
                            console.log(result + ',This site is not Mobile Friendly');
                            //return;
                        }
                    });
                }
            });

            req.on('error', function(e) {
                console.log(result + ',Connection Error');
            });
            req.end();
        }
    ], null);
});