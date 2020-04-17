const remote = require('electron').remote
const { dialog, MenuItem, Menu } = remote;

const win = remote.getCurrentWindow();
var rowcnt;
var openFiles = {};
var mainContent;
var rightClickTarget = null;
var curObj = null;
var container = document.getElementById("container");
var tabcontainer = document.getElementById("tabcontainer");
var deletePromptOptions = {
    type: "warning",
    buttons: ["Yes", "No", "Cancel"],
    message: "Do you want to Save the changes you made",
    detail: "Your changes will be lost if you don't save them."
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

// const readTitles = function (dataURL) {
//     let titles = []
//     fs.readdirSync(dataURL).forEach((file, i) => {
//         if (file.split('.').length == 2) {
//             titles.push({
//                 title: `${file}`,
//                 dir: `${dataURL}/${file}`
//             })
//         }
//     })
//     return titles
// }
const ctxMenu = new Menu();
ctxMenu.append(new MenuItem({
    label: 'New File',
    click: () => {
        displayTextInputForm("file", rightClickTarget.id);
        // console.log("HEllo");
    }
}));
ctxMenu.append(new MenuItem({
    label: 'New Folder',
    click: () => {
        displayTextInputForm("folder", rightClickTarget.id);
    }
}));
function addContextMenu(folderEl){
    folderEl.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
        rightClickTarget = ev.target.parentElement;
        ctxMenu.popup(win);
    }, false);
    
}

function walkSync(currentDirPath, folderEl) {
    console.log("walk", currentDirPath, folderEl);
    fs.readdirSync(currentDirPath).forEach(function (name) {
        // var filePath = path.join(currentDirPath, name);
        var filePath = currentDirPath + "/" + name;
        var stat = fs.statSync(filePath);
        let el = document.createElement("li");
        let text = document.createTextNode(name);
        if (stat.isFile()) {
            // Handle files 
            // Handle Click
            el.appendChild(text)
            el.setAttribute("id", filePath);
            el.addEventListener('click', function (e) { // clicking on sidebar names
                var check = 0;
                // if (curObj) curObj.fileData = Buffer(mainContent.value);
                if (!openFiles[filePath]) {
                    console.log(filePath, name);
                    openFiles[filePath] = new FileObject(filePath, name);
                    createtab(filePath);
                    // fileNFileObj[name].nodenumber = tabcontainer.childNodes.length - 1;
                    check = 1;
                }
                settab(filePath);
                if (check == 1) {
                    mainContent.value = curObj.pieceTable.buffers[0].toString();
                    var lines = mainContent.value.split("\n");
                    incrementrow(lines.length);
                }
            })

        } else if (stat.isDirectory()) {
            // Handle Folders
            let sp = document.createElement("span");
            sp.className = "caret";
            sp.append(text);
            el.className = "folder";
            el.appendChild(sp);
            let ulist = document.createElement("ul");
            ulist.setAttribute("id", filePath + "ul");
            ulist.className = "nested";
            el.appendChild(ulist);
            el.setAttribute("id", filePath);
            addContextMenu(sp);
            walkSync(filePath, ulist);
        }
        folderEl.appendChild(el);

    });
}
function displayFolder(folderPath){
    var el = document.createElement("li");
    let text = document.createTextNode(folderPath.replace(/^.*[\\\/]/, ''));
    let sp = document.createElement("span");
    sp.className = "caret";
    sp.append(text);
    el.className = "folder";
    el.appendChild(sp);
    let ulist = document.createElement("ul");
    ulist.setAttribute("id", folderPath + "ul");
    ulist.className = "nested";
    el.appendChild(ulist);
    el.setAttribute("id", folderPath);
    addContextMenu(sp);
    document.getElementById('titles').appendChild(el);
    walkSync(folderPath, ulist);
}
displayFolder('allfiles'); // TODO : Open any folder


