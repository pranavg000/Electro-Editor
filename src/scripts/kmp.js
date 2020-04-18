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

module.exports = {
    findtext: findtext
}