// const fs = require('fs')
// let fdm;
// function open_(){
//     //console.log("eher");
//     fs.open("mynewfile1.txt", "r+", function(err, fd){
//         if(err) console.log(err);
//         fdm = fd;
//         console.log("File opened")
//     });
// }
// var para = document.getElementsByTagName('p')[0];
// var buff = new Buffer(4096);
// function read_(){

//     fs.read(fdm, buff, 0, buff.length, 0, function(err, bytes){
//         if(err) throw err;
//         //console.log(buff.slice(0,bytes).toString());
//         para.innerHTML = buff.slice(0,bytes).toString();
//     });
// }

// function write_(){
//     let st = para.innerHTML;
//     let posinst=0;
//     while(posinst < st.length){
//         buff = Buffer.copy();
//     }
//     fs.write(fdm, buff, 0, buff.length, 0, function(err, bytes){
//         if(err) throw err;
//         console.log("Written in File")
//         //console.log(buff.slice(0,bytes).toString());
//         //para.innerHTML = buff.slice(0,bytes).toString();
//     });
// }

// function close_(){
//     fs.close(fdm, function (err) {
//         if (err) throw err;
//     });
// }
// const FileObject = require('src/scripts/FileObject') 
const ipcRenderer = require('electron').ipcRenderer
// const fs = require('fs')
// const path = require('path')
// const { readTitles } = require(path.resolve('actions/uiActions'))

let fileNFileObj = {};

const readTitles = function(dataURL){ 
    let titles = []
    fs.readdirSync(dataURL).forEach((file, i) => {
        if(file.split('.').length==2){
            titles.push({
                title: `${file}`, 
                dir: `${dataURL}/${file}` 
            })
        }
    })
   return titles
}
var curObj = null;
readTitles('allfiles').map(({title, dir}) => {
    el = document.createElement("li");
    text = document.createTextNode(`${title}`);
    el.appendChild(text)
    el.addEventListener('click', function(e){ // clicking on sidebar titles
        if(curObj) curObj.fileData = Buffer(mainContent.innerHTML);
        if(!fileNFileObj[title]){
            
            fileNFileObj[title] = new FileObject(dir, title);
        }
        curObj = fileNFileObj[title];
        document.getElementById('content').innerHTML = curObj.fileData.toString();
    })
    document.getElementById('titles').appendChild(el)
});

var mainContent = document.getElementById('content');

mainContent.addEventListener('keydown',function(e){
    if(curObj){
        console.log("Unsaved")
        curObj.isSaved = false;

    }
    
});

ipcRenderer.on('SAVE_NEEDED', function(event, arg) {
   save_(curObj);
})

ipcRenderer.on('SAVE_ALL_NEEDED', function(event, arg) {
    
 })

function save_(currentFileObject){
    if(!currentFileObject.isSaved){
        if(currentFileObject) currentFileObject.fileData = Buffer(mainContent.innerHTML);
        fs.writeFile(currentFileObject.fullFilePath.toString(), currentFileObject.fileData, function(err){
            if(err) throw err;
            // ele.innerHTML = ele.innerHTML.slice(0,ele.innerHTML.length-1);
            console.log("Saved");
            curObj.isSaved = true;
        })
    }
}