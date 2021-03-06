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
    constructor(first=null, last=null){
        this.first = first;
        this.last = last;
    }
}

module.exports = {
    PieceRange : PieceRange,
    Piece : Piece
  }
