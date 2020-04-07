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
        // console.log(curObj.pieceTable.undoStack);
    }
    else if (curObj.inptype.match(/delete/)) {
        curObj.pieceTable.deleteText(curObj.addpiecestart + 1, curObj.addpiecestart + curObj.lenofpiece + 1);
        // console.log(curObj.pieceTable.undoStack);
    }
    curObj.piecestring = [];
    curObj.lenofpiece = 0;
    curObj.addpiecestart = -10;
    curObj.inptype = "";
    console.log(curObj.pieceTable);


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
            // fileNFileObj[title].nodenumber = tabcontainer.childNodes.length - 1;
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

function deletetab(filetitle) {
    // console.log("working" + filetitle);
    // fileNFileObj.delete(filetitle);
    delete fileNFileObj[filetitle];
    // console.log(fileNFileObj + " " + Object.keys(fileNFileObj).length);
    if (Object.keys(fileNFileObj).length != 0) {
        if (curObj.fileName == filetitle) {
            // console.log(fileNFileObj);
            // console.log(fileNFileObj[Object.keys(fileNFileObj)[0]].fileName);

            settab(fileNFileObj[Object.keys(fileNFileObj)[0]].fileName);
        }
    }
    else
        curObj = null;
    document.getElementById(filetitle + "button").remove();
    document.getElementById(filetitle + "tabcontent").remove();

}
function settab(filetitle) {
    if (fileNFileObj[filetitle]) {
        if (curObj) {
            document.getElementById(curObj.fileName + "tabcontent").style.display = "none";
            // console.log(document.getElementById(curObj.fileName + "button").className);
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
}

function createtab(filetitle) {
    container.insertAdjacentHTML("beforeend", '<div id="' + filetitle + 'tabcontent" class="tabcontent"><div id="' + filetitle + 'rowcnt" class="rowcnt" readonly></div><textarea id="' + filetitle + 'textarea" class="content"> </textarea></div>');
    tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + filetitle + 'button" class="tablinks" onclick=settab("' + filetitle + '")>' + filetitle + '<span onclick=deletetab("' + filetitle + '") style="float:right;">&#10005;</span>' + '</button>');
}

function keuplistner(e) {
    console.log(rowcnt.childNodes.length);
}

function keydownlistner(e) {
    if (curObj && e.key.match(/Arrow/)) {
        if (curObj.piecestring.length != 0)
            addpiece();
    }
    if (curObj && (e.keyCode == 8 || e.keyCode == 46) && !e.altKey && mainContent.value.length >= mainContent.selectionStart) {
        if (curObj.lenofpiece != 0&&curObj.inptype!="delete") {
            addpiece();
            // console.log("MahaPagal");
            // console.log("Insertat158" + curObj.lenofpiece + "*" + curObj.inptype);
        }
        var numnewline = document.getSelection().toString();

        if (numnewline.length == 0) {
            if ((mainContent.value[mainContent.selectionStart - 1] == '\n' && e.keyCode == 8) || (mainContent.value[mainContent.selectionStart] == '\n' && e.keyCode == 46)) {
                decrementrow(1);
            }
            if (e.keyCode == 8 || e.keyCode == 46) {
                if (curObj.inptype != "delete") {
                    curObj.inptype = "delete";
                    curObj.addpiecestart = mainContent.selectionStart - 1;
                    curObj.lenofpiece=1;
                    if (e.keyCode == 46)
                        curObj.addpiecestart++;
                }
                else
                {
                    curObj.addpiecestart=Math.min(curObj.addpiecestart, mainContent.selectionStart - 1);
                    curObj.lenofpiece++;
                }
                console.log(curObj.addpiecestart + "*" + curObj.lenofpiece + "*" + mainContent.selectionEnd + '*');
                // addpiece();
            }

        }
        else {
            decrementrow(numnewline.split('\n').length - 1);
            curObj.lenofpiece = Math.abs(mainContent.selectionStart - mainContent.selectionEnd)
            curObj.addpiecestart = Math.min(mainContent.selectionStart, mainContent.selectionEnd);
            addpiece();

        }

        // console.log("ads" + mainContent.selectionStart + " " + mainContent.selectionEnd + document.getSelection());
    }
    else if (curObj && e.keyCode == 13 && !e.ctrlKey && !e.altKey) {
        if (curObj.inptype != 'insert')
            addpiece();
        if (curObj.addpiecestart == -10)
            curObj.addpiecestart = mainContent.selectionStart;
        curObj.piecestring.push('\n');
        curObj.inptype = "insert";
        curObj.lenofpiece++;
        var numnewline = document.getSelection().toString();
        incrementrow(1);

    }
}

function insertlistner(e) {
    if (curObj) {
        if (e.inputType.match(/insert/) && e.data != null) {
            if (curObj.inptype != 'insert')
                addpiece();
            if (curObj.addpiecestart == -10)
                curObj.addpiecestart = mainContent.selectionStart - 1;
            curObj.piecestring.push(e.data);
            curObj.inptype = "insert";
            curObj.lenofpiece++;
        }


        // console.log(e);
        // console.log(mainContent.value[mainContent.selectionStart - 1], "F");
        if (curObj.isSaved) {
            // console.log("Unsaved");
            curObj.fileName.toString();
            var titleofcurobj = document.getElementById(curObj.fileName.toString());
            var newtitle = curObj.fileName.toString() + "*";
            titleofcurobj.innerHTML = newtitle;
            document.getElementById(curObj.fileName + "button").innerHTML = newtitle + '<span onclick=deletetab("' + newtitle + '") style="float:right;">&#10005;</span>';
            // console.log(newtitle);
            curObj.isSaved = false;
        }

    }

}

function scrolllistner(e) {
    // console.log(mainContent.scrollTop + "*" + mainContent.scrollHeight);
    rowcnt.scrollTo(0, mainContent.scrollTop);

}

function clicklistener() {
    // console.log(Math.min(mainContent.selectionStart, mainContent.selectionEnd) == curObj.addpiecestart + curObj.lenofpiece);
    if (Math.min(mainContent.selectionStart, mainContent.selectionEnd) != curObj.addpiecestart + curObj.lenofpiece) {
        if (curObj.piecestring.length != 0)
            addpiece();
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
    var newtitle = curObj.fileName;
    if (curObj.isSaved === false) {
        titleofcurobj.innerHTML = newtitle;
        document.getElementById(curObj.fileName + "button").innerHTML = newtitle + '<span onclick=deletetab("' + newtitle + '") style="float:right;">&#10005;</span>';
        // console.log(newtitle);
    }
    addpiece();
    curObj.saveTheFile();
});

ipcRenderer.on('UNDO_NEEDED', function (event, arg) {
    // console.log('UNDO_NEEDED')
    if (curObj) {
        curObj.pieceTable.applyUndo();
        setCurText();
    }
});

ipcRenderer.on('REDO_NEEDED', function (event, arg) {
    // console.log('REDO_NEEDED')
    if (curObj) {
        curObj.pieceTable.applyRedo();
        setCurText();
    }
});

function setCurText() {
    let ms = [];
    let piece = curObj.pieceTable.pieceHead;
    while (piece) {
        let length = piece.end - piece.start + 1;
        for (let i = piece.start; i <= piece.end; i++) {
            ms.push(curObj.pieceTable.buffers[piece.bufferIndex][i]);
        }
        piece = piece.next;
    }
    console.log(ms.join(''));
    settab(curObj.fileName.toString());
    {
        mainContent.value = ms.join('');
        var lines = mainContent.value.split("\n");
        incrementrow(lines.length);
    }
    var titleofcurobj = document.getElementById(curObj.fileName.toString());
    var newtitle = curObj.fileName.toString() + "*";
    titleofcurobj.innerHTML = newtitle;
    document.getElementById(curObj.fileName + "button").innerHTML = newtitle + '<span onclick=deletetab("' + newtitle + '") style="float:right;">&#10005;</span>';
    // console.log(newtitle);
    curObj.isSaved = false;
}

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

function backupOnClose(){
    let jsonData = JSON.stringify(fileNFileObj);
    // console.log(jsonData);
    fs.writeFile('.bak/rm.json', jsonData, function(err){
        if(err) console.log(err);
        else console.log("Written");
    })

}

function loadBackup(){
    let jsonData = fs.readFileSync(".bak/rm.json", 'utf8');
    fileNFileObj = JSON.parse(jsonData);
    for (let key in fileNFileObj){
        fileNFileObj[key] = Object.assign(new FileObject, fileNFileObj[key]);
    }
    console.log(fileNFileObj);
}