function deleteTabSafe(fileKey) {
    let filetitle = openFiles[fileKey].fileName;
    if(filetitle[filetitle.length - 1] === "*") filetitle = filetitle.slice(0, filetitle.length - 1);
    if(openFiles[fileKey].isSaved){
        deletetab(fileKey);

    }
    else {
        deletePromptOptions.message = "Do you want to Save the changes you made to " + filetitle + "?";
        dialog.showMessageBox(win, deletePromptOptions).then(response => {
            response = response.response;

            if(response === 0){
                saveFileObject(openFiles[fileKey]);
            }
            else if (response === 2) {
                return;
            }
            var titleofcurobj = document.getElementById(fileKey);
            titleofcurobj.innerHTML = filetitle;
            deletetab(fileKey)
            // delete tempObj;
        })
    }
    
}

function deletetab(fileKey){
    
    if (curObj.fullFilePath == fileKey) {
        fixed = false;
        for(let key in openFiles){
            if(key != fileKey){
                settab(key);
                fixed = true;
                break;
            }
        }
        if (!fixed) curObj = null;
    }
    document.getElementById(fileKey + "button").remove();
    document.getElementById(fileKey + "tabcontent").remove();

    delete openFiles[fileKey];
}

function settab(fileKey) {
    if (openFiles[fileKey]) {
        if (curObj) {
            document.getElementById(curObj.fullFilePath + "tabcontent").style.display = "none";
            document.getElementById(curObj.fullFilePath + "button").className = document.getElementById(curObj.fullFilePath + "button").className.replace(" active", "");
            removelistners();
        }

        curObj = openFiles[fileKey];
        mainContent = document.getElementById(fileKey + "textarea");
        rowcnt = document.getElementById(fileKey + "rowcnt");
        document.getElementById(fileKey + "tabcontent").style.display = "inline-block";
        document.getElementById(fileKey + "button").className += " active";
        createlistners();
    }
}

function createtab(fileKey, isSaved=true) {
    let filetitle = openFiles[fileKey].fileName;
    container.insertAdjacentHTML("beforeend", '<div id="' + fileKey + 'tabcontent" class="tabcontent"><div id="' + fileKey + 'rowcnt" class="rowcnt" readonly></div><textarea id="' + fileKey + 'textarea" class="content"> </textarea></div>');
    if(isSaved)
    tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + fileKey + 'button" class="tablinks" onclick=settab("' + fileKey + '")>' + filetitle + '<span class="cross-button" onclick=deleteTabSafe("' + fileKey + '") style="float:right;">&#10005;</span>' + '</button>');
    else
    tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + fileKey + 'button" class="tablinks" onclick=settab("' + fileKey + '")>' + filetitle + "*" + '<span class="cross-button" onclick=deleteTabSafe("' + fileKey + '") style="float:right;">&#10005;</span>' + '</button>');


}

function keuplistner(e) {
    // console.log(rowcnt.childNodes.length);
}

