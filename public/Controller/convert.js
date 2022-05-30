var FilesName = [];
var ArrayJSONXML = [];
var ArrayObjToSend = [];
var mapLabelApiname = {};
var pathFilterobj='';
let auth0 = null;



const fetchAuthConfig = () => fetch("/auth_config.json");
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  });
};




const updateUI = async () => { 
  const isAuthenticated = await auth0.isAuthenticated();

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
  
  // NEW - add logic to show/hide gated content after authentication
  if (isAuthenticated) {
    document.getElementById("gated-content").classList.remove("hidden");

    document.getElementById(
      "ipt-access-token"
    ).innerHTML = await auth0.getTokenSilently();

    document.getElementById("ipt-user-profile").textContent = JSON.stringify(
      await auth0.getUser()
    );

  } else {
    document.getElementById("gated-content").classList.add("hidden");
  }
};

const login = async () => {
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin
  });
};


const logout = () => {
  auth0.logout({
    returnTo: window.location.origin
  });
};

window.onload = async () => {

  // .. code ommited for brevity

  updateUI();

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    // show the gated content
    return;
  }

  // NEW - check for the code and state parameters
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {

    // Process the login state
    await auth0.handleRedirectCallback();
    
    updateUI();

    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, "/");
  }
};








var p1 = new Promise(async function (resolve, reject) {
  var pth = window.location.href;
  var url = pth + 'Data/Objetos';

});

async function ConvertxmlToJson(key, data) {
  var s = data;
  var t;
  var msg = 'Invalid XML entered.';
  try {
    if (s.trim() != "") {
      try {
        t = xmlToJson(s);
        if (t != "null" && t != "undefined") {
          //   console.log(t)
          var dataobj = JSON.parse(t)
          var rowobj = {
            "nameobj": key,
            "strjson": dataobj
          }
          console.log(key)
          ArrayJSONXML.push(rowobj)
        }
      } catch (e) {
        console.log(e);
        return;
      }
      if (!t || t == "null") {
        console.log(msg);
      }

    }
  } catch (error) {

  }

};

async function clicConvertxmlToJson() {
  console.log("Entrar")
  return new Promise((resolve, reject) => {
    console.log("Entr22222ar")
    var files = document.getElementById('files').files
    console.log(files)
    let arrayPromise=[]
    for (let i = 0; i < files.length; i++) {
      let file = files.item(i);
      let tempk = file.name.split(".")
      let key = tempk[0].split("-")
      let e = document.getElementById("idioma");
      let strUser = e.value;
      let extension = true;
      console.log(strUser)
      console.log(key[key.length-1])
      if(strUser!=undefined && strUser !=''){
        strUser=strUser.replace('-', '')
        if(strUser!=key[key.length-1]){
          extension=  false
        }
      }
      if ((key[0] in mapLabelApiname) && extension) {
        let keylabel = mapLabelApiname[key[0]]
        console.log(i)
        let espera = new Promise((resolvethis, reject) => {
          $.when(parse(file))
            .done(async function (data) {
              //this code is executed when all ajax calls are done
              console.log(data)
              ConvertxmlToJson(keylabel,data)
              console.log("termino leer")
              resolvethis()
            });
        });
        arrayPromise.push(espera)
        
      }
    };
    Promise.all(arrayPromise).then(values=>{
      console.log('Resultado',values)
      resolve()
    })

  })
}

async function sendPost(strJSON) {
  return $.ajax({
    type: "POST",
    url: "/Data/CreateExcel",
    data: strJSON,
    contentType: "application/json",
    success: async function (result) {
      result = [];
    },
    error: async function (result, status) {
      console.log(result);
      result = [];
    }

  });
}

async function convert() {
  await onclicgetExcel()
  await clicConvertxmlToJson()
  await createObjetResult()
}


async function onclicgetExcel() {
  return new Promise((resolve, reject) => {
    var files = document.getElementById('objFile').files
    console.log(files)

    var file = {
      "name": files[0].name,
      "data": files[0]
    }

    var strJSON = JSON.stringify(file)

    $.ajax({
      type: "POST",
      url: "/Data/readExcelObj",
      data: strJSON,
      contentType: "application/json",
      success: async function (result) {
        mapLabelApiname = JSON.parse(result)
        result = [];
        resolve()
      },
      error: async function (result, status) {
        result = [];
      }
    });

  })
}

async function parse(file) {
  // Always return a Promise
  return new Promise((resolve, reject) => {
    let content = '';
    const reader = new FileReader();
    // Wait till complete
    reader.onloadend = async function (e) {
      content = e.target.result;
      resolve(content);
    };
    // Make sure to handle error states
    reader.onerror = async function (e) {
      reject(e);
    };
    reader.readAsText(file);
  });
}

async function createObjetResult() {
  console.log("22222")
  return new Promise((resolve, reject) => {
    console.log("4")
    console.log(ArrayJSONXML)
    ArrayJSONXML.forEach(element => {
      console.log("5")
      console.log(element)
      var tempkey = element.nameobj.split(".");
      var key = tempkey[0]
      if (key in mapLabelApiname) {
        key = mapLabelApiname[key]
      }
      var Arrayrecordtypes = [];
      var typeFile = "CustomObject";
      var apiname = 'fullName';
      if (element.strjson[typeFile] == undefined) {
        typeFile = "CustomObjectTranslation";
        apiname = "name";
      }
      try {
        element.strjson[typeFile].recordTypes.forEach(element => {
          var rowobj = {
            'apiname': element[apiname],
            'label': element.label
          }
          Arrayrecordtypes.push(rowobj)
        })
      } catch (error) {
        console.log(key + " No tiene recordtypes")
      }

      if (Arrayrecordtypes.length != 0) {
        console.log(key + " Arrayrecordtypes")
        var rowObjDATA = {
          'fields': '',
          'recordTypes': Arrayrecordtypes
        }
        var rowObj = {
          'nameObj': key,
          'strJSON': rowObjDATA
        }
        ArrayObjToSend.push(rowObj);
        console.log(rowObj)
      }

      
    })
      var strJSON = JSON.stringify(ArrayObjToSend);
      console.log(ArrayObjToSend)
      const espera = new Promise((resolve, reject) => {
        $.when(sendPost(strJSON))
          .done(async function () {
            //this code is executed when all ajax calls are done
            console.log("termino escribir")

          });

      });
      
 
  });
}


async function uploadFile () {

  let formData = new FormData(); 
  formData.append("fileupload", fileupload.files[0]);
     fetch('http://localhost/upload', {
    method: "POST", 
    body: formData
  }).then(result=>{
console.log(result)

  }); 

}

