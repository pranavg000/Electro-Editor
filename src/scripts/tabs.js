const { dialog } = require('electron').remote;

var listeners_list = ['keyup', 'keydown', 'cut', 'paste', 'input', 'click', 'scroll'];
var deletePromptOptions = {
    type: "warning",
    buttons: ["Yes", "No", "Cancel"],
    message: "Do you want to Save the changes you made?",
    detail: "Your changes will be lost if you don't save them."
}

var saveButChangedOptions = {
    type: "warning",
    buttons: ["Keep changes", "Reload"],
    message: "There exists a newer version of this file on Disk",
    detail: "Do you want to keep your changes or Reload from disk?"
}

function createlistners() {
    listeners_list.map(function app(e) {
        mainContent.addEventListener(e, listeners[e]);
    });
}
function removelistners() {
    listeners_list.map(function app(e) {
        mainContent.removeEventListener(e, listeners[e]);
    });
}


function deleteTabSafe(fileKey) {
    let filetitle = openFiles[fileKey].fileName;
    if (filetitle[filetitle.length - 1] === "*") filetitle = filetitle.slice(0, filetitle.length - 1);
    if (openFiles[fileKey].isSaved) {
        deletetab(fileKey);

    }
    else {
        deletePromptOptions.message = "Do you want to Save the changes you made to " + filetitle + "?";
        dialog.showMessageBox(win, deletePromptOptions).then(response => {
            response = response.response;

            if (response === 0) {
                saveFileObject(openFiles[fileKey]);
            }
            else if (response === 2) {
                return;
            }
            var titleofcurobj = document.getElementById(fileKey);
            titleofcurobj.innerHTML = filetitle;
            deletetab(fileKey)
        })
    }

}

function deletetab(fileKey) {
    fs.unwatchFile(fileKey);
    hide();
    if (curObj.fullFilePath == fileKey) {
        fixed = false;
        for (let key in openFiles) {
            if (key != fileKey) {
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

function reloadFile(fileKey){
    makesaved(openFiles[fileKey]);
    openFiles[fileKey].reloadContent();
    // let tempObj = new FileObject(fileKey, fileKey.replace(/^.*[\\\/]/, ''));
    // openFiles[fileKey] = tempObj;

    // if(curObj.fullFilePath.toString() === fileKey) curObj = openFiles[fileKey];
    setCurText(openFiles[fileKey]);
    // console.log(openFiles)
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
        //checkChanged()
        document.getElementById(fileKey + "tabcontent").style.display = "inline-block";
        document.getElementById(fileKey + "button").className += " active";
        createlistners();
    }
}

function createtab(fileKey, isSaved = true) {

    fs.watchFile(fileKey, (cur, prev) => {
        if(!openFiles[fileKey].isChangedRecently){
            if(openFiles[fileKey].isSaved) reloadFile(fileKey);
            else{
                dialog.showMessageBox(win, saveButChangedOptions).then(response => {
                    response = response.response;
                    if (response === 1) {
                        reloadFile(fileKey);
                        makesaved(openFiles[fileKey]);
                    }
                })
            }
        }
        else openFiles[fileKey].isChangedRecently = false;
    })

    let filetitle = openFiles[fileKey].fileName;
    container.insertAdjacentHTML("beforeend", '<div id="' + fileKey + 'tabcontent" class="tabcontent"><div id="' + fileKey + 'rowcnt" class="rowcnt" readonly></div><textarea id="' + fileKey + 'textarea" class="content"> </textarea></div>');
    if (isSaved)
        tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + fileKey + 'button" class="tablinks" onclick=settab("' + fileKey + '")>' + filetitle + '<span class="cross-button" onclick=deleteTabSafe("' + fileKey + '") style="float:right;">&#10005;</span>' + '</button>');
    else
        tabcontainer.insertAdjacentHTML("beforeend", '<button id="' + fileKey + 'button" class="tablinks" onclick=settab("' + fileKey + '")>' + filetitle + "*" + '<span class="cross-button" onclick=deleteTabSafe("' + fileKey + '") style="float:right;">&#10005;</span>' + '</button>');


}

module.exports = {
    deleteTabSafe: deleteTabSafe,
    createtab: createtab,
    settab: settab,
    deletetab: deletetab

}




    // mainContent.addEventListener('keyup', listeners.keyup);

    // mainContent.addEventListener('keydown', listeners.keydown);

    // mainContent.addEventListener('input', listeners.input);

    // mainContent.addEventListener('scroll', listeners.scroll);

    // mainContent.addEventListener('click', listeners.click);

    // mainContent.addEventListener('paste', listeners.paste);

    // mainContent.addEventListener('cut', listeners.cut);