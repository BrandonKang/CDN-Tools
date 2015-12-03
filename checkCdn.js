var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var dns = require('dns');
var cheerio = require('cheerio');
var request = require('request');
var urls = require('url');
var querystring = require('querystring');

var index = 1;
var tImg = '';
var tScript = '';
var tCss = '';
var tLink = '';
var AlexaRank = '';
var originalDomain = '';

var footer = '';
footer+= '<hr/>CDN Provider Checker v1.1 by Brandon Kang July 2015<p>';

var tCname = '';
var qDomainRealValue = '';

http.createServer(function (request, response) {
  if (request.method == 'GET') {
        fs.readFile('index.html', function (error, data) {
        response.writeHead(200, {'content-type': 'text/html'});
        response.end(data);
        //console.log('*** Make UI is completed **');
  });
  } else if (request.method == 'POST') {
    request.on('data', function(data) {
    index = 1;
    response.writeHead(200, {'Content-Type': 'text/html' });  
    
    //Get CNAME check result and display
    var domain = getPostValue(getPostValue(data,'&',0),'=',1);
    originalDomain = domain;
    var clientIP = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
    console.log('------------------------------------------------------');
    
    var date = new Date();

    var hour = date.getHours() + 9;
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    var myTime = year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    
    console.log('Domain : ' + originalDomain + ' lookup started from the Client IP: ' + clientIP + ' Time: ' + myTime + ' KST');
    console.log('------------------------------------------------------');

    var result = getCnames(domain,response);

    //Get Option for choosing Single host or Full host lookup
    //var option = getPostValue(getPostValue(data,'&',1),'=',1);
    });
  } //process.env.PORT 53354
}).listen(process.env.PORT, function () {
//  }).listen(53354, function () {
  console.log('Server is running with port process.env.PORT/53354');
});

function makeUI(response, msg) {
  fs.readFile('index.html', function (error, data) {
    response.writeHead(200, {'content-type': 'text/html'});
    response.write(msg);
    console.log('*** Make UI is completed **');
    response.end(data);
  });
}

function getPostValue(postData, seper, index) {
  var tempString = postData.toString();
  tempString = tempString.split(seper);
  return tempString[index];
}

function getAlexa(domain, res) {
  request('http://www.alexa.com/siteinfo/' + domain, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      $('strong.align-vmiddle').each(function(i, element){
        AlexaRank = $(this).toString().trim();
        console.log('AlexaRank: ' + AlexaRank);
      });
    }
    else if (error) {
        AlexaRank = 'No Data';
    }
  });
  //Display 
   res.write('Alexa.com Global Site Rank : ' + AlexaRank);
}


function getTagDomains(domain, response) {
var url = 'http://' + domain;

request({
    url: url,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36'
    }
}, function(error, response2, html){
            if (error) {
               throw error
            }
            else {
              //console.log('Here comes whole HTML : ' + html);
              var $ = cheerio.load(html); 

              //response.write('<p>');
              //response.write('<h2>Alexa.com information</h2>');
              //tAlexRank = getAlexa(domain, response);

              if (response2.statusCode != 200) {
                response.write('<p>');
                response.write('Response status code is not 200 OK.');
                response.write('<br>');
                response.write('We got ' + response2.statusCode.toString() + ' response code for the given URL.');
                response.write('<br>');
                response.write('Thus, Finding Image, JavaScript, CSS and Linked Domains are impossible.');
                //response.write('<p>');
              }

              tImg = getDomains($, 'img','src', 'Image');
              response.write('<p>');
              response.write('<h2>Image Domains</h2>');
              response.write(tImg);

              tScript = getDomains($, 'script','src', 'JavaScript');
              response.write('<p>');
              response.write('<h2>JavaScript Domains</h2>');
              response.write(tScript);

              tCss = getDomains($, 'link','href', 'CSS');
              response.write('<p>');
              response.write('<h2>CSS Domains</h2>');
              response.write(tCss);

              tLink = getDomains($, 'A','href', 'Linked Domain');
              response.write('<p>');
              response.write('<h2>Linked Domains</h2>');
              response.write(tLink);
              response.write('<p>');
              response.end(footer);

              //var topDomain = 
              //tWhois = getWhois(topDomain);
              //response.write('<p>');
              //response.write('<h2>WhoIS Information</h2>');
              //response.write(tWhois);
              //response.write('<p>');
              //response.end(footer);
            }
          });
}

