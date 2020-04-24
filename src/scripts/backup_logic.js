function backupOnClose() {
    for (const key in openFiles) {
        if (!openFiles[key].isSaved)
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
                    if (value)
                        openFiles[key] = new FileObject(null, null, value);//Object.assign(new FileObject, fileNFileObj[key]);
                    else {
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

    for (var key in openFiles) {

        let obj = openFiles[key];
        let title = obj.fileName;
        createtab(key, obj.isSaved);
        // obj.nodenumber = tabcontainer.childNodes.length - 1;
        settab(key);
        if (!obj.isSaved) {
            document.getElementById(curObj.fullFilePath.toString()).innerHTML = title + "*";

        }
        mainContent.value = curObj.pieceTable.buffers[0].toString();
        var lines = mainContent.value.split("\n");
        incrementrow(lines.length);
    }
}

module.exports = {
    loadBackup: loadBackup,
    setbackupdata: setbackupdata,
    backupOnClose: backupOnClose
}