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
var rowcnt;
let fileNFileObj = {};
var mainContent;
var curObj = null;
var container = document.getElementById("container");
var tabcontainer = document.getElementById("tabcontainer");

function addpiece() {
    console.log("*****");
    console.log(curObj.addpiecestart);
    console.log(curObj.lenofpiece);
    console.log(curObj.inptype);
    console.log("*****");
    if (curObj.inptype.match(/insert/)) {
        var reqstring = curObj.piecestring.join('');
        console.log(reqstring);
        curObj.pieceTable.addText(reqstring, curObj.addpiecestart + 1);
        console.log(curObj.pieceTable.undoStack);
        console.log(curObj.pieceTable);
    }
    else if (curObj.inptype.match(/delete/)) {
        curObj.pieceTable.deleteText(curObj.addpiecestart + 1, curObj.addpiecestart + curObj.lenofpiece + 1);
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

readTitles('allfiles').map(({ title, dir }) => {
    el = document.createElement("li");
    text = document.createTextNode(`${title}`);
    el.appendChild(text)
    el.addEventListener('click', function (e) { // clicking on sidebar titles
        var check = 0;
        if (curObj) curObj.fileData = Buffer(mainContent.value);
        if (!fileNFileObj[title]) {
            fileNFileObj[title] = new FileObject(dir, title);
            createtab(title);
            check = 1;
        }
        settab(title);
        if (check == 1) {
            mainContent.value = curObj.fileData.toString();
            var lines = mainContent.value.split("\n");
            incrementrow(lines.length);
        }
    })
    el.setAttribute("id", title);
    document.getElementById('titles').appendChild(el)
});

function settab(filetitle) {
    if (curObj) {
        document.getElementById(curObj.fileName + "tabcontent").style.display = "none";
        console.log(document.getElementById(curObj.fileName + "button").className);
        document.getElementById(curObj.fileName + "button").className = document.getElementById(curObj.fileName + "button").className.replace(" active", "");
        removelistners();
    }
    curObj = fileNFileObj[filetitle];
    mainContent = document.getElementById(filetitle + "textarea");
    rowcnt = document.getElementById(filetitle + "rowcnt");
    document.getElementById(filetitle + "tabcontent").style.display = "inline-block";
    document.getElementById(curObj.fileName + "button").className += " active";
    createlistners();
}

function createtab(filetitle) {
    container.insertAdjacentHTML("beforeend", '<div id="' + filetitle + 'tabcontent" class="tabcontent"><div id="' + filetitle + 'rowcnt" class="rowcnt" readonly></div><textarea id="' + filetitle + 'textarea" class="content"> </textarea></div>');
    tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + filetitle + 'button" class="tablinks" onclick=settab("' + filetitle + '")>' + filetitle + '</button>');
}

function keuplistner(e) {
    console.log(rowcnt.childNodes.length);
}

function keydownlistner(e) {
    if (curObj && e.key.match(/Arrow/)) {
        if (curObj.piecestring.length != 0)
            addpiece();
        curObj.piecestring = [];
        curObj.lenofpiece = 0;
        curObj.addpiecestart = -10;
        curObj.inptype = "";
    }
    if (curObj && (e.keyCode == 8 || e.keyCode == 46) && !e.altKey) {
        if (lenofpiece != 0)
            addpiece();
        var numnewline = document.getSelection().toString();
        lenofpiece = Math.abs(mainContent.selectionStart - mainContent.selectionEnd) + 1;
        curObj.inptype = "delete";
        if (numnewline.length == 0) {
            if ((mainContent.value[mainContent.selectionStart - 1] == '\n' && e.keyCode == 8) || (mainContent.value[mainContent.selectionStart] == '\n' && e.keyCode == 46)) {
                decrementrow(1);
            }
            if (e.keyCode == 8 || e.keyCode == 46) {
                curObj.addpiecestart = mainContent.selectionStart - 1;
                if (e.keyCode == 46)
                    curObj.addpiecestart++;
                addpiece();
                curObjlenofpiece = 0;
                curObj.addpiecestart = -10;
                curObj.inptype = "";
            }

        }
        else {
            decrementrow(numnewline.split('\n').length - 1);
            curObj.addpiecestart = Math.min(mainContent.selectionStart, mainContent.selectionEnd);
            curObj.lenofpiece--;
            addpiece();
            curObj.lenofpiece = 0;
            curObj.addpiecestart = -10;
            curObj.inptype = "";

        }

        // console.log("ads" + mainContent.selectionStart + " " + mainContent.selectionEnd + document.getSelection());
    }
    else if (curObj && e.keyCode == 13 && !e.ctrlKey && !e.altKey) {
        if (curObj.addpiecestart == -10)
            curObj.addpiecestart = mainContent.selectionStart;
        curObj.piecestring.push('\n');
        curObj.inptype = e.inputType;
        curObj.lenofpiece++;
        var numnewline = document.getSelection().toString();
        incrementrow(1);

    }
}

function insertlistner(e) {
    if (curObj) {
        if (e.inputType.match(/insert/)) {
            if (curObj.addpiecestart == -10)
                curObj.addpiecestart = mainContent.selectionStart - 1;
            curObj.piecestring.push(e.data);
            curObj.inptype = e.inputType;
            curObj.lenofpiece++;
        }


        // console.log(e);
        console.log(mainContent.value[mainContent.selectionStart - 1]);
        if (curObj.isSaved) {
            // console.log("Unsaved");
            var titleofcurobj = document.getElementById(curObj.fileName.toString());
            var newtitle = titleofcurobj.innerHTML + "*";
            titleofcurobj.innerHTML = newtitle;
            document.getElementById(curObj.fileName + "button").innerHTML = newtitle;
            // console.log(newtitle);
            curObj.isSaved = false;
        }

    }

}

function scrolllistner(e) {
    console.log(mainContent.scrollTop + "*" + mainContent.scrollHeight);
    rowcnt.scrollTo(0, mainContent.scrollTop);

}

function clicklistener() {
    console.log(Math.min(mainContent.selectionStart, mainContent.selectionEnd) == curObj.addpiecestart + curObj.lenofpiece);
    if (Math.min(mainContent.selectionStart, mainContent.selectionEnd) != curObj.addpiecestart + curObj.lenofpiece) {
        if (curObj.piecestring.length != 0)
            addpiece();
        curObj.piecestring = [];
        curObj.lenofpiece = 0;
        curObj.addpiecestart = -10;
        curObj.inptype = "";
    }
}

function createlistners() {
    mainContent.addEventListener('keyup', keuplistner);

    mainContent.addEventListener('keydown', keydownlistner);

    mainContent.addEventListener('input', insertlistner);


    mainContent.addEventListener('scroll', scrolllistner);

    mainContent.addEventListener('click', clicklistener);
}
function removelistners() {
    mainContent.removeEventListener('keyup', keuplistner);

    mainContent.removeEventListener('keydown', keydownlistner);

    mainContent.removeEventListener('input', insertlistner);


    mainContent.removeEventListener('scroll', scrolllistner);

    mainContent.removeEventListener('click', clicklistener);

}


ipcRenderer.on('SAVE_NEEDED', function (event, arg) {
    var titleofcurobj = document.getElementById(curObj.fileName.toString());
    var newtitle = titleofcurobj.innerHTML;
    if (curObj.isSaved == false) {
        newtitle = newtitle.slice(0, -1);
        titleofcurobj.innerHTML = newtitle;
        document.getElementById(curObj.fileName + "button").innerHTML = newtitle;
        console.log(newtitle);
    }
    addpiece();
    curObj.piecestring = [];
    curObj.lenofpiece = 0;
    curObj.addpiecestart = -10;
    curObj.inptype = "";
    curObj.saveTheFile();
})

ipcRenderer.on('UNDO_NEEDED', function (event, arg) {
    if (curObj) {
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