function getCnames(domain, response) {
    var str = '';
    var tag = '';

    dns.resolveCname(domain, function (error, cnames) {
      if(error) {
        //There is no CNAME chain in the domain
        if (index == 1)  {
          tag+='<body>';
          tag+='    <font face="verdana">';
          tag+='    <h1><font color="blue">CDN Provider Checker V1.1</font></h1>';
          tag+='    <form method="POST" name="form1">';
          tag+='      URL: http(s)://<input type="text" name="text" size="30" autofocus="autofocus" value="' + domain + '"><p>';
          tag+='      <input type="radio" name="level" value="full" checked>Full Site LookUp<br>';
          tag+='      <input type="radio" name="level" value="single">Single Host LookUp<p>';
          tag+='      <input type="submit">';
          tag+='    </form>';
          tag+='    <hr/>';
          tag+='    Result:<p>';  
          response.write(tag);
          response.write('No CDN nor DNS CNAME was found. See the WhoIS information <a href="http://www.whois.com/whois/' + domain + '" target="_blank">' + 'HERE</a><br>');

          //Display index.html
          //makeUI(response,'Result:<p>No CNAME nor CDN was found. Please check domain name.');  

          //CNAME informaiton is finished. Let's show domain information for major tags
          //getTagDomains(originalDomain,response);

          //Print Footer and close response
          response.end(footer);
          return;
        }
        else {
          //CNAME informaiton is finished. Let's show domain information for major tags
          
          getTagDomains(originalDomain,response);
        }
      }
      else {
        if (index == 1) {
          tag+= '<script language=javascript>';
          tag+= '  function goSearch(dest) {';
          tag+= '    document.form1.text.value = dest;';
          tag+= '    document.form1.submit();';
          tag+= '  }';
          tag+= '</script>';
          tag+='<body>';
          tag+='    <font face="verdana">';
          tag+='    <h1><font color="blue">CDN Provider Checker V1.1</font></h1>';
          tag+='    <form method="POST" name="form1">';
          tag+='      URL: http(s)://<input type="text" name="text" size="30" autofocus="autofocus" value="' + domain + '"><p>';
          tag+='      <input type="radio" name="level" value="full" checked>Full Site LookUp<br>';
          tag+='      <input type="radio" name="level" value="single">Single Host LookUp<p>';
          tag+='      <input type="submit">';
          tag+='    </form>';
          tag+='    <hr/>';
          tag+='    <h2>Results:</h2><p>';
          response.write(tag);
          //Display index.html
          //makeUI(response,'<hr/><h2>Results:</h2><p>');
        }

        response.write('CNAME ' + index + ': ' + cnames + ' --> Provider : ' + checkCdn(cnames) + '<br>');
        index++;

        //Repeat
        getCnames(cnames, response);
      }
    });
    return str.toString();
}

