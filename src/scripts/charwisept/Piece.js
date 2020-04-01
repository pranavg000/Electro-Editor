class Piece {
    constructor(bufferIndex, start, end, prev=null, next=null){
        this.bufferIndex = bufferIndex;
        this.start = start;
        this.end = end;
        this.prev = prev;
        this.next = next;
    }

}

class PieceRange {
    constructor(first=null, last=null, pieceRangeType=0){
        this.first = first;
        this.last = last;
        this.pieceRangeType = pieceRangeType;

    }
}


// class UndoStack{
//     constructor(historyLength){
//         this.historyLength = historyLength;
//         this.stack = new Array();
//     }

//     pop(){
//         if(!this.stack.length) return false;

//     }

//     push(pieceRange){
//         stack.push(pieceRange);
//     }
// }