function handleFolderSideBar(fullFolderPath, folderName, parentUL) {
    let el = document.createElement("li");
    let text = document.createTextNode(folderName);
    let sp = document.createElement("span");
    sp.className = "caret";
    sp.addEventListener("click", function () {
        // console.log("CLICK", this, this.nextSibling);
        this.parentElement.querySelector(".nested").classList.toggle("active-tree");
        this.classList.toggle("caret-down");
        // console.log(this.nextSibling);
        this.nextSibling.style.paddingLeft = "15px";
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
            // console.log(fullFilePath, fileName);
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

module.exports = {
    handleFolderSideBar: handleFolderSideBar,
    handleFileSideBar: handleFileSideBar,
}