function checkCdn(cnames) {
  cnames = cnames.toString();
  //console.log('I got this request :' + cnames);

  //Akamai
  if (cnames.indexOf('.globalredir.akadns.net') > -1)
    return 'Akamai - ChinaCDN';
  else if (cnames.indexOf('.akadns.net') > -1)
    return 'Akamai - GTM';
  else if (cnames.indexOf('.edgekey.net') > -1)
    return 'Akamai - ESSL';
  else if (cnames.indexOf('.edgesuite.net') > -1)
    return 'Akamai - FF';
  else if (cnames.indexOf('.akamaiedge.net') > -1)
    return 'Akamai - ESSL';
  else if (cnames.indexOf('.akamai.net') > -1)
    return 'Akamai - FF';

  //CDN 
  else if (cnames.indexOf('.nsatc.net') > -1)
    return 'Level 3 Communications';
  else if (cnames.indexOf('.footprint.net') > -1)
    return 'Level3';

  else if (cnames.indexOf('.azurewebsites.net') > -1)
    return 'Microsft Azure';
  else if (cnames.indexOf('.msecnd.net') > -1)
    return 'Microsoft Distribution';

  else if (cnames.indexOf('.amazonaws.com') > -1)
    return 'Amazon Web Services';
  else if (cnames.indexOf('.elb.amazonaws.com') > -1)
    return 'Amazon Web Services - ELB';
  else if (cnames.indexOf('.cloudfront.net') > -1)
    return 'Amazon Web Services - CloudFront';

  else if (cnames.indexOf('.gccdn.net') > -1)
    return 'CDNETWORKS';
  else if (cnames.indexOf('.cdnetworks.net') > -1)
    return 'CDNETWORKS';
  else if (cnames.indexOf('.cdngc.net') > -1)
    return 'CDNETWORKS';
  else if (cnames.indexOf('.cdngs.net') > -1)
    return 'CDNETWORKS';
  else if (cnames.indexOf('.speedcdn.net') > -1)
    return 'CDNETWORKS';

  else if (cnames.indexOf('.llnwd.net') > -1)
    return 'Limelight Networks';
  else if (cnames.indexOf('.lldns.net') > -1)
    return 'Limelight Networks';

  else if (cnames.indexOf('.v0cdn.net') > -1)
    return 'Verizon - EdgeCast';
  else if (cnames.indexOf('.edgecastcdn.net') > -1)
    return 'Verizon - EdgeCast';
  else if (cnames.indexOf('.cedexis.net') > -1)
    return 'Verizon - EdgeCast';
  else if (cnames.indexOf('.mucdn.net') > -1)
    return 'Verizon - EdgeCast';

  else if (cnames.indexOf('.fastly.net') > -1)
    return 'Fastly';

  else if (cnames.indexOf('.cloudflare.net') > -1)
    return 'CloudFlare';

  else if (cnames.indexOf('.hwcdn.net') > -1)
    return 'Highwinds';

  else if (cnames.indexOf('.cdn77.org') > -1)
    return 'CDN77(onApp)';

  else if (cnames.indexOf('.lxsvc.cn') > -1)
    return 'ChinaCache';
  else if (cnames.indexOf('.ccgslb.com') > -1)
    return 'ChinaCache';
  else if (cnames.indexOf('.ccna.c3cdn.net') > -1)
    return 'ChinaCache';


  else if (cnames.indexOf('.yahoo') > -1)
    return 'Yahoo Distribution';

  else if (cnames.indexOf('.google') > -1)
    return 'Google Distribution';
  else if (cnames.indexOf('.doubleclick.net') > -1)
    return 'Google Distribution';


  else if (cnames.indexOf('.instacontent.net') > -1)
    return 'Mirror Image';

  else if (cnames.indexOf('.cachefly.net') > -1)
    return 'Cachefly';

  else if (cnames.indexOf('.nyucd.net') > -1)
    return 'Coral Cache';

  else if (cnames.indexOf('.netdna-cdn.com') > -1)
    return 'MaxCDN';

  //KR 
  else if (cnames.indexOf('.gscdn.net') > -1)
    return 'GS Neotek';
   else if (cnames.indexOf('.gscdn.com') > -1)
    return 'GS Neotek';

  else if (cnames.indexOf('.x-cdn.com') > -1)
    return 'LG U+';
  else if (cnames.indexOf('.cdn.cloudn.co.kr') > -1)
    return 'LG U+ Cloud N';

  else if (cnames.indexOf('.ktics.co.kr') > -1)
    return 'KT - SolutionBox';
  else if (cnames.indexOf('.navercdn.com') > -1)
    
    return 'NHN Corp.';
  else if (cnames.indexOf('.nheos.com') > -1)
    return 'NHN Corp.';

  else
    return 'Unknown';
}

function getIps(domain) {
  dns.resolve4(domain, function (error, addresses) {
    if (error) {
      console.log(error);
    }
    else {
        console.log('addresses: ' + JSON.stringify(addresses));
    }
  });
}

function getDomains(html, tag, direct, desc) {
  var $ = html;
  var tags = [];
  var domains = [];


  $(tag).each(function(i) {
    tags[i] = $(this).attr(direct);
    if (tags[i] != undefined) {
      
      tags[i] = urls.parse(tags[i]).hostname;
      var conflict='false';

      for (var j=0;j<domains.length;j++) {
        if (domains[j] == tags[i]) {
          conflict = 'true';
          break;
        }
      }
      if (conflict=='false' && tags[i] !=null) {
        domains[domains.length] = tags[i];
        //console.log('Domain added: ' + domains[j+1])
      }
    }
  });


  //initialize tList
  var tList = '';

  for (var k=0;k<domains.length;k++) {
    tList+= desc + '[' + (k+1) + '] ' + '<a href=javascript:goSearch("' + domains[k] + '");>' + domains[k] + '</a><br>';
  }
  if (domains.length ==0)
    return 'No domain for this tag was found.<br>';
  else
    return tList;
}