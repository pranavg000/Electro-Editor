const remote = require('electron').remote
const { dialog } = remote;

const win = remote.getCurrentWindow();

var rowcnt;
var fileNFileObj = {};
var mainContent;
var curObj = null;
var container = document.getElementById("container");
var tabcontainer = document.getElementById("tabcontainer");
var deletePromptOptions  = {
    type: "warning",
    buttons: ["Yes","No","Cancel"],
    message: "Do you want to Save the changes you made",
    detail : "Your changes will be lost if you don't save them."
}
function addpiece() {
    console.log("*****");
    console.log(curObj.addpiecestart);
    console.log(curObj.lenofpiece);
    console.log(curObj.inptype);
    console.log("*****");
    if (curObj.inptype.match(/insert/)) {
        var reqstring = curObj.piecestring.join('');
        console.log(reqstring, curObj.addpiecestart + 1);
        // console.log()
        curObj.pieceTable.addText(reqstring, curObj.addpiecestart + 1);

    }
    else if (curObj.inptype.match(/delete/)) {
        console.log(curObj.addpiecestart + 1, curObj.addpiecestart + curObj.lenofpiece + 1);
        curObj.pieceTable.deleteText(curObj.addpiecestart + 1, curObj.addpiecestart + curObj.lenofpiece + 1);
        // console.log(curObj.pieceTable.undoStack);
    }
    curObj.piecestring = [];
    curObj.lenofpiece = 0;
    curObj.addpiecestart = -10;
    curObj.inptype = "";
    // console.log(curObj.pieceTable);


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
        // if (curObj) curObj.fileData = Buffer(mainContent.value);
        if (!fileNFileObj[title]) {
            fileNFileObj[title] = new FileObject(dir, title);
            createtab(title);
            // fileNFileObj[title].nodenumber = tabcontainer.childNodes.length - 1;
            check = 1;
        }
        settab(title);
        if (check == 1) {
            mainContent.value = curObj.pieceTable.buffers[0].toString();
            var lines = mainContent.value.split("\n");
            incrementrow(lines.length);
        }
    })
    el.setAttribute("id", title);
    document.getElementById('titles').appendChild(el);
});

function deleteTabSafe(filetitle) {
    if(filetitle[filetitle.length - 1] === "*") filetitle = filetitle.slice(0, filetitle.length - 1);
    console.log(filetitle)
    if(fileNFileObj[filetitle].isSaved){
        deletetab(filetitle);
    }
    else{
        deletePromptOptions.message = "Do you want to Save the changes you made to " + filetitle + "?";
        dialog.showMessageBox(win, deletePromptOptions).then(response => {
            response = response.response;

            if(response === 0){
                saveFileObject(fileNFileObj[filetitle]);
            }
            else if(response === 2){
                return;
            }
            var titleofcurobj = document.getElementById(filetitle);
            titleofcurobj.innerHTML = filetitle;
            deletetab(filetitle)
            // delete tempObj;
        })
    }
    
    // console.log(fileNFileObj + " " + Object.keys(fileNFileObj).length); 
}

function deletetab(filetitle){
    
    if (curObj.fileName == filetitle) {
        // console.log(fileNFileObj);
        // console.log(fileNFileObj[Object.keys(fileNFileObj)[0]].fileName);
        fixed = false;
        for(let key in fileNFileObj){
            if(key != filetitle){
                settab(key);
                fixed = true;
                break;
            }
        }
        if(!fixed) curObj = null;
    }
    document.getElementById(filetitle + "button").remove();
    document.getElementById(filetitle + "tabcontent").remove();

    delete fileNFileObj[filetitle];
}

function settab(filetitle) {
    // console.log(filetitle, curObj);
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

function createtab(filetitle, isSaved=true) {
    container.insertAdjacentHTML("beforeend", '<div id="' + filetitle + 'tabcontent" class="tabcontent"><div id="' + filetitle + 'rowcnt" class="rowcnt" readonly></div><textarea id="' + filetitle + 'textarea" class="content"> </textarea></div>');
    if(isSaved)
    tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + filetitle + 'button" class="tablinks" onclick=settab("' + filetitle + '")>' + filetitle + '<span onclick=deleteTabSafe("' + filetitle + '") style="float:right;">&#10005;</span>' + '</button>');
    else
    tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + filetitle + 'button" class="tablinks" onclick=settab("' + filetitle + '")>' + filetitle + "*" + '<span onclick=deleteTabSafe("' + filetitle + '") style="float:right;">&#10005;</span>' + '</button>');

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
        if (curObj.lenofpiece != 0 && curObj.inptype != "delete") {
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
                    curObj.lenofpiece = 1;
                    if (e.keyCode == 46)
                        curObj.addpiecestart++;
                }
                else {
                    curObj.addpiecestart = Math.min(curObj.addpiecestart, mainContent.selectionStart - 1);
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
            document.getElementById(curObj.fileName + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + newtitle + '") style="float:right;">&#10005;</span>';
            // console.log(newtitle);
            curObj.isSaved = false;
        }

    }

}

