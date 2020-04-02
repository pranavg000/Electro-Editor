class BufferT {
    constructor(string){
        this.value = string;
        this.lineStarts = this.computeLineStarts();
    }

    computeLineStarts(){
        for(let i = 0 ; i < this.value.length ; i++){
            if(this.value[i]=='\n' && i<this.value.length ) arr.push(i);
        }
        return arr
    }

    countNewLines(l, r){
        return this.countNewLines(r) - this.countNewLines(l-1);
    }

    countNewLines(n){
        if(n<0) return 0;
        let l=0, r=this.lineStarts.length-1,mid,ans=0;
        while(l<=r){
            mid = (l+r)/2;
            if(this.lineStarts[mid] <= n){
                ans=mid+1;
                l=mid+1;
            }
            else r=mid-1;
        }
        return ans;
    }

    getIndexOfNewLine(start, count){
        let nllb = this.countNewLines(start-1);
        if(count+nllb===0) return -1;
        return this.lineStarts[count+nllb-1];
    }

}