const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer;
const win = remote.getCurrentWindow();
var rowcnt;
var openFiles = {};
var mainContent;
var curObj = null;
var container = document.getElementById("container");
var tabcontainer = document.getElementById("tabcontainer");

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

const remoteUtil = require((path.resolve(__dirname, 'scripts/remoteUtils.js')));
var addContextMenu = remoteUtil.addContextMenu;
var saveDialog = remoteUtil.saveDialog;

const sidebar = require((path.resolve(__dirname, 'scripts/sidebar.js')));
var handleFolderSideBar = sidebar.handleFolderSideBar;
var handleFileSideBar = sidebar.handleFileSideBar;


function walkSync(currentDirPath, folderEl) {
    fs.readdirSync(currentDirPath).forEach(function (fileName) {
        var filePath = currentDirPath + "/" + fileName;
        var stat = fs.statSync(filePath);
        // console.log(stat, filePath);
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
displayFolder('C:/Users/PRANAV/Documents/electron_tuts/textEditor/allfiles'); // TODO : Open any folder


ipcRenderer.on('SAVE_NEEDED', function (event, arg) {
    saveFileObject(curObj);
});


ipcRenderer.on('UNDO_NEEDED', function (event, arg) {
    if (curObj) {
        addpiece();
        curObj.pieceTable.applyUndo();
        setCurText(curObj);
        makeunsaved();

    }
});

ipcRenderer.on('REDO_NEEDED', function (event, arg) {
    if (curObj) {
        addpiece();
        curObj.pieceTable.applyRedo();
        setCurText(curObj);
        makeunsaved();

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
        let newFilePath = saveDialog(newFileName);
        newFilePath = newFilePath.replace(/\\/g, "/");
        fs.closeSync(fs.openSync(newFilePath, 'w'));
        console.log(newFilePath);
        handleFileSideBar(newFilePath, newFileName, document.getElementById(getFolderPath(newFilePath) + "ul"));
    }
    hideTextInputForm();

});