function scrolllistner(e) {
    // console.log(mainContent.scrollTop + "*" + mainContent.scrollHeight);
    rowcnt.scrollTo(0, mainContent.scrollTop);

}

function clicklistener(e) {
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
    saveFileObject(curObj);
});

function saveFileObject(obj){
    var titleofcurobj = document.getElementById(obj.fileName.toString());
    var newtitle = obj.fileName;
    if (obj.isSaved === false) {
        titleofcurobj.innerHTML = newtitle;
        document.getElementById(obj.fileName + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + newtitle + '") style="float:right;">&#10005;</span>';
    }
    addpiece();
    obj.saveTheFile();
}

ipcRenderer.on('UNDO_NEEDED', function (event, arg) {
    if (curObj) {
        curObj.pieceTable.applyUndo();
        setCurText();
    }
});

ipcRenderer.on('REDO_NEEDED', function (event, arg) {
    if (curObj) {
        curObj.pieceTable.applyRedo();
        setCurText();
    }
});

ipcRenderer.on('FIND', function (event, arg) {
    // console.log('REDO_NEEDED')
    if (curObj) {
        document.getElementById("findbar").style.display = "inline";
        // const noti ={"title":"asv","body":"adsf"};
        // const find = new window.Notification("abs",noti);
        // const find1 =new window.HTMLDialogElement;
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
    document.getElementById(curObj.fileName + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + newtitle + '") style="float:right;">&#10005;</span>';
    // console.log(newtitle);
    curObj.isSaved = false;
}
var issearchtextchanged = 1;
var searchidx = 0;
var reqarray = [];


// document.getElementById("searchbar").addEventListener('keyup', function def(e) {
//     if (e.keyCode == 13) {
//         findbarsearch();
//     }
// });

document.getElementById("searchbar").addEventListener('input', function def(e) {
    issearchtextchanged = 1;
    document.getElementById("findbar-text").innerHTML = "No Results";

});


function findbarsearch() {
    let pattern = document.getElementById("searchbar").value;
    if (issearchtextchanged == 1) {
        reqarray = findtext(pattern);
        console.log(reqarray);
        searchidx = 0;
        issearchtextchanged = 0;
        if (reqarray.length > 0) {
            mainContent.select();
            // mainContent.setSelectionRange(Math.max(0,reqarray[searchidx]-50), Math.max(0,reqarray[searchidx]-50));
            // mainContent.focus();
            mainContent.scrollTo(Math.max(0,reqarray[searchidx]-50),Math.max(0,reqarray[searchidx]-50));
            mainContent.setSelectionRange(reqarray[searchidx], reqarray[searchidx] + pattern.length);
            searchidx = (searchidx + 1) % reqarray.length;
        }
        document.getElementById("findbar-text").innerHTML = (searchidx) + "/" + reqarray.length;
    }
    else {
        if (reqarray.length != 0) {
            mainContent.select();
            mainContent.scrollTo(Math.max(0,reqarray[searchidx]-50),Math.max(0,reqarray[searchidx]-50));
            mainContent.setSelectionRange(reqarray[searchidx], reqarray[searchidx] + pattern.length);
            document.getElementById("findbar-text").innerHTML = (searchidx + 1) + "/" + reqarray.length;
            searchidx = (searchidx + 1) % reqarray.length;
        }
    }
    // mainContent.blur();

}

function iseq(c1, c2) {
    // console.log(c1.toString().toLowerCase() == c2.toString().toLowerCase());
    return c1.toString().toLowerCase() == c2.toString().toLowerCase();
}

function findtext(pattern) {
    let texttosearch = mainContent.value;
    let M = pattern.length;
    let N = texttosearch.length;
    let lps = new Array(M);
    let i = 1;
    let j = 0;
    let len = 0;
    lps[0] = 0;
    while (i < M) {
        if (pattern[i] == pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        }
        else {
            if (len != 0)
                len = lps[len - 1];
            else {
                lps[i] = 0;
                i++;
            }
        }
    }
    i = 0;
    let ans = [];
    while (i < N) {
        if (iseq(pattern[j], texttosearch[i])) {
            i++;
            j++;
            if (j == M) {
                ans.push(i - j);
                j = lps[j - 1];
            }
        }
        else {
            if (j != 0)
                j = lps[j - 1];
            else
                i++;
        }
    }
    return ans;

}

function hide() {
    document.getElementById("findbar").style.display = "none";
}

function backupOnClose() {
    for (const key in fileNFileObj) {
        if(!fileNFileObj[key].isSaved)
        fileNFileObj[key].reset();
        else
        fileNFileObj[key] = fileNFileObj[key].fullFilePath;
    }
    let jsonData = JSON.stringify(fileNFileObj);
    console.log(jsonData);
    fs.writeFile('.bak/main.json', jsonData, function (err) {
        if (err) console.log(err);
    })

}

function loadBackup() {
    fs.exists(".bak/main.json", (exists) => {
        if (exists) {
            fs.readFile(".bak/main.json", (err, jsonData) => {
                if (err) return;
                console.log(jsonData);
                fileNFileObj = JSON.parse(jsonData);
                console.log(fileNFileObj);
                
                for (const [key, value] of Object.entries(fileNFileObj)) {
                    if(typeof value === 'object')
                    fileNFileObj[key] = new FileObject("A", "A", value);//Object.assign(new FileObject, fileNFileObj[key]);
                    else
                    fileNFileObj[key] = new FileObject(value, key);
                }
                console.log(fileNFileObj);

                setbackupdata();
            })
        }
    })
}


function setbackupdata() {


    console.log(fileNFileObj);

    for (var title in fileNFileObj) {

        // console.log(title);
        let obj = fileNFileObj[title];
        createtab(title, obj.isSaved);
        obj.nodenumber = tabcontainer.childNodes.length - 1;
        settab(title);
        if(!obj.isSaved){
            document.getElementById(curObj.fileName.toString()).innerHTML = title + "*";
        }
        mainContent.value = curObj.pieceTable.buffers[0].toString();
        var lines = mainContent.value.split("\n");
        incrementrow(lines.length);
    }
}
loadBackup();

// iseq('A','A');
// console.log(fileNFileObj)
// setbackupdata();



window.onbeforeunload = (e) => {
    backupOnClose();
    console.log("Back up complete");
}

let textInputFormDiv = document.getElementsByClassName('bottom_footer')[0];

ipcRenderer.on('NEW_FILE_NEEDED', function(event, arg){
    // console.log("RECEIVED")
    // if (textInputFormDiv.style.display === "none") {
    //     textInputFormDiv.style.display = "block";
    // } else {
    //     textInputFormDiv.style.display = "none";
    // }

    if (textInputFormDiv.style.display === "none") {
        textInputFormDiv.style.display = "block";
    }
})

let textInputForm =  document.getElementById('bottom_footer_form');
textInputForm.addEventListener('submit', function(e){
    e.preventDefault()
    let newFileName = document.getElementById("bottom_form_input").value;
    document.getElementById("bottom_form_input").value = "";
    let newFilePath = "allfiles/"+newFileName;
    if(fs.exists(newFilePath, (exists)=>{
        if(!exists){
            fs.closeSync(fs.openSync(newFilePath, 'w'));
            el = document.createElement("li");
            text = document.createTextNode(newFileName);
            el.appendChild(text)
            el.addEventListener('click', function (e) { // clicking on sidebar titles
                var check = 0;
                // if (curObj) curObj.fileData = Buffer(mainContent.value);
                if (!fileNFileObj[newFileName]) {
                    fileNFileObj[newFileName] = new FileObject(newFilePath, newFileName);
                    createtab(newFileName);
                    // fileNFileObj[title].nodenumber = tabcontainer.childNodes.length - 1;
                    check = 1;
                }
                settab(newFileName);
                if (check == 1) {
                    mainContent.value = curObj.pieceTable.buffers[0].toString();
                    var lines = mainContent.value.split("\n");
                    incrementrow(lines.length);
                }
            })
            el.setAttribute("id", newFileName);
            document.getElementById('titles').appendChild(el);

            textInputFormDiv.style.display = "none";
        }
    }))
    // write file here ?
    console.log(newFileName)
})

