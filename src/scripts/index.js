const remote = require('electron').remote
const { dialog, MenuItem, Menu } = remote;
const ipcRenderer = require('electron').ipcRenderer;
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
var issearchtextchanged = 1;
var searchidx = 0;
var reqarray = [];
// var test = require((path.resolve(__dirname, 'scripts/test.js'))).testfunc;

const utilities = require((path.resolve(__dirname, 'scripts/utilities.js')));
var addpiece = utilities.addpiece;
var incrementrow = utilities.incrementrow;
var decrementrow = utilities.decrementrow;
var textchanged = utilities.textchanged;
var makeunsaved = utilities.makeunsaved;
var saveFileObject = utilities.saveFileObject;
var setCurText = utilities.setCurText;

const findtext = require((path.resolve(__dirname, 'scripts/kmp.js'))).findtext;

const listeners = require((path.resolve(__dirname, 'scripts/listeners.js')));

const findbar_backend = require((path.resolve(__dirname, 'scripts/findbar_backend.js')));
var replace_all = findbar_backend.replace_all;
var findbarsearch = findbar_backend.findbarsearch;

const tabs = require((path.resolve(__dirname, 'scripts/tabs.js')));
var deleteTabSafe = tabs.deleteTabSafe;
var createtab = tabs.createtab;
var settab = tabs.settab;
var deletetab = tabs.deletetab;

const backup_logic = require((path.resolve(__dirname, 'scripts/backup_logic.js')));
var backupOnClose = backup_logic.backupOnClose;
var loadBackup = backup_logic.loadBackup;
var setbackupdata = backup_logic.setbackupdata;

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
function addContextMenu(folderEl) {
    folderEl.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        rightClickTarget = ev.target.parentElement;
        ctxMenu.popup(win);
    }, false);

}

function walkSync(currentDirPath, folderEl) {
    fs.readdirSync(currentDirPath).forEach(function (fileName) {
        var filePath = currentDirPath + "/" + fileName;
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            handleFileSideBar(filePath, fileName, folderEl);
        } else if (stat.isDirectory()) {
            walkSync(filePath, handleFolderSideBar(filePath, fileName, folderEl));
        }

    });
}
function displayFolder(folderPath) {
    walkSync(folderPath, handleFolderSideBar(folderPath, folderPath.replace(/^.*[\\\/]/, ''), document.getElementById('titles')));
}
displayFolder('allfiles'); // TODO : Open any folder


ipcRenderer.on('SAVE_NEEDED', function (event, arg) {
    saveFileObject(curObj);
});


ipcRenderer.on('UNDO_NEEDED', function (event, arg) {
    if (curObj) {
        addpiece();
        curObj.pieceTable.applyUndo();
        setCurText();
    }
});

ipcRenderer.on('REDO_NEEDED', function (event, arg) {
    if (curObj) {
        addpiece();
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


function hide() {
    document.getElementById("findbar").style.display = "none";
    document.getElementById("searchbar").value = "";
    document.getElementById("replacebar").style.display = "none";
    document.getElementById("replacesearchbar").value = "";
    document.getElementById("findbar-text").innerHTML = "No Results";
}



loadBackup();


window.onbeforeunload = (e) => {
    backupOnClose();
    console.log("Back up complete");
}

let textInputFormDiv = document.getElementsByClassName('bottom_footer')[0];

function displayTextInputForm(ftype, folder = "") {
    console.log(ftype, folder);

    if (textInputFormDiv.style.display === "none") {
        document.getElementById('bottom_form_input_folder').value = folder;
        document.getElementById('bottom_form_input_ftype').value = ftype;
        textInputFormDiv.style.display = "block";
    }
}

function hideTextInputForm() {
    if (textInputFormDiv.style.display === "block") {
        document.getElementById("bottom_form_input").value = "";
        textInputFormDiv.style.display = "none";
    }
}

ipcRenderer.on('NEW_FILE_NEEDED', function (event, arg) {
    displayTextInputForm("file");
})


function getFolderPath(fullFilePath) {
    console.log(fullFilePath);
    for (let i = fullFilePath.length - 1; i >= 0; i--) {
        if (fullFilePath[i] === '/') {
            return fullFilePath.slice(0, i);
        }
    }
}


let textInputForm = document.getElementById('bottom_footer_form');
textInputForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let newFileName = document.getElementById("bottom_form_input").value;
    let newFolderPath = document.getElementById("bottom_form_input_folder").value;
    let newFType = document.getElementById("bottom_form_input_ftype").value;
    let newFilePath = newFolderPath + "/" + newFileName;
    if (newFolderPath) {
        if (!fs.existsSync(newFilePath)) {
            if (newFType === "file") {
                fs.closeSync(fs.openSync(newFilePath, 'w'));
                handleFileSideBar(newFilePath, newFileName, document.getElementById(newFolderPath + "ul"));
            }
            else if (newFType === "folder") {
                fs.mkdirSync(newFilePath);
                handleFolderSideBar(newFilePath, newFileName, document.getElementById(newFolderPath + "ul"));
            }
        }
    }
    else if (newFType === "file") {
        let newFilePath = dialog.showSaveDialogSync({ defaultPath: 'allfiles/' + newFileName });
        newFilePath = newFilePath.replace(/\\/g, "/");
        fs.closeSync(fs.openSync(newFilePath, 'w'));
        console.log(newFilePath);
        handleFileSideBar(newFilePath, newFileName, document.getElementById(getFolderPath(newFilePath) + "ul"));
    }
    hideTextInputForm();

});

function handleFolderSideBar(fullFolderPath, folderName, parentUL) {
    let el = document.createElement("li");
    let text = document.createTextNode(folderName);
    let sp = document.createElement("span");
    sp.className = "caret";
    sp.addEventListener("click", function () {
        console.log("CLICK", this, this.nextSibling);
        this.parentElement.querySelector(".nested").classList.toggle("active-tree");
        this.classList.toggle("caret-down");
        // console.log(this.nextSibling);
        this.nextSibling.style.paddingLeft = "20px";
    });
    sp.append(text);
    el.className = "folder";
    el.appendChild(sp);
    var ulist = document.createElement("ul");
    ulist.setAttribute("id", fullFolderPath + "ul");
    ulist.className = "nested";
    el.appendChild(ulist);
    el.setAttribute("id", fullFolderPath);
    addContextMenu(sp);
    parentUL.appendChild(el);
    return ulist;
}

function handleFileSideBar(fullFilePath, fileName, parentUL) {
    let el = document.createElement("li");
    let text = document.createTextNode(fileName);
    el.appendChild(text)
    el.setAttribute("id", fullFilePath);

    el.addEventListener('click', function (e) { // clicking on sidebar names
        var check = 0;
        // if (curObj) curObj.fileData = Buffer(mainContent.value);
        if (!openFiles[fullFilePath]) {
            console.log(fullFilePath, fileName);
            openFiles[fullFilePath] = new FileObject(fullFilePath, fileName);
            createtab(fullFilePath);
            // fileNFileObj[name].nodenumber = tabcontainer.childNodes.length - 1;
            check = 1;
        }
        settab(fullFilePath);
        if (check == 1) {
            mainContent.value = curObj.pieceTable.buffers[0].toString();
            var lines = mainContent.value.split("\n");
            incrementrow(lines.length);
        }
    })
    parentUL.appendChild(el);

}



