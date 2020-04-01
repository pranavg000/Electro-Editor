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
var rowcnt = document.getElementById("rowcnt");
var piecestring = [];
var inptype = ""
var addpiecestart = -10;
var lenofpiece = 0;
function addpiece() {
    console.log("*****");
    console.log(addpiecestart);
    console.log(lenofpiece);
    console.log(inptype);
    console.log("*****");
    if (inptype.match(/insert/)) {
        var reqstring = piecestring.join('');
        addpiecestart;
        console.log(reqstring);
        curObj.pieceTable.addText(reqstring, addpiecestart+1);
        console.log(curObj.pieceTable.undoStack);
        console.log(curObj.pieceTable);
        lenofpiece;
        piecestring = [];
    }
    else if (inptype.match(/delete/)) {
        addpiecestart;
        lenofpiece;
        curObj.pieceTable.deleteText(addpiecestart + 1, addpiecestart + lenofpiece+1);
        console.log(curObj.pieceTable.undoStack);
    }

}

function incrementrow(v) {
    while (v--)
        rowcnt.insertAdjacentHTML("beforeend", '<p> ' + (rowcnt.childNodes.length + 1) + '</p>');
}
function decrementrow(v) {
    while (v--)
        rowcnt.removeChild(rowcnt.childNodes[rowcnt.childNodes.length - 1]);
}
const ipcRenderer = require('electron').ipcRenderer
// const fs = require('fs')
// const path = require('path')
// const { readTitles } = require(path.resolve('actions/uiActions'))

let fileNFileObj = {};
inptype
const readTitles = function (dataURL) {
    let titles = []
    fs.readdirSync(dataURL).forEach((file, i) => {
        if (file.split('.').length == 2) {
            titles.push({
                title: `${file}`,
                dir: `${dataURL}/${file}`
            })
        }
    })
    return titles
}

var numline = 0;
var mainContent = document.getElementById('content');
var curObj = null;
readTitles('allfiles').map(({ title, dir }) => {
    el = document.createElement("li");
    text = document.createTextNode(`${title}`);
    el.appendChild(text)
    el.addEventListener('click', function (e) { // clicking on sidebar titles
        if (curObj) curObj.fileData = Buffer(mainContent.value);
        if (!fileNFileObj[title]) {

            fileNFileObj[title] = new FileObject(dir, title);
        }
        curObj = fileNFileObj[title];
        document.getElementById('content').value = curObj.fileData.toString();
        var lines = mainContent.value.split("\n");
        numline = lines.length;
        incrementrow(lines.length);
    })
    el.setAttribute("id", title);
    document.getElementById('titles').appendChild(el)
});

mainContent.addEventListener('keyup', function (e) {
    console.log(numline);
});

mainContent.addEventListener('keydown', function (e) {
    if (curObj && e.key.match(/Arrow/)) {
        if (lenofpiece != 0)
            addpiece();
        piecestring = [];
        lenofpiece = 0;
        addpiecestart = -10;
        inptype = "";
    }
    if (curObj && (e.keyCode == 8 || e.keyCode == 46)) {
        var numnewline = document.getSelection().toString();
        lenofpiece = Math.abs(mainContent.selectionStart - mainContent.selectionEnd) + 1;
        inptype = "delete";
        if (numnewline.length == 0) {
            if ((mainContent.value[mainContent.selectionStart - 1] == '\n' && e.keyCode == 8) || (mainContent.value[mainContent.selectionStart] == '\n' && e.keyCode == 46)) {
                numline -= 1;
                decrementrow(1);
            }
            if (e.keyCode == 8 || e.keyCode == 46) {
                addpiecestart = mainContent.selectionStart - 1;
                if (e.keyCode == 46)
                    addpiecestart++;
                addpiece();
                lenofpiece = 0;
                addpiecestart = -10;
                inptype = "";
            }

        }
        else {
            addpiecestart = Math.min(mainContent.selectionStart, mainContent.selectionEnd);
            lenofpiece--;
            addpiece();
            lenofpiece = 0;
            addpiecestart = -10;
            inptype = "";
            numline -= numnewline.split('\n').length - 1;
            decrementrow(numnewline.split('\n').length - 1);
        }

        // console.log("ads" + mainContent.selectionStart + " " + mainContent.selectionEnd + document.getSelection());
    }
    else if (curObj && e.keyCode == 13) {
        var numnewline = document.getSelection().toString();
        numline -= numnewline.split('\n').length - 1;
        numline++;
        incrementrow(1);

    }
});

mainContent.addEventListener('input', function (e) {
    if (curObj) {
        if (e.inputType.match(/insert/)) {
            if (addpiecestart == -10)
                addpiecestart = mainContent.selectionStart - 1;
            piecestring.push(e.data);
            inptype = e.inputType;
            lenofpiece++;
        }


        // console.log(e);
        console.log(mainContent.value[mainContent.selectionStart - 1]);
        if (curObj.isSaved) {
            // console.log("Unsaved");
            var titleofcurobj = document.getElementById(curObj.fileName.toString());
            var newtitle = titleofcurobj.innerHTML + "*";
            titleofcurobj.innerHTML = newtitle;
            // console.log(newtitle);
            curObj.isSaved = false;
        }

    }

});

ipcRenderer.on('SAVE_NEEDED', function (event, arg) {
    var titleofcurobj = document.getElementById(curObj.fileName.toString());
    var newtitle = titleofcurobj.innerHTML;
    if (curObj.isSaved == false) {
        newtitle = newtitle.slice(0, -1);
        titleofcurobj.innerHTML = newtitle;
        console.log(newtitle);
    }
    addpiece();
    piecestring = [];
    lenofpiece = 0;
    addpiecestart = -10;
    inptype = "";
    curObj.saveTheFile();
})

ipcRenderer.on('UNDO_NEEDED', function (event, arg) {
    if(curObj){
        curObj.pieceTable.applyUndo();
    }
})

function save_(currentFileObject) {
    if (!currentFileObject.isSaved) {
        if (currentFileObject) currentFileObject.fileData = mainContent.value;
        fs.writeFile(currentFileObject.fullFilePath.toString(), currentFileObject.fileData, function (err) {
            if (err) throw err;
            // ele.innerHTML = ele.innerHTML.slice(0,ele.innerHTML.length-1);
            console.log("Saved");
            curObj.isSaved = true;
        })
    }
}
