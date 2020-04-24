const remote = require('electron').remote
const { dialog, MenuItem, Menu } = remote;
const win = remote.getCurrentWindow();

var rightClickTarget = null;


const ctxMenu = new Menu();
ctxMenu.append(new MenuItem({
    label: 'New File',
    click: () => {
        displayTextInputForm("file", rightClickTarget.id);
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

function saveDialog(newFileName){
    return dialog.showSaveDialogSync({ defaultPath: 'allfiles/' + newFileName });
}


module.exports = {
    addContextMenu: addContextMenu,
    saveDialog: saveDialog,
}