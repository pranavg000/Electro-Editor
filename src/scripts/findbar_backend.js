function focustxtforfind(pattern) {
    if (reqarray.length > 0) {
        mainContent.select();
        mainContent.scrollTo(Math.max(0, reqarray[searchidx] - 50), Math.max(0, reqarray[searchidx] - 50));
        mainContent.setSelectionRange(reqarray[searchidx], reqarray[searchidx] + pattern.length);
        searchidx = (searchidx + 1) % reqarray.length;
    }
    document.getElementById("findbar-text").innerHTML = (searchidx) + "/" + reqarray.length;
}

function resetfindbartxt() {
    issearchtextchanged = 1;
    reqarray = [];
    searchidx = 0;
    document.getElementById("findbar-text").innerHTML = "No Results";

}
document.getElementById("searchbar").addEventListener('input', function def(e) {
    resetfindbartxt();
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
            textchanged("delete", reqarray[i], pattern.length);
            textchanged("insert", reqarray[i], replacetxt.length, replacetxt);
            mainContent.setRangeText(replacetxt, reqarray[i], reqarray[i] + pattern.length);
            off = off + replacetxt.length - pattern.length;
        }
        resetfindbartxt();
    }
}

function findbarsearch() {
    let pattern = document.getElementById("searchbar").value;
    if (issearchtextchanged == 1) {
        reqarray = findtext(pattern);
        console.log(reqarray);
        searchidx = 0;
        issearchtextchanged = 0;
    }
    focustxtforfind(pattern);
    // mainContent.blur();

}

module.exports = {
    replace_all: replace_all,
    findbarsearch: findbarsearch
}