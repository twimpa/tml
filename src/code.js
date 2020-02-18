'use strict';

// Helper Functions
const scalar = (value) => {
  return new DataSet([value],[1]);
};

const data = (values) => {
  // Get shape from values
  let sh = tu.shape(values);
  return new DataSet(values.flat(sh.length),sh);
};

const data1d = (values) => {
  return new Data1D(values,[values.length]);
}

const data2d = (values,shape) => {
  return new DataSet(values,shape);
}

const data3d = (values,shape) => {
  return new DataSet(values,shape);
}

const data4d = (values,shape) => {
  return new DataSet(values,shape);
}

const zeros = (shape,dtype='float32') => {
  console.log('tu.zeros');
  let sh = (Array.isArray(shape)) ? shape : [shape];
  console.log(sh);
  return new DataSet([],sh).fill(0.0,dtype);
}

const ones = (shape,dtype='float32') => {
  let sh = (Array.isArray(shape)) ? shape : [shape];
  return new DataSet([],sh).fill(1.0,dtype);
}

const range = (start, stop, step=1, dtype='float32') => {
  let values = Array.from( {length: Math.floor( (stop - start + 1) / step) }, (_,i) => i * step);
  return new DataSet(values,[values.length]);
}

const shape = (arr) => {
  let accu = [arr.length];
  let a = arr[0];
  while (Array.isArray(a)) {
    accu.push(a.length);
    a = a[0];
  }
  return accu;
}

// Export-like
const tu = {
  scalar: scalar,
  data: data,
  data1d: data1d,
  data2d: data2d,
  data3d: data3d,
  data4d: data4d,
  zeros: zeros,
  ones: ones,
  range:range,
  shape:shape
};

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


class Data1D extends DataSet {

}

//////////// 
/*
const fillWith = (len,data) => Array.from({length: len}, (v,i) => data);

const fillAllWith = (...args) => {
  // Split args
  let value = args[args.length - 1];
  let lengths = args.slice(0,args.length - 1);
  return lengths.reduceRight( (accu,len) => fillWith(len,accu),value);
}

const zeros = (...lengths) => fillAllWith(...lengths,0.0);

const ones = (...lengths) => fillAllWith(...lengths,1.0);

const shape = (arr) => {
  let accu = [arr.length];
  let a = arr[0];
  while (Array.isArray(a)) {
    accu.push(a.length);
    a = a[0];
  }
  return accu;
}

const rank = (arr) => shape(arr).length;

const flat = (arr) => arr.flat(shape(arr).length);
*/

/**
 * Sum of all the elements or projection along one axis
 */
const sum = (arr,axis = undefined) => {
  
  const shifts = (the_shape) => the_shape.reduce( (accu,v,i) => {
        accu[i] *= v; 
        return accu;
      },
      [1,...the_shape,1]
    )
    .slice(2);
  
  // Index to ZYX..- coordinates
  const icoord = (index,the_shape,strides) => strides.map( (v,i) => Math.floor(index / v) % the_shape[i]);
  
  // ZYX..- coordinates to Index
  const coord = (coords,the_shape,strides) => coords.reduce( (accu,v,i) => accu + v * strides[i],0);
  
  if (axis !== undefined) {
    // TODO
    let s = {shp: shape(arr), shf : shifts(arr)};
    let proj = {shp: s.shp.filter ( (_,i) => i !== axis), shf: []};
    let sh = shape(arr);
    let strides = shifts(sh);
    let new_dim = sh.filter ( (_,i) => i !== axis);
    let size = new_dim.reduce( (accu,v) => accu * v, 1.0);

    console.log('seize',sh,strides);
    // Fill `sums`
    let flatsums = flat(arr).reduce( (accu,v,i) => {
      // Extract coordinates in the order ..., W, Z, Y, X 
      let coords = icoord(i,sh,strides);
      let target = coord( coords.filter( (v,i) => i !== axis), sh,shifts(new_dim));
      console.log(`${i}: ${coords}/ target[${target}] += ${v}`);
      accu[target] += v;
      return accu;
    },zeros(size) );
    return flatsums;
  }
  // else
  return flat(arr).reduce( (accu,v) => accu + v,0.0);
}


/////// MAIN ///////

let zz = tu.zeros(10).reshape([5,2]);
console.log(zz.print());

console.log(tu.range(0,11,2).reshape([3,2]).print());

/*
let z = zeros(2,3);

console.log('result',z);
console.log('sum',sum([1,2,3]));
*/


console.log('shape',tu.data(arr).print(true));
console.log('shape',shape(arr));


// let arrFlat = arr.flat(2);
// console.log(arrFlat);
// console.log( arrFlat[0] +  arrFlat[0 + w*h] +  arrFlat[0 + 2*w*h]);
result = sum(arr,0);
console.log(result)
result = sum(arr,1);
console.log(result)
result = sum(arr,2);
console.log(result)
console.log(arr[0][0][0] + arr[1][0][0] + arr[2][0][0] );
console.log(arr[0][0][0] + arr[0][1][0] + arr[0][2][0] );
console.log(arr[0][0][0] + arr[0][0][1]  );

let idx = 10;
console.log(idx % 2,Math.floor(idx / 2) % 3,Math.floor(idx / (2*3)) );

