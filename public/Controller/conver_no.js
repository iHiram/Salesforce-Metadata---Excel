

    var ArchivosJSON = $.get(url, function () {
        //  console.log( "success" );
      })
      .fail(function () {
  
        console.log("Error get Archivos de objetos");
      })
      .always(function () {
        console.log("3");
        var p1 = new Promise(
          function (resolve, reject) {
  
            ArchivosJSON.responseJSON.forEach(element => FilesName.push(element.Archivos));
            //  console.log( FilesName)
            resolve(FilesName);
          }
        )
      });
  });
  var ArrayPathObjects = [];
  var ArrayJSONobjects = [];
  
  var createpath = new Promise(function (resolve, reject) {
    FilesName.forEach(element => {
      var row = "./public/Data/" + element + ".json";
      ArrayPathObjects.push(row);

    });
    resolve(ArrayPathObjects)
  });
  createpath.then((resolve) => {}).then(() => { //ArrayJSONobjects.forEach(element => { }) 


  })
    
    
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               document.getElementById("input").value = xhttp.responseText;
            }
        };
        xhttp.open("GET", "./xml/example.xml", true);
        xhttp.send();
    }
    function saveOutput(text, fn, doctype) {
        var blob = new Blob([text], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, fn)
    }
    function saveFile(text, ext, fnId) {
        var eol = "\r\n";
        fn = "convertjson"      
        if (document.getElementById("eol")) eol = document.getElementById("eol").value || eol;
        if (eol == "LF") eol = "\n";
        if (eol == "CRLF") eol = "\r\n";
        var v = text.replace(/\r\n|\r|\n/gm, eol);
        saveOutput(v, fn + "." + ext, null)
    }
    function fetch_by_url()
{
    var this_is_link = document.getElementById("fetch_url").value;
    if (this_is_link == "") {
        document.getElementById("error_valid").style.display = "";
        return false;
    }
    else
    {
        document.getElementById("error_valid").style.display = "none";
    }
      fetch('https://api.codetabs.com/v1/proxy?quest='+this_is_link)
    
  .then(
    function(response) {
      if (response.status !== 200) {
        document.getElementById("error_valid").style.display = "block";
        document.getElementById("error_valid").innerHTML = "No output againts this URL ! Please Enter Valid URL";
        return;
      }

      // Examine the text in the response
      response.text().then(function(data) {
        document.getElementById("input").value = data;
        alert_box_close();
      });
    }
  )
  .catch(function(err) {

    console.log('Fetch Error :-S', err);
  });
}
function alert_box(){
    document.getElementById("model-bg").style.display = "block";
    document.getElementById("model-box").style.display = "block";
}
function alert_box_close(){
    document.getElementById("model-bg").style.display = "none";
    document.getElementById("model-box").style.display = "none";
    document.getElementById("error_valid").style.display = "none";
    document.getElementById("fetch_url").value = "";
}
document.getElementById("upload_file").addEventListener("change",function(){
        document.getElementById("upload_file_form").click();
    });