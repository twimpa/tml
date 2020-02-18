// Core Class

class DataSet {
  constructor(data=undefined,shape=[],dtype='float32') {
    this.data = data;
    this.dtype = dtype;
    this._shape = shape;
    this.strides = (shape.length === 0 ) ? [] : this.calcStrides(shape);
    this.queue = [];
  }
  
  get rank() {
    return this._shape.length;
  }
  
  get shape() {
    return (this._shape === undefined) ? calcDimensions(this.data)[0] : this._shape;
  }
  
  isScalar() {
    return (shape.length ===1 && shape[0] === 1)
  }
  
  reshape(new_shape) {
    this._shape = new_shape;
    this._strides = this.calcStrides(new_shape);
    return this;
  }
  
  fill(value,dtype='float32') {
    console.log(this.shape);
    let num = this.shape.reduce( (siz,v) => siz * v, 1);
    this.data = new Array(num).fill(value);
    return this;
  }
  
  add(b) {
    return this.op(b,(v,i) => v + b[i]);
  }
  
  subtract() {
  
  }
  
  mul() {
  
  }
  
  div() {
  
  }
  
  op(b,func) {
    // Put function in the queue
    // Apply func to all elements
    this.data.map(func); 
  }
  
  matmul() {
  
  }
  
  dot() {
  
  }
  
  /**
   * Sum of all the elements or projection along one axis
   */
  sum(axis = undefined) {
  
    // Index to ZYX..- coordinates
    const i2coord = (index,the_shape,strides) => strides.map( (v,i) => Math.floor(index / v) % the_shape[i]);
    
    // ZYX..- coordinates to Index
    const coord2i = (coords,the_shape,strides) => coords.reduce( (accu,v,i) => accu + v * strides[i],0);
    
    if (axis !== undefined) {
      // TODO
      let proj = new DataSet([], this.shape.filter( (_,i) => i !== axis) );

      console.log('seize',sh,strides);
      // Fill `sums`
      proj.data = this.data.reduce( (accu,v,i) => {
        // Extract coordinates in the order ..., W, Z, Y, X 
        let coords = i2coord(i,this.shape,this.strides);
        let target = coord2i( coords.filter( (v,i) => i !== axis), proj.shape,proj.strides );
        console.log(`${i}: ${coords}/ target[${target}] += ${v}`);
        accu[target] += v;
        return accu;
      },this.zeros(size) );
      return proj;
    }
    // else return a number...
    return tu.scalar(this.data.reduce( (accu,v) => accu + v,0.0) );
  }

  /**
   * Print in console
   */
  print(verbose=false) {

    const printRow = (data) =>  data.join(' , ');
    
    // Step #1: Run `compose` with transducers?
    // TODO
    
    // Step #2: Print
    if (this.isScalar() ) {
      return this.data[0];
    }
    else {
      let header = '';
      if (verbose) {
        header = `  dtype: ${this.dtype}\n  rank: ${this.rank}\n  shape: ${JSON.stringify(this.shape)}\n  stride: ${JSON.stringify(this.strides)}\n  values:`;
      }
      let prefix = '    ';
      let that = this;
      let len = this.shape[this.shape.length - 1];
      let numRows = this.data.length / len;
      let msg = Array.from({length: numRows}, (_,i) => i).reduce( (str,i) => {
        let brktOpen = this.strides.slice(0,-1).filter( (v) => i*len % v === 0);
        let brktClose = this.strides.slice(0,-2).filter( (v) => (i+1) * len % v === 0);
        let row = printRow(that.data.slice(len * i,len * (i+1)));
        return str + `${(i!==0) ? prefix + ' ': ''}${brktOpen ? '['.repeat(brktOpen.length) : ''}${row}]${brktClose ? ']'.repeat(brktClose.length) : ''},\n`;
      },'');

      return `Dataset\n${header}\n${prefix}[${msg.slice(0,-2)}]`;
    }
  }
  

  /*
   * @private
   */
  calcDimensions() {
    this._shape = tu.shape(this.data);
    this.strides = this.calcStrides(this._shape);
    return [this._shape,this.strides];
  }
  
  calcStrides(a_shape) {
    console.log(a_shape);
    return a_shape.reduce( (accu,v,i) => {
        accu[i] *= v; 
        return accu;
      },
      [1,...a_shape,1]
    )
    .slice(2);

  }
  
  fillWith(len,data) {
    Array.from({length: len}, (v,i) => data);
  }
  
} // End of class DataSet
