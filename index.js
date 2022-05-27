//incluye la librería de express
const express = require('express');
const app = express();
var path = require('path');
const Excel = require('exceljs');
const bp = require('body-parser')
let http = require('http');
let formidable = require('formidable');
let fs = require('fs');
const port = 3000;
var DataXLSL;


/*async function Excel_c(filename){

    const excelData = XLSX.readFile(filename);

    return Object.keys(excelData.Sheets).map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
    }));
parseExcel("./public/Objetos.xlsx").forEach(element => {
    DataXLSL = element.data;
});
}*/

app.use(bp.json({
    limit: '500mb'
}));
app.use(bp.urlencoded({
    limit: '500mb',
    extended: true
}));


app.post('/Data/CreateExcel', async (req, res) => {
    var columns = [{
            header: 'Apiname',
            key: 'Apiname'
        },
        {
            header: 'Label',
            key: 'Label'
        },
        {
            header: 'NewLabel',
            key: 'NewLabel'
        }
        ,
        {
            header: 'Translation',
            key: 'Translation'
        }

        
    ];
    Excel_c(columns, req.body);
    res.json(req.body);
});

app.post('/Data/readExcelObj', async (req, res) => {

    var toRet = await readExcel(req.body.name)
    console.log('toRet')
    console.log(toRet)
    console.log("jaja")
    res.json(JSON.stringify(toRet));

});

app.use("/public", express.static(path.join(__dirname, 'public')));

//Creamos una ruta para el directorio raíz en este caso solo envía el texto 'Hello world!!!' pero es común que se envíe una vista (archivo HTML)
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


//Comienza a escuchar el puerto definido 3000
app.listen(port, () => {
    console.log('Listen on the port 3000');
});

async function Excel_c(Vcomlumns, Vdata) {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);

    const workbook = new Excel.Workbook();
    try {
        await workbook.xlsx.readFile('./public/Data/Export/exportObjects_' + today.toDateString() + '_' + timeElapsed + '.xlsx');
    } catch (error) {
        console.log(error)
    }
    if (Vdata.length != 0) {
        Vdata.forEach(element => {
            var length = 31;

            var Vsheet = element.nameObj;
            if (Vsheet.length > length) {
                Vsheet = Vsheet.replace("__c.object", "");
                if (Vsheet.length > 31) {
                    Vsheet = Vsheet.substring(0, length);
                }
            }
            let worksheet = workbook.worksheets;
            try {
                worksheet = workbook.addWorksheet(Vsheet);
            } catch (error) {
                console.log('sheet exist')
                worksheet = workbook.getWorksheet(Vsheet);
                worksheet.addRow({
                    Apiname: element.apiname,
                    Label: element.label,
                    NewLabel: ''
                });
                worksheet.addRow({
                    Apiname: element.apiname,
                    Label: element.label,
                    NewLabel: ''
                });
            }

            worksheet.columns = Vcomlumns;
            element.strJSON.recordTypes.forEach(element => {
                let Translation=true;
                try {
                    if('#comment' in element.label){
                        Translation=false;
                        element.label=element.label['#comment']
                    }
                } catch (error) {
                    
                }
             
                console.log(Vsheet + ' ' + element.label)
                worksheet.addRow({
                    Apiname: element.apiname,
                    Label: element.label,
                    NewLabel: '',
                    Translation: Translation
                });

            });



        });
    }
    try {
        console.log('escribir')
        await workbook.xlsx.writeFile('./public/Data/Export/exportObjects_' + today.toDateString() + '_' + timeElapsed + '.xlsx');
    } catch (error) {
        console.log(error)
    }
};

function readExcel(filename) {
    return new Promise(resolve => {
        var mapLabelApiname = {}
        var sheet = 'Hoja1'
        const workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filename)
            .then(function () {
                var worksheet = workbook.getWorksheet(sheet);
                worksheet.eachRow({
                    includeEmpty: true
                }, function (row, rowNumber) {
                    row.values.forEach(element => {
                        mapLabelApiname[row.values[2]] = row.values[1];
                        // console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));

                    });

                });


            }).then(() => {


                resolve(mapLabelApiname);

            });
    });
}


http.createServer(function (req, res) {

    //Create an instance of the form object
    let form = new formidable.IncomingForm();
  
    //Process the file upload in Node
    form.parse(req,async function (error, fields, file) {
        
       console.log(file)
       let filepath = file.fileupload.filepath;
       let newpath = './upload/';
       let extension = file.fileupload.originalFilename.split('.')
       filepath +='.'+extension[extension.length-1]
       console.log(filepath)
       console.log(extension)
      
     // Copy the uploaded file to a custom folder
       await fs.rename(file.fileupload.filepath, filepath, function () {
        //Send a NodeJS file upload confirmation message
        res.write(filepath);
        res.end();

      });
      var toRet = await readExcel(filepath)
      
      console.log(toRet)
      res.write(JSON.stringify(toRet));
    });
  
  }).listen(80);