function keydownlistner(e) {
    if (curObj && e.key.match(/Arrow/)) {
        if (curObj.piecestring.length != 0)
            addpiece();
    }
    if (curObj && (e.keyCode == 8 || e.keyCode == 46) && !e.altKey && mainContent.value.length >= mainContent.selectionStart) {
        if (curObj.lenofpiece != 0 && curObj.inptype != "delete") {
            addpiece();
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
                // console.log(curObj.addpiecestart + "*" + curObj.lenofpiece + "*" + mainContent.selectionEnd + '*');
                // addpiece();
            }

        }
        else {
            curObj.inptype = "delete";
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
        console.log("IIII");
        if (e.inputType.match(/insert/) && e.data != null) {
            console.log("hhh");
            if (curObj.inptype != 'insert')
                addpiece();
            if (curObj.addpiecestart == -10)
                curObj.addpiecestart = mainContent.selectionStart - 1;
            curObj.piecestring.push(e.data);
            curObj.inptype = "insert";
            curObj.lenofpiece++;
        }
        // else if (e.inputType.match(/insertFromPaste/)) {
        //     let paste = (e.clipboardData || window.clipboardData).getData('text');
        //     console.log("Paste:" + e.clipboardData);

        //     setTimeout(function () {
        //         // gets the copied text after a specified time (100 milliseconds)
        //         var text = e.text;
        //         console.log(text);
        //     }, 100);
        // }
        // console.log(e.inputType + e.data);

        // console.log(mainContent.value[mainContent.selectionStart - 1], "F");
        if (curObj.isSaved) {
            // console.log("Unsaved");
            // curObj.fileName.toString();
            var titleofcurobj = document.getElementById(curObj.fullFilePath.toString());
            var newtitle = curObj.fileName.toString() + "*";
            titleofcurobj.innerHTML = newtitle;
            document.getElementById(curObj.fullFilePath + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + curObj.fullFilePath + '") style="float:right;">&#10005;</span>';
            // console.log(newtitle);
            curObj.isSaved = false;
        }
//         makeunsaved();


    }

}

function makeunsaved() {
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

function scrolllistner(e) {
    rowcnt.scrollTo(0, mainContent.scrollTop);

}

function clicklistener(e) {
    if (Math.min(mainContent.selectionStart, mainContent.selectionEnd) != curObj.addpiecestart + curObj.lenofpiece) {
        if (curObj.piecestring.length != 0)
            addpiece();
    }
}

function pastelistner(e) {
    console.log(e.clipboardData.getData('text'));
    let txt = e.clipboardData.getData('text');
    if (txt.length > 0) {
        addpiece();
        curObj.addpiecestart = mainContent.selectionStart;
        curObj.piecestring.push(txt);
        curObj.inptype = "insert";
        curObj.lenofpiece = txt.length;
        incrementrow(txt.split('\n').length - 1);
        addpiece();
    }
    console.log(mainContent.selectionStart);
}

function cutlistner(e) {
    // console.log("JI");
    console.log(document.getSelection().toString());
    var numnewline1 = document.getSelection().toString();
    if (numnewline1.length > 0) {
        addpiece();
        curObj.inptype = "delete";
        decrementrow(numnewline1.split('\n').length - 1);
        curObj.lenofpiece = Math.abs(mainContent.selectionStart - mainContent.selectionEnd)
        curObj.addpiecestart = Math.min(mainContent.selectionStart, mainContent.selectionEnd);
        addpiece();
    }

}
function createlistners() {
    mainContent.addEventListener('keyup', keuplistner);

    mainContent.addEventListener('keydown', keydownlistner);

    mainContent.addEventListener('input', insertlistner);


    mainContent.addEventListener('scroll', scrolllistner);

    mainContent.addEventListener('click', clicklistener);

    mainContent.addEventListener('paste', pastelistner);

    mainContent.addEventListener('cut', cutlistner);
}
function removelistners() {
    mainContent.removeEventListener('keyup', keuplistner);

    mainContent.removeEventListener('keydown', keydownlistner);

    mainContent.removeEventListener('input', insertlistner);


    mainContent.removeEventListener('scroll', scrolllistner);

    mainContent.removeEventListener('click', clicklistener);

    mainContent.removeEventListener('paste', pastelistner);

    mainContent.removeEventListener('cut', cutlistner);
}


ipcRenderer.on('SAVE_NEEDED', function (event, arg) {
    saveFileObject(curObj);
});

function saveFileObject(obj){
    var titleofcurobj = document.getElementById(obj.fullFilePath.toString());
    var newtitle = obj.fileName;
    var newPath = obj.fullFilePath;
    if (obj.isSaved === false) {
        titleofcurobj.innerHTML = newtitle;
        document.getElementById(newPath + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + newPath + '") style="float:right;">&#10005;</span>';
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
    if (curObj) {
        document.getElementById("findbar").style.display = "inline";
        document.getElementById("replacebar").style.display = "inline";

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
    settab(curObj.fullFilePath.toString());
    {
        mainContent.value = ms.join('');
        var lines = mainContent.value.split("\n");
        incrementrow(lines.length);
    }
    var titleofcurobj = document.getElementById(curObj.fullFilePath.toString());
    var newtitle = curObj.fileName.toString() + "*";
    titleofcurobj.innerHTML = newtitle;
    document.getElementById(curObj.fullFilePath + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + curObj.fullFilePath + '") style="float:right;">&#10005;</span>';
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
    reqarray = [];
    searchidx = 0;
    document.getElementById("findbar-text").innerHTML = "No Results";

});


function replace_all() {
    let replacetxt = document.getElementById("replacesearchbar").value;
    let pattern = document.getElementById("searchbar").value;
    var off = 0;
    if (issearchtextchanged == 0 && reqarray.length > 0 && replacetxt != pattern) {
        makeunsaved();
        addpiece();
        for (var i = 0; i < reqarray.length; i++) {
            reqarray[i] = reqarray[i] + off;
            // mainContent.select();
            // mainContent.scrollTo(Math.max(0, reqarray[i] - 50), Math.max(0, reqarray[i] - 50));
            // mainContent.setSelectionRange(reqarray[i], reqarray[i] + pattern.length);
            curObj.inptype = "delete";
            curObj.lenofpiece = Math.abs(pattern.length)
            curObj.addpiecestart = Math.min(reqarray[i], reqarray[i] + pattern.length);
            console.log("IMP**************" + reqarray[i]);
            addpiece();
            curObj.addpiecestart = reqarray[i];
            curObj.piecestring.push(replacetxt);
            curObj.inptype = "insert";
            curObj.lenofpiece = replacetxt.length;
            addpiece();
            mainContent.setRangeText(replacetxt, reqarray[i], reqarray[i] + pattern.length);
            off = off + replacetxt.length - pattern.length;
        }
        issearchtextchanged = 1;
        reqarray = [];
        searchidx = 0;
        document.getElementById("findbar-text").innerHTML = "No Results";
    }
}

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
            mainContent.scrollTo(Math.max(0, reqarray[searchidx] - 50), Math.max(0, reqarray[searchidx] - 50));
            mainContent.setSelectionRange(reqarray[searchidx], reqarray[searchidx] + pattern.length);
            searchidx = (searchidx + 1) % reqarray.length;
        }
        document.getElementById("findbar-text").innerHTML = (searchidx) + "/" + reqarray.length;
    }
    else {
        if (reqarray.length != 0) {
            mainContent.select();
            mainContent.scrollTo(Math.max(0, reqarray[searchidx] - 50), Math.max(0, reqarray[searchidx] - 50));
            mainContent.setSelectionRange(reqarray[searchidx], reqarray[searchidx] + pattern.length);
            document.getElementById("findbar-text").innerHTML = (searchidx + 1) + "/" + reqarray.length;
            searchidx = (searchidx + 1) % reqarray.length;
        }
    }
    // mainContent.blur();

}

function iseq(c1, c2) {
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
    document.getElementById("searchbar").value = "";
    document.getElementById("replacebar").style.display = "none";
    document.getElementById("replacesearchbar").value = "";
    document.getElementById("findbar-text").innerHTML = "No Results";
}

function backupOnClose() {
    for (const key in openFiles) {
        if(!openFiles[key].isSaved)
        openFiles[key].reset();
        else
        openFiles[key] = "";

    }
    let jsonData = JSON.stringify(openFiles);
    fs.writeFile('.bak/main.json', jsonData, function (err) {
        if (err) console.log(err);
    })

}

function loadBackup() {
    fs.exists(".bak/main.json", (exists) => {
        if (exists) {
            fs.readFile(".bak/main.json", (err, jsonData) => {
                if (err) return;
                openFiles = JSON.parse(jsonData);
                
                for (const [key, value] of Object.entries(openFiles)) {
                    if(value)
                    openFiles[key] = new FileObject("A", "A", value);//Object.assign(new FileObject, fileNFileObj[key]);
                    else{
                        fullFilePath = key;
                        fileName = key.replace(/^.*[\\\/]/, '');
                        openFiles[key] = new FileObject(fullFilePath, fileName);
                    }
                    

                }

                setbackupdata();
            })
        }
    })
}


function setbackupdata() {


    console.log(openFiles);

    for (var key in openFiles) {
        
        let obj = openFiles[key];
        let title = obj.fileName;
        createtab(key, obj.isSaved);
        obj.nodenumber = tabcontainer.childNodes.length - 1;
        settab(key);
        if(!obj.isSaved){
            document.getElementById(curObj.fullFilePath.toString()).innerHTML = title + "*";

        }
        mainContent.value = curObj.pieceTable.buffers[0].toString();
        var lines = mainContent.value.split("\n");
        incrementrow(lines.length);
    }
}
loadBackup();



window.onbeforeunload = (e) => {
    backupOnClose();
    console.log("Back up complete");
}

let textInputFormDiv = document.getElementsByClassName('bottom_footer')[0];
function displayTextInputForm(ftype, folder=""){
    console.log(ftype, folder);
    if (textInputFormDiv.style.display === "none") {
        document.getElementById('bottom_form_input_folder').value = folder;
        document.getElementById('bottom_form_input_ftype').value = ftype;
        textInputFormDiv.style.display = "block";
    }
}

function hideTextInputForm(){
    if (textInputFormDiv.style.display === "block") {
        document.getElementById("bottom_form_input").value = "";
        textInputFormDiv.style.display = "none";
    }
}

ipcRenderer.on('NEW_FILE_NEEDED', function(event, arg){
    displayTextInputForm("file"); 
})

let textInputForm =  document.getElementById('bottom_footer_form');
textInputForm.addEventListener('submit', function(e){
    e.preventDefault();

    let newFileName = document.getElementById("bottom_form_input").value;
    let newFolderPath = document.getElementById("bottom_form_input_folder").value;
    let newFType = document.getElementById("bottom_form_input_ftype").value;
    let newFilePath = newFolderPath + "/" + newFileName;
    if(newFolderPath){
        if (!fs.existsSync(newFilePath)) {
            let el = document.createElement("li");
            let text = document.createTextNode(newFileName);
            if (newFType === "file") {
                // Handle files 
                // Handle Click
                fs.closeSync(fs.openSync(newFilePath, 'w'));
                el.appendChild(text)
                el.setAttribute("id", newFilePath);
    
                el.addEventListener('click', function (e) { // clicking on sidebar names
                    var check = 0;
                    // if (curObj) curObj.fileData = Buffer(mainContent.value);
                    if (!openFiles[newFilePath]) {
                        console.log(newFilePath, newFileName);
                        openFiles[newFilePath] = new FileObject(newFilePath, newFileName);
                        createtab(newFilePath);
                        // fileNFileObj[name].nodenumber = tabcontainer.childNodes.length - 1;
                        check = 1;
                    }
                    settab(newFilePath);
                    if (check == 1) {
                        mainContent.value = curObj.pieceTable.buffers[0].toString();
                        var lines = mainContent.value.split("\n");
                        incrementrow(lines.length);
                    }
                })
    
            } else if (newFType === "folder") {
                // Handle Folders
                fs.mkdirSync(newFilePath);
                let sp = document.createElement("span");
                sp.className = "caret";
                sp.addEventListener("click", function() {
                    // console.log("CLICK", this, this.nextSibling);
                    this.parentElement.querySelector(".nested").classList.toggle("active-tree");
                    this.classList.toggle("caret-down");
                    // console.log(this.nextSibling);
                    this.nextSibling.style.paddingLeft = "20px";
                  });
                sp.append(text);
                el.className = "folder";
                el.appendChild(sp);
                let ulist = document.createElement("ul");
                ulist.setAttribute("id", newFilePath + "ul");
                ulist.className = "nested";
                el.appendChild(ulist);
                el.setAttribute("id", newFilePath);
                addContextMenu(sp);
            }
                document.getElementById(newFolderPath + "ul").appendChild(el);
            
    
            hideTextInputForm();
            }
    }
    else if(newFType === "file") {
        let savePath = dialog.showSaveDialogSync({defaultPath: 'allfiles/' + newFileName});
        fs.closeSync(fs.openSync(savePath, 'w'));
        // console.log(savePath, newFileName);
    }
    
    });



