(function () {

    function addSpRestClientInPage() {

        var displayJson = function (json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        };

        var RestApiExplorer = (function () {
            function RestApiExplorer(baseUrl) {
                this.baseUrl = baseUrl || _spPageContextInfo.siteAbsoluteUrl;
                this.formDigestValue = document.querySelector("#__REQUESTDIGEST").value;
            }

            RestApiExplorer.prototype.getRequest = function (requestInfo) {
                return new Promise(function (resolve, reject) {
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("GET", requestInfo.requestUrl);
                    xmlHttp.setRequestHeader("Accept", "application/json;odata=verbose");

                    xmlHttp.onload = function () {
                        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
                            if (xmlHttp.status == 200) {
                                var successResponse = JSON.parse(xmlHttp.responseText);
                                resolve(successResponse);
                            } else {
                                var errorResponse = {
                                    status: xmlHttp.statusText,
                                    error: JSON.parse(xmlHttp.responseText)
                                };
                                reject(errorResponse);
                            }
                        }
                    };
                    xmlHttp.send();
                });
            };

            RestApiExplorer.prototype.postRequest = function (requestInfo) {
                return new Promise(function (resolve, reject) {
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("POST", requestInfo.requestUrl);
                    xmlHttp.setRequestHeader("Accept", "application/json;odata=verbose");
                    xmlHttp.setRequestHeader("X-RequestDigest", requestInfo.formDigestValue);
                    xmlHttp.setRequestHeader("content-Type", "application/json;odata=verbose");

                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
                            if (xmlHttp.status == 201 || xmlHttp.status == 200) {
                                var successResponse = JSON.parse(xmlHttp.responseText);
                                resolve(successResponse);
                            } else {
                                var errorResponse = {
                                    status: xmlHttp.statusText,
                                    error: JSON.parse(xmlHttp.responseText)
                                };
                                reject(errorResponse);
                            }
                        }
                    };
                    xmlHttp.send(JSON.stringify(requestInfo.requestBody));
                });
            };

            RestApiExplorer.prototype.updateRequest = function (requestInfo) {
                return new Promise(function (resolve, reject) {
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("PATCH", requestInfo.requestUrl);
                    xmlHttp.setRequestHeader("Accept", "application/json;odata=verbose");
                    xmlHttp.setRequestHeader("X-RequestDigest", requestInfo.formDigestValue);
                    xmlHttp.setRequestHeader("content-Type", "application/json;odata=verbose");
                    xmlHttp.setRequestHeader("X-Http-Method", "PATCH");
                    xmlHttp.setRequestHeader("If-Match", requestInfo.ifMatch);

                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
                            if (xmlHttp.status == 204) {
                                resolve({
                                    message: "UPDATE request has been executed successfully.",
                                    status: xmlHttp.status
                                });
                            } else {
                                var errorResponse = {
                                    status: xmlHttp.statusText,
                                    error: JSON.parse(xmlHttp.responseText)
                                };
                                reject(errorResponse);
                            }
                        }
                    };
                    xmlHttp.send(JSON.stringify(requestInfo.requestBody));
                });
            };

            RestApiExplorer.prototype.deleteRequest = function (requestInfo) {
                return new Promise(function (resolve, reject) {
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("DELETE", requestInfo.requestUrl);
                    xmlHttp.setRequestHeader("Accept", "application/json;odata=verbose");
                    xmlHttp.setRequestHeader("X-RequestDigest", requestInfo.formDigestValue);
                    xmlHttp.setRequestHeader("If-Match", requestInfo.ifMatch);

                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
                            if (xmlHttp.status == 200) {
                                resolve({
                                    message: "DELETE request has been executed successfully.",
                                    status: xmlHttp.status
                                });
                            } else {
                                var errorResponse = {
                                    status: xmlHttp.statusText,
                                    error: JSON.parse(xmlHttp.responseText)
                                };
                                reject(errorResponse);
                            }
                        }
                    };
                    xmlHttp.send();
                });
            };

            RestApiExplorer.prototype.executeRequest = function (requestInfo) {
                switch (requestInfo.requestType) {
                    case "GET": {
                        return this.getRequest(requestInfo);
                    }
                    case "POST": {
                        return this.postRequest(requestInfo);
                    }
                    case "UPDATE": {
                        return this.updateRequest(requestInfo);
                    }
                    case "DELETE": {
                        return this.deleteRequest(requestInfo);
                    }
                    default:
                        break;
                }
            };

            return RestApiExplorer;
        })();

        /*Styles for REST Client*/

        var css = "pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; overflow: auto; }\
                .string { color: green; }\
                .number { color: darkorange; }\
                .boolean { color: blue; }\
                .null { color: magenta; }\
                .key { color: red; }\
                body {overflow: auto;}\
                #requestBody { width: 405px; height: 180px; }\
                #requestType { width: 411px;height: 26px; }\
                input[type='text'] { width: 406px;height: 22px; }\
                #sendRequest {margin: 0;}\
                #response { display:none;margin-left:10%;background:#eff0f1;margin-right:10%;padding:20px;margin-top:12px;border:3px solid ; max-height: 800px; overflow: auto;}\
                #requestForm { margin: 0 auto;font-family: sans-serif;font-size: 14px; }\
                #restClientHeader {text-align: center;margin-bottom: 8px;font-weight: bold;font-family: cursive;}\
                #sendRequest, #backToSite { font-size: 14px;font-family: sans-serif; }";

        [].forEach.call(document.querySelectorAll("link"), function (element) {
            element.remove();
        });

        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);

        try {
            var restApiExplorer = new RestApiExplorer();

            /*Updating FormDigestValue*/

            setInterval(function () {
                restApiExplorer.postRequest({}, "/_api/contextinfo")
                    .then(function (response) {
                        restApiExplorer.formDigestValue = response.d.FormDigestValue;
                    }, function (error) {
                        document.querySelector("#response").innerHTML = '<pre>' + 'Unable to update FormDigestValue ' + '</pre>';
                    });
            }, 1800 * 1000);

            /*Adding REST Client UI to the Page*/

            document.querySelector("form").style.display = 'none';
            var clientHtml = "<h1 id='restClientHeader'>SharePoint REST Client</h1>\
                              <table id='requestForm'> \
                                  <tr>\
                                     <td>Url</td>\
                                     <td><input type='text' id='requestUrl' value='/_api/'/></td>\
                                  </tr>\
                                  <tr>\
                                    <td>Type</td>\
                                    <td>\
                                      <select  id='requestType'>\
                                        <option value='GET'>GET</option>\
                                        <option value='POST'>POST</option>\
                                        <option value='UPDATE'>UPDATE</option>\
                                        <option value='DELETE'>DELETE</option>\
                                      </select>\
                                    </td>\
                                  </tr>\
                                  <tr id='requestBodyTR' style='display: none'>\
                                    <td>Body</td>\
                                    <td><textarea id='requestBody'>{}</textarea></td>\
                                  </tr>\
                                  <tr id='versionTR' style='display: none'>\
                                    <td>Version/ETag</td>\
                                    <td><input type='text' id='version' value='*'></td>\
                                  </tr>\
                                  <tr>\
                                    <td></td>\
                                    <td>\
                                        <input type='button' value='SEND' id='sendRequest'>\
                                        <input type='button' value='BACK TO SITE' id='backToSite'>\
                                    </td>\
                                  </tr>\
                                  <tr>\
                                  <td colspan='2'>\
                                    <img style='width: 447px;height: 22px;margin: 10px 0 0 0;display: none;' src='/_layouts/15/images/PROGRESS.GIF' id='spProgressbar'/>\
                                  </td>\
                                </tr>\
                            </table>\
                    </div>\
                    <div id='response'>";

            var clientDiv = document.createElement("div");
            clientDiv.innerHTML = clientHtml;
            document.querySelector("body").appendChild(clientDiv);
            document.querySelector("#sendRequest").addEventListener('click', executeRequest);
            document.querySelector("#backToSite").addEventListener('click', function () {
                window.location.reload();
            });
            document.querySelector("#requestType").addEventListener('change', requestTypeOnchange);
            window.postMessage({id: "SpRestClient", key: "success", value: ""}, "*");
        } catch (error) {
            window.postMessage({id: "SpRestClient", key: "error", value: ""}, "*");
            console.log(error.message);
        }

        function requestTypeOnchange() {
            var requestType = document.querySelector("#requestType").value;

            switch (requestType) {
                case "GET": {
                    document.querySelector("#requestBodyTR").style.display = "none";
                    document.querySelector("#versionTR").style.display = "none";
                    break;
                }
                case "POST": {
                    document.querySelector("#requestBodyTR").style.display = "";
                    document.querySelector("#versionTR").style.display = "none";
                    break;
                }
                case "UPDATE": {
                    document.querySelector("#requestBodyTR").style.display = "";
                    document.querySelector("#versionTR").style.display = "";
                    break;
                }
                case "DELETE": {
                    document.querySelector("#requestBodyTR").style.display = "none";
                    document.querySelector("#versionTR").style.display = "";
                    break;
                }
                default:
                    break;
            }
        }

        function executeRequest() {
            try {
                document.querySelector("#response").style.display = "none";
                document.querySelector("#spProgressbar").style.display = "block";
                var requestInfo = {
                    requestType: document.querySelector("#requestType").value,
                    requestUrl: restApiExplorer.baseUrl + document.querySelector("#requestUrl").value,
                    requestBody: JSON.parse(document.querySelector("#requestBody").value),
                    ifMatch: document.querySelector("#version").value,
                    formDigestValue: restApiExplorer.formDigestValue
                };

                if (!requestInfo.requestUrl) {
                    document.querySelector("#response").innerHTML = '<pre>' + 'Request Url can not be empty.' + '</pre>';
                    document.querySelector("#response").style.display = "block";
                    document.querySelector("#spProgressbar").style.display = "none";
                }

                restApiExplorer.executeRequest(requestInfo)
                    .then(function (response) {
                        var responseAsString = JSON.stringify(response, undefined, 4);
                        document.querySelector("#response").innerHTML = '<pre>' + displayJson(responseAsString) + '</pre>';
                        document.querySelector("#response").style.display = "block";
                        document.querySelector("#spProgressbar").style.display = "none";
                    }, function (error) {
                        var responseAsString = JSON.stringify(error, undefined, 4);
                        document.querySelector("#response").innerHTML = '<pre>' + displayJson(responseAsString) + '</pre>';
                        document.querySelector("#response").style.display = "block";
                        document.querySelector("#spProgressbar").style.display = "none";
                    });
            } catch (error) {
                document.querySelector("#response").innerHTML = '<pre>' + displayJson(error.message) + '</pre>';
                document.querySelector("#response").style.display = "block";
                document.querySelector("#spProgressbar").style.display = "none";
            }
        }
    }

    function injectCodeToPage(code, args) {
        var script = document.createElement('script');
        script.textContent = '(' + code + ')(' + (args || '') + ');';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    }

    injectCodeToPage(addSpRestClientInPage);
})();