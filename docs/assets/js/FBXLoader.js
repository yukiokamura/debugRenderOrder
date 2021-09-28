(self["webpackChunkgulp"] = self["webpackChunkgulp"] || []).push([["FBXLoader"],{

/***/ "./node_modules/three/examples/jsm/curves/NURBSCurve.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/curves/NURBSCurve.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NURBSCurve": () => (/* binding */ NURBSCurve)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var _curves_NURBSUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../curves/NURBSUtils.js */ "./node_modules/three/examples/jsm/curves/NURBSUtils.js");



/**
 * NURBS curve object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/

class NURBSCurve extends three__WEBPACK_IMPORTED_MODULE_1__.Curve {

	constructor(
		degree,
		knots /* array of reals */,
		controlPoints /* array of Vector(2|3|4) */,
		startKnot /* index in knots */,
		endKnot /* index in knots */
	) {

		super();

		this.degree = degree;
		this.knots = knots;
		this.controlPoints = [];
		// Used by periodic NURBS to remove hidden spans
		this.startKnot = startKnot || 0;
		this.endKnot = endKnot || ( this.knots.length - 1 );

		for ( let i = 0; i < controlPoints.length; ++ i ) {

			// ensure Vector4 for control points
			const point = controlPoints[ i ];
			this.controlPoints[ i ] = new three__WEBPACK_IMPORTED_MODULE_1__.Vector4( point.x, point.y, point.z, point.w );

		}

	}

	getPoint( t, optionalTarget = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3() ) {

		const point = optionalTarget;

		const u = this.knots[ this.startKnot ] + t * ( this.knots[ this.endKnot ] - this.knots[ this.startKnot ] ); // linear mapping t->u

		// following results in (wx, wy, wz, w) homogeneous point
		const hpoint = _curves_NURBSUtils_js__WEBPACK_IMPORTED_MODULE_0__.calcBSplinePoint( this.degree, this.knots, this.controlPoints, u );

		if ( hpoint.w !== 1.0 ) {

			// project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
			hpoint.divideScalar( hpoint.w );

		}

		return point.set( hpoint.x, hpoint.y, hpoint.z );

	}

	getTangent( t, optionalTarget = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3() ) {

		const tangent = optionalTarget;

		const u = this.knots[ 0 ] + t * ( this.knots[ this.knots.length - 1 ] - this.knots[ 0 ] );
		const ders = _curves_NURBSUtils_js__WEBPACK_IMPORTED_MODULE_0__.calcNURBSDerivatives( this.degree, this.knots, this.controlPoints, u, 1 );
		tangent.copy( ders[ 1 ] ).normalize();

		return tangent;

	}

}




/***/ }),

/***/ "./node_modules/three/examples/jsm/curves/NURBSUtils.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/curves/NURBSUtils.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "findSpan": () => (/* binding */ findSpan),
/* harmony export */   "calcBasisFunctions": () => (/* binding */ calcBasisFunctions),
/* harmony export */   "calcBSplinePoint": () => (/* binding */ calcBSplinePoint),
/* harmony export */   "calcBasisFunctionDerivatives": () => (/* binding */ calcBasisFunctionDerivatives),
/* harmony export */   "calcBSplineDerivatives": () => (/* binding */ calcBSplineDerivatives),
/* harmony export */   "calcKoverI": () => (/* binding */ calcKoverI),
/* harmony export */   "calcRationalCurveDerivatives": () => (/* binding */ calcRationalCurveDerivatives),
/* harmony export */   "calcNURBSDerivatives": () => (/* binding */ calcNURBSDerivatives),
/* harmony export */   "calcSurfacePoint": () => (/* binding */ calcSurfacePoint)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");


/**
 * NURBS utils
 *
 * See NURBSCurve and NURBSSurface.
 **/


/**************************************************************
 *	NURBS Utils
 **************************************************************/

/*
Finds knot vector span.

p : degree
u : parametric value
U : knot vector

returns the span
*/
function findSpan( p, u, U ) {

	const n = U.length - p - 1;

	if ( u >= U[ n ] ) {

		return n - 1;

	}

	if ( u <= U[ p ] ) {

		return p;

	}

	let low = p;
	let high = n;
	let mid = Math.floor( ( low + high ) / 2 );

	while ( u < U[ mid ] || u >= U[ mid + 1 ] ) {

		if ( u < U[ mid ] ) {

			high = mid;

		} else {

			low = mid;

		}

		mid = Math.floor( ( low + high ) / 2 );

	}

	return mid;

}


/*
Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2

span : span in which u lies
u    : parametric point
p    : degree
U    : knot vector

returns array[p+1] with basis functions values.
*/
function calcBasisFunctions( span, u, p, U ) {

	const N = [];
	const left = [];
	const right = [];
	N[ 0 ] = 1.0;

	for ( let j = 1; j <= p; ++ j ) {

		left[ j ] = u - U[ span + 1 - j ];
		right[ j ] = U[ span + j ] - u;

		let saved = 0.0;

		for ( let r = 0; r < j; ++ r ) {

			const rv = right[ r + 1 ];
			const lv = left[ j - r ];
			const temp = N[ r ] / ( rv + lv );
			N[ r ] = saved + rv * temp;
			saved = lv * temp;

		}

		N[ j ] = saved;

	}

	return N;

}


/*
Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.

p : degree of B-Spline
U : knot vector
P : control points (x, y, z, w)
u : parametric point

returns point for given u
*/
function calcBSplinePoint( p, U, P, u ) {

	const span = findSpan( p, u, U );
	const N = calcBasisFunctions( span, u, p, U );
	const C = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );

	for ( let j = 0; j <= p; ++ j ) {

		const point = P[ span - p + j ];
		const Nj = N[ j ];
		const wNj = point.w * Nj;
		C.x += point.x * wNj;
		C.y += point.y * wNj;
		C.z += point.z * wNj;
		C.w += point.w * Nj;

	}

	return C;

}


/*
Calculate basis functions derivatives. See The NURBS Book, page 72, algorithm A2.3.

span : span in which u lies
u    : parametric point
p    : degree
n    : number of derivatives to calculate
U    : knot vector

returns array[n+1][p+1] with basis functions derivatives
*/
function calcBasisFunctionDerivatives( span, u, p, n, U ) {

	const zeroArr = [];
	for ( let i = 0; i <= p; ++ i )
		zeroArr[ i ] = 0.0;

	const ders = [];

	for ( let i = 0; i <= n; ++ i )
		ders[ i ] = zeroArr.slice( 0 );

	const ndu = [];

	for ( let i = 0; i <= p; ++ i )
		ndu[ i ] = zeroArr.slice( 0 );

	ndu[ 0 ][ 0 ] = 1.0;

	const left = zeroArr.slice( 0 );
	const right = zeroArr.slice( 0 );

	for ( let j = 1; j <= p; ++ j ) {

		left[ j ] = u - U[ span + 1 - j ];
		right[ j ] = U[ span + j ] - u;

		let saved = 0.0;

		for ( let r = 0; r < j; ++ r ) {

			const rv = right[ r + 1 ];
			const lv = left[ j - r ];
			ndu[ j ][ r ] = rv + lv;

			const temp = ndu[ r ][ j - 1 ] / ndu[ j ][ r ];
			ndu[ r ][ j ] = saved + rv * temp;
			saved = lv * temp;

		}

		ndu[ j ][ j ] = saved;

	}

	for ( let j = 0; j <= p; ++ j ) {

		ders[ 0 ][ j ] = ndu[ j ][ p ];

	}

	for ( let r = 0; r <= p; ++ r ) {

		let s1 = 0;
		let s2 = 1;

		const a = [];
		for ( let i = 0; i <= p; ++ i ) {

			a[ i ] = zeroArr.slice( 0 );

		}

		a[ 0 ][ 0 ] = 1.0;

		for ( let k = 1; k <= n; ++ k ) {

			let d = 0.0;
			const rk = r - k;
			const pk = p - k;

			if ( r >= k ) {

				a[ s2 ][ 0 ] = a[ s1 ][ 0 ] / ndu[ pk + 1 ][ rk ];
				d = a[ s2 ][ 0 ] * ndu[ rk ][ pk ];

			}

			const j1 = ( rk >= - 1 ) ? 1 : - rk;
			const j2 = ( r - 1 <= pk ) ? k - 1 : p - r;

			for ( let j = j1; j <= j2; ++ j ) {

				a[ s2 ][ j ] = ( a[ s1 ][ j ] - a[ s1 ][ j - 1 ] ) / ndu[ pk + 1 ][ rk + j ];
				d += a[ s2 ][ j ] * ndu[ rk + j ][ pk ];

			}

			if ( r <= pk ) {

				a[ s2 ][ k ] = - a[ s1 ][ k - 1 ] / ndu[ pk + 1 ][ r ];
				d += a[ s2 ][ k ] * ndu[ r ][ pk ];

			}

			ders[ k ][ r ] = d;

			const j = s1;
			s1 = s2;
			s2 = j;

		}

	}

	let r = p;

	for ( let k = 1; k <= n; ++ k ) {

		for ( let j = 0; j <= p; ++ j ) {

			ders[ k ][ j ] *= r;

		}

		r *= p - k;

	}

	return ders;

}


/*
	Calculate derivatives of a B-Spline. See The NURBS Book, page 93, algorithm A3.2.

	p  : degree
	U  : knot vector
	P  : control points
	u  : Parametric points
	nd : number of derivatives

	returns array[d+1] with derivatives
	*/
function calcBSplineDerivatives( p, U, P, u, nd ) {

	const du = nd < p ? nd : p;
	const CK = [];
	const span = findSpan( p, u, U );
	const nders = calcBasisFunctionDerivatives( span, u, p, du, U );
	const Pw = [];

	for ( let i = 0; i < P.length; ++ i ) {

		const point = P[ i ].clone();
		const w = point.w;

		point.x *= w;
		point.y *= w;
		point.z *= w;

		Pw[ i ] = point;

	}

	for ( let k = 0; k <= du; ++ k ) {

		const point = Pw[ span - p ].clone().multiplyScalar( nders[ k ][ 0 ] );

		for ( let j = 1; j <= p; ++ j ) {

			point.add( Pw[ span - p + j ].clone().multiplyScalar( nders[ k ][ j ] ) );

		}

		CK[ k ] = point;

	}

	for ( let k = du + 1; k <= nd + 1; ++ k ) {

		CK[ k ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0 );

	}

	return CK;

}


/*
Calculate "K over I"

returns k!/(i!(k-i)!)
*/
function calcKoverI( k, i ) {

	let nom = 1;

	for ( let j = 2; j <= k; ++ j ) {

		nom *= j;

	}

	let denom = 1;

	for ( let j = 2; j <= i; ++ j ) {

		denom *= j;

	}

	for ( let j = 2; j <= k - i; ++ j ) {

		denom *= j;

	}

	return nom / denom;

}


/*
Calculate derivatives (0-nd) of rational curve. See The NURBS Book, page 127, algorithm A4.2.

Pders : result of function calcBSplineDerivatives

returns array with derivatives for rational curve.
*/
function calcRationalCurveDerivatives( Pders ) {

	const nd = Pders.length;
	const Aders = [];
	const wders = [];

	for ( let i = 0; i < nd; ++ i ) {

		const point = Pders[ i ];
		Aders[ i ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3( point.x, point.y, point.z );
		wders[ i ] = point.w;

	}

	const CK = [];

	for ( let k = 0; k < nd; ++ k ) {

		const v = Aders[ k ].clone();

		for ( let i = 1; i <= k; ++ i ) {

			v.sub( CK[ k - i ].clone().multiplyScalar( calcKoverI( k, i ) * wders[ i ] ) );

		}

		CK[ k ] = v.divideScalar( wders[ 0 ] );

	}

	return CK;

}


/*
Calculate NURBS curve derivatives. See The NURBS Book, page 127, algorithm A4.2.

p  : degree
U  : knot vector
P  : control points in homogeneous space
u  : parametric points
nd : number of derivatives

returns array with derivatives.
*/
function calcNURBSDerivatives( p, U, P, u, nd ) {

	const Pders = calcBSplineDerivatives( p, U, P, u, nd );
	return calcRationalCurveDerivatives( Pders );

}


/*
Calculate rational B-Spline surface point. See The NURBS Book, page 134, algorithm A4.3.

p1, p2 : degrees of B-Spline surface
U1, U2 : knot vectors
P      : control points (x, y, z, w)
u, v   : parametric values

returns point for given (u, v)
*/
function calcSurfacePoint( p, q, U, V, P, u, v, target ) {

	const uspan = findSpan( p, u, U );
	const vspan = findSpan( q, v, V );
	const Nu = calcBasisFunctions( uspan, u, p, U );
	const Nv = calcBasisFunctions( vspan, v, q, V );
	const temp = [];

	for ( let l = 0; l <= q; ++ l ) {

		temp[ l ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );
		for ( let k = 0; k <= p; ++ k ) {

			const point = P[ uspan - p + k ][ vspan - q + l ].clone();
			const w = point.w;
			point.x *= w;
			point.y *= w;
			point.z *= w;
			temp[ l ].add( point.multiplyScalar( Nu[ k ] ) );

		}

	}

	const Sw = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );
	for ( let l = 0; l <= q; ++ l ) {

		Sw.add( temp[ l ].multiplyScalar( Nv[ l ] ) );

	}

	Sw.divideScalar( Sw.w );
	target.set( Sw.x, Sw.y, Sw.z );

}






/***/ }),

/***/ "./node_modules/three/examples/jsm/libs/fflate.module.js":
/*!***************************************************************!*\
  !*** ./node_modules/three/examples/jsm/libs/fflate.module.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Deflate": () => (/* binding */ Deflate),
/* harmony export */   "AsyncDeflate": () => (/* binding */ AsyncDeflate),
/* harmony export */   "deflate": () => (/* binding */ deflate),
/* harmony export */   "deflateSync": () => (/* binding */ deflateSync),
/* harmony export */   "Inflate": () => (/* binding */ Inflate),
/* harmony export */   "AsyncInflate": () => (/* binding */ AsyncInflate),
/* harmony export */   "inflate": () => (/* binding */ inflate),
/* harmony export */   "inflateSync": () => (/* binding */ inflateSync),
/* harmony export */   "Gzip": () => (/* binding */ Gzip),
/* harmony export */   "AsyncGzip": () => (/* binding */ AsyncGzip),
/* harmony export */   "gzip": () => (/* binding */ gzip),
/* harmony export */   "gzipSync": () => (/* binding */ gzipSync),
/* harmony export */   "Gunzip": () => (/* binding */ Gunzip),
/* harmony export */   "AsyncGunzip": () => (/* binding */ AsyncGunzip),
/* harmony export */   "gunzip": () => (/* binding */ gunzip),
/* harmony export */   "gunzipSync": () => (/* binding */ gunzipSync),
/* harmony export */   "Zlib": () => (/* binding */ Zlib),
/* harmony export */   "AsyncZlib": () => (/* binding */ AsyncZlib),
/* harmony export */   "zlib": () => (/* binding */ zlib),
/* harmony export */   "zlibSync": () => (/* binding */ zlibSync),
/* harmony export */   "Unzlib": () => (/* binding */ Unzlib),
/* harmony export */   "AsyncUnzlib": () => (/* binding */ AsyncUnzlib),
/* harmony export */   "unzlib": () => (/* binding */ unzlib),
/* harmony export */   "unzlibSync": () => (/* binding */ unzlibSync),
/* harmony export */   "compress": () => (/* binding */ gzip),
/* harmony export */   "AsyncCompress": () => (/* binding */ AsyncGzip),
/* harmony export */   "compressSync": () => (/* binding */ gzipSync),
/* harmony export */   "Compress": () => (/* binding */ Gzip),
/* harmony export */   "Decompress": () => (/* binding */ Decompress),
/* harmony export */   "AsyncDecompress": () => (/* binding */ AsyncDecompress),
/* harmony export */   "decompress": () => (/* binding */ decompress),
/* harmony export */   "decompressSync": () => (/* binding */ decompressSync),
/* harmony export */   "DecodeUTF8": () => (/* binding */ DecodeUTF8),
/* harmony export */   "EncodeUTF8": () => (/* binding */ EncodeUTF8),
/* harmony export */   "strToU8": () => (/* binding */ strToU8),
/* harmony export */   "strFromU8": () => (/* binding */ strFromU8),
/* harmony export */   "ZipPassThrough": () => (/* binding */ ZipPassThrough),
/* harmony export */   "ZipDeflate": () => (/* binding */ ZipDeflate),
/* harmony export */   "AsyncZipDeflate": () => (/* binding */ AsyncZipDeflate),
/* harmony export */   "Zip": () => (/* binding */ Zip),
/* harmony export */   "zip": () => (/* binding */ zip),
/* harmony export */   "zipSync": () => (/* binding */ zipSync),
/* harmony export */   "UnzipPassThrough": () => (/* binding */ UnzipPassThrough),
/* harmony export */   "UnzipInflate": () => (/* binding */ UnzipInflate),
/* harmony export */   "AsyncUnzipInflate": () => (/* binding */ AsyncUnzipInflate),
/* harmony export */   "Unzip": () => (/* binding */ Unzip),
/* harmony export */   "unzip": () => (/* binding */ unzip),
/* harmony export */   "unzipSync": () => (/* binding */ unzipSync)
/* harmony export */ });
/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.6.9
*/

// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).
var ch2 = {};
var durl = function (c) { return URL.createObjectURL(new Blob([c], { type: 'text/javascript' })); };
var cwk = function (u) { return new Worker(u); };
try {
    URL.revokeObjectURL(durl(''));
}
catch (e) {
    // We're in Deno or a very old browser
    durl = function (c) { return 'data:application/javascript;charset=UTF-8,' + encodeURI(c); };
    // If Deno, this is necessary; if not, this changes nothing
    cwk = function (u) { return new Worker(u, { type: 'module' }); };
}
var wk = (function (c, id, msg, transfer, cb) {
    var w = cwk(ch2[id] || (ch2[id] = durl(c)));
    w.onerror = function (e) { return cb(e.error, null); };
    w.onmessage = function (e) { return cb(null, e.data); };
    w.postMessage(msg, transfer);
    return w;
});

// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array, u16 = Uint16Array, u32 = Uint32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
// see fleb note
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function (eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new u32(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return [b, r];
};
var _a = freb(fleb, 2), fl = _a[0], revfl = _a[1];
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), fd = _b[0], revfd = _b[1];
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >>> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >>> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >>> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >>> 8) | ((x & 0x00FF) << 8)) >>> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i)
        ++l[cd[i] - 1];
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16(mb);
    for (i = 0; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        var rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                var sv = (i << 4) | cd[i];
                // free bits
                var r_1 = mb - cd[i];
                // start value
                var v = le[cd[i] - 1]++ << r_1;
                // m is end value
                for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >>> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev[le[cd[i] - 1]++] >>> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
    flt[i] = 8;
for (var i = 144; i < 256; ++i)
    flt[i] = 9;
for (var i = 256; i < 280; ++i)
    flt[i] = 7;
for (var i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
var flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
var fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
// find max of array
var max = function (a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) {
        if (a[i] > m)
            m = a[i];
    }
    return m;
};
// read d, starting at bit p and mask with m
var bits = function (d, p, m) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
};
// read d, starting at bit p continuing for at least 16 bits
var bits16 = function (d, p) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
};
// get end of byte
var shft = function (p) { return ((p / 8) | 0) + (p & 7 && 1); };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (s == null || s < 0)
        s = 0;
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    var n = new (v instanceof u16 ? u16 : v instanceof u32 ? u32 : u8)(e - s);
    n.set(v.subarray(s, e));
    return n;
};
// expands raw DEFLATE data
var inflt = function (dat, buf, st) {
    // source length
    var sl = dat.length;
    if (!sl || (st && !st.l && sl < 5))
        return buf || new u8(0);
    // have to estimate size
    var noBuf = !buf || st;
    // no state
    var noSt = !st || st.i;
    if (!st)
        st = {};
    // Assumes roughly 33% compression ratio average
    if (!buf)
        buf = new u8(sl * 3);
    // ensure buffer can fit at least l elements
    var cbuf = function (l) {
        var bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            var nbuf = new u8(Math.max(bl * 2, l));
            nbuf.set(buf);
            buf = nbuf;
        }
    };
    //  last chunk         bitpos           bytes
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    // total bits
    var tbts = sl * 8;
    do {
        if (!lm) {
            // BFINAL - this is only 1 when last chunk is next
            st.f = final = bits(dat, pos, 1);
            // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
                // go to end of byte boundary
                var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                if (t > sl) {
                    if (noSt)
                        throw 'unexpected EOF';
                    break;
                }
                // ensure size
                if (noBuf)
                    cbuf(bt + l);
                // Copy over uncompressed data
                buf.set(dat.subarray(s, t), bt);
                // Get new bitpos, update byte count
                st.b = bt += l, st.p = pos = t * 8;
                continue;
            }
            else if (type == 1)
                lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
                //  literal                            lengths
                var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                var tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                // length+distance tree
                var ldt = new u8(tl);
                // code length tree
                var clt = new u8(19);
                for (var i = 0; i < hcLen; ++i) {
                    // use index map to get real code
                    clt[clim[i]] = bits(dat, pos + i * 3, 7);
                }
                pos += hcLen * 3;
                // code lengths bits
                var clb = max(clt), clbmsk = (1 << clb) - 1;
                // code lengths map
                var clm = hMap(clt, clb, 1);
                for (var i = 0; i < tl;) {
                    var r = clm[bits(dat, pos, clbmsk)];
                    // bits read
                    pos += r & 15;
                    // symbol
                    var s = r >>> 4;
                    // code length to copy
                    if (s < 16) {
                        ldt[i++] = s;
                    }
                    else {
                        //  copy   count
                        var c = 0, n = 0;
                        if (s == 16)
                            n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                        else if (s == 17)
                            n = 3 + bits(dat, pos, 7), pos += 3;
                        else if (s == 18)
                            n = 11 + bits(dat, pos, 127), pos += 7;
                        while (n--)
                            ldt[i++] = c;
                    }
                }
                //    length tree                 distance tree
                var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                // max length bits
                lbt = max(lt);
                // max dist bits
                dbt = max(dt);
                lm = hMap(lt, lbt, 1);
                dm = hMap(dt, dbt, 1);
            }
            else
                throw 'invalid block type';
            if (pos > tbts) {
                if (noSt)
                    throw 'unexpected EOF';
                break;
            }
        }
        // Make sure the buffer can hold this + the largest possible addition
        // Maximum chunk size (practically, theoretically infinite) is 2^17;
        if (noBuf)
            cbuf(bt + 131072);
        var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        var lpos = pos;
        for (;; lpos = pos) {
            // bits read, code
            var c = lm[bits16(dat, pos) & lms], sym = c >>> 4;
            pos += c & 15;
            if (pos > tbts) {
                if (noSt)
                    throw 'unexpected EOF';
                break;
            }
            if (!c)
                throw 'invalid length/literal';
            if (sym < 256)
                buf[bt++] = sym;
            else if (sym == 256) {
                lpos = pos, lm = null;
                break;
            }
            else {
                var add = sym - 254;
                // no extra bits needed if less
                if (sym > 264) {
                    // index
                    var i = sym - 257, b = fleb[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl[i];
                    pos += b;
                }
                // dist
                var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
                if (!d)
                    throw 'invalid distance';
                pos += d & 15;
                var dt = fd[dsym];
                if (dsym > 3) {
                    var b = fdeb[dsym];
                    dt += bits16(dat, pos) & ((1 << b) - 1), pos += b;
                }
                if (pos > tbts) {
                    if (noSt)
                        throw 'unexpected EOF';
                    break;
                }
                if (noBuf)
                    cbuf(bt + 131072);
                var end = bt + add;
                for (; bt < end; bt += 4) {
                    buf[bt] = buf[bt - dt];
                    buf[bt + 1] = buf[bt + 1 - dt];
                    buf[bt + 2] = buf[bt + 2 - dt];
                    buf[bt + 3] = buf[bt + 3 - dt];
                }
                bt = end;
            }
        }
        st.l = lm, st.p = lpos, st.b = bt;
        if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt == buf.length ? buf : slc(buf, 0, bt);
};
// starting at p, write the minimum number of bits that can hold v to d
var wbits = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >>> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
var wbits16 = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >>> 8;
    d[o + 2] |= v >>> 16;
};
// creates code lengths from a frequency table
var hTree = function (d, mb) {
    // Need extra info to make a tree
    var t = [];
    for (var i = 0; i < d.length; ++i) {
        if (d[i])
            t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
        return [et, 0];
    if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return [v, 1];
    }
    t.sort(function (a, b) { return a.f - b.f; });
    // after i2 reaches last ind, will be stopped
    // freq must be greater than largest possible number of symbols
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
    // efficient algorithm from UZIP.js
    // i0 is lookbehind, i2 is lookahead - after processing two low-freq
    // symbols that combined have high freq, will start processing i2 (high-freq,
    // non-composite) symbols instead
    // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
    while (i1 != s - 1) {
        l = t[t[i0].f < t[i2].f ? i0++ : i2++];
        r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
        t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
        if (t2[i].s > maxSym)
            maxSym = t2[i].s;
    }
    // code lengths
    var tr = new u16(maxSym + 1);
    // max bits in tree
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
        // more algorithms from UZIP.js
        // TODO: find out how this code works (debt)
        //  ind    debt
        var i = 0, dt = 0;
        //    left            cost
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
        for (; i < s; ++i) {
            var i2_1 = t2[i].s;
            if (tr[i2_1] > mb) {
                dt += cst - (1 << (mbt - tr[i2_1]));
                tr[i2_1] = mb;
            }
            else
                break;
        }
        dt >>>= lft;
        while (dt > 0) {
            var i2_2 = t2[i].s;
            if (tr[i2_2] < mb)
                dt -= 1 << (mb - tr[i2_2]++ - 1);
            else
                ++i;
        }
        for (; i >= 0 && dt; --i) {
            var i2_3 = t2[i].s;
            if (tr[i2_3] == mb) {
                --tr[i2_3];
                ++dt;
            }
        }
        mbt = mb;
    }
    return [new u8(tr), mbt];
};
// get the max length and assign length codes
var ln = function (n, l, d) {
    return n.s == -1
        ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
        : (l[n.s] = d);
};
// length codes generation
var lc = function (c) {
    var s = c.length;
    // Note that the semicolon was intentional
    while (s && !c[--s])
        ;
    var cl = new u16(++s);
    //  ind      num         streak
    var cli = 0, cln = c[0], cls = 1;
    var w = function (v) { cl[cli++] = v; };
    for (var i = 1; i <= s; ++i) {
        if (c[i] == cln && i != s)
            ++cls;
        else {
            if (!cln && cls > 2) {
                for (; cls > 138; cls -= 138)
                    w(32754);
                if (cls > 2) {
                    w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                    cls = 0;
                }
            }
            else if (cls > 3) {
                w(cln), --cls;
                for (; cls > 6; cls -= 6)
                    w(8304);
                if (cls > 2)
                    w(((cls - 3) << 5) | 8208), cls = 0;
            }
            while (cls--)
                w(cln);
            cls = 1;
            cln = c[i];
        }
    }
    return [cl.subarray(0, cli), s];
};
// calculate the length of output from tree, code lengths
var clen = function (cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
        l += cf[i] * cl[i];
    return l;
};
// writes a fixed block
// returns the new bit pos
var wfblk = function (out, pos, dat) {
    // no need to write 00 as type: TypedArray defaults to 0
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >>> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
        out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
};
// writes a block
var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a = hTree(lf, 15), dlt = _a[0], mlb = _a[1];
    var _b = hTree(df, 15), ddt = _b[0], mdb = _b[1];
    var _c = lc(dlt), lclt = _c[0], nlc = _c[1];
    var _d = lc(ddt), lcdt = _d[0], ndc = _d[1];
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
        lcfreq[lclt[i] & 31]++;
    for (var i = 0; i < lcdt.length; ++i)
        lcfreq[lcdt[i] & 31]++;
    var _e = hTree(lcfreq, 7), lct = _e[0], mlcb = _e[1];
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
    var flen = (bl + 5) << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + (2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18]);
    if (flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i = 0; i < nlcc; ++i)
            wbits(out, p + 3 * i, lct[clim[i]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i = 0; i < clct.length; ++i) {
                var len = clct[i] & 31;
                wbits(out, p, llm[len]), p += lct[len];
                if (len > 15)
                    wbits(out, p, (clct[i] >>> 5) & 127), p += clct[i] >>> 12;
            }
        }
    }
    else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
        if (syms[i] > 255) {
            var len = (syms[i] >>> 18) & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
                wbits(out, p, (syms[i] >>> 23) & 31), p += fleb[len];
            var dst = syms[i] & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
                wbits16(out, p, (syms[i] >>> 5) & 8191), p += fdeb[dst];
        }
        else {
            wbits16(out, p, lm[syms[i]]), p += ll[syms[i]];
        }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
};
// deflate options (nice << 13) | chain
var deo = /*#__PURE__*/ new u32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
var et = /*#__PURE__*/ new u8(0);
// compresses data into a raw DEFLATE buffer
var dflt = function (dat, lvl, plvl, pre, post, lst) {
    var s = dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
    // writing to this writes to the output buffer
    var w = o.subarray(pre, o.length - post);
    var pos = 0;
    if (!lvl || s < 8) {
        for (var i = 0; i <= s; i += 65535) {
            // end
            var e = i + 65535;
            if (e < s) {
                // write full block
                pos = wfblk(w, pos, dat.subarray(i, e));
            }
            else {
                // write final block
                w[i] = lst;
                pos = wfblk(w, pos, dat.subarray(i, s));
            }
        }
    }
    else {
        var opt = deo[lvl - 1];
        var n = opt >>> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        //    prev 2-byte val map    curr 2-byte val map
        var prev = new u16(32768), head = new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
        // 24576 is an arbitrary number of maximum symbols per block
        // 424 buffer for last block
        var syms = new u32(25000);
        // length/literal freq   distance freq
        var lf = new u16(288), df = new u16(32);
        //  l/lcnt  exbits  index  l/lind  waitdx  bitpos
        var lc_1 = 0, eb = 0, i = 0, li = 0, wi = 0, bs = 0;
        for (; i < s; ++i) {
            // hash value
            // deopt when i > s - 3 - at end, deopt acceptable
            var hv = hsh(i);
            // index mod 32768    previous index mod
            var imod = i & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            // We always should modify head and prev, but only add symbols if
            // this data is not yet processed ("wait" for wait index)
            if (wi <= i) {
                // bytes remaining
                var rem = s - i;
                if ((lc_1 > 7000 || li > 24576) && rem > 423) {
                    pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                    li = lc_1 = eb = 0, bs = i;
                    for (var j = 0; j < 286; ++j)
                        lf[j] = 0;
                    for (var j = 0; j < 30; ++j)
                        df[j] = 0;
                }
                //  len    dist   chain
                var l = 2, d = 0, ch_1 = c, dif = (imod - pimod) & 32767;
                if (rem > 2 && hv == hsh(i - dif)) {
                    var maxn = Math.min(n, rem) - 1;
                    var maxd = Math.min(32767, i);
                    // max possible length
                    // not capped at dif because decompressors implement "rolling" index population
                    var ml = Math.min(258, rem);
                    while (dif <= maxd && --ch_1 && imod != pimod) {
                        if (dat[i + l] == dat[i + l - dif]) {
                            var nl = 0;
                            for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                ;
                            if (nl > l) {
                                l = nl, d = dif;
                                // break out early when we reach "nice" (we are satisfied enough)
                                if (nl > maxn)
                                    break;
                                // now, find the rarest 2-byte sequence within this
                                // length of literals and search for that instead.
                                // Much faster than just using the start
                                var mmd = Math.min(dif, nl - 2);
                                var md = 0;
                                for (var j = 0; j < mmd; ++j) {
                                    var ti = (i - dif + j + 32768) & 32767;
                                    var pti = prev[ti];
                                    var cd = (ti - pti + 32768) & 32767;
                                    if (cd > md)
                                        md = cd, pimod = ti;
                                }
                            }
                        }
                        // check the previous match
                        imod = pimod, pimod = prev[imod];
                        dif += (imod - pimod + 32768) & 32767;
                    }
                }
                // d will be nonzero only when a match was found
                if (d) {
                    // store both dist and len data in one Uint32
                    // Make sure this is recognized as a len/dist with 28th bit (2^28)
                    syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                    var lin = revfl[l] & 31, din = revfd[d] & 31;
                    eb += fleb[lin] + fdeb[din];
                    ++lf[257 + lin];
                    ++df[din];
                    wi = i + l;
                    ++lc_1;
                }
                else {
                    syms[li++] = dat[i];
                    ++lf[dat[i]];
                }
            }
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
        // this is the easiest way to avoid needing to maintain state
        if (!lst && pos & 7)
            pos = wfblk(w, pos + 1, et);
    }
    return slc(o, 0, pre + shft(pos) + post);
};
// CRC32 table
var crct = /*#__PURE__*/ (function () {
    var t = new u32(256);
    for (var i = 0; i < 256; ++i) {
        var c = i, k = 9;
        while (--k)
            c = ((c & 1) && 0xEDB88320) ^ (c >>> 1);
        t[i] = c;
    }
    return t;
})();
// CRC32
var crc = function () {
    var c = -1;
    return {
        p: function (d) {
            // closures have awful performance
            var cr = c;
            for (var i = 0; i < d.length; ++i)
                cr = crct[(cr & 255) ^ d[i]] ^ (cr >>> 8);
            c = cr;
        },
        d: function () { return ~c; }
    };
};
// Alder32
var adler = function () {
    var a = 1, b = 0;
    return {
        p: function (d) {
            // closures have awful performance
            var n = a, m = b;
            var l = d.length;
            for (var i = 0; i != l;) {
                var e = Math.min(i + 2655, l);
                for (; i < e; ++i)
                    m += n += d[i];
                n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
            }
            a = n, b = m;
        },
        d: function () {
            a %= 65521, b %= 65521;
            return (a & 255) << 24 | (a >>> 8) << 16 | (b & 255) << 8 | (b >>> 8);
        }
    };
};
;
// deflate with opts
var dopt = function (dat, opt, pre, post, st) {
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : (12 + opt.mem), pre, post, !st);
};
// Walmart object spread
var mrg = function (a, b) {
    var o = {};
    for (var k in a)
        o[k] = a[k];
    for (var k in b)
        o[k] = b[k];
    return o;
};
// worker clone
// This is possibly the craziest part of the entire codebase, despite how simple it may seem.
// The only parameter to this function is a closure that returns an array of variables outside of the function scope.
// We're going to try to figure out the variable names used in the closure as strings because that is crucial for workerization.
// We will return an object mapping of true variable name to value (basically, the current scope as a JS object).
// The reason we can't just use the original variable names is minifiers mangling the toplevel scope.
// This took me three weeks to figure out how to do.
var wcln = function (fn, fnStr, td) {
    var dt = fn();
    var st = fn.toString();
    var ks = st.slice(st.indexOf('[') + 1, st.lastIndexOf(']')).replace(/ /g, '').split(',');
    for (var i = 0; i < dt.length; ++i) {
        var v = dt[i], k = ks[i];
        if (typeof v == 'function') {
            fnStr += ';' + k + '=';
            var st_1 = v.toString();
            if (v.prototype) {
                // for global objects
                if (st_1.indexOf('[native code]') != -1) {
                    var spInd = st_1.indexOf(' ', 8) + 1;
                    fnStr += st_1.slice(spInd, st_1.indexOf('(', spInd));
                }
                else {
                    fnStr += st_1;
                    for (var t in v.prototype)
                        fnStr += ';' + k + '.prototype.' + t + '=' + v.prototype[t].toString();
                }
            }
            else
                fnStr += st_1;
        }
        else
            td[k] = v;
    }
    return [fnStr, td];
};
var ch = [];
// clone bufs
var cbfs = function (v) {
    var tl = [];
    for (var k in v) {
        if (v[k] instanceof u8 || v[k] instanceof u16 || v[k] instanceof u32)
            tl.push((v[k] = new v[k].constructor(v[k])).buffer);
    }
    return tl;
};
// use a worker to execute code
var wrkr = function (fns, init, id, cb) {
    var _a;
    if (!ch[id]) {
        var fnStr = '', td_1 = {}, m = fns.length - 1;
        for (var i = 0; i < m; ++i)
            _a = wcln(fns[i], fnStr, td_1), fnStr = _a[0], td_1 = _a[1];
        ch[id] = wcln(fns[m], fnStr, td_1);
    }
    var td = mrg({}, ch[id][1]);
    return wk(ch[id][0] + ';onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=' + init.toString() + '}', id, td, cbfs(td), cb);
};
// base async inflate fn
var bInflt = function () { return [u8, u16, u32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, hMap, max, bits, bits16, shft, slc, inflt, inflateSync, pbf, gu8]; };
var bDflt = function () { return [u8, u16, u32, fleb, fdeb, clim, revfl, revfd, flm, flt, fdm, fdt, rev, deo, et, hMap, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, shft, slc, dflt, dopt, deflateSync, pbf]; };
// gzip extra
var gze = function () { return [gzh, gzhl, wbytes, crc, crct]; };
// gunzip extra
var guze = function () { return [gzs, gzl]; };
// zlib extra
var zle = function () { return [zlh, wbytes, adler]; };
// unzlib extra
var zule = function () { return [zlv]; };
// post buf
var pbf = function (msg) { return postMessage(msg, [msg.buffer]); };
// get u8
var gu8 = function (o) { return o && o.size && new u8(o.size); };
// async helper
var cbify = function (dat, opts, fns, init, id, cb) {
    var w = wrkr(fns, init, id, function (err, dat) {
        w.terminate();
        cb(err, dat);
    });
    w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
    return function () { w.terminate(); };
};
// auto stream
var astrm = function (strm) {
    strm.ondata = function (dat, final) { return postMessage([dat, final], [dat.buffer]); };
    return function (ev) { return strm.push(ev.data[0], ev.data[1]); };
};
// async stream attach
var astrmify = function (fns, strm, opts, init, id) {
    var t;
    var w = wrkr(fns, init, id, function (err, dat) {
        if (err)
            w.terminate(), strm.ondata.call(strm, err);
        else {
            if (dat[1])
                w.terminate();
            strm.ondata.call(strm, err, dat[0], dat[1]);
        }
    });
    w.postMessage(opts);
    strm.push = function (d, f) {
        if (t)
            throw 'stream finished';
        if (!strm.ondata)
            throw 'no stream handler';
        w.postMessage([d, t = f], [d.buffer]);
    };
    strm.terminate = function () { w.terminate(); };
};
// read 2 bytes
var b2 = function (d, b) { return d[b] | (d[b + 1] << 8); };
// read 4 bytes
var b4 = function (d, b) { return (d[b] | (d[b + 1] << 8) | (d[b + 2] << 16) | (d[b + 3] << 24)) >>> 0; };
var b8 = function (d, b) { return b4(d, b) + (b4(d, b + 4) * 4294967296); };
// write bytes
var wbytes = function (d, b, v) {
    for (; v; ++b)
        d[b] = v, v >>>= 8;
};
// gzip header
var gzh = function (c, o) {
    var fn = o.filename;
    c[0] = 31, c[1] = 139, c[2] = 8, c[8] = o.level < 2 ? 4 : o.level == 9 ? 2 : 0, c[9] = 3; // assume Unix
    if (o.mtime != 0)
        wbytes(c, 4, Math.floor(new Date(o.mtime || Date.now()) / 1000));
    if (fn) {
        c[3] = 8;
        for (var i = 0; i <= fn.length; ++i)
            c[i + 10] = fn.charCodeAt(i);
    }
};
// gzip footer: -8 to -4 = CRC, -4 to -0 is length
// gzip start
var gzs = function (d) {
    if (d[0] != 31 || d[1] != 139 || d[2] != 8)
        throw 'invalid gzip data';
    var flg = d[3];
    var st = 10;
    if (flg & 4)
        st += d[10] | (d[11] << 8) + 2;
    for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
        ;
    return st + (flg & 2);
};
// gzip length
var gzl = function (d) {
    var l = d.length;
    return ((d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16) | (d[l - 1] << 24)) >>> 0;
};
// gzip header length
var gzhl = function (o) { return 10 + ((o.filename && (o.filename.length + 1)) || 0); };
// zlib header
var zlh = function (c, o) {
    var lv = o.level, fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
    c[0] = 120, c[1] = (fl << 6) | (fl ? (32 - 2 * fl) : 1);
};
// zlib valid
var zlv = function (d) {
    if ((d[0] & 15) != 8 || (d[0] >>> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
        throw 'invalid zlib data';
    if (d[1] & 32)
        throw 'invalid zlib data: preset dictionaries not supported';
};
function AsyncCmpStrm(opts, cb) {
    if (!cb && typeof opts == 'function')
        cb = opts, opts = {};
    this.ondata = cb;
    return opts;
}
// zlib footer: -4 to -0 is Adler32
/**
 * Streaming DEFLATE compression
 */
var Deflate = /*#__PURE__*/ (function () {
    function Deflate(opts, cb) {
        if (!cb && typeof opts == 'function')
            cb = opts, opts = {};
        this.ondata = cb;
        this.o = opts || {};
    }
    Deflate.prototype.p = function (c, f) {
        this.ondata(dopt(c, this.o, 0, 0, !f), f);
    };
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Deflate.prototype.push = function (chunk, final) {
        if (this.d)
            throw 'stream finished';
        if (!this.ondata)
            throw 'no stream handler';
        this.d = final;
        this.p(chunk, final || false);
    };
    return Deflate;
}());

/**
 * Asynchronous streaming DEFLATE compression
 */
var AsyncDeflate = /*#__PURE__*/ (function () {
    function AsyncDeflate(opts, cb) {
        astrmify([
            bDflt,
            function () { return [astrm, Deflate]; }
        ], this, AsyncCmpStrm.call(this, opts, cb), function (ev) {
            var strm = new Deflate(ev.data);
            onmessage = astrm(strm);
        }, 6);
    }
    return AsyncDeflate;
}());

function deflate(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    return cbify(data, opts, [
        bDflt,
    ], function (ev) { return pbf(deflateSync(ev.data[0], ev.data[1])); }, 0, cb);
}
/**
 * Compresses data with DEFLATE without any wrapper
 * @param data The data to compress
 * @param opts The compression options
 * @returns The deflated version of the data
 */
function deflateSync(data, opts) {
    return dopt(data, opts || {}, 0, 0);
}
/**
 * Streaming DEFLATE decompression
 */
var Inflate = /*#__PURE__*/ (function () {
    /**
     * Creates an inflation stream
     * @param cb The callback to call whenever data is inflated
     */
    function Inflate(cb) {
        this.s = {};
        this.p = new u8(0);
        this.ondata = cb;
    }
    Inflate.prototype.e = function (c) {
        if (this.d)
            throw 'stream finished';
        if (!this.ondata)
            throw 'no stream handler';
        var l = this.p.length;
        var n = new u8(l + c.length);
        n.set(this.p), n.set(c, l), this.p = n;
    };
    Inflate.prototype.c = function (final) {
        this.d = this.s.i = final || false;
        var bts = this.s.b;
        var dt = inflt(this.p, this.o, this.s);
        this.ondata(slc(dt, bts, this.s.b), this.d);
        this.o = slc(dt, this.s.b - 32768), this.s.b = this.o.length;
        this.p = slc(this.p, (this.s.p / 8) | 0), this.s.p &= 7;
    };
    /**
     * Pushes a chunk to be inflated
     * @param chunk The chunk to push
     * @param final Whether this is the final chunk
     */
    Inflate.prototype.push = function (chunk, final) {
        this.e(chunk), this.c(final);
    };
    return Inflate;
}());

/**
 * Asynchronous streaming DEFLATE decompression
 */
var AsyncInflate = /*#__PURE__*/ (function () {
    /**
     * Creates an asynchronous inflation stream
     * @param cb The callback to call whenever data is deflated
     */
    function AsyncInflate(cb) {
        this.ondata = cb;
        astrmify([
            bInflt,
            function () { return [astrm, Inflate]; }
        ], this, 0, function () {
            var strm = new Inflate();
            onmessage = astrm(strm);
        }, 7);
    }
    return AsyncInflate;
}());

function inflate(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    return cbify(data, opts, [
        bInflt
    ], function (ev) { return pbf(inflateSync(ev.data[0], gu8(ev.data[1]))); }, 1, cb);
}
/**
 * Expands DEFLATE data with no wrapper
 * @param data The data to decompress
 * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
 * @returns The decompressed version of the data
 */
function inflateSync(data, out) {
    return inflt(data, out);
}
// before you yell at me for not just using extends, my reason is that TS inheritance is hard to workerize.
/**
 * Streaming GZIP compression
 */
var Gzip = /*#__PURE__*/ (function () {
    function Gzip(opts, cb) {
        this.c = crc();
        this.l = 0;
        this.v = 1;
        Deflate.call(this, opts, cb);
    }
    /**
     * Pushes a chunk to be GZIPped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Gzip.prototype.push = function (chunk, final) {
        Deflate.prototype.push.call(this, chunk, final);
    };
    Gzip.prototype.p = function (c, f) {
        this.c.p(c);
        this.l += c.length;
        var raw = dopt(c, this.o, this.v && gzhl(this.o), f && 8, !f);
        if (this.v)
            gzh(raw, this.o), this.v = 0;
        if (f)
            wbytes(raw, raw.length - 8, this.c.d()), wbytes(raw, raw.length - 4, this.l);
        this.ondata(raw, f);
    };
    return Gzip;
}());

/**
 * Asynchronous streaming GZIP compression
 */
var AsyncGzip = /*#__PURE__*/ (function () {
    function AsyncGzip(opts, cb) {
        astrmify([
            bDflt,
            gze,
            function () { return [astrm, Deflate, Gzip]; }
        ], this, AsyncCmpStrm.call(this, opts, cb), function (ev) {
            var strm = new Gzip(ev.data);
            onmessage = astrm(strm);
        }, 8);
    }
    return AsyncGzip;
}());

function gzip(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    return cbify(data, opts, [
        bDflt,
        gze,
        function () { return [gzipSync]; }
    ], function (ev) { return pbf(gzipSync(ev.data[0], ev.data[1])); }, 2, cb);
}
/**
 * Compresses data with GZIP
 * @param data The data to compress
 * @param opts The compression options
 * @returns The gzipped version of the data
 */
function gzipSync(data, opts) {
    if (!opts)
        opts = {};
    var c = crc(), l = data.length;
    c.p(data);
    var d = dopt(data, opts, gzhl(opts), 8), s = d.length;
    return gzh(d, opts), wbytes(d, s - 8, c.d()), wbytes(d, s - 4, l), d;
}
/**
 * Streaming GZIP decompression
 */
var Gunzip = /*#__PURE__*/ (function () {
    /**
     * Creates a GUNZIP stream
     * @param cb The callback to call whenever data is inflated
     */
    function Gunzip(cb) {
        this.v = 1;
        Inflate.call(this, cb);
    }
    /**
     * Pushes a chunk to be GUNZIPped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Gunzip.prototype.push = function (chunk, final) {
        Inflate.prototype.e.call(this, chunk);
        if (this.v) {
            var s = this.p.length > 3 ? gzs(this.p) : 4;
            if (s >= this.p.length && !final)
                return;
            this.p = this.p.subarray(s), this.v = 0;
        }
        if (final) {
            if (this.p.length < 8)
                throw 'invalid gzip stream';
            this.p = this.p.subarray(0, -8);
        }
        // necessary to prevent TS from using the closure value
        // This allows for workerization to function correctly
        Inflate.prototype.c.call(this, final);
    };
    return Gunzip;
}());

/**
 * Asynchronous streaming GZIP decompression
 */
var AsyncGunzip = /*#__PURE__*/ (function () {
    /**
     * Creates an asynchronous GUNZIP stream
     * @param cb The callback to call whenever data is deflated
     */
    function AsyncGunzip(cb) {
        this.ondata = cb;
        astrmify([
            bInflt,
            guze,
            function () { return [astrm, Inflate, Gunzip]; }
        ], this, 0, function () {
            var strm = new Gunzip();
            onmessage = astrm(strm);
        }, 9);
    }
    return AsyncGunzip;
}());

function gunzip(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    return cbify(data, opts, [
        bInflt,
        guze,
        function () { return [gunzipSync]; }
    ], function (ev) { return pbf(gunzipSync(ev.data[0])); }, 3, cb);
}
/**
 * Expands GZIP data
 * @param data The data to decompress
 * @param out Where to write the data. GZIP already encodes the output size, so providing this doesn't save memory.
 * @returns The decompressed version of the data
 */
function gunzipSync(data, out) {
    return inflt(data.subarray(gzs(data), -8), out || new u8(gzl(data)));
}
/**
 * Streaming Zlib compression
 */
var Zlib = /*#__PURE__*/ (function () {
    function Zlib(opts, cb) {
        this.c = adler();
        this.v = 1;
        Deflate.call(this, opts, cb);
    }
    /**
     * Pushes a chunk to be zlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Zlib.prototype.push = function (chunk, final) {
        Deflate.prototype.push.call(this, chunk, final);
    };
    Zlib.prototype.p = function (c, f) {
        this.c.p(c);
        var raw = dopt(c, this.o, this.v && 2, f && 4, !f);
        if (this.v)
            zlh(raw, this.o), this.v = 0;
        if (f)
            wbytes(raw, raw.length - 4, this.c.d());
        this.ondata(raw, f);
    };
    return Zlib;
}());

/**
 * Asynchronous streaming Zlib compression
 */
var AsyncZlib = /*#__PURE__*/ (function () {
    function AsyncZlib(opts, cb) {
        astrmify([
            bDflt,
            zle,
            function () { return [astrm, Deflate, Zlib]; }
        ], this, AsyncCmpStrm.call(this, opts, cb), function (ev) {
            var strm = new Zlib(ev.data);
            onmessage = astrm(strm);
        }, 10);
    }
    return AsyncZlib;
}());

function zlib(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    return cbify(data, opts, [
        bDflt,
        zle,
        function () { return [zlibSync]; }
    ], function (ev) { return pbf(zlibSync(ev.data[0], ev.data[1])); }, 4, cb);
}
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
function zlibSync(data, opts) {
    if (!opts)
        opts = {};
    var a = adler();
    a.p(data);
    var d = dopt(data, opts, 2, 4);
    return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
}
/**
 * Streaming Zlib decompression
 */
var Unzlib = /*#__PURE__*/ (function () {
    /**
     * Creates a Zlib decompression stream
     * @param cb The callback to call whenever data is inflated
     */
    function Unzlib(cb) {
        this.v = 1;
        Inflate.call(this, cb);
    }
    /**
     * Pushes a chunk to be unzlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Unzlib.prototype.push = function (chunk, final) {
        Inflate.prototype.e.call(this, chunk);
        if (this.v) {
            if (this.p.length < 2 && !final)
                return;
            this.p = this.p.subarray(2), this.v = 0;
        }
        if (final) {
            if (this.p.length < 4)
                throw 'invalid zlib stream';
            this.p = this.p.subarray(0, -4);
        }
        // necessary to prevent TS from using the closure value
        // This allows for workerization to function correctly
        Inflate.prototype.c.call(this, final);
    };
    return Unzlib;
}());

/**
 * Asynchronous streaming Zlib decompression
 */
var AsyncUnzlib = /*#__PURE__*/ (function () {
    /**
     * Creates an asynchronous Zlib decompression stream
     * @param cb The callback to call whenever data is deflated
     */
    function AsyncUnzlib(cb) {
        this.ondata = cb;
        astrmify([
            bInflt,
            zule,
            function () { return [astrm, Inflate, Unzlib]; }
        ], this, 0, function () {
            var strm = new Unzlib();
            onmessage = astrm(strm);
        }, 11);
    }
    return AsyncUnzlib;
}());

function unzlib(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    return cbify(data, opts, [
        bInflt,
        zule,
        function () { return [unzlibSync]; }
    ], function (ev) { return pbf(unzlibSync(ev.data[0], gu8(ev.data[1]))); }, 5, cb);
}
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
 * @returns The decompressed version of the data
 */
function unzlibSync(data, out) {
    return inflt((zlv(data), data.subarray(2, -4)), out);
}
// Default algorithm for compression (used because having a known output size allows faster decompression)

// Default algorithm for compression (used because having a known output size allows faster decompression)

/**
 * Streaming GZIP, Zlib, or raw DEFLATE decompression
 */
var Decompress = /*#__PURE__*/ (function () {
    /**
     * Creates a decompression stream
     * @param cb The callback to call whenever data is decompressed
     */
    function Decompress(cb) {
        this.G = Gunzip;
        this.I = Inflate;
        this.Z = Unzlib;
        this.ondata = cb;
    }
    /**
     * Pushes a chunk to be decompressed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Decompress.prototype.push = function (chunk, final) {
        if (!this.ondata)
            throw 'no stream handler';
        if (!this.s) {
            if (this.p && this.p.length) {
                var n = new u8(this.p.length + chunk.length);
                n.set(this.p), n.set(chunk, this.p.length);
            }
            else
                this.p = chunk;
            if (this.p.length > 2) {
                var _this_1 = this;
                var cb = function () { _this_1.ondata.apply(_this_1, arguments); };
                this.s = (this.p[0] == 31 && this.p[1] == 139 && this.p[2] == 8)
                    ? new this.G(cb)
                    : ((this.p[0] & 15) != 8 || (this.p[0] >> 4) > 7 || ((this.p[0] << 8 | this.p[1]) % 31))
                        ? new this.I(cb)
                        : new this.Z(cb);
                this.s.push(this.p, final);
                this.p = null;
            }
        }
        else
            this.s.push(chunk, final);
    };
    return Decompress;
}());

/**
 * Asynchronous streaming GZIP, Zlib, or raw DEFLATE decompression
 */
var AsyncDecompress = /*#__PURE__*/ (function () {
    /**
   * Creates an asynchronous decompression stream
   * @param cb The callback to call whenever data is decompressed
   */
    function AsyncDecompress(cb) {
        this.G = AsyncGunzip;
        this.I = AsyncInflate;
        this.Z = AsyncUnzlib;
        this.ondata = cb;
    }
    /**
     * Pushes a chunk to be decompressed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    AsyncDecompress.prototype.push = function (chunk, final) {
        Decompress.prototype.push.call(this, chunk, final);
    };
    return AsyncDecompress;
}());

function decompress(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    return (data[0] == 31 && data[1] == 139 && data[2] == 8)
        ? gunzip(data, opts, cb)
        : ((data[0] & 15) != 8 || (data[0] >> 4) > 7 || ((data[0] << 8 | data[1]) % 31))
            ? inflate(data, opts, cb)
            : unzlib(data, opts, cb);
}
/**
 * Expands compressed GZIP, Zlib, or raw DEFLATE data, automatically detecting the format
 * @param data The data to decompress
 * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
 * @returns The decompressed version of the data
 */
function decompressSync(data, out) {
    return (data[0] == 31 && data[1] == 139 && data[2] == 8)
        ? gunzipSync(data, out)
        : ((data[0] & 15) != 8 || (data[0] >> 4) > 7 || ((data[0] << 8 | data[1]) % 31))
            ? inflateSync(data, out)
            : unzlibSync(data, out);
}
// flatten a directory structure
var fltn = function (d, p, t, o) {
    for (var k in d) {
        var val = d[k], n = p + k;
        if (val instanceof u8)
            t[n] = [val, o];
        else if (Array.isArray(val))
            t[n] = [val[0], mrg(o, val[1])];
        else
            fltn(val, n + '/', t, o);
    }
};
// text encoder
var te = typeof TextEncoder != 'undefined' && /*#__PURE__*/ new TextEncoder();
// text decoder
var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds = 0;
try {
    td.decode(et, { stream: true });
    tds = 1;
}
catch (e) { }
// decode UTF8
var dutf8 = function (d) {
    for (var r = '', i = 0;;) {
        var c = d[i++];
        var eb = (c > 127) + (c > 223) + (c > 239);
        if (i + eb > d.length)
            return [r, slc(d, i - 1)];
        if (!eb)
            r += String.fromCharCode(c);
        else if (eb == 3) {
            c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | (d[i++] & 63)) - 65536,
                r += String.fromCharCode(55296 | (c >> 10), 56320 | (c & 1023));
        }
        else if (eb & 1)
            r += String.fromCharCode((c & 31) << 6 | (d[i++] & 63));
        else
            r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | (d[i++] & 63));
    }
};
/**
 * Streaming UTF-8 decoding
 */
var DecodeUTF8 = /*#__PURE__*/ (function () {
    /**
     * Creates a UTF-8 decoding stream
     * @param cb The callback to call whenever data is decoded
     */
    function DecodeUTF8(cb) {
        this.ondata = cb;
        if (tds)
            this.t = new TextDecoder();
        else
            this.p = et;
    }
    /**
     * Pushes a chunk to be decoded from UTF-8 binary
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    DecodeUTF8.prototype.push = function (chunk, final) {
        if (!this.ondata)
            throw 'no callback';
        final = !!final;
        if (this.t) {
            this.ondata(this.t.decode(chunk, { stream: true }), final);
            if (final) {
                if (this.t.decode().length)
                    throw 'invalid utf-8 data';
                this.t = null;
            }
            return;
        }
        if (!this.p)
            throw 'stream finished';
        var dat = new u8(this.p.length + chunk.length);
        dat.set(this.p);
        dat.set(chunk, this.p.length);
        var _a = dutf8(dat), ch = _a[0], np = _a[1];
        if (final) {
            if (np.length)
                throw 'invalid utf-8 data';
            this.p = null;
        }
        else
            this.p = np;
        this.ondata(ch, final);
    };
    return DecodeUTF8;
}());

/**
 * Streaming UTF-8 encoding
 */
var EncodeUTF8 = /*#__PURE__*/ (function () {
    /**
     * Creates a UTF-8 decoding stream
     * @param cb The callback to call whenever data is encoded
     */
    function EncodeUTF8(cb) {
        this.ondata = cb;
    }
    /**
     * Pushes a chunk to be encoded to UTF-8
     * @param chunk The string data to push
     * @param final Whether this is the last chunk
     */
    EncodeUTF8.prototype.push = function (chunk, final) {
        if (!this.ondata)
            throw 'no callback';
        if (this.d)
            throw 'stream finished';
        this.ondata(strToU8(chunk), this.d = final || false);
    };
    return EncodeUTF8;
}());

/**
 * Converts a string into a Uint8Array for use with compression/decompression methods
 * @param str The string to encode
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless decoding a binary string.
 * @returns The string encoded in UTF-8/Latin-1 binary
 */
function strToU8(str, latin1) {
    if (latin1) {
        var ar_1 = new u8(str.length);
        for (var i = 0; i < str.length; ++i)
            ar_1[i] = str.charCodeAt(i);
        return ar_1;
    }
    if (te)
        return te.encode(str);
    var l = str.length;
    var ar = new u8(str.length + (str.length >> 1));
    var ai = 0;
    var w = function (v) { ar[ai++] = v; };
    for (var i = 0; i < l; ++i) {
        if (ai + 5 > ar.length) {
            var n = new u8(ai + 8 + ((l - i) << 1));
            n.set(ar);
            ar = n;
        }
        var c = str.charCodeAt(i);
        if (c < 128 || latin1)
            w(c);
        else if (c < 2048)
            w(192 | (c >> 6)), w(128 | (c & 63));
        else if (c > 55295 && c < 57344)
            c = 65536 + (c & 1023 << 10) | (str.charCodeAt(++i) & 1023),
                w(240 | (c >> 18)), w(128 | ((c >> 12) & 63)), w(128 | ((c >> 6) & 63)), w(128 | (c & 63));
        else
            w(224 | (c >> 12)), w(128 | ((c >> 6) & 63)), w(128 | (c & 63));
    }
    return slc(ar, 0, ai);
}
/**
 * Converts a Uint8Array to a string
 * @param dat The data to decode to string
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless encoding to binary string.
 * @returns The original UTF-8/Latin-1 string
 */
function strFromU8(dat, latin1) {
    if (latin1) {
        var r = '';
        for (var i = 0; i < dat.length; i += 16384)
            r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
        return r;
    }
    else if (td)
        return td.decode(dat);
    else {
        var _a = dutf8(dat), out = _a[0], ext = _a[1];
        if (ext.length)
            throw 'invalid utf-8 data';
        return out;
    }
}
;
// deflate bit flag
var dbf = function (l) { return l == 1 ? 3 : l < 6 ? 2 : l == 9 ? 1 : 0; };
// skip local zip header
var slzh = function (d, b) { return b + 30 + b2(d, b + 26) + b2(d, b + 28); };
// read zip header
var zh = function (d, b, z) {
    var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
    var _a = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a[0], su = _a[1], off = _a[2];
    return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
// read zip64 extra field
var z64e = function (d, b) {
    for (; b2(d, b) != 1; b += 4 + b2(d, b + 2))
        ;
    return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
// extra field length
var exfl = function (ex) {
    var le = 0;
    if (ex) {
        for (var k in ex) {
            var l = ex[k].length;
            if (l > 65535)
                throw 'extra field too long';
            le += l + 4;
        }
    }
    return le;
};
// write zip header
var wzh = function (d, b, f, fn, u, c, ce, co) {
    var fl = fn.length, ex = f.extra, col = co && co.length;
    var exl = exfl(ex);
    wbytes(d, b, ce != null ? 0x2014B50 : 0x4034B50), b += 4;
    if (ce != null)
        d[b++] = 20, d[b++] = f.os;
    d[b] = 20, b += 2; // spec compliance? what's that?
    d[b++] = (f.flag << 1) | (c == null && 8), d[b++] = u && 8;
    d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
    var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
    if (y < 0 || y > 119)
        throw 'date not in range 1980-2099';
    wbytes(d, b, (y << 25) | ((dt.getMonth() + 1) << 21) | (dt.getDate() << 16) | (dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() >>> 1)), b += 4;
    if (c != null) {
        wbytes(d, b, f.crc);
        wbytes(d, b + 4, c);
        wbytes(d, b + 8, f.size);
    }
    wbytes(d, b + 12, fl);
    wbytes(d, b + 14, exl), b += 16;
    if (ce != null) {
        wbytes(d, b, col);
        wbytes(d, b + 6, f.attrs);
        wbytes(d, b + 10, ce), b += 14;
    }
    d.set(fn, b);
    b += fl;
    if (exl) {
        for (var k in ex) {
            var exf = ex[k], l = exf.length;
            wbytes(d, b, +k);
            wbytes(d, b + 2, l);
            d.set(exf, b + 4), b += 4 + l;
        }
    }
    if (col)
        d.set(co, b), b += col;
    return b;
};
// write zip footer (end of central directory)
var wzf = function (o, b, c, d, e) {
    wbytes(o, b, 0x6054B50); // skip disk
    wbytes(o, b + 8, c);
    wbytes(o, b + 10, c);
    wbytes(o, b + 12, d);
    wbytes(o, b + 16, e);
};
/**
 * A pass-through stream to keep data uncompressed in a ZIP archive.
 */
var ZipPassThrough = /*#__PURE__*/ (function () {
    /**
     * Creates a pass-through stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     */
    function ZipPassThrough(filename) {
        this.filename = filename;
        this.c = crc();
        this.size = 0;
        this.compression = 0;
    }
    /**
     * Processes a chunk and pushes to the output stream. You can override this
     * method in a subclass for custom behavior, but by default this passes
     * the data through. You must call this.ondata(err, chunk, final) at some
     * point in this method.
     * @param chunk The chunk to process
     * @param final Whether this is the last chunk
     */
    ZipPassThrough.prototype.process = function (chunk, final) {
        this.ondata(null, chunk, final);
    };
    /**
     * Pushes a chunk to be added. If you are subclassing this with a custom
     * compression algorithm, note that you must push data from the source
     * file only, pre-compression.
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    ZipPassThrough.prototype.push = function (chunk, final) {
        if (!this.ondata)
            throw 'no callback - add to ZIP archive before pushing';
        this.c.p(chunk);
        this.size += chunk.length;
        if (final)
            this.crc = this.c.d();
        this.process(chunk, final || false);
    };
    return ZipPassThrough;
}());

// I don't extend because TypeScript extension adds 1kB of runtime bloat
/**
 * Streaming DEFLATE compression for ZIP archives. Prefer using AsyncZipDeflate
 * for better performance
 */
var ZipDeflate = /*#__PURE__*/ (function () {
    /**
     * Creates a DEFLATE stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     * @param opts The compression options
     */
    function ZipDeflate(filename, opts) {
        var _this_1 = this;
        if (!opts)
            opts = {};
        ZipPassThrough.call(this, filename);
        this.d = new Deflate(opts, function (dat, final) {
            _this_1.ondata(null, dat, final);
        });
        this.compression = 8;
        this.flag = dbf(opts.level);
    }
    ZipDeflate.prototype.process = function (chunk, final) {
        try {
            this.d.push(chunk, final);
        }
        catch (e) {
            this.ondata(e, null, final);
        }
    };
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    ZipDeflate.prototype.push = function (chunk, final) {
        ZipPassThrough.prototype.push.call(this, chunk, final);
    };
    return ZipDeflate;
}());

/**
 * Asynchronous streaming DEFLATE compression for ZIP archives
 */
var AsyncZipDeflate = /*#__PURE__*/ (function () {
    /**
     * Creates a DEFLATE stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     * @param opts The compression options
     */
    function AsyncZipDeflate(filename, opts) {
        var _this_1 = this;
        if (!opts)
            opts = {};
        ZipPassThrough.call(this, filename);
        this.d = new AsyncDeflate(opts, function (err, dat, final) {
            _this_1.ondata(err, dat, final);
        });
        this.compression = 8;
        this.flag = dbf(opts.level);
        this.terminate = this.d.terminate;
    }
    AsyncZipDeflate.prototype.process = function (chunk, final) {
        this.d.push(chunk, final);
    };
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    AsyncZipDeflate.prototype.push = function (chunk, final) {
        ZipPassThrough.prototype.push.call(this, chunk, final);
    };
    return AsyncZipDeflate;
}());

// TODO: Better tree shaking
/**
 * A zippable archive to which files can incrementally be added
 */
var Zip = /*#__PURE__*/ (function () {
    /**
     * Creates an empty ZIP archive to which files can be added
     * @param cb The callback to call whenever data for the generated ZIP archive
     *           is available
     */
    function Zip(cb) {
        this.ondata = cb;
        this.u = [];
        this.d = 1;
    }
    /**
     * Adds a file to the ZIP archive
     * @param file The file stream to add
     */
    Zip.prototype.add = function (file) {
        var _this_1 = this;
        if (this.d & 2)
            throw 'stream finished';
        var f = strToU8(file.filename), fl = f.length;
        var com = file.comment, o = com && strToU8(com);
        var u = fl != file.filename.length || (o && (com.length != o.length));
        var hl = fl + exfl(file.extra) + 30;
        if (fl > 65535)
            throw 'filename too long';
        var header = new u8(hl);
        wzh(header, 0, file, f, u);
        var chks = [header];
        var pAll = function () {
            for (var _i = 0, chks_1 = chks; _i < chks_1.length; _i++) {
                var chk = chks_1[_i];
                _this_1.ondata(null, chk, false);
            }
            chks = [];
        };
        var tr = this.d;
        this.d = 0;
        var ind = this.u.length;
        var uf = mrg(file, {
            f: f,
            u: u,
            o: o,
            t: function () {
                if (file.terminate)
                    file.terminate();
            },
            r: function () {
                pAll();
                if (tr) {
                    var nxt = _this_1.u[ind + 1];
                    if (nxt)
                        nxt.r();
                    else
                        _this_1.d = 1;
                }
                tr = 1;
            }
        });
        var cl = 0;
        file.ondata = function (err, dat, final) {
            if (err) {
                _this_1.ondata(err, dat, final);
                _this_1.terminate();
            }
            else {
                cl += dat.length;
                chks.push(dat);
                if (final) {
                    var dd = new u8(16);
                    wbytes(dd, 0, 0x8074B50);
                    wbytes(dd, 4, file.crc);
                    wbytes(dd, 8, cl);
                    wbytes(dd, 12, file.size);
                    chks.push(dd);
                    uf.c = cl, uf.b = hl + cl + 16, uf.crc = file.crc, uf.size = file.size;
                    if (tr)
                        uf.r();
                    tr = 1;
                }
                else if (tr)
                    pAll();
            }
        };
        this.u.push(uf);
    };
    /**
     * Ends the process of adding files and prepares to emit the final chunks.
     * This *must* be called after adding all desired files for the resulting
     * ZIP file to work properly.
     */
    Zip.prototype.end = function () {
        var _this_1 = this;
        if (this.d & 2) {
            if (this.d & 1)
                throw 'stream finishing';
            throw 'stream finished';
        }
        if (this.d)
            this.e();
        else
            this.u.push({
                r: function () {
                    if (!(_this_1.d & 1))
                        return;
                    _this_1.u.splice(-1, 1);
                    _this_1.e();
                },
                t: function () { }
            });
        this.d = 3;
    };
    Zip.prototype.e = function () {
        var bt = 0, l = 0, tl = 0;
        for (var _i = 0, _a = this.u; _i < _a.length; _i++) {
            var f = _a[_i];
            tl += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0);
        }
        var out = new u8(tl + 22);
        for (var _b = 0, _c = this.u; _b < _c.length; _b++) {
            var f = _c[_b];
            wzh(out, bt, f, f.f, f.u, f.c, l, f.o);
            bt += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0), l += f.b;
        }
        wzf(out, bt, this.u.length, tl, l);
        this.ondata(null, out, true);
        this.d = 2;
    };
    /**
     * A method to terminate any internal workers used by the stream. Subsequent
     * calls to add() will fail.
     */
    Zip.prototype.terminate = function () {
        for (var _i = 0, _a = this.u; _i < _a.length; _i++) {
            var f = _a[_i];
            f.t();
        }
        this.d = 2;
    };
    return Zip;
}());

function zip(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        throw 'no callback';
    var r = {};
    fltn(data, '', r, opts);
    var k = Object.keys(r);
    var lft = k.length, o = 0, tot = 0;
    var slft = lft, files = new Array(lft);
    var term = [];
    var tAll = function () {
        for (var i = 0; i < term.length; ++i)
            term[i]();
    };
    var cbf = function () {
        var out = new u8(tot + 22), oe = o, cdl = tot - o;
        tot = 0;
        for (var i = 0; i < slft; ++i) {
            var f = files[i];
            try {
                var l = f.c.length;
                wzh(out, tot, f, f.f, f.u, l);
                var badd = 30 + f.f.length + exfl(f.extra);
                var loc = tot + badd;
                out.set(f.c, loc);
                wzh(out, o, f, f.f, f.u, l, tot, f.m), o += 16 + badd + (f.m ? f.m.length : 0), tot = loc + l;
            }
            catch (e) {
                return cb(e, null);
            }
        }
        wzf(out, o, files.length, cdl, oe);
        cb(null, out);
    };
    if (!lft)
        cbf();
    var _loop_1 = function (i) {
        var fn = k[i];
        var _a = r[fn], file = _a[0], p = _a[1];
        var c = crc(), size = file.length;
        c.p(file);
        var f = strToU8(fn), s = f.length;
        var com = p.comment, m = com && strToU8(com), ms = m && m.length;
        var exl = exfl(p.extra);
        var compression = p.level == 0 ? 0 : 8;
        var cbl = function (e, d) {
            if (e) {
                tAll();
                cb(e, null);
            }
            else {
                var l = d.length;
                files[i] = mrg(p, {
                    size: size,
                    crc: c.d(),
                    c: d,
                    f: f,
                    m: m,
                    u: s != fn.length || (m && (com.length != ms)),
                    compression: compression
                });
                o += 30 + s + exl + l;
                tot += 76 + 2 * (s + exl) + (ms || 0) + l;
                if (!--lft)
                    cbf();
            }
        };
        if (s > 65535)
            cbl('filename too long', null);
        if (!compression)
            cbl(null, file);
        else if (size < 160000) {
            try {
                cbl(null, deflateSync(file, p));
            }
            catch (e) {
                cbl(e, null);
            }
        }
        else
            term.push(deflate(file, p, cbl));
    };
    // Cannot use lft because it can decrease
    for (var i = 0; i < slft; ++i) {
        _loop_1(i);
    }
    return tAll;
}
/**
 * Synchronously creates a ZIP file. Prefer using `zip` for better performance
 * with more than one file.
 * @param data The directory structure for the ZIP archive
 * @param opts The main options, merged with per-file options
 * @returns The generated ZIP archive
 */
function zipSync(data, opts) {
    if (!opts)
        opts = {};
    var r = {};
    var files = [];
    fltn(data, '', r, opts);
    var o = 0;
    var tot = 0;
    for (var fn in r) {
        var _a = r[fn], file = _a[0], p = _a[1];
        var compression = p.level == 0 ? 0 : 8;
        var f = strToU8(fn), s = f.length;
        var com = p.comment, m = com && strToU8(com), ms = m && m.length;
        var exl = exfl(p.extra);
        if (s > 65535)
            throw 'filename too long';
        var d = compression ? deflateSync(file, p) : file, l = d.length;
        var c = crc();
        c.p(file);
        files.push(mrg(p, {
            size: file.length,
            crc: c.d(),
            c: d,
            f: f,
            m: m,
            u: s != fn.length || (m && (com.length != ms)),
            o: o,
            compression: compression
        }));
        o += 30 + s + exl + l;
        tot += 76 + 2 * (s + exl) + (ms || 0) + l;
    }
    var out = new u8(tot + 22), oe = o, cdl = tot - o;
    for (var i = 0; i < files.length; ++i) {
        var f = files[i];
        wzh(out, f.o, f, f.f, f.u, f.c.length);
        var badd = 30 + f.f.length + exfl(f.extra);
        out.set(f.c, f.o + badd);
        wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
    }
    wzf(out, o, files.length, cdl, oe);
    return out;
}
/**
 * Streaming pass-through decompression for ZIP archives
 */
var UnzipPassThrough = /*#__PURE__*/ (function () {
    function UnzipPassThrough() {
    }
    UnzipPassThrough.prototype.push = function (data, final) {
        this.ondata(null, data, final);
    };
    UnzipPassThrough.compression = 0;
    return UnzipPassThrough;
}());

/**
 * Streaming DEFLATE decompression for ZIP archives. Prefer AsyncZipInflate for
 * better performance.
 */
var UnzipInflate = /*#__PURE__*/ (function () {
    /**
     * Creates a DEFLATE decompression that can be used in ZIP archives
     */
    function UnzipInflate() {
        var _this_1 = this;
        this.i = new Inflate(function (dat, final) {
            _this_1.ondata(null, dat, final);
        });
    }
    UnzipInflate.prototype.push = function (data, final) {
        try {
            this.i.push(data, final);
        }
        catch (e) {
            this.ondata(e, data, final);
        }
    };
    UnzipInflate.compression = 8;
    return UnzipInflate;
}());

/**
 * Asynchronous streaming DEFLATE decompression for ZIP archives
 */
var AsyncUnzipInflate = /*#__PURE__*/ (function () {
    /**
     * Creates a DEFLATE decompression that can be used in ZIP archives
     */
    function AsyncUnzipInflate(_, sz) {
        var _this_1 = this;
        if (sz < 320000) {
            this.i = new Inflate(function (dat, final) {
                _this_1.ondata(null, dat, final);
            });
        }
        else {
            this.i = new AsyncInflate(function (err, dat, final) {
                _this_1.ondata(err, dat, final);
            });
            this.terminate = this.i.terminate;
        }
    }
    AsyncUnzipInflate.prototype.push = function (data, final) {
        if (this.i.terminate)
            data = slc(data, 0);
        this.i.push(data, final);
    };
    AsyncUnzipInflate.compression = 8;
    return AsyncUnzipInflate;
}());

/**
 * A ZIP archive decompression stream that emits files as they are discovered
 */
var Unzip = /*#__PURE__*/ (function () {
    /**
     * Creates a ZIP decompression stream
     * @param cb The callback to call whenever a file in the ZIP archive is found
     */
    function Unzip(cb) {
        this.onfile = cb;
        this.k = [];
        this.o = {
            0: UnzipPassThrough
        };
        this.p = et;
    }
    /**
     * Pushes a chunk to be unzipped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Unzip.prototype.push = function (chunk, final) {
        var _this_1 = this;
        if (!this.onfile)
            throw 'no callback';
        if (!this.p)
            throw 'stream finished';
        if (this.c > 0) {
            var len = Math.min(this.c, chunk.length);
            var toAdd = chunk.subarray(0, len);
            this.c -= len;
            if (this.d)
                this.d.push(toAdd, !this.c);
            else
                this.k[0].push(toAdd);
            chunk = chunk.subarray(len);
            if (chunk.length)
                return this.push(chunk, final);
        }
        else {
            var f = 0, i = 0, is = void 0, buf = void 0;
            if (!this.p.length)
                buf = chunk;
            else if (!chunk.length)
                buf = this.p;
            else {
                buf = new u8(this.p.length + chunk.length);
                buf.set(this.p), buf.set(chunk, this.p.length);
            }
            var l = buf.length, oc = this.c, add = oc && this.d;
            var _loop_2 = function () {
                var _a;
                var sig = b4(buf, i);
                if (sig == 0x4034B50) {
                    f = 1, is = i;
                    this_1.d = null;
                    this_1.c = 0;
                    var bf = b2(buf, i + 6), cmp_1 = b2(buf, i + 8), u = bf & 2048, dd = bf & 8, fnl = b2(buf, i + 26), es = b2(buf, i + 28);
                    if (l > i + 30 + fnl + es) {
                        var chks_2 = [];
                        this_1.k.unshift(chks_2);
                        f = 2;
                        var sc_1 = b4(buf, i + 18), su_1 = b4(buf, i + 22);
                        var fn_1 = strFromU8(buf.subarray(i + 30, i += 30 + fnl), !u);
                        if (sc_1 == 4294967295) {
                            _a = dd ? [-2] : z64e(buf, i), sc_1 = _a[0], su_1 = _a[1];
                        }
                        else if (dd)
                            sc_1 = -1;
                        i += es;
                        this_1.c = sc_1;
                        var d_1;
                        var file_1 = {
                            name: fn_1,
                            compression: cmp_1,
                            start: function () {
                                if (!file_1.ondata)
                                    throw 'no callback';
                                if (!sc_1)
                                    file_1.ondata(null, et, true);
                                else {
                                    var ctr = _this_1.o[cmp_1];
                                    if (!ctr)
                                        throw 'unknown compression type ' + cmp_1;
                                    d_1 = sc_1 < 0 ? new ctr(fn_1) : new ctr(fn_1, sc_1, su_1);
                                    d_1.ondata = function (err, dat, final) { file_1.ondata(err, dat, final); };
                                    for (var _i = 0, chks_3 = chks_2; _i < chks_3.length; _i++) {
                                        var dat = chks_3[_i];
                                        d_1.push(dat, false);
                                    }
                                    if (_this_1.k[0] == chks_2 && _this_1.c)
                                        _this_1.d = d_1;
                                    else
                                        d_1.push(et, true);
                                }
                            },
                            terminate: function () {
                                if (d_1 && d_1.terminate)
                                    d_1.terminate();
                            }
                        };
                        if (sc_1 >= 0)
                            file_1.size = sc_1, file_1.originalSize = su_1;
                        this_1.onfile(file_1);
                    }
                    return "break";
                }
                else if (oc) {
                    if (sig == 0x8074B50) {
                        is = i += 12 + (oc == -2 && 8), f = 3, this_1.c = 0;
                        return "break";
                    }
                    else if (sig == 0x2014B50) {
                        is = i -= 4, f = 3, this_1.c = 0;
                        return "break";
                    }
                }
            };
            var this_1 = this;
            for (; i < l - 4; ++i) {
                var state_1 = _loop_2();
                if (state_1 === "break")
                    break;
            }
            this.p = et;
            if (oc < 0) {
                var dat = f ? buf.subarray(0, is - 12 - (oc == -2 && 8) - (b4(buf, is - 16) == 0x8074B50 && 4)) : buf.subarray(0, i);
                if (add)
                    add.push(dat, !!f);
                else
                    this.k[+(f == 2)].push(dat);
            }
            if (f & 2)
                return this.push(buf.subarray(i), final);
            this.p = buf.subarray(i);
        }
        if (final) {
            if (this.c)
                throw 'invalid zip file';
            this.p = null;
        }
    };
    /**
     * Registers a decoder with the stream, allowing for files compressed with
     * the compression type provided to be expanded correctly
     * @param decoder The decoder constructor
     */
    Unzip.prototype.register = function (decoder) {
        this.o[decoder.compression] = decoder;
    };
    return Unzip;
}());

/**
 * Asynchronously decompresses a ZIP archive
 * @param data The raw compressed ZIP file
 * @param cb The callback to call with the decompressed files
 * @returns A function that can be used to immediately terminate the unzipping
 */
function unzip(data, cb) {
    if (typeof cb != 'function')
        throw 'no callback';
    var term = [];
    var tAll = function () {
        for (var i = 0; i < term.length; ++i)
            term[i]();
    };
    var files = {};
    var e = data.length - 22;
    for (; b4(data, e) != 0x6054B50; --e) {
        if (!e || data.length - e > 65558) {
            cb('invalid zip file', null);
            return;
        }
    }
    ;
    var lft = b2(data, e + 8);
    if (!lft)
        cb(null, {});
    var c = lft;
    var o = b4(data, e + 16);
    var z = o == 4294967295;
    if (z) {
        e = b4(data, e - 12);
        if (b4(data, e) != 0x6064B50) {
            cb('invalid zip file', null);
            return;
        }
        c = lft = b4(data, e + 32);
        o = b4(data, e + 48);
    }
    var _loop_3 = function (i) {
        var _a = zh(data, o, z), c_1 = _a[0], sc = _a[1], su = _a[2], fn = _a[3], no = _a[4], off = _a[5], b = slzh(data, off);
        o = no;
        var cbl = function (e, d) {
            if (e) {
                tAll();
                cb(e, null);
            }
            else {
                files[fn] = d;
                if (!--lft)
                    cb(null, files);
            }
        };
        if (!c_1)
            cbl(null, slc(data, b, b + sc));
        else if (c_1 == 8) {
            var infl = data.subarray(b, b + sc);
            if (sc < 320000) {
                try {
                    cbl(null, inflateSync(infl, new u8(su)));
                }
                catch (e) {
                    cbl(e, null);
                }
            }
            else
                term.push(inflate(infl, { size: su }, cbl));
        }
        else
            cbl('unknown compression type ' + c_1, null);
    };
    for (var i = 0; i < c; ++i) {
        _loop_3(i);
    }
    return tAll;
}
/**
 * Synchronously decompresses a ZIP archive. Prefer using `unzip` for better
 * performance with more than one file.
 * @param data The raw compressed ZIP file
 * @returns The decompressed files
 */
function unzipSync(data) {
    var files = {};
    var e = data.length - 22;
    for (; b4(data, e) != 0x6054B50; --e) {
        if (!e || data.length - e > 65558)
            throw 'invalid zip file';
    }
    ;
    var c = b2(data, e + 8);
    if (!c)
        return {};
    var o = b4(data, e + 16);
    var z = o == 4294967295;
    if (z) {
        e = b4(data, e - 12);
        if (b4(data, e) != 0x6064B50)
            throw 'invalid zip file';
        c = b4(data, e + 32);
        o = b4(data, e + 48);
    }
    for (var i = 0; i < c; ++i) {
        var _a = zh(data, o, z), c_2 = _a[0], sc = _a[1], su = _a[2], fn = _a[3], no = _a[4], off = _a[5], b = slzh(data, off);
        o = no;
        if (!c_2)
            files[fn] = slc(data, b, b + sc);
        else if (c_2 == 8)
            files[fn] = inflateSync(data.subarray(b, b + sc), new u8(su));
        else
            throw 'unknown compression type ' + c_2;
    }
    return files;
}


/***/ }),

/***/ "./node_modules/three/examples/jsm/loaders/FBXLoader.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/loaders/FBXLoader.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FBXLoader": () => (/* binding */ FBXLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var _libs_fflate_module_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../libs/fflate.module.js */ "./node_modules/three/examples/jsm/libs/fflate.module.js");
/* harmony import */ var _curves_NURBSCurve_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../curves/NURBSCurve.js */ "./node_modules/three/examples/jsm/curves/NURBSCurve.js");




/**
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
 * Versions lower than this may load but will probably have errors
 *
 * Needs Support:
 *  Morph normals / blend shape normals
 *
 * FBX format references:
 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 * 	http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
 *
 * 	Binary format specification:
 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 */


let fbxTree;
let connections;
let sceneGraph;

class FBXLoader extends three__WEBPACK_IMPORTED_MODULE_2__.Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( scope.path === '' ) ? three__WEBPACK_IMPORTED_MODULE_2__.LoaderUtils.extractUrlBase( url ) : scope.path;

		const loader = new three__WEBPACK_IMPORTED_MODULE_2__.FileLoader( this.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );

		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( FBXBuffer, path ) {

		if ( isFbxFormatBinary( FBXBuffer ) ) {

			fbxTree = new BinaryParser().parse( FBXBuffer );

		} else {

			const FBXText = convertArrayBufferToString( FBXBuffer );

			if ( ! isFbxFormatASCII( FBXText ) ) {

				throw new Error( 'THREE.FBXLoader: Unknown format.' );

			}

			if ( getFbxVersion( FBXText ) < 7000 ) {

				throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) );

			}

			fbxTree = new TextParser().parse( FBXText );

		}

		// console.log( fbxTree );

		const textureLoader = new three__WEBPACK_IMPORTED_MODULE_2__.TextureLoader( this.manager ).setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		return new FBXTreeParser( textureLoader, this.manager ).parse( fbxTree );

	}

}

// Parse the FBXTree object returned by the BinaryParser or TextParser and return a Group
class FBXTreeParser {

	constructor( textureLoader, manager ) {

		this.textureLoader = textureLoader;
		this.manager = manager;

	}

	parse() {

		connections = this.parseConnections();

		const images = this.parseImages();
		const textures = this.parseTextures( images );
		const materials = this.parseMaterials( textures );
		const deformers = this.parseDeformers();
		const geometryMap = new GeometryParser().parse( deformers );

		this.parseScene( deformers, geometryMap, materials );

		return sceneGraph;

	}

	// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
	// and details the connection type
	parseConnections() {

		const connectionMap = new Map();

		if ( 'Connections' in fbxTree ) {

			const rawConnections = fbxTree.Connections.connections;

			rawConnections.forEach( function ( rawConnection ) {

				const fromID = rawConnection[ 0 ];
				const toID = rawConnection[ 1 ];
				const relationship = rawConnection[ 2 ];

				if ( ! connectionMap.has( fromID ) ) {

					connectionMap.set( fromID, {
						parents: [],
						children: []
					} );

				}

				const parentRelationship = { ID: toID, relationship: relationship };
				connectionMap.get( fromID ).parents.push( parentRelationship );

				if ( ! connectionMap.has( toID ) ) {

					connectionMap.set( toID, {
						parents: [],
						children: []
					} );

				}

				const childRelationship = { ID: fromID, relationship: relationship };
				connectionMap.get( toID ).children.push( childRelationship );

			} );

		}

		return connectionMap;

	}

	// Parse FBXTree.Objects.Video for embedded image data
	// These images are connected to textures in FBXTree.Objects.Textures
	// via FBXTree.Connections.
	parseImages() {

		const images = {};
		const blobs = {};

		if ( 'Video' in fbxTree.Objects ) {

			const videoNodes = fbxTree.Objects.Video;

			for ( const nodeID in videoNodes ) {

				const videoNode = videoNodes[ nodeID ];

				const id = parseInt( nodeID );

				images[ id ] = videoNode.RelativeFilename || videoNode.Filename;

				// raw image data is in videoNode.Content
				if ( 'Content' in videoNode ) {

					const arrayBufferContent = ( videoNode.Content instanceof ArrayBuffer ) && ( videoNode.Content.byteLength > 0 );
					const base64Content = ( typeof videoNode.Content === 'string' ) && ( videoNode.Content !== '' );

					if ( arrayBufferContent || base64Content ) {

						const image = this.parseImage( videoNodes[ nodeID ] );

						blobs[ videoNode.RelativeFilename || videoNode.Filename ] = image;

					}

				}

			}

		}

		for ( const id in images ) {

			const filename = images[ id ];

			if ( blobs[ filename ] !== undefined ) images[ id ] = blobs[ filename ];
			else images[ id ] = images[ id ].split( '\\' ).pop();

		}

		return images;

	}

	// Parse embedded image data in FBXTree.Video.Content
	parseImage( videoNode ) {

		const content = videoNode.Content;
		const fileName = videoNode.RelativeFilename || videoNode.Filename;
		const extension = fileName.slice( fileName.lastIndexOf( '.' ) + 1 ).toLowerCase();

		let type;

		switch ( extension ) {

			case 'bmp':

				type = 'image/bmp';
				break;

			case 'jpg':
			case 'jpeg':

				type = 'image/jpeg';
				break;

			case 'png':

				type = 'image/png';
				break;

			case 'tif':

				type = 'image/tiff';
				break;

			case 'tga':

				if ( this.manager.getHandler( '.tga' ) === null ) {

					console.warn( 'FBXLoader: TGA loader not found, skipping ', fileName );

				}

				type = 'image/tga';
				break;

			default:

				console.warn( 'FBXLoader: Image type "' + extension + '" is not supported.' );
				return;

		}

		if ( typeof content === 'string' ) { // ASCII format

			return 'data:' + type + ';base64,' + content;

		} else { // Binary Format

			const array = new Uint8Array( content );
			return window.URL.createObjectURL( new Blob( [ array ], { type: type } ) );

		}

	}

	// Parse nodes in FBXTree.Objects.Texture
	// These contain details such as UV scaling, cropping, rotation etc and are connected
	// to images in FBXTree.Objects.Video
	parseTextures( images ) {

		const textureMap = new Map();

		if ( 'Texture' in fbxTree.Objects ) {

			const textureNodes = fbxTree.Objects.Texture;
			for ( const nodeID in textureNodes ) {

				const texture = this.parseTexture( textureNodes[ nodeID ], images );
				textureMap.set( parseInt( nodeID ), texture );

			}

		}

		return textureMap;

	}

	// Parse individual node in FBXTree.Objects.Texture
	parseTexture( textureNode, images ) {

		const texture = this.loadTexture( textureNode, images );

		texture.ID = textureNode.id;

		texture.name = textureNode.attrName;

		const wrapModeU = textureNode.WrapModeU;
		const wrapModeV = textureNode.WrapModeV;

		const valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
		const valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

		// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
		// 0: repeat(default), 1: clamp

		texture.wrapS = valueU === 0 ? three__WEBPACK_IMPORTED_MODULE_2__.RepeatWrapping : three__WEBPACK_IMPORTED_MODULE_2__.ClampToEdgeWrapping;
		texture.wrapT = valueV === 0 ? three__WEBPACK_IMPORTED_MODULE_2__.RepeatWrapping : three__WEBPACK_IMPORTED_MODULE_2__.ClampToEdgeWrapping;

		if ( 'Scaling' in textureNode ) {

			const values = textureNode.Scaling.value;

			texture.repeat.x = values[ 0 ];
			texture.repeat.y = values[ 1 ];

		}

		return texture;

	}

	// load a texture specified as a blob or data URI, or via an external URL using TextureLoader
	loadTexture( textureNode, images ) {

		let fileName;

		const currentPath = this.textureLoader.path;

		const children = connections.get( textureNode.id ).children;

		if ( children !== undefined && children.length > 0 && images[ children[ 0 ].ID ] !== undefined ) {

			fileName = images[ children[ 0 ].ID ];

			if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

				this.textureLoader.setPath( undefined );

			}

		}

		let texture;

		const extension = textureNode.FileName.slice( - 3 ).toLowerCase();

		if ( extension === 'tga' ) {

			const loader = this.manager.getHandler( '.tga' );

			if ( loader === null ) {

				console.warn( 'FBXLoader: TGA loader not found, creating placeholder texture for', textureNode.RelativeFilename );
				texture = new three__WEBPACK_IMPORTED_MODULE_2__.Texture();

			} else {

				loader.setPath( this.textureLoader.path );
				texture = loader.load( fileName );

			}

		} else if ( extension === 'psd' ) {

			console.warn( 'FBXLoader: PSD textures are not supported, creating placeholder texture for', textureNode.RelativeFilename );
			texture = new three__WEBPACK_IMPORTED_MODULE_2__.Texture();

		} else {

			texture = this.textureLoader.load( fileName );

		}

		this.textureLoader.setPath( currentPath );

		return texture;

	}

	// Parse nodes in FBXTree.Objects.Material
	parseMaterials( textureMap ) {

		const materialMap = new Map();

		if ( 'Material' in fbxTree.Objects ) {

			const materialNodes = fbxTree.Objects.Material;

			for ( const nodeID in materialNodes ) {

				const material = this.parseMaterial( materialNodes[ nodeID ], textureMap );

				if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

			}

		}

		return materialMap;

	}

	// Parse single node in FBXTree.Objects.Material
	// Materials are connected to texture maps in FBXTree.Objects.Textures
	// FBX format currently only supports Lambert and Phong shading models
	parseMaterial( materialNode, textureMap ) {

		const ID = materialNode.id;
		const name = materialNode.attrName;
		let type = materialNode.ShadingModel;

		// Case where FBX wraps shading model in property object.
		if ( typeof type === 'object' ) {

			type = type.value;

		}

		// Ignore unused materials which don't have any connections.
		if ( ! connections.has( ID ) ) return null;

		const parameters = this.parseParameters( materialNode, textureMap, ID );

		let material;

		switch ( type.toLowerCase() ) {

			case 'phong':
				material = new three__WEBPACK_IMPORTED_MODULE_2__.MeshPhongMaterial();
				break;
			case 'lambert':
				material = new three__WEBPACK_IMPORTED_MODULE_2__.MeshLambertMaterial();
				break;
			default:
				console.warn( 'THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type );
				material = new three__WEBPACK_IMPORTED_MODULE_2__.MeshPhongMaterial();
				break;

		}

		material.setValues( parameters );
		material.name = name;

		return material;

	}

	// Parse FBX material and return parameters suitable for a three.js material
	// Also parse the texture map and return any textures associated with the material
	parseParameters( materialNode, textureMap, ID ) {

		const parameters = {};

		if ( materialNode.BumpFactor ) {

			parameters.bumpScale = materialNode.BumpFactor.value;

		}

		if ( materialNode.Diffuse ) {

			parameters.color = new three__WEBPACK_IMPORTED_MODULE_2__.Color().fromArray( materialNode.Diffuse.value );

		} else if ( materialNode.DiffuseColor && ( materialNode.DiffuseColor.type === 'Color' || materialNode.DiffuseColor.type === 'ColorRGB' ) ) {

			// The blender exporter exports diffuse here instead of in materialNode.Diffuse
			parameters.color = new three__WEBPACK_IMPORTED_MODULE_2__.Color().fromArray( materialNode.DiffuseColor.value );

		}

		if ( materialNode.DisplacementFactor ) {

			parameters.displacementScale = materialNode.DisplacementFactor.value;

		}

		if ( materialNode.Emissive ) {

			parameters.emissive = new three__WEBPACK_IMPORTED_MODULE_2__.Color().fromArray( materialNode.Emissive.value );

		} else if ( materialNode.EmissiveColor && ( materialNode.EmissiveColor.type === 'Color' || materialNode.EmissiveColor.type === 'ColorRGB' ) ) {

			// The blender exporter exports emissive color here instead of in materialNode.Emissive
			parameters.emissive = new three__WEBPACK_IMPORTED_MODULE_2__.Color().fromArray( materialNode.EmissiveColor.value );

		}

		if ( materialNode.EmissiveFactor ) {

			parameters.emissiveIntensity = parseFloat( materialNode.EmissiveFactor.value );

		}

		if ( materialNode.Opacity ) {

			parameters.opacity = parseFloat( materialNode.Opacity.value );

		}

		if ( parameters.opacity < 1.0 ) {

			parameters.transparent = true;

		}

		if ( materialNode.ReflectionFactor ) {

			parameters.reflectivity = materialNode.ReflectionFactor.value;

		}

		if ( materialNode.Shininess ) {

			parameters.shininess = materialNode.Shininess.value;

		}

		if ( materialNode.Specular ) {

			parameters.specular = new three__WEBPACK_IMPORTED_MODULE_2__.Color().fromArray( materialNode.Specular.value );

		} else if ( materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color' ) {

			// The blender exporter exports specular color here instead of in materialNode.Specular
			parameters.specular = new three__WEBPACK_IMPORTED_MODULE_2__.Color().fromArray( materialNode.SpecularColor.value );

		}

		const scope = this;
		connections.get( ID ).children.forEach( function ( child ) {

			const type = child.relationship;

			switch ( type ) {

				case 'Bump':
					parameters.bumpMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'Maya|TEX_ao_map':
					parameters.aoMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'DiffuseColor':
				case 'Maya|TEX_color_map':
					parameters.map = scope.getTexture( textureMap, child.ID );
					if ( parameters.map !== undefined ) {

						parameters.map.encoding = three__WEBPACK_IMPORTED_MODULE_2__.sRGBEncoding;

					}

					break;

				case 'DisplacementColor':
					parameters.displacementMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'EmissiveColor':
					parameters.emissiveMap = scope.getTexture( textureMap, child.ID );
					if ( parameters.emissiveMap !== undefined ) {

						parameters.emissiveMap.encoding = three__WEBPACK_IMPORTED_MODULE_2__.sRGBEncoding;

					}

					break;

				case 'NormalMap':
				case 'Maya|TEX_normal_map':
					parameters.normalMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'ReflectionColor':
					parameters.envMap = scope.getTexture( textureMap, child.ID );
					if ( parameters.envMap !== undefined ) {

						parameters.envMap.mapping = three__WEBPACK_IMPORTED_MODULE_2__.EquirectangularReflectionMapping;
						parameters.envMap.encoding = three__WEBPACK_IMPORTED_MODULE_2__.sRGBEncoding;

					}

					break;

				case 'SpecularColor':
					parameters.specularMap = scope.getTexture( textureMap, child.ID );
					if ( parameters.specularMap !== undefined ) {

						parameters.specularMap.encoding = three__WEBPACK_IMPORTED_MODULE_2__.sRGBEncoding;

					}

					break;

				case 'TransparentColor':
				case 'TransparencyFactor':
					parameters.alphaMap = scope.getTexture( textureMap, child.ID );
					parameters.transparent = true;
					break;

				case 'AmbientColor':
				case 'ShininessExponent': // AKA glossiness map
				case 'SpecularFactor': // AKA specularLevel
				case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
				default:
					console.warn( 'THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type );
					break;

			}

		} );

		return parameters;

	}

	// get a texture from the textureMap for use by a material.
	getTexture( textureMap, id ) {

		// if the texture is a layered texture, just use the first layer and issue a warning
		if ( 'LayeredTexture' in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture ) {

			console.warn( 'THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.' );
			id = connections.get( id ).children[ 0 ].ID;

		}

		return textureMap.get( id );

	}

	// Parse nodes in FBXTree.Objects.Deformer
	// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
	// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
	parseDeformers() {

		const skeletons = {};
		const morphTargets = {};

		if ( 'Deformer' in fbxTree.Objects ) {

			const DeformerNodes = fbxTree.Objects.Deformer;

			for ( const nodeID in DeformerNodes ) {

				const deformerNode = DeformerNodes[ nodeID ];

				const relationships = connections.get( parseInt( nodeID ) );

				if ( deformerNode.attrType === 'Skin' ) {

					const skeleton = this.parseSkeleton( relationships, DeformerNodes );
					skeleton.ID = nodeID;

					if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: skeleton attached to more than one geometry is not supported.' );
					skeleton.geometryID = relationships.parents[ 0 ].ID;

					skeletons[ nodeID ] = skeleton;

				} else if ( deformerNode.attrType === 'BlendShape' ) {

					const morphTarget = {
						id: nodeID,
					};

					morphTarget.rawTargets = this.parseMorphTargets( relationships, DeformerNodes );
					morphTarget.id = nodeID;

					if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: morph target attached to more than one geometry is not supported.' );

					morphTargets[ nodeID ] = morphTarget;

				}

			}

		}

		return {

			skeletons: skeletons,
			morphTargets: morphTargets,

		};

	}

	// Parse single nodes in FBXTree.Objects.Deformer
	// The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
	// Each skin node represents a skeleton and each cluster node represents a bone
	parseSkeleton( relationships, deformerNodes ) {

		const rawBones = [];

		relationships.children.forEach( function ( child ) {

			const boneNode = deformerNodes[ child.ID ];

			if ( boneNode.attrType !== 'Cluster' ) return;

			const rawBone = {

				ID: child.ID,
				indices: [],
				weights: [],
				transformLink: new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4().fromArray( boneNode.TransformLink.a ),
				// transform: new Matrix4().fromArray( boneNode.Transform.a ),
				// linkMode: boneNode.Mode,

			};

			if ( 'Indexes' in boneNode ) {

				rawBone.indices = boneNode.Indexes.a;
				rawBone.weights = boneNode.Weights.a;

			}

			rawBones.push( rawBone );

		} );

		return {

			rawBones: rawBones,
			bones: []

		};

	}

	// The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
	parseMorphTargets( relationships, deformerNodes ) {

		const rawMorphTargets = [];

		for ( let i = 0; i < relationships.children.length; i ++ ) {

			const child = relationships.children[ i ];

			const morphTargetNode = deformerNodes[ child.ID ];

			const rawMorphTarget = {

				name: morphTargetNode.attrName,
				initialWeight: morphTargetNode.DeformPercent,
				id: morphTargetNode.id,
				fullWeights: morphTargetNode.FullWeights.a

			};

			if ( morphTargetNode.attrType !== 'BlendShapeChannel' ) return;

			rawMorphTarget.geoID = connections.get( parseInt( child.ID ) ).children.filter( function ( child ) {

				return child.relationship === undefined;

			} )[ 0 ].ID;

			rawMorphTargets.push( rawMorphTarget );

		}

		return rawMorphTargets;

	}

	// create the main Group() to be returned by the loader
	parseScene( deformers, geometryMap, materialMap ) {

		sceneGraph = new three__WEBPACK_IMPORTED_MODULE_2__.Group();

		const modelMap = this.parseModels( deformers.skeletons, geometryMap, materialMap );

		const modelNodes = fbxTree.Objects.Model;

		const scope = this;
		modelMap.forEach( function ( model ) {

			const modelNode = modelNodes[ model.ID ];
			scope.setLookAtProperties( model, modelNode );

			const parentConnections = connections.get( model.ID ).parents;

			parentConnections.forEach( function ( connection ) {

				const parent = modelMap.get( connection.ID );
				if ( parent !== undefined ) parent.add( model );

			} );

			if ( model.parent === null ) {

				sceneGraph.add( model );

			}


		} );

		this.bindSkeleton( deformers.skeletons, geometryMap, modelMap );

		this.createAmbientLight();

		sceneGraph.traverse( function ( node ) {

			if ( node.userData.transformData ) {

				if ( node.parent ) {

					node.userData.transformData.parentMatrix = node.parent.matrix;
					node.userData.transformData.parentMatrixWorld = node.parent.matrixWorld;

				}

				const transform = generateTransform( node.userData.transformData );

				node.applyMatrix4( transform );
				node.updateWorldMatrix();

			}

		} );

		const animations = new AnimationParser().parse();

		// if all the models where already combined in a single group, just return that
		if ( sceneGraph.children.length === 1 && sceneGraph.children[ 0 ].isGroup ) {

			sceneGraph.children[ 0 ].animations = animations;
			sceneGraph = sceneGraph.children[ 0 ];

		}

		sceneGraph.animations = animations;

	}

	// parse nodes in FBXTree.Objects.Model
	parseModels( skeletons, geometryMap, materialMap ) {

		const modelMap = new Map();
		const modelNodes = fbxTree.Objects.Model;

		for ( const nodeID in modelNodes ) {

			const id = parseInt( nodeID );
			const node = modelNodes[ nodeID ];
			const relationships = connections.get( id );

			let model = this.buildSkeleton( relationships, skeletons, id, node.attrName );

			if ( ! model ) {

				switch ( node.attrType ) {

					case 'Camera':
						model = this.createCamera( relationships );
						break;
					case 'Light':
						model = this.createLight( relationships );
						break;
					case 'Mesh':
						model = this.createMesh( relationships, geometryMap, materialMap );
						break;
					case 'NurbsCurve':
						model = this.createCurve( relationships, geometryMap );
						break;
					case 'LimbNode':
					case 'Root':
						model = new three__WEBPACK_IMPORTED_MODULE_2__.Bone();
						break;
					case 'Null':
					default:
						model = new three__WEBPACK_IMPORTED_MODULE_2__.Group();
						break;

				}

				model.name = node.attrName ? three__WEBPACK_IMPORTED_MODULE_2__.PropertyBinding.sanitizeNodeName( node.attrName ) : '';

				model.ID = id;

			}

			this.getTransformData( model, node );
			modelMap.set( id, model );

		}

		return modelMap;

	}

	buildSkeleton( relationships, skeletons, id, name ) {

		let bone = null;

		relationships.parents.forEach( function ( parent ) {

			for ( const ID in skeletons ) {

				const skeleton = skeletons[ ID ];

				skeleton.rawBones.forEach( function ( rawBone, i ) {

					if ( rawBone.ID === parent.ID ) {

						const subBone = bone;
						bone = new three__WEBPACK_IMPORTED_MODULE_2__.Bone();

						bone.matrixWorld.copy( rawBone.transformLink );

						// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id

						bone.name = name ? three__WEBPACK_IMPORTED_MODULE_2__.PropertyBinding.sanitizeNodeName( name ) : '';
						bone.ID = id;

						skeleton.bones[ i ] = bone;

						// In cases where a bone is shared between multiple meshes
						// duplicate the bone here and and it as a child of the first bone
						if ( subBone !== null ) {

							bone.add( subBone );

						}

					}

				} );

			}

		} );

		return bone;

	}

	// create a PerspectiveCamera or OrthographicCamera
	createCamera( relationships ) {

		let model;
		let cameraAttribute;

		relationships.children.forEach( function ( child ) {

			const attr = fbxTree.Objects.NodeAttribute[ child.ID ];

			if ( attr !== undefined ) {

				cameraAttribute = attr;

			}

		} );

		if ( cameraAttribute === undefined ) {

			model = new three__WEBPACK_IMPORTED_MODULE_2__.Object3D();

		} else {

			let type = 0;
			if ( cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1 ) {

				type = 1;

			}

			let nearClippingPlane = 1;
			if ( cameraAttribute.NearPlane !== undefined ) {

				nearClippingPlane = cameraAttribute.NearPlane.value / 1000;

			}

			let farClippingPlane = 1000;
			if ( cameraAttribute.FarPlane !== undefined ) {

				farClippingPlane = cameraAttribute.FarPlane.value / 1000;

			}


			let width = window.innerWidth;
			let height = window.innerHeight;

			if ( cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined ) {

				width = cameraAttribute.AspectWidth.value;
				height = cameraAttribute.AspectHeight.value;

			}

			const aspect = width / height;

			let fov = 45;
			if ( cameraAttribute.FieldOfView !== undefined ) {

				fov = cameraAttribute.FieldOfView.value;

			}

			const focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

			switch ( type ) {

				case 0: // Perspective
					model = new three__WEBPACK_IMPORTED_MODULE_2__.PerspectiveCamera( fov, aspect, nearClippingPlane, farClippingPlane );
					if ( focalLength !== null ) model.setFocalLength( focalLength );
					break;

				case 1: // Orthographic
					model = new three__WEBPACK_IMPORTED_MODULE_2__.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, nearClippingPlane, farClippingPlane );
					break;

				default:
					console.warn( 'THREE.FBXLoader: Unknown camera type ' + type + '.' );
					model = new three__WEBPACK_IMPORTED_MODULE_2__.Object3D();
					break;

			}

		}

		return model;

	}

	// Create a DirectionalLight, PointLight or SpotLight
	createLight( relationships ) {

		let model;
		let lightAttribute;

		relationships.children.forEach( function ( child ) {

			const attr = fbxTree.Objects.NodeAttribute[ child.ID ];

			if ( attr !== undefined ) {

				lightAttribute = attr;

			}

		} );

		if ( lightAttribute === undefined ) {

			model = new three__WEBPACK_IMPORTED_MODULE_2__.Object3D();

		} else {

			let type;

			// LightType can be undefined for Point lights
			if ( lightAttribute.LightType === undefined ) {

				type = 0;

			} else {

				type = lightAttribute.LightType.value;

			}

			let color = 0xffffff;

			if ( lightAttribute.Color !== undefined ) {

				color = new three__WEBPACK_IMPORTED_MODULE_2__.Color().fromArray( lightAttribute.Color.value );

			}

			let intensity = ( lightAttribute.Intensity === undefined ) ? 1 : lightAttribute.Intensity.value / 100;

			// light disabled
			if ( lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0 ) {

				intensity = 0;

			}

			let distance = 0;
			if ( lightAttribute.FarAttenuationEnd !== undefined ) {

				if ( lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0 ) {

					distance = 0;

				} else {

					distance = lightAttribute.FarAttenuationEnd.value;

				}

			}

			// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
			const decay = 1;

			switch ( type ) {

				case 0: // Point
					model = new three__WEBPACK_IMPORTED_MODULE_2__.PointLight( color, intensity, distance, decay );
					break;

				case 1: // Directional
					model = new three__WEBPACK_IMPORTED_MODULE_2__.DirectionalLight( color, intensity );
					break;

				case 2: // Spot
					let angle = Math.PI / 3;

					if ( lightAttribute.InnerAngle !== undefined ) {

						angle = three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad( lightAttribute.InnerAngle.value );

					}

					let penumbra = 0;
					if ( lightAttribute.OuterAngle !== undefined ) {

						// TODO: this is not correct - FBX calculates outer and inner angle in degrees
						// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
						// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
						penumbra = three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad( lightAttribute.OuterAngle.value );
						penumbra = Math.max( penumbra, 1 );

					}

					model = new three__WEBPACK_IMPORTED_MODULE_2__.SpotLight( color, intensity, distance, angle, penumbra, decay );
					break;

				default:
					console.warn( 'THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a PointLight.' );
					model = new three__WEBPACK_IMPORTED_MODULE_2__.PointLight( color, intensity );
					break;

			}

			if ( lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1 ) {

				model.castShadow = true;

			}

		}

		return model;

	}

	createMesh( relationships, geometryMap, materialMap ) {

		let model;
		let geometry = null;
		let material = null;
		const materials = [];

		// get geometry and materials(s) from connections
		relationships.children.forEach( function ( child ) {

			if ( geometryMap.has( child.ID ) ) {

				geometry = geometryMap.get( child.ID );

			}

			if ( materialMap.has( child.ID ) ) {

				materials.push( materialMap.get( child.ID ) );

			}

		} );

		if ( materials.length > 1 ) {

			material = materials;

		} else if ( materials.length > 0 ) {

			material = materials[ 0 ];

		} else {

			material = new three__WEBPACK_IMPORTED_MODULE_2__.MeshPhongMaterial( { color: 0xcccccc } );
			materials.push( material );

		}

		if ( 'color' in geometry.attributes ) {

			materials.forEach( function ( material ) {

				material.vertexColors = true;

			} );

		}

		if ( geometry.FBX_Deformer ) {

			model = new three__WEBPACK_IMPORTED_MODULE_2__.SkinnedMesh( geometry, material );
			model.normalizeSkinWeights();

		} else {

			model = new three__WEBPACK_IMPORTED_MODULE_2__.Mesh( geometry, material );

		}

		return model;

	}

	createCurve( relationships, geometryMap ) {

		const geometry = relationships.children.reduce( function ( geo, child ) {

			if ( geometryMap.has( child.ID ) ) geo = geometryMap.get( child.ID );

			return geo;

		}, null );

		// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
		const material = new three__WEBPACK_IMPORTED_MODULE_2__.LineBasicMaterial( { color: 0x3300ff, linewidth: 1 } );
		return new three__WEBPACK_IMPORTED_MODULE_2__.Line( geometry, material );

	}

	// parse the model node for transform data
	getTransformData( model, modelNode ) {

		const transformData = {};

		if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

		if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
		else transformData.eulerOrder = 'ZYX';

		if ( 'Lcl_Translation' in modelNode ) transformData.translation = modelNode.Lcl_Translation.value;

		if ( 'PreRotation' in modelNode ) transformData.preRotation = modelNode.PreRotation.value;
		if ( 'Lcl_Rotation' in modelNode ) transformData.rotation = modelNode.Lcl_Rotation.value;
		if ( 'PostRotation' in modelNode ) transformData.postRotation = modelNode.PostRotation.value;

		if ( 'Lcl_Scaling' in modelNode ) transformData.scale = modelNode.Lcl_Scaling.value;

		if ( 'ScalingOffset' in modelNode ) transformData.scalingOffset = modelNode.ScalingOffset.value;
		if ( 'ScalingPivot' in modelNode ) transformData.scalingPivot = modelNode.ScalingPivot.value;

		if ( 'RotationOffset' in modelNode ) transformData.rotationOffset = modelNode.RotationOffset.value;
		if ( 'RotationPivot' in modelNode ) transformData.rotationPivot = modelNode.RotationPivot.value;

		model.userData.transformData = transformData;

	}

	setLookAtProperties( model, modelNode ) {

		if ( 'LookAtProperty' in modelNode ) {

			const children = connections.get( model.ID ).children;

			children.forEach( function ( child ) {

				if ( child.relationship === 'LookAtProperty' ) {

					const lookAtTarget = fbxTree.Objects.Model[ child.ID ];

					if ( 'Lcl_Translation' in lookAtTarget ) {

						const pos = lookAtTarget.Lcl_Translation.value;

						// DirectionalLight, SpotLight
						if ( model.target !== undefined ) {

							model.target.position.fromArray( pos );
							sceneGraph.add( model.target );

						} else { // Cameras and other Object3Ds

							model.lookAt( new three__WEBPACK_IMPORTED_MODULE_2__.Vector3().fromArray( pos ) );

						}

					}

				}

			} );

		}

	}

	bindSkeleton( skeletons, geometryMap, modelMap ) {

		const bindMatrices = this.parsePoseNodes();

		for ( const ID in skeletons ) {

			const skeleton = skeletons[ ID ];

			const parents = connections.get( parseInt( skeleton.ID ) ).parents;

			parents.forEach( function ( parent ) {

				if ( geometryMap.has( parent.ID ) ) {

					const geoID = parent.ID;
					const geoRelationships = connections.get( geoID );

					geoRelationships.parents.forEach( function ( geoConnParent ) {

						if ( modelMap.has( geoConnParent.ID ) ) {

							const model = modelMap.get( geoConnParent.ID );

							model.bind( new three__WEBPACK_IMPORTED_MODULE_2__.Skeleton( skeleton.bones ), bindMatrices[ geoConnParent.ID ] );

						}

					} );

				}

			} );

		}

	}

	parsePoseNodes() {

		const bindMatrices = {};

		if ( 'Pose' in fbxTree.Objects ) {

			const BindPoseNode = fbxTree.Objects.Pose;

			for ( const nodeID in BindPoseNode ) {

				if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

					const poseNodes = BindPoseNode[ nodeID ].PoseNode;

					if ( Array.isArray( poseNodes ) ) {

						poseNodes.forEach( function ( poseNode ) {

							bindMatrices[ poseNode.Node ] = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4().fromArray( poseNode.Matrix.a );

						} );

					} else {

						bindMatrices[ poseNodes.Node ] = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4().fromArray( poseNodes.Matrix.a );

					}

				}

			}

		}

		return bindMatrices;

	}

	// Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
	createAmbientLight() {

		if ( 'GlobalSettings' in fbxTree && 'AmbientColor' in fbxTree.GlobalSettings ) {

			const ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
			const r = ambientColor[ 0 ];
			const g = ambientColor[ 1 ];
			const b = ambientColor[ 2 ];

			if ( r !== 0 || g !== 0 || b !== 0 ) {

				const color = new three__WEBPACK_IMPORTED_MODULE_2__.Color( r, g, b );
				sceneGraph.add( new three__WEBPACK_IMPORTED_MODULE_2__.AmbientLight( color, 1 ) );

			}

		}

	}

}

// parse Geometry data from FBXTree and return map of BufferGeometries
class GeometryParser {

	// Parse nodes in FBXTree.Objects.Geometry
	parse( deformers ) {

		const geometryMap = new Map();

		if ( 'Geometry' in fbxTree.Objects ) {

			const geoNodes = fbxTree.Objects.Geometry;

			for ( const nodeID in geoNodes ) {

				const relationships = connections.get( parseInt( nodeID ) );
				const geo = this.parseGeometry( relationships, geoNodes[ nodeID ], deformers );

				geometryMap.set( parseInt( nodeID ), geo );

			}

		}

		return geometryMap;

	}

	// Parse single node in FBXTree.Objects.Geometry
	parseGeometry( relationships, geoNode, deformers ) {

		switch ( geoNode.attrType ) {

			case 'Mesh':
				return this.parseMeshGeometry( relationships, geoNode, deformers );
				break;

			case 'NurbsCurve':
				return this.parseNurbsGeometry( geoNode );
				break;

		}

	}

	// Parse single node mesh geometry in FBXTree.Objects.Geometry
	parseMeshGeometry( relationships, geoNode, deformers ) {

		const skeletons = deformers.skeletons;
		const morphTargets = [];

		const modelNodes = relationships.parents.map( function ( parent ) {

			return fbxTree.Objects.Model[ parent.ID ];

		} );

		// don't create geometry if it is not associated with any models
		if ( modelNodes.length === 0 ) return;

		const skeleton = relationships.children.reduce( function ( skeleton, child ) {

			if ( skeletons[ child.ID ] !== undefined ) skeleton = skeletons[ child.ID ];

			return skeleton;

		}, null );

		relationships.children.forEach( function ( child ) {

			if ( deformers.morphTargets[ child.ID ] !== undefined ) {

				morphTargets.push( deformers.morphTargets[ child.ID ] );

			}

		} );

		// Assume one model and get the preRotation from that
		// if there is more than one model associated with the geometry this may cause problems
		const modelNode = modelNodes[ 0 ];

		const transformData = {};

		if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
		if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

		if ( 'GeometricTranslation' in modelNode ) transformData.translation = modelNode.GeometricTranslation.value;
		if ( 'GeometricRotation' in modelNode ) transformData.rotation = modelNode.GeometricRotation.value;
		if ( 'GeometricScaling' in modelNode ) transformData.scale = modelNode.GeometricScaling.value;

		const transform = generateTransform( transformData );

		return this.genGeometry( geoNode, skeleton, morphTargets, transform );

	}

	// Generate a BufferGeometry from a node in FBXTree.Objects.Geometry
	genGeometry( geoNode, skeleton, morphTargets, preTransform ) {

		const geo = new three__WEBPACK_IMPORTED_MODULE_2__.BufferGeometry();
		if ( geoNode.attrName ) geo.name = geoNode.attrName;

		const geoInfo = this.parseGeoNode( geoNode, skeleton );
		const buffers = this.genBuffers( geoInfo );

		const positionAttribute = new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute( buffers.vertex, 3 );

		positionAttribute.applyMatrix4( preTransform );

		geo.setAttribute( 'position', positionAttribute );

		if ( buffers.colors.length > 0 ) {

			geo.setAttribute( 'color', new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute( buffers.colors, 3 ) );

		}

		if ( skeleton ) {

			geo.setAttribute( 'skinIndex', new three__WEBPACK_IMPORTED_MODULE_2__.Uint16BufferAttribute( buffers.weightsIndices, 4 ) );

			geo.setAttribute( 'skinWeight', new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute( buffers.vertexWeights, 4 ) );

			// used later to bind the skeleton to the model
			geo.FBX_Deformer = skeleton;

		}

		if ( buffers.normal.length > 0 ) {

			const normalMatrix = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix3().getNormalMatrix( preTransform );

			const normalAttribute = new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute( buffers.normal, 3 );
			normalAttribute.applyNormalMatrix( normalMatrix );

			geo.setAttribute( 'normal', normalAttribute );

		}

		buffers.uvs.forEach( function ( uvBuffer, i ) {

			// subsequent uv buffers are called 'uv1', 'uv2', ...
			let name = 'uv' + ( i + 1 ).toString();

			// the first uv buffer is just called 'uv'
			if ( i === 0 ) {

				name = 'uv';

			}

			geo.setAttribute( name, new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute( buffers.uvs[ i ], 2 ) );

		} );

		if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

			// Convert the material indices of each vertex into rendering groups on the geometry.
			let prevMaterialIndex = buffers.materialIndex[ 0 ];
			let startIndex = 0;

			buffers.materialIndex.forEach( function ( currentIndex, i ) {

				if ( currentIndex !== prevMaterialIndex ) {

					geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

					prevMaterialIndex = currentIndex;
					startIndex = i;

				}

			} );

			// the loop above doesn't add the last group, do that here.
			if ( geo.groups.length > 0 ) {

				const lastGroup = geo.groups[ geo.groups.length - 1 ];
				const lastIndex = lastGroup.start + lastGroup.count;

				if ( lastIndex !== buffers.materialIndex.length ) {

					geo.addGroup( lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex );

				}

			}

			// case where there are multiple materials but the whole geometry is only
			// using one of them
			if ( geo.groups.length === 0 ) {

				geo.addGroup( 0, buffers.materialIndex.length, buffers.materialIndex[ 0 ] );

			}

		}

		this.addMorphTargets( geo, geoNode, morphTargets, preTransform );

		return geo;

	}

	parseGeoNode( geoNode, skeleton ) {

		const geoInfo = {};

		geoInfo.vertexPositions = ( geoNode.Vertices !== undefined ) ? geoNode.Vertices.a : [];
		geoInfo.vertexIndices = ( geoNode.PolygonVertexIndex !== undefined ) ? geoNode.PolygonVertexIndex.a : [];

		if ( geoNode.LayerElementColor ) {

			geoInfo.color = this.parseVertexColors( geoNode.LayerElementColor[ 0 ] );

		}

		if ( geoNode.LayerElementMaterial ) {

			geoInfo.material = this.parseMaterialIndices( geoNode.LayerElementMaterial[ 0 ] );

		}

		if ( geoNode.LayerElementNormal ) {

			geoInfo.normal = this.parseNormals( geoNode.LayerElementNormal[ 0 ] );

		}

		if ( geoNode.LayerElementUV ) {

			geoInfo.uv = [];

			let i = 0;
			while ( geoNode.LayerElementUV[ i ] ) {

				if ( geoNode.LayerElementUV[ i ].UV ) {

					geoInfo.uv.push( this.parseUVs( geoNode.LayerElementUV[ i ] ) );

				}

				i ++;

			}

		}

		geoInfo.weightTable = {};

		if ( skeleton !== null ) {

			geoInfo.skeleton = skeleton;

			skeleton.rawBones.forEach( function ( rawBone, i ) {

				// loop over the bone's vertex indices and weights
				rawBone.indices.forEach( function ( index, j ) {

					if ( geoInfo.weightTable[ index ] === undefined ) geoInfo.weightTable[ index ] = [];

					geoInfo.weightTable[ index ].push( {

						id: i,
						weight: rawBone.weights[ j ],

					} );

				} );

			} );

		}

		return geoInfo;

	}

	genBuffers( geoInfo ) {

		const buffers = {
			vertex: [],
			normal: [],
			colors: [],
			uvs: [],
			materialIndex: [],
			vertexWeights: [],
			weightsIndices: [],
		};

		let polygonIndex = 0;
		let faceLength = 0;
		let displayedWeightsWarning = false;

		// these will hold data for a single face
		let facePositionIndexes = [];
		let faceNormals = [];
		let faceColors = [];
		let faceUVs = [];
		let faceWeights = [];
		let faceWeightIndices = [];

		const scope = this;
		geoInfo.vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {

			let materialIndex;
			let endOfFace = false;

			// Face index and vertex index arrays are combined in a single array
			// A cube with quad faces looks like this:
			// PolygonVertexIndex: *24 {
			//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
			//  }
			// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
			// to find index of last vertex bit shift the index: ^ - 1
			if ( vertexIndex < 0 ) {

				vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
				endOfFace = true;

			}

			let weightIndices = [];
			let weights = [];

			facePositionIndexes.push( vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2 );

			if ( geoInfo.color ) {

				const data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color );

				faceColors.push( data[ 0 ], data[ 1 ], data[ 2 ] );

			}

			if ( geoInfo.skeleton ) {

				if ( geoInfo.weightTable[ vertexIndex ] !== undefined ) {

					geoInfo.weightTable[ vertexIndex ].forEach( function ( wt ) {

						weights.push( wt.weight );
						weightIndices.push( wt.id );

					} );


				}

				if ( weights.length > 4 ) {

					if ( ! displayedWeightsWarning ) {

						console.warn( 'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
						displayedWeightsWarning = true;

					}

					const wIndex = [ 0, 0, 0, 0 ];
					const Weight = [ 0, 0, 0, 0 ];

					weights.forEach( function ( weight, weightIndex ) {

						let currentWeight = weight;
						let currentIndex = weightIndices[ weightIndex ];

						Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

							if ( currentWeight > comparedWeight ) {

								comparedWeightArray[ comparedWeightIndex ] = currentWeight;
								currentWeight = comparedWeight;

								const tmp = wIndex[ comparedWeightIndex ];
								wIndex[ comparedWeightIndex ] = currentIndex;
								currentIndex = tmp;

							}

						} );

					} );

					weightIndices = wIndex;
					weights = Weight;

				}

				// if the weight array is shorter than 4 pad with 0s
				while ( weights.length < 4 ) {

					weights.push( 0 );
					weightIndices.push( 0 );

				}

				for ( let i = 0; i < 4; ++ i ) {

					faceWeights.push( weights[ i ] );
					faceWeightIndices.push( weightIndices[ i ] );

				}

			}

			if ( geoInfo.normal ) {

				const data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal );

				faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );

			}

			if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

				materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material )[ 0 ];

			}

			if ( geoInfo.uv ) {

				geoInfo.uv.forEach( function ( uv, i ) {

					const data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uv );

					if ( faceUVs[ i ] === undefined ) {

						faceUVs[ i ] = [];

					}

					faceUVs[ i ].push( data[ 0 ] );
					faceUVs[ i ].push( data[ 1 ] );

				} );

			}

			faceLength ++;

			if ( endOfFace ) {

				scope.genFace( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength );

				polygonIndex ++;
				faceLength = 0;

				// reset arrays for the next face
				facePositionIndexes = [];
				faceNormals = [];
				faceColors = [];
				faceUVs = [];
				faceWeights = [];
				faceWeightIndices = [];

			}

		} );

		return buffers;

	}

	// Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
	genFace( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength ) {

		for ( let i = 2; i < faceLength; i ++ ) {

			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 0 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 1 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 2 ] ] );

			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 1 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 2 ] ] );

			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 1 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 2 ] ] );

			if ( geoInfo.skeleton ) {

				buffers.vertexWeights.push( faceWeights[ 0 ] );
				buffers.vertexWeights.push( faceWeights[ 1 ] );
				buffers.vertexWeights.push( faceWeights[ 2 ] );
				buffers.vertexWeights.push( faceWeights[ 3 ] );

				buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 ] );
				buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 1 ] );
				buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 2 ] );
				buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 3 ] );

				buffers.vertexWeights.push( faceWeights[ i * 4 ] );
				buffers.vertexWeights.push( faceWeights[ i * 4 + 1 ] );
				buffers.vertexWeights.push( faceWeights[ i * 4 + 2 ] );
				buffers.vertexWeights.push( faceWeights[ i * 4 + 3 ] );

				buffers.weightsIndices.push( faceWeightIndices[ 0 ] );
				buffers.weightsIndices.push( faceWeightIndices[ 1 ] );
				buffers.weightsIndices.push( faceWeightIndices[ 2 ] );
				buffers.weightsIndices.push( faceWeightIndices[ 3 ] );

				buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 ] );
				buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 1 ] );
				buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 2 ] );
				buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 3 ] );

				buffers.weightsIndices.push( faceWeightIndices[ i * 4 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 1 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 2 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 3 ] );

			}

			if ( geoInfo.color ) {

				buffers.colors.push( faceColors[ 0 ] );
				buffers.colors.push( faceColors[ 1 ] );
				buffers.colors.push( faceColors[ 2 ] );

				buffers.colors.push( faceColors[ ( i - 1 ) * 3 ] );
				buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 1 ] );
				buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 2 ] );

				buffers.colors.push( faceColors[ i * 3 ] );
				buffers.colors.push( faceColors[ i * 3 + 1 ] );
				buffers.colors.push( faceColors[ i * 3 + 2 ] );

			}

			if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

				buffers.materialIndex.push( materialIndex );
				buffers.materialIndex.push( materialIndex );
				buffers.materialIndex.push( materialIndex );

			}

			if ( geoInfo.normal ) {

				buffers.normal.push( faceNormals[ 0 ] );
				buffers.normal.push( faceNormals[ 1 ] );
				buffers.normal.push( faceNormals[ 2 ] );

				buffers.normal.push( faceNormals[ ( i - 1 ) * 3 ] );
				buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 1 ] );
				buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 2 ] );

				buffers.normal.push( faceNormals[ i * 3 ] );
				buffers.normal.push( faceNormals[ i * 3 + 1 ] );
				buffers.normal.push( faceNormals[ i * 3 + 2 ] );

			}

			if ( geoInfo.uv ) {

				geoInfo.uv.forEach( function ( uv, j ) {

					if ( buffers.uvs[ j ] === undefined ) buffers.uvs[ j ] = [];

					buffers.uvs[ j ].push( faceUVs[ j ][ 0 ] );
					buffers.uvs[ j ].push( faceUVs[ j ][ 1 ] );

					buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
					buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

					buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 ] );
					buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );

				} );

			}

		}

	}

	addMorphTargets( parentGeo, parentGeoNode, morphTargets, preTransform ) {

		if ( morphTargets.length === 0 ) return;

		parentGeo.morphTargetsRelative = true;

		parentGeo.morphAttributes.position = [];
		// parentGeo.morphAttributes.normal = []; // not implemented

		const scope = this;
		morphTargets.forEach( function ( morphTarget ) {

			morphTarget.rawTargets.forEach( function ( rawTarget ) {

				const morphGeoNode = fbxTree.Objects.Geometry[ rawTarget.geoID ];

				if ( morphGeoNode !== undefined ) {

					scope.genMorphGeometry( parentGeo, parentGeoNode, morphGeoNode, preTransform, rawTarget.name );

				}

			} );

		} );

	}

	// a morph geometry node is similar to a standard  node, and the node is also contained
	// in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
	// and a special attribute Index defining which vertices of the original geometry are affected
	// Normal and position attributes only have data for the vertices that are affected by the morph
	genMorphGeometry( parentGeo, parentGeoNode, morphGeoNode, preTransform, name ) {

		const vertexIndices = ( parentGeoNode.PolygonVertexIndex !== undefined ) ? parentGeoNode.PolygonVertexIndex.a : [];

		const morphPositionsSparse = ( morphGeoNode.Vertices !== undefined ) ? morphGeoNode.Vertices.a : [];
		const indices = ( morphGeoNode.Indexes !== undefined ) ? morphGeoNode.Indexes.a : [];

		const length = parentGeo.attributes.position.count * 3;
		const morphPositions = new Float32Array( length );

		for ( let i = 0; i < indices.length; i ++ ) {

			const morphIndex = indices[ i ] * 3;

			morphPositions[ morphIndex ] = morphPositionsSparse[ i * 3 ];
			morphPositions[ morphIndex + 1 ] = morphPositionsSparse[ i * 3 + 1 ];
			morphPositions[ morphIndex + 2 ] = morphPositionsSparse[ i * 3 + 2 ];

		}

		// TODO: add morph normal support
		const morphGeoInfo = {
			vertexIndices: vertexIndices,
			vertexPositions: morphPositions,

		};

		const morphBuffers = this.genBuffers( morphGeoInfo );

		const positionAttribute = new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute( morphBuffers.vertex, 3 );
		positionAttribute.name = name || morphGeoNode.attrName;

		positionAttribute.applyMatrix4( preTransform );

		parentGeo.morphAttributes.position.push( positionAttribute );

	}

	// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
	parseNormals( NormalNode ) {

		const mappingType = NormalNode.MappingInformationType;
		const referenceType = NormalNode.ReferenceInformationType;
		const buffer = NormalNode.Normals.a;
		let indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			if ( 'NormalIndex' in NormalNode ) {

				indexBuffer = NormalNode.NormalIndex.a;

			} else if ( 'NormalsIndex' in NormalNode ) {

				indexBuffer = NormalNode.NormalsIndex.a;

			}

		}

		return {
			dataSize: 3,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
	parseUVs( UVNode ) {

		const mappingType = UVNode.MappingInformationType;
		const referenceType = UVNode.ReferenceInformationType;
		const buffer = UVNode.UV.a;
		let indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			indexBuffer = UVNode.UVIndex.a;

		}

		return {
			dataSize: 2,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
	parseVertexColors( ColorNode ) {

		const mappingType = ColorNode.MappingInformationType;
		const referenceType = ColorNode.ReferenceInformationType;
		const buffer = ColorNode.Colors.a;
		let indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			indexBuffer = ColorNode.ColorIndex.a;

		}

		return {
			dataSize: 4,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
	parseMaterialIndices( MaterialNode ) {

		const mappingType = MaterialNode.MappingInformationType;
		const referenceType = MaterialNode.ReferenceInformationType;

		if ( mappingType === 'NoMappingInformation' ) {

			return {
				dataSize: 1,
				buffer: [ 0 ],
				indices: [ 0 ],
				mappingType: 'AllSame',
				referenceType: referenceType
			};

		}

		const materialIndexBuffer = MaterialNode.Materials.a;

		// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
		// we expect.So we create an intermediate buffer that points to the index in the buffer,
		// for conforming with the other functions we've written for other data.
		const materialIndices = [];

		for ( let i = 0; i < materialIndexBuffer.length; ++ i ) {

			materialIndices.push( i );

		}

		return {
			dataSize: 1,
			buffer: materialIndexBuffer,
			indices: materialIndices,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
	parseNurbsGeometry( geoNode ) {

		if ( _curves_NURBSCurve_js__WEBPACK_IMPORTED_MODULE_1__.NURBSCurve === undefined ) {

			console.error( 'THREE.FBXLoader: The loader relies on NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.' );
			return new three__WEBPACK_IMPORTED_MODULE_2__.BufferGeometry();

		}

		const order = parseInt( geoNode.Order );

		if ( isNaN( order ) ) {

			console.error( 'THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id );
			return new three__WEBPACK_IMPORTED_MODULE_2__.BufferGeometry();

		}

		const degree = order - 1;

		const knots = geoNode.KnotVector.a;
		const controlPoints = [];
		const pointsValues = geoNode.Points.a;

		for ( let i = 0, l = pointsValues.length; i < l; i += 4 ) {

			controlPoints.push( new three__WEBPACK_IMPORTED_MODULE_2__.Vector4().fromArray( pointsValues, i ) );

		}

		let startKnot, endKnot;

		if ( geoNode.Form === 'Closed' ) {

			controlPoints.push( controlPoints[ 0 ] );

		} else if ( geoNode.Form === 'Periodic' ) {

			startKnot = degree;
			endKnot = knots.length - 1 - startKnot;

			for ( let i = 0; i < degree; ++ i ) {

				controlPoints.push( controlPoints[ i ] );

			}

		}

		const curve = new _curves_NURBSCurve_js__WEBPACK_IMPORTED_MODULE_1__.NURBSCurve( degree, knots, controlPoints, startKnot, endKnot );
		const points = curve.getPoints( controlPoints.length * 12 );

		return new three__WEBPACK_IMPORTED_MODULE_2__.BufferGeometry().setFromPoints( points );

	}

}

// parse animation data from FBXTree
class AnimationParser {

	// take raw animation clips and turn them into three.js animation clips
	parse() {

		const animationClips = [];

		const rawClips = this.parseClips();

		if ( rawClips !== undefined ) {

			for ( const key in rawClips ) {

				const rawClip = rawClips[ key ];

				const clip = this.addClip( rawClip );

				animationClips.push( clip );

			}

		}

		return animationClips;

	}

	parseClips() {

		// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
		// if this is undefined we can safely assume there are no animations
		if ( fbxTree.Objects.AnimationCurve === undefined ) return undefined;

		const curveNodesMap = this.parseAnimationCurveNodes();

		this.parseAnimationCurves( curveNodesMap );

		const layersMap = this.parseAnimationLayers( curveNodesMap );
		const rawClips = this.parseAnimStacks( layersMap );

		return rawClips;

	}

	// parse nodes in FBXTree.Objects.AnimationCurveNode
	// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
	// and is referenced by an AnimationLayer
	parseAnimationCurveNodes() {

		const rawCurveNodes = fbxTree.Objects.AnimationCurveNode;

		const curveNodesMap = new Map();

		for ( const nodeID in rawCurveNodes ) {

			const rawCurveNode = rawCurveNodes[ nodeID ];

			if ( rawCurveNode.attrName.match( /S|R|T|DeformPercent/ ) !== null ) {

				const curveNode = {

					id: rawCurveNode.id,
					attr: rawCurveNode.attrName,
					curves: {},

				};

				curveNodesMap.set( curveNode.id, curveNode );

			}

		}

		return curveNodesMap;

	}

	// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
	// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
	// axis ( e.g. times and values of x rotation)
	parseAnimationCurves( curveNodesMap ) {

		const rawCurves = fbxTree.Objects.AnimationCurve;

		// TODO: Many values are identical up to roundoff error, but won't be optimised
		// e.g. position times: [0, 0.4, 0. 8]
		// position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
		// clearly, this should be optimised to
		// times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
		// this shows up in nearly every FBX file, and generally time array is length > 100

		for ( const nodeID in rawCurves ) {

			const animationCurve = {

				id: rawCurves[ nodeID ].id,
				times: rawCurves[ nodeID ].KeyTime.a.map( convertFBXTimeToSeconds ),
				values: rawCurves[ nodeID ].KeyValueFloat.a,

			};

			const relationships = connections.get( animationCurve.id );

			if ( relationships !== undefined ) {

				const animationCurveID = relationships.parents[ 0 ].ID;
				const animationCurveRelationship = relationships.parents[ 0 ].relationship;

				if ( animationCurveRelationship.match( /X/ ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'x' ] = animationCurve;

				} else if ( animationCurveRelationship.match( /Y/ ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'y' ] = animationCurve;

				} else if ( animationCurveRelationship.match( /Z/ ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'z' ] = animationCurve;

				} else if ( animationCurveRelationship.match( /d|DeformPercent/ ) && curveNodesMap.has( animationCurveID ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'morph' ] = animationCurve;

				}

			}

		}

	}

	// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
	// to various AnimationCurveNodes and is referenced by an AnimationStack node
	// note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
	parseAnimationLayers( curveNodesMap ) {

		const rawLayers = fbxTree.Objects.AnimationLayer;

		const layersMap = new Map();

		for ( const nodeID in rawLayers ) {

			const layerCurveNodes = [];

			const connection = connections.get( parseInt( nodeID ) );

			if ( connection !== undefined ) {

				// all the animationCurveNodes used in the layer
				const children = connection.children;

				children.forEach( function ( child, i ) {

					if ( curveNodesMap.has( child.ID ) ) {

						const curveNode = curveNodesMap.get( child.ID );

						// check that the curves are defined for at least one axis, otherwise ignore the curveNode
						if ( curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined ) {

							if ( layerCurveNodes[ i ] === undefined ) {

								const modelID = connections.get( child.ID ).parents.filter( function ( parent ) {

									return parent.relationship !== undefined;

								} )[ 0 ].ID;

								if ( modelID !== undefined ) {

									const rawModel = fbxTree.Objects.Model[ modelID.toString() ];

									if ( rawModel === undefined ) {

										console.warn( 'THREE.FBXLoader: Encountered a unused curve.', child );
										return;

									}

									const node = {

										modelName: rawModel.attrName ? three__WEBPACK_IMPORTED_MODULE_2__.PropertyBinding.sanitizeNodeName( rawModel.attrName ) : '',
										ID: rawModel.id,
										initialPosition: [ 0, 0, 0 ],
										initialRotation: [ 0, 0, 0 ],
										initialScale: [ 1, 1, 1 ],

									};

									sceneGraph.traverse( function ( child ) {

										if ( child.ID === rawModel.id ) {

											node.transform = child.matrix;

											if ( child.userData.transformData ) node.eulerOrder = child.userData.transformData.eulerOrder;

										}

									} );

									if ( ! node.transform ) node.transform = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();

									// if the animated model is pre rotated, we'll have to apply the pre rotations to every
									// animation value as well
									if ( 'PreRotation' in rawModel ) node.preRotation = rawModel.PreRotation.value;
									if ( 'PostRotation' in rawModel ) node.postRotation = rawModel.PostRotation.value;

									layerCurveNodes[ i ] = node;

								}

							}

							if ( layerCurveNodes[ i ] ) layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

						} else if ( curveNode.curves.morph !== undefined ) {

							if ( layerCurveNodes[ i ] === undefined ) {

								const deformerID = connections.get( child.ID ).parents.filter( function ( parent ) {

									return parent.relationship !== undefined;

								} )[ 0 ].ID;

								const morpherID = connections.get( deformerID ).parents[ 0 ].ID;
								const geoID = connections.get( morpherID ).parents[ 0 ].ID;

								// assuming geometry is not used in more than one model
								const modelID = connections.get( geoID ).parents[ 0 ].ID;

								const rawModel = fbxTree.Objects.Model[ modelID ];

								const node = {

									modelName: rawModel.attrName ? three__WEBPACK_IMPORTED_MODULE_2__.PropertyBinding.sanitizeNodeName( rawModel.attrName ) : '',
									morphName: fbxTree.Objects.Deformer[ deformerID ].attrName,

								};

								layerCurveNodes[ i ] = node;

							}

							layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

						}

					}

				} );

				layersMap.set( parseInt( nodeID ), layerCurveNodes );

			}

		}

		return layersMap;

	}

	// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
	// hierarchy. Each Stack node will be used to create a AnimationClip
	parseAnimStacks( layersMap ) {

		const rawStacks = fbxTree.Objects.AnimationStack;

		// connect the stacks (clips) up to the layers
		const rawClips = {};

		for ( const nodeID in rawStacks ) {

			const children = connections.get( parseInt( nodeID ) ).children;

			if ( children.length > 1 ) {

				// it seems like stacks will always be associated with a single layer. But just in case there are files
				// where there are multiple layers per stack, we'll display a warning
				console.warn( 'THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.' );

			}

			const layer = layersMap.get( children[ 0 ].ID );

			rawClips[ nodeID ] = {

				name: rawStacks[ nodeID ].attrName,
				layer: layer,

			};

		}

		return rawClips;

	}

	addClip( rawClip ) {

		let tracks = [];

		const scope = this;
		rawClip.layer.forEach( function ( rawTracks ) {

			tracks = tracks.concat( scope.generateTracks( rawTracks ) );

		} );

		return new three__WEBPACK_IMPORTED_MODULE_2__.AnimationClip( rawClip.name, - 1, tracks );

	}

	generateTracks( rawTracks ) {

		const tracks = [];

		let initialPosition = new three__WEBPACK_IMPORTED_MODULE_2__.Vector3();
		let initialRotation = new three__WEBPACK_IMPORTED_MODULE_2__.Quaternion();
		let initialScale = new three__WEBPACK_IMPORTED_MODULE_2__.Vector3();

		if ( rawTracks.transform ) rawTracks.transform.decompose( initialPosition, initialRotation, initialScale );

		initialPosition = initialPosition.toArray();
		initialRotation = new three__WEBPACK_IMPORTED_MODULE_2__.Euler().setFromQuaternion( initialRotation, rawTracks.eulerOrder ).toArray();
		initialScale = initialScale.toArray();

		if ( rawTracks.T !== undefined && Object.keys( rawTracks.T.curves ).length > 0 ) {

			const positionTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.T.curves, initialPosition, 'position' );
			if ( positionTrack !== undefined ) tracks.push( positionTrack );

		}

		if ( rawTracks.R !== undefined && Object.keys( rawTracks.R.curves ).length > 0 ) {

			const rotationTrack = this.generateRotationTrack( rawTracks.modelName, rawTracks.R.curves, initialRotation, rawTracks.preRotation, rawTracks.postRotation, rawTracks.eulerOrder );
			if ( rotationTrack !== undefined ) tracks.push( rotationTrack );

		}

		if ( rawTracks.S !== undefined && Object.keys( rawTracks.S.curves ).length > 0 ) {

			const scaleTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale' );
			if ( scaleTrack !== undefined ) tracks.push( scaleTrack );

		}

		if ( rawTracks.DeformPercent !== undefined ) {

			const morphTrack = this.generateMorphTrack( rawTracks );
			if ( morphTrack !== undefined ) tracks.push( morphTrack );

		}

		return tracks;

	}

	generateVectorTrack( modelName, curves, initialValue, type ) {

		const times = this.getTimesForAllAxes( curves );
		const values = this.getKeyframeTrackValues( times, curves, initialValue );

		return new three__WEBPACK_IMPORTED_MODULE_2__.VectorKeyframeTrack( modelName + '.' + type, times, values );

	}

	generateRotationTrack( modelName, curves, initialValue, preRotation, postRotation, eulerOrder ) {

		if ( curves.x !== undefined ) {

			this.interpolateRotations( curves.x );
			curves.x.values = curves.x.values.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );

		}

		if ( curves.y !== undefined ) {

			this.interpolateRotations( curves.y );
			curves.y.values = curves.y.values.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );

		}

		if ( curves.z !== undefined ) {

			this.interpolateRotations( curves.z );
			curves.z.values = curves.z.values.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );

		}

		const times = this.getTimesForAllAxes( curves );
		const values = this.getKeyframeTrackValues( times, curves, initialValue );

		if ( preRotation !== undefined ) {

			preRotation = preRotation.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );
			preRotation.push( eulerOrder );

			preRotation = new three__WEBPACK_IMPORTED_MODULE_2__.Euler().fromArray( preRotation );
			preRotation = new three__WEBPACK_IMPORTED_MODULE_2__.Quaternion().setFromEuler( preRotation );

		}

		if ( postRotation !== undefined ) {

			postRotation = postRotation.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );
			postRotation.push( eulerOrder );

			postRotation = new three__WEBPACK_IMPORTED_MODULE_2__.Euler().fromArray( postRotation );
			postRotation = new three__WEBPACK_IMPORTED_MODULE_2__.Quaternion().setFromEuler( postRotation ).invert();

		}

		const quaternion = new three__WEBPACK_IMPORTED_MODULE_2__.Quaternion();
		const euler = new three__WEBPACK_IMPORTED_MODULE_2__.Euler();

		const quaternionValues = [];

		for ( let i = 0; i < values.length; i += 3 ) {

			euler.set( values[ i ], values[ i + 1 ], values[ i + 2 ], eulerOrder );

			quaternion.setFromEuler( euler );

			if ( preRotation !== undefined ) quaternion.premultiply( preRotation );
			if ( postRotation !== undefined ) quaternion.multiply( postRotation );

			quaternion.toArray( quaternionValues, ( i / 3 ) * 4 );

		}

		return new three__WEBPACK_IMPORTED_MODULE_2__.QuaternionKeyframeTrack( modelName + '.quaternion', times, quaternionValues );

	}

	generateMorphTrack( rawTracks ) {

		const curves = rawTracks.DeformPercent.curves.morph;
		const values = curves.values.map( function ( val ) {

			return val / 100;

		} );

		const morphNum = sceneGraph.getObjectByName( rawTracks.modelName ).morphTargetDictionary[ rawTracks.morphName ];

		return new three__WEBPACK_IMPORTED_MODULE_2__.NumberKeyframeTrack( rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']', curves.times, values );

	}

	// For all animated objects, times are defined separately for each axis
	// Here we'll combine the times into one sorted array without duplicates
	getTimesForAllAxes( curves ) {

		let times = [];

		// first join together the times for each axis, if defined
		if ( curves.x !== undefined ) times = times.concat( curves.x.times );
		if ( curves.y !== undefined ) times = times.concat( curves.y.times );
		if ( curves.z !== undefined ) times = times.concat( curves.z.times );

		// then sort them
		times = times.sort( function ( a, b ) {

			return a - b;

		} );

		// and remove duplicates
		if ( times.length > 1 ) {

			let targetIndex = 1;
			let lastValue = times[ 0 ];
			for ( let i = 1; i < times.length; i ++ ) {

				const currentValue = times[ i ];
				if ( currentValue !== lastValue ) {

					times[ targetIndex ] = currentValue;
					lastValue = currentValue;
					targetIndex ++;

				}

			}

			times = times.slice( 0, targetIndex );

		}

		return times;

	}

	getKeyframeTrackValues( times, curves, initialValue ) {

		const prevValue = initialValue;

		const values = [];

		let xIndex = - 1;
		let yIndex = - 1;
		let zIndex = - 1;

		times.forEach( function ( time ) {

			if ( curves.x ) xIndex = curves.x.times.indexOf( time );
			if ( curves.y ) yIndex = curves.y.times.indexOf( time );
			if ( curves.z ) zIndex = curves.z.times.indexOf( time );

			// if there is an x value defined for this frame, use that
			if ( xIndex !== - 1 ) {

				const xValue = curves.x.values[ xIndex ];
				values.push( xValue );
				prevValue[ 0 ] = xValue;

			} else {

				// otherwise use the x value from the previous frame
				values.push( prevValue[ 0 ] );

			}

			if ( yIndex !== - 1 ) {

				const yValue = curves.y.values[ yIndex ];
				values.push( yValue );
				prevValue[ 1 ] = yValue;

			} else {

				values.push( prevValue[ 1 ] );

			}

			if ( zIndex !== - 1 ) {

				const zValue = curves.z.values[ zIndex ];
				values.push( zValue );
				prevValue[ 2 ] = zValue;

			} else {

				values.push( prevValue[ 2 ] );

			}

		} );

		return values;

	}

	// Rotations are defined as Euler angles which can have values  of any size
	// These will be converted to quaternions which don't support values greater than
	// PI, so we'll interpolate large rotations
	interpolateRotations( curve ) {

		for ( let i = 1; i < curve.values.length; i ++ ) {

			const initialValue = curve.values[ i - 1 ];
			const valuesSpan = curve.values[ i ] - initialValue;

			const absoluteSpan = Math.abs( valuesSpan );

			if ( absoluteSpan >= 180 ) {

				const numSubIntervals = absoluteSpan / 180;

				const step = valuesSpan / numSubIntervals;
				let nextValue = initialValue + step;

				const initialTime = curve.times[ i - 1 ];
				const timeSpan = curve.times[ i ] - initialTime;
				const interval = timeSpan / numSubIntervals;
				let nextTime = initialTime + interval;

				const interpolatedTimes = [];
				const interpolatedValues = [];

				while ( nextTime < curve.times[ i ] ) {

					interpolatedTimes.push( nextTime );
					nextTime += interval;

					interpolatedValues.push( nextValue );
					nextValue += step;

				}

				curve.times = inject( curve.times, i, interpolatedTimes );
				curve.values = inject( curve.values, i, interpolatedValues );

			}

		}

	}

}

// parse an FBX file in ASCII format
class TextParser {

	getPrevNode() {

		return this.nodeStack[ this.currentIndent - 2 ];

	}

	getCurrentNode() {

		return this.nodeStack[ this.currentIndent - 1 ];

	}

	getCurrentProp() {

		return this.currentProp;

	}

	pushStack( node ) {

		this.nodeStack.push( node );
		this.currentIndent += 1;

	}

	popStack() {

		this.nodeStack.pop();
		this.currentIndent -= 1;

	}

	setCurrentProp( val, name ) {

		this.currentProp = val;
		this.currentPropName = name;

	}

	parse( text ) {

		this.currentIndent = 0;

		this.allNodes = new FBXTree();
		this.nodeStack = [];
		this.currentProp = [];
		this.currentPropName = '';

		const scope = this;

		const split = text.split( /[\r\n]+/ );

		split.forEach( function ( line, i ) {

			const matchComment = line.match( /^[\s\t]*;/ );
			const matchEmpty = line.match( /^[\s\t]*$/ );

			if ( matchComment || matchEmpty ) return;

			const matchBeginning = line.match( '^\\t{' + scope.currentIndent + '}(\\w+):(.*){', '' );
			const matchProperty = line.match( '^\\t{' + ( scope.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
			const matchEnd = line.match( '^\\t{' + ( scope.currentIndent - 1 ) + '}}' );

			if ( matchBeginning ) {

				scope.parseNodeBegin( line, matchBeginning );

			} else if ( matchProperty ) {

				scope.parseNodeProperty( line, matchProperty, split[ ++ i ] );

			} else if ( matchEnd ) {

				scope.popStack();

			} else if ( line.match( /^[^\s\t}]/ ) ) {

				// large arrays are split over multiple lines terminated with a ',' character
				// if this is encountered the line needs to be joined to the previous line
				scope.parseNodePropertyContinued( line );

			}

		} );

		return this.allNodes;

	}

	parseNodeBegin( line, property ) {

		const nodeName = property[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );

		const nodeAttrs = property[ 2 ].split( ',' ).map( function ( attr ) {

			return attr.trim().replace( /^"/, '' ).replace( /"$/, '' );

		} );

		const node = { name: nodeName };
		const attrs = this.parseNodeAttr( nodeAttrs );

		const currentNode = this.getCurrentNode();

		// a top node
		if ( this.currentIndent === 0 ) {

			this.allNodes.add( nodeName, node );

		} else { // a subnode

			// if the subnode already exists, append it
			if ( nodeName in currentNode ) {

				// special case Pose needs PoseNodes as an array
				if ( nodeName === 'PoseNode' ) {

					currentNode.PoseNode.push( node );

				} else if ( currentNode[ nodeName ].id !== undefined ) {

					currentNode[ nodeName ] = {};
					currentNode[ nodeName ][ currentNode[ nodeName ].id ] = currentNode[ nodeName ];

				}

				if ( attrs.id !== '' ) currentNode[ nodeName ][ attrs.id ] = node;

			} else if ( typeof attrs.id === 'number' ) {

				currentNode[ nodeName ] = {};
				currentNode[ nodeName ][ attrs.id ] = node;

			} else if ( nodeName !== 'Properties70' ) {

				if ( nodeName === 'PoseNode' )	currentNode[ nodeName ] = [ node ];
				else currentNode[ nodeName ] = node;

			}

		}

		if ( typeof attrs.id === 'number' ) node.id = attrs.id;
		if ( attrs.name !== '' ) node.attrName = attrs.name;
		if ( attrs.type !== '' ) node.attrType = attrs.type;

		this.pushStack( node );

	}

	parseNodeAttr( attrs ) {

		let id = attrs[ 0 ];

		if ( attrs[ 0 ] !== '' ) {

			id = parseInt( attrs[ 0 ] );

			if ( isNaN( id ) ) {

				id = attrs[ 0 ];

			}

		}

		let name = '', type = '';

		if ( attrs.length > 1 ) {

			name = attrs[ 1 ].replace( /^(\w+)::/, '' );
			type = attrs[ 2 ];

		}

		return { id: id, name: name, type: type };

	}

	parseNodeProperty( line, property, contentLine ) {

		let propName = property[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
		let propValue = property[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

		// for special case: base64 image data follows "Content: ," line
		//	Content: ,
		//	 "/9j/4RDaRXhpZgAATU0A..."
		if ( propName === 'Content' && propValue === ',' ) {

			propValue = contentLine.replace( /"/g, '' ).replace( /,$/, '' ).trim();

		}

		const currentNode = this.getCurrentNode();
		const parentName = currentNode.name;

		if ( parentName === 'Properties70' ) {

			this.parseNodeSpecialProperty( line, propName, propValue );
			return;

		}

		// Connections
		if ( propName === 'C' ) {

			const connProps = propValue.split( ',' ).slice( 1 );
			const from = parseInt( connProps[ 0 ] );
			const to = parseInt( connProps[ 1 ] );

			let rest = propValue.split( ',' ).slice( 3 );

			rest = rest.map( function ( elem ) {

				return elem.trim().replace( /^"/, '' );

			} );

			propName = 'connections';
			propValue = [ from, to ];
			append( propValue, rest );

			if ( currentNode[ propName ] === undefined ) {

				currentNode[ propName ] = [];

			}

		}

		// Node
		if ( propName === 'Node' ) currentNode.id = propValue;

		// connections
		if ( propName in currentNode && Array.isArray( currentNode[ propName ] ) ) {

			currentNode[ propName ].push( propValue );

		} else {

			if ( propName !== 'a' ) currentNode[ propName ] = propValue;
			else currentNode.a = propValue;

		}

		this.setCurrentProp( currentNode, propName );

		// convert string to array, unless it ends in ',' in which case more will be added to it
		if ( propName === 'a' && propValue.slice( - 1 ) !== ',' ) {

			currentNode.a = parseNumberArray( propValue );

		}

	}

	parseNodePropertyContinued( line ) {

		const currentNode = this.getCurrentNode();

		currentNode.a += line;

		// if the line doesn't end in ',' we have reached the end of the property value
		// so convert the string to an array
		if ( line.slice( - 1 ) !== ',' ) {

			currentNode.a = parseNumberArray( currentNode.a );

		}

	}

	// parse "Property70"
	parseNodeSpecialProperty( line, propName, propValue ) {

		// split this
		// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
		// into array like below
		// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
		const props = propValue.split( '",' ).map( function ( prop ) {

			return prop.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

		} );

		const innerPropName = props[ 0 ];
		const innerPropType1 = props[ 1 ];
		const innerPropType2 = props[ 2 ];
		const innerPropFlag = props[ 3 ];
		let innerPropValue = props[ 4 ];

		// cast values where needed, otherwise leave as strings
		switch ( innerPropType1 ) {

			case 'int':
			case 'enum':
			case 'bool':
			case 'ULongLong':
			case 'double':
			case 'Number':
			case 'FieldOfView':
				innerPropValue = parseFloat( innerPropValue );
				break;

			case 'Color':
			case 'ColorRGB':
			case 'Vector3D':
			case 'Lcl_Translation':
			case 'Lcl_Rotation':
			case 'Lcl_Scaling':
				innerPropValue = parseNumberArray( innerPropValue );
				break;

		}

		// CAUTION: these props must append to parent's parent
		this.getPrevNode()[ innerPropName ] = {

			'type': innerPropType1,
			'type2': innerPropType2,
			'flag': innerPropFlag,
			'value': innerPropValue

		};

		this.setCurrentProp( this.getPrevNode(), innerPropName );

	}

}

// Parse an FBX file in Binary format
class BinaryParser {

	parse( buffer ) {

		const reader = new BinaryReader( buffer );
		reader.skip( 23 ); // skip magic 23 bytes

		const version = reader.getUint32();

		if ( version < 6400 ) {

			throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + version );

		}

		const allNodes = new FBXTree();

		while ( ! this.endOfContent( reader ) ) {

			const node = this.parseNode( reader, version );
			if ( node !== null ) allNodes.add( node.name, node );

		}

		return allNodes;

	}

	// Check if reader has reached the end of content.
	endOfContent( reader ) {

		// footer size: 160bytes + 16-byte alignment padding
		// - 16bytes: magic
		// - padding til 16-byte alignment (at least 1byte?)
		//	(seems like some exporters embed fixed 15 or 16bytes?)
		// - 4bytes: magic
		// - 4bytes: version
		// - 120bytes: zero
		// - 16bytes: magic
		if ( reader.size() % 16 === 0 ) {

			return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

		} else {

			return reader.getOffset() + 160 + 16 >= reader.size();

		}

	}

	// recursively parse nodes until the end of the file is reached
	parseNode( reader, version ) {

		const node = {};

		// The first three data sizes depends on version.
		const endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
		const numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

		( version >= 7500 ) ? reader.getUint64() : reader.getUint32(); // the returned propertyListLen is not used

		const nameLen = reader.getUint8();
		const name = reader.getString( nameLen );

		// Regards this node as NULL-record if endOffset is zero
		if ( endOffset === 0 ) return null;

		const propertyList = [];

		for ( let i = 0; i < numProperties; i ++ ) {

			propertyList.push( this.parseProperty( reader ) );

		}

		// Regards the first three elements in propertyList as id, attrName, and attrType
		const id = propertyList.length > 0 ? propertyList[ 0 ] : '';
		const attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
		const attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

		// check if this node represents just a single property
		// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
		node.singleProperty = ( numProperties === 1 && reader.getOffset() === endOffset ) ? true : false;

		while ( endOffset > reader.getOffset() ) {

			const subNode = this.parseNode( reader, version );

			if ( subNode !== null ) this.parseSubNode( name, node, subNode );

		}

		node.propertyList = propertyList; // raw property list used by parent

		if ( typeof id === 'number' ) node.id = id;
		if ( attrName !== '' ) node.attrName = attrName;
		if ( attrType !== '' ) node.attrType = attrType;
		if ( name !== '' ) node.name = name;

		return node;

	}

	parseSubNode( name, node, subNode ) {

		// special case: child node is single property
		if ( subNode.singleProperty === true ) {

			const value = subNode.propertyList[ 0 ];

			if ( Array.isArray( value ) ) {

				node[ subNode.name ] = subNode;

				subNode.a = value;

			} else {

				node[ subNode.name ] = value;

			}

		} else if ( name === 'Connections' && subNode.name === 'C' ) {

			const array = [];

			subNode.propertyList.forEach( function ( property, i ) {

				// first Connection is FBX type (OO, OP, etc.). We'll discard these
				if ( i !== 0 ) array.push( property );

			} );

			if ( node.connections === undefined ) {

				node.connections = [];

			}

			node.connections.push( array );

		} else if ( subNode.name === 'Properties70' ) {

			const keys = Object.keys( subNode );

			keys.forEach( function ( key ) {

				node[ key ] = subNode[ key ];

			} );

		} else if ( name === 'Properties70' && subNode.name === 'P' ) {

			let innerPropName = subNode.propertyList[ 0 ];
			let innerPropType1 = subNode.propertyList[ 1 ];
			const innerPropType2 = subNode.propertyList[ 2 ];
			const innerPropFlag = subNode.propertyList[ 3 ];
			let innerPropValue;

			if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
			if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

			if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

				innerPropValue = [
					subNode.propertyList[ 4 ],
					subNode.propertyList[ 5 ],
					subNode.propertyList[ 6 ]
				];

			} else {

				innerPropValue = subNode.propertyList[ 4 ];

			}

			// this will be copied to parent, see above
			node[ innerPropName ] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

		} else if ( node[ subNode.name ] === undefined ) {

			if ( typeof subNode.id === 'number' ) {

				node[ subNode.name ] = {};
				node[ subNode.name ][ subNode.id ] = subNode;

			} else {

				node[ subNode.name ] = subNode;

			}

		} else {

			if ( subNode.name === 'PoseNode' ) {

				if ( ! Array.isArray( node[ subNode.name ] ) ) {

					node[ subNode.name ] = [ node[ subNode.name ] ];

				}

				node[ subNode.name ].push( subNode );

			} else if ( node[ subNode.name ][ subNode.id ] === undefined ) {

				node[ subNode.name ][ subNode.id ] = subNode;

			}

		}

	}

	parseProperty( reader ) {

		const type = reader.getString( 1 );
		let length;

		switch ( type ) {

			case 'C':
				return reader.getBoolean();

			case 'D':
				return reader.getFloat64();

			case 'F':
				return reader.getFloat32();

			case 'I':
				return reader.getInt32();

			case 'L':
				return reader.getInt64();

			case 'R':
				length = reader.getUint32();
				return reader.getArrayBuffer( length );

			case 'S':
				length = reader.getUint32();
				return reader.getString( length );

			case 'Y':
				return reader.getInt16();

			case 'b':
			case 'c':
			case 'd':
			case 'f':
			case 'i':
			case 'l':

				const arrayLength = reader.getUint32();
				const encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
				const compressedLength = reader.getUint32();

				if ( encoding === 0 ) {

					switch ( type ) {

						case 'b':
						case 'c':
							return reader.getBooleanArray( arrayLength );

						case 'd':
							return reader.getFloat64Array( arrayLength );

						case 'f':
							return reader.getFloat32Array( arrayLength );

						case 'i':
							return reader.getInt32Array( arrayLength );

						case 'l':
							return reader.getInt64Array( arrayLength );

					}

				}

				if ( typeof _libs_fflate_module_js__WEBPACK_IMPORTED_MODULE_0__ === 'undefined' ) {

					console.error( 'THREE.FBXLoader: External library fflate.min.js required.' );

				}

				const data = _libs_fflate_module_js__WEBPACK_IMPORTED_MODULE_0__.unzlibSync( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
				const reader2 = new BinaryReader( data.buffer );

				switch ( type ) {

					case 'b':
					case 'c':
						return reader2.getBooleanArray( arrayLength );

					case 'd':
						return reader2.getFloat64Array( arrayLength );

					case 'f':
						return reader2.getFloat32Array( arrayLength );

					case 'i':
						return reader2.getInt32Array( arrayLength );

					case 'l':
						return reader2.getInt64Array( arrayLength );

				}

			default:
				throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );

		}

	}

}

class BinaryReader {

	constructor( buffer, littleEndian ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

	}

	getOffset() {

		return this.offset;

	}

	size() {

		return this.dv.buffer.byteLength;

	}

	skip( length ) {

		this.offset += length;

	}

	// seems like true/false representation depends on exporter.
	// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
	// then sees LSB.
	getBoolean() {

		return ( this.getUint8() & 1 ) === 1;

	}

	getBooleanArray( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getBoolean() );

		}

		return a;

	}

	getUint8() {

		const value = this.dv.getUint8( this.offset );
		this.offset += 1;
		return value;

	}

	getInt16() {

		const value = this.dv.getInt16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	}

	getInt32() {

		const value = this.dv.getInt32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	getInt32Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getInt32() );

		}

		return a;

	}

	getUint32() {

		const value = this.dv.getUint32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	// JavaScript doesn't support 64-bit integer so calculate this here
	// 1 << 32 will return 1 so using multiply operation instead here.
	// There's a possibility that this method returns wrong value if the value
	// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
	// TODO: safely handle 64-bit integer
	getInt64() {

		let low, high;

		if ( this.littleEndian ) {

			low = this.getUint32();
			high = this.getUint32();

		} else {

			high = this.getUint32();
			low = this.getUint32();

		}

		// calculate negative value
		if ( high & 0x80000000 ) {

			high = ~ high & 0xFFFFFFFF;
			low = ~ low & 0xFFFFFFFF;

			if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

			low = ( low + 1 ) & 0xFFFFFFFF;

			return - ( high * 0x100000000 + low );

		}

		return high * 0x100000000 + low;

	}

	getInt64Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getInt64() );

		}

		return a;

	}

	// Note: see getInt64() comment
	getUint64() {

		let low, high;

		if ( this.littleEndian ) {

			low = this.getUint32();
			high = this.getUint32();

		} else {

			high = this.getUint32();
			low = this.getUint32();

		}

		return high * 0x100000000 + low;

	}

	getFloat32() {

		const value = this.dv.getFloat32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	getFloat32Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getFloat32() );

		}

		return a;

	}

	getFloat64() {

		const value = this.dv.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	}

	getFloat64Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getFloat64() );

		}

		return a;

	}

	getArrayBuffer( size ) {

		const value = this.dv.buffer.slice( this.offset, this.offset + size );
		this.offset += size;
		return value;

	}

	getString( size ) {

		// note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
		let a = [];

		for ( let i = 0; i < size; i ++ ) {

			a[ i ] = this.getUint8();

		}

		const nullByte = a.indexOf( 0 );
		if ( nullByte >= 0 ) a = a.slice( 0, nullByte );

		return three__WEBPACK_IMPORTED_MODULE_2__.LoaderUtils.decodeText( new Uint8Array( a ) );

	}

}

// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
// and BinaryParser( FBX Binary format)
class FBXTree {

	add( key, val ) {

		this[ key ] = val;

	}

}

// ************** UTILITY FUNCTIONS **************

function isFbxFormatBinary( buffer ) {

	const CORRECT = 'Kaydara\u0020FBX\u0020Binary\u0020\u0020\0';

	return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString( buffer, 0, CORRECT.length );

}

function isFbxFormatASCII( text ) {

	const CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

	let cursor = 0;

	function read( offset ) {

		const result = text[ offset - 1 ];
		text = text.slice( cursor + offset );
		cursor ++;
		return result;

	}

	for ( let i = 0; i < CORRECT.length; ++ i ) {

		const num = read( 1 );
		if ( num === CORRECT[ i ] ) {

			return false;

		}

	}

	return true;

}

function getFbxVersion( text ) {

	const versionRegExp = /FBXVersion: (\d+)/;
	const match = text.match( versionRegExp );

	if ( match ) {

		const version = parseInt( match[ 1 ] );
		return version;

	}

	throw new Error( 'THREE.FBXLoader: Cannot find the version number for the file given.' );

}

// Converts FBX ticks into real time seconds.
function convertFBXTimeToSeconds( time ) {

	return time / 46186158000;

}

const dataArray = [];

// extracts the data from the correct position in the FBX array based on indexing type
function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

	let index;

	switch ( infoObject.mappingType ) {

		case 'ByPolygonVertex' :
			index = polygonVertexIndex;
			break;
		case 'ByPolygon' :
			index = polygonIndex;
			break;
		case 'ByVertice' :
			index = vertexIndex;
			break;
		case 'AllSame' :
			index = infoObject.indices[ 0 ];
			break;
		default :
			console.warn( 'THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType );

	}

	if ( infoObject.referenceType === 'IndexToDirect' ) index = infoObject.indices[ index ];

	const from = index * infoObject.dataSize;
	const to = from + infoObject.dataSize;

	return slice( dataArray, infoObject.buffer, from, to );

}

const tempEuler = new three__WEBPACK_IMPORTED_MODULE_2__.Euler();
const tempVec = new three__WEBPACK_IMPORTED_MODULE_2__.Vector3();

// generate transformation from FBX transform data
// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
// ref: http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/_transformations_2main_8cxx-example.html,topicNumber=cpp_ref__transformations_2main_8cxx_example_htmlfc10a1e1-b18d-4e72-9dc0-70d0f1959f5e
function generateTransform( transformData ) {

	const lTranslationM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lPreRotationM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lRotationM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lPostRotationM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();

	const lScalingM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lScalingPivotM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lScalingOffsetM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lRotationOffsetM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lRotationPivotM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();

	const lParentGX = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lParentLX = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	const lGlobalT = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();

	const inheritType = ( transformData.inheritType ) ? transformData.inheritType : 0;

	if ( transformData.translation ) lTranslationM.setPosition( tempVec.fromArray( transformData.translation ) );

	if ( transformData.preRotation ) {

		const array = transformData.preRotation.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );
		array.push( transformData.eulerOrder );
		lPreRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

	}

	if ( transformData.rotation ) {

		const array = transformData.rotation.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );
		array.push( transformData.eulerOrder );
		lRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

	}

	if ( transformData.postRotation ) {

		const array = transformData.postRotation.map( three__WEBPACK_IMPORTED_MODULE_2__.MathUtils.degToRad );
		array.push( transformData.eulerOrder );
		lPostRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );
		lPostRotationM.invert();

	}

	if ( transformData.scale ) lScalingM.scale( tempVec.fromArray( transformData.scale ) );

	// Pivots and offsets
	if ( transformData.scalingOffset ) lScalingOffsetM.setPosition( tempVec.fromArray( transformData.scalingOffset ) );
	if ( transformData.scalingPivot ) lScalingPivotM.setPosition( tempVec.fromArray( transformData.scalingPivot ) );
	if ( transformData.rotationOffset ) lRotationOffsetM.setPosition( tempVec.fromArray( transformData.rotationOffset ) );
	if ( transformData.rotationPivot ) lRotationPivotM.setPosition( tempVec.fromArray( transformData.rotationPivot ) );

	// parent transform
	if ( transformData.parentMatrixWorld ) {

		lParentLX.copy( transformData.parentMatrix );
		lParentGX.copy( transformData.parentMatrixWorld );

	}

	const lLRM = lPreRotationM.clone().multiply( lRotationM ).multiply( lPostRotationM );
	// Global Rotation
	const lParentGRM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	lParentGRM.extractRotation( lParentGX );

	// Global Shear*Scaling
	const lParentTM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();
	lParentTM.copyPosition( lParentGX );

	const lParentGRSM = lParentTM.clone().invert().multiply( lParentGX );
	const lParentGSM = lParentGRM.clone().invert().multiply( lParentGRSM );
	const lLSM = lScalingM;

	const lGlobalRS = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4();

	if ( inheritType === 0 ) {

		lGlobalRS.copy( lParentGRM ).multiply( lLRM ).multiply( lParentGSM ).multiply( lLSM );

	} else if ( inheritType === 1 ) {

		lGlobalRS.copy( lParentGRM ).multiply( lParentGSM ).multiply( lLRM ).multiply( lLSM );

	} else {

		const lParentLSM = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4().scale( new three__WEBPACK_IMPORTED_MODULE_2__.Vector3().setFromMatrixScale( lParentLX ) );
		const lParentLSM_inv = lParentLSM.clone().invert();
		const lParentGSM_noLocal = lParentGSM.clone().multiply( lParentLSM_inv );

		lGlobalRS.copy( lParentGRM ).multiply( lLRM ).multiply( lParentGSM_noLocal ).multiply( lLSM );

	}

	const lRotationPivotM_inv = lRotationPivotM.clone().invert();
	const lScalingPivotM_inv = lScalingPivotM.clone().invert();
	// Calculate the local transform matrix
	let lTransform = lTranslationM.clone().multiply( lRotationOffsetM ).multiply( lRotationPivotM ).multiply( lPreRotationM ).multiply( lRotationM ).multiply( lPostRotationM ).multiply( lRotationPivotM_inv ).multiply( lScalingOffsetM ).multiply( lScalingPivotM ).multiply( lScalingM ).multiply( lScalingPivotM_inv );

	const lLocalTWithAllPivotAndOffsetInfo = new three__WEBPACK_IMPORTED_MODULE_2__.Matrix4().copyPosition( lTransform );

	const lGlobalTranslation = lParentGX.clone().multiply( lLocalTWithAllPivotAndOffsetInfo );
	lGlobalT.copyPosition( lGlobalTranslation );

	lTransform = lGlobalT.clone().multiply( lGlobalRS );

	// from global to local
	lTransform.premultiply( lParentGX.invert() );

	return lTransform;

}

// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
function getEulerOrder( order ) {

	order = order || 0;

	const enums = [
		'ZYX', // -> XYZ extrinsic
		'YZX', // -> XZY extrinsic
		'XZY', // -> YZX extrinsic
		'ZXY', // -> YXZ extrinsic
		'YXZ', // -> ZXY extrinsic
		'XYZ', // -> ZYX extrinsic
		//'SphericXYZ', // not possible to support
	];

	if ( order === 6 ) {

		console.warn( 'THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.' );
		return enums[ 0 ];

	}

	return enums[ order ];

}

// Parses comma separated list of numbers and returns them an array.
// Used internally by the TextParser
function parseNumberArray( value ) {

	const array = value.split( ',' ).map( function ( val ) {

		return parseFloat( val );

	} );

	return array;

}

function convertArrayBufferToString( buffer, from, to ) {

	if ( from === undefined ) from = 0;
	if ( to === undefined ) to = buffer.byteLength;

	return three__WEBPACK_IMPORTED_MODULE_2__.LoaderUtils.decodeText( new Uint8Array( buffer, from, to ) );

}

function append( a, b ) {

	for ( let i = 0, j = a.length, l = b.length; i < l; i ++, j ++ ) {

		a[ j ] = b[ i ];

	}

}

function slice( a, b, from, to ) {

	for ( let i = from, j = 0; i < to; i ++, j ++ ) {

		a[ j ] = b[ i ];

	}

	return a;

}

// inject array a2 into array a1 at index
function inject( a1, index, a2 ) {

	return a1.slice( 0, index ).concat( a2 ).concat( a1.slice( index ) );

}




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWxwLy4vbm9kZV9tb2R1bGVzL3RocmVlL2V4YW1wbGVzL2pzbS9jdXJ2ZXMvTlVSQlNDdXJ2ZS5qcyIsIndlYnBhY2s6Ly9ndWxwLy4vbm9kZV9tb2R1bGVzL3RocmVlL2V4YW1wbGVzL2pzbS9jdXJ2ZXMvTlVSQlNVdGlscy5qcyIsIndlYnBhY2s6Ly9ndWxwLy4vbm9kZV9tb2R1bGVzL3RocmVlL2V4YW1wbGVzL2pzbS9saWJzL2ZmbGF0ZS5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vZ3VscC8uL25vZGVfbW9kdWxlcy90aHJlZS9leGFtcGxlcy9qc20vbG9hZGVycy9GQlhMb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBSWU7QUFDdUM7O0FBRXREO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEseUJBQXlCLHdDQUFLOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLDBCQUEwQjs7QUFFNUM7QUFDQTtBQUNBLGlDQUFpQywwQ0FBTzs7QUFFeEM7O0FBRUE7O0FBRUEsbUNBQW1DLDBDQUFPOztBQUUxQzs7QUFFQSw2R0FBNkc7O0FBRTdHO0FBQ0EsaUJBQWlCLG1FQUEyQjs7QUFFNUM7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxxQ0FBcUMsMENBQU87O0FBRTVDOztBQUVBO0FBQ0EsZUFBZSx1RUFBK0I7QUFDOUM7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRXNCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUVQOztBQUVmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7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cUI7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDMEI7QUFDcEI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsZUFBZTtBQUNsQztBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxlQUFlO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ3FCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDcUI7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQSx1QkFBdUIsZ0JBQWdCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsY0FBYztBQUN4QyxtQkFBbUIsT0FBTztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBLHVCQUF1QixnQkFBZ0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnREFBZ0Q7QUFDeEU7QUFDQSw0QkFBNEIsK0NBQStDO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLGVBQWU7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUN5QjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDcUI7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQzBCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxvQkFBb0I7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGdDQUFnQztBQUNoQyxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsZ0JBQWdCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLGdCQUFnQjtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxnQkFBZ0I7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNjO0FBQ1I7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGlCQUFpQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFVBQVU7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFVBQVU7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGtCQUFrQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUMyQjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDdUI7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUM0QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQSwyQ0FBMkM7O0FBRTNDO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSixHQUFHOztBQUVIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFrQixvQkFBb0I7O0FBRXRDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxnQ0FBZ0MseURBQXNCO0FBQ3REOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixnQ0FBZ0M7O0FBRWxEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsT0FBTyw2REFBVTs7QUFFakI7QUFDQSxjQUFjLGlEQUFjOztBQUU1Qjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLGNBQWMsaURBQWM7O0FBRTVCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSwyQ0FBMkMsT0FBTzs7QUFFbEQsMkJBQTJCLDBDQUFPOztBQUVsQzs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUEsbUJBQW1CLFlBQVk7O0FBRS9COztBQUVBOztBQUVBOztBQUVBLG9CQUFvQiw2REFBVTtBQUM5Qjs7QUFFQSxhQUFhLGlEQUFjOztBQUUzQjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGVBQWU7O0FBRWY7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxTQUFTOztBQUVUOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEseUNBQXlDLG1FQUFnQztBQUN6RTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxVQUFVOztBQUVWLHNEQUFzRCwwQ0FBTzs7QUFFN0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsT0FBTzs7QUFFUDs7QUFFQTs7QUFFQTs7QUFFQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSx3Q0FBd0MsbUVBQWdDO0FBQ3hFOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxHQUFHOztBQUVILGFBQWEsZ0RBQWE7O0FBRTFCOztBQUVBOztBQUVBOztBQUVBLDRCQUE0QiwwQ0FBTztBQUNuQyw0QkFBNEIsNkNBQVU7QUFDdEMseUJBQXlCLDBDQUFPOztBQUVoQzs7QUFFQTtBQUNBLHdCQUF3Qix3Q0FBSztBQUM3Qjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsYUFBYSxzREFBbUI7O0FBRWhDOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsMENBQTBDLHFEQUFrQjs7QUFFNUQ7O0FBRUE7O0FBRUE7QUFDQSwwQ0FBMEMscURBQWtCOztBQUU1RDs7QUFFQTs7QUFFQTtBQUNBLDBDQUEwQyxxREFBa0I7O0FBRTVEOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsa0NBQWtDLHFEQUFrQjtBQUNwRDs7QUFFQSxxQkFBcUIsd0NBQUs7QUFDMUIscUJBQXFCLDZDQUFVOztBQUUvQjs7QUFFQTs7QUFFQSxvQ0FBb0MscURBQWtCO0FBQ3REOztBQUVBLHNCQUFzQix3Q0FBSztBQUMzQixzQkFBc0IsNkNBQVU7O0FBRWhDOztBQUVBLHlCQUF5Qiw2Q0FBVTtBQUNuQyxvQkFBb0Isd0NBQUs7O0FBRXpCOztBQUVBLGtCQUFrQixtQkFBbUI7O0FBRXJDOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsYUFBYSwwREFBdUI7O0FBRXBDOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQSxhQUFhLHNEQUFtQjs7QUFFaEM7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUIsa0JBQWtCOztBQUVyQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQix5QkFBeUI7O0FBRTNDO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsOENBQThDO0FBQzlDOztBQUVBOztBQUVBLDRDQUE0Qyw0QkFBNEIsWUFBWTtBQUNwRiwyQ0FBMkMsZ0NBQWdDO0FBQzNFLHNDQUFzQyxxQ0FBcUM7O0FBRTNFOztBQUVBOztBQUVBLElBQUk7O0FBRUo7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQSxJQUFJLGdDQUFnQzs7QUFFcEM7QUFDQTtBQUNBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSCxnQkFBZ0I7QUFDaEI7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxHQUFHLE9BQU87O0FBRVY7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUEsSUFBSTs7QUFFSjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLFVBQVU7O0FBRVY7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0Esb0JBQW9COztBQUVwQjs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsZ0VBQWdFOztBQUVoRTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsa0JBQWtCLG1CQUFtQjs7QUFFckM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzREFBc0Q7QUFDdEQ7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsbUNBQW1DOztBQUVuQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQSxJQUFJOztBQUVKOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0NBQXdDO0FBQ3hDOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLGdCQUFnQixtREFBTTs7QUFFdEI7O0FBRUE7O0FBRUEsaUJBQWlCLDhEQUFpQixnRUFBZ0U7QUFDbEc7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsa0JBQWtCLFVBQVU7O0FBRTVCOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLGtCQUFrQixVQUFVOztBQUU1Qjs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxrQkFBa0IsVUFBVTs7QUFFNUI7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsa0JBQWtCLFVBQVU7O0FBRTVCOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxrQkFBa0IsVUFBVTs7QUFFNUI7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLHVEQUF1RDtBQUN2RDs7QUFFQSxrQkFBa0IsVUFBVTs7QUFFNUI7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxTQUFTLHlEQUFzQjs7QUFFL0I7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLGlCQUFpQixvQkFBb0I7O0FBRXJDO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsc0JBQXNCLHdDQUFLO0FBQzNCLG9CQUFvQiwwQ0FBTzs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCLDBDQUFPO0FBQ2xDLDJCQUEyQiwwQ0FBTztBQUNsQyx3QkFBd0IsMENBQU87QUFDL0IsNEJBQTRCLDBDQUFPOztBQUVuQyx1QkFBdUIsMENBQU87QUFDOUIsNEJBQTRCLDBDQUFPO0FBQ25DLDZCQUE2QiwwQ0FBTztBQUNwQyw4QkFBOEIsMENBQU87QUFDckMsNkJBQTZCLDBDQUFPOztBQUVwQyx1QkFBdUIsMENBQU87QUFDOUIsdUJBQXVCLDBDQUFPO0FBQzlCLHNCQUFzQiwwQ0FBTzs7QUFFN0I7O0FBRUE7O0FBRUE7O0FBRUEsK0NBQStDLHFEQUFrQjtBQUNqRTtBQUNBOztBQUVBOztBQUVBOztBQUVBLDRDQUE0QyxxREFBa0I7QUFDOUQ7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxnREFBZ0QscURBQWtCO0FBQ2xFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0Esd0JBQXdCLDBDQUFPO0FBQy9COztBQUVBO0FBQ0EsdUJBQXVCLDBDQUFPO0FBQzlCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx1QkFBdUIsMENBQU87O0FBRTlCOztBQUVBOztBQUVBLEVBQUU7O0FBRUY7O0FBRUEsRUFBRTs7QUFFRix5QkFBeUIsMENBQU8sY0FBYywwQ0FBTztBQUNyRDtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDhDQUE4QywwQ0FBTzs7QUFFckQ7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsRUFBRTs7QUFFRjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLFFBQVEseURBQXNCOztBQUU5Qjs7QUFFQTs7QUFFQSw2Q0FBNkMsT0FBTzs7QUFFcEQ7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsMkJBQTJCLFFBQVE7O0FBRW5DOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRXFCIiwiZmlsZSI6IkZCWExvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEN1cnZlLFxuXHRWZWN0b3IzLFxuXHRWZWN0b3I0XG59IGZyb20gJ3RocmVlJztcbmltcG9ydCAqIGFzIE5VUkJTVXRpbHMgZnJvbSAnLi4vY3VydmVzL05VUkJTVXRpbHMuanMnO1xuXG4vKipcbiAqIE5VUkJTIGN1cnZlIG9iamVjdFxuICpcbiAqIERlcml2ZXMgZnJvbSBDdXJ2ZSwgb3ZlcnJpZGluZyBnZXRQb2ludCBhbmQgZ2V0VGFuZ2VudC5cbiAqXG4gKiBJbXBsZW1lbnRhdGlvbiBpcyBiYXNlZCBvbiAoeCwgeSBbLCB6PTAgWywgdz0xXV0pIGNvbnRyb2wgcG9pbnRzIHdpdGggdz13ZWlnaHQuXG4gKlxuICoqL1xuXG5jbGFzcyBOVVJCU0N1cnZlIGV4dGVuZHMgQ3VydmUge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGRlZ3JlZSxcblx0XHRrbm90cyAvKiBhcnJheSBvZiByZWFscyAqLyxcblx0XHRjb250cm9sUG9pbnRzIC8qIGFycmF5IG9mIFZlY3RvcigyfDN8NCkgKi8sXG5cdFx0c3RhcnRLbm90IC8qIGluZGV4IGluIGtub3RzICovLFxuXHRcdGVuZEtub3QgLyogaW5kZXggaW4ga25vdHMgKi9cblx0KSB7XG5cblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5kZWdyZWUgPSBkZWdyZWU7XG5cdFx0dGhpcy5rbm90cyA9IGtub3RzO1xuXHRcdHRoaXMuY29udHJvbFBvaW50cyA9IFtdO1xuXHRcdC8vIFVzZWQgYnkgcGVyaW9kaWMgTlVSQlMgdG8gcmVtb3ZlIGhpZGRlbiBzcGFuc1xuXHRcdHRoaXMuc3RhcnRLbm90ID0gc3RhcnRLbm90IHx8IDA7XG5cdFx0dGhpcy5lbmRLbm90ID0gZW5kS25vdCB8fCAoIHRoaXMua25vdHMubGVuZ3RoIC0gMSApO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgY29udHJvbFBvaW50cy5sZW5ndGg7ICsrIGkgKSB7XG5cblx0XHRcdC8vIGVuc3VyZSBWZWN0b3I0IGZvciBjb250cm9sIHBvaW50c1xuXHRcdFx0Y29uc3QgcG9pbnQgPSBjb250cm9sUG9pbnRzWyBpIF07XG5cdFx0XHR0aGlzLmNvbnRyb2xQb2ludHNbIGkgXSA9IG5ldyBWZWN0b3I0KCBwb2ludC54LCBwb2ludC55LCBwb2ludC56LCBwb2ludC53ICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGdldFBvaW50KCB0LCBvcHRpb25hbFRhcmdldCA9IG5ldyBWZWN0b3IzKCkgKSB7XG5cblx0XHRjb25zdCBwb2ludCA9IG9wdGlvbmFsVGFyZ2V0O1xuXG5cdFx0Y29uc3QgdSA9IHRoaXMua25vdHNbIHRoaXMuc3RhcnRLbm90IF0gKyB0ICogKCB0aGlzLmtub3RzWyB0aGlzLmVuZEtub3QgXSAtIHRoaXMua25vdHNbIHRoaXMuc3RhcnRLbm90IF0gKTsgLy8gbGluZWFyIG1hcHBpbmcgdC0+dVxuXG5cdFx0Ly8gZm9sbG93aW5nIHJlc3VsdHMgaW4gKHd4LCB3eSwgd3osIHcpIGhvbW9nZW5lb3VzIHBvaW50XG5cdFx0Y29uc3QgaHBvaW50ID0gTlVSQlNVdGlscy5jYWxjQlNwbGluZVBvaW50KCB0aGlzLmRlZ3JlZSwgdGhpcy5rbm90cywgdGhpcy5jb250cm9sUG9pbnRzLCB1ICk7XG5cblx0XHRpZiAoIGhwb2ludC53ICE9PSAxLjAgKSB7XG5cblx0XHRcdC8vIHByb2plY3QgdG8gM0Qgc3BhY2U6ICh3eCwgd3ksIHd6LCB3KSAtPiAoeCwgeSwgeiwgMSlcblx0XHRcdGhwb2ludC5kaXZpZGVTY2FsYXIoIGhwb2ludC53ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gcG9pbnQuc2V0KCBocG9pbnQueCwgaHBvaW50LnksIGhwb2ludC56ICk7XG5cblx0fVxuXG5cdGdldFRhbmdlbnQoIHQsIG9wdGlvbmFsVGFyZ2V0ID0gbmV3IFZlY3RvcjMoKSApIHtcblxuXHRcdGNvbnN0IHRhbmdlbnQgPSBvcHRpb25hbFRhcmdldDtcblxuXHRcdGNvbnN0IHUgPSB0aGlzLmtub3RzWyAwIF0gKyB0ICogKCB0aGlzLmtub3RzWyB0aGlzLmtub3RzLmxlbmd0aCAtIDEgXSAtIHRoaXMua25vdHNbIDAgXSApO1xuXHRcdGNvbnN0IGRlcnMgPSBOVVJCU1V0aWxzLmNhbGNOVVJCU0Rlcml2YXRpdmVzKCB0aGlzLmRlZ3JlZSwgdGhpcy5rbm90cywgdGhpcy5jb250cm9sUG9pbnRzLCB1LCAxICk7XG5cdFx0dGFuZ2VudC5jb3B5KCBkZXJzWyAxIF0gKS5ub3JtYWxpemUoKTtcblxuXHRcdHJldHVybiB0YW5nZW50O1xuXG5cdH1cblxufVxuXG5leHBvcnQgeyBOVVJCU0N1cnZlIH07XG4iLCJpbXBvcnQge1xuXHRWZWN0b3IzLFxuXHRWZWN0b3I0XG59IGZyb20gJ3RocmVlJztcblxuLyoqXG4gKiBOVVJCUyB1dGlsc1xuICpcbiAqIFNlZSBOVVJCU0N1cnZlIGFuZCBOVVJCU1N1cmZhY2UuXG4gKiovXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKlx0TlVSQlMgVXRpbHNcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLypcbkZpbmRzIGtub3QgdmVjdG9yIHNwYW4uXG5cbnAgOiBkZWdyZWVcbnUgOiBwYXJhbWV0cmljIHZhbHVlXG5VIDoga25vdCB2ZWN0b3JcblxucmV0dXJucyB0aGUgc3BhblxuKi9cbmZ1bmN0aW9uIGZpbmRTcGFuKCBwLCB1LCBVICkge1xuXG5cdGNvbnN0IG4gPSBVLmxlbmd0aCAtIHAgLSAxO1xuXG5cdGlmICggdSA+PSBVWyBuIF0gKSB7XG5cblx0XHRyZXR1cm4gbiAtIDE7XG5cblx0fVxuXG5cdGlmICggdSA8PSBVWyBwIF0gKSB7XG5cblx0XHRyZXR1cm4gcDtcblxuXHR9XG5cblx0bGV0IGxvdyA9IHA7XG5cdGxldCBoaWdoID0gbjtcblx0bGV0IG1pZCA9IE1hdGguZmxvb3IoICggbG93ICsgaGlnaCApIC8gMiApO1xuXG5cdHdoaWxlICggdSA8IFVbIG1pZCBdIHx8IHUgPj0gVVsgbWlkICsgMSBdICkge1xuXG5cdFx0aWYgKCB1IDwgVVsgbWlkIF0gKSB7XG5cblx0XHRcdGhpZ2ggPSBtaWQ7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRsb3cgPSBtaWQ7XG5cblx0XHR9XG5cblx0XHRtaWQgPSBNYXRoLmZsb29yKCAoIGxvdyArIGhpZ2ggKSAvIDIgKTtcblxuXHR9XG5cblx0cmV0dXJuIG1pZDtcblxufVxuXG5cbi8qXG5DYWxjdWxhdGUgYmFzaXMgZnVuY3Rpb25zLiBTZWUgVGhlIE5VUkJTIEJvb2ssIHBhZ2UgNzAsIGFsZ29yaXRobSBBMi4yXG5cbnNwYW4gOiBzcGFuIGluIHdoaWNoIHUgbGllc1xudSAgICA6IHBhcmFtZXRyaWMgcG9pbnRcbnAgICAgOiBkZWdyZWVcblUgICAgOiBrbm90IHZlY3RvclxuXG5yZXR1cm5zIGFycmF5W3ArMV0gd2l0aCBiYXNpcyBmdW5jdGlvbnMgdmFsdWVzLlxuKi9cbmZ1bmN0aW9uIGNhbGNCYXNpc0Z1bmN0aW9ucyggc3BhbiwgdSwgcCwgVSApIHtcblxuXHRjb25zdCBOID0gW107XG5cdGNvbnN0IGxlZnQgPSBbXTtcblx0Y29uc3QgcmlnaHQgPSBbXTtcblx0TlsgMCBdID0gMS4wO1xuXG5cdGZvciAoIGxldCBqID0gMTsgaiA8PSBwOyArKyBqICkge1xuXG5cdFx0bGVmdFsgaiBdID0gdSAtIFVbIHNwYW4gKyAxIC0gaiBdO1xuXHRcdHJpZ2h0WyBqIF0gPSBVWyBzcGFuICsgaiBdIC0gdTtcblxuXHRcdGxldCBzYXZlZCA9IDAuMDtcblxuXHRcdGZvciAoIGxldCByID0gMDsgciA8IGo7ICsrIHIgKSB7XG5cblx0XHRcdGNvbnN0IHJ2ID0gcmlnaHRbIHIgKyAxIF07XG5cdFx0XHRjb25zdCBsdiA9IGxlZnRbIGogLSByIF07XG5cdFx0XHRjb25zdCB0ZW1wID0gTlsgciBdIC8gKCBydiArIGx2ICk7XG5cdFx0XHROWyByIF0gPSBzYXZlZCArIHJ2ICogdGVtcDtcblx0XHRcdHNhdmVkID0gbHYgKiB0ZW1wO1xuXG5cdFx0fVxuXG5cdFx0TlsgaiBdID0gc2F2ZWQ7XG5cblx0fVxuXG5cdHJldHVybiBOO1xuXG59XG5cblxuLypcbkNhbGN1bGF0ZSBCLVNwbGluZSBjdXJ2ZSBwb2ludHMuIFNlZSBUaGUgTlVSQlMgQm9vaywgcGFnZSA4MiwgYWxnb3JpdGhtIEEzLjEuXG5cbnAgOiBkZWdyZWUgb2YgQi1TcGxpbmVcblUgOiBrbm90IHZlY3RvclxuUCA6IGNvbnRyb2wgcG9pbnRzICh4LCB5LCB6LCB3KVxudSA6IHBhcmFtZXRyaWMgcG9pbnRcblxucmV0dXJucyBwb2ludCBmb3IgZ2l2ZW4gdVxuKi9cbmZ1bmN0aW9uIGNhbGNCU3BsaW5lUG9pbnQoIHAsIFUsIFAsIHUgKSB7XG5cblx0Y29uc3Qgc3BhbiA9IGZpbmRTcGFuKCBwLCB1LCBVICk7XG5cdGNvbnN0IE4gPSBjYWxjQmFzaXNGdW5jdGlvbnMoIHNwYW4sIHUsIHAsIFUgKTtcblx0Y29uc3QgQyA9IG5ldyBWZWN0b3I0KCAwLCAwLCAwLCAwICk7XG5cblx0Zm9yICggbGV0IGogPSAwOyBqIDw9IHA7ICsrIGogKSB7XG5cblx0XHRjb25zdCBwb2ludCA9IFBbIHNwYW4gLSBwICsgaiBdO1xuXHRcdGNvbnN0IE5qID0gTlsgaiBdO1xuXHRcdGNvbnN0IHdOaiA9IHBvaW50LncgKiBOajtcblx0XHRDLnggKz0gcG9pbnQueCAqIHdOajtcblx0XHRDLnkgKz0gcG9pbnQueSAqIHdOajtcblx0XHRDLnogKz0gcG9pbnQueiAqIHdOajtcblx0XHRDLncgKz0gcG9pbnQudyAqIE5qO1xuXG5cdH1cblxuXHRyZXR1cm4gQztcblxufVxuXG5cbi8qXG5DYWxjdWxhdGUgYmFzaXMgZnVuY3Rpb25zIGRlcml2YXRpdmVzLiBTZWUgVGhlIE5VUkJTIEJvb2ssIHBhZ2UgNzIsIGFsZ29yaXRobSBBMi4zLlxuXG5zcGFuIDogc3BhbiBpbiB3aGljaCB1IGxpZXNcbnUgICAgOiBwYXJhbWV0cmljIHBvaW50XG5wICAgIDogZGVncmVlXG5uICAgIDogbnVtYmVyIG9mIGRlcml2YXRpdmVzIHRvIGNhbGN1bGF0ZVxuVSAgICA6IGtub3QgdmVjdG9yXG5cbnJldHVybnMgYXJyYXlbbisxXVtwKzFdIHdpdGggYmFzaXMgZnVuY3Rpb25zIGRlcml2YXRpdmVzXG4qL1xuZnVuY3Rpb24gY2FsY0Jhc2lzRnVuY3Rpb25EZXJpdmF0aXZlcyggc3BhbiwgdSwgcCwgbiwgVSApIHtcblxuXHRjb25zdCB6ZXJvQXJyID0gW107XG5cdGZvciAoIGxldCBpID0gMDsgaSA8PSBwOyArKyBpIClcblx0XHR6ZXJvQXJyWyBpIF0gPSAwLjA7XG5cblx0Y29uc3QgZGVycyA9IFtdO1xuXG5cdGZvciAoIGxldCBpID0gMDsgaSA8PSBuOyArKyBpIClcblx0XHRkZXJzWyBpIF0gPSB6ZXJvQXJyLnNsaWNlKCAwICk7XG5cblx0Y29uc3QgbmR1ID0gW107XG5cblx0Zm9yICggbGV0IGkgPSAwOyBpIDw9IHA7ICsrIGkgKVxuXHRcdG5kdVsgaSBdID0gemVyb0Fyci5zbGljZSggMCApO1xuXG5cdG5kdVsgMCBdWyAwIF0gPSAxLjA7XG5cblx0Y29uc3QgbGVmdCA9IHplcm9BcnIuc2xpY2UoIDAgKTtcblx0Y29uc3QgcmlnaHQgPSB6ZXJvQXJyLnNsaWNlKCAwICk7XG5cblx0Zm9yICggbGV0IGogPSAxOyBqIDw9IHA7ICsrIGogKSB7XG5cblx0XHRsZWZ0WyBqIF0gPSB1IC0gVVsgc3BhbiArIDEgLSBqIF07XG5cdFx0cmlnaHRbIGogXSA9IFVbIHNwYW4gKyBqIF0gLSB1O1xuXG5cdFx0bGV0IHNhdmVkID0gMC4wO1xuXG5cdFx0Zm9yICggbGV0IHIgPSAwOyByIDwgajsgKysgciApIHtcblxuXHRcdFx0Y29uc3QgcnYgPSByaWdodFsgciArIDEgXTtcblx0XHRcdGNvbnN0IGx2ID0gbGVmdFsgaiAtIHIgXTtcblx0XHRcdG5kdVsgaiBdWyByIF0gPSBydiArIGx2O1xuXG5cdFx0XHRjb25zdCB0ZW1wID0gbmR1WyByIF1bIGogLSAxIF0gLyBuZHVbIGogXVsgciBdO1xuXHRcdFx0bmR1WyByIF1bIGogXSA9IHNhdmVkICsgcnYgKiB0ZW1wO1xuXHRcdFx0c2F2ZWQgPSBsdiAqIHRlbXA7XG5cblx0XHR9XG5cblx0XHRuZHVbIGogXVsgaiBdID0gc2F2ZWQ7XG5cblx0fVxuXG5cdGZvciAoIGxldCBqID0gMDsgaiA8PSBwOyArKyBqICkge1xuXG5cdFx0ZGVyc1sgMCBdWyBqIF0gPSBuZHVbIGogXVsgcCBdO1xuXG5cdH1cblxuXHRmb3IgKCBsZXQgciA9IDA7IHIgPD0gcDsgKysgciApIHtcblxuXHRcdGxldCBzMSA9IDA7XG5cdFx0bGV0IHMyID0gMTtcblxuXHRcdGNvbnN0IGEgPSBbXTtcblx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPD0gcDsgKysgaSApIHtcblxuXHRcdFx0YVsgaSBdID0gemVyb0Fyci5zbGljZSggMCApO1xuXG5cdFx0fVxuXG5cdFx0YVsgMCBdWyAwIF0gPSAxLjA7XG5cblx0XHRmb3IgKCBsZXQgayA9IDE7IGsgPD0gbjsgKysgayApIHtcblxuXHRcdFx0bGV0IGQgPSAwLjA7XG5cdFx0XHRjb25zdCByayA9IHIgLSBrO1xuXHRcdFx0Y29uc3QgcGsgPSBwIC0gaztcblxuXHRcdFx0aWYgKCByID49IGsgKSB7XG5cblx0XHRcdFx0YVsgczIgXVsgMCBdID0gYVsgczEgXVsgMCBdIC8gbmR1WyBwayArIDEgXVsgcmsgXTtcblx0XHRcdFx0ZCA9IGFbIHMyIF1bIDAgXSAqIG5kdVsgcmsgXVsgcGsgXTtcblxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBqMSA9ICggcmsgPj0gLSAxICkgPyAxIDogLSByaztcblx0XHRcdGNvbnN0IGoyID0gKCByIC0gMSA8PSBwayApID8gayAtIDEgOiBwIC0gcjtcblxuXHRcdFx0Zm9yICggbGV0IGogPSBqMTsgaiA8PSBqMjsgKysgaiApIHtcblxuXHRcdFx0XHRhWyBzMiBdWyBqIF0gPSAoIGFbIHMxIF1bIGogXSAtIGFbIHMxIF1bIGogLSAxIF0gKSAvIG5kdVsgcGsgKyAxIF1bIHJrICsgaiBdO1xuXHRcdFx0XHRkICs9IGFbIHMyIF1bIGogXSAqIG5kdVsgcmsgKyBqIF1bIHBrIF07XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCByIDw9IHBrICkge1xuXG5cdFx0XHRcdGFbIHMyIF1bIGsgXSA9IC0gYVsgczEgXVsgayAtIDEgXSAvIG5kdVsgcGsgKyAxIF1bIHIgXTtcblx0XHRcdFx0ZCArPSBhWyBzMiBdWyBrIF0gKiBuZHVbIHIgXVsgcGsgXTtcblxuXHRcdFx0fVxuXG5cdFx0XHRkZXJzWyBrIF1bIHIgXSA9IGQ7XG5cblx0XHRcdGNvbnN0IGogPSBzMTtcblx0XHRcdHMxID0gczI7XG5cdFx0XHRzMiA9IGo7XG5cblx0XHR9XG5cblx0fVxuXG5cdGxldCByID0gcDtcblxuXHRmb3IgKCBsZXQgayA9IDE7IGsgPD0gbjsgKysgayApIHtcblxuXHRcdGZvciAoIGxldCBqID0gMDsgaiA8PSBwOyArKyBqICkge1xuXG5cdFx0XHRkZXJzWyBrIF1bIGogXSAqPSByO1xuXG5cdFx0fVxuXG5cdFx0ciAqPSBwIC0gaztcblxuXHR9XG5cblx0cmV0dXJuIGRlcnM7XG5cbn1cblxuXG4vKlxuXHRDYWxjdWxhdGUgZGVyaXZhdGl2ZXMgb2YgYSBCLVNwbGluZS4gU2VlIFRoZSBOVVJCUyBCb29rLCBwYWdlIDkzLCBhbGdvcml0aG0gQTMuMi5cblxuXHRwICA6IGRlZ3JlZVxuXHRVICA6IGtub3QgdmVjdG9yXG5cdFAgIDogY29udHJvbCBwb2ludHNcblx0dSAgOiBQYXJhbWV0cmljIHBvaW50c1xuXHRuZCA6IG51bWJlciBvZiBkZXJpdmF0aXZlc1xuXG5cdHJldHVybnMgYXJyYXlbZCsxXSB3aXRoIGRlcml2YXRpdmVzXG5cdCovXG5mdW5jdGlvbiBjYWxjQlNwbGluZURlcml2YXRpdmVzKCBwLCBVLCBQLCB1LCBuZCApIHtcblxuXHRjb25zdCBkdSA9IG5kIDwgcCA/IG5kIDogcDtcblx0Y29uc3QgQ0sgPSBbXTtcblx0Y29uc3Qgc3BhbiA9IGZpbmRTcGFuKCBwLCB1LCBVICk7XG5cdGNvbnN0IG5kZXJzID0gY2FsY0Jhc2lzRnVuY3Rpb25EZXJpdmF0aXZlcyggc3BhbiwgdSwgcCwgZHUsIFUgKTtcblx0Y29uc3QgUHcgPSBbXTtcblxuXHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBQLmxlbmd0aDsgKysgaSApIHtcblxuXHRcdGNvbnN0IHBvaW50ID0gUFsgaSBdLmNsb25lKCk7XG5cdFx0Y29uc3QgdyA9IHBvaW50Lnc7XG5cblx0XHRwb2ludC54ICo9IHc7XG5cdFx0cG9pbnQueSAqPSB3O1xuXHRcdHBvaW50LnogKj0gdztcblxuXHRcdFB3WyBpIF0gPSBwb2ludDtcblxuXHR9XG5cblx0Zm9yICggbGV0IGsgPSAwOyBrIDw9IGR1OyArKyBrICkge1xuXG5cdFx0Y29uc3QgcG9pbnQgPSBQd1sgc3BhbiAtIHAgXS5jbG9uZSgpLm11bHRpcGx5U2NhbGFyKCBuZGVyc1sgayBdWyAwIF0gKTtcblxuXHRcdGZvciAoIGxldCBqID0gMTsgaiA8PSBwOyArKyBqICkge1xuXG5cdFx0XHRwb2ludC5hZGQoIFB3WyBzcGFuIC0gcCArIGogXS5jbG9uZSgpLm11bHRpcGx5U2NhbGFyKCBuZGVyc1sgayBdWyBqIF0gKSApO1xuXG5cdFx0fVxuXG5cdFx0Q0tbIGsgXSA9IHBvaW50O1xuXG5cdH1cblxuXHRmb3IgKCBsZXQgayA9IGR1ICsgMTsgayA8PSBuZCArIDE7ICsrIGsgKSB7XG5cblx0XHRDS1sgayBdID0gbmV3IFZlY3RvcjQoIDAsIDAsIDAgKTtcblxuXHR9XG5cblx0cmV0dXJuIENLO1xuXG59XG5cblxuLypcbkNhbGN1bGF0ZSBcIksgb3ZlciBJXCJcblxucmV0dXJucyBrIS8oaSEoay1pKSEpXG4qL1xuZnVuY3Rpb24gY2FsY0tvdmVySSggaywgaSApIHtcblxuXHRsZXQgbm9tID0gMTtcblxuXHRmb3IgKCBsZXQgaiA9IDI7IGogPD0gazsgKysgaiApIHtcblxuXHRcdG5vbSAqPSBqO1xuXG5cdH1cblxuXHRsZXQgZGVub20gPSAxO1xuXG5cdGZvciAoIGxldCBqID0gMjsgaiA8PSBpOyArKyBqICkge1xuXG5cdFx0ZGVub20gKj0gajtcblxuXHR9XG5cblx0Zm9yICggbGV0IGogPSAyOyBqIDw9IGsgLSBpOyArKyBqICkge1xuXG5cdFx0ZGVub20gKj0gajtcblxuXHR9XG5cblx0cmV0dXJuIG5vbSAvIGRlbm9tO1xuXG59XG5cblxuLypcbkNhbGN1bGF0ZSBkZXJpdmF0aXZlcyAoMC1uZCkgb2YgcmF0aW9uYWwgY3VydmUuIFNlZSBUaGUgTlVSQlMgQm9vaywgcGFnZSAxMjcsIGFsZ29yaXRobSBBNC4yLlxuXG5QZGVycyA6IHJlc3VsdCBvZiBmdW5jdGlvbiBjYWxjQlNwbGluZURlcml2YXRpdmVzXG5cbnJldHVybnMgYXJyYXkgd2l0aCBkZXJpdmF0aXZlcyBmb3IgcmF0aW9uYWwgY3VydmUuXG4qL1xuZnVuY3Rpb24gY2FsY1JhdGlvbmFsQ3VydmVEZXJpdmF0aXZlcyggUGRlcnMgKSB7XG5cblx0Y29uc3QgbmQgPSBQZGVycy5sZW5ndGg7XG5cdGNvbnN0IEFkZXJzID0gW107XG5cdGNvbnN0IHdkZXJzID0gW107XG5cblx0Zm9yICggbGV0IGkgPSAwOyBpIDwgbmQ7ICsrIGkgKSB7XG5cblx0XHRjb25zdCBwb2ludCA9IFBkZXJzWyBpIF07XG5cdFx0QWRlcnNbIGkgXSA9IG5ldyBWZWN0b3IzKCBwb2ludC54LCBwb2ludC55LCBwb2ludC56ICk7XG5cdFx0d2RlcnNbIGkgXSA9IHBvaW50Lnc7XG5cblx0fVxuXG5cdGNvbnN0IENLID0gW107XG5cblx0Zm9yICggbGV0IGsgPSAwOyBrIDwgbmQ7ICsrIGsgKSB7XG5cblx0XHRjb25zdCB2ID0gQWRlcnNbIGsgXS5jbG9uZSgpO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAxOyBpIDw9IGs7ICsrIGkgKSB7XG5cblx0XHRcdHYuc3ViKCBDS1sgayAtIGkgXS5jbG9uZSgpLm11bHRpcGx5U2NhbGFyKCBjYWxjS292ZXJJKCBrLCBpICkgKiB3ZGVyc1sgaSBdICkgKTtcblxuXHRcdH1cblxuXHRcdENLWyBrIF0gPSB2LmRpdmlkZVNjYWxhciggd2RlcnNbIDAgXSApO1xuXG5cdH1cblxuXHRyZXR1cm4gQ0s7XG5cbn1cblxuXG4vKlxuQ2FsY3VsYXRlIE5VUkJTIGN1cnZlIGRlcml2YXRpdmVzLiBTZWUgVGhlIE5VUkJTIEJvb2ssIHBhZ2UgMTI3LCBhbGdvcml0aG0gQTQuMi5cblxucCAgOiBkZWdyZWVcblUgIDoga25vdCB2ZWN0b3JcblAgIDogY29udHJvbCBwb2ludHMgaW4gaG9tb2dlbmVvdXMgc3BhY2VcbnUgIDogcGFyYW1ldHJpYyBwb2ludHNcbm5kIDogbnVtYmVyIG9mIGRlcml2YXRpdmVzXG5cbnJldHVybnMgYXJyYXkgd2l0aCBkZXJpdmF0aXZlcy5cbiovXG5mdW5jdGlvbiBjYWxjTlVSQlNEZXJpdmF0aXZlcyggcCwgVSwgUCwgdSwgbmQgKSB7XG5cblx0Y29uc3QgUGRlcnMgPSBjYWxjQlNwbGluZURlcml2YXRpdmVzKCBwLCBVLCBQLCB1LCBuZCApO1xuXHRyZXR1cm4gY2FsY1JhdGlvbmFsQ3VydmVEZXJpdmF0aXZlcyggUGRlcnMgKTtcblxufVxuXG5cbi8qXG5DYWxjdWxhdGUgcmF0aW9uYWwgQi1TcGxpbmUgc3VyZmFjZSBwb2ludC4gU2VlIFRoZSBOVVJCUyBCb29rLCBwYWdlIDEzNCwgYWxnb3JpdGhtIEE0LjMuXG5cbnAxLCBwMiA6IGRlZ3JlZXMgb2YgQi1TcGxpbmUgc3VyZmFjZVxuVTEsIFUyIDoga25vdCB2ZWN0b3JzXG5QICAgICAgOiBjb250cm9sIHBvaW50cyAoeCwgeSwgeiwgdylcbnUsIHYgICA6IHBhcmFtZXRyaWMgdmFsdWVzXG5cbnJldHVybnMgcG9pbnQgZm9yIGdpdmVuICh1LCB2KVxuKi9cbmZ1bmN0aW9uIGNhbGNTdXJmYWNlUG9pbnQoIHAsIHEsIFUsIFYsIFAsIHUsIHYsIHRhcmdldCApIHtcblxuXHRjb25zdCB1c3BhbiA9IGZpbmRTcGFuKCBwLCB1LCBVICk7XG5cdGNvbnN0IHZzcGFuID0gZmluZFNwYW4oIHEsIHYsIFYgKTtcblx0Y29uc3QgTnUgPSBjYWxjQmFzaXNGdW5jdGlvbnMoIHVzcGFuLCB1LCBwLCBVICk7XG5cdGNvbnN0IE52ID0gY2FsY0Jhc2lzRnVuY3Rpb25zKCB2c3BhbiwgdiwgcSwgViApO1xuXHRjb25zdCB0ZW1wID0gW107XG5cblx0Zm9yICggbGV0IGwgPSAwOyBsIDw9IHE7ICsrIGwgKSB7XG5cblx0XHR0ZW1wWyBsIF0gPSBuZXcgVmVjdG9yNCggMCwgMCwgMCwgMCApO1xuXHRcdGZvciAoIGxldCBrID0gMDsgayA8PSBwOyArKyBrICkge1xuXG5cdFx0XHRjb25zdCBwb2ludCA9IFBbIHVzcGFuIC0gcCArIGsgXVsgdnNwYW4gLSBxICsgbCBdLmNsb25lKCk7XG5cdFx0XHRjb25zdCB3ID0gcG9pbnQudztcblx0XHRcdHBvaW50LnggKj0gdztcblx0XHRcdHBvaW50LnkgKj0gdztcblx0XHRcdHBvaW50LnogKj0gdztcblx0XHRcdHRlbXBbIGwgXS5hZGQoIHBvaW50Lm11bHRpcGx5U2NhbGFyKCBOdVsgayBdICkgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Y29uc3QgU3cgPSBuZXcgVmVjdG9yNCggMCwgMCwgMCwgMCApO1xuXHRmb3IgKCBsZXQgbCA9IDA7IGwgPD0gcTsgKysgbCApIHtcblxuXHRcdFN3LmFkZCggdGVtcFsgbCBdLm11bHRpcGx5U2NhbGFyKCBOdlsgbCBdICkgKTtcblxuXHR9XG5cblx0U3cuZGl2aWRlU2NhbGFyKCBTdy53ICk7XG5cdHRhcmdldC5zZXQoIFN3LngsIFN3LnksIFN3LnogKTtcblxufVxuXG5cblxuZXhwb3J0IHtcblx0ZmluZFNwYW4sXG5cdGNhbGNCYXNpc0Z1bmN0aW9ucyxcblx0Y2FsY0JTcGxpbmVQb2ludCxcblx0Y2FsY0Jhc2lzRnVuY3Rpb25EZXJpdmF0aXZlcyxcblx0Y2FsY0JTcGxpbmVEZXJpdmF0aXZlcyxcblx0Y2FsY0tvdmVySSxcblx0Y2FsY1JhdGlvbmFsQ3VydmVEZXJpdmF0aXZlcyxcblx0Y2FsY05VUkJTRGVyaXZhdGl2ZXMsXG5cdGNhbGNTdXJmYWNlUG9pbnQsXG59O1xuIiwiLyohXG5mZmxhdGUgLSBmYXN0IEphdmFTY3JpcHQgY29tcHJlc3Npb24vZGVjb21wcmVzc2lvblxuPGh0dHBzOi8vMTAxYXJyb3d6LmdpdGh1Yi5pby9mZmxhdGU+XG5MaWNlbnNlZCB1bmRlciBNSVQuIGh0dHBzOi8vZ2l0aHViLmNvbS8xMDFhcnJvd3ovZmZsYXRlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbnZlcnNpb24gMC42LjlcbiovXG5cbi8vIERFRkxBVEUgaXMgYSBjb21wbGV4IGZvcm1hdDsgdG8gcmVhZCB0aGlzIGNvZGUsIHlvdSBzaG91bGQgcHJvYmFibHkgY2hlY2sgdGhlIFJGQyBmaXJzdDpcbi8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMxOTUxXG4vLyBZb3UgbWF5IGFsc28gd2lzaCB0byB0YWtlIGEgbG9vayBhdCB0aGUgZ3VpZGUgSSBtYWRlIGFib3V0IHRoaXMgcHJvZ3JhbTpcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzEwMWFycm93ei8yNTNmMzFlYjVhYmMzZDkyNzVhYjk0MzAwM2ZmZWNhZFxuLy8gU29tZSBvZiB0aGUgZm9sbG93aW5nIGNvZGUgaXMgc2ltaWxhciB0byB0aGF0IG9mIFVaSVAuanM6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vcGhvdG9wZWEvVVpJUC5qc1xuLy8gSG93ZXZlciwgdGhlIHZhc3QgbWFqb3JpdHkgb2YgdGhlIGNvZGViYXNlIGhhcyBkaXZlcmdlZCBmcm9tIFVaSVAuanMgdG8gaW5jcmVhc2UgcGVyZm9ybWFuY2UgYW5kIHJlZHVjZSBidW5kbGUgc2l6ZS5cbi8vIFNvbWV0aW1lcyAwIHdpbGwgYXBwZWFyIHdoZXJlIC0xIHdvdWxkIGJlIG1vcmUgYXBwcm9wcmlhdGUuIFRoaXMgaXMgYmVjYXVzZSB1c2luZyBhIHVpbnRcbi8vIGlzIGJldHRlciBmb3IgbWVtb3J5IGluIG1vc3QgZW5naW5lcyAoSSAqdGhpbmsqKS5cbnZhciBjaDIgPSB7fTtcbnZhciBkdXJsID0gZnVuY3Rpb24gKGMpIHsgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2NdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pKTsgfTtcbnZhciBjd2sgPSBmdW5jdGlvbiAodSkgeyByZXR1cm4gbmV3IFdvcmtlcih1KTsgfTtcbnRyeSB7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTChkdXJsKCcnKSk7XG59XG5jYXRjaCAoZSkge1xuICAgIC8vIFdlJ3JlIGluIERlbm8gb3IgYSB2ZXJ5IG9sZCBicm93c2VyXG4gICAgZHVybCA9IGZ1bmN0aW9uIChjKSB7IHJldHVybiAnZGF0YTphcHBsaWNhdGlvbi9qYXZhc2NyaXB0O2NoYXJzZXQ9VVRGLTgsJyArIGVuY29kZVVSSShjKTsgfTtcbiAgICAvLyBJZiBEZW5vLCB0aGlzIGlzIG5lY2Vzc2FyeTsgaWYgbm90LCB0aGlzIGNoYW5nZXMgbm90aGluZ1xuICAgIGN3ayA9IGZ1bmN0aW9uICh1KSB7IHJldHVybiBuZXcgV29ya2VyKHUsIHsgdHlwZTogJ21vZHVsZScgfSk7IH07XG59XG52YXIgd2sgPSAoZnVuY3Rpb24gKGMsIGlkLCBtc2csIHRyYW5zZmVyLCBjYikge1xuICAgIHZhciB3ID0gY3drKGNoMltpZF0gfHwgKGNoMltpZF0gPSBkdXJsKGMpKSk7XG4gICAgdy5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGNiKGUuZXJyb3IsIG51bGwpOyB9O1xuICAgIHcub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGNiKG51bGwsIGUuZGF0YSk7IH07XG4gICAgdy5wb3N0TWVzc2FnZShtc2csIHRyYW5zZmVyKTtcbiAgICByZXR1cm4gdztcbn0pO1xuXG4vLyBhbGlhc2VzIGZvciBzaG9ydGVyIGNvbXByZXNzZWQgY29kZSAobW9zdCBtaW5pZmVycyBkb24ndCBkbyB0aGlzKVxudmFyIHU4ID0gVWludDhBcnJheSwgdTE2ID0gVWludDE2QXJyYXksIHUzMiA9IFVpbnQzMkFycmF5O1xuLy8gZml4ZWQgbGVuZ3RoIGV4dHJhIGJpdHNcbnZhciBmbGViID0gbmV3IHU4KFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxLCAxLCAyLCAyLCAyLCAyLCAzLCAzLCAzLCAzLCA0LCA0LCA0LCA0LCA1LCA1LCA1LCA1LCAwLCAvKiB1bnVzZWQgKi8gMCwgMCwgLyogaW1wb3NzaWJsZSAqLyAwXSk7XG4vLyBmaXhlZCBkaXN0YW5jZSBleHRyYSBiaXRzXG4vLyBzZWUgZmxlYiBub3RlXG52YXIgZmRlYiA9IG5ldyB1OChbMCwgMCwgMCwgMCwgMSwgMSwgMiwgMiwgMywgMywgNCwgNCwgNSwgNSwgNiwgNiwgNywgNywgOCwgOCwgOSwgOSwgMTAsIDEwLCAxMSwgMTEsIDEyLCAxMiwgMTMsIDEzLCAvKiB1bnVzZWQgKi8gMCwgMF0pO1xuLy8gY29kZSBsZW5ndGggaW5kZXggbWFwXG52YXIgY2xpbSA9IG5ldyB1OChbMTYsIDE3LCAxOCwgMCwgOCwgNywgOSwgNiwgMTAsIDUsIDExLCA0LCAxMiwgMywgMTMsIDIsIDE0LCAxLCAxNV0pO1xuLy8gZ2V0IGJhc2UsIHJldmVyc2UgaW5kZXggbWFwIGZyb20gZXh0cmEgYml0c1xudmFyIGZyZWIgPSBmdW5jdGlvbiAoZWIsIHN0YXJ0KSB7XG4gICAgdmFyIGIgPSBuZXcgdTE2KDMxKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMxOyArK2kpIHtcbiAgICAgICAgYltpXSA9IHN0YXJ0ICs9IDEgPDwgZWJbaSAtIDFdO1xuICAgIH1cbiAgICAvLyBudW1iZXJzIGhlcmUgYXJlIGF0IG1heCAxOCBiaXRzXG4gICAgdmFyIHIgPSBuZXcgdTMyKGJbMzBdKTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDMwOyArK2kpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGJbaV07IGogPCBiW2kgKyAxXTsgKytqKSB7XG4gICAgICAgICAgICByW2pdID0gKChqIC0gYltpXSkgPDwgNSkgfCBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbYiwgcl07XG59O1xudmFyIF9hID0gZnJlYihmbGViLCAyKSwgZmwgPSBfYVswXSwgcmV2ZmwgPSBfYVsxXTtcbi8vIHdlIGNhbiBpZ25vcmUgdGhlIGZhY3QgdGhhdCB0aGUgb3RoZXIgbnVtYmVycyBhcmUgd3Jvbmc7IHRoZXkgbmV2ZXIgaGFwcGVuIGFueXdheVxuZmxbMjhdID0gMjU4LCByZXZmbFsyNThdID0gMjg7XG52YXIgX2IgPSBmcmViKGZkZWIsIDApLCBmZCA9IF9iWzBdLCByZXZmZCA9IF9iWzFdO1xuLy8gbWFwIG9mIHZhbHVlIHRvIHJldmVyc2UgKGFzc3VtaW5nIDE2IGJpdHMpXG52YXIgcmV2ID0gbmV3IHUxNigzMjc2OCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyNzY4OyArK2kpIHtcbiAgICAvLyByZXZlcnNlIHRhYmxlIGFsZ29yaXRobSBmcm9tIFNPXG4gICAgdmFyIHggPSAoKGkgJiAweEFBQUEpID4+PiAxKSB8ICgoaSAmIDB4NTU1NSkgPDwgMSk7XG4gICAgeCA9ICgoeCAmIDB4Q0NDQykgPj4+IDIpIHwgKCh4ICYgMHgzMzMzKSA8PCAyKTtcbiAgICB4ID0gKCh4ICYgMHhGMEYwKSA+Pj4gNCkgfCAoKHggJiAweDBGMEYpIDw8IDQpO1xuICAgIHJldltpXSA9ICgoKHggJiAweEZGMDApID4+PiA4KSB8ICgoeCAmIDB4MDBGRikgPDwgOCkpID4+PiAxO1xufVxuLy8gY3JlYXRlIGh1ZmZtYW4gdHJlZSBmcm9tIHU4IFwibWFwXCI6IGluZGV4IC0+IGNvZGUgbGVuZ3RoIGZvciBjb2RlIGluZGV4XG4vLyBtYiAobWF4IGJpdHMpIG11c3QgYmUgYXQgbW9zdCAxNVxuLy8gVE9ETzogb3B0aW1pemUvc3BsaXQgdXA/XG52YXIgaE1hcCA9IChmdW5jdGlvbiAoY2QsIG1iLCByKSB7XG4gICAgdmFyIHMgPSBjZC5sZW5ndGg7XG4gICAgLy8gaW5kZXhcbiAgICB2YXIgaSA9IDA7XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+ICMgb2YgY29kZXMgd2l0aCBiaXQgbGVuZ3RoID0gaW5kZXhcbiAgICB2YXIgbCA9IG5ldyB1MTYobWIpO1xuICAgIC8vIGxlbmd0aCBvZiBjZCBtdXN0IGJlIDI4OCAodG90YWwgIyBvZiBjb2RlcylcbiAgICBmb3IgKDsgaSA8IHM7ICsraSlcbiAgICAgICAgKytsW2NkW2ldIC0gMV07XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+IG1pbmltdW0gY29kZSBmb3IgYml0IGxlbmd0aCA9IGluZGV4XG4gICAgdmFyIGxlID0gbmV3IHUxNihtYik7XG4gICAgZm9yIChpID0gMDsgaSA8IG1iOyArK2kpIHtcbiAgICAgICAgbGVbaV0gPSAobGVbaSAtIDFdICsgbFtpIC0gMV0pIDw8IDE7XG4gICAgfVxuICAgIHZhciBjbztcbiAgICBpZiAocikge1xuICAgICAgICAvLyB1MTYgXCJtYXBcIjogaW5kZXggLT4gbnVtYmVyIG9mIGFjdHVhbCBiaXRzLCBzeW1ib2wgZm9yIGNvZGVcbiAgICAgICAgY28gPSBuZXcgdTE2KDEgPDwgbWIpO1xuICAgICAgICAvLyBiaXRzIHRvIHJlbW92ZSBmb3IgcmV2ZXJzZXJcbiAgICAgICAgdmFyIHJ2YiA9IDE1IC0gbWI7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSAwIGxlbmd0aHNcbiAgICAgICAgICAgIGlmIChjZFtpXSkge1xuICAgICAgICAgICAgICAgIC8vIG51bSBlbmNvZGluZyBib3RoIHN5bWJvbCBhbmQgYml0cyByZWFkXG4gICAgICAgICAgICAgICAgdmFyIHN2ID0gKGkgPDwgNCkgfCBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBmcmVlIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgcl8xID0gbWIgLSBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBzdGFydCB2YWx1ZVxuICAgICAgICAgICAgICAgIHZhciB2ID0gbGVbY2RbaV0gLSAxXSsrIDw8IHJfMTtcbiAgICAgICAgICAgICAgICAvLyBtIGlzIGVuZCB2YWx1ZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIG0gPSB2IHwgKCgxIDw8IHJfMSkgLSAxKTsgdiA8PSBtOyArK3YpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlcnkgMTYgYml0IHZhbHVlIHN0YXJ0aW5nIHdpdGggdGhlIGNvZGUgeWllbGRzIHRoZSBzYW1lIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICBjb1tyZXZbdl0gPj4+IHJ2Yl0gPSBzdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvID0gbmV3IHUxNihzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHM7ICsraSkge1xuICAgICAgICAgICAgaWYgKGNkW2ldKSB7XG4gICAgICAgICAgICAgICAgY29baV0gPSByZXZbbGVbY2RbaV0gLSAxXSsrXSA+Pj4gKDE1IC0gY2RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbztcbn0pO1xuLy8gZml4ZWQgbGVuZ3RoIHRyZWVcbnZhciBmbHQgPSBuZXcgdTgoMjg4KTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMTQ0OyArK2kpXG4gICAgZmx0W2ldID0gODtcbmZvciAodmFyIGkgPSAxNDQ7IGkgPCAyNTY7ICsraSlcbiAgICBmbHRbaV0gPSA5O1xuZm9yICh2YXIgaSA9IDI1NjsgaSA8IDI4MDsgKytpKVxuICAgIGZsdFtpXSA9IDc7XG5mb3IgKHZhciBpID0gMjgwOyBpIDwgMjg4OyArK2kpXG4gICAgZmx0W2ldID0gODtcbi8vIGZpeGVkIGRpc3RhbmNlIHRyZWVcbnZhciBmZHQgPSBuZXcgdTgoMzIpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgKytpKVxuICAgIGZkdFtpXSA9IDU7XG4vLyBmaXhlZCBsZW5ndGggbWFwXG52YXIgZmxtID0gLyojX19QVVJFX18qLyBoTWFwKGZsdCwgOSwgMCksIGZscm0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmx0LCA5LCAxKTtcbi8vIGZpeGVkIGRpc3RhbmNlIG1hcFxudmFyIGZkbSA9IC8qI19fUFVSRV9fKi8gaE1hcChmZHQsIDUsIDApLCBmZHJtID0gLyojX19QVVJFX18qLyBoTWFwKGZkdCwgNSwgMSk7XG4vLyBmaW5kIG1heCBvZiBhcnJheVxudmFyIG1heCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIG0gPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoYVtpXSA+IG0pXG4gICAgICAgICAgICBtID0gYVtpXTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59O1xuLy8gcmVhZCBkLCBzdGFydGluZyBhdCBiaXQgcCBhbmQgbWFzayB3aXRoIG1cbnZhciBiaXRzID0gZnVuY3Rpb24gKGQsIHAsIG0pIHtcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIHJldHVybiAoKGRbb10gfCAoZFtvICsgMV0gPDwgOCkpID4+IChwICYgNykpICYgbTtcbn07XG4vLyByZWFkIGQsIHN0YXJ0aW5nIGF0IGJpdCBwIGNvbnRpbnVpbmcgZm9yIGF0IGxlYXN0IDE2IGJpdHNcbnZhciBiaXRzMTYgPSBmdW5jdGlvbiAoZCwgcCkge1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgcmV0dXJuICgoZFtvXSB8IChkW28gKyAxXSA8PCA4KSB8IChkW28gKyAyXSA8PCAxNikpID4+IChwICYgNykpO1xufTtcbi8vIGdldCBlbmQgb2YgYnl0ZVxudmFyIHNoZnQgPSBmdW5jdGlvbiAocCkgeyByZXR1cm4gKChwIC8gOCkgfCAwKSArIChwICYgNyAmJiAxKTsgfTtcbi8vIHR5cGVkIGFycmF5IHNsaWNlIC0gYWxsb3dzIGdhcmJhZ2UgY29sbGVjdG9yIHRvIGZyZWUgb3JpZ2luYWwgcmVmZXJlbmNlLFxuLy8gd2hpbGUgYmVpbmcgbW9yZSBjb21wYXRpYmxlIHRoYW4gLnNsaWNlXG52YXIgc2xjID0gZnVuY3Rpb24gKHYsIHMsIGUpIHtcbiAgICBpZiAocyA9PSBudWxsIHx8IHMgPCAwKVxuICAgICAgICBzID0gMDtcbiAgICBpZiAoZSA9PSBudWxsIHx8IGUgPiB2Lmxlbmd0aClcbiAgICAgICAgZSA9IHYubGVuZ3RoO1xuICAgIC8vIGNhbid0IHVzZSAuY29uc3RydWN0b3IgaW4gY2FzZSB1c2VyLXN1cHBsaWVkXG4gICAgdmFyIG4gPSBuZXcgKHYgaW5zdGFuY2VvZiB1MTYgPyB1MTYgOiB2IGluc3RhbmNlb2YgdTMyID8gdTMyIDogdTgpKGUgLSBzKTtcbiAgICBuLnNldCh2LnN1YmFycmF5KHMsIGUpKTtcbiAgICByZXR1cm4gbjtcbn07XG4vLyBleHBhbmRzIHJhdyBERUZMQVRFIGRhdGFcbnZhciBpbmZsdCA9IGZ1bmN0aW9uIChkYXQsIGJ1Ziwgc3QpIHtcbiAgICAvLyBzb3VyY2UgbGVuZ3RoXG4gICAgdmFyIHNsID0gZGF0Lmxlbmd0aDtcbiAgICBpZiAoIXNsIHx8IChzdCAmJiAhc3QubCAmJiBzbCA8IDUpKVxuICAgICAgICByZXR1cm4gYnVmIHx8IG5ldyB1OCgwKTtcbiAgICAvLyBoYXZlIHRvIGVzdGltYXRlIHNpemVcbiAgICB2YXIgbm9CdWYgPSAhYnVmIHx8IHN0O1xuICAgIC8vIG5vIHN0YXRlXG4gICAgdmFyIG5vU3QgPSAhc3QgfHwgc3QuaTtcbiAgICBpZiAoIXN0KVxuICAgICAgICBzdCA9IHt9O1xuICAgIC8vIEFzc3VtZXMgcm91Z2hseSAzMyUgY29tcHJlc3Npb24gcmF0aW8gYXZlcmFnZVxuICAgIGlmICghYnVmKVxuICAgICAgICBidWYgPSBuZXcgdTgoc2wgKiAzKTtcbiAgICAvLyBlbnN1cmUgYnVmZmVyIGNhbiBmaXQgYXQgbGVhc3QgbCBlbGVtZW50c1xuICAgIHZhciBjYnVmID0gZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgdmFyIGJsID0gYnVmLmxlbmd0aDtcbiAgICAgICAgLy8gbmVlZCB0byBpbmNyZWFzZSBzaXplIHRvIGZpdFxuICAgICAgICBpZiAobCA+IGJsKSB7XG4gICAgICAgICAgICAvLyBEb3VibGUgb3Igc2V0IHRvIG5lY2Vzc2FyeSwgd2hpY2hldmVyIGlzIGdyZWF0ZXJcbiAgICAgICAgICAgIHZhciBuYnVmID0gbmV3IHU4KE1hdGgubWF4KGJsICogMiwgbCkpO1xuICAgICAgICAgICAgbmJ1Zi5zZXQoYnVmKTtcbiAgICAgICAgICAgIGJ1ZiA9IG5idWY7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vICBsYXN0IGNodW5rICAgICAgICAgYml0cG9zICAgICAgICAgICBieXRlc1xuICAgIHZhciBmaW5hbCA9IHN0LmYgfHwgMCwgcG9zID0gc3QucCB8fCAwLCBidCA9IHN0LmIgfHwgMCwgbG0gPSBzdC5sLCBkbSA9IHN0LmQsIGxidCA9IHN0Lm0sIGRidCA9IHN0Lm47XG4gICAgLy8gdG90YWwgYml0c1xuICAgIHZhciB0YnRzID0gc2wgKiA4O1xuICAgIGRvIHtcbiAgICAgICAgaWYgKCFsbSkge1xuICAgICAgICAgICAgLy8gQkZJTkFMIC0gdGhpcyBpcyBvbmx5IDEgd2hlbiBsYXN0IGNodW5rIGlzIG5leHRcbiAgICAgICAgICAgIHN0LmYgPSBmaW5hbCA9IGJpdHMoZGF0LCBwb3MsIDEpO1xuICAgICAgICAgICAgLy8gdHlwZTogMCA9IG5vIGNvbXByZXNzaW9uLCAxID0gZml4ZWQgaHVmZm1hbiwgMiA9IGR5bmFtaWMgaHVmZm1hblxuICAgICAgICAgICAgdmFyIHR5cGUgPSBiaXRzKGRhdCwgcG9zICsgMSwgMyk7XG4gICAgICAgICAgICBwb3MgKz0gMztcbiAgICAgICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIGdvIHRvIGVuZCBvZiBieXRlIGJvdW5kYXJ5XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBzaGZ0KHBvcykgKyA0LCBsID0gZGF0W3MgLSA0XSB8IChkYXRbcyAtIDNdIDw8IDgpLCB0ID0gcyArIGw7XG4gICAgICAgICAgICAgICAgaWYgKHQgPiBzbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9TdClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93ICd1bmV4cGVjdGVkIEVPRic7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgc2l6ZVxuICAgICAgICAgICAgICAgIGlmIChub0J1ZilcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIGwpO1xuICAgICAgICAgICAgICAgIC8vIENvcHkgb3ZlciB1bmNvbXByZXNzZWQgZGF0YVxuICAgICAgICAgICAgICAgIGJ1Zi5zZXQoZGF0LnN1YmFycmF5KHMsIHQpLCBidCk7XG4gICAgICAgICAgICAgICAgLy8gR2V0IG5ldyBiaXRwb3MsIHVwZGF0ZSBieXRlIGNvdW50XG4gICAgICAgICAgICAgICAgc3QuYiA9IGJ0ICs9IGwsIHN0LnAgPSBwb3MgPSB0ICogODtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMSlcbiAgICAgICAgICAgICAgICBsbSA9IGZscm0sIGRtID0gZmRybSwgbGJ0ID0gOSwgZGJ0ID0gNTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICBsaXRlcmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aHNcbiAgICAgICAgICAgICAgICB2YXIgaExpdCA9IGJpdHMoZGF0LCBwb3MsIDMxKSArIDI1NywgaGNMZW4gPSBiaXRzKGRhdCwgcG9zICsgMTAsIDE1KSArIDQ7XG4gICAgICAgICAgICAgICAgdmFyIHRsID0gaExpdCArIGJpdHMoZGF0LCBwb3MgKyA1LCAzMSkgKyAxO1xuICAgICAgICAgICAgICAgIHBvcyArPSAxNDtcbiAgICAgICAgICAgICAgICAvLyBsZW5ndGgrZGlzdGFuY2UgdHJlZVxuICAgICAgICAgICAgICAgIHZhciBsZHQgPSBuZXcgdTgodGwpO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgY2x0ID0gbmV3IHU4KDE5KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhjTGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIGluZGV4IG1hcCB0byBnZXQgcmVhbCBjb2RlXG4gICAgICAgICAgICAgICAgICAgIGNsdFtjbGltW2ldXSA9IGJpdHMoZGF0LCBwb3MgKyBpICogMywgNyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBvcyArPSBoY0xlbiAqIDM7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGhzIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgY2xiID0gbWF4KGNsdCksIGNsYm1zayA9ICgxIDw8IGNsYikgLSAxO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RocyBtYXBcbiAgICAgICAgICAgICAgICB2YXIgY2xtID0gaE1hcChjbHQsIGNsYiwgMSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0bDspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjbG1bYml0cyhkYXQsIHBvcywgY2xibXNrKV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gciAmIDE1O1xuICAgICAgICAgICAgICAgICAgICAvLyBzeW1ib2xcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByID4+PiA0O1xuICAgICAgICAgICAgICAgICAgICAvLyBjb2RlIGxlbmd0aCB0byBjb3B5XG4gICAgICAgICAgICAgICAgICAgIGlmIChzIDwgMTYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxkdFtpKytdID0gcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBjb3B5ICAgY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjID0gMCwgbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocyA9PSAxNilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gMyArIGJpdHMoZGF0LCBwb3MsIDMpLCBwb3MgKz0gMiwgYyA9IGxkdFtpIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzID09IDE3KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAzICsgYml0cyhkYXQsIHBvcywgNyksIHBvcyArPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocyA9PSAxOClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gMTEgKyBiaXRzKGRhdCwgcG9zLCAxMjcpLCBwb3MgKz0gNztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChuLS0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGR0W2krK10gPSBjO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgIGxlbmd0aCB0cmVlICAgICAgICAgICAgICAgICBkaXN0YW5jZSB0cmVlXG4gICAgICAgICAgICAgICAgdmFyIGx0ID0gbGR0LnN1YmFycmF5KDAsIGhMaXQpLCBkdCA9IGxkdC5zdWJhcnJheShoTGl0KTtcbiAgICAgICAgICAgICAgICAvLyBtYXggbGVuZ3RoIGJpdHNcbiAgICAgICAgICAgICAgICBsYnQgPSBtYXgobHQpO1xuICAgICAgICAgICAgICAgIC8vIG1heCBkaXN0IGJpdHNcbiAgICAgICAgICAgICAgICBkYnQgPSBtYXgoZHQpO1xuICAgICAgICAgICAgICAgIGxtID0gaE1hcChsdCwgbGJ0LCAxKTtcbiAgICAgICAgICAgICAgICBkbSA9IGhNYXAoZHQsIGRidCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgJ2ludmFsaWQgYmxvY2sgdHlwZSc7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAndW5leHBlY3RlZCBFT0YnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYnVmZmVyIGNhbiBob2xkIHRoaXMgKyB0aGUgbGFyZ2VzdCBwb3NzaWJsZSBhZGRpdGlvblxuICAgICAgICAvLyBNYXhpbXVtIGNodW5rIHNpemUgKHByYWN0aWNhbGx5LCB0aGVvcmV0aWNhbGx5IGluZmluaXRlKSBpcyAyXjE3O1xuICAgICAgICBpZiAobm9CdWYpXG4gICAgICAgICAgICBjYnVmKGJ0ICsgMTMxMDcyKTtcbiAgICAgICAgdmFyIGxtcyA9ICgxIDw8IGxidCkgLSAxLCBkbXMgPSAoMSA8PCBkYnQpIC0gMTtcbiAgICAgICAgdmFyIGxwb3MgPSBwb3M7XG4gICAgICAgIGZvciAoOzsgbHBvcyA9IHBvcykge1xuICAgICAgICAgICAgLy8gYml0cyByZWFkLCBjb2RlXG4gICAgICAgICAgICB2YXIgYyA9IGxtW2JpdHMxNihkYXQsIHBvcykgJiBsbXNdLCBzeW0gPSBjID4+PiA0O1xuICAgICAgICAgICAgcG9zICs9IGMgJiAxNTtcbiAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICd1bmV4cGVjdGVkIEVPRic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWMpXG4gICAgICAgICAgICAgICAgdGhyb3cgJ2ludmFsaWQgbGVuZ3RoL2xpdGVyYWwnO1xuICAgICAgICAgICAgaWYgKHN5bSA8IDI1NilcbiAgICAgICAgICAgICAgICBidWZbYnQrK10gPSBzeW07XG4gICAgICAgICAgICBlbHNlIGlmIChzeW0gPT0gMjU2KSB7XG4gICAgICAgICAgICAgICAgbHBvcyA9IHBvcywgbG0gPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGFkZCA9IHN5bSAtIDI1NDtcbiAgICAgICAgICAgICAgICAvLyBubyBleHRyYSBiaXRzIG5lZWRlZCBpZiBsZXNzXG4gICAgICAgICAgICAgICAgaWYgKHN5bSA+IDI2NCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmRleFxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IHN5bSAtIDI1NywgYiA9IGZsZWJbaV07XG4gICAgICAgICAgICAgICAgICAgIGFkZCA9IGJpdHMoZGF0LCBwb3MsICgxIDw8IGIpIC0gMSkgKyBmbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRpc3RcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRtW2JpdHMxNihkYXQsIHBvcykgJiBkbXNdLCBkc3ltID0gZCA+Pj4gNDtcbiAgICAgICAgICAgICAgICBpZiAoIWQpXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdpbnZhbGlkIGRpc3RhbmNlJztcbiAgICAgICAgICAgICAgICBwb3MgKz0gZCAmIDE1O1xuICAgICAgICAgICAgICAgIHZhciBkdCA9IGZkW2RzeW1dO1xuICAgICAgICAgICAgICAgIGlmIChkc3ltID4gMykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IGZkZWJbZHN5bV07XG4gICAgICAgICAgICAgICAgICAgIGR0ICs9IGJpdHMxNihkYXQsIHBvcykgJiAoKDEgPDwgYikgLSAxKSwgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ3VuZXhwZWN0ZWQgRU9GJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub0J1ZilcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIDEzMTA3Mik7XG4gICAgICAgICAgICAgICAgdmFyIGVuZCA9IGJ0ICsgYWRkO1xuICAgICAgICAgICAgICAgIGZvciAoOyBidCA8IGVuZDsgYnQgKz0gNCkge1xuICAgICAgICAgICAgICAgICAgICBidWZbYnRdID0gYnVmW2J0IC0gZHRdO1xuICAgICAgICAgICAgICAgICAgICBidWZbYnQgKyAxXSA9IGJ1ZltidCArIDEgLSBkdF07XG4gICAgICAgICAgICAgICAgICAgIGJ1ZltidCArIDJdID0gYnVmW2J0ICsgMiAtIGR0XTtcbiAgICAgICAgICAgICAgICAgICAgYnVmW2J0ICsgM10gPSBidWZbYnQgKyAzIC0gZHRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBidCA9IGVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdC5sID0gbG0sIHN0LnAgPSBscG9zLCBzdC5iID0gYnQ7XG4gICAgICAgIGlmIChsbSlcbiAgICAgICAgICAgIGZpbmFsID0gMSwgc3QubSA9IGxidCwgc3QuZCA9IGRtLCBzdC5uID0gZGJ0O1xuICAgIH0gd2hpbGUgKCFmaW5hbCk7XG4gICAgcmV0dXJuIGJ0ID09IGJ1Zi5sZW5ndGggPyBidWYgOiBzbGMoYnVmLCAwLCBidCk7XG59O1xuLy8gc3RhcnRpbmcgYXQgcCwgd3JpdGUgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGJpdHMgdGhhdCBjYW4gaG9sZCB2IHRvIGRcbnZhciB3Yml0cyA9IGZ1bmN0aW9uIChkLCBwLCB2KSB7XG4gICAgdiA8PD0gcCAmIDc7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICBkW29dIHw9IHY7XG4gICAgZFtvICsgMV0gfD0gdiA+Pj4gODtcbn07XG4vLyBzdGFydGluZyBhdCBwLCB3cml0ZSB0aGUgbWluaW11bSBudW1iZXIgb2YgYml0cyAoPjgpIHRoYXQgY2FuIGhvbGQgdiB0byBkXG52YXIgd2JpdHMxNiA9IGZ1bmN0aW9uIChkLCBwLCB2KSB7XG4gICAgdiA8PD0gcCAmIDc7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICBkW29dIHw9IHY7XG4gICAgZFtvICsgMV0gfD0gdiA+Pj4gODtcbiAgICBkW28gKyAyXSB8PSB2ID4+PiAxNjtcbn07XG4vLyBjcmVhdGVzIGNvZGUgbGVuZ3RocyBmcm9tIGEgZnJlcXVlbmN5IHRhYmxlXG52YXIgaFRyZWUgPSBmdW5jdGlvbiAoZCwgbWIpIHtcbiAgICAvLyBOZWVkIGV4dHJhIGluZm8gdG8gbWFrZSBhIHRyZWVcbiAgICB2YXIgdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZC5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoZFtpXSlcbiAgICAgICAgICAgIHQucHVzaCh7IHM6IGksIGY6IGRbaV0gfSk7XG4gICAgfVxuICAgIHZhciBzID0gdC5sZW5ndGg7XG4gICAgdmFyIHQyID0gdC5zbGljZSgpO1xuICAgIGlmICghcylcbiAgICAgICAgcmV0dXJuIFtldCwgMF07XG4gICAgaWYgKHMgPT0gMSkge1xuICAgICAgICB2YXIgdiA9IG5ldyB1OCh0WzBdLnMgKyAxKTtcbiAgICAgICAgdlt0WzBdLnNdID0gMTtcbiAgICAgICAgcmV0dXJuIFt2LCAxXTtcbiAgICB9XG4gICAgdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmYgLSBiLmY7IH0pO1xuICAgIC8vIGFmdGVyIGkyIHJlYWNoZXMgbGFzdCBpbmQsIHdpbGwgYmUgc3RvcHBlZFxuICAgIC8vIGZyZXEgbXVzdCBiZSBncmVhdGVyIHRoYW4gbGFyZ2VzdCBwb3NzaWJsZSBudW1iZXIgb2Ygc3ltYm9sc1xuICAgIHQucHVzaCh7IHM6IC0xLCBmOiAyNTAwMSB9KTtcbiAgICB2YXIgbCA9IHRbMF0sIHIgPSB0WzFdLCBpMCA9IDAsIGkxID0gMSwgaTIgPSAyO1xuICAgIHRbMF0gPSB7IHM6IC0xLCBmOiBsLmYgKyByLmYsIGw6IGwsIHI6IHIgfTtcbiAgICAvLyBlZmZpY2llbnQgYWxnb3JpdGhtIGZyb20gVVpJUC5qc1xuICAgIC8vIGkwIGlzIGxvb2tiZWhpbmQsIGkyIGlzIGxvb2thaGVhZCAtIGFmdGVyIHByb2Nlc3NpbmcgdHdvIGxvdy1mcmVxXG4gICAgLy8gc3ltYm9scyB0aGF0IGNvbWJpbmVkIGhhdmUgaGlnaCBmcmVxLCB3aWxsIHN0YXJ0IHByb2Nlc3NpbmcgaTIgKGhpZ2gtZnJlcSxcbiAgICAvLyBub24tY29tcG9zaXRlKSBzeW1ib2xzIGluc3RlYWRcbiAgICAvLyBzZWUgaHR0cHM6Ly9yZWRkaXQuY29tL3IvcGhvdG9wZWEvY29tbWVudHMvaWtla2h0L3V6aXBqc19xdWVzdGlvbnMvXG4gICAgd2hpbGUgKGkxICE9IHMgLSAxKSB7XG4gICAgICAgIGwgPSB0W3RbaTBdLmYgPCB0W2kyXS5mID8gaTArKyA6IGkyKytdO1xuICAgICAgICByID0gdFtpMCAhPSBpMSAmJiB0W2kwXS5mIDwgdFtpMl0uZiA/IGkwKysgOiBpMisrXTtcbiAgICAgICAgdFtpMSsrXSA9IHsgczogLTEsIGY6IGwuZiArIHIuZiwgbDogbCwgcjogciB9O1xuICAgIH1cbiAgICB2YXIgbWF4U3ltID0gdDJbMF0ucztcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAodDJbaV0ucyA+IG1heFN5bSlcbiAgICAgICAgICAgIG1heFN5bSA9IHQyW2ldLnM7XG4gICAgfVxuICAgIC8vIGNvZGUgbGVuZ3Roc1xuICAgIHZhciB0ciA9IG5ldyB1MTYobWF4U3ltICsgMSk7XG4gICAgLy8gbWF4IGJpdHMgaW4gdHJlZVxuICAgIHZhciBtYnQgPSBsbih0W2kxIC0gMV0sIHRyLCAwKTtcbiAgICBpZiAobWJ0ID4gbWIpIHtcbiAgICAgICAgLy8gbW9yZSBhbGdvcml0aG1zIGZyb20gVVpJUC5qc1xuICAgICAgICAvLyBUT0RPOiBmaW5kIG91dCBob3cgdGhpcyBjb2RlIHdvcmtzIChkZWJ0KVxuICAgICAgICAvLyAgaW5kICAgIGRlYnRcbiAgICAgICAgdmFyIGkgPSAwLCBkdCA9IDA7XG4gICAgICAgIC8vICAgIGxlZnQgICAgICAgICAgICBjb3N0XG4gICAgICAgIHZhciBsZnQgPSBtYnQgLSBtYiwgY3N0ID0gMSA8PCBsZnQ7XG4gICAgICAgIHQyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIHRyW2Iuc10gLSB0clthLnNdIHx8IGEuZiAtIGIuZjsgfSk7XG4gICAgICAgIGZvciAoOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICB2YXIgaTJfMSA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfMV0gPiBtYikge1xuICAgICAgICAgICAgICAgIGR0ICs9IGNzdCAtICgxIDw8IChtYnQgLSB0cltpMl8xXSkpO1xuICAgICAgICAgICAgICAgIHRyW2kyXzFdID0gbWI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZHQgPj4+PSBsZnQ7XG4gICAgICAgIHdoaWxlIChkdCA+IDApIHtcbiAgICAgICAgICAgIHZhciBpMl8yID0gdDJbaV0ucztcbiAgICAgICAgICAgIGlmICh0cltpMl8yXSA8IG1iKVxuICAgICAgICAgICAgICAgIGR0IC09IDEgPDwgKG1iIC0gdHJbaTJfMl0rKyAtIDEpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICsraTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKDsgaSA+PSAwICYmIGR0OyAtLWkpIHtcbiAgICAgICAgICAgIHZhciBpMl8zID0gdDJbaV0ucztcbiAgICAgICAgICAgIGlmICh0cltpMl8zXSA9PSBtYikge1xuICAgICAgICAgICAgICAgIC0tdHJbaTJfM107XG4gICAgICAgICAgICAgICAgKytkdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBtYnQgPSBtYjtcbiAgICB9XG4gICAgcmV0dXJuIFtuZXcgdTgodHIpLCBtYnRdO1xufTtcbi8vIGdldCB0aGUgbWF4IGxlbmd0aCBhbmQgYXNzaWduIGxlbmd0aCBjb2Rlc1xudmFyIGxuID0gZnVuY3Rpb24gKG4sIGwsIGQpIHtcbiAgICByZXR1cm4gbi5zID09IC0xXG4gICAgICAgID8gTWF0aC5tYXgobG4obi5sLCBsLCBkICsgMSksIGxuKG4uciwgbCwgZCArIDEpKVxuICAgICAgICA6IChsW24uc10gPSBkKTtcbn07XG4vLyBsZW5ndGggY29kZXMgZ2VuZXJhdGlvblxudmFyIGxjID0gZnVuY3Rpb24gKGMpIHtcbiAgICB2YXIgcyA9IGMubGVuZ3RoO1xuICAgIC8vIE5vdGUgdGhhdCB0aGUgc2VtaWNvbG9uIHdhcyBpbnRlbnRpb25hbFxuICAgIHdoaWxlIChzICYmICFjWy0tc10pXG4gICAgICAgIDtcbiAgICB2YXIgY2wgPSBuZXcgdTE2KCsrcyk7XG4gICAgLy8gIGluZCAgICAgIG51bSAgICAgICAgIHN0cmVha1xuICAgIHZhciBjbGkgPSAwLCBjbG4gPSBjWzBdLCBjbHMgPSAxO1xuICAgIHZhciB3ID0gZnVuY3Rpb24gKHYpIHsgY2xbY2xpKytdID0gdjsgfTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBzOyArK2kpIHtcbiAgICAgICAgaWYgKGNbaV0gPT0gY2xuICYmIGkgIT0gcylcbiAgICAgICAgICAgICsrY2xzO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghY2xuICYmIGNscyA+IDIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKDsgY2xzID4gMTM4OyBjbHMgLT0gMTM4KVxuICAgICAgICAgICAgICAgICAgICB3KDMyNzU0KTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzID4gMikge1xuICAgICAgICAgICAgICAgICAgICB3KGNscyA+IDEwID8gKChjbHMgLSAxMSkgPDwgNSkgfCAyODY5MCA6ICgoY2xzIC0gMykgPDwgNSkgfCAxMjMwNSk7XG4gICAgICAgICAgICAgICAgICAgIGNscyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2xzID4gMykge1xuICAgICAgICAgICAgICAgIHcoY2xuKSwgLS1jbHM7XG4gICAgICAgICAgICAgICAgZm9yICg7IGNscyA+IDY7IGNscyAtPSA2KVxuICAgICAgICAgICAgICAgICAgICB3KDgzMDQpO1xuICAgICAgICAgICAgICAgIGlmIChjbHMgPiAyKVxuICAgICAgICAgICAgICAgICAgICB3KCgoY2xzIC0gMykgPDwgNSkgfCA4MjA4KSwgY2xzID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChjbHMtLSlcbiAgICAgICAgICAgICAgICB3KGNsbik7XG4gICAgICAgICAgICBjbHMgPSAxO1xuICAgICAgICAgICAgY2xuID0gY1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW2NsLnN1YmFycmF5KDAsIGNsaSksIHNdO1xufTtcbi8vIGNhbGN1bGF0ZSB0aGUgbGVuZ3RoIG9mIG91dHB1dCBmcm9tIHRyZWUsIGNvZGUgbGVuZ3Roc1xudmFyIGNsZW4gPSBmdW5jdGlvbiAoY2YsIGNsKSB7XG4gICAgdmFyIGwgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2wubGVuZ3RoOyArK2kpXG4gICAgICAgIGwgKz0gY2ZbaV0gKiBjbFtpXTtcbiAgICByZXR1cm4gbDtcbn07XG4vLyB3cml0ZXMgYSBmaXhlZCBibG9ja1xuLy8gcmV0dXJucyB0aGUgbmV3IGJpdCBwb3NcbnZhciB3ZmJsayA9IGZ1bmN0aW9uIChvdXQsIHBvcywgZGF0KSB7XG4gICAgLy8gbm8gbmVlZCB0byB3cml0ZSAwMCBhcyB0eXBlOiBUeXBlZEFycmF5IGRlZmF1bHRzIHRvIDBcbiAgICB2YXIgcyA9IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBzaGZ0KHBvcyArIDIpO1xuICAgIG91dFtvXSA9IHMgJiAyNTU7XG4gICAgb3V0W28gKyAxXSA9IHMgPj4+IDg7XG4gICAgb3V0W28gKyAyXSA9IG91dFtvXSBeIDI1NTtcbiAgICBvdXRbbyArIDNdID0gb3V0W28gKyAxXSBeIDI1NTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHM7ICsraSlcbiAgICAgICAgb3V0W28gKyBpICsgNF0gPSBkYXRbaV07XG4gICAgcmV0dXJuIChvICsgNCArIHMpICogODtcbn07XG4vLyB3cml0ZXMgYSBibG9ja1xudmFyIHdibGsgPSBmdW5jdGlvbiAoZGF0LCBvdXQsIGZpbmFsLCBzeW1zLCBsZiwgZGYsIGViLCBsaSwgYnMsIGJsLCBwKSB7XG4gICAgd2JpdHMob3V0LCBwKyssIGZpbmFsKTtcbiAgICArK2xmWzI1Nl07XG4gICAgdmFyIF9hID0gaFRyZWUobGYsIDE1KSwgZGx0ID0gX2FbMF0sIG1sYiA9IF9hWzFdO1xuICAgIHZhciBfYiA9IGhUcmVlKGRmLCAxNSksIGRkdCA9IF9iWzBdLCBtZGIgPSBfYlsxXTtcbiAgICB2YXIgX2MgPSBsYyhkbHQpLCBsY2x0ID0gX2NbMF0sIG5sYyA9IF9jWzFdO1xuICAgIHZhciBfZCA9IGxjKGRkdCksIGxjZHQgPSBfZFswXSwgbmRjID0gX2RbMV07XG4gICAgdmFyIGxjZnJlcSA9IG5ldyB1MTYoMTkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGNsdC5sZW5ndGg7ICsraSlcbiAgICAgICAgbGNmcmVxW2xjbHRbaV0gJiAzMV0rKztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxjZHQubGVuZ3RoOyArK2kpXG4gICAgICAgIGxjZnJlcVtsY2R0W2ldICYgMzFdKys7XG4gICAgdmFyIF9lID0gaFRyZWUobGNmcmVxLCA3KSwgbGN0ID0gX2VbMF0sIG1sY2IgPSBfZVsxXTtcbiAgICB2YXIgbmxjYyA9IDE5O1xuICAgIGZvciAoOyBubGNjID4gNCAmJiAhbGN0W2NsaW1bbmxjYyAtIDFdXTsgLS1ubGNjKVxuICAgICAgICA7XG4gICAgdmFyIGZsZW4gPSAoYmwgKyA1KSA8PCAzO1xuICAgIHZhciBmdGxlbiA9IGNsZW4obGYsIGZsdCkgKyBjbGVuKGRmLCBmZHQpICsgZWI7XG4gICAgdmFyIGR0bGVuID0gY2xlbihsZiwgZGx0KSArIGNsZW4oZGYsIGRkdCkgKyBlYiArIDE0ICsgMyAqIG5sY2MgKyBjbGVuKGxjZnJlcSwgbGN0KSArICgyICogbGNmcmVxWzE2XSArIDMgKiBsY2ZyZXFbMTddICsgNyAqIGxjZnJlcVsxOF0pO1xuICAgIGlmIChmbGVuIDw9IGZ0bGVuICYmIGZsZW4gPD0gZHRsZW4pXG4gICAgICAgIHJldHVybiB3ZmJsayhvdXQsIHAsIGRhdC5zdWJhcnJheShicywgYnMgKyBibCkpO1xuICAgIHZhciBsbSwgbGwsIGRtLCBkbDtcbiAgICB3Yml0cyhvdXQsIHAsIDEgKyAoZHRsZW4gPCBmdGxlbikpLCBwICs9IDI7XG4gICAgaWYgKGR0bGVuIDwgZnRsZW4pIHtcbiAgICAgICAgbG0gPSBoTWFwKGRsdCwgbWxiLCAwKSwgbGwgPSBkbHQsIGRtID0gaE1hcChkZHQsIG1kYiwgMCksIGRsID0gZGR0O1xuICAgICAgICB2YXIgbGxtID0gaE1hcChsY3QsIG1sY2IsIDApO1xuICAgICAgICB3Yml0cyhvdXQsIHAsIG5sYyAtIDI1Nyk7XG4gICAgICAgIHdiaXRzKG91dCwgcCArIDUsIG5kYyAtIDEpO1xuICAgICAgICB3Yml0cyhvdXQsIHAgKyAxMCwgbmxjYyAtIDQpO1xuICAgICAgICBwICs9IDE0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5sY2M7ICsraSlcbiAgICAgICAgICAgIHdiaXRzKG91dCwgcCArIDMgKiBpLCBsY3RbY2xpbVtpXV0pO1xuICAgICAgICBwICs9IDMgKiBubGNjO1xuICAgICAgICB2YXIgbGN0cyA9IFtsY2x0LCBsY2R0XTtcbiAgICAgICAgZm9yICh2YXIgaXQgPSAwOyBpdCA8IDI7ICsraXQpIHtcbiAgICAgICAgICAgIHZhciBjbGN0ID0gbGN0c1tpdF07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsY3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVuID0gY2xjdFtpXSAmIDMxO1xuICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgbGxtW2xlbl0pLCBwICs9IGxjdFtsZW5dO1xuICAgICAgICAgICAgICAgIGlmIChsZW4gPiAxNSlcbiAgICAgICAgICAgICAgICAgICAgd2JpdHMob3V0LCBwLCAoY2xjdFtpXSA+Pj4gNSkgJiAxMjcpLCBwICs9IGNsY3RbaV0gPj4+IDEyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsbSA9IGZsbSwgbGwgPSBmbHQsIGRtID0gZmRtLCBkbCA9IGZkdDtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaTsgKytpKSB7XG4gICAgICAgIGlmIChzeW1zW2ldID4gMjU1KSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gKHN5bXNbaV0gPj4+IDE4KSAmIDMxO1xuICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIGxtW2xlbiArIDI1N10pLCBwICs9IGxsW2xlbiArIDI1N107XG4gICAgICAgICAgICBpZiAobGVuID4gNylcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIChzeW1zW2ldID4+PiAyMykgJiAzMSksIHAgKz0gZmxlYltsZW5dO1xuICAgICAgICAgICAgdmFyIGRzdCA9IHN5bXNbaV0gJiAzMTtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBkbVtkc3RdKSwgcCArPSBkbFtkc3RdO1xuICAgICAgICAgICAgaWYgKGRzdCA+IDMpXG4gICAgICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIChzeW1zW2ldID4+PiA1KSAmIDgxOTEpLCBwICs9IGZkZWJbZHN0XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBsbVtzeW1zW2ldXSksIHAgKz0gbGxbc3ltc1tpXV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2JpdHMxNihvdXQsIHAsIGxtWzI1Nl0pO1xuICAgIHJldHVybiBwICsgbGxbMjU2XTtcbn07XG4vLyBkZWZsYXRlIG9wdGlvbnMgKG5pY2UgPDwgMTMpIHwgY2hhaW5cbnZhciBkZW8gPSAvKiNfX1BVUkVfXyovIG5ldyB1MzIoWzY1NTQwLCAxMzEwODAsIDEzMTA4OCwgMTMxMTA0LCAyNjIxNzYsIDEwNDg3MDQsIDEwNDg4MzIsIDIxMTQ1NjAsIDIxMTc2MzJdKTtcbi8vIGVtcHR5XG52YXIgZXQgPSAvKiNfX1BVUkVfXyovIG5ldyB1OCgwKTtcbi8vIGNvbXByZXNzZXMgZGF0YSBpbnRvIGEgcmF3IERFRkxBVEUgYnVmZmVyXG52YXIgZGZsdCA9IGZ1bmN0aW9uIChkYXQsIGx2bCwgcGx2bCwgcHJlLCBwb3N0LCBsc3QpIHtcbiAgICB2YXIgcyA9IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBuZXcgdTgocHJlICsgcyArIDUgKiAoMSArIE1hdGguY2VpbChzIC8gNzAwMCkpICsgcG9zdCk7XG4gICAgLy8gd3JpdGluZyB0byB0aGlzIHdyaXRlcyB0byB0aGUgb3V0cHV0IGJ1ZmZlclxuICAgIHZhciB3ID0gby5zdWJhcnJheShwcmUsIG8ubGVuZ3RoIC0gcG9zdCk7XG4gICAgdmFyIHBvcyA9IDA7XG4gICAgaWYgKCFsdmwgfHwgcyA8IDgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gczsgaSArPSA2NTUzNSkge1xuICAgICAgICAgICAgLy8gZW5kXG4gICAgICAgICAgICB2YXIgZSA9IGkgKyA2NTUzNTtcbiAgICAgICAgICAgIGlmIChlIDwgcykge1xuICAgICAgICAgICAgICAgIC8vIHdyaXRlIGZ1bGwgYmxvY2tcbiAgICAgICAgICAgICAgICBwb3MgPSB3ZmJsayh3LCBwb3MsIGRhdC5zdWJhcnJheShpLCBlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB3cml0ZSBmaW5hbCBibG9ja1xuICAgICAgICAgICAgICAgIHdbaV0gPSBsc3Q7XG4gICAgICAgICAgICAgICAgcG9zID0gd2ZibGsodywgcG9zLCBkYXQuc3ViYXJyYXkoaSwgcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgb3B0ID0gZGVvW2x2bCAtIDFdO1xuICAgICAgICB2YXIgbiA9IG9wdCA+Pj4gMTMsIGMgPSBvcHQgJiA4MTkxO1xuICAgICAgICB2YXIgbXNrXzEgPSAoMSA8PCBwbHZsKSAtIDE7XG4gICAgICAgIC8vICAgIHByZXYgMi1ieXRlIHZhbCBtYXAgICAgY3VyciAyLWJ5dGUgdmFsIG1hcFxuICAgICAgICB2YXIgcHJldiA9IG5ldyB1MTYoMzI3NjgpLCBoZWFkID0gbmV3IHUxNihtc2tfMSArIDEpO1xuICAgICAgICB2YXIgYnMxXzEgPSBNYXRoLmNlaWwocGx2bCAvIDMpLCBiczJfMSA9IDIgKiBiczFfMTtcbiAgICAgICAgdmFyIGhzaCA9IGZ1bmN0aW9uIChpKSB7IHJldHVybiAoZGF0W2ldIF4gKGRhdFtpICsgMV0gPDwgYnMxXzEpIF4gKGRhdFtpICsgMl0gPDwgYnMyXzEpKSAmIG1za18xOyB9O1xuICAgICAgICAvLyAyNDU3NiBpcyBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIG1heGltdW0gc3ltYm9scyBwZXIgYmxvY2tcbiAgICAgICAgLy8gNDI0IGJ1ZmZlciBmb3IgbGFzdCBibG9ja1xuICAgICAgICB2YXIgc3ltcyA9IG5ldyB1MzIoMjUwMDApO1xuICAgICAgICAvLyBsZW5ndGgvbGl0ZXJhbCBmcmVxICAgZGlzdGFuY2UgZnJlcVxuICAgICAgICB2YXIgbGYgPSBuZXcgdTE2KDI4OCksIGRmID0gbmV3IHUxNigzMik7XG4gICAgICAgIC8vICBsL2xjbnQgIGV4Yml0cyAgaW5kZXggIGwvbGluZCAgd2FpdGR4ICBiaXRwb3NcbiAgICAgICAgdmFyIGxjXzEgPSAwLCBlYiA9IDAsIGkgPSAwLCBsaSA9IDAsIHdpID0gMCwgYnMgPSAwO1xuICAgICAgICBmb3IgKDsgaSA8IHM7ICsraSkge1xuICAgICAgICAgICAgLy8gaGFzaCB2YWx1ZVxuICAgICAgICAgICAgLy8gZGVvcHQgd2hlbiBpID4gcyAtIDMgLSBhdCBlbmQsIGRlb3B0IGFjY2VwdGFibGVcbiAgICAgICAgICAgIHZhciBodiA9IGhzaChpKTtcbiAgICAgICAgICAgIC8vIGluZGV4IG1vZCAzMjc2OCAgICBwcmV2aW91cyBpbmRleCBtb2RcbiAgICAgICAgICAgIHZhciBpbW9kID0gaSAmIDMyNzY3LCBwaW1vZCA9IGhlYWRbaHZdO1xuICAgICAgICAgICAgcHJldltpbW9kXSA9IHBpbW9kO1xuICAgICAgICAgICAgaGVhZFtodl0gPSBpbW9kO1xuICAgICAgICAgICAgLy8gV2UgYWx3YXlzIHNob3VsZCBtb2RpZnkgaGVhZCBhbmQgcHJldiwgYnV0IG9ubHkgYWRkIHN5bWJvbHMgaWZcbiAgICAgICAgICAgIC8vIHRoaXMgZGF0YSBpcyBub3QgeWV0IHByb2Nlc3NlZCAoXCJ3YWl0XCIgZm9yIHdhaXQgaW5kZXgpXG4gICAgICAgICAgICBpZiAod2kgPD0gaSkge1xuICAgICAgICAgICAgICAgIC8vIGJ5dGVzIHJlbWFpbmluZ1xuICAgICAgICAgICAgICAgIHZhciByZW0gPSBzIC0gaTtcbiAgICAgICAgICAgICAgICBpZiAoKGxjXzEgPiA3MDAwIHx8IGxpID4gMjQ1NzYpICYmIHJlbSA+IDQyMykge1xuICAgICAgICAgICAgICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgMCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGxpID0gbGNfMSA9IGViID0gMCwgYnMgPSBpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI4NjsgKytqKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGZbal0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDMwOyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBkZltqXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICBsZW4gICAgZGlzdCAgIGNoYWluXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAyLCBkID0gMCwgY2hfMSA9IGMsIGRpZiA9IChpbW9kIC0gcGltb2QpICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgaWYgKHJlbSA+IDIgJiYgaHYgPT0gaHNoKGkgLSBkaWYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhuID0gTWF0aC5taW4obiwgcmVtKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhkID0gTWF0aC5taW4oMzI3NjcsIGkpO1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXggcG9zc2libGUgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCBjYXBwZWQgYXQgZGlmIGJlY2F1c2UgZGVjb21wcmVzc29ycyBpbXBsZW1lbnQgXCJyb2xsaW5nXCIgaW5kZXggcG9wdWxhdGlvblxuICAgICAgICAgICAgICAgICAgICB2YXIgbWwgPSBNYXRoLm1pbigyNTgsIHJlbSk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChkaWYgPD0gbWF4ZCAmJiAtLWNoXzEgJiYgaW1vZCAhPSBwaW1vZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdFtpICsgbF0gPT0gZGF0W2kgKyBsIC0gZGlmXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBubCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IG5sIDwgbWwgJiYgZGF0W2kgKyBubF0gPT0gZGF0W2kgKyBubCAtIGRpZl07ICsrbmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmwgPiBsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBubCwgZCA9IGRpZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWsgb3V0IGVhcmx5IHdoZW4gd2UgcmVhY2ggXCJuaWNlXCIgKHdlIGFyZSBzYXRpc2ZpZWQgZW5vdWdoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmwgPiBtYXhuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdywgZmluZCB0aGUgcmFyZXN0IDItYnl0ZSBzZXF1ZW5jZSB3aXRoaW4gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZW5ndGggb2YgbGl0ZXJhbHMgYW5kIHNlYXJjaCBmb3IgdGhhdCBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNdWNoIGZhc3RlciB0aGFuIGp1c3QgdXNpbmcgdGhlIHN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtbWQgPSBNYXRoLm1pbihkaWYsIG5sIC0gMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbW1kOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aSA9IChpIC0gZGlmICsgaiArIDMyNzY4KSAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB0aSA9IHByZXZbdGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNkID0gKHRpIC0gcHRpICsgMzI3NjgpICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2QgPiBtZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZCA9IGNkLCBwaW1vZCA9IHRpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdGhlIHByZXZpb3VzIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpbW9kID0gcGltb2QsIHBpbW9kID0gcHJldltpbW9kXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZiArPSAoaW1vZCAtIHBpbW9kICsgMzI3NjgpICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZCB3aWxsIGJlIG5vbnplcm8gb25seSB3aGVuIGEgbWF0Y2ggd2FzIGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgYm90aCBkaXN0IGFuZCBsZW4gZGF0YSBpbiBvbmUgVWludDMyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIHJlY29nbml6ZWQgYXMgYSBsZW4vZGlzdCB3aXRoIDI4dGggYml0ICgyXjI4KVxuICAgICAgICAgICAgICAgICAgICBzeW1zW2xpKytdID0gMjY4NDM1NDU2IHwgKHJldmZsW2xdIDw8IDE4KSB8IHJldmZkW2RdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGluID0gcmV2ZmxbbF0gJiAzMSwgZGluID0gcmV2ZmRbZF0gJiAzMTtcbiAgICAgICAgICAgICAgICAgICAgZWIgKz0gZmxlYltsaW5dICsgZmRlYltkaW5dO1xuICAgICAgICAgICAgICAgICAgICArK2xmWzI1NyArIGxpbl07XG4gICAgICAgICAgICAgICAgICAgICsrZGZbZGluXTtcbiAgICAgICAgICAgICAgICAgICAgd2kgPSBpICsgbDtcbiAgICAgICAgICAgICAgICAgICAgKytsY18xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3ltc1tsaSsrXSA9IGRhdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgKytsZltkYXRbaV1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgbHN0LCBzeW1zLCBsZiwgZGYsIGViLCBsaSwgYnMsIGkgLSBicywgcG9zKTtcbiAgICAgICAgLy8gdGhpcyBpcyB0aGUgZWFzaWVzdCB3YXkgdG8gYXZvaWQgbmVlZGluZyB0byBtYWludGFpbiBzdGF0ZVxuICAgICAgICBpZiAoIWxzdCAmJiBwb3MgJiA3KVxuICAgICAgICAgICAgcG9zID0gd2ZibGsodywgcG9zICsgMSwgZXQpO1xuICAgIH1cbiAgICByZXR1cm4gc2xjKG8sIDAsIHByZSArIHNoZnQocG9zKSArIHBvc3QpO1xufTtcbi8vIENSQzMyIHRhYmxlXG52YXIgY3JjdCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdCA9IG5ldyB1MzIoMjU2KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgKytpKSB7XG4gICAgICAgIHZhciBjID0gaSwgayA9IDk7XG4gICAgICAgIHdoaWxlICgtLWspXG4gICAgICAgICAgICBjID0gKChjICYgMSkgJiYgMHhFREI4ODMyMCkgXiAoYyA+Pj4gMSk7XG4gICAgICAgIHRbaV0gPSBjO1xuICAgIH1cbiAgICByZXR1cm4gdDtcbn0pKCk7XG4vLyBDUkMzMlxudmFyIGNyYyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYyA9IC0xO1xuICAgIHJldHVybiB7XG4gICAgICAgIHA6IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAvLyBjbG9zdXJlcyBoYXZlIGF3ZnVsIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICB2YXIgY3IgPSBjO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNyID0gY3JjdFsoY3IgJiAyNTUpIF4gZFtpXV0gXiAoY3IgPj4+IDgpO1xuICAgICAgICAgICAgYyA9IGNyO1xuICAgICAgICB9LFxuICAgICAgICBkOiBmdW5jdGlvbiAoKSB7IHJldHVybiB+YzsgfVxuICAgIH07XG59O1xuLy8gQWxkZXIzMlxudmFyIGFkbGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhID0gMSwgYiA9IDA7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIC8vIGNsb3N1cmVzIGhhdmUgYXdmdWwgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIHZhciBuID0gYSwgbSA9IGI7XG4gICAgICAgICAgICB2YXIgbCA9IGQubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgIT0gbDspIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IE1hdGgubWluKGkgKyAyNjU1LCBsKTtcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IGU7ICsraSlcbiAgICAgICAgICAgICAgICAgICAgbSArPSBuICs9IGRbaV07XG4gICAgICAgICAgICAgICAgbiA9IChuICYgNjU1MzUpICsgMTUgKiAobiA+PiAxNiksIG0gPSAobSAmIDY1NTM1KSArIDE1ICogKG0gPj4gMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IG4sIGIgPSBtO1xuICAgICAgICB9LFxuICAgICAgICBkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhICU9IDY1NTIxLCBiICU9IDY1NTIxO1xuICAgICAgICAgICAgcmV0dXJuIChhICYgMjU1KSA8PCAyNCB8IChhID4+PiA4KSA8PCAxNiB8IChiICYgMjU1KSA8PCA4IHwgKGIgPj4+IDgpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG47XG4vLyBkZWZsYXRlIHdpdGggb3B0c1xudmFyIGRvcHQgPSBmdW5jdGlvbiAoZGF0LCBvcHQsIHByZSwgcG9zdCwgc3QpIHtcbiAgICByZXR1cm4gZGZsdChkYXQsIG9wdC5sZXZlbCA9PSBudWxsID8gNiA6IG9wdC5sZXZlbCwgb3B0Lm1lbSA9PSBudWxsID8gTWF0aC5jZWlsKE1hdGgubWF4KDgsIE1hdGgubWluKDEzLCBNYXRoLmxvZyhkYXQubGVuZ3RoKSkpICogMS41KSA6ICgxMiArIG9wdC5tZW0pLCBwcmUsIHBvc3QsICFzdCk7XG59O1xuLy8gV2FsbWFydCBvYmplY3Qgc3ByZWFkXG52YXIgbXJnID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIGZvciAodmFyIGsgaW4gYSlcbiAgICAgICAgb1trXSA9IGFba107XG4gICAgZm9yICh2YXIgayBpbiBiKVxuICAgICAgICBvW2tdID0gYltrXTtcbiAgICByZXR1cm4gbztcbn07XG4vLyB3b3JrZXIgY2xvbmVcbi8vIFRoaXMgaXMgcG9zc2libHkgdGhlIGNyYXppZXN0IHBhcnQgb2YgdGhlIGVudGlyZSBjb2RlYmFzZSwgZGVzcGl0ZSBob3cgc2ltcGxlIGl0IG1heSBzZWVtLlxuLy8gVGhlIG9ubHkgcGFyYW1ldGVyIHRvIHRoaXMgZnVuY3Rpb24gaXMgYSBjbG9zdXJlIHRoYXQgcmV0dXJucyBhbiBhcnJheSBvZiB2YXJpYWJsZXMgb3V0c2lkZSBvZiB0aGUgZnVuY3Rpb24gc2NvcGUuXG4vLyBXZSdyZSBnb2luZyB0byB0cnkgdG8gZmlndXJlIG91dCB0aGUgdmFyaWFibGUgbmFtZXMgdXNlZCBpbiB0aGUgY2xvc3VyZSBhcyBzdHJpbmdzIGJlY2F1c2UgdGhhdCBpcyBjcnVjaWFsIGZvciB3b3JrZXJpemF0aW9uLlxuLy8gV2Ugd2lsbCByZXR1cm4gYW4gb2JqZWN0IG1hcHBpbmcgb2YgdHJ1ZSB2YXJpYWJsZSBuYW1lIHRvIHZhbHVlIChiYXNpY2FsbHksIHRoZSBjdXJyZW50IHNjb3BlIGFzIGEgSlMgb2JqZWN0KS5cbi8vIFRoZSByZWFzb24gd2UgY2FuJ3QganVzdCB1c2UgdGhlIG9yaWdpbmFsIHZhcmlhYmxlIG5hbWVzIGlzIG1pbmlmaWVycyBtYW5nbGluZyB0aGUgdG9wbGV2ZWwgc2NvcGUuXG4vLyBUaGlzIHRvb2sgbWUgdGhyZWUgd2Vla3MgdG8gZmlndXJlIG91dCBob3cgdG8gZG8uXG52YXIgd2NsbiA9IGZ1bmN0aW9uIChmbiwgZm5TdHIsIHRkKSB7XG4gICAgdmFyIGR0ID0gZm4oKTtcbiAgICB2YXIgc3QgPSBmbi50b1N0cmluZygpO1xuICAgIHZhciBrcyA9IHN0LnNsaWNlKHN0LmluZGV4T2YoJ1snKSArIDEsIHN0Lmxhc3RJbmRleE9mKCddJykpLnJlcGxhY2UoLyAvZywgJycpLnNwbGl0KCcsJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgdiA9IGR0W2ldLCBrID0ga3NbaV07XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBmblN0ciArPSAnOycgKyBrICsgJz0nO1xuICAgICAgICAgICAgdmFyIHN0XzEgPSB2LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAodi5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgZ2xvYmFsIG9iamVjdHNcbiAgICAgICAgICAgICAgICBpZiAoc3RfMS5pbmRleE9mKCdbbmF0aXZlIGNvZGVdJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwSW5kID0gc3RfMS5pbmRleE9mKCcgJywgOCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICBmblN0ciArPSBzdF8xLnNsaWNlKHNwSW5kLCBzdF8xLmluZGV4T2YoJygnLCBzcEluZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm5TdHIgKz0gc3RfMTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgdCBpbiB2LnByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuU3RyICs9ICc7JyArIGsgKyAnLnByb3RvdHlwZS4nICsgdCArICc9JyArIHYucHJvdG90eXBlW3RdLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZuU3RyICs9IHN0XzE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGRba10gPSB2O1xuICAgIH1cbiAgICByZXR1cm4gW2ZuU3RyLCB0ZF07XG59O1xudmFyIGNoID0gW107XG4vLyBjbG9uZSBidWZzXG52YXIgY2JmcyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIHRsID0gW107XG4gICAgZm9yICh2YXIgayBpbiB2KSB7XG4gICAgICAgIGlmICh2W2tdIGluc3RhbmNlb2YgdTggfHwgdltrXSBpbnN0YW5jZW9mIHUxNiB8fCB2W2tdIGluc3RhbmNlb2YgdTMyKVxuICAgICAgICAgICAgdGwucHVzaCgodltrXSA9IG5ldyB2W2tdLmNvbnN0cnVjdG9yKHZba10pKS5idWZmZXIpO1xuICAgIH1cbiAgICByZXR1cm4gdGw7XG59O1xuLy8gdXNlIGEgd29ya2VyIHRvIGV4ZWN1dGUgY29kZVxudmFyIHdya3IgPSBmdW5jdGlvbiAoZm5zLCBpbml0LCBpZCwgY2IpIHtcbiAgICB2YXIgX2E7XG4gICAgaWYgKCFjaFtpZF0pIHtcbiAgICAgICAgdmFyIGZuU3RyID0gJycsIHRkXzEgPSB7fSwgbSA9IGZucy5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07ICsraSlcbiAgICAgICAgICAgIF9hID0gd2NsbihmbnNbaV0sIGZuU3RyLCB0ZF8xKSwgZm5TdHIgPSBfYVswXSwgdGRfMSA9IF9hWzFdO1xuICAgICAgICBjaFtpZF0gPSB3Y2xuKGZuc1ttXSwgZm5TdHIsIHRkXzEpO1xuICAgIH1cbiAgICB2YXIgdGQgPSBtcmcoe30sIGNoW2lkXVsxXSk7XG4gICAgcmV0dXJuIHdrKGNoW2lkXVswXSArICc7b25tZXNzYWdlPWZ1bmN0aW9uKGUpe2Zvcih2YXIgayBpbiBlLmRhdGEpc2VsZltrXT1lLmRhdGFba107b25tZXNzYWdlPScgKyBpbml0LnRvU3RyaW5nKCkgKyAnfScsIGlkLCB0ZCwgY2Jmcyh0ZCksIGNiKTtcbn07XG4vLyBiYXNlIGFzeW5jIGluZmxhdGUgZm5cbnZhciBiSW5mbHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbdTgsIHUxNiwgdTMyLCBmbGViLCBmZGViLCBjbGltLCBmbCwgZmQsIGZscm0sIGZkcm0sIHJldiwgaE1hcCwgbWF4LCBiaXRzLCBiaXRzMTYsIHNoZnQsIHNsYywgaW5mbHQsIGluZmxhdGVTeW5jLCBwYmYsIGd1OF07IH07XG52YXIgYkRmbHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbdTgsIHUxNiwgdTMyLCBmbGViLCBmZGViLCBjbGltLCByZXZmbCwgcmV2ZmQsIGZsbSwgZmx0LCBmZG0sIGZkdCwgcmV2LCBkZW8sIGV0LCBoTWFwLCB3Yml0cywgd2JpdHMxNiwgaFRyZWUsIGxuLCBsYywgY2xlbiwgd2ZibGssIHdibGssIHNoZnQsIHNsYywgZGZsdCwgZG9wdCwgZGVmbGF0ZVN5bmMsIHBiZl07IH07XG4vLyBnemlwIGV4dHJhXG52YXIgZ3plID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6aCwgZ3pobCwgd2J5dGVzLCBjcmMsIGNyY3RdOyB9O1xuLy8gZ3VuemlwIGV4dHJhXG52YXIgZ3V6ZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtnenMsIGd6bF07IH07XG4vLyB6bGliIGV4dHJhXG52YXIgemxlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3psaCwgd2J5dGVzLCBhZGxlcl07IH07XG4vLyB1bnpsaWIgZXh0cmFcbnZhciB6dWxlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3psdl07IH07XG4vLyBwb3N0IGJ1ZlxudmFyIHBiZiA9IGZ1bmN0aW9uIChtc2cpIHsgcmV0dXJuIHBvc3RNZXNzYWdlKG1zZywgW21zZy5idWZmZXJdKTsgfTtcbi8vIGdldCB1OFxudmFyIGd1OCA9IGZ1bmN0aW9uIChvKSB7IHJldHVybiBvICYmIG8uc2l6ZSAmJiBuZXcgdTgoby5zaXplKTsgfTtcbi8vIGFzeW5jIGhlbHBlclxudmFyIGNiaWZ5ID0gZnVuY3Rpb24gKGRhdCwgb3B0cywgZm5zLCBpbml0LCBpZCwgY2IpIHtcbiAgICB2YXIgdyA9IHdya3IoZm5zLCBpbml0LCBpZCwgZnVuY3Rpb24gKGVyciwgZGF0KSB7XG4gICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgIGNiKGVyciwgZGF0KTtcbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKFtkYXQsIG9wdHNdLCBvcHRzLmNvbnN1bWUgPyBbZGF0LmJ1ZmZlcl0gOiBbXSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbn07XG4vLyBhdXRvIHN0cmVhbVxudmFyIGFzdHJtID0gZnVuY3Rpb24gKHN0cm0pIHtcbiAgICBzdHJtLm9uZGF0YSA9IGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7IHJldHVybiBwb3N0TWVzc2FnZShbZGF0LCBmaW5hbF0sIFtkYXQuYnVmZmVyXSk7IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldikgeyByZXR1cm4gc3RybS5wdXNoKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pOyB9O1xufTtcbi8vIGFzeW5jIHN0cmVhbSBhdHRhY2hcbnZhciBhc3RybWlmeSA9IGZ1bmN0aW9uIChmbnMsIHN0cm0sIG9wdHMsIGluaXQsIGlkKSB7XG4gICAgdmFyIHQ7XG4gICAgdmFyIHcgPSB3cmtyKGZucywgaW5pdCwgaWQsIGZ1bmN0aW9uIChlcnIsIGRhdCkge1xuICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgdy50ZXJtaW5hdGUoKSwgc3RybS5vbmRhdGEuY2FsbChzdHJtLCBlcnIpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkYXRbMV0pXG4gICAgICAgICAgICAgICAgdy50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgIHN0cm0ub25kYXRhLmNhbGwoc3RybSwgZXJyLCBkYXRbMF0sIGRhdFsxXSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKG9wdHMpO1xuICAgIHN0cm0ucHVzaCA9IGZ1bmN0aW9uIChkLCBmKSB7XG4gICAgICAgIGlmICh0KVxuICAgICAgICAgICAgdGhyb3cgJ3N0cmVhbSBmaW5pc2hlZCc7XG4gICAgICAgIGlmICghc3RybS5vbmRhdGEpXG4gICAgICAgICAgICB0aHJvdyAnbm8gc3RyZWFtIGhhbmRsZXInO1xuICAgICAgICB3LnBvc3RNZXNzYWdlKFtkLCB0ID0gZl0sIFtkLmJ1ZmZlcl0pO1xuICAgIH07XG4gICAgc3RybS50ZXJtaW5hdGUgPSBmdW5jdGlvbiAoKSB7IHcudGVybWluYXRlKCk7IH07XG59O1xuLy8gcmVhZCAyIGJ5dGVzXG52YXIgYjIgPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gZFtiXSB8IChkW2IgKyAxXSA8PCA4KTsgfTtcbi8vIHJlYWQgNCBieXRlc1xudmFyIGI0ID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIChkW2JdIHwgKGRbYiArIDFdIDw8IDgpIHwgKGRbYiArIDJdIDw8IDE2KSB8IChkW2IgKyAzXSA8PCAyNCkpID4+PiAwOyB9O1xudmFyIGI4ID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGI0KGQsIGIpICsgKGI0KGQsIGIgKyA0KSAqIDQyOTQ5NjcyOTYpOyB9O1xuLy8gd3JpdGUgYnl0ZXNcbnZhciB3Ynl0ZXMgPSBmdW5jdGlvbiAoZCwgYiwgdikge1xuICAgIGZvciAoOyB2OyArK2IpXG4gICAgICAgIGRbYl0gPSB2LCB2ID4+Pj0gODtcbn07XG4vLyBnemlwIGhlYWRlclxudmFyIGd6aCA9IGZ1bmN0aW9uIChjLCBvKSB7XG4gICAgdmFyIGZuID0gby5maWxlbmFtZTtcbiAgICBjWzBdID0gMzEsIGNbMV0gPSAxMzksIGNbMl0gPSA4LCBjWzhdID0gby5sZXZlbCA8IDIgPyA0IDogby5sZXZlbCA9PSA5ID8gMiA6IDAsIGNbOV0gPSAzOyAvLyBhc3N1bWUgVW5peFxuICAgIGlmIChvLm10aW1lICE9IDApXG4gICAgICAgIHdieXRlcyhjLCA0LCBNYXRoLmZsb29yKG5ldyBEYXRlKG8ubXRpbWUgfHwgRGF0ZS5ub3coKSkgLyAxMDAwKSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICAgIGNbM10gPSA4O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmbi5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNbaSArIDEwXSA9IGZuLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxufTtcbi8vIGd6aXAgZm9vdGVyOiAtOCB0byAtNCA9IENSQywgLTQgdG8gLTAgaXMgbGVuZ3RoXG4vLyBnemlwIHN0YXJ0XG52YXIgZ3pzID0gZnVuY3Rpb24gKGQpIHtcbiAgICBpZiAoZFswXSAhPSAzMSB8fCBkWzFdICE9IDEzOSB8fCBkWzJdICE9IDgpXG4gICAgICAgIHRocm93ICdpbnZhbGlkIGd6aXAgZGF0YSc7XG4gICAgdmFyIGZsZyA9IGRbM107XG4gICAgdmFyIHN0ID0gMTA7XG4gICAgaWYgKGZsZyAmIDQpXG4gICAgICAgIHN0ICs9IGRbMTBdIHwgKGRbMTFdIDw8IDgpICsgMjtcbiAgICBmb3IgKHZhciB6cyA9IChmbGcgPj4gMyAmIDEpICsgKGZsZyA+PiA0ICYgMSk7IHpzID4gMDsgenMgLT0gIWRbc3QrK10pXG4gICAgICAgIDtcbiAgICByZXR1cm4gc3QgKyAoZmxnICYgMik7XG59O1xuLy8gZ3ppcCBsZW5ndGhcbnZhciBnemwgPSBmdW5jdGlvbiAoZCkge1xuICAgIHZhciBsID0gZC5sZW5ndGg7XG4gICAgcmV0dXJuICgoZFtsIC0gNF0gfCBkW2wgLSAzXSA8PCA4IHwgZFtsIC0gMl0gPDwgMTYpIHwgKGRbbCAtIDFdIDw8IDI0KSkgPj4+IDA7XG59O1xuLy8gZ3ppcCBoZWFkZXIgbGVuZ3RoXG52YXIgZ3pobCA9IGZ1bmN0aW9uIChvKSB7IHJldHVybiAxMCArICgoby5maWxlbmFtZSAmJiAoby5maWxlbmFtZS5sZW5ndGggKyAxKSkgfHwgMCk7IH07XG4vLyB6bGliIGhlYWRlclxudmFyIHpsaCA9IGZ1bmN0aW9uIChjLCBvKSB7XG4gICAgdmFyIGx2ID0gby5sZXZlbCwgZmwgPSBsdiA9PSAwID8gMCA6IGx2IDwgNiA/IDEgOiBsdiA9PSA5ID8gMyA6IDI7XG4gICAgY1swXSA9IDEyMCwgY1sxXSA9IChmbCA8PCA2KSB8IChmbCA/ICgzMiAtIDIgKiBmbCkgOiAxKTtcbn07XG4vLyB6bGliIHZhbGlkXG52YXIgemx2ID0gZnVuY3Rpb24gKGQpIHtcbiAgICBpZiAoKGRbMF0gJiAxNSkgIT0gOCB8fCAoZFswXSA+Pj4gNCkgPiA3IHx8ICgoZFswXSA8PCA4IHwgZFsxXSkgJSAzMSkpXG4gICAgICAgIHRocm93ICdpbnZhbGlkIHpsaWIgZGF0YSc7XG4gICAgaWYgKGRbMV0gJiAzMilcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgemxpYiBkYXRhOiBwcmVzZXQgZGljdGlvbmFyaWVzIG5vdCBzdXBwb3J0ZWQnO1xufTtcbmZ1bmN0aW9uIEFzeW5jQ21wU3RybShvcHRzLCBjYikge1xuICAgIGlmICghY2IgJiYgdHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICByZXR1cm4gb3B0cztcbn1cbi8vIHpsaWIgZm9vdGVyOiAtNCB0byAtMCBpcyBBZGxlcjMyXG4vKipcbiAqIFN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uXG4gKi9cbnZhciBEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERlZmxhdGUob3B0cywgY2IpIHtcbiAgICAgICAgaWYgKCFjYiAmJiB0eXBlb2Ygb3B0cyA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIHRoaXMubyA9IG9wdHMgfHwge307XG4gICAgfVxuICAgIERlZmxhdGUucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB0aGlzLm9uZGF0YShkb3B0KGMsIHRoaXMubywgMCwgMCwgIWYpLCBmKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICB0aHJvdyAnc3RyZWFtIGZpbmlzaGVkJztcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIHRocm93ICdubyBzdHJlYW0gaGFuZGxlcic7XG4gICAgICAgIHRoaXMuZCA9IGZpbmFsO1xuICAgICAgICB0aGlzLnAoY2h1bmssIGZpbmFsIHx8IGZhbHNlKTtcbiAgICB9O1xuICAgIHJldHVybiBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IERlZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0RlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNEZWZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlXTsgfVxuICAgICAgICBdLCB0aGlzLCBBc3luY0NtcFN0cm0uY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgRGVmbGF0ZShldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA2KTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0RlZmxhdGUgfTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZsYXRlKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2snO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGRlZmxhdGVTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMCwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzc2VzIGRhdGEgd2l0aCBERUZMQVRFIHdpdGhvdXQgYW55IHdyYXBwZXJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGRlZmxhdGVkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmxhdGVTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gZG9wdChkYXRhLCBvcHRzIHx8IHt9LCAwLCAwKTtcbn1cbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGluZmxhdGlvbiBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBpbmZsYXRlZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEluZmxhdGUoY2IpIHtcbiAgICAgICAgdGhpcy5zID0ge307XG4gICAgICAgIHRoaXMucCA9IG5ldyB1OCgwKTtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICB9XG4gICAgSW5mbGF0ZS5wcm90b3R5cGUuZSA9IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICB0aHJvdyAnc3RyZWFtIGZpbmlzaGVkJztcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIHRocm93ICdubyBzdHJlYW0gaGFuZGxlcic7XG4gICAgICAgIHZhciBsID0gdGhpcy5wLmxlbmd0aDtcbiAgICAgICAgdmFyIG4gPSBuZXcgdTgobCArIGMubGVuZ3RoKTtcbiAgICAgICAgbi5zZXQodGhpcy5wKSwgbi5zZXQoYywgbCksIHRoaXMucCA9IG47XG4gICAgfTtcbiAgICBJbmZsYXRlLnByb3RvdHlwZS5jID0gZnVuY3Rpb24gKGZpbmFsKSB7XG4gICAgICAgIHRoaXMuZCA9IHRoaXMucy5pID0gZmluYWwgfHwgZmFsc2U7XG4gICAgICAgIHZhciBidHMgPSB0aGlzLnMuYjtcbiAgICAgICAgdmFyIGR0ID0gaW5mbHQodGhpcy5wLCB0aGlzLm8sIHRoaXMucyk7XG4gICAgICAgIHRoaXMub25kYXRhKHNsYyhkdCwgYnRzLCB0aGlzLnMuYiksIHRoaXMuZCk7XG4gICAgICAgIHRoaXMubyA9IHNsYyhkdCwgdGhpcy5zLmIgLSAzMjc2OCksIHRoaXMucy5iID0gdGhpcy5vLmxlbmd0aDtcbiAgICAgICAgdGhpcy5wID0gc2xjKHRoaXMucCwgKHRoaXMucy5wIC8gOCkgfCAwKSwgdGhpcy5zLnAgJj0gNztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGluZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgZmluYWwgY2h1bmtcbiAgICAgKi9cbiAgICBJbmZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmUoY2h1bmspLCB0aGlzLmMoZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIEluZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgSW5mbGF0ZSB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGluZmxhdGlvbiBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBkZWZsYXRlZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFzeW5jSW5mbGF0ZShjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiSW5mbHQsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGVdOyB9XG4gICAgICAgIF0sIHRoaXMsIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEluZmxhdGUoKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA3KTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0luZmxhdGUgfTtcbmV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2snO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdFxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGluZmxhdGVTeW5jKGV2LmRhdGFbMF0sIGd1OChldi5kYXRhWzFdKSkpOyB9LCAxLCBjYik7XG59XG4vKipcbiAqIEV4cGFuZHMgREVGTEFURSBkYXRhIHdpdGggbm8gd3JhcHBlclxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZGVjb21wcmVzc1xuICogQHBhcmFtIG91dCBXaGVyZSB0byB3cml0ZSB0aGUgZGF0YS4gU2F2ZXMgbWVtb3J5IGlmIHlvdSBrbm93IHRoZSBkZWNvbXByZXNzZWQgc2l6ZSBhbmQgcHJvdmlkZSBhbiBvdXRwdXQgYnVmZmVyIG9mIHRoYXQgbGVuZ3RoLlxuICogQHJldHVybnMgVGhlIGRlY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlU3luYyhkYXRhLCBvdXQpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YSwgb3V0KTtcbn1cbi8vIGJlZm9yZSB5b3UgeWVsbCBhdCBtZSBmb3Igbm90IGp1c3QgdXNpbmcgZXh0ZW5kcywgbXkgcmVhc29uIGlzIHRoYXQgVFMgaW5oZXJpdGFuY2UgaXMgaGFyZCB0byB3b3JrZXJpemUuXG4vKipcbiAqIFN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBHemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEd6aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gY3JjKCk7XG4gICAgICAgIHRoaXMubCA9IDA7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdaSVBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgR3ppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgRGVmbGF0ZS5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICBHemlwLnByb3RvdHlwZS5wID0gZnVuY3Rpb24gKGMsIGYpIHtcbiAgICAgICAgdGhpcy5jLnAoYyk7XG4gICAgICAgIHRoaXMubCArPSBjLmxlbmd0aDtcbiAgICAgICAgdmFyIHJhdyA9IGRvcHQoYywgdGhpcy5vLCB0aGlzLnYgJiYgZ3pobCh0aGlzLm8pLCBmICYmIDgsICFmKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIGd6aChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDgsIHRoaXMuYy5kKCkpLCB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5sKTtcbiAgICAgICAgdGhpcy5vbmRhdGEocmF3LCBmKTtcbiAgICB9O1xuICAgIHJldHVybiBHemlwO1xufSgpKTtcbmV4cG9ydCB7IEd6aXAgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0d6aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNHemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgZ3plLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlLCBHemlwXTsgfVxuICAgICAgICBdLCB0aGlzLCBBc3luY0NtcFN0cm0uY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgR3ppcChldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA4KTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3ppcDtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0d6aXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBnemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2snO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICBnemUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtnemlwU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihnemlwU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDIsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3NlcyBkYXRhIHdpdGggR1pJUFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZ3ppcHBlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGMgPSBjcmMoKSwgbCA9IGRhdGEubGVuZ3RoO1xuICAgIGMucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgZ3pobChvcHRzKSwgOCksIHMgPSBkLmxlbmd0aDtcbiAgICByZXR1cm4gZ3poKGQsIG9wdHMpLCB3Ynl0ZXMoZCwgcyAtIDgsIGMuZCgpKSwgd2J5dGVzKGQsIHMgLSA0LCBsKSwgZDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIEdaSVAgZGVjb21wcmVzc2lvblxuICovXG52YXIgR3VuemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBHVU5aSVAgc3RyZWFtXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGRhdGEgaXMgaW5mbGF0ZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBHdW56aXAoY2IpIHtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgSW5mbGF0ZS5jYWxsKHRoaXMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgR1VOWklQcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEd1bnppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuZS5jYWxsKHRoaXMsIGNodW5rKTtcbiAgICAgICAgaWYgKHRoaXMudikge1xuICAgICAgICAgICAgdmFyIHMgPSB0aGlzLnAubGVuZ3RoID4gMyA/IGd6cyh0aGlzLnApIDogNDtcbiAgICAgICAgICAgIGlmIChzID49IHRoaXMucC5sZW5ndGggJiYgIWZpbmFsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMucCA9IHRoaXMucC5zdWJhcnJheShzKSwgdGhpcy52ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnAubGVuZ3RoIDwgOClcbiAgICAgICAgICAgICAgICB0aHJvdyAnaW52YWxpZCBnemlwIHN0cmVhbSc7XG4gICAgICAgICAgICB0aGlzLnAgPSB0aGlzLnAuc3ViYXJyYXkoMCwgLTgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lY2Vzc2FyeSB0byBwcmV2ZW50IFRTIGZyb20gdXNpbmcgdGhlIGNsb3N1cmUgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHdvcmtlcml6YXRpb24gdG8gZnVuY3Rpb24gY29ycmVjdGx5XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gR3VuemlwO1xufSgpKTtcbmV4cG9ydCB7IEd1bnppcCB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIEdaSVAgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNHdW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgR1VOWklQIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGRlZmxhdGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gQXN5bmNHdW56aXAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgZ3V6ZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgSW5mbGF0ZSwgR3VuemlwXTsgfVxuICAgICAgICBdLCB0aGlzLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBHdW56aXAoKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA5KTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3VuemlwO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jR3VuemlwIH07XG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2snO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdCxcbiAgICAgICAgZ3V6ZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d1bnppcFN5bmNdOyB9XG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYoZ3VuemlwU3luYyhldi5kYXRhWzBdKSk7IH0sIDMsIGNiKTtcbn1cbi8qKlxuICogRXhwYW5kcyBHWklQIGRhdGFcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGRlY29tcHJlc3NcbiAqIEBwYXJhbSBvdXQgV2hlcmUgdG8gd3JpdGUgdGhlIGRhdGEuIEdaSVAgYWxyZWFkeSBlbmNvZGVzIHRoZSBvdXRwdXQgc2l6ZSwgc28gcHJvdmlkaW5nIHRoaXMgZG9lc24ndCBzYXZlIG1lbW9yeS5cbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwU3luYyhkYXRhLCBvdXQpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YS5zdWJhcnJheShnenMoZGF0YSksIC04KSwgb3V0IHx8IG5ldyB1OChnemwoZGF0YSkpKTtcbn1cbi8qKlxuICogU3RyZWFtaW5nIFpsaWIgY29tcHJlc3Npb25cbiAqL1xudmFyIFpsaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gWmxpYihvcHRzLCBjYikge1xuICAgICAgICB0aGlzLmMgPSBhZGxlcigpO1xuICAgICAgICB0aGlzLnYgPSAxO1xuICAgICAgICBEZWZsYXRlLmNhbGwodGhpcywgb3B0cywgY2IpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSB6bGliYmVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFpsaWIucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgWmxpYi5wcm90b3R5cGUucCA9IGZ1bmN0aW9uIChjLCBmKSB7XG4gICAgICAgIHRoaXMuYy5wKGMpO1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiAyLCBmICYmIDQsICFmKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIHpsaChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDQsIHRoaXMuYy5kKCkpO1xuICAgICAgICB0aGlzLm9uZGF0YShyYXcsIGYpO1xuICAgIH07XG4gICAgcmV0dXJuIFpsaWI7XG59KCkpO1xuZXhwb3J0IHsgWmxpYiB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIFpsaWIgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jWmxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY1psaWIob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICB6bGUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGUsIFpsaWJdOyB9XG4gICAgICAgIF0sIHRoaXMsIEFzeW5jQ21wU3RybS5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBabGliKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jWmxpYjtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1psaWIgfTtcbmV4cG9ydCBmdW5jdGlvbiB6bGliKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2snO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICB6bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bGliU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZih6bGliU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDQsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3MgZGF0YSB3aXRoIFpsaWJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIHpsaWItY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6bGliU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGEgPSBhZGxlcigpO1xuICAgIGEucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgMiwgNCk7XG4gICAgcmV0dXJuIHpsaChkLCBvcHRzKSwgd2J5dGVzKGQsIGQubGVuZ3RoIC0gNCwgYS5kKCkpLCBkO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgWmxpYiBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBVbnpsaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFpsaWIgZGVjb21wcmVzc2lvbiBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBpbmZsYXRlZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFVuemxpYihjYikge1xuICAgICAgICB0aGlzLnYgPSAxO1xuICAgICAgICBJbmZsYXRlLmNhbGwodGhpcywgY2IpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSB1bnpsaWJiZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgVW56bGliLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5lLmNhbGwodGhpcywgY2h1bmspO1xuICAgICAgICBpZiAodGhpcy52KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA8IDIgJiYgIWZpbmFsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMucCA9IHRoaXMucC5zdWJhcnJheSgyKSwgdGhpcy52ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnAubGVuZ3RoIDwgNClcbiAgICAgICAgICAgICAgICB0aHJvdyAnaW52YWxpZCB6bGliIHN0cmVhbSc7XG4gICAgICAgICAgICB0aGlzLnAgPSB0aGlzLnAuc3ViYXJyYXkoMCwgLTQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lY2Vzc2FyeSB0byBwcmV2ZW50IFRTIGZyb20gdXNpbmcgdGhlIGNsb3N1cmUgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHdvcmtlcml6YXRpb24gdG8gZnVuY3Rpb24gY29ycmVjdGx5XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gVW56bGliO1xufSgpKTtcbmV4cG9ydCB7IFVuemxpYiB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIFpsaWIgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNVbnpsaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgWmxpYiBkZWNvbXByZXNzaW9uIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGRlZmxhdGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gQXN5bmNVbnpsaWIoY2IpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgenVsZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgSW5mbGF0ZSwgVW56bGliXTsgfVxuICAgICAgICBdLCB0aGlzLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBVbnpsaWIoKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCAxMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY1VuemxpYjtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1VuemxpYiB9O1xuZXhwb3J0IGZ1bmN0aW9uIHVuemxpYihkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgJ25vIGNhbGxiYWNrJztcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiSW5mbHQsXG4gICAgICAgIHp1bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1bnpsaWJTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKHVuemxpYlN5bmMoZXYuZGF0YVswXSwgZ3U4KGV2LmRhdGFbMV0pKSk7IH0sIDUsIGNiKTtcbn1cbi8qKlxuICogRXhwYW5kcyBabGliIGRhdGFcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGRlY29tcHJlc3NcbiAqIEBwYXJhbSBvdXQgV2hlcmUgdG8gd3JpdGUgdGhlIGRhdGEuIFNhdmVzIG1lbW9yeSBpZiB5b3Uga25vdyB0aGUgZGVjb21wcmVzc2VkIHNpemUgYW5kIHByb3ZpZGUgYW4gb3V0cHV0IGJ1ZmZlciBvZiB0aGF0IGxlbmd0aC5cbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW56bGliU3luYyhkYXRhLCBvdXQpIHtcbiAgICByZXR1cm4gaW5mbHQoKHpsdihkYXRhKSwgZGF0YS5zdWJhcnJheSgyLCAtNCkpLCBvdXQpO1xufVxuLy8gRGVmYXVsdCBhbGdvcml0aG0gZm9yIGNvbXByZXNzaW9uICh1c2VkIGJlY2F1c2UgaGF2aW5nIGEga25vd24gb3V0cHV0IHNpemUgYWxsb3dzIGZhc3RlciBkZWNvbXByZXNzaW9uKVxuZXhwb3J0IHsgZ3ppcCBhcyBjb21wcmVzcywgQXN5bmNHemlwIGFzIEFzeW5jQ29tcHJlc3MgfTtcbi8vIERlZmF1bHQgYWxnb3JpdGhtIGZvciBjb21wcmVzc2lvbiAodXNlZCBiZWNhdXNlIGhhdmluZyBhIGtub3duIG91dHB1dCBzaXplIGFsbG93cyBmYXN0ZXIgZGVjb21wcmVzc2lvbilcbmV4cG9ydCB7IGd6aXBTeW5jIGFzIGNvbXByZXNzU3luYywgR3ppcCBhcyBDb21wcmVzcyB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgRGVjb21wcmVzcyA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZGVjb21wcmVzc2lvbiBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBkZWNvbXByZXNzZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEZWNvbXByZXNzKGNiKSB7XG4gICAgICAgIHRoaXMuRyA9IEd1bnppcDtcbiAgICAgICAgdGhpcy5JID0gSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gVW56bGliO1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWNvbXByZXNzZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVjb21wcmVzcy5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIHRocm93ICdubyBzdHJlYW0gaGFuZGxlcic7XG4gICAgICAgIGlmICghdGhpcy5zKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wICYmIHRoaXMucC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbiA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBuLnNldCh0aGlzLnApLCBuLnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5wID0gY2h1bms7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIGNiID0gZnVuY3Rpb24gKCkgeyBfdGhpc18xLm9uZGF0YS5hcHBseShfdGhpc18xLCBhcmd1bWVudHMpOyB9O1xuICAgICAgICAgICAgICAgIHRoaXMucyA9ICh0aGlzLnBbMF0gPT0gMzEgJiYgdGhpcy5wWzFdID09IDEzOSAmJiB0aGlzLnBbMl0gPT0gOClcbiAgICAgICAgICAgICAgICAgICAgPyBuZXcgdGhpcy5HKGNiKVxuICAgICAgICAgICAgICAgICAgICA6ICgodGhpcy5wWzBdICYgMTUpICE9IDggfHwgKHRoaXMucFswXSA+PiA0KSA+IDcgfHwgKCh0aGlzLnBbMF0gPDwgOCB8IHRoaXMucFsxXSkgJSAzMSkpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyB0aGlzLkkoY2IpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyB0aGlzLlooY2IpO1xuICAgICAgICAgICAgICAgIHRoaXMucy5wdXNoKHRoaXMucCwgZmluYWwpO1xuICAgICAgICAgICAgICAgIHRoaXMucCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5zLnB1c2goY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBEZWNvbXByZXNzO1xufSgpKTtcbmV4cG9ydCB7IERlY29tcHJlc3MgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBHWklQLCBabGliLCBvciByYXcgREVGTEFURSBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0RlY29tcHJlc3MgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGRlY29tcHJlc3Npb24gc3RyZWFtXG4gICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGRlY29tcHJlc3NlZFxuICAgKi9cbiAgICBmdW5jdGlvbiBBc3luY0RlY29tcHJlc3MoY2IpIHtcbiAgICAgICAgdGhpcy5HID0gQXN5bmNHdW56aXA7XG4gICAgICAgIHRoaXMuSSA9IEFzeW5jSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gQXN5bmNVbnpsaWI7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29tcHJlc3NlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBBc3luY0RlY29tcHJlc3MucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIERlY29tcHJlc3MucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIEFzeW5jRGVjb21wcmVzcztcbn0oKSk7XG5leHBvcnQgeyBBc3luY0RlY29tcHJlc3MgfTtcbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXByZXNzKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2snO1xuICAgIHJldHVybiAoZGF0YVswXSA9PSAzMSAmJiBkYXRhWzFdID09IDEzOSAmJiBkYXRhWzJdID09IDgpXG4gICAgICAgID8gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICAgICAgOiB1bnpsaWIoZGF0YSwgb3B0cywgY2IpO1xufVxuLyoqXG4gKiBFeHBhbmRzIGNvbXByZXNzZWQgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGF0YSwgYXV0b21hdGljYWxseSBkZXRlY3RpbmcgdGhlIGZvcm1hdFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZGVjb21wcmVzc1xuICogQHBhcmFtIG91dCBXaGVyZSB0byB3cml0ZSB0aGUgZGF0YS4gU2F2ZXMgbWVtb3J5IGlmIHlvdSBrbm93IHRoZSBkZWNvbXByZXNzZWQgc2l6ZSBhbmQgcHJvdmlkZSBhbiBvdXRwdXQgYnVmZmVyIG9mIHRoYXQgbGVuZ3RoLlxuICogQHJldHVybnMgVGhlIGRlY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXByZXNzU3luYyhkYXRhLCBvdXQpIHtcbiAgICByZXR1cm4gKGRhdGFbMF0gPT0gMzEgJiYgZGF0YVsxXSA9PSAxMzkgJiYgZGF0YVsyXSA9PSA4KVxuICAgICAgICA/IGd1bnppcFN5bmMoZGF0YSwgb3V0KVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlU3luYyhkYXRhLCBvdXQpXG4gICAgICAgICAgICA6IHVuemxpYlN5bmMoZGF0YSwgb3V0KTtcbn1cbi8vIGZsYXR0ZW4gYSBkaXJlY3Rvcnkgc3RydWN0dXJlXG52YXIgZmx0biA9IGZ1bmN0aW9uIChkLCBwLCB0LCBvKSB7XG4gICAgZm9yICh2YXIgayBpbiBkKSB7XG4gICAgICAgIHZhciB2YWwgPSBkW2tdLCBuID0gcCArIGs7XG4gICAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiB1OClcbiAgICAgICAgICAgIHRbbl0gPSBbdmFsLCBvXTtcbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKVxuICAgICAgICAgICAgdFtuXSA9IFt2YWxbMF0sIG1yZyhvLCB2YWxbMV0pXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmx0bih2YWwsIG4gKyAnLycsIHQsIG8pO1xuICAgIH1cbn07XG4vLyB0ZXh0IGVuY29kZXJcbnZhciB0ZSA9IHR5cGVvZiBUZXh0RW5jb2RlciAhPSAndW5kZWZpbmVkJyAmJiAvKiNfX1BVUkVfXyovIG5ldyBUZXh0RW5jb2RlcigpO1xuLy8gdGV4dCBkZWNvZGVyXG52YXIgdGQgPSB0eXBlb2YgVGV4dERlY29kZXIgIT0gJ3VuZGVmaW5lZCcgJiYgLyojX19QVVJFX18qLyBuZXcgVGV4dERlY29kZXIoKTtcbi8vIHRleHQgZGVjb2RlciBzdHJlYW1cbnZhciB0ZHMgPSAwO1xudHJ5IHtcbiAgICB0ZC5kZWNvZGUoZXQsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgIHRkcyA9IDE7XG59XG5jYXRjaCAoZSkgeyB9XG4vLyBkZWNvZGUgVVRGOFxudmFyIGR1dGY4ID0gZnVuY3Rpb24gKGQpIHtcbiAgICBmb3IgKHZhciByID0gJycsIGkgPSAwOzspIHtcbiAgICAgICAgdmFyIGMgPSBkW2krK107XG4gICAgICAgIHZhciBlYiA9IChjID4gMTI3KSArIChjID4gMjIzKSArIChjID4gMjM5KTtcbiAgICAgICAgaWYgKGkgKyBlYiA+IGQubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIFtyLCBzbGMoZCwgaSAtIDEpXTtcbiAgICAgICAgaWYgKCFlYilcbiAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgICAgZWxzZSBpZiAoZWIgPT0gMykge1xuICAgICAgICAgICAgYyA9ICgoYyAmIDE1KSA8PCAxOCB8IChkW2krK10gJiA2MykgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKSAtIDY1NTM2LFxuICAgICAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NiB8IChjID4+IDEwKSwgNTYzMjAgfCAoYyAmIDEwMjMpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlYiAmIDEpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAzMSkgPDwgNiB8IChkW2krK10gJiA2MykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAxNSkgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKTtcbiAgICB9XG59O1xuLyoqXG4gKiBTdHJlYW1pbmcgVVRGLTggZGVjb2RpbmdcbiAqL1xudmFyIERlY29kZVVURjggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFVURi04IGRlY29kaW5nIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGRlY29kZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEZWNvZGVVVEY4KGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIGlmICh0ZHMpXG4gICAgICAgICAgICB0aGlzLnQgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29kZWQgZnJvbSBVVEYtOCBiaW5hcnlcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVjb2RlVVRGOC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIHRocm93ICdubyBjYWxsYmFjayc7XG4gICAgICAgIGZpbmFsID0gISFmaW5hbDtcbiAgICAgICAgaWYgKHRoaXMudCkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEodGhpcy50LmRlY29kZShjaHVuaywgeyBzdHJlYW06IHRydWUgfSksIGZpbmFsKTtcbiAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnQuZGVjb2RlKCkubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnaW52YWxpZCB1dGYtOCBkYXRhJztcbiAgICAgICAgICAgICAgICB0aGlzLnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wKVxuICAgICAgICAgICAgdGhyb3cgJ3N0cmVhbSBmaW5pc2hlZCc7XG4gICAgICAgIHZhciBkYXQgPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgIGRhdC5zZXQodGhpcy5wKTtcbiAgICAgICAgZGF0LnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgIHZhciBfYSA9IGR1dGY4KGRhdCksIGNoID0gX2FbMF0sIG5wID0gX2FbMV07XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKG5wLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aHJvdyAnaW52YWxpZCB1dGYtOCBkYXRhJztcbiAgICAgICAgICAgIHRoaXMucCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gbnA7XG4gICAgICAgIHRoaXMub25kYXRhKGNoLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gRGVjb2RlVVRGODtcbn0oKSk7XG5leHBvcnQgeyBEZWNvZGVVVEY4IH07XG4vKipcbiAqIFN0cmVhbWluZyBVVEYtOCBlbmNvZGluZ1xuICovXG52YXIgRW5jb2RlVVRGOCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgVVRGLTggZGVjb2Rpbmcgc3RyZWFtXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGRhdGEgaXMgZW5jb2RlZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEVuY29kZVVURjgoY2IpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZW5jb2RlZCB0byBVVEYtOFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgc3RyaW5nIGRhdGEgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBFbmNvZGVVVEY4LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgdGhyb3cgJ25vIGNhbGxiYWNrJztcbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIHRocm93ICdzdHJlYW0gZmluaXNoZWQnO1xuICAgICAgICB0aGlzLm9uZGF0YShzdHJUb1U4KGNodW5rKSwgdGhpcy5kID0gZmluYWwgfHwgZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIEVuY29kZVVURjg7XG59KCkpO1xuZXhwb3J0IHsgRW5jb2RlVVRGOCB9O1xuLyoqXG4gKiBDb252ZXJ0cyBhIHN0cmluZyBpbnRvIGEgVWludDhBcnJheSBmb3IgdXNlIHdpdGggY29tcHJlc3Npb24vZGVjb21wcmVzc2lvbiBtZXRob2RzXG4gKiBAcGFyYW0gc3RyIFRoZSBzdHJpbmcgdG8gZW5jb2RlXG4gKiBAcGFyYW0gbGF0aW4xIFdoZXRoZXIgb3Igbm90IHRvIGludGVycHJldCB0aGUgZGF0YSBhcyBMYXRpbi0xLiBUaGlzIHNob3VsZFxuICogICAgICAgICAgICAgICBub3QgbmVlZCB0byBiZSB0cnVlIHVubGVzcyBkZWNvZGluZyBhIGJpbmFyeSBzdHJpbmcuXG4gKiBAcmV0dXJucyBUaGUgc3RyaW5nIGVuY29kZWQgaW4gVVRGLTgvTGF0aW4tMSBiaW5hcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0clRvVTgoc3RyLCBsYXRpbjEpIHtcbiAgICBpZiAobGF0aW4xKSB7XG4gICAgICAgIHZhciBhcl8xID0gbmV3IHU4KHN0ci5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGFyXzFbaV0gPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgcmV0dXJuIGFyXzE7XG4gICAgfVxuICAgIGlmICh0ZSlcbiAgICAgICAgcmV0dXJuIHRlLmVuY29kZShzdHIpO1xuICAgIHZhciBsID0gc3RyLmxlbmd0aDtcbiAgICB2YXIgYXIgPSBuZXcgdTgoc3RyLmxlbmd0aCArIChzdHIubGVuZ3RoID4+IDEpKTtcbiAgICB2YXIgYWkgPSAwO1xuICAgIHZhciB3ID0gZnVuY3Rpb24gKHYpIHsgYXJbYWkrK10gPSB2OyB9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgKytpKSB7XG4gICAgICAgIGlmIChhaSArIDUgPiBhci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuID0gbmV3IHU4KGFpICsgOCArICgobCAtIGkpIDw8IDEpKTtcbiAgICAgICAgICAgIG4uc2V0KGFyKTtcbiAgICAgICAgICAgIGFyID0gbjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoYyA8IDEyOCB8fCBsYXRpbjEpXG4gICAgICAgICAgICB3KGMpO1xuICAgICAgICBlbHNlIGlmIChjIDwgMjA0OClcbiAgICAgICAgICAgIHcoMTkyIHwgKGMgPj4gNikpLCB3KDEyOCB8IChjICYgNjMpKTtcbiAgICAgICAgZWxzZSBpZiAoYyA+IDU1Mjk1ICYmIGMgPCA1NzM0NClcbiAgICAgICAgICAgIGMgPSA2NTUzNiArIChjICYgMTAyMyA8PCAxMCkgfCAoc3RyLmNoYXJDb2RlQXQoKytpKSAmIDEwMjMpLFxuICAgICAgICAgICAgICAgIHcoMjQwIHwgKGMgPj4gMTgpKSwgdygxMjggfCAoKGMgPj4gMTIpICYgNjMpKSwgdygxMjggfCAoKGMgPj4gNikgJiA2MykpLCB3KDEyOCB8IChjICYgNjMpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdygyMjQgfCAoYyA+PiAxMikpLCB3KDEyOCB8ICgoYyA+PiA2KSAmIDYzKSksIHcoMTI4IHwgKGMgJiA2MykpO1xuICAgIH1cbiAgICByZXR1cm4gc2xjKGFyLCAwLCBhaSk7XG59XG4vKipcbiAqIENvbnZlcnRzIGEgVWludDhBcnJheSB0byBhIHN0cmluZ1xuICogQHBhcmFtIGRhdCBUaGUgZGF0YSB0byBkZWNvZGUgdG8gc3RyaW5nXG4gKiBAcGFyYW0gbGF0aW4xIFdoZXRoZXIgb3Igbm90IHRvIGludGVycHJldCB0aGUgZGF0YSBhcyBMYXRpbi0xLiBUaGlzIHNob3VsZFxuICogICAgICAgICAgICAgICBub3QgbmVlZCB0byBiZSB0cnVlIHVubGVzcyBlbmNvZGluZyB0byBiaW5hcnkgc3RyaW5nLlxuICogQHJldHVybnMgVGhlIG9yaWdpbmFsIFVURi04L0xhdGluLTEgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJGcm9tVTgoZGF0LCBsYXRpbjEpIHtcbiAgICBpZiAobGF0aW4xKSB7XG4gICAgICAgIHZhciByID0gJyc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0Lmxlbmd0aDsgaSArPSAxNjM4NClcbiAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBkYXQuc3ViYXJyYXkoaSwgaSArIDE2Mzg0KSk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICBlbHNlIGlmICh0ZClcbiAgICAgICAgcmV0dXJuIHRkLmRlY29kZShkYXQpO1xuICAgIGVsc2Uge1xuICAgICAgICB2YXIgX2EgPSBkdXRmOChkYXQpLCBvdXQgPSBfYVswXSwgZXh0ID0gX2FbMV07XG4gICAgICAgIGlmIChleHQubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgJ2ludmFsaWQgdXRmLTggZGF0YSc7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxufVxuO1xuLy8gZGVmbGF0ZSBiaXQgZmxhZ1xudmFyIGRiZiA9IGZ1bmN0aW9uIChsKSB7IHJldHVybiBsID09IDEgPyAzIDogbCA8IDYgPyAyIDogbCA9PSA5ID8gMSA6IDA7IH07XG4vLyBza2lwIGxvY2FsIHppcCBoZWFkZXJcbnZhciBzbHpoID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGIgKyAzMCArIGIyKGQsIGIgKyAyNikgKyBiMihkLCBiICsgMjgpOyB9O1xuLy8gcmVhZCB6aXAgaGVhZGVyXG52YXIgemggPSBmdW5jdGlvbiAoZCwgYiwgeikge1xuICAgIHZhciBmbmwgPSBiMihkLCBiICsgMjgpLCBmbiA9IHN0ckZyb21VOChkLnN1YmFycmF5KGIgKyA0NiwgYiArIDQ2ICsgZm5sKSwgIShiMihkLCBiICsgOCkgJiAyMDQ4KSksIGVzID0gYiArIDQ2ICsgZm5sLCBicyA9IGI0KGQsIGIgKyAyMCk7XG4gICAgdmFyIF9hID0geiAmJiBicyA9PSA0Mjk0OTY3Mjk1ID8gejY0ZShkLCBlcykgOiBbYnMsIGI0KGQsIGIgKyAyNCksIGI0KGQsIGIgKyA0MildLCBzYyA9IF9hWzBdLCBzdSA9IF9hWzFdLCBvZmYgPSBfYVsyXTtcbiAgICByZXR1cm4gW2IyKGQsIGIgKyAxMCksIHNjLCBzdSwgZm4sIGVzICsgYjIoZCwgYiArIDMwKSArIGIyKGQsIGIgKyAzMiksIG9mZl07XG59O1xuLy8gcmVhZCB6aXA2NCBleHRyYSBmaWVsZFxudmFyIHo2NGUgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAoOyBiMihkLCBiKSAhPSAxOyBiICs9IDQgKyBiMihkLCBiICsgMikpXG4gICAgICAgIDtcbiAgICByZXR1cm4gW2I4KGQsIGIgKyAxMiksIGI4KGQsIGIgKyA0KSwgYjgoZCwgYiArIDIwKV07XG59O1xuLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG52YXIgZXhmbCA9IGZ1bmN0aW9uIChleCkge1xuICAgIHZhciBsZSA9IDA7XG4gICAgaWYgKGV4KSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBsID0gZXhba10ubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGwgPiA2NTUzNSlcbiAgICAgICAgICAgICAgICB0aHJvdyAnZXh0cmEgZmllbGQgdG9vIGxvbmcnO1xuICAgICAgICAgICAgbGUgKz0gbCArIDQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxlO1xufTtcbi8vIHdyaXRlIHppcCBoZWFkZXJcbnZhciB3emggPSBmdW5jdGlvbiAoZCwgYiwgZiwgZm4sIHUsIGMsIGNlLCBjbykge1xuICAgIHZhciBmbCA9IGZuLmxlbmd0aCwgZXggPSBmLmV4dHJhLCBjb2wgPSBjbyAmJiBjby5sZW5ndGg7XG4gICAgdmFyIGV4bCA9IGV4ZmwoZXgpO1xuICAgIHdieXRlcyhkLCBiLCBjZSAhPSBudWxsID8gMHgyMDE0QjUwIDogMHg0MDM0QjUwKSwgYiArPSA0O1xuICAgIGlmIChjZSAhPSBudWxsKVxuICAgICAgICBkW2IrK10gPSAyMCwgZFtiKytdID0gZi5vcztcbiAgICBkW2JdID0gMjAsIGIgKz0gMjsgLy8gc3BlYyBjb21wbGlhbmNlPyB3aGF0J3MgdGhhdD9cbiAgICBkW2IrK10gPSAoZi5mbGFnIDw8IDEpIHwgKGMgPT0gbnVsbCAmJiA4KSwgZFtiKytdID0gdSAmJiA4O1xuICAgIGRbYisrXSA9IGYuY29tcHJlc3Npb24gJiAyNTUsIGRbYisrXSA9IGYuY29tcHJlc3Npb24gPj4gODtcbiAgICB2YXIgZHQgPSBuZXcgRGF0ZShmLm10aW1lID09IG51bGwgPyBEYXRlLm5vdygpIDogZi5tdGltZSksIHkgPSBkdC5nZXRGdWxsWWVhcigpIC0gMTk4MDtcbiAgICBpZiAoeSA8IDAgfHwgeSA+IDExOSlcbiAgICAgICAgdGhyb3cgJ2RhdGUgbm90IGluIHJhbmdlIDE5ODAtMjA5OSc7XG4gICAgd2J5dGVzKGQsIGIsICh5IDw8IDI1KSB8ICgoZHQuZ2V0TW9udGgoKSArIDEpIDw8IDIxKSB8IChkdC5nZXREYXRlKCkgPDwgMTYpIHwgKGR0LmdldEhvdXJzKCkgPDwgMTEpIHwgKGR0LmdldE1pbnV0ZXMoKSA8PCA1KSB8IChkdC5nZXRTZWNvbmRzKCkgPj4+IDEpKSwgYiArPSA0O1xuICAgIGlmIChjICE9IG51bGwpIHtcbiAgICAgICAgd2J5dGVzKGQsIGIsIGYuY3JjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA0LCBjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA4LCBmLnNpemUpO1xuICAgIH1cbiAgICB3Ynl0ZXMoZCwgYiArIDEyLCBmbCk7XG4gICAgd2J5dGVzKGQsIGIgKyAxNCwgZXhsKSwgYiArPSAxNjtcbiAgICBpZiAoY2UgIT0gbnVsbCkge1xuICAgICAgICB3Ynl0ZXMoZCwgYiwgY29sKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA2LCBmLmF0dHJzKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyAxMCwgY2UpLCBiICs9IDE0O1xuICAgIH1cbiAgICBkLnNldChmbiwgYik7XG4gICAgYiArPSBmbDtcbiAgICBpZiAoZXhsKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBleGYgPSBleFtrXSwgbCA9IGV4Zi5sZW5ndGg7XG4gICAgICAgICAgICB3Ynl0ZXMoZCwgYiwgK2spO1xuICAgICAgICAgICAgd2J5dGVzKGQsIGIgKyAyLCBsKTtcbiAgICAgICAgICAgIGQuc2V0KGV4ZiwgYiArIDQpLCBiICs9IDQgKyBsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb2wpXG4gICAgICAgIGQuc2V0KGNvLCBiKSwgYiArPSBjb2w7XG4gICAgcmV0dXJuIGI7XG59O1xuLy8gd3JpdGUgemlwIGZvb3RlciAoZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5KVxudmFyIHd6ZiA9IGZ1bmN0aW9uIChvLCBiLCBjLCBkLCBlKSB7XG4gICAgd2J5dGVzKG8sIGIsIDB4NjA1NEI1MCk7IC8vIHNraXAgZGlza1xuICAgIHdieXRlcyhvLCBiICsgOCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMiwgZCk7XG4gICAgd2J5dGVzKG8sIGIgKyAxNiwgZSk7XG59O1xuLyoqXG4gKiBBIHBhc3MtdGhyb3VnaCBzdHJlYW0gdG8ga2VlcCBkYXRhIHVuY29tcHJlc3NlZCBpbiBhIFpJUCBhcmNoaXZlLlxuICovXG52YXIgWmlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHBhc3MtdGhyb3VnaCBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwUGFzc1Rocm91Z2goZmlsZW5hbWUpIHtcbiAgICAgICAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xuICAgICAgICB0aGlzLmMgPSBjcmMoKTtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBhIGNodW5rIGFuZCBwdXNoZXMgdG8gdGhlIG91dHB1dCBzdHJlYW0uIFlvdSBjYW4gb3ZlcnJpZGUgdGhpc1xuICAgICAqIG1ldGhvZCBpbiBhIHN1YmNsYXNzIGZvciBjdXN0b20gYmVoYXZpb3IsIGJ1dCBieSBkZWZhdWx0IHRoaXMgcGFzc2VzXG4gICAgICogdGhlIGRhdGEgdGhyb3VnaC4gWW91IG11c3QgY2FsbCB0aGlzLm9uZGF0YShlcnIsIGNodW5rLCBmaW5hbCkgYXQgc29tZVxuICAgICAqIHBvaW50IGluIHRoaXMgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHJvY2Vzc1xuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGFkZGVkLiBJZiB5b3UgYXJlIHN1YmNsYXNzaW5nIHRoaXMgd2l0aCBhIGN1c3RvbVxuICAgICAqIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgbm90ZSB0aGF0IHlvdSBtdXN0IHB1c2ggZGF0YSBmcm9tIHRoZSBzb3VyY2VcbiAgICAgKiBmaWxlIG9ubHksIHByZS1jb21wcmVzc2lvbi5cbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2sgLSBhZGQgdG8gWklQIGFyY2hpdmUgYmVmb3JlIHB1c2hpbmcnO1xuICAgICAgICB0aGlzLmMucChjaHVuayk7XG4gICAgICAgIHRoaXMuc2l6ZSArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIGlmIChmaW5hbClcbiAgICAgICAgICAgIHRoaXMuY3JjID0gdGhpcy5jLmQoKTtcbiAgICAgICAgdGhpcy5wcm9jZXNzKGNodW5rLCBmaW5hbCB8fCBmYWxzZSk7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwUGFzc1Rocm91Z2g7XG59KCkpO1xuZXhwb3J0IHsgWmlwUGFzc1Rocm91Z2ggfTtcbi8vIEkgZG9uJ3QgZXh0ZW5kIGJlY2F1c2UgVHlwZVNjcmlwdCBleHRlbnNpb24gYWRkcyAxa0Igb2YgcnVudGltZSBibG9hdFxuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzLiBQcmVmZXIgdXNpbmcgQXN5bmNaaXBEZWZsYXRlXG4gKiBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gKi9cbnZhciBaaXBEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBERUZMQVRFIHN0cmVhbSB0aGF0IGNhbiBiZSBhZGRlZCB0byBaSVAgYXJjaGl2ZXNcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgZGF0YSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFppcERlZmxhdGUoZmlsZW5hbWUsIG9wdHMpIHtcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xuICAgICAgICBpZiAoIW9wdHMpXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLmNhbGwodGhpcywgZmlsZW5hbWUpO1xuICAgICAgICB0aGlzLmQgPSBuZXcgRGVmbGF0ZShvcHRzLCBmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXNfMS5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uID0gODtcbiAgICAgICAgdGhpcy5mbGFnID0gZGJmKG9wdHMubGV2ZWwpO1xuICAgIH1cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5kLnB1c2goY2h1bmssIGZpbmFsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZSwgbnVsbCwgZmluYWwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBaaXBEZWZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBBc3luY1ppcERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgc3RyZWFtIHRoYXQgY2FuIGJlIGFkZGVkIHRvIFpJUCBhcmNoaXZlc1xuICAgICAqIEBwYXJhbSBmaWxlbmFtZSBUaGUgZmlsZW5hbWUgdG8gYXNzb2NpYXRlIHdpdGggdGhpcyBkYXRhIHN0cmVhbVxuICAgICAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gICAgICovXG4gICAgZnVuY3Rpb24gQXN5bmNaaXBEZWZsYXRlKGZpbGVuYW1lLCBvcHRzKSB7XG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcbiAgICAgICAgaWYgKCFvcHRzKVxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5jYWxsKHRoaXMsIGZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5kID0gbmV3IEFzeW5jRGVmbGF0ZShvcHRzLCBmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpc18xLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDg7XG4gICAgICAgIHRoaXMuZmxhZyA9IGRiZihvcHRzLmxldmVsKTtcbiAgICAgICAgdGhpcy50ZXJtaW5hdGUgPSB0aGlzLmQudGVybWluYXRlO1xuICAgIH1cbiAgICBBc3luY1ppcERlZmxhdGUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRoaXMuZC5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBBc3luY1ppcERlZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBBc3luY1ppcERlZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNaaXBEZWZsYXRlIH07XG4vLyBUT0RPOiBCZXR0ZXIgdHJlZSBzaGFraW5nXG4vKipcbiAqIEEgemlwcGFibGUgYXJjaGl2ZSB0byB3aGljaCBmaWxlcyBjYW4gaW5jcmVtZW50YWxseSBiZSBhZGRlZFxuICovXG52YXIgWmlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgWklQIGFyY2hpdmUgdG8gd2hpY2ggZmlsZXMgY2FuIGJlIGFkZGVkXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGRhdGEgZm9yIHRoZSBnZW5lcmF0ZWQgWklQIGFyY2hpdmVcbiAgICAgKiAgICAgICAgICAgaXMgYXZhaWxhYmxlXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwKGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIHRoaXMudSA9IFtdO1xuICAgICAgICB0aGlzLmQgPSAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZmlsZSB0byB0aGUgWklQIGFyY2hpdmVcbiAgICAgKiBAcGFyYW0gZmlsZSBUaGUgZmlsZSBzdHJlYW0gdG8gYWRkXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLmQgJiAyKVxuICAgICAgICAgICAgdGhyb3cgJ3N0cmVhbSBmaW5pc2hlZCc7XG4gICAgICAgIHZhciBmID0gc3RyVG9VOChmaWxlLmZpbGVuYW1lKSwgZmwgPSBmLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbSA9IGZpbGUuY29tbWVudCwgbyA9IGNvbSAmJiBzdHJUb1U4KGNvbSk7XG4gICAgICAgIHZhciB1ID0gZmwgIT0gZmlsZS5maWxlbmFtZS5sZW5ndGggfHwgKG8gJiYgKGNvbS5sZW5ndGggIT0gby5sZW5ndGgpKTtcbiAgICAgICAgdmFyIGhsID0gZmwgKyBleGZsKGZpbGUuZXh0cmEpICsgMzA7XG4gICAgICAgIGlmIChmbCA+IDY1NTM1KVxuICAgICAgICAgICAgdGhyb3cgJ2ZpbGVuYW1lIHRvbyBsb25nJztcbiAgICAgICAgdmFyIGhlYWRlciA9IG5ldyB1OChobCk7XG4gICAgICAgIHd6aChoZWFkZXIsIDAsIGZpbGUsIGYsIHUpO1xuICAgICAgICB2YXIgY2hrcyA9IFtoZWFkZXJdO1xuICAgICAgICB2YXIgcEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgY2hrc18xID0gY2hrczsgX2kgPCBjaGtzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoayA9IGNoa3NfMVtfaV07XG4gICAgICAgICAgICAgICAgX3RoaXNfMS5vbmRhdGEobnVsbCwgY2hrLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGtzID0gW107XG4gICAgICAgIH07XG4gICAgICAgIHZhciB0ciA9IHRoaXMuZDtcbiAgICAgICAgdGhpcy5kID0gMDtcbiAgICAgICAgdmFyIGluZCA9IHRoaXMudS5sZW5ndGg7XG4gICAgICAgIHZhciB1ZiA9IG1yZyhmaWxlLCB7XG4gICAgICAgICAgICBmOiBmLFxuICAgICAgICAgICAgdTogdSxcbiAgICAgICAgICAgIG86IG8sXG4gICAgICAgICAgICB0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGUudGVybWluYXRlKVxuICAgICAgICAgICAgICAgICAgICBmaWxlLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwQWxsKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBueHQgPSBfdGhpc18xLnVbaW5kICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChueHQpXG4gICAgICAgICAgICAgICAgICAgICAgICBueHQucigpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpc18xLmQgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0ciA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgY2wgPSAwO1xuICAgICAgICBmaWxlLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBfdGhpc18xLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICAgICAgICAgIF90aGlzXzEudGVybWluYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjbCArPSBkYXQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNoa3MucHVzaChkYXQpO1xuICAgICAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGQgPSBuZXcgdTgoMTYpO1xuICAgICAgICAgICAgICAgICAgICB3Ynl0ZXMoZGQsIDAsIDB4ODA3NEI1MCk7XG4gICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgNCwgZmlsZS5jcmMpO1xuICAgICAgICAgICAgICAgICAgICB3Ynl0ZXMoZGQsIDgsIGNsKTtcbiAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCAxMiwgZmlsZS5zaXplKTtcbiAgICAgICAgICAgICAgICAgICAgY2hrcy5wdXNoKGRkKTtcbiAgICAgICAgICAgICAgICAgICAgdWYuYyA9IGNsLCB1Zi5iID0gaGwgKyBjbCArIDE2LCB1Zi5jcmMgPSBmaWxlLmNyYywgdWYuc2l6ZSA9IGZpbGUuc2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyKVxuICAgICAgICAgICAgICAgICAgICAgICAgdWYucigpO1xuICAgICAgICAgICAgICAgICAgICB0ciA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRyKVxuICAgICAgICAgICAgICAgICAgICBwQWxsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudS5wdXNoKHVmKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIHByb2Nlc3Mgb2YgYWRkaW5nIGZpbGVzIGFuZCBwcmVwYXJlcyB0byBlbWl0IHRoZSBmaW5hbCBjaHVua3MuXG4gICAgICogVGhpcyAqbXVzdCogYmUgY2FsbGVkIGFmdGVyIGFkZGluZyBhbGwgZGVzaXJlZCBmaWxlcyBmb3IgdGhlIHJlc3VsdGluZ1xuICAgICAqIFpJUCBmaWxlIHRvIHdvcmsgcHJvcGVybHkuXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuZCAmIDIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmQgJiAxKVxuICAgICAgICAgICAgICAgIHRocm93ICdzdHJlYW0gZmluaXNoaW5nJztcbiAgICAgICAgICAgIHRocm93ICdzdHJlYW0gZmluaXNoZWQnO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICB0aGlzLmUoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy51LnB1c2goe1xuICAgICAgICAgICAgICAgIHI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoX3RoaXNfMS5kICYgMSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIF90aGlzXzEudS5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpc18xLmUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHQ6IGZ1bmN0aW9uICgpIHsgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZCA9IDM7XG4gICAgfTtcbiAgICBaaXAucHJvdG90eXBlLmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBidCA9IDAsIGwgPSAwLCB0bCA9IDA7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9hW19pXTtcbiAgICAgICAgICAgIHRsICs9IDQ2ICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSkgKyAoZi5vID8gZi5vLmxlbmd0aCA6IDApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBvdXQgPSBuZXcgdTgodGwgKyAyMik7XG4gICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLnU7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9jW19iXTtcbiAgICAgICAgICAgIHd6aChvdXQsIGJ0LCBmLCBmLmYsIGYudSwgZi5jLCBsLCBmLm8pO1xuICAgICAgICAgICAgYnQgKz0gNDYgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKSArIChmLm8gPyBmLm8ubGVuZ3RoIDogMCksIGwgKz0gZi5iO1xuICAgICAgICB9XG4gICAgICAgIHd6ZihvdXQsIGJ0LCB0aGlzLnUubGVuZ3RoLCB0bCwgbCk7XG4gICAgICAgIHRoaXMub25kYXRhKG51bGwsIG91dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZCA9IDI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBIG1ldGhvZCB0byB0ZXJtaW5hdGUgYW55IGludGVybmFsIHdvcmtlcnMgdXNlZCBieSB0aGUgc3RyZWFtLiBTdWJzZXF1ZW50XG4gICAgICogY2FsbHMgdG8gYWRkKCkgd2lsbCBmYWlsLlxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy51OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfYVtfaV07XG4gICAgICAgICAgICBmLnQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmQgPSAyO1xuICAgIH07XG4gICAgcmV0dXJuIFppcDtcbn0oKSk7XG5leHBvcnQgeyBaaXAgfTtcbmV4cG9ydCBmdW5jdGlvbiB6aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93ICdubyBjYWxsYmFjayc7XG4gICAgdmFyIHIgPSB7fTtcbiAgICBmbHRuKGRhdGEsICcnLCByLCBvcHRzKTtcbiAgICB2YXIgayA9IE9iamVjdC5rZXlzKHIpO1xuICAgIHZhciBsZnQgPSBrLmxlbmd0aCwgbyA9IDAsIHRvdCA9IDA7XG4gICAgdmFyIHNsZnQgPSBsZnQsIGZpbGVzID0gbmV3IEFycmF5KGxmdCk7XG4gICAgdmFyIHRlcm0gPSBbXTtcbiAgICB2YXIgdEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgdGVybVtpXSgpO1xuICAgIH07XG4gICAgdmFyIGNiZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG91dCA9IG5ldyB1OCh0b3QgKyAyMiksIG9lID0gbywgY2RsID0gdG90IC0gbztcbiAgICAgICAgdG90ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGZ0OyArK2kpIHtcbiAgICAgICAgICAgIHZhciBmID0gZmlsZXNbaV07XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBsID0gZi5jLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB3emgob3V0LCB0b3QsIGYsIGYuZiwgZi51LCBsKTtcbiAgICAgICAgICAgICAgICB2YXIgYmFkZCA9IDMwICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSk7XG4gICAgICAgICAgICAgICAgdmFyIGxvYyA9IHRvdCArIGJhZGQ7XG4gICAgICAgICAgICAgICAgb3V0LnNldChmLmMsIGxvYyk7XG4gICAgICAgICAgICAgICAgd3poKG91dCwgbywgZiwgZi5mLCBmLnUsIGwsIHRvdCwgZi5tKSwgbyArPSAxNiArIGJhZGQgKyAoZi5tID8gZi5tLmxlbmd0aCA6IDApLCB0b3QgPSBsb2MgKyBsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd3pmKG91dCwgbywgZmlsZXMubGVuZ3RoLCBjZGwsIG9lKTtcbiAgICAgICAgY2IobnVsbCwgb3V0KTtcbiAgICB9O1xuICAgIGlmICghbGZ0KVxuICAgICAgICBjYmYoKTtcbiAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciBmbiA9IGtbaV07XG4gICAgICAgIHZhciBfYSA9IHJbZm5dLCBmaWxlID0gX2FbMF0sIHAgPSBfYVsxXTtcbiAgICAgICAgdmFyIGMgPSBjcmMoKSwgc2l6ZSA9IGZpbGUubGVuZ3RoO1xuICAgICAgICBjLnAoZmlsZSk7XG4gICAgICAgIHZhciBmID0gc3RyVG9VOChmbiksIHMgPSBmLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbSA9IHAuY29tbWVudCwgbSA9IGNvbSAmJiBzdHJUb1U4KGNvbSksIG1zID0gbSAmJiBtLmxlbmd0aDtcbiAgICAgICAgdmFyIGV4bCA9IGV4ZmwocC5leHRyYSk7XG4gICAgICAgIHZhciBjb21wcmVzc2lvbiA9IHAubGV2ZWwgPT0gMCA/IDAgOiA4O1xuICAgICAgICB2YXIgY2JsID0gZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICAgICAgdEFsbCgpO1xuICAgICAgICAgICAgICAgIGNiKGUsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGwgPSBkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmaWxlc1tpXSA9IG1yZyhwLCB7XG4gICAgICAgICAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgICAgIGNyYzogYy5kKCksXG4gICAgICAgICAgICAgICAgICAgIGM6IGQsXG4gICAgICAgICAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICAgICAgICAgIG06IG0sXG4gICAgICAgICAgICAgICAgICAgIHU6IHMgIT0gZm4ubGVuZ3RoIHx8IChtICYmIChjb20ubGVuZ3RoICE9IG1zKSksXG4gICAgICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjb21wcmVzc2lvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG8gKz0gMzAgKyBzICsgZXhsICsgbDtcbiAgICAgICAgICAgICAgICB0b3QgKz0gNzYgKyAyICogKHMgKyBleGwpICsgKG1zIHx8IDApICsgbDtcbiAgICAgICAgICAgICAgICBpZiAoIS0tbGZ0KVxuICAgICAgICAgICAgICAgICAgICBjYmYoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHMgPiA2NTUzNSlcbiAgICAgICAgICAgIGNibCgnZmlsZW5hbWUgdG9vIGxvbmcnLCBudWxsKTtcbiAgICAgICAgaWYgKCFjb21wcmVzc2lvbilcbiAgICAgICAgICAgIGNibChudWxsLCBmaWxlKTtcbiAgICAgICAgZWxzZSBpZiAoc2l6ZSA8IDE2MDAwMCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjYmwobnVsbCwgZGVmbGF0ZVN5bmMoZmlsZSwgcCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjYmwoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGVybS5wdXNoKGRlZmxhdGUoZmlsZSwgcCwgY2JsKSk7XG4gICAgfTtcbiAgICAvLyBDYW5ub3QgdXNlIGxmdCBiZWNhdXNlIGl0IGNhbiBkZWNyZWFzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xmdDsgKytpKSB7XG4gICAgICAgIF9sb29wXzEoaSk7XG4gICAgfVxuICAgIHJldHVybiB0QWxsO1xufVxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGNyZWF0ZXMgYSBaSVAgZmlsZS4gUHJlZmVyIHVzaW5nIGB6aXBgIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAqIHdpdGggbW9yZSB0aGFuIG9uZSBmaWxlLlxuICogQHBhcmFtIGRhdGEgVGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgZm9yIHRoZSBaSVAgYXJjaGl2ZVxuICogQHBhcmFtIG9wdHMgVGhlIG1haW4gb3B0aW9ucywgbWVyZ2VkIHdpdGggcGVyLWZpbGUgb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGdlbmVyYXRlZCBaSVAgYXJjaGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIHIgPSB7fTtcbiAgICB2YXIgZmlsZXMgPSBbXTtcbiAgICBmbHRuKGRhdGEsICcnLCByLCBvcHRzKTtcbiAgICB2YXIgbyA9IDA7XG4gICAgdmFyIHRvdCA9IDA7XG4gICAgZm9yICh2YXIgZm4gaW4gcikge1xuICAgICAgICB2YXIgX2EgPSByW2ZuXSwgZmlsZSA9IF9hWzBdLCBwID0gX2FbMV07XG4gICAgICAgIHZhciBjb21wcmVzc2lvbiA9IHAubGV2ZWwgPT0gMCA/IDAgOiA4O1xuICAgICAgICB2YXIgZiA9IHN0clRvVTgoZm4pLCBzID0gZi5sZW5ndGg7XG4gICAgICAgIHZhciBjb20gPSBwLmNvbW1lbnQsIG0gPSBjb20gJiYgc3RyVG9VOChjb20pLCBtcyA9IG0gJiYgbS5sZW5ndGg7XG4gICAgICAgIHZhciBleGwgPSBleGZsKHAuZXh0cmEpO1xuICAgICAgICBpZiAocyA+IDY1NTM1KVxuICAgICAgICAgICAgdGhyb3cgJ2ZpbGVuYW1lIHRvbyBsb25nJztcbiAgICAgICAgdmFyIGQgPSBjb21wcmVzc2lvbiA/IGRlZmxhdGVTeW5jKGZpbGUsIHApIDogZmlsZSwgbCA9IGQubGVuZ3RoO1xuICAgICAgICB2YXIgYyA9IGNyYygpO1xuICAgICAgICBjLnAoZmlsZSk7XG4gICAgICAgIGZpbGVzLnB1c2gobXJnKHAsIHtcbiAgICAgICAgICAgIHNpemU6IGZpbGUubGVuZ3RoLFxuICAgICAgICAgICAgY3JjOiBjLmQoKSxcbiAgICAgICAgICAgIGM6IGQsXG4gICAgICAgICAgICBmOiBmLFxuICAgICAgICAgICAgbTogbSxcbiAgICAgICAgICAgIHU6IHMgIT0gZm4ubGVuZ3RoIHx8IChtICYmIChjb20ubGVuZ3RoICE9IG1zKSksXG4gICAgICAgICAgICBvOiBvLFxuICAgICAgICAgICAgY29tcHJlc3Npb246IGNvbXByZXNzaW9uXG4gICAgICAgIH0pKTtcbiAgICAgICAgbyArPSAzMCArIHMgKyBleGwgKyBsO1xuICAgICAgICB0b3QgKz0gNzYgKyAyICogKHMgKyBleGwpICsgKG1zIHx8IDApICsgbDtcbiAgICB9XG4gICAgdmFyIG91dCA9IG5ldyB1OCh0b3QgKyAyMiksIG9lID0gbywgY2RsID0gdG90IC0gbztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBmID0gZmlsZXNbaV07XG4gICAgICAgIHd6aChvdXQsIGYubywgZiwgZi5mLCBmLnUsIGYuYy5sZW5ndGgpO1xuICAgICAgICB2YXIgYmFkZCA9IDMwICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSk7XG4gICAgICAgIG91dC5zZXQoZi5jLCBmLm8gKyBiYWRkKTtcbiAgICAgICAgd3poKG91dCwgbywgZiwgZi5mLCBmLnUsIGYuYy5sZW5ndGgsIGYubywgZi5tKSwgbyArPSAxNiArIGJhZGQgKyAoZi5tID8gZi5tLmxlbmd0aCA6IDApO1xuICAgIH1cbiAgICB3emYob3V0LCBvLCBmaWxlcy5sZW5ndGgsIGNkbCwgb2UpO1xuICAgIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFN0cmVhbWluZyBwYXNzLXRocm91Z2ggZGVjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBVbnppcFBhc3NUaHJvdWdoID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFVuemlwUGFzc1Rocm91Z2goKSB7XG4gICAgfVxuICAgIFVuemlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgZmluYWwpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgZGF0YSwgZmluYWwpO1xuICAgIH07XG4gICAgVW56aXBQYXNzVGhyb3VnaC5jb21wcmVzc2lvbiA9IDA7XG4gICAgcmV0dXJuIFVuemlwUGFzc1Rocm91Z2g7XG59KCkpO1xuZXhwb3J0IHsgVW56aXBQYXNzVGhyb3VnaCB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXMuIFByZWZlciBBc3luY1ppcEluZmxhdGUgZm9yXG4gKiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gKi9cbnZhciBVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFVuemlwSW5mbGF0ZSgpIHtcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xuICAgICAgICB0aGlzLmkgPSBuZXcgSW5mbGF0ZShmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXNfMS5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgZmluYWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuaS5wdXNoKGRhdGEsIGZpbmFsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZSwgZGF0YSwgZmluYWwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBVbnppcEluZmxhdGUuY29tcHJlc3Npb24gPSA4O1xuICAgIHJldHVybiBVbnppcEluZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgVW56aXBJbmZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXNcbiAqL1xudmFyIEFzeW5jVW56aXBJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBERUZMQVRFIGRlY29tcHJlc3Npb24gdGhhdCBjYW4gYmUgdXNlZCBpbiBaSVAgYXJjaGl2ZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBBc3luY1VuemlwSW5mbGF0ZShfLCBzeikge1xuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XG4gICAgICAgIGlmIChzeiA8IDMyMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgICAgICBfdGhpc18xLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEFzeW5jSW5mbGF0ZShmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXNfMS5vbmRhdGEoZXJyLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy50ZXJtaW5hdGUgPSB0aGlzLmkudGVybWluYXRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIEFzeW5jVW56aXBJbmZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIGZpbmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmkudGVybWluYXRlKVxuICAgICAgICAgICAgZGF0YSA9IHNsYyhkYXRhLCAwKTtcbiAgICAgICAgdGhpcy5pLnB1c2goZGF0YSwgZmluYWwpO1xuICAgIH07XG4gICAgQXN5bmNVbnppcEluZmxhdGUuY29tcHJlc3Npb24gPSA4O1xuICAgIHJldHVybiBBc3luY1VuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1VuemlwSW5mbGF0ZSB9O1xuLyoqXG4gKiBBIFpJUCBhcmNoaXZlIGRlY29tcHJlc3Npb24gc3RyZWFtIHRoYXQgZW1pdHMgZmlsZXMgYXMgdGhleSBhcmUgZGlzY292ZXJlZFxuICovXG52YXIgVW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFpJUCBkZWNvbXByZXNzaW9uIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBhIGZpbGUgaW4gdGhlIFpJUCBhcmNoaXZlIGlzIGZvdW5kXG4gICAgICovXG4gICAgZnVuY3Rpb24gVW56aXAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmZpbGUgPSBjYjtcbiAgICAgICAgdGhpcy5rID0gW107XG4gICAgICAgIHRoaXMubyA9IHtcbiAgICAgICAgICAgIDA6IFVuemlwUGFzc1Rocm91Z2hcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHVuemlwcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5vbmZpbGUpXG4gICAgICAgICAgICB0aHJvdyAnbm8gY2FsbGJhY2snO1xuICAgICAgICBpZiAoIXRoaXMucClcbiAgICAgICAgICAgIHRocm93ICdzdHJlYW0gZmluaXNoZWQnO1xuICAgICAgICBpZiAodGhpcy5jID4gMCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IE1hdGgubWluKHRoaXMuYywgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciB0b0FkZCA9IGNodW5rLnN1YmFycmF5KDAsIGxlbik7XG4gICAgICAgICAgICB0aGlzLmMgLT0gbGVuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgICAgICB0aGlzLmQucHVzaCh0b0FkZCwgIXRoaXMuYyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5rWzBdLnB1c2godG9BZGQpO1xuICAgICAgICAgICAgY2h1bmsgPSBjaHVuay5zdWJhcnJheShsZW4pO1xuICAgICAgICAgICAgaWYgKGNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZiA9IDAsIGkgPSAwLCBpcyA9IHZvaWQgMCwgYnVmID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnAubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJ1ZiA9IGNodW5rO1xuICAgICAgICAgICAgZWxzZSBpZiAoIWNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidWYgPSB0aGlzLnA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWYgPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgYnVmLnNldCh0aGlzLnApLCBidWYuc2V0KGNodW5rLCB0aGlzLnAubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsID0gYnVmLmxlbmd0aCwgb2MgPSB0aGlzLmMsIGFkZCA9IG9jICYmIHRoaXMuZDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICB2YXIgc2lnID0gYjQoYnVmLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4NDAzNEI1MCkge1xuICAgICAgICAgICAgICAgICAgICBmID0gMSwgaXMgPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzXzEuZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJmID0gYjIoYnVmLCBpICsgNiksIGNtcF8xID0gYjIoYnVmLCBpICsgOCksIHUgPSBiZiAmIDIwNDgsIGRkID0gYmYgJiA4LCBmbmwgPSBiMihidWYsIGkgKyAyNiksIGVzID0gYjIoYnVmLCBpICsgMjgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobCA+IGkgKyAzMCArIGZubCArIGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hrc18yID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuay51bnNoaWZ0KGNoa3NfMik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY18xID0gYjQoYnVmLCBpICsgMTgpLCBzdV8xID0gYjQoYnVmLCBpICsgMjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZuXzEgPSBzdHJGcm9tVTgoYnVmLnN1YmFycmF5KGkgKyAzMCwgaSArPSAzMCArIGZubCksICF1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY18xID09IDQyOTQ5NjcyOTUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYSA9IGRkID8gWy0yXSA6IHo2NGUoYnVmLCBpKSwgc2NfMSA9IF9hWzBdLCBzdV8xID0gX2FbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY18xID0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmMgPSBzY18xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZm5fMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2lvbjogY21wXzEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlXzEub25kYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ25vIGNhbGxiYWNrJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzY18xKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZV8xLm9uZGF0YShudWxsLCBldCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN0ciA9IF90aGlzXzEub1tjbXBfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjbXBfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMSA9IHNjXzEgPCAwID8gbmV3IGN0cihmbl8xKSA6IG5ldyBjdHIoZm5fMSwgc2NfMSwgc3VfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEub25kYXRhID0gZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkgeyBmaWxlXzEub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7IH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNoa3NfMyA9IGNoa3NfMjsgX2kgPCBjaGtzXzMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdCA9IGNoa3NfM1tfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZF8xLnB1c2goZGF0LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXNfMS5rWzBdID09IGNoa3NfMiAmJiBfdGhpc18xLmMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXNfMS5kID0gZF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS5wdXNoKGV0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVybWluYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkXzEgJiYgZF8xLnRlcm1pbmF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjXzEgPj0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEuc2l6ZSA9IHNjXzEsIGZpbGVfMS5vcmlnaW5hbFNpemUgPSBzdV8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLm9uZmlsZShmaWxlXzEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaWcgPT0gMHg4MDc0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcyA9IGkgKz0gMTIgKyAob2MgPT0gLTIgJiYgOCksIGYgPSAzLCB0aGlzXzEuYyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNpZyA9PSAweDIwMTRCNTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzID0gaSAtPSA0LCBmID0gMywgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdGhpc18xID0gdGhpcztcbiAgICAgICAgICAgIGZvciAoOyBpIDwgbCAtIDQ7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZV8xID0gX2xvb3BfMigpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZV8xID09PSBcImJyZWFrXCIpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgICAgICAgICBpZiAob2MgPCAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdCA9IGYgPyBidWYuc3ViYXJyYXkoMCwgaXMgLSAxMiAtIChvYyA9PSAtMiAmJiA4KSAtIChiNChidWYsIGlzIC0gMTYpID09IDB4ODA3NEI1MCAmJiA0KSkgOiBidWYuc3ViYXJyYXkoMCwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZClcbiAgICAgICAgICAgICAgICAgICAgYWRkLnB1c2goZGF0LCAhIWYpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rWysoZiA9PSAyKV0ucHVzaChkYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGYgJiAyKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goYnVmLnN1YmFycmF5KGkpLCBmaW5hbCk7XG4gICAgICAgICAgICB0aGlzLnAgPSBidWYuc3ViYXJyYXkoaSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jKVxuICAgICAgICAgICAgICAgIHRocm93ICdpbnZhbGlkIHppcCBmaWxlJztcbiAgICAgICAgICAgIHRoaXMucCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyBhIGRlY29kZXIgd2l0aCB0aGUgc3RyZWFtLCBhbGxvd2luZyBmb3IgZmlsZXMgY29tcHJlc3NlZCB3aXRoXG4gICAgICogdGhlIGNvbXByZXNzaW9uIHR5cGUgcHJvdmlkZWQgdG8gYmUgZXhwYW5kZWQgY29ycmVjdGx5XG4gICAgICogQHBhcmFtIGRlY29kZXIgVGhlIGRlY29kZXIgY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBVbnppcC5wcm90b3R5cGUucmVnaXN0ZXIgPSBmdW5jdGlvbiAoZGVjb2Rlcikge1xuICAgICAgICB0aGlzLm9bZGVjb2Rlci5jb21wcmVzc2lvbl0gPSBkZWNvZGVyO1xuICAgIH07XG4gICAgcmV0dXJuIFVuemlwO1xufSgpKTtcbmV4cG9ydCB7IFVuemlwIH07XG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IGRlY29tcHJlc3NlcyBhIFpJUCBhcmNoaXZlXG4gKiBAcGFyYW0gZGF0YSBUaGUgcmF3IGNvbXByZXNzZWQgWklQIGZpbGVcbiAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aXRoIHRoZSBkZWNvbXByZXNzZWQgZmlsZXNcbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBpbW1lZGlhdGVseSB0ZXJtaW5hdGUgdGhlIHVuemlwcGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW56aXAoZGF0YSwgY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93ICdubyBjYWxsYmFjayc7XG4gICAgdmFyIHRlcm0gPSBbXTtcbiAgICB2YXIgdEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgdGVybVtpXSgpO1xuICAgIH07XG4gICAgdmFyIGZpbGVzID0ge307XG4gICAgdmFyIGUgPSBkYXRhLmxlbmd0aCAtIDIyO1xuICAgIGZvciAoOyBiNChkYXRhLCBlKSAhPSAweDYwNTRCNTA7IC0tZSkge1xuICAgICAgICBpZiAoIWUgfHwgZGF0YS5sZW5ndGggLSBlID4gNjU1NTgpIHtcbiAgICAgICAgICAgIGNiKCdpbnZhbGlkIHppcCBmaWxlJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIHZhciBsZnQgPSBiMihkYXRhLCBlICsgOCk7XG4gICAgaWYgKCFsZnQpXG4gICAgICAgIGNiKG51bGwsIHt9KTtcbiAgICB2YXIgYyA9IGxmdDtcbiAgICB2YXIgbyA9IGI0KGRhdGEsIGUgKyAxNik7XG4gICAgdmFyIHogPSBvID09IDQyOTQ5NjcyOTU7XG4gICAgaWYgKHopIHtcbiAgICAgICAgZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgIGlmIChiNChkYXRhLCBlKSAhPSAweDYwNjRCNTApIHtcbiAgICAgICAgICAgIGNiKCdpbnZhbGlkIHppcCBmaWxlJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYyA9IGxmdCA9IGI0KGRhdGEsIGUgKyAzMik7XG4gICAgICAgIG8gPSBiNChkYXRhLCBlICsgNDgpO1xuICAgIH1cbiAgICB2YXIgX2xvb3BfMyA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciBfYSA9IHpoKGRhdGEsIG8sIHopLCBjXzEgPSBfYVswXSwgc2MgPSBfYVsxXSwgc3UgPSBfYVsyXSwgZm4gPSBfYVszXSwgbm8gPSBfYVs0XSwgb2ZmID0gX2FbNV0sIGIgPSBzbHpoKGRhdGEsIG9mZik7XG4gICAgICAgIG8gPSBubztcbiAgICAgICAgdmFyIGNibCA9IGZ1bmN0aW9uIChlLCBkKSB7XG4gICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgIHRBbGwoKTtcbiAgICAgICAgICAgICAgICBjYihlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpbGVzW2ZuXSA9IGQ7XG4gICAgICAgICAgICAgICAgaWYgKCEtLWxmdClcbiAgICAgICAgICAgICAgICAgICAgY2IobnVsbCwgZmlsZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWNfMSlcbiAgICAgICAgICAgIGNibChudWxsLCBzbGMoZGF0YSwgYiwgYiArIHNjKSk7XG4gICAgICAgIGVsc2UgaWYgKGNfMSA9PSA4KSB7XG4gICAgICAgICAgICB2YXIgaW5mbCA9IGRhdGEuc3ViYXJyYXkoYiwgYiArIHNjKTtcbiAgICAgICAgICAgIGlmIChzYyA8IDMyMDAwMCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNibChudWxsLCBpbmZsYXRlU3luYyhpbmZsLCBuZXcgdTgoc3UpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNibChlLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGVybS5wdXNoKGluZmxhdGUoaW5mbCwgeyBzaXplOiBzdSB9LCBjYmwpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYmwoJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY18xLCBudWxsKTtcbiAgICB9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYzsgKytpKSB7XG4gICAgICAgIF9sb29wXzMoaSk7XG4gICAgfVxuICAgIHJldHVybiB0QWxsO1xufVxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGRlY29tcHJlc3NlcyBhIFpJUCBhcmNoaXZlLiBQcmVmZXIgdXNpbmcgYHVuemlwYCBmb3IgYmV0dGVyXG4gKiBwZXJmb3JtYW5jZSB3aXRoIG1vcmUgdGhhbiBvbmUgZmlsZS5cbiAqIEBwYXJhbSBkYXRhIFRoZSByYXcgY29tcHJlc3NlZCBaSVAgZmlsZVxuICogQHJldHVybnMgVGhlIGRlY29tcHJlc3NlZCBmaWxlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW56aXBTeW5jKGRhdGEpIHtcbiAgICB2YXIgZmlsZXMgPSB7fTtcbiAgICB2YXIgZSA9IGRhdGEubGVuZ3RoIC0gMjI7XG4gICAgZm9yICg7IGI0KGRhdGEsIGUpICE9IDB4NjA1NEI1MDsgLS1lKSB7XG4gICAgICAgIGlmICghZSB8fCBkYXRhLmxlbmd0aCAtIGUgPiA2NTU1OClcbiAgICAgICAgICAgIHRocm93ICdpbnZhbGlkIHppcCBmaWxlJztcbiAgICB9XG4gICAgO1xuICAgIHZhciBjID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmICghYylcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICB2YXIgeiA9IG8gPT0gNDI5NDk2NzI5NTtcbiAgICBpZiAoeikge1xuICAgICAgICBlID0gYjQoZGF0YSwgZSAtIDEyKTtcbiAgICAgICAgaWYgKGI0KGRhdGEsIGUpICE9IDB4NjA2NEI1MClcbiAgICAgICAgICAgIHRocm93ICdpbnZhbGlkIHppcCBmaWxlJztcbiAgICAgICAgYyA9IGI0KGRhdGEsIGUgKyAzMik7XG4gICAgICAgIG8gPSBiNChkYXRhLCBlICsgNDgpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGM7ICsraSkge1xuICAgICAgICB2YXIgX2EgPSB6aChkYXRhLCBvLCB6KSwgY18yID0gX2FbMF0sIHNjID0gX2FbMV0sIHN1ID0gX2FbMl0sIGZuID0gX2FbM10sIG5vID0gX2FbNF0sIG9mZiA9IF9hWzVdLCBiID0gc2x6aChkYXRhLCBvZmYpO1xuICAgICAgICBvID0gbm87XG4gICAgICAgIGlmICghY18yKVxuICAgICAgICAgICAgZmlsZXNbZm5dID0gc2xjKGRhdGEsIGIsIGIgKyBzYyk7XG4gICAgICAgIGVsc2UgaWYgKGNfMiA9PSA4KVxuICAgICAgICAgICAgZmlsZXNbZm5dID0gaW5mbGF0ZVN5bmMoZGF0YS5zdWJhcnJheShiLCBiICsgc2MpLCBuZXcgdTgoc3UpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY18yO1xuICAgIH1cbiAgICByZXR1cm4gZmlsZXM7XG59XG4iLCJpbXBvcnQge1xuXHRBbWJpZW50TGlnaHQsXG5cdEFuaW1hdGlvbkNsaXAsXG5cdEJvbmUsXG5cdEJ1ZmZlckdlb21ldHJ5LFxuXHRDbGFtcFRvRWRnZVdyYXBwaW5nLFxuXHRDb2xvcixcblx0RGlyZWN0aW9uYWxMaWdodCxcblx0RXF1aXJlY3Rhbmd1bGFyUmVmbGVjdGlvbk1hcHBpbmcsXG5cdEV1bGVyLFxuXHRGaWxlTG9hZGVyLFxuXHRGbG9hdDMyQnVmZmVyQXR0cmlidXRlLFxuXHRHcm91cCxcblx0TGluZSxcblx0TGluZUJhc2ljTWF0ZXJpYWwsXG5cdExvYWRlcixcblx0TG9hZGVyVXRpbHMsXG5cdE1hdGhVdGlscyxcblx0TWF0cml4Myxcblx0TWF0cml4NCxcblx0TWVzaCxcblx0TWVzaExhbWJlcnRNYXRlcmlhbCxcblx0TWVzaFBob25nTWF0ZXJpYWwsXG5cdE51bWJlcktleWZyYW1lVHJhY2ssXG5cdE9iamVjdDNELFxuXHRPcnRob2dyYXBoaWNDYW1lcmEsXG5cdFBlcnNwZWN0aXZlQ2FtZXJhLFxuXHRQb2ludExpZ2h0LFxuXHRQcm9wZXJ0eUJpbmRpbmcsXG5cdFF1YXRlcm5pb24sXG5cdFF1YXRlcm5pb25LZXlmcmFtZVRyYWNrLFxuXHRSZXBlYXRXcmFwcGluZyxcblx0U2tlbGV0b24sXG5cdFNraW5uZWRNZXNoLFxuXHRTcG90TGlnaHQsXG5cdFRleHR1cmUsXG5cdFRleHR1cmVMb2FkZXIsXG5cdFVpbnQxNkJ1ZmZlckF0dHJpYnV0ZSxcblx0VmVjdG9yMyxcblx0VmVjdG9yNCxcblx0VmVjdG9yS2V5ZnJhbWVUcmFjayxcblx0c1JHQkVuY29kaW5nXG59IGZyb20gJ3RocmVlJztcbmltcG9ydCAqIGFzIGZmbGF0ZSBmcm9tICcuLi9saWJzL2ZmbGF0ZS5tb2R1bGUuanMnO1xuaW1wb3J0IHsgTlVSQlNDdXJ2ZSB9IGZyb20gJy4uL2N1cnZlcy9OVVJCU0N1cnZlLmpzJztcblxuLyoqXG4gKiBMb2FkZXIgbG9hZHMgRkJYIGZpbGUgYW5kIGdlbmVyYXRlcyBHcm91cCByZXByZXNlbnRpbmcgRkJYIHNjZW5lLlxuICogUmVxdWlyZXMgRkJYIGZpbGUgdG8gYmUgPj0gNy4wIGFuZCBpbiBBU0NJSSBvciA+PSA2NDAwIGluIEJpbmFyeSBmb3JtYXRcbiAqIFZlcnNpb25zIGxvd2VyIHRoYW4gdGhpcyBtYXkgbG9hZCBidXQgd2lsbCBwcm9iYWJseSBoYXZlIGVycm9yc1xuICpcbiAqIE5lZWRzIFN1cHBvcnQ6XG4gKiAgTW9ycGggbm9ybWFscyAvIGJsZW5kIHNoYXBlIG5vcm1hbHNcbiAqXG4gKiBGQlggZm9ybWF0IHJlZmVyZW5jZXM6XG4gKiBcdGh0dHBzOi8vd2lraS5ibGVuZGVyLm9yZy9pbmRleC5waHAvVXNlcjpNb250MjkvRm91bmRhdGlvbi9GQlhfRmlsZV9TdHJ1Y3R1cmVcbiAqIFx0aHR0cDovL2hlbHAuYXV0b2Rlc2suY29tL3ZpZXcvRkJYLzIwMTcvRU5VLz9ndWlkPV9fY3BwX3JlZl9pbmRleF9odG1sIChDKysgU0RLIHJlZmVyZW5jZSlcbiAqXG4gKiBcdEJpbmFyeSBmb3JtYXQgc3BlY2lmaWNhdGlvbjpcbiAqXHRcdGh0dHBzOi8vY29kZS5ibGVuZGVyLm9yZy8yMDEzLzA4L2ZieC1iaW5hcnktZmlsZS1mb3JtYXQtc3BlY2lmaWNhdGlvbi9cbiAqL1xuXG5cbmxldCBmYnhUcmVlO1xubGV0IGNvbm5lY3Rpb25zO1xubGV0IHNjZW5lR3JhcGg7XG5cbmNsYXNzIEZCWExvYWRlciBleHRlbmRzIExvYWRlciB7XG5cblx0Y29uc3RydWN0b3IoIG1hbmFnZXIgKSB7XG5cblx0XHRzdXBlciggbWFuYWdlciApO1xuXG5cdH1cblxuXHRsb2FkKCB1cmwsIG9uTG9hZCwgb25Qcm9ncmVzcywgb25FcnJvciApIHtcblxuXHRcdGNvbnN0IHNjb3BlID0gdGhpcztcblxuXHRcdGNvbnN0IHBhdGggPSAoIHNjb3BlLnBhdGggPT09ICcnICkgPyBMb2FkZXJVdGlscy5leHRyYWN0VXJsQmFzZSggdXJsICkgOiBzY29wZS5wYXRoO1xuXG5cdFx0Y29uc3QgbG9hZGVyID0gbmV3IEZpbGVMb2FkZXIoIHRoaXMubWFuYWdlciApO1xuXHRcdGxvYWRlci5zZXRQYXRoKCBzY29wZS5wYXRoICk7XG5cdFx0bG9hZGVyLnNldFJlc3BvbnNlVHlwZSggJ2FycmF5YnVmZmVyJyApO1xuXHRcdGxvYWRlci5zZXRSZXF1ZXN0SGVhZGVyKCBzY29wZS5yZXF1ZXN0SGVhZGVyICk7XG5cdFx0bG9hZGVyLnNldFdpdGhDcmVkZW50aWFscyggc2NvcGUud2l0aENyZWRlbnRpYWxzICk7XG5cblx0XHRsb2FkZXIubG9hZCggdXJsLCBmdW5jdGlvbiAoIGJ1ZmZlciApIHtcblxuXHRcdFx0dHJ5IHtcblxuXHRcdFx0XHRvbkxvYWQoIHNjb3BlLnBhcnNlKCBidWZmZXIsIHBhdGggKSApO1xuXG5cdFx0XHR9IGNhdGNoICggZSApIHtcblxuXHRcdFx0XHRpZiAoIG9uRXJyb3IgKSB7XG5cblx0XHRcdFx0XHRvbkVycm9yKCBlICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGUgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2NvcGUubWFuYWdlci5pdGVtRXJyb3IoIHVybCApO1xuXG5cdFx0XHR9XG5cblx0XHR9LCBvblByb2dyZXNzLCBvbkVycm9yICk7XG5cblx0fVxuXG5cdHBhcnNlKCBGQlhCdWZmZXIsIHBhdGggKSB7XG5cblx0XHRpZiAoIGlzRmJ4Rm9ybWF0QmluYXJ5KCBGQlhCdWZmZXIgKSApIHtcblxuXHRcdFx0ZmJ4VHJlZSA9IG5ldyBCaW5hcnlQYXJzZXIoKS5wYXJzZSggRkJYQnVmZmVyICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRjb25zdCBGQlhUZXh0ID0gY29udmVydEFycmF5QnVmZmVyVG9TdHJpbmcoIEZCWEJ1ZmZlciApO1xuXG5cdFx0XHRpZiAoICEgaXNGYnhGb3JtYXRBU0NJSSggRkJYVGV4dCApICkge1xuXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLkZCWExvYWRlcjogVW5rbm93biBmb3JtYXQuJyApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggZ2V0RmJ4VmVyc2lvbiggRkJYVGV4dCApIDwgNzAwMCApIHtcblxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5GQlhMb2FkZXI6IEZCWCB2ZXJzaW9uIG5vdCBzdXBwb3J0ZWQsIEZpbGVWZXJzaW9uOiAnICsgZ2V0RmJ4VmVyc2lvbiggRkJYVGV4dCApICk7XG5cblx0XHRcdH1cblxuXHRcdFx0ZmJ4VHJlZSA9IG5ldyBUZXh0UGFyc2VyKCkucGFyc2UoIEZCWFRleHQgKTtcblxuXHRcdH1cblxuXHRcdC8vIGNvbnNvbGUubG9nKCBmYnhUcmVlICk7XG5cblx0XHRjb25zdCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRleHR1cmVMb2FkZXIoIHRoaXMubWFuYWdlciApLnNldFBhdGgoIHRoaXMucmVzb3VyY2VQYXRoIHx8IHBhdGggKS5zZXRDcm9zc09yaWdpbiggdGhpcy5jcm9zc09yaWdpbiApO1xuXG5cdFx0cmV0dXJuIG5ldyBGQlhUcmVlUGFyc2VyKCB0ZXh0dXJlTG9hZGVyLCB0aGlzLm1hbmFnZXIgKS5wYXJzZSggZmJ4VHJlZSApO1xuXG5cdH1cblxufVxuXG4vLyBQYXJzZSB0aGUgRkJYVHJlZSBvYmplY3QgcmV0dXJuZWQgYnkgdGhlIEJpbmFyeVBhcnNlciBvciBUZXh0UGFyc2VyIGFuZCByZXR1cm4gYSBHcm91cFxuY2xhc3MgRkJYVHJlZVBhcnNlciB7XG5cblx0Y29uc3RydWN0b3IoIHRleHR1cmVMb2FkZXIsIG1hbmFnZXIgKSB7XG5cblx0XHR0aGlzLnRleHR1cmVMb2FkZXIgPSB0ZXh0dXJlTG9hZGVyO1xuXHRcdHRoaXMubWFuYWdlciA9IG1hbmFnZXI7XG5cblx0fVxuXG5cdHBhcnNlKCkge1xuXG5cdFx0Y29ubmVjdGlvbnMgPSB0aGlzLnBhcnNlQ29ubmVjdGlvbnMoKTtcblxuXHRcdGNvbnN0IGltYWdlcyA9IHRoaXMucGFyc2VJbWFnZXMoKTtcblx0XHRjb25zdCB0ZXh0dXJlcyA9IHRoaXMucGFyc2VUZXh0dXJlcyggaW1hZ2VzICk7XG5cdFx0Y29uc3QgbWF0ZXJpYWxzID0gdGhpcy5wYXJzZU1hdGVyaWFscyggdGV4dHVyZXMgKTtcblx0XHRjb25zdCBkZWZvcm1lcnMgPSB0aGlzLnBhcnNlRGVmb3JtZXJzKCk7XG5cdFx0Y29uc3QgZ2VvbWV0cnlNYXAgPSBuZXcgR2VvbWV0cnlQYXJzZXIoKS5wYXJzZSggZGVmb3JtZXJzICk7XG5cblx0XHR0aGlzLnBhcnNlU2NlbmUoIGRlZm9ybWVycywgZ2VvbWV0cnlNYXAsIG1hdGVyaWFscyApO1xuXG5cdFx0cmV0dXJuIHNjZW5lR3JhcGg7XG5cblx0fVxuXG5cdC8vIFBhcnNlcyBGQlhUcmVlLkNvbm5lY3Rpb25zIHdoaWNoIGhvbGRzIHBhcmVudC1jaGlsZCBjb25uZWN0aW9ucyBiZXR3ZWVuIG9iamVjdHMgKGUuZy4gbWF0ZXJpYWwgLT4gdGV4dHVyZSwgbW9kZWwtPmdlb21ldHJ5IClcblx0Ly8gYW5kIGRldGFpbHMgdGhlIGNvbm5lY3Rpb24gdHlwZVxuXHRwYXJzZUNvbm5lY3Rpb25zKCkge1xuXG5cdFx0Y29uc3QgY29ubmVjdGlvbk1hcCA9IG5ldyBNYXAoKTtcblxuXHRcdGlmICggJ0Nvbm5lY3Rpb25zJyBpbiBmYnhUcmVlICkge1xuXG5cdFx0XHRjb25zdCByYXdDb25uZWN0aW9ucyA9IGZieFRyZWUuQ29ubmVjdGlvbnMuY29ubmVjdGlvbnM7XG5cblx0XHRcdHJhd0Nvbm5lY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uICggcmF3Q29ubmVjdGlvbiApIHtcblxuXHRcdFx0XHRjb25zdCBmcm9tSUQgPSByYXdDb25uZWN0aW9uWyAwIF07XG5cdFx0XHRcdGNvbnN0IHRvSUQgPSByYXdDb25uZWN0aW9uWyAxIF07XG5cdFx0XHRcdGNvbnN0IHJlbGF0aW9uc2hpcCA9IHJhd0Nvbm5lY3Rpb25bIDIgXTtcblxuXHRcdFx0XHRpZiAoICEgY29ubmVjdGlvbk1hcC5oYXMoIGZyb21JRCApICkge1xuXG5cdFx0XHRcdFx0Y29ubmVjdGlvbk1hcC5zZXQoIGZyb21JRCwge1xuXHRcdFx0XHRcdFx0cGFyZW50czogW10sXG5cdFx0XHRcdFx0XHRjaGlsZHJlbjogW11cblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHBhcmVudFJlbGF0aW9uc2hpcCA9IHsgSUQ6IHRvSUQsIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwIH07XG5cdFx0XHRcdGNvbm5lY3Rpb25NYXAuZ2V0KCBmcm9tSUQgKS5wYXJlbnRzLnB1c2goIHBhcmVudFJlbGF0aW9uc2hpcCApO1xuXG5cdFx0XHRcdGlmICggISBjb25uZWN0aW9uTWFwLmhhcyggdG9JRCApICkge1xuXG5cdFx0XHRcdFx0Y29ubmVjdGlvbk1hcC5zZXQoIHRvSUQsIHtcblx0XHRcdFx0XHRcdHBhcmVudHM6IFtdLFxuXHRcdFx0XHRcdFx0Y2hpbGRyZW46IFtdXG5cdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBjaGlsZFJlbGF0aW9uc2hpcCA9IHsgSUQ6IGZyb21JRCwgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXAgfTtcblx0XHRcdFx0Y29ubmVjdGlvbk1hcC5nZXQoIHRvSUQgKS5jaGlsZHJlbi5wdXNoKCBjaGlsZFJlbGF0aW9uc2hpcCApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gY29ubmVjdGlvbk1hcDtcblxuXHR9XG5cblx0Ly8gUGFyc2UgRkJYVHJlZS5PYmplY3RzLlZpZGVvIGZvciBlbWJlZGRlZCBpbWFnZSBkYXRhXG5cdC8vIFRoZXNlIGltYWdlcyBhcmUgY29ubmVjdGVkIHRvIHRleHR1cmVzIGluIEZCWFRyZWUuT2JqZWN0cy5UZXh0dXJlc1xuXHQvLyB2aWEgRkJYVHJlZS5Db25uZWN0aW9ucy5cblx0cGFyc2VJbWFnZXMoKSB7XG5cblx0XHRjb25zdCBpbWFnZXMgPSB7fTtcblx0XHRjb25zdCBibG9icyA9IHt9O1xuXG5cdFx0aWYgKCAnVmlkZW8nIGluIGZieFRyZWUuT2JqZWN0cyApIHtcblxuXHRcdFx0Y29uc3QgdmlkZW9Ob2RlcyA9IGZieFRyZWUuT2JqZWN0cy5WaWRlbztcblxuXHRcdFx0Zm9yICggY29uc3Qgbm9kZUlEIGluIHZpZGVvTm9kZXMgKSB7XG5cblx0XHRcdFx0Y29uc3QgdmlkZW9Ob2RlID0gdmlkZW9Ob2Rlc1sgbm9kZUlEIF07XG5cblx0XHRcdFx0Y29uc3QgaWQgPSBwYXJzZUludCggbm9kZUlEICk7XG5cblx0XHRcdFx0aW1hZ2VzWyBpZCBdID0gdmlkZW9Ob2RlLlJlbGF0aXZlRmlsZW5hbWUgfHwgdmlkZW9Ob2RlLkZpbGVuYW1lO1xuXG5cdFx0XHRcdC8vIHJhdyBpbWFnZSBkYXRhIGlzIGluIHZpZGVvTm9kZS5Db250ZW50XG5cdFx0XHRcdGlmICggJ0NvbnRlbnQnIGluIHZpZGVvTm9kZSApIHtcblxuXHRcdFx0XHRcdGNvbnN0IGFycmF5QnVmZmVyQ29udGVudCA9ICggdmlkZW9Ob2RlLkNvbnRlbnQgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciApICYmICggdmlkZW9Ob2RlLkNvbnRlbnQuYnl0ZUxlbmd0aCA+IDAgKTtcblx0XHRcdFx0XHRjb25zdCBiYXNlNjRDb250ZW50ID0gKCB0eXBlb2YgdmlkZW9Ob2RlLkNvbnRlbnQgPT09ICdzdHJpbmcnICkgJiYgKCB2aWRlb05vZGUuQ29udGVudCAhPT0gJycgKTtcblxuXHRcdFx0XHRcdGlmICggYXJyYXlCdWZmZXJDb250ZW50IHx8IGJhc2U2NENvbnRlbnQgKSB7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGltYWdlID0gdGhpcy5wYXJzZUltYWdlKCB2aWRlb05vZGVzWyBub2RlSUQgXSApO1xuXG5cdFx0XHRcdFx0XHRibG9ic1sgdmlkZW9Ob2RlLlJlbGF0aXZlRmlsZW5hbWUgfHwgdmlkZW9Ob2RlLkZpbGVuYW1lIF0gPSBpbWFnZTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGZvciAoIGNvbnN0IGlkIGluIGltYWdlcyApIHtcblxuXHRcdFx0Y29uc3QgZmlsZW5hbWUgPSBpbWFnZXNbIGlkIF07XG5cblx0XHRcdGlmICggYmxvYnNbIGZpbGVuYW1lIF0gIT09IHVuZGVmaW5lZCApIGltYWdlc1sgaWQgXSA9IGJsb2JzWyBmaWxlbmFtZSBdO1xuXHRcdFx0ZWxzZSBpbWFnZXNbIGlkIF0gPSBpbWFnZXNbIGlkIF0uc3BsaXQoICdcXFxcJyApLnBvcCgpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGltYWdlcztcblxuXHR9XG5cblx0Ly8gUGFyc2UgZW1iZWRkZWQgaW1hZ2UgZGF0YSBpbiBGQlhUcmVlLlZpZGVvLkNvbnRlbnRcblx0cGFyc2VJbWFnZSggdmlkZW9Ob2RlICkge1xuXG5cdFx0Y29uc3QgY29udGVudCA9IHZpZGVvTm9kZS5Db250ZW50O1xuXHRcdGNvbnN0IGZpbGVOYW1lID0gdmlkZW9Ob2RlLlJlbGF0aXZlRmlsZW5hbWUgfHwgdmlkZW9Ob2RlLkZpbGVuYW1lO1xuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IGZpbGVOYW1lLnNsaWNlKCBmaWxlTmFtZS5sYXN0SW5kZXhPZiggJy4nICkgKyAxICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdGxldCB0eXBlO1xuXG5cdFx0c3dpdGNoICggZXh0ZW5zaW9uICkge1xuXG5cdFx0XHRjYXNlICdibXAnOlxuXG5cdFx0XHRcdHR5cGUgPSAnaW1hZ2UvYm1wJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2pwZyc6XG5cdFx0XHRjYXNlICdqcGVnJzpcblxuXHRcdFx0XHR0eXBlID0gJ2ltYWdlL2pwZWcnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAncG5nJzpcblxuXHRcdFx0XHR0eXBlID0gJ2ltYWdlL3BuZyc7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICd0aWYnOlxuXG5cdFx0XHRcdHR5cGUgPSAnaW1hZ2UvdGlmZic7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICd0Z2EnOlxuXG5cdFx0XHRcdGlmICggdGhpcy5tYW5hZ2VyLmdldEhhbmRsZXIoICcudGdhJyApID09PSBudWxsICkge1xuXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCAnRkJYTG9hZGVyOiBUR0EgbG9hZGVyIG5vdCBmb3VuZCwgc2tpcHBpbmcgJywgZmlsZU5hbWUgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHlwZSA9ICdpbWFnZS90Z2EnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHRjb25zb2xlLndhcm4oICdGQlhMb2FkZXI6IEltYWdlIHR5cGUgXCInICsgZXh0ZW5zaW9uICsgJ1wiIGlzIG5vdCBzdXBwb3J0ZWQuJyApO1xuXHRcdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJyApIHsgLy8gQVNDSUkgZm9ybWF0XG5cblx0XHRcdHJldHVybiAnZGF0YTonICsgdHlwZSArICc7YmFzZTY0LCcgKyBjb250ZW50O1xuXG5cdFx0fSBlbHNlIHsgLy8gQmluYXJ5IEZvcm1hdFxuXG5cdFx0XHRjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KCBjb250ZW50ICk7XG5cdFx0XHRyZXR1cm4gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoIG5ldyBCbG9iKCBbIGFycmF5IF0sIHsgdHlwZTogdHlwZSB9ICkgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Ly8gUGFyc2Ugbm9kZXMgaW4gRkJYVHJlZS5PYmplY3RzLlRleHR1cmVcblx0Ly8gVGhlc2UgY29udGFpbiBkZXRhaWxzIHN1Y2ggYXMgVVYgc2NhbGluZywgY3JvcHBpbmcsIHJvdGF0aW9uIGV0YyBhbmQgYXJlIGNvbm5lY3RlZFxuXHQvLyB0byBpbWFnZXMgaW4gRkJYVHJlZS5PYmplY3RzLlZpZGVvXG5cdHBhcnNlVGV4dHVyZXMoIGltYWdlcyApIHtcblxuXHRcdGNvbnN0IHRleHR1cmVNYXAgPSBuZXcgTWFwKCk7XG5cblx0XHRpZiAoICdUZXh0dXJlJyBpbiBmYnhUcmVlLk9iamVjdHMgKSB7XG5cblx0XHRcdGNvbnN0IHRleHR1cmVOb2RlcyA9IGZieFRyZWUuT2JqZWN0cy5UZXh0dXJlO1xuXHRcdFx0Zm9yICggY29uc3Qgbm9kZUlEIGluIHRleHR1cmVOb2RlcyApIHtcblxuXHRcdFx0XHRjb25zdCB0ZXh0dXJlID0gdGhpcy5wYXJzZVRleHR1cmUoIHRleHR1cmVOb2Rlc1sgbm9kZUlEIF0sIGltYWdlcyApO1xuXHRcdFx0XHR0ZXh0dXJlTWFwLnNldCggcGFyc2VJbnQoIG5vZGVJRCApLCB0ZXh0dXJlICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0dXJlTWFwO1xuXG5cdH1cblxuXHQvLyBQYXJzZSBpbmRpdmlkdWFsIG5vZGUgaW4gRkJYVHJlZS5PYmplY3RzLlRleHR1cmVcblx0cGFyc2VUZXh0dXJlKCB0ZXh0dXJlTm9kZSwgaW1hZ2VzICkge1xuXG5cdFx0Y29uc3QgdGV4dHVyZSA9IHRoaXMubG9hZFRleHR1cmUoIHRleHR1cmVOb2RlLCBpbWFnZXMgKTtcblxuXHRcdHRleHR1cmUuSUQgPSB0ZXh0dXJlTm9kZS5pZDtcblxuXHRcdHRleHR1cmUubmFtZSA9IHRleHR1cmVOb2RlLmF0dHJOYW1lO1xuXG5cdFx0Y29uc3Qgd3JhcE1vZGVVID0gdGV4dHVyZU5vZGUuV3JhcE1vZGVVO1xuXHRcdGNvbnN0IHdyYXBNb2RlViA9IHRleHR1cmVOb2RlLldyYXBNb2RlVjtcblxuXHRcdGNvbnN0IHZhbHVlVSA9IHdyYXBNb2RlVSAhPT0gdW5kZWZpbmVkID8gd3JhcE1vZGVVLnZhbHVlIDogMDtcblx0XHRjb25zdCB2YWx1ZVYgPSB3cmFwTW9kZVYgIT09IHVuZGVmaW5lZCA/IHdyYXBNb2RlVi52YWx1ZSA6IDA7XG5cblx0XHQvLyBodHRwOi8vZG93bmxvYWQuYXV0b2Rlc2suY29tL3VzL2ZieC9TREtkb2NzL0ZCWF9TREtfSGVscC9maWxlcy9mYnhzZGtyZWYvY2xhc3Nfa19mYnhfdGV4dHVyZS5odG1sIzg4OTY0MGU2M2UyZTY4MTI1OWVhODEwNjFiODUxNDNhXG5cdFx0Ly8gMDogcmVwZWF0KGRlZmF1bHQpLCAxOiBjbGFtcFxuXG5cdFx0dGV4dHVyZS53cmFwUyA9IHZhbHVlVSA9PT0gMCA/IFJlcGVhdFdyYXBwaW5nIDogQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0XHR0ZXh0dXJlLndyYXBUID0gdmFsdWVWID09PSAwID8gUmVwZWF0V3JhcHBpbmcgOiBDbGFtcFRvRWRnZVdyYXBwaW5nO1xuXG5cdFx0aWYgKCAnU2NhbGluZycgaW4gdGV4dHVyZU5vZGUgKSB7XG5cblx0XHRcdGNvbnN0IHZhbHVlcyA9IHRleHR1cmVOb2RlLlNjYWxpbmcudmFsdWU7XG5cblx0XHRcdHRleHR1cmUucmVwZWF0LnggPSB2YWx1ZXNbIDAgXTtcblx0XHRcdHRleHR1cmUucmVwZWF0LnkgPSB2YWx1ZXNbIDEgXTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0dXJlO1xuXG5cdH1cblxuXHQvLyBsb2FkIGEgdGV4dHVyZSBzcGVjaWZpZWQgYXMgYSBibG9iIG9yIGRhdGEgVVJJLCBvciB2aWEgYW4gZXh0ZXJuYWwgVVJMIHVzaW5nIFRleHR1cmVMb2FkZXJcblx0bG9hZFRleHR1cmUoIHRleHR1cmVOb2RlLCBpbWFnZXMgKSB7XG5cblx0XHRsZXQgZmlsZU5hbWU7XG5cblx0XHRjb25zdCBjdXJyZW50UGF0aCA9IHRoaXMudGV4dHVyZUxvYWRlci5wYXRoO1xuXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSBjb25uZWN0aW9ucy5nZXQoIHRleHR1cmVOb2RlLmlkICkuY2hpbGRyZW47XG5cblx0XHRpZiAoIGNoaWxkcmVuICE9PSB1bmRlZmluZWQgJiYgY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiBpbWFnZXNbIGNoaWxkcmVuWyAwIF0uSUQgXSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRmaWxlTmFtZSA9IGltYWdlc1sgY2hpbGRyZW5bIDAgXS5JRCBdO1xuXG5cdFx0XHRpZiAoIGZpbGVOYW1lLmluZGV4T2YoICdibG9iOicgKSA9PT0gMCB8fCBmaWxlTmFtZS5pbmRleE9mKCAnZGF0YTonICkgPT09IDAgKSB7XG5cblx0XHRcdFx0dGhpcy50ZXh0dXJlTG9hZGVyLnNldFBhdGgoIHVuZGVmaW5lZCApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRsZXQgdGV4dHVyZTtcblxuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IHRleHR1cmVOb2RlLkZpbGVOYW1lLnNsaWNlKCAtIDMgKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0aWYgKCBleHRlbnNpb24gPT09ICd0Z2EnICkge1xuXG5cdFx0XHRjb25zdCBsb2FkZXIgPSB0aGlzLm1hbmFnZXIuZ2V0SGFuZGxlciggJy50Z2EnICk7XG5cblx0XHRcdGlmICggbG9hZGVyID09PSBudWxsICkge1xuXG5cdFx0XHRcdGNvbnNvbGUud2FybiggJ0ZCWExvYWRlcjogVEdBIGxvYWRlciBub3QgZm91bmQsIGNyZWF0aW5nIHBsYWNlaG9sZGVyIHRleHR1cmUgZm9yJywgdGV4dHVyZU5vZGUuUmVsYXRpdmVGaWxlbmFtZSApO1xuXHRcdFx0XHR0ZXh0dXJlID0gbmV3IFRleHR1cmUoKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRsb2FkZXIuc2V0UGF0aCggdGhpcy50ZXh0dXJlTG9hZGVyLnBhdGggKTtcblx0XHRcdFx0dGV4dHVyZSA9IGxvYWRlci5sb2FkKCBmaWxlTmFtZSApO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYgKCBleHRlbnNpb24gPT09ICdwc2QnICkge1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdGQlhMb2FkZXI6IFBTRCB0ZXh0dXJlcyBhcmUgbm90IHN1cHBvcnRlZCwgY3JlYXRpbmcgcGxhY2Vob2xkZXIgdGV4dHVyZSBmb3InLCB0ZXh0dXJlTm9kZS5SZWxhdGl2ZUZpbGVuYW1lICk7XG5cdFx0XHR0ZXh0dXJlID0gbmV3IFRleHR1cmUoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRleHR1cmUgPSB0aGlzLnRleHR1cmVMb2FkZXIubG9hZCggZmlsZU5hbWUgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMudGV4dHVyZUxvYWRlci5zZXRQYXRoKCBjdXJyZW50UGF0aCApO1xuXG5cdFx0cmV0dXJuIHRleHR1cmU7XG5cblx0fVxuXG5cdC8vIFBhcnNlIG5vZGVzIGluIEZCWFRyZWUuT2JqZWN0cy5NYXRlcmlhbFxuXHRwYXJzZU1hdGVyaWFscyggdGV4dHVyZU1hcCApIHtcblxuXHRcdGNvbnN0IG1hdGVyaWFsTWFwID0gbmV3IE1hcCgpO1xuXG5cdFx0aWYgKCAnTWF0ZXJpYWwnIGluIGZieFRyZWUuT2JqZWN0cyApIHtcblxuXHRcdFx0Y29uc3QgbWF0ZXJpYWxOb2RlcyA9IGZieFRyZWUuT2JqZWN0cy5NYXRlcmlhbDtcblxuXHRcdFx0Zm9yICggY29uc3Qgbm9kZUlEIGluIG1hdGVyaWFsTm9kZXMgKSB7XG5cblx0XHRcdFx0Y29uc3QgbWF0ZXJpYWwgPSB0aGlzLnBhcnNlTWF0ZXJpYWwoIG1hdGVyaWFsTm9kZXNbIG5vZGVJRCBdLCB0ZXh0dXJlTWFwICk7XG5cblx0XHRcdFx0aWYgKCBtYXRlcmlhbCAhPT0gbnVsbCApIG1hdGVyaWFsTWFwLnNldCggcGFyc2VJbnQoIG5vZGVJRCApLCBtYXRlcmlhbCApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gbWF0ZXJpYWxNYXA7XG5cblx0fVxuXG5cdC8vIFBhcnNlIHNpbmdsZSBub2RlIGluIEZCWFRyZWUuT2JqZWN0cy5NYXRlcmlhbFxuXHQvLyBNYXRlcmlhbHMgYXJlIGNvbm5lY3RlZCB0byB0ZXh0dXJlIG1hcHMgaW4gRkJYVHJlZS5PYmplY3RzLlRleHR1cmVzXG5cdC8vIEZCWCBmb3JtYXQgY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgTGFtYmVydCBhbmQgUGhvbmcgc2hhZGluZyBtb2RlbHNcblx0cGFyc2VNYXRlcmlhbCggbWF0ZXJpYWxOb2RlLCB0ZXh0dXJlTWFwICkge1xuXG5cdFx0Y29uc3QgSUQgPSBtYXRlcmlhbE5vZGUuaWQ7XG5cdFx0Y29uc3QgbmFtZSA9IG1hdGVyaWFsTm9kZS5hdHRyTmFtZTtcblx0XHRsZXQgdHlwZSA9IG1hdGVyaWFsTm9kZS5TaGFkaW5nTW9kZWw7XG5cblx0XHQvLyBDYXNlIHdoZXJlIEZCWCB3cmFwcyBzaGFkaW5nIG1vZGVsIGluIHByb3BlcnR5IG9iamVjdC5cblx0XHRpZiAoIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyApIHtcblxuXHRcdFx0dHlwZSA9IHR5cGUudmFsdWU7XG5cblx0XHR9XG5cblx0XHQvLyBJZ25vcmUgdW51c2VkIG1hdGVyaWFscyB3aGljaCBkb24ndCBoYXZlIGFueSBjb25uZWN0aW9ucy5cblx0XHRpZiAoICEgY29ubmVjdGlvbnMuaGFzKCBJRCApICkgcmV0dXJuIG51bGw7XG5cblx0XHRjb25zdCBwYXJhbWV0ZXJzID0gdGhpcy5wYXJzZVBhcmFtZXRlcnMoIG1hdGVyaWFsTm9kZSwgdGV4dHVyZU1hcCwgSUQgKTtcblxuXHRcdGxldCBtYXRlcmlhbDtcblxuXHRcdHN3aXRjaCAoIHR5cGUudG9Mb3dlckNhc2UoKSApIHtcblxuXHRcdFx0Y2FzZSAncGhvbmcnOlxuXHRcdFx0XHRtYXRlcmlhbCA9IG5ldyBNZXNoUGhvbmdNYXRlcmlhbCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2xhbWJlcnQnOlxuXHRcdFx0XHRtYXRlcmlhbCA9IG5ldyBNZXNoTGFtYmVydE1hdGVyaWFsKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuRkJYTG9hZGVyOiB1bmtub3duIG1hdGVyaWFsIHR5cGUgXCIlc1wiLiBEZWZhdWx0aW5nIHRvIE1lc2hQaG9uZ01hdGVyaWFsLicsIHR5cGUgKTtcblx0XHRcdFx0bWF0ZXJpYWwgPSBuZXcgTWVzaFBob25nTWF0ZXJpYWwoKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHR9XG5cblx0XHRtYXRlcmlhbC5zZXRWYWx1ZXMoIHBhcmFtZXRlcnMgKTtcblx0XHRtYXRlcmlhbC5uYW1lID0gbmFtZTtcblxuXHRcdHJldHVybiBtYXRlcmlhbDtcblxuXHR9XG5cblx0Ly8gUGFyc2UgRkJYIG1hdGVyaWFsIGFuZCByZXR1cm4gcGFyYW1ldGVycyBzdWl0YWJsZSBmb3IgYSB0aHJlZS5qcyBtYXRlcmlhbFxuXHQvLyBBbHNvIHBhcnNlIHRoZSB0ZXh0dXJlIG1hcCBhbmQgcmV0dXJuIGFueSB0ZXh0dXJlcyBhc3NvY2lhdGVkIHdpdGggdGhlIG1hdGVyaWFsXG5cdHBhcnNlUGFyYW1ldGVycyggbWF0ZXJpYWxOb2RlLCB0ZXh0dXJlTWFwLCBJRCApIHtcblxuXHRcdGNvbnN0IHBhcmFtZXRlcnMgPSB7fTtcblxuXHRcdGlmICggbWF0ZXJpYWxOb2RlLkJ1bXBGYWN0b3IgKSB7XG5cblx0XHRcdHBhcmFtZXRlcnMuYnVtcFNjYWxlID0gbWF0ZXJpYWxOb2RlLkJ1bXBGYWN0b3IudmFsdWU7XG5cblx0XHR9XG5cblx0XHRpZiAoIG1hdGVyaWFsTm9kZS5EaWZmdXNlICkge1xuXG5cdFx0XHRwYXJhbWV0ZXJzLmNvbG9yID0gbmV3IENvbG9yKCkuZnJvbUFycmF5KCBtYXRlcmlhbE5vZGUuRGlmZnVzZS52YWx1ZSApO1xuXG5cdFx0fSBlbHNlIGlmICggbWF0ZXJpYWxOb2RlLkRpZmZ1c2VDb2xvciAmJiAoIG1hdGVyaWFsTm9kZS5EaWZmdXNlQ29sb3IudHlwZSA9PT0gJ0NvbG9yJyB8fCBtYXRlcmlhbE5vZGUuRGlmZnVzZUNvbG9yLnR5cGUgPT09ICdDb2xvclJHQicgKSApIHtcblxuXHRcdFx0Ly8gVGhlIGJsZW5kZXIgZXhwb3J0ZXIgZXhwb3J0cyBkaWZmdXNlIGhlcmUgaW5zdGVhZCBvZiBpbiBtYXRlcmlhbE5vZGUuRGlmZnVzZVxuXHRcdFx0cGFyYW1ldGVycy5jb2xvciA9IG5ldyBDb2xvcigpLmZyb21BcnJheSggbWF0ZXJpYWxOb2RlLkRpZmZ1c2VDb2xvci52YWx1ZSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBtYXRlcmlhbE5vZGUuRGlzcGxhY2VtZW50RmFjdG9yICkge1xuXG5cdFx0XHRwYXJhbWV0ZXJzLmRpc3BsYWNlbWVudFNjYWxlID0gbWF0ZXJpYWxOb2RlLkRpc3BsYWNlbWVudEZhY3Rvci52YWx1ZTtcblxuXHRcdH1cblxuXHRcdGlmICggbWF0ZXJpYWxOb2RlLkVtaXNzaXZlICkge1xuXG5cdFx0XHRwYXJhbWV0ZXJzLmVtaXNzaXZlID0gbmV3IENvbG9yKCkuZnJvbUFycmF5KCBtYXRlcmlhbE5vZGUuRW1pc3NpdmUudmFsdWUgKTtcblxuXHRcdH0gZWxzZSBpZiAoIG1hdGVyaWFsTm9kZS5FbWlzc2l2ZUNvbG9yICYmICggbWF0ZXJpYWxOb2RlLkVtaXNzaXZlQ29sb3IudHlwZSA9PT0gJ0NvbG9yJyB8fCBtYXRlcmlhbE5vZGUuRW1pc3NpdmVDb2xvci50eXBlID09PSAnQ29sb3JSR0InICkgKSB7XG5cblx0XHRcdC8vIFRoZSBibGVuZGVyIGV4cG9ydGVyIGV4cG9ydHMgZW1pc3NpdmUgY29sb3IgaGVyZSBpbnN0ZWFkIG9mIGluIG1hdGVyaWFsTm9kZS5FbWlzc2l2ZVxuXHRcdFx0cGFyYW1ldGVycy5lbWlzc2l2ZSA9IG5ldyBDb2xvcigpLmZyb21BcnJheSggbWF0ZXJpYWxOb2RlLkVtaXNzaXZlQ29sb3IudmFsdWUgKTtcblxuXHRcdH1cblxuXHRcdGlmICggbWF0ZXJpYWxOb2RlLkVtaXNzaXZlRmFjdG9yICkge1xuXG5cdFx0XHRwYXJhbWV0ZXJzLmVtaXNzaXZlSW50ZW5zaXR5ID0gcGFyc2VGbG9hdCggbWF0ZXJpYWxOb2RlLkVtaXNzaXZlRmFjdG9yLnZhbHVlICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIG1hdGVyaWFsTm9kZS5PcGFjaXR5ICkge1xuXG5cdFx0XHRwYXJhbWV0ZXJzLm9wYWNpdHkgPSBwYXJzZUZsb2F0KCBtYXRlcmlhbE5vZGUuT3BhY2l0eS52YWx1ZSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBwYXJhbWV0ZXJzLm9wYWNpdHkgPCAxLjAgKSB7XG5cblx0XHRcdHBhcmFtZXRlcnMudHJhbnNwYXJlbnQgPSB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBtYXRlcmlhbE5vZGUuUmVmbGVjdGlvbkZhY3RvciApIHtcblxuXHRcdFx0cGFyYW1ldGVycy5yZWZsZWN0aXZpdHkgPSBtYXRlcmlhbE5vZGUuUmVmbGVjdGlvbkZhY3Rvci52YWx1ZTtcblxuXHRcdH1cblxuXHRcdGlmICggbWF0ZXJpYWxOb2RlLlNoaW5pbmVzcyApIHtcblxuXHRcdFx0cGFyYW1ldGVycy5zaGluaW5lc3MgPSBtYXRlcmlhbE5vZGUuU2hpbmluZXNzLnZhbHVlO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBtYXRlcmlhbE5vZGUuU3BlY3VsYXIgKSB7XG5cblx0XHRcdHBhcmFtZXRlcnMuc3BlY3VsYXIgPSBuZXcgQ29sb3IoKS5mcm9tQXJyYXkoIG1hdGVyaWFsTm9kZS5TcGVjdWxhci52YWx1ZSApO1xuXG5cdFx0fSBlbHNlIGlmICggbWF0ZXJpYWxOb2RlLlNwZWN1bGFyQ29sb3IgJiYgbWF0ZXJpYWxOb2RlLlNwZWN1bGFyQ29sb3IudHlwZSA9PT0gJ0NvbG9yJyApIHtcblxuXHRcdFx0Ly8gVGhlIGJsZW5kZXIgZXhwb3J0ZXIgZXhwb3J0cyBzcGVjdWxhciBjb2xvciBoZXJlIGluc3RlYWQgb2YgaW4gbWF0ZXJpYWxOb2RlLlNwZWN1bGFyXG5cdFx0XHRwYXJhbWV0ZXJzLnNwZWN1bGFyID0gbmV3IENvbG9yKCkuZnJvbUFycmF5KCBtYXRlcmlhbE5vZGUuU3BlY3VsYXJDb2xvci52YWx1ZSApO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2NvcGUgPSB0aGlzO1xuXHRcdGNvbm5lY3Rpb25zLmdldCggSUQgKS5jaGlsZHJlbi5mb3JFYWNoKCBmdW5jdGlvbiAoIGNoaWxkICkge1xuXG5cdFx0XHRjb25zdCB0eXBlID0gY2hpbGQucmVsYXRpb25zaGlwO1xuXG5cdFx0XHRzd2l0Y2ggKCB0eXBlICkge1xuXG5cdFx0XHRcdGNhc2UgJ0J1bXAnOlxuXHRcdFx0XHRcdHBhcmFtZXRlcnMuYnVtcE1hcCA9IHNjb3BlLmdldFRleHR1cmUoIHRleHR1cmVNYXAsIGNoaWxkLklEICk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnTWF5YXxURVhfYW9fbWFwJzpcblx0XHRcdFx0XHRwYXJhbWV0ZXJzLmFvTWFwID0gc2NvcGUuZ2V0VGV4dHVyZSggdGV4dHVyZU1hcCwgY2hpbGQuSUQgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdEaWZmdXNlQ29sb3InOlxuXHRcdFx0XHRjYXNlICdNYXlhfFRFWF9jb2xvcl9tYXAnOlxuXHRcdFx0XHRcdHBhcmFtZXRlcnMubWFwID0gc2NvcGUuZ2V0VGV4dHVyZSggdGV4dHVyZU1hcCwgY2hpbGQuSUQgKTtcblx0XHRcdFx0XHRpZiAoIHBhcmFtZXRlcnMubWFwICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdHBhcmFtZXRlcnMubWFwLmVuY29kaW5nID0gc1JHQkVuY29kaW5nO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnRGlzcGxhY2VtZW50Q29sb3InOlxuXHRcdFx0XHRcdHBhcmFtZXRlcnMuZGlzcGxhY2VtZW50TWFwID0gc2NvcGUuZ2V0VGV4dHVyZSggdGV4dHVyZU1hcCwgY2hpbGQuSUQgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdFbWlzc2l2ZUNvbG9yJzpcblx0XHRcdFx0XHRwYXJhbWV0ZXJzLmVtaXNzaXZlTWFwID0gc2NvcGUuZ2V0VGV4dHVyZSggdGV4dHVyZU1hcCwgY2hpbGQuSUQgKTtcblx0XHRcdFx0XHRpZiAoIHBhcmFtZXRlcnMuZW1pc3NpdmVNYXAgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdFx0cGFyYW1ldGVycy5lbWlzc2l2ZU1hcC5lbmNvZGluZyA9IHNSR0JFbmNvZGluZztcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ05vcm1hbE1hcCc6XG5cdFx0XHRcdGNhc2UgJ01heWF8VEVYX25vcm1hbF9tYXAnOlxuXHRcdFx0XHRcdHBhcmFtZXRlcnMubm9ybWFsTWFwID0gc2NvcGUuZ2V0VGV4dHVyZSggdGV4dHVyZU1hcCwgY2hpbGQuSUQgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdSZWZsZWN0aW9uQ29sb3InOlxuXHRcdFx0XHRcdHBhcmFtZXRlcnMuZW52TWFwID0gc2NvcGUuZ2V0VGV4dHVyZSggdGV4dHVyZU1hcCwgY2hpbGQuSUQgKTtcblx0XHRcdFx0XHRpZiAoIHBhcmFtZXRlcnMuZW52TWFwICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuZW52TWFwLm1hcHBpbmcgPSBFcXVpcmVjdGFuZ3VsYXJSZWZsZWN0aW9uTWFwcGluZztcblx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuZW52TWFwLmVuY29kaW5nID0gc1JHQkVuY29kaW5nO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnU3BlY3VsYXJDb2xvcic6XG5cdFx0XHRcdFx0cGFyYW1ldGVycy5zcGVjdWxhck1hcCA9IHNjb3BlLmdldFRleHR1cmUoIHRleHR1cmVNYXAsIGNoaWxkLklEICk7XG5cdFx0XHRcdFx0aWYgKCBwYXJhbWV0ZXJzLnNwZWN1bGFyTWFwICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuc3BlY3VsYXJNYXAuZW5jb2RpbmcgPSBzUkdCRW5jb2Rpbmc7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdUcmFuc3BhcmVudENvbG9yJzpcblx0XHRcdFx0Y2FzZSAnVHJhbnNwYXJlbmN5RmFjdG9yJzpcblx0XHRcdFx0XHRwYXJhbWV0ZXJzLmFscGhhTWFwID0gc2NvcGUuZ2V0VGV4dHVyZSggdGV4dHVyZU1hcCwgY2hpbGQuSUQgKTtcblx0XHRcdFx0XHRwYXJhbWV0ZXJzLnRyYW5zcGFyZW50ID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdBbWJpZW50Q29sb3InOlxuXHRcdFx0XHRjYXNlICdTaGluaW5lc3NFeHBvbmVudCc6IC8vIEFLQSBnbG9zc2luZXNzIG1hcFxuXHRcdFx0XHRjYXNlICdTcGVjdWxhckZhY3Rvcic6IC8vIEFLQSBzcGVjdWxhckxldmVsXG5cdFx0XHRcdGNhc2UgJ1ZlY3RvckRpc3BsYWNlbWVudENvbG9yJzogLy8gTk9URTogU2VlbXMgdG8gYmUgYSBjb3B5IG9mIERpc3BsYWNlbWVudENvbG9yXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuRkJYTG9hZGVyOiAlcyBtYXAgaXMgbm90IHN1cHBvcnRlZCBpbiB0aHJlZS5qcywgc2tpcHBpbmcgdGV4dHVyZS4nLCB0eXBlICk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdH1cblxuXHRcdH0gKTtcblxuXHRcdHJldHVybiBwYXJhbWV0ZXJzO1xuXG5cdH1cblxuXHQvLyBnZXQgYSB0ZXh0dXJlIGZyb20gdGhlIHRleHR1cmVNYXAgZm9yIHVzZSBieSBhIG1hdGVyaWFsLlxuXHRnZXRUZXh0dXJlKCB0ZXh0dXJlTWFwLCBpZCApIHtcblxuXHRcdC8vIGlmIHRoZSB0ZXh0dXJlIGlzIGEgbGF5ZXJlZCB0ZXh0dXJlLCBqdXN0IHVzZSB0aGUgZmlyc3QgbGF5ZXIgYW5kIGlzc3VlIGEgd2FybmluZ1xuXHRcdGlmICggJ0xheWVyZWRUZXh0dXJlJyBpbiBmYnhUcmVlLk9iamVjdHMgJiYgaWQgaW4gZmJ4VHJlZS5PYmplY3RzLkxheWVyZWRUZXh0dXJlICkge1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5GQlhMb2FkZXI6IGxheWVyZWQgdGV4dHVyZXMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gdGhyZWUuanMuIERpc2NhcmRpbmcgYWxsIGJ1dCBmaXJzdCBsYXllci4nICk7XG5cdFx0XHRpZCA9IGNvbm5lY3Rpb25zLmdldCggaWQgKS5jaGlsZHJlblsgMCBdLklEO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRleHR1cmVNYXAuZ2V0KCBpZCApO1xuXG5cdH1cblxuXHQvLyBQYXJzZSBub2RlcyBpbiBGQlhUcmVlLk9iamVjdHMuRGVmb3JtZXJcblx0Ly8gRGVmb3JtZXIgbm9kZSBjYW4gY29udGFpbiBza2lubmluZyBvciBWZXJ0ZXggQ2FjaGUgYW5pbWF0aW9uIGRhdGEsIGhvd2V2ZXIgb25seSBza2lubmluZyBpcyBzdXBwb3J0ZWQgaGVyZVxuXHQvLyBHZW5lcmF0ZXMgbWFwIG9mIFNrZWxldG9uLWxpa2Ugb2JqZWN0cyBmb3IgdXNlIGxhdGVyIHdoZW4gZ2VuZXJhdGluZyBhbmQgYmluZGluZyBza2VsZXRvbnMuXG5cdHBhcnNlRGVmb3JtZXJzKCkge1xuXG5cdFx0Y29uc3Qgc2tlbGV0b25zID0ge307XG5cdFx0Y29uc3QgbW9ycGhUYXJnZXRzID0ge307XG5cblx0XHRpZiAoICdEZWZvcm1lcicgaW4gZmJ4VHJlZS5PYmplY3RzICkge1xuXG5cdFx0XHRjb25zdCBEZWZvcm1lck5vZGVzID0gZmJ4VHJlZS5PYmplY3RzLkRlZm9ybWVyO1xuXG5cdFx0XHRmb3IgKCBjb25zdCBub2RlSUQgaW4gRGVmb3JtZXJOb2RlcyApIHtcblxuXHRcdFx0XHRjb25zdCBkZWZvcm1lck5vZGUgPSBEZWZvcm1lck5vZGVzWyBub2RlSUQgXTtcblxuXHRcdFx0XHRjb25zdCByZWxhdGlvbnNoaXBzID0gY29ubmVjdGlvbnMuZ2V0KCBwYXJzZUludCggbm9kZUlEICkgKTtcblxuXHRcdFx0XHRpZiAoIGRlZm9ybWVyTm9kZS5hdHRyVHlwZSA9PT0gJ1NraW4nICkge1xuXG5cdFx0XHRcdFx0Y29uc3Qgc2tlbGV0b24gPSB0aGlzLnBhcnNlU2tlbGV0b24oIHJlbGF0aW9uc2hpcHMsIERlZm9ybWVyTm9kZXMgKTtcblx0XHRcdFx0XHRza2VsZXRvbi5JRCA9IG5vZGVJRDtcblxuXHRcdFx0XHRcdGlmICggcmVsYXRpb25zaGlwcy5wYXJlbnRzLmxlbmd0aCA+IDEgKSBjb25zb2xlLndhcm4oICdUSFJFRS5GQlhMb2FkZXI6IHNrZWxldG9uIGF0dGFjaGVkIHRvIG1vcmUgdGhhbiBvbmUgZ2VvbWV0cnkgaXMgbm90IHN1cHBvcnRlZC4nICk7XG5cdFx0XHRcdFx0c2tlbGV0b24uZ2VvbWV0cnlJRCA9IHJlbGF0aW9uc2hpcHMucGFyZW50c1sgMCBdLklEO1xuXG5cdFx0XHRcdFx0c2tlbGV0b25zWyBub2RlSUQgXSA9IHNrZWxldG9uO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGRlZm9ybWVyTm9kZS5hdHRyVHlwZSA9PT0gJ0JsZW5kU2hhcGUnICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgbW9ycGhUYXJnZXQgPSB7XG5cdFx0XHRcdFx0XHRpZDogbm9kZUlELFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtb3JwaFRhcmdldC5yYXdUYXJnZXRzID0gdGhpcy5wYXJzZU1vcnBoVGFyZ2V0cyggcmVsYXRpb25zaGlwcywgRGVmb3JtZXJOb2RlcyApO1xuXHRcdFx0XHRcdG1vcnBoVGFyZ2V0LmlkID0gbm9kZUlEO1xuXG5cdFx0XHRcdFx0aWYgKCByZWxhdGlvbnNoaXBzLnBhcmVudHMubGVuZ3RoID4gMSApIGNvbnNvbGUud2FybiggJ1RIUkVFLkZCWExvYWRlcjogbW9ycGggdGFyZ2V0IGF0dGFjaGVkIHRvIG1vcmUgdGhhbiBvbmUgZ2VvbWV0cnkgaXMgbm90IHN1cHBvcnRlZC4nICk7XG5cblx0XHRcdFx0XHRtb3JwaFRhcmdldHNbIG5vZGVJRCBdID0gbW9ycGhUYXJnZXQ7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXG5cdFx0XHRza2VsZXRvbnM6IHNrZWxldG9ucyxcblx0XHRcdG1vcnBoVGFyZ2V0czogbW9ycGhUYXJnZXRzLFxuXG5cdFx0fTtcblxuXHR9XG5cblx0Ly8gUGFyc2Ugc2luZ2xlIG5vZGVzIGluIEZCWFRyZWUuT2JqZWN0cy5EZWZvcm1lclxuXHQvLyBUaGUgdG9wIGxldmVsIHNrZWxldG9uIG5vZGUgaGFzIHR5cGUgJ1NraW4nIGFuZCBzdWIgbm9kZXMgaGF2ZSB0eXBlICdDbHVzdGVyJ1xuXHQvLyBFYWNoIHNraW4gbm9kZSByZXByZXNlbnRzIGEgc2tlbGV0b24gYW5kIGVhY2ggY2x1c3RlciBub2RlIHJlcHJlc2VudHMgYSBib25lXG5cdHBhcnNlU2tlbGV0b24oIHJlbGF0aW9uc2hpcHMsIGRlZm9ybWVyTm9kZXMgKSB7XG5cblx0XHRjb25zdCByYXdCb25lcyA9IFtdO1xuXG5cdFx0cmVsYXRpb25zaGlwcy5jaGlsZHJlbi5mb3JFYWNoKCBmdW5jdGlvbiAoIGNoaWxkICkge1xuXG5cdFx0XHRjb25zdCBib25lTm9kZSA9IGRlZm9ybWVyTm9kZXNbIGNoaWxkLklEIF07XG5cblx0XHRcdGlmICggYm9uZU5vZGUuYXR0clR5cGUgIT09ICdDbHVzdGVyJyApIHJldHVybjtcblxuXHRcdFx0Y29uc3QgcmF3Qm9uZSA9IHtcblxuXHRcdFx0XHRJRDogY2hpbGQuSUQsXG5cdFx0XHRcdGluZGljZXM6IFtdLFxuXHRcdFx0XHR3ZWlnaHRzOiBbXSxcblx0XHRcdFx0dHJhbnNmb3JtTGluazogbmV3IE1hdHJpeDQoKS5mcm9tQXJyYXkoIGJvbmVOb2RlLlRyYW5zZm9ybUxpbmsuYSApLFxuXHRcdFx0XHQvLyB0cmFuc2Zvcm06IG5ldyBNYXRyaXg0KCkuZnJvbUFycmF5KCBib25lTm9kZS5UcmFuc2Zvcm0uYSApLFxuXHRcdFx0XHQvLyBsaW5rTW9kZTogYm9uZU5vZGUuTW9kZSxcblxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCAnSW5kZXhlcycgaW4gYm9uZU5vZGUgKSB7XG5cblx0XHRcdFx0cmF3Qm9uZS5pbmRpY2VzID0gYm9uZU5vZGUuSW5kZXhlcy5hO1xuXHRcdFx0XHRyYXdCb25lLndlaWdodHMgPSBib25lTm9kZS5XZWlnaHRzLmE7XG5cblx0XHRcdH1cblxuXHRcdFx0cmF3Qm9uZXMucHVzaCggcmF3Qm9uZSApO1xuXG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIHtcblxuXHRcdFx0cmF3Qm9uZXM6IHJhd0JvbmVzLFxuXHRcdFx0Ym9uZXM6IFtdXG5cblx0XHR9O1xuXG5cdH1cblxuXHQvLyBUaGUgdG9wIGxldmVsIG1vcnBoIGRlZm9ybWVyIG5vZGUgaGFzIHR5cGUgXCJCbGVuZFNoYXBlXCIgYW5kIHN1YiBub2RlcyBoYXZlIHR5cGUgXCJCbGVuZFNoYXBlQ2hhbm5lbFwiXG5cdHBhcnNlTW9ycGhUYXJnZXRzKCByZWxhdGlvbnNoaXBzLCBkZWZvcm1lck5vZGVzICkge1xuXG5cdFx0Y29uc3QgcmF3TW9ycGhUYXJnZXRzID0gW107XG5cblx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCByZWxhdGlvbnNoaXBzLmNoaWxkcmVuLmxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0Y29uc3QgY2hpbGQgPSByZWxhdGlvbnNoaXBzLmNoaWxkcmVuWyBpIF07XG5cblx0XHRcdGNvbnN0IG1vcnBoVGFyZ2V0Tm9kZSA9IGRlZm9ybWVyTm9kZXNbIGNoaWxkLklEIF07XG5cblx0XHRcdGNvbnN0IHJhd01vcnBoVGFyZ2V0ID0ge1xuXG5cdFx0XHRcdG5hbWU6IG1vcnBoVGFyZ2V0Tm9kZS5hdHRyTmFtZSxcblx0XHRcdFx0aW5pdGlhbFdlaWdodDogbW9ycGhUYXJnZXROb2RlLkRlZm9ybVBlcmNlbnQsXG5cdFx0XHRcdGlkOiBtb3JwaFRhcmdldE5vZGUuaWQsXG5cdFx0XHRcdGZ1bGxXZWlnaHRzOiBtb3JwaFRhcmdldE5vZGUuRnVsbFdlaWdodHMuYVxuXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoIG1vcnBoVGFyZ2V0Tm9kZS5hdHRyVHlwZSAhPT0gJ0JsZW5kU2hhcGVDaGFubmVsJyApIHJldHVybjtcblxuXHRcdFx0cmF3TW9ycGhUYXJnZXQuZ2VvSUQgPSBjb25uZWN0aW9ucy5nZXQoIHBhcnNlSW50KCBjaGlsZC5JRCApICkuY2hpbGRyZW4uZmlsdGVyKCBmdW5jdGlvbiAoIGNoaWxkICkge1xuXG5cdFx0XHRcdHJldHVybiBjaGlsZC5yZWxhdGlvbnNoaXAgPT09IHVuZGVmaW5lZDtcblxuXHRcdFx0fSApWyAwIF0uSUQ7XG5cblx0XHRcdHJhd01vcnBoVGFyZ2V0cy5wdXNoKCByYXdNb3JwaFRhcmdldCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJhd01vcnBoVGFyZ2V0cztcblxuXHR9XG5cblx0Ly8gY3JlYXRlIHRoZSBtYWluIEdyb3VwKCkgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIGxvYWRlclxuXHRwYXJzZVNjZW5lKCBkZWZvcm1lcnMsIGdlb21ldHJ5TWFwLCBtYXRlcmlhbE1hcCApIHtcblxuXHRcdHNjZW5lR3JhcGggPSBuZXcgR3JvdXAoKTtcblxuXHRcdGNvbnN0IG1vZGVsTWFwID0gdGhpcy5wYXJzZU1vZGVscyggZGVmb3JtZXJzLnNrZWxldG9ucywgZ2VvbWV0cnlNYXAsIG1hdGVyaWFsTWFwICk7XG5cblx0XHRjb25zdCBtb2RlbE5vZGVzID0gZmJ4VHJlZS5PYmplY3RzLk1vZGVsO1xuXG5cdFx0Y29uc3Qgc2NvcGUgPSB0aGlzO1xuXHRcdG1vZGVsTWFwLmZvckVhY2goIGZ1bmN0aW9uICggbW9kZWwgKSB7XG5cblx0XHRcdGNvbnN0IG1vZGVsTm9kZSA9IG1vZGVsTm9kZXNbIG1vZGVsLklEIF07XG5cdFx0XHRzY29wZS5zZXRMb29rQXRQcm9wZXJ0aWVzKCBtb2RlbCwgbW9kZWxOb2RlICk7XG5cblx0XHRcdGNvbnN0IHBhcmVudENvbm5lY3Rpb25zID0gY29ubmVjdGlvbnMuZ2V0KCBtb2RlbC5JRCApLnBhcmVudHM7XG5cblx0XHRcdHBhcmVudENvbm5lY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uICggY29ubmVjdGlvbiApIHtcblxuXHRcdFx0XHRjb25zdCBwYXJlbnQgPSBtb2RlbE1hcC5nZXQoIGNvbm5lY3Rpb24uSUQgKTtcblx0XHRcdFx0aWYgKCBwYXJlbnQgIT09IHVuZGVmaW5lZCApIHBhcmVudC5hZGQoIG1vZGVsICk7XG5cblx0XHRcdH0gKTtcblxuXHRcdFx0aWYgKCBtb2RlbC5wYXJlbnQgPT09IG51bGwgKSB7XG5cblx0XHRcdFx0c2NlbmVHcmFwaC5hZGQoIG1vZGVsICk7XG5cblx0XHRcdH1cblxuXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5iaW5kU2tlbGV0b24oIGRlZm9ybWVycy5za2VsZXRvbnMsIGdlb21ldHJ5TWFwLCBtb2RlbE1hcCApO1xuXG5cdFx0dGhpcy5jcmVhdGVBbWJpZW50TGlnaHQoKTtcblxuXHRcdHNjZW5lR3JhcGgudHJhdmVyc2UoIGZ1bmN0aW9uICggbm9kZSApIHtcblxuXHRcdFx0aWYgKCBub2RlLnVzZXJEYXRhLnRyYW5zZm9ybURhdGEgKSB7XG5cblx0XHRcdFx0aWYgKCBub2RlLnBhcmVudCApIHtcblxuXHRcdFx0XHRcdG5vZGUudXNlckRhdGEudHJhbnNmb3JtRGF0YS5wYXJlbnRNYXRyaXggPSBub2RlLnBhcmVudC5tYXRyaXg7XG5cdFx0XHRcdFx0bm9kZS51c2VyRGF0YS50cmFuc2Zvcm1EYXRhLnBhcmVudE1hdHJpeFdvcmxkID0gbm9kZS5wYXJlbnQubWF0cml4V29ybGQ7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHRyYW5zZm9ybSA9IGdlbmVyYXRlVHJhbnNmb3JtKCBub2RlLnVzZXJEYXRhLnRyYW5zZm9ybURhdGEgKTtcblxuXHRcdFx0XHRub2RlLmFwcGx5TWF0cml4NCggdHJhbnNmb3JtICk7XG5cdFx0XHRcdG5vZGUudXBkYXRlV29ybGRNYXRyaXgoKTtcblxuXHRcdFx0fVxuXG5cdFx0fSApO1xuXG5cdFx0Y29uc3QgYW5pbWF0aW9ucyA9IG5ldyBBbmltYXRpb25QYXJzZXIoKS5wYXJzZSgpO1xuXG5cdFx0Ly8gaWYgYWxsIHRoZSBtb2RlbHMgd2hlcmUgYWxyZWFkeSBjb21iaW5lZCBpbiBhIHNpbmdsZSBncm91cCwganVzdCByZXR1cm4gdGhhdFxuXHRcdGlmICggc2NlbmVHcmFwaC5jaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgc2NlbmVHcmFwaC5jaGlsZHJlblsgMCBdLmlzR3JvdXAgKSB7XG5cblx0XHRcdHNjZW5lR3JhcGguY2hpbGRyZW5bIDAgXS5hbmltYXRpb25zID0gYW5pbWF0aW9ucztcblx0XHRcdHNjZW5lR3JhcGggPSBzY2VuZUdyYXBoLmNoaWxkcmVuWyAwIF07XG5cblx0XHR9XG5cblx0XHRzY2VuZUdyYXBoLmFuaW1hdGlvbnMgPSBhbmltYXRpb25zO1xuXG5cdH1cblxuXHQvLyBwYXJzZSBub2RlcyBpbiBGQlhUcmVlLk9iamVjdHMuTW9kZWxcblx0cGFyc2VNb2RlbHMoIHNrZWxldG9ucywgZ2VvbWV0cnlNYXAsIG1hdGVyaWFsTWFwICkge1xuXG5cdFx0Y29uc3QgbW9kZWxNYXAgPSBuZXcgTWFwKCk7XG5cdFx0Y29uc3QgbW9kZWxOb2RlcyA9IGZieFRyZWUuT2JqZWN0cy5Nb2RlbDtcblxuXHRcdGZvciAoIGNvbnN0IG5vZGVJRCBpbiBtb2RlbE5vZGVzICkge1xuXG5cdFx0XHRjb25zdCBpZCA9IHBhcnNlSW50KCBub2RlSUQgKTtcblx0XHRcdGNvbnN0IG5vZGUgPSBtb2RlbE5vZGVzWyBub2RlSUQgXTtcblx0XHRcdGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBjb25uZWN0aW9ucy5nZXQoIGlkICk7XG5cblx0XHRcdGxldCBtb2RlbCA9IHRoaXMuYnVpbGRTa2VsZXRvbiggcmVsYXRpb25zaGlwcywgc2tlbGV0b25zLCBpZCwgbm9kZS5hdHRyTmFtZSApO1xuXG5cdFx0XHRpZiAoICEgbW9kZWwgKSB7XG5cblx0XHRcdFx0c3dpdGNoICggbm9kZS5hdHRyVHlwZSApIHtcblxuXHRcdFx0XHRcdGNhc2UgJ0NhbWVyYSc6XG5cdFx0XHRcdFx0XHRtb2RlbCA9IHRoaXMuY3JlYXRlQ2FtZXJhKCByZWxhdGlvbnNoaXBzICk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdMaWdodCc6XG5cdFx0XHRcdFx0XHRtb2RlbCA9IHRoaXMuY3JlYXRlTGlnaHQoIHJlbGF0aW9uc2hpcHMgKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ01lc2gnOlxuXHRcdFx0XHRcdFx0bW9kZWwgPSB0aGlzLmNyZWF0ZU1lc2goIHJlbGF0aW9uc2hpcHMsIGdlb21ldHJ5TWFwLCBtYXRlcmlhbE1hcCApO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAnTnVyYnNDdXJ2ZSc6XG5cdFx0XHRcdFx0XHRtb2RlbCA9IHRoaXMuY3JlYXRlQ3VydmUoIHJlbGF0aW9uc2hpcHMsIGdlb21ldHJ5TWFwICk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdMaW1iTm9kZSc6XG5cdFx0XHRcdFx0Y2FzZSAnUm9vdCc6XG5cdFx0XHRcdFx0XHRtb2RlbCA9IG5ldyBCb25lKCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdOdWxsJzpcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0bW9kZWwgPSBuZXcgR3JvdXAoKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtb2RlbC5uYW1lID0gbm9kZS5hdHRyTmFtZSA/IFByb3BlcnR5QmluZGluZy5zYW5pdGl6ZU5vZGVOYW1lKCBub2RlLmF0dHJOYW1lICkgOiAnJztcblxuXHRcdFx0XHRtb2RlbC5JRCA9IGlkO1xuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZ2V0VHJhbnNmb3JtRGF0YSggbW9kZWwsIG5vZGUgKTtcblx0XHRcdG1vZGVsTWFwLnNldCggaWQsIG1vZGVsICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gbW9kZWxNYXA7XG5cblx0fVxuXG5cdGJ1aWxkU2tlbGV0b24oIHJlbGF0aW9uc2hpcHMsIHNrZWxldG9ucywgaWQsIG5hbWUgKSB7XG5cblx0XHRsZXQgYm9uZSA9IG51bGw7XG5cblx0XHRyZWxhdGlvbnNoaXBzLnBhcmVudHMuZm9yRWFjaCggZnVuY3Rpb24gKCBwYXJlbnQgKSB7XG5cblx0XHRcdGZvciAoIGNvbnN0IElEIGluIHNrZWxldG9ucyApIHtcblxuXHRcdFx0XHRjb25zdCBza2VsZXRvbiA9IHNrZWxldG9uc1sgSUQgXTtcblxuXHRcdFx0XHRza2VsZXRvbi5yYXdCb25lcy5mb3JFYWNoKCBmdW5jdGlvbiAoIHJhd0JvbmUsIGkgKSB7XG5cblx0XHRcdFx0XHRpZiAoIHJhd0JvbmUuSUQgPT09IHBhcmVudC5JRCApIHtcblxuXHRcdFx0XHRcdFx0Y29uc3Qgc3ViQm9uZSA9IGJvbmU7XG5cdFx0XHRcdFx0XHRib25lID0gbmV3IEJvbmUoKTtcblxuXHRcdFx0XHRcdFx0Ym9uZS5tYXRyaXhXb3JsZC5jb3B5KCByYXdCb25lLnRyYW5zZm9ybUxpbmsgKTtcblxuXHRcdFx0XHRcdFx0Ly8gc2V0IG5hbWUgYW5kIGlkIGhlcmUgLSBvdGhlcndpc2UgaW4gY2FzZXMgd2hlcmUgXCJzdWJCb25lXCIgaXMgY3JlYXRlZCBpdCB3aWxsIG5vdCBoYXZlIGEgbmFtZSAvIGlkXG5cblx0XHRcdFx0XHRcdGJvbmUubmFtZSA9IG5hbWUgPyBQcm9wZXJ0eUJpbmRpbmcuc2FuaXRpemVOb2RlTmFtZSggbmFtZSApIDogJyc7XG5cdFx0XHRcdFx0XHRib25lLklEID0gaWQ7XG5cblx0XHRcdFx0XHRcdHNrZWxldG9uLmJvbmVzWyBpIF0gPSBib25lO1xuXG5cdFx0XHRcdFx0XHQvLyBJbiBjYXNlcyB3aGVyZSBhIGJvbmUgaXMgc2hhcmVkIGJldHdlZW4gbXVsdGlwbGUgbWVzaGVzXG5cdFx0XHRcdFx0XHQvLyBkdXBsaWNhdGUgdGhlIGJvbmUgaGVyZSBhbmQgYW5kIGl0IGFzIGEgY2hpbGQgb2YgdGhlIGZpcnN0IGJvbmVcblx0XHRcdFx0XHRcdGlmICggc3ViQm9uZSAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRcdFx0XHRib25lLmFkZCggc3ViQm9uZSApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSApO1xuXG5cdFx0XHR9XG5cblx0XHR9ICk7XG5cblx0XHRyZXR1cm4gYm9uZTtcblxuXHR9XG5cblx0Ly8gY3JlYXRlIGEgUGVyc3BlY3RpdmVDYW1lcmEgb3IgT3J0aG9ncmFwaGljQ2FtZXJhXG5cdGNyZWF0ZUNhbWVyYSggcmVsYXRpb25zaGlwcyApIHtcblxuXHRcdGxldCBtb2RlbDtcblx0XHRsZXQgY2FtZXJhQXR0cmlidXRlO1xuXG5cdFx0cmVsYXRpb25zaGlwcy5jaGlsZHJlbi5mb3JFYWNoKCBmdW5jdGlvbiAoIGNoaWxkICkge1xuXG5cdFx0XHRjb25zdCBhdHRyID0gZmJ4VHJlZS5PYmplY3RzLk5vZGVBdHRyaWJ1dGVbIGNoaWxkLklEIF07XG5cblx0XHRcdGlmICggYXR0ciAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdGNhbWVyYUF0dHJpYnV0ZSA9IGF0dHI7XG5cblx0XHRcdH1cblxuXHRcdH0gKTtcblxuXHRcdGlmICggY2FtZXJhQXR0cmlidXRlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdG1vZGVsID0gbmV3IE9iamVjdDNEKCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRsZXQgdHlwZSA9IDA7XG5cdFx0XHRpZiAoIGNhbWVyYUF0dHJpYnV0ZS5DYW1lcmFQcm9qZWN0aW9uVHlwZSAhPT0gdW5kZWZpbmVkICYmIGNhbWVyYUF0dHJpYnV0ZS5DYW1lcmFQcm9qZWN0aW9uVHlwZS52YWx1ZSA9PT0gMSApIHtcblxuXHRcdFx0XHR0eXBlID0gMTtcblxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgbmVhckNsaXBwaW5nUGxhbmUgPSAxO1xuXHRcdFx0aWYgKCBjYW1lcmFBdHRyaWJ1dGUuTmVhclBsYW5lICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0bmVhckNsaXBwaW5nUGxhbmUgPSBjYW1lcmFBdHRyaWJ1dGUuTmVhclBsYW5lLnZhbHVlIC8gMTAwMDtcblxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgZmFyQ2xpcHBpbmdQbGFuZSA9IDEwMDA7XG5cdFx0XHRpZiAoIGNhbWVyYUF0dHJpYnV0ZS5GYXJQbGFuZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdGZhckNsaXBwaW5nUGxhbmUgPSBjYW1lcmFBdHRyaWJ1dGUuRmFyUGxhbmUudmFsdWUgLyAxMDAwO1xuXG5cdFx0XHR9XG5cblxuXHRcdFx0bGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0XHRsZXQgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5cdFx0XHRpZiAoIGNhbWVyYUF0dHJpYnV0ZS5Bc3BlY3RXaWR0aCAhPT0gdW5kZWZpbmVkICYmIGNhbWVyYUF0dHJpYnV0ZS5Bc3BlY3RIZWlnaHQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHR3aWR0aCA9IGNhbWVyYUF0dHJpYnV0ZS5Bc3BlY3RXaWR0aC52YWx1ZTtcblx0XHRcdFx0aGVpZ2h0ID0gY2FtZXJhQXR0cmlidXRlLkFzcGVjdEhlaWdodC52YWx1ZTtcblxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBhc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcblxuXHRcdFx0bGV0IGZvdiA9IDQ1O1xuXHRcdFx0aWYgKCBjYW1lcmFBdHRyaWJ1dGUuRmllbGRPZlZpZXcgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRmb3YgPSBjYW1lcmFBdHRyaWJ1dGUuRmllbGRPZlZpZXcudmFsdWU7XG5cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZm9jYWxMZW5ndGggPSBjYW1lcmFBdHRyaWJ1dGUuRm9jYWxMZW5ndGggPyBjYW1lcmFBdHRyaWJ1dGUuRm9jYWxMZW5ndGgudmFsdWUgOiBudWxsO1xuXG5cdFx0XHRzd2l0Y2ggKCB0eXBlICkge1xuXG5cdFx0XHRcdGNhc2UgMDogLy8gUGVyc3BlY3RpdmVcblx0XHRcdFx0XHRtb2RlbCA9IG5ldyBQZXJzcGVjdGl2ZUNhbWVyYSggZm92LCBhc3BlY3QsIG5lYXJDbGlwcGluZ1BsYW5lLCBmYXJDbGlwcGluZ1BsYW5lICk7XG5cdFx0XHRcdFx0aWYgKCBmb2NhbExlbmd0aCAhPT0gbnVsbCApIG1vZGVsLnNldEZvY2FsTGVuZ3RoKCBmb2NhbExlbmd0aCApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgMTogLy8gT3J0aG9ncmFwaGljXG5cdFx0XHRcdFx0bW9kZWwgPSBuZXcgT3J0aG9ncmFwaGljQ2FtZXJhKCAtIHdpZHRoIC8gMiwgd2lkdGggLyAyLCBoZWlnaHQgLyAyLCAtIGhlaWdodCAvIDIsIG5lYXJDbGlwcGluZ1BsYW5lLCBmYXJDbGlwcGluZ1BsYW5lICk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5GQlhMb2FkZXI6IFVua25vd24gY2FtZXJhIHR5cGUgJyArIHR5cGUgKyAnLicgKTtcblx0XHRcdFx0XHRtb2RlbCA9IG5ldyBPYmplY3QzRCgpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gbW9kZWw7XG5cblx0fVxuXG5cdC8vIENyZWF0ZSBhIERpcmVjdGlvbmFsTGlnaHQsIFBvaW50TGlnaHQgb3IgU3BvdExpZ2h0XG5cdGNyZWF0ZUxpZ2h0KCByZWxhdGlvbnNoaXBzICkge1xuXG5cdFx0bGV0IG1vZGVsO1xuXHRcdGxldCBsaWdodEF0dHJpYnV0ZTtcblxuXHRcdHJlbGF0aW9uc2hpcHMuY2hpbGRyZW4uZm9yRWFjaCggZnVuY3Rpb24gKCBjaGlsZCApIHtcblxuXHRcdFx0Y29uc3QgYXR0ciA9IGZieFRyZWUuT2JqZWN0cy5Ob2RlQXR0cmlidXRlWyBjaGlsZC5JRCBdO1xuXG5cdFx0XHRpZiAoIGF0dHIgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRsaWdodEF0dHJpYnV0ZSA9IGF0dHI7XG5cblx0XHRcdH1cblxuXHRcdH0gKTtcblxuXHRcdGlmICggbGlnaHRBdHRyaWJ1dGUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0bW9kZWwgPSBuZXcgT2JqZWN0M0QoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGxldCB0eXBlO1xuXG5cdFx0XHQvLyBMaWdodFR5cGUgY2FuIGJlIHVuZGVmaW5lZCBmb3IgUG9pbnQgbGlnaHRzXG5cdFx0XHRpZiAoIGxpZ2h0QXR0cmlidXRlLkxpZ2h0VHlwZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdHR5cGUgPSAwO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHR5cGUgPSBsaWdodEF0dHJpYnV0ZS5MaWdodFR5cGUudmFsdWU7XG5cblx0XHRcdH1cblxuXHRcdFx0bGV0IGNvbG9yID0gMHhmZmZmZmY7XG5cblx0XHRcdGlmICggbGlnaHRBdHRyaWJ1dGUuQ29sb3IgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRjb2xvciA9IG5ldyBDb2xvcigpLmZyb21BcnJheSggbGlnaHRBdHRyaWJ1dGUuQ29sb3IudmFsdWUgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaW50ZW5zaXR5ID0gKCBsaWdodEF0dHJpYnV0ZS5JbnRlbnNpdHkgPT09IHVuZGVmaW5lZCApID8gMSA6IGxpZ2h0QXR0cmlidXRlLkludGVuc2l0eS52YWx1ZSAvIDEwMDtcblxuXHRcdFx0Ly8gbGlnaHQgZGlzYWJsZWRcblx0XHRcdGlmICggbGlnaHRBdHRyaWJ1dGUuQ2FzdExpZ2h0T25PYmplY3QgIT09IHVuZGVmaW5lZCAmJiBsaWdodEF0dHJpYnV0ZS5DYXN0TGlnaHRPbk9iamVjdC52YWx1ZSA9PT0gMCApIHtcblxuXHRcdFx0XHRpbnRlbnNpdHkgPSAwO1xuXG5cdFx0XHR9XG5cblx0XHRcdGxldCBkaXN0YW5jZSA9IDA7XG5cdFx0XHRpZiAoIGxpZ2h0QXR0cmlidXRlLkZhckF0dGVudWF0aW9uRW5kICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0aWYgKCBsaWdodEF0dHJpYnV0ZS5FbmFibGVGYXJBdHRlbnVhdGlvbiAhPT0gdW5kZWZpbmVkICYmIGxpZ2h0QXR0cmlidXRlLkVuYWJsZUZhckF0dGVudWF0aW9uLnZhbHVlID09PSAwICkge1xuXG5cdFx0XHRcdFx0ZGlzdGFuY2UgPSAwO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRkaXN0YW5jZSA9IGxpZ2h0QXR0cmlidXRlLkZhckF0dGVudWF0aW9uRW5kLnZhbHVlO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUT0RPOiBjb3VsZCB0aGlzIGJlIGNhbGN1bGF0ZWQgbGluZWFybHkgZnJvbSBGYXJBdHRlbnVhdGlvblN0YXJ0IHRvIEZhckF0dGVudWF0aW9uRW5kP1xuXHRcdFx0Y29uc3QgZGVjYXkgPSAxO1xuXG5cdFx0XHRzd2l0Y2ggKCB0eXBlICkge1xuXG5cdFx0XHRcdGNhc2UgMDogLy8gUG9pbnRcblx0XHRcdFx0XHRtb2RlbCA9IG5ldyBQb2ludExpZ2h0KCBjb2xvciwgaW50ZW5zaXR5LCBkaXN0YW5jZSwgZGVjYXkgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIDE6IC8vIERpcmVjdGlvbmFsXG5cdFx0XHRcdFx0bW9kZWwgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCggY29sb3IsIGludGVuc2l0eSApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgMjogLy8gU3BvdFxuXHRcdFx0XHRcdGxldCBhbmdsZSA9IE1hdGguUEkgLyAzO1xuXG5cdFx0XHRcdFx0aWYgKCBsaWdodEF0dHJpYnV0ZS5Jbm5lckFuZ2xlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdGFuZ2xlID0gTWF0aFV0aWxzLmRlZ1RvUmFkKCBsaWdodEF0dHJpYnV0ZS5Jbm5lckFuZ2xlLnZhbHVlICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRsZXQgcGVudW1icmEgPSAwO1xuXHRcdFx0XHRcdGlmICggbGlnaHRBdHRyaWJ1dGUuT3V0ZXJBbmdsZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHQvLyBUT0RPOiB0aGlzIGlzIG5vdCBjb3JyZWN0IC0gRkJYIGNhbGN1bGF0ZXMgb3V0ZXIgYW5kIGlubmVyIGFuZ2xlIGluIGRlZ3JlZXNcblx0XHRcdFx0XHRcdC8vIHdpdGggT3V0ZXJBbmdsZSA+IElubmVyQW5nbGUgJiYgT3V0ZXJBbmdsZSA8PSBNYXRoLlBJXG5cdFx0XHRcdFx0XHQvLyB3aGlsZSB0aHJlZS5qcyB1c2VzIGEgcGVudW1icmEgYmV0d2VlbiAoMCwgMSkgdG8gYXR0ZW51YXRlIHRoZSBpbm5lciBhbmdsZVxuXHRcdFx0XHRcdFx0cGVudW1icmEgPSBNYXRoVXRpbHMuZGVnVG9SYWQoIGxpZ2h0QXR0cmlidXRlLk91dGVyQW5nbGUudmFsdWUgKTtcblx0XHRcdFx0XHRcdHBlbnVtYnJhID0gTWF0aC5tYXgoIHBlbnVtYnJhLCAxICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRtb2RlbCA9IG5ldyBTcG90TGlnaHQoIGNvbG9yLCBpbnRlbnNpdHksIGRpc3RhbmNlLCBhbmdsZSwgcGVudW1icmEsIGRlY2F5ICk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5GQlhMb2FkZXI6IFVua25vd24gbGlnaHQgdHlwZSAnICsgbGlnaHRBdHRyaWJ1dGUuTGlnaHRUeXBlLnZhbHVlICsgJywgZGVmYXVsdGluZyB0byBhIFBvaW50TGlnaHQuJyApO1xuXHRcdFx0XHRcdG1vZGVsID0gbmV3IFBvaW50TGlnaHQoIGNvbG9yLCBpbnRlbnNpdHkgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGxpZ2h0QXR0cmlidXRlLkNhc3RTaGFkb3dzICE9PSB1bmRlZmluZWQgJiYgbGlnaHRBdHRyaWJ1dGUuQ2FzdFNoYWRvd3MudmFsdWUgPT09IDEgKSB7XG5cblx0XHRcdFx0bW9kZWwuY2FzdFNoYWRvdyA9IHRydWU7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiBtb2RlbDtcblxuXHR9XG5cblx0Y3JlYXRlTWVzaCggcmVsYXRpb25zaGlwcywgZ2VvbWV0cnlNYXAsIG1hdGVyaWFsTWFwICkge1xuXG5cdFx0bGV0IG1vZGVsO1xuXHRcdGxldCBnZW9tZXRyeSA9IG51bGw7XG5cdFx0bGV0IG1hdGVyaWFsID0gbnVsbDtcblx0XHRjb25zdCBtYXRlcmlhbHMgPSBbXTtcblxuXHRcdC8vIGdldCBnZW9tZXRyeSBhbmQgbWF0ZXJpYWxzKHMpIGZyb20gY29ubmVjdGlvbnNcblx0XHRyZWxhdGlvbnNoaXBzLmNoaWxkcmVuLmZvckVhY2goIGZ1bmN0aW9uICggY2hpbGQgKSB7XG5cblx0XHRcdGlmICggZ2VvbWV0cnlNYXAuaGFzKCBjaGlsZC5JRCApICkge1xuXG5cdFx0XHRcdGdlb21ldHJ5ID0gZ2VvbWV0cnlNYXAuZ2V0KCBjaGlsZC5JRCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWF0ZXJpYWxNYXAuaGFzKCBjaGlsZC5JRCApICkge1xuXG5cdFx0XHRcdG1hdGVyaWFscy5wdXNoKCBtYXRlcmlhbE1hcC5nZXQoIGNoaWxkLklEICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSApO1xuXG5cdFx0aWYgKCBtYXRlcmlhbHMubGVuZ3RoID4gMSApIHtcblxuXHRcdFx0bWF0ZXJpYWwgPSBtYXRlcmlhbHM7XG5cblx0XHR9IGVsc2UgaWYgKCBtYXRlcmlhbHMubGVuZ3RoID4gMCApIHtcblxuXHRcdFx0bWF0ZXJpYWwgPSBtYXRlcmlhbHNbIDAgXTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdG1hdGVyaWFsID0gbmV3IE1lc2hQaG9uZ01hdGVyaWFsKCB7IGNvbG9yOiAweGNjY2NjYyB9ICk7XG5cdFx0XHRtYXRlcmlhbHMucHVzaCggbWF0ZXJpYWwgKTtcblxuXHRcdH1cblxuXHRcdGlmICggJ2NvbG9yJyBpbiBnZW9tZXRyeS5hdHRyaWJ1dGVzICkge1xuXG5cdFx0XHRtYXRlcmlhbHMuZm9yRWFjaCggZnVuY3Rpb24gKCBtYXRlcmlhbCApIHtcblxuXHRcdFx0XHRtYXRlcmlhbC52ZXJ0ZXhDb2xvcnMgPSB0cnVlO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIGdlb21ldHJ5LkZCWF9EZWZvcm1lciApIHtcblxuXHRcdFx0bW9kZWwgPSBuZXcgU2tpbm5lZE1lc2goIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXHRcdFx0bW9kZWwubm9ybWFsaXplU2tpbldlaWdodHMoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdG1vZGVsID0gbmV3IE1lc2goIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1vZGVsO1xuXG5cdH1cblxuXHRjcmVhdGVDdXJ2ZSggcmVsYXRpb25zaGlwcywgZ2VvbWV0cnlNYXAgKSB7XG5cblx0XHRjb25zdCBnZW9tZXRyeSA9IHJlbGF0aW9uc2hpcHMuY2hpbGRyZW4ucmVkdWNlKCBmdW5jdGlvbiAoIGdlbywgY2hpbGQgKSB7XG5cblx0XHRcdGlmICggZ2VvbWV0cnlNYXAuaGFzKCBjaGlsZC5JRCApICkgZ2VvID0gZ2VvbWV0cnlNYXAuZ2V0KCBjaGlsZC5JRCApO1xuXG5cdFx0XHRyZXR1cm4gZ2VvO1xuXG5cdFx0fSwgbnVsbCApO1xuXG5cdFx0Ly8gRkJYIGRvZXMgbm90IGxpc3QgbWF0ZXJpYWxzIGZvciBOdXJicyBsaW5lcywgc28gd2UnbGwganVzdCBwdXQgb3VyIG93biBpbiBoZXJlLlxuXHRcdGNvbnN0IG1hdGVyaWFsID0gbmV3IExpbmVCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDMzMDBmZiwgbGluZXdpZHRoOiAxIH0gKTtcblx0XHRyZXR1cm4gbmV3IExpbmUoIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXG5cdH1cblxuXHQvLyBwYXJzZSB0aGUgbW9kZWwgbm9kZSBmb3IgdHJhbnNmb3JtIGRhdGFcblx0Z2V0VHJhbnNmb3JtRGF0YSggbW9kZWwsIG1vZGVsTm9kZSApIHtcblxuXHRcdGNvbnN0IHRyYW5zZm9ybURhdGEgPSB7fTtcblxuXHRcdGlmICggJ0luaGVyaXRUeXBlJyBpbiBtb2RlbE5vZGUgKSB0cmFuc2Zvcm1EYXRhLmluaGVyaXRUeXBlID0gcGFyc2VJbnQoIG1vZGVsTm9kZS5Jbmhlcml0VHlwZS52YWx1ZSApO1xuXG5cdFx0aWYgKCAnUm90YXRpb25PcmRlcicgaW4gbW9kZWxOb2RlICkgdHJhbnNmb3JtRGF0YS5ldWxlck9yZGVyID0gZ2V0RXVsZXJPcmRlciggbW9kZWxOb2RlLlJvdGF0aW9uT3JkZXIudmFsdWUgKTtcblx0XHRlbHNlIHRyYW5zZm9ybURhdGEuZXVsZXJPcmRlciA9ICdaWVgnO1xuXG5cdFx0aWYgKCAnTGNsX1RyYW5zbGF0aW9uJyBpbiBtb2RlbE5vZGUgKSB0cmFuc2Zvcm1EYXRhLnRyYW5zbGF0aW9uID0gbW9kZWxOb2RlLkxjbF9UcmFuc2xhdGlvbi52YWx1ZTtcblxuXHRcdGlmICggJ1ByZVJvdGF0aW9uJyBpbiBtb2RlbE5vZGUgKSB0cmFuc2Zvcm1EYXRhLnByZVJvdGF0aW9uID0gbW9kZWxOb2RlLlByZVJvdGF0aW9uLnZhbHVlO1xuXHRcdGlmICggJ0xjbF9Sb3RhdGlvbicgaW4gbW9kZWxOb2RlICkgdHJhbnNmb3JtRGF0YS5yb3RhdGlvbiA9IG1vZGVsTm9kZS5MY2xfUm90YXRpb24udmFsdWU7XG5cdFx0aWYgKCAnUG9zdFJvdGF0aW9uJyBpbiBtb2RlbE5vZGUgKSB0cmFuc2Zvcm1EYXRhLnBvc3RSb3RhdGlvbiA9IG1vZGVsTm9kZS5Qb3N0Um90YXRpb24udmFsdWU7XG5cblx0XHRpZiAoICdMY2xfU2NhbGluZycgaW4gbW9kZWxOb2RlICkgdHJhbnNmb3JtRGF0YS5zY2FsZSA9IG1vZGVsTm9kZS5MY2xfU2NhbGluZy52YWx1ZTtcblxuXHRcdGlmICggJ1NjYWxpbmdPZmZzZXQnIGluIG1vZGVsTm9kZSApIHRyYW5zZm9ybURhdGEuc2NhbGluZ09mZnNldCA9IG1vZGVsTm9kZS5TY2FsaW5nT2Zmc2V0LnZhbHVlO1xuXHRcdGlmICggJ1NjYWxpbmdQaXZvdCcgaW4gbW9kZWxOb2RlICkgdHJhbnNmb3JtRGF0YS5zY2FsaW5nUGl2b3QgPSBtb2RlbE5vZGUuU2NhbGluZ1Bpdm90LnZhbHVlO1xuXG5cdFx0aWYgKCAnUm90YXRpb25PZmZzZXQnIGluIG1vZGVsTm9kZSApIHRyYW5zZm9ybURhdGEucm90YXRpb25PZmZzZXQgPSBtb2RlbE5vZGUuUm90YXRpb25PZmZzZXQudmFsdWU7XG5cdFx0aWYgKCAnUm90YXRpb25QaXZvdCcgaW4gbW9kZWxOb2RlICkgdHJhbnNmb3JtRGF0YS5yb3RhdGlvblBpdm90ID0gbW9kZWxOb2RlLlJvdGF0aW9uUGl2b3QudmFsdWU7XG5cblx0XHRtb2RlbC51c2VyRGF0YS50cmFuc2Zvcm1EYXRhID0gdHJhbnNmb3JtRGF0YTtcblxuXHR9XG5cblx0c2V0TG9va0F0UHJvcGVydGllcyggbW9kZWwsIG1vZGVsTm9kZSApIHtcblxuXHRcdGlmICggJ0xvb2tBdFByb3BlcnR5JyBpbiBtb2RlbE5vZGUgKSB7XG5cblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gY29ubmVjdGlvbnMuZ2V0KCBtb2RlbC5JRCApLmNoaWxkcmVuO1xuXG5cdFx0XHRjaGlsZHJlbi5mb3JFYWNoKCBmdW5jdGlvbiAoIGNoaWxkICkge1xuXG5cdFx0XHRcdGlmICggY2hpbGQucmVsYXRpb25zaGlwID09PSAnTG9va0F0UHJvcGVydHknICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgbG9va0F0VGFyZ2V0ID0gZmJ4VHJlZS5PYmplY3RzLk1vZGVsWyBjaGlsZC5JRCBdO1xuXG5cdFx0XHRcdFx0aWYgKCAnTGNsX1RyYW5zbGF0aW9uJyBpbiBsb29rQXRUYXJnZXQgKSB7XG5cblx0XHRcdFx0XHRcdGNvbnN0IHBvcyA9IGxvb2tBdFRhcmdldC5MY2xfVHJhbnNsYXRpb24udmFsdWU7XG5cblx0XHRcdFx0XHRcdC8vIERpcmVjdGlvbmFsTGlnaHQsIFNwb3RMaWdodFxuXHRcdFx0XHRcdFx0aWYgKCBtb2RlbC50YXJnZXQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdFx0XHRtb2RlbC50YXJnZXQucG9zaXRpb24uZnJvbUFycmF5KCBwb3MgKTtcblx0XHRcdFx0XHRcdFx0c2NlbmVHcmFwaC5hZGQoIG1vZGVsLnRhcmdldCApO1xuXG5cdFx0XHRcdFx0XHR9IGVsc2UgeyAvLyBDYW1lcmFzIGFuZCBvdGhlciBPYmplY3QzRHNcblxuXHRcdFx0XHRcdFx0XHRtb2RlbC5sb29rQXQoIG5ldyBWZWN0b3IzKCkuZnJvbUFycmF5KCBwb3MgKSApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGJpbmRTa2VsZXRvbiggc2tlbGV0b25zLCBnZW9tZXRyeU1hcCwgbW9kZWxNYXAgKSB7XG5cblx0XHRjb25zdCBiaW5kTWF0cmljZXMgPSB0aGlzLnBhcnNlUG9zZU5vZGVzKCk7XG5cblx0XHRmb3IgKCBjb25zdCBJRCBpbiBza2VsZXRvbnMgKSB7XG5cblx0XHRcdGNvbnN0IHNrZWxldG9uID0gc2tlbGV0b25zWyBJRCBdO1xuXG5cdFx0XHRjb25zdCBwYXJlbnRzID0gY29ubmVjdGlvbnMuZ2V0KCBwYXJzZUludCggc2tlbGV0b24uSUQgKSApLnBhcmVudHM7XG5cblx0XHRcdHBhcmVudHMuZm9yRWFjaCggZnVuY3Rpb24gKCBwYXJlbnQgKSB7XG5cblx0XHRcdFx0aWYgKCBnZW9tZXRyeU1hcC5oYXMoIHBhcmVudC5JRCApICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgZ2VvSUQgPSBwYXJlbnQuSUQ7XG5cdFx0XHRcdFx0Y29uc3QgZ2VvUmVsYXRpb25zaGlwcyA9IGNvbm5lY3Rpb25zLmdldCggZ2VvSUQgKTtcblxuXHRcdFx0XHRcdGdlb1JlbGF0aW9uc2hpcHMucGFyZW50cy5mb3JFYWNoKCBmdW5jdGlvbiAoIGdlb0Nvbm5QYXJlbnQgKSB7XG5cblx0XHRcdFx0XHRcdGlmICggbW9kZWxNYXAuaGFzKCBnZW9Db25uUGFyZW50LklEICkgKSB7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgbW9kZWwgPSBtb2RlbE1hcC5nZXQoIGdlb0Nvbm5QYXJlbnQuSUQgKTtcblxuXHRcdFx0XHRcdFx0XHRtb2RlbC5iaW5kKCBuZXcgU2tlbGV0b24oIHNrZWxldG9uLmJvbmVzICksIGJpbmRNYXRyaWNlc1sgZ2VvQ29ublBhcmVudC5JRCBdICk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHR9XG5cblx0cGFyc2VQb3NlTm9kZXMoKSB7XG5cblx0XHRjb25zdCBiaW5kTWF0cmljZXMgPSB7fTtcblxuXHRcdGlmICggJ1Bvc2UnIGluIGZieFRyZWUuT2JqZWN0cyApIHtcblxuXHRcdFx0Y29uc3QgQmluZFBvc2VOb2RlID0gZmJ4VHJlZS5PYmplY3RzLlBvc2U7XG5cblx0XHRcdGZvciAoIGNvbnN0IG5vZGVJRCBpbiBCaW5kUG9zZU5vZGUgKSB7XG5cblx0XHRcdFx0aWYgKCBCaW5kUG9zZU5vZGVbIG5vZGVJRCBdLmF0dHJUeXBlID09PSAnQmluZFBvc2UnICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgcG9zZU5vZGVzID0gQmluZFBvc2VOb2RlWyBub2RlSUQgXS5Qb3NlTm9kZTtcblxuXHRcdFx0XHRcdGlmICggQXJyYXkuaXNBcnJheSggcG9zZU5vZGVzICkgKSB7XG5cblx0XHRcdFx0XHRcdHBvc2VOb2Rlcy5mb3JFYWNoKCBmdW5jdGlvbiAoIHBvc2VOb2RlICkge1xuXG5cdFx0XHRcdFx0XHRcdGJpbmRNYXRyaWNlc1sgcG9zZU5vZGUuTm9kZSBdID0gbmV3IE1hdHJpeDQoKS5mcm9tQXJyYXkoIHBvc2VOb2RlLk1hdHJpeC5hICk7XG5cblx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdGJpbmRNYXRyaWNlc1sgcG9zZU5vZGVzLk5vZGUgXSA9IG5ldyBNYXRyaXg0KCkuZnJvbUFycmF5KCBwb3NlTm9kZXMuTWF0cml4LmEgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiBiaW5kTWF0cmljZXM7XG5cblx0fVxuXG5cdC8vIFBhcnNlIGFtYmllbnQgY29sb3IgaW4gRkJYVHJlZS5HbG9iYWxTZXR0aW5ncyAtIGlmIGl0J3Mgbm90IHNldCB0byBibGFjayAoZGVmYXVsdCksIGNyZWF0ZSBhbiBhbWJpZW50IGxpZ2h0XG5cdGNyZWF0ZUFtYmllbnRMaWdodCgpIHtcblxuXHRcdGlmICggJ0dsb2JhbFNldHRpbmdzJyBpbiBmYnhUcmVlICYmICdBbWJpZW50Q29sb3InIGluIGZieFRyZWUuR2xvYmFsU2V0dGluZ3MgKSB7XG5cblx0XHRcdGNvbnN0IGFtYmllbnRDb2xvciA9IGZieFRyZWUuR2xvYmFsU2V0dGluZ3MuQW1iaWVudENvbG9yLnZhbHVlO1xuXHRcdFx0Y29uc3QgciA9IGFtYmllbnRDb2xvclsgMCBdO1xuXHRcdFx0Y29uc3QgZyA9IGFtYmllbnRDb2xvclsgMSBdO1xuXHRcdFx0Y29uc3QgYiA9IGFtYmllbnRDb2xvclsgMiBdO1xuXG5cdFx0XHRpZiAoIHIgIT09IDAgfHwgZyAhPT0gMCB8fCBiICE9PSAwICkge1xuXG5cdFx0XHRcdGNvbnN0IGNvbG9yID0gbmV3IENvbG9yKCByLCBnLCBiICk7XG5cdFx0XHRcdHNjZW5lR3JhcGguYWRkKCBuZXcgQW1iaWVudExpZ2h0KCBjb2xvciwgMSApICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cbn1cblxuLy8gcGFyc2UgR2VvbWV0cnkgZGF0YSBmcm9tIEZCWFRyZWUgYW5kIHJldHVybiBtYXAgb2YgQnVmZmVyR2VvbWV0cmllc1xuY2xhc3MgR2VvbWV0cnlQYXJzZXIge1xuXG5cdC8vIFBhcnNlIG5vZGVzIGluIEZCWFRyZWUuT2JqZWN0cy5HZW9tZXRyeVxuXHRwYXJzZSggZGVmb3JtZXJzICkge1xuXG5cdFx0Y29uc3QgZ2VvbWV0cnlNYXAgPSBuZXcgTWFwKCk7XG5cblx0XHRpZiAoICdHZW9tZXRyeScgaW4gZmJ4VHJlZS5PYmplY3RzICkge1xuXG5cdFx0XHRjb25zdCBnZW9Ob2RlcyA9IGZieFRyZWUuT2JqZWN0cy5HZW9tZXRyeTtcblxuXHRcdFx0Zm9yICggY29uc3Qgbm9kZUlEIGluIGdlb05vZGVzICkge1xuXG5cdFx0XHRcdGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBjb25uZWN0aW9ucy5nZXQoIHBhcnNlSW50KCBub2RlSUQgKSApO1xuXHRcdFx0XHRjb25zdCBnZW8gPSB0aGlzLnBhcnNlR2VvbWV0cnkoIHJlbGF0aW9uc2hpcHMsIGdlb05vZGVzWyBub2RlSUQgXSwgZGVmb3JtZXJzICk7XG5cblx0XHRcdFx0Z2VvbWV0cnlNYXAuc2V0KCBwYXJzZUludCggbm9kZUlEICksIGdlbyApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gZ2VvbWV0cnlNYXA7XG5cblx0fVxuXG5cdC8vIFBhcnNlIHNpbmdsZSBub2RlIGluIEZCWFRyZWUuT2JqZWN0cy5HZW9tZXRyeVxuXHRwYXJzZUdlb21ldHJ5KCByZWxhdGlvbnNoaXBzLCBnZW9Ob2RlLCBkZWZvcm1lcnMgKSB7XG5cblx0XHRzd2l0Y2ggKCBnZW9Ob2RlLmF0dHJUeXBlICkge1xuXG5cdFx0XHRjYXNlICdNZXNoJzpcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VNZXNoR2VvbWV0cnkoIHJlbGF0aW9uc2hpcHMsIGdlb05vZGUsIGRlZm9ybWVycyApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnTnVyYnNDdXJ2ZSc6XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlTnVyYnNHZW9tZXRyeSggZ2VvTm9kZSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdH1cblxuXHR9XG5cblx0Ly8gUGFyc2Ugc2luZ2xlIG5vZGUgbWVzaCBnZW9tZXRyeSBpbiBGQlhUcmVlLk9iamVjdHMuR2VvbWV0cnlcblx0cGFyc2VNZXNoR2VvbWV0cnkoIHJlbGF0aW9uc2hpcHMsIGdlb05vZGUsIGRlZm9ybWVycyApIHtcblxuXHRcdGNvbnN0IHNrZWxldG9ucyA9IGRlZm9ybWVycy5za2VsZXRvbnM7XG5cdFx0Y29uc3QgbW9ycGhUYXJnZXRzID0gW107XG5cblx0XHRjb25zdCBtb2RlbE5vZGVzID0gcmVsYXRpb25zaGlwcy5wYXJlbnRzLm1hcCggZnVuY3Rpb24gKCBwYXJlbnQgKSB7XG5cblx0XHRcdHJldHVybiBmYnhUcmVlLk9iamVjdHMuTW9kZWxbIHBhcmVudC5JRCBdO1xuXG5cdFx0fSApO1xuXG5cdFx0Ly8gZG9uJ3QgY3JlYXRlIGdlb21ldHJ5IGlmIGl0IGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggYW55IG1vZGVsc1xuXHRcdGlmICggbW9kZWxOb2Rlcy5sZW5ndGggPT09IDAgKSByZXR1cm47XG5cblx0XHRjb25zdCBza2VsZXRvbiA9IHJlbGF0aW9uc2hpcHMuY2hpbGRyZW4ucmVkdWNlKCBmdW5jdGlvbiAoIHNrZWxldG9uLCBjaGlsZCApIHtcblxuXHRcdFx0aWYgKCBza2VsZXRvbnNbIGNoaWxkLklEIF0gIT09IHVuZGVmaW5lZCApIHNrZWxldG9uID0gc2tlbGV0b25zWyBjaGlsZC5JRCBdO1xuXG5cdFx0XHRyZXR1cm4gc2tlbGV0b247XG5cblx0XHR9LCBudWxsICk7XG5cblx0XHRyZWxhdGlvbnNoaXBzLmNoaWxkcmVuLmZvckVhY2goIGZ1bmN0aW9uICggY2hpbGQgKSB7XG5cblx0XHRcdGlmICggZGVmb3JtZXJzLm1vcnBoVGFyZ2V0c1sgY2hpbGQuSUQgXSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdG1vcnBoVGFyZ2V0cy5wdXNoKCBkZWZvcm1lcnMubW9ycGhUYXJnZXRzWyBjaGlsZC5JRCBdICk7XG5cblx0XHRcdH1cblxuXHRcdH0gKTtcblxuXHRcdC8vIEFzc3VtZSBvbmUgbW9kZWwgYW5kIGdldCB0aGUgcHJlUm90YXRpb24gZnJvbSB0aGF0XG5cdFx0Ly8gaWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSBtb2RlbCBhc3NvY2lhdGVkIHdpdGggdGhlIGdlb21ldHJ5IHRoaXMgbWF5IGNhdXNlIHByb2JsZW1zXG5cdFx0Y29uc3QgbW9kZWxOb2RlID0gbW9kZWxOb2Rlc1sgMCBdO1xuXG5cdFx0Y29uc3QgdHJhbnNmb3JtRGF0YSA9IHt9O1xuXG5cdFx0aWYgKCAnUm90YXRpb25PcmRlcicgaW4gbW9kZWxOb2RlICkgdHJhbnNmb3JtRGF0YS5ldWxlck9yZGVyID0gZ2V0RXVsZXJPcmRlciggbW9kZWxOb2RlLlJvdGF0aW9uT3JkZXIudmFsdWUgKTtcblx0XHRpZiAoICdJbmhlcml0VHlwZScgaW4gbW9kZWxOb2RlICkgdHJhbnNmb3JtRGF0YS5pbmhlcml0VHlwZSA9IHBhcnNlSW50KCBtb2RlbE5vZGUuSW5oZXJpdFR5cGUudmFsdWUgKTtcblxuXHRcdGlmICggJ0dlb21ldHJpY1RyYW5zbGF0aW9uJyBpbiBtb2RlbE5vZGUgKSB0cmFuc2Zvcm1EYXRhLnRyYW5zbGF0aW9uID0gbW9kZWxOb2RlLkdlb21ldHJpY1RyYW5zbGF0aW9uLnZhbHVlO1xuXHRcdGlmICggJ0dlb21ldHJpY1JvdGF0aW9uJyBpbiBtb2RlbE5vZGUgKSB0cmFuc2Zvcm1EYXRhLnJvdGF0aW9uID0gbW9kZWxOb2RlLkdlb21ldHJpY1JvdGF0aW9uLnZhbHVlO1xuXHRcdGlmICggJ0dlb21ldHJpY1NjYWxpbmcnIGluIG1vZGVsTm9kZSApIHRyYW5zZm9ybURhdGEuc2NhbGUgPSBtb2RlbE5vZGUuR2VvbWV0cmljU2NhbGluZy52YWx1ZTtcblxuXHRcdGNvbnN0IHRyYW5zZm9ybSA9IGdlbmVyYXRlVHJhbnNmb3JtKCB0cmFuc2Zvcm1EYXRhICk7XG5cblx0XHRyZXR1cm4gdGhpcy5nZW5HZW9tZXRyeSggZ2VvTm9kZSwgc2tlbGV0b24sIG1vcnBoVGFyZ2V0cywgdHJhbnNmb3JtICk7XG5cblx0fVxuXG5cdC8vIEdlbmVyYXRlIGEgQnVmZmVyR2VvbWV0cnkgZnJvbSBhIG5vZGUgaW4gRkJYVHJlZS5PYmplY3RzLkdlb21ldHJ5XG5cdGdlbkdlb21ldHJ5KCBnZW9Ob2RlLCBza2VsZXRvbiwgbW9ycGhUYXJnZXRzLCBwcmVUcmFuc2Zvcm0gKSB7XG5cblx0XHRjb25zdCBnZW8gPSBuZXcgQnVmZmVyR2VvbWV0cnkoKTtcblx0XHRpZiAoIGdlb05vZGUuYXR0ck5hbWUgKSBnZW8ubmFtZSA9IGdlb05vZGUuYXR0ck5hbWU7XG5cblx0XHRjb25zdCBnZW9JbmZvID0gdGhpcy5wYXJzZUdlb05vZGUoIGdlb05vZGUsIHNrZWxldG9uICk7XG5cdFx0Y29uc3QgYnVmZmVycyA9IHRoaXMuZ2VuQnVmZmVycyggZ2VvSW5mbyApO1xuXG5cdFx0Y29uc3QgcG9zaXRpb25BdHRyaWJ1dGUgPSBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSggYnVmZmVycy52ZXJ0ZXgsIDMgKTtcblxuXHRcdHBvc2l0aW9uQXR0cmlidXRlLmFwcGx5TWF0cml4NCggcHJlVHJhbnNmb3JtICk7XG5cblx0XHRnZW8uc2V0QXR0cmlidXRlKCAncG9zaXRpb24nLCBwb3NpdGlvbkF0dHJpYnV0ZSApO1xuXG5cdFx0aWYgKCBidWZmZXJzLmNvbG9ycy5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRnZW8uc2V0QXR0cmlidXRlKCAnY29sb3InLCBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSggYnVmZmVycy5jb2xvcnMsIDMgKSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBza2VsZXRvbiApIHtcblxuXHRcdFx0Z2VvLnNldEF0dHJpYnV0ZSggJ3NraW5JbmRleCcsIG5ldyBVaW50MTZCdWZmZXJBdHRyaWJ1dGUoIGJ1ZmZlcnMud2VpZ2h0c0luZGljZXMsIDQgKSApO1xuXG5cdFx0XHRnZW8uc2V0QXR0cmlidXRlKCAnc2tpbldlaWdodCcsIG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlKCBidWZmZXJzLnZlcnRleFdlaWdodHMsIDQgKSApO1xuXG5cdFx0XHQvLyB1c2VkIGxhdGVyIHRvIGJpbmQgdGhlIHNrZWxldG9uIHRvIHRoZSBtb2RlbFxuXHRcdFx0Z2VvLkZCWF9EZWZvcm1lciA9IHNrZWxldG9uO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBidWZmZXJzLm5vcm1hbC5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRjb25zdCBub3JtYWxNYXRyaXggPSBuZXcgTWF0cml4MygpLmdldE5vcm1hbE1hdHJpeCggcHJlVHJhbnNmb3JtICk7XG5cblx0XHRcdGNvbnN0IG5vcm1hbEF0dHJpYnV0ZSA9IG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlKCBidWZmZXJzLm5vcm1hbCwgMyApO1xuXHRcdFx0bm9ybWFsQXR0cmlidXRlLmFwcGx5Tm9ybWFsTWF0cml4KCBub3JtYWxNYXRyaXggKTtcblxuXHRcdFx0Z2VvLnNldEF0dHJpYnV0ZSggJ25vcm1hbCcsIG5vcm1hbEF0dHJpYnV0ZSApO1xuXG5cdFx0fVxuXG5cdFx0YnVmZmVycy51dnMuZm9yRWFjaCggZnVuY3Rpb24gKCB1dkJ1ZmZlciwgaSApIHtcblxuXHRcdFx0Ly8gc3Vic2VxdWVudCB1diBidWZmZXJzIGFyZSBjYWxsZWQgJ3V2MScsICd1djInLCAuLi5cblx0XHRcdGxldCBuYW1lID0gJ3V2JyArICggaSArIDEgKS50b1N0cmluZygpO1xuXG5cdFx0XHQvLyB0aGUgZmlyc3QgdXYgYnVmZmVyIGlzIGp1c3QgY2FsbGVkICd1didcblx0XHRcdGlmICggaSA9PT0gMCApIHtcblxuXHRcdFx0XHRuYW1lID0gJ3V2JztcblxuXHRcdFx0fVxuXG5cdFx0XHRnZW8uc2V0QXR0cmlidXRlKCBuYW1lLCBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSggYnVmZmVycy51dnNbIGkgXSwgMiApICk7XG5cblx0XHR9ICk7XG5cblx0XHRpZiAoIGdlb0luZm8ubWF0ZXJpYWwgJiYgZ2VvSW5mby5tYXRlcmlhbC5tYXBwaW5nVHlwZSAhPT0gJ0FsbFNhbWUnICkge1xuXG5cdFx0XHQvLyBDb252ZXJ0IHRoZSBtYXRlcmlhbCBpbmRpY2VzIG9mIGVhY2ggdmVydGV4IGludG8gcmVuZGVyaW5nIGdyb3VwcyBvbiB0aGUgZ2VvbWV0cnkuXG5cdFx0XHRsZXQgcHJldk1hdGVyaWFsSW5kZXggPSBidWZmZXJzLm1hdGVyaWFsSW5kZXhbIDAgXTtcblx0XHRcdGxldCBzdGFydEluZGV4ID0gMDtcblxuXHRcdFx0YnVmZmVycy5tYXRlcmlhbEluZGV4LmZvckVhY2goIGZ1bmN0aW9uICggY3VycmVudEluZGV4LCBpICkge1xuXG5cdFx0XHRcdGlmICggY3VycmVudEluZGV4ICE9PSBwcmV2TWF0ZXJpYWxJbmRleCApIHtcblxuXHRcdFx0XHRcdGdlby5hZGRHcm91cCggc3RhcnRJbmRleCwgaSAtIHN0YXJ0SW5kZXgsIHByZXZNYXRlcmlhbEluZGV4ICk7XG5cblx0XHRcdFx0XHRwcmV2TWF0ZXJpYWxJbmRleCA9IGN1cnJlbnRJbmRleDtcblx0XHRcdFx0XHRzdGFydEluZGV4ID0gaTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdFx0Ly8gdGhlIGxvb3AgYWJvdmUgZG9lc24ndCBhZGQgdGhlIGxhc3QgZ3JvdXAsIGRvIHRoYXQgaGVyZS5cblx0XHRcdGlmICggZ2VvLmdyb3Vwcy5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRcdGNvbnN0IGxhc3RHcm91cCA9IGdlby5ncm91cHNbIGdlby5ncm91cHMubGVuZ3RoIC0gMSBdO1xuXHRcdFx0XHRjb25zdCBsYXN0SW5kZXggPSBsYXN0R3JvdXAuc3RhcnQgKyBsYXN0R3JvdXAuY291bnQ7XG5cblx0XHRcdFx0aWYgKCBsYXN0SW5kZXggIT09IGJ1ZmZlcnMubWF0ZXJpYWxJbmRleC5sZW5ndGggKSB7XG5cblx0XHRcdFx0XHRnZW8uYWRkR3JvdXAoIGxhc3RJbmRleCwgYnVmZmVycy5tYXRlcmlhbEluZGV4Lmxlbmd0aCAtIGxhc3RJbmRleCwgcHJldk1hdGVyaWFsSW5kZXggKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gY2FzZSB3aGVyZSB0aGVyZSBhcmUgbXVsdGlwbGUgbWF0ZXJpYWxzIGJ1dCB0aGUgd2hvbGUgZ2VvbWV0cnkgaXMgb25seVxuXHRcdFx0Ly8gdXNpbmcgb25lIG9mIHRoZW1cblx0XHRcdGlmICggZ2VvLmdyb3Vwcy5sZW5ndGggPT09IDAgKSB7XG5cblx0XHRcdFx0Z2VvLmFkZEdyb3VwKCAwLCBidWZmZXJzLm1hdGVyaWFsSW5kZXgubGVuZ3RoLCBidWZmZXJzLm1hdGVyaWFsSW5kZXhbIDAgXSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHR0aGlzLmFkZE1vcnBoVGFyZ2V0cyggZ2VvLCBnZW9Ob2RlLCBtb3JwaFRhcmdldHMsIHByZVRyYW5zZm9ybSApO1xuXG5cdFx0cmV0dXJuIGdlbztcblxuXHR9XG5cblx0cGFyc2VHZW9Ob2RlKCBnZW9Ob2RlLCBza2VsZXRvbiApIHtcblxuXHRcdGNvbnN0IGdlb0luZm8gPSB7fTtcblxuXHRcdGdlb0luZm8udmVydGV4UG9zaXRpb25zID0gKCBnZW9Ob2RlLlZlcnRpY2VzICE9PSB1bmRlZmluZWQgKSA/IGdlb05vZGUuVmVydGljZXMuYSA6IFtdO1xuXHRcdGdlb0luZm8udmVydGV4SW5kaWNlcyA9ICggZ2VvTm9kZS5Qb2x5Z29uVmVydGV4SW5kZXggIT09IHVuZGVmaW5lZCApID8gZ2VvTm9kZS5Qb2x5Z29uVmVydGV4SW5kZXguYSA6IFtdO1xuXG5cdFx0aWYgKCBnZW9Ob2RlLkxheWVyRWxlbWVudENvbG9yICkge1xuXG5cdFx0XHRnZW9JbmZvLmNvbG9yID0gdGhpcy5wYXJzZVZlcnRleENvbG9ycyggZ2VvTm9kZS5MYXllckVsZW1lbnRDb2xvclsgMCBdICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIGdlb05vZGUuTGF5ZXJFbGVtZW50TWF0ZXJpYWwgKSB7XG5cblx0XHRcdGdlb0luZm8ubWF0ZXJpYWwgPSB0aGlzLnBhcnNlTWF0ZXJpYWxJbmRpY2VzKCBnZW9Ob2RlLkxheWVyRWxlbWVudE1hdGVyaWFsWyAwIF0gKTtcblxuXHRcdH1cblxuXHRcdGlmICggZ2VvTm9kZS5MYXllckVsZW1lbnROb3JtYWwgKSB7XG5cblx0XHRcdGdlb0luZm8ubm9ybWFsID0gdGhpcy5wYXJzZU5vcm1hbHMoIGdlb05vZGUuTGF5ZXJFbGVtZW50Tm9ybWFsWyAwIF0gKTtcblxuXHRcdH1cblxuXHRcdGlmICggZ2VvTm9kZS5MYXllckVsZW1lbnRVViApIHtcblxuXHRcdFx0Z2VvSW5mby51diA9IFtdO1xuXG5cdFx0XHRsZXQgaSA9IDA7XG5cdFx0XHR3aGlsZSAoIGdlb05vZGUuTGF5ZXJFbGVtZW50VVZbIGkgXSApIHtcblxuXHRcdFx0XHRpZiAoIGdlb05vZGUuTGF5ZXJFbGVtZW50VVZbIGkgXS5VViApIHtcblxuXHRcdFx0XHRcdGdlb0luZm8udXYucHVzaCggdGhpcy5wYXJzZVVWcyggZ2VvTm9kZS5MYXllckVsZW1lbnRVVlsgaSBdICkgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArKztcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0Z2VvSW5mby53ZWlnaHRUYWJsZSA9IHt9O1xuXG5cdFx0aWYgKCBza2VsZXRvbiAhPT0gbnVsbCApIHtcblxuXHRcdFx0Z2VvSW5mby5za2VsZXRvbiA9IHNrZWxldG9uO1xuXG5cdFx0XHRza2VsZXRvbi5yYXdCb25lcy5mb3JFYWNoKCBmdW5jdGlvbiAoIHJhd0JvbmUsIGkgKSB7XG5cblx0XHRcdFx0Ly8gbG9vcCBvdmVyIHRoZSBib25lJ3MgdmVydGV4IGluZGljZXMgYW5kIHdlaWdodHNcblx0XHRcdFx0cmF3Qm9uZS5pbmRpY2VzLmZvckVhY2goIGZ1bmN0aW9uICggaW5kZXgsIGogKSB7XG5cblx0XHRcdFx0XHRpZiAoIGdlb0luZm8ud2VpZ2h0VGFibGVbIGluZGV4IF0gPT09IHVuZGVmaW5lZCApIGdlb0luZm8ud2VpZ2h0VGFibGVbIGluZGV4IF0gPSBbXTtcblxuXHRcdFx0XHRcdGdlb0luZm8ud2VpZ2h0VGFibGVbIGluZGV4IF0ucHVzaCgge1xuXG5cdFx0XHRcdFx0XHRpZDogaSxcblx0XHRcdFx0XHRcdHdlaWdodDogcmF3Qm9uZS53ZWlnaHRzWyBqIF0sXG5cblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0fSApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gZ2VvSW5mbztcblxuXHR9XG5cblx0Z2VuQnVmZmVycyggZ2VvSW5mbyApIHtcblxuXHRcdGNvbnN0IGJ1ZmZlcnMgPSB7XG5cdFx0XHR2ZXJ0ZXg6IFtdLFxuXHRcdFx0bm9ybWFsOiBbXSxcblx0XHRcdGNvbG9yczogW10sXG5cdFx0XHR1dnM6IFtdLFxuXHRcdFx0bWF0ZXJpYWxJbmRleDogW10sXG5cdFx0XHR2ZXJ0ZXhXZWlnaHRzOiBbXSxcblx0XHRcdHdlaWdodHNJbmRpY2VzOiBbXSxcblx0XHR9O1xuXG5cdFx0bGV0IHBvbHlnb25JbmRleCA9IDA7XG5cdFx0bGV0IGZhY2VMZW5ndGggPSAwO1xuXHRcdGxldCBkaXNwbGF5ZWRXZWlnaHRzV2FybmluZyA9IGZhbHNlO1xuXG5cdFx0Ly8gdGhlc2Ugd2lsbCBob2xkIGRhdGEgZm9yIGEgc2luZ2xlIGZhY2Vcblx0XHRsZXQgZmFjZVBvc2l0aW9uSW5kZXhlcyA9IFtdO1xuXHRcdGxldCBmYWNlTm9ybWFscyA9IFtdO1xuXHRcdGxldCBmYWNlQ29sb3JzID0gW107XG5cdFx0bGV0IGZhY2VVVnMgPSBbXTtcblx0XHRsZXQgZmFjZVdlaWdodHMgPSBbXTtcblx0XHRsZXQgZmFjZVdlaWdodEluZGljZXMgPSBbXTtcblxuXHRcdGNvbnN0IHNjb3BlID0gdGhpcztcblx0XHRnZW9JbmZvLnZlcnRleEluZGljZXMuZm9yRWFjaCggZnVuY3Rpb24gKCB2ZXJ0ZXhJbmRleCwgcG9seWdvblZlcnRleEluZGV4ICkge1xuXG5cdFx0XHRsZXQgbWF0ZXJpYWxJbmRleDtcblx0XHRcdGxldCBlbmRPZkZhY2UgPSBmYWxzZTtcblxuXHRcdFx0Ly8gRmFjZSBpbmRleCBhbmQgdmVydGV4IGluZGV4IGFycmF5cyBhcmUgY29tYmluZWQgaW4gYSBzaW5nbGUgYXJyYXlcblx0XHRcdC8vIEEgY3ViZSB3aXRoIHF1YWQgZmFjZXMgbG9va3MgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gUG9seWdvblZlcnRleEluZGV4OiAqMjQge1xuXHRcdFx0Ly8gIGE6IDAsIDEsIDMsIC0zLCAyLCAzLCA1LCAtNSwgNCwgNSwgNywgLTcsIDYsIDcsIDEsIC0xLCAxLCA3LCA1LCAtNCwgNiwgMCwgMiwgLTVcblx0XHRcdC8vICB9XG5cdFx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIG1hcmsgdGhlIGVuZCBvZiBhIGZhY2UgLSBmaXJzdCBmYWNlIGhlcmUgaXMgMCwgMSwgMywgLTNcblx0XHRcdC8vIHRvIGZpbmQgaW5kZXggb2YgbGFzdCB2ZXJ0ZXggYml0IHNoaWZ0IHRoZSBpbmRleDogXiAtIDFcblx0XHRcdGlmICggdmVydGV4SW5kZXggPCAwICkge1xuXG5cdFx0XHRcdHZlcnRleEluZGV4ID0gdmVydGV4SW5kZXggXiAtIDE7IC8vIGVxdWl2YWxlbnQgdG8gKCB4ICogLTEgKSAtIDFcblx0XHRcdFx0ZW5kT2ZGYWNlID0gdHJ1ZTtcblxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgd2VpZ2h0SW5kaWNlcyA9IFtdO1xuXHRcdFx0bGV0IHdlaWdodHMgPSBbXTtcblxuXHRcdFx0ZmFjZVBvc2l0aW9uSW5kZXhlcy5wdXNoKCB2ZXJ0ZXhJbmRleCAqIDMsIHZlcnRleEluZGV4ICogMyArIDEsIHZlcnRleEluZGV4ICogMyArIDIgKTtcblxuXHRcdFx0aWYgKCBnZW9JbmZvLmNvbG9yICkge1xuXG5cdFx0XHRcdGNvbnN0IGRhdGEgPSBnZXREYXRhKCBwb2x5Z29uVmVydGV4SW5kZXgsIHBvbHlnb25JbmRleCwgdmVydGV4SW5kZXgsIGdlb0luZm8uY29sb3IgKTtcblxuXHRcdFx0XHRmYWNlQ29sb3JzLnB1c2goIGRhdGFbIDAgXSwgZGF0YVsgMSBdLCBkYXRhWyAyIF0gKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGdlb0luZm8uc2tlbGV0b24gKSB7XG5cblx0XHRcdFx0aWYgKCBnZW9JbmZvLndlaWdodFRhYmxlWyB2ZXJ0ZXhJbmRleCBdICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRnZW9JbmZvLndlaWdodFRhYmxlWyB2ZXJ0ZXhJbmRleCBdLmZvckVhY2goIGZ1bmN0aW9uICggd3QgKSB7XG5cblx0XHRcdFx0XHRcdHdlaWdodHMucHVzaCggd3Qud2VpZ2h0ICk7XG5cdFx0XHRcdFx0XHR3ZWlnaHRJbmRpY2VzLnB1c2goIHd0LmlkICk7XG5cblx0XHRcdFx0XHR9ICk7XG5cblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCB3ZWlnaHRzLmxlbmd0aCA+IDQgKSB7XG5cblx0XHRcdFx0XHRpZiAoICEgZGlzcGxheWVkV2VpZ2h0c1dhcm5pbmcgKSB7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkZCWExvYWRlcjogVmVydGV4IGhhcyBtb3JlIHRoYW4gNCBza2lubmluZyB3ZWlnaHRzIGFzc2lnbmVkIHRvIHZlcnRleC4gRGVsZXRpbmcgYWRkaXRpb25hbCB3ZWlnaHRzLicgKTtcblx0XHRcdFx0XHRcdGRpc3BsYXllZFdlaWdodHNXYXJuaW5nID0gdHJ1ZTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IHdJbmRleCA9IFsgMCwgMCwgMCwgMCBdO1xuXHRcdFx0XHRcdGNvbnN0IFdlaWdodCA9IFsgMCwgMCwgMCwgMCBdO1xuXG5cdFx0XHRcdFx0d2VpZ2h0cy5mb3JFYWNoKCBmdW5jdGlvbiAoIHdlaWdodCwgd2VpZ2h0SW5kZXggKSB7XG5cblx0XHRcdFx0XHRcdGxldCBjdXJyZW50V2VpZ2h0ID0gd2VpZ2h0O1xuXHRcdFx0XHRcdFx0bGV0IGN1cnJlbnRJbmRleCA9IHdlaWdodEluZGljZXNbIHdlaWdodEluZGV4IF07XG5cblx0XHRcdFx0XHRcdFdlaWdodC5mb3JFYWNoKCBmdW5jdGlvbiAoIGNvbXBhcmVkV2VpZ2h0LCBjb21wYXJlZFdlaWdodEluZGV4LCBjb21wYXJlZFdlaWdodEFycmF5ICkge1xuXG5cdFx0XHRcdFx0XHRcdGlmICggY3VycmVudFdlaWdodCA+IGNvbXBhcmVkV2VpZ2h0ICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29tcGFyZWRXZWlnaHRBcnJheVsgY29tcGFyZWRXZWlnaHRJbmRleCBdID0gY3VycmVudFdlaWdodDtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50V2VpZ2h0ID0gY29tcGFyZWRXZWlnaHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zdCB0bXAgPSB3SW5kZXhbIGNvbXBhcmVkV2VpZ2h0SW5kZXggXTtcblx0XHRcdFx0XHRcdFx0XHR3SW5kZXhbIGNvbXBhcmVkV2VpZ2h0SW5kZXggXSA9IGN1cnJlbnRJbmRleDtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50SW5kZXggPSB0bXA7XG5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHR3ZWlnaHRJbmRpY2VzID0gd0luZGV4O1xuXHRcdFx0XHRcdHdlaWdodHMgPSBXZWlnaHQ7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGlmIHRoZSB3ZWlnaHQgYXJyYXkgaXMgc2hvcnRlciB0aGFuIDQgcGFkIHdpdGggMHNcblx0XHRcdFx0d2hpbGUgKCB3ZWlnaHRzLmxlbmd0aCA8IDQgKSB7XG5cblx0XHRcdFx0XHR3ZWlnaHRzLnB1c2goIDAgKTtcblx0XHRcdFx0XHR3ZWlnaHRJbmRpY2VzLnB1c2goIDAgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgNDsgKysgaSApIHtcblxuXHRcdFx0XHRcdGZhY2VXZWlnaHRzLnB1c2goIHdlaWdodHNbIGkgXSApO1xuXHRcdFx0XHRcdGZhY2VXZWlnaHRJbmRpY2VzLnB1c2goIHdlaWdodEluZGljZXNbIGkgXSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGdlb0luZm8ubm9ybWFsICkge1xuXG5cdFx0XHRcdGNvbnN0IGRhdGEgPSBnZXREYXRhKCBwb2x5Z29uVmVydGV4SW5kZXgsIHBvbHlnb25JbmRleCwgdmVydGV4SW5kZXgsIGdlb0luZm8ubm9ybWFsICk7XG5cblx0XHRcdFx0ZmFjZU5vcm1hbHMucHVzaCggZGF0YVsgMCBdLCBkYXRhWyAxIF0sIGRhdGFbIDIgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggZ2VvSW5mby5tYXRlcmlhbCAmJiBnZW9JbmZvLm1hdGVyaWFsLm1hcHBpbmdUeXBlICE9PSAnQWxsU2FtZScgKSB7XG5cblx0XHRcdFx0bWF0ZXJpYWxJbmRleCA9IGdldERhdGEoIHBvbHlnb25WZXJ0ZXhJbmRleCwgcG9seWdvbkluZGV4LCB2ZXJ0ZXhJbmRleCwgZ2VvSW5mby5tYXRlcmlhbCApWyAwIF07XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBnZW9JbmZvLnV2ICkge1xuXG5cdFx0XHRcdGdlb0luZm8udXYuZm9yRWFjaCggZnVuY3Rpb24gKCB1diwgaSApIHtcblxuXHRcdFx0XHRcdGNvbnN0IGRhdGEgPSBnZXREYXRhKCBwb2x5Z29uVmVydGV4SW5kZXgsIHBvbHlnb25JbmRleCwgdmVydGV4SW5kZXgsIHV2ICk7XG5cblx0XHRcdFx0XHRpZiAoIGZhY2VVVnNbIGkgXSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRmYWNlVVZzWyBpIF0gPSBbXTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGZhY2VVVnNbIGkgXS5wdXNoKCBkYXRhWyAwIF0gKTtcblx0XHRcdFx0XHRmYWNlVVZzWyBpIF0ucHVzaCggZGF0YVsgMSBdICk7XG5cblx0XHRcdFx0fSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGZhY2VMZW5ndGggKys7XG5cblx0XHRcdGlmICggZW5kT2ZGYWNlICkge1xuXG5cdFx0XHRcdHNjb3BlLmdlbkZhY2UoIGJ1ZmZlcnMsIGdlb0luZm8sIGZhY2VQb3NpdGlvbkluZGV4ZXMsIG1hdGVyaWFsSW5kZXgsIGZhY2VOb3JtYWxzLCBmYWNlQ29sb3JzLCBmYWNlVVZzLCBmYWNlV2VpZ2h0cywgZmFjZVdlaWdodEluZGljZXMsIGZhY2VMZW5ndGggKTtcblxuXHRcdFx0XHRwb2x5Z29uSW5kZXggKys7XG5cdFx0XHRcdGZhY2VMZW5ndGggPSAwO1xuXG5cdFx0XHRcdC8vIHJlc2V0IGFycmF5cyBmb3IgdGhlIG5leHQgZmFjZVxuXHRcdFx0XHRmYWNlUG9zaXRpb25JbmRleGVzID0gW107XG5cdFx0XHRcdGZhY2VOb3JtYWxzID0gW107XG5cdFx0XHRcdGZhY2VDb2xvcnMgPSBbXTtcblx0XHRcdFx0ZmFjZVVWcyA9IFtdO1xuXHRcdFx0XHRmYWNlV2VpZ2h0cyA9IFtdO1xuXHRcdFx0XHRmYWNlV2VpZ2h0SW5kaWNlcyA9IFtdO1xuXG5cdFx0XHR9XG5cblx0XHR9ICk7XG5cblx0XHRyZXR1cm4gYnVmZmVycztcblxuXHR9XG5cblx0Ly8gR2VuZXJhdGUgZGF0YSBmb3IgYSBzaW5nbGUgZmFjZSBpbiBhIGdlb21ldHJ5LiBJZiB0aGUgZmFjZSBpcyBhIHF1YWQgdGhlbiBzcGxpdCBpdCBpbnRvIDIgdHJpc1xuXHRnZW5GYWNlKCBidWZmZXJzLCBnZW9JbmZvLCBmYWNlUG9zaXRpb25JbmRleGVzLCBtYXRlcmlhbEluZGV4LCBmYWNlTm9ybWFscywgZmFjZUNvbG9ycywgZmFjZVVWcywgZmFjZVdlaWdodHMsIGZhY2VXZWlnaHRJbmRpY2VzLCBmYWNlTGVuZ3RoICkge1xuXG5cdFx0Zm9yICggbGV0IGkgPSAyOyBpIDwgZmFjZUxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0YnVmZmVycy52ZXJ0ZXgucHVzaCggZ2VvSW5mby52ZXJ0ZXhQb3NpdGlvbnNbIGZhY2VQb3NpdGlvbkluZGV4ZXNbIDAgXSBdICk7XG5cdFx0XHRidWZmZXJzLnZlcnRleC5wdXNoKCBnZW9JbmZvLnZlcnRleFBvc2l0aW9uc1sgZmFjZVBvc2l0aW9uSW5kZXhlc1sgMSBdIF0gKTtcblx0XHRcdGJ1ZmZlcnMudmVydGV4LnB1c2goIGdlb0luZm8udmVydGV4UG9zaXRpb25zWyBmYWNlUG9zaXRpb25JbmRleGVzWyAyIF0gXSApO1xuXG5cdFx0XHRidWZmZXJzLnZlcnRleC5wdXNoKCBnZW9JbmZvLnZlcnRleFBvc2l0aW9uc1sgZmFjZVBvc2l0aW9uSW5kZXhlc1sgKCBpIC0gMSApICogMyBdIF0gKTtcblx0XHRcdGJ1ZmZlcnMudmVydGV4LnB1c2goIGdlb0luZm8udmVydGV4UG9zaXRpb25zWyBmYWNlUG9zaXRpb25JbmRleGVzWyAoIGkgLSAxICkgKiAzICsgMSBdIF0gKTtcblx0XHRcdGJ1ZmZlcnMudmVydGV4LnB1c2goIGdlb0luZm8udmVydGV4UG9zaXRpb25zWyBmYWNlUG9zaXRpb25JbmRleGVzWyAoIGkgLSAxICkgKiAzICsgMiBdIF0gKTtcblxuXHRcdFx0YnVmZmVycy52ZXJ0ZXgucHVzaCggZ2VvSW5mby52ZXJ0ZXhQb3NpdGlvbnNbIGZhY2VQb3NpdGlvbkluZGV4ZXNbIGkgKiAzIF0gXSApO1xuXHRcdFx0YnVmZmVycy52ZXJ0ZXgucHVzaCggZ2VvSW5mby52ZXJ0ZXhQb3NpdGlvbnNbIGZhY2VQb3NpdGlvbkluZGV4ZXNbIGkgKiAzICsgMSBdIF0gKTtcblx0XHRcdGJ1ZmZlcnMudmVydGV4LnB1c2goIGdlb0luZm8udmVydGV4UG9zaXRpb25zWyBmYWNlUG9zaXRpb25JbmRleGVzWyBpICogMyArIDIgXSBdICk7XG5cblx0XHRcdGlmICggZ2VvSW5mby5za2VsZXRvbiApIHtcblxuXHRcdFx0XHRidWZmZXJzLnZlcnRleFdlaWdodHMucHVzaCggZmFjZVdlaWdodHNbIDAgXSApO1xuXHRcdFx0XHRidWZmZXJzLnZlcnRleFdlaWdodHMucHVzaCggZmFjZVdlaWdodHNbIDEgXSApO1xuXHRcdFx0XHRidWZmZXJzLnZlcnRleFdlaWdodHMucHVzaCggZmFjZVdlaWdodHNbIDIgXSApO1xuXHRcdFx0XHRidWZmZXJzLnZlcnRleFdlaWdodHMucHVzaCggZmFjZVdlaWdodHNbIDMgXSApO1xuXG5cdFx0XHRcdGJ1ZmZlcnMudmVydGV4V2VpZ2h0cy5wdXNoKCBmYWNlV2VpZ2h0c1sgKCBpIC0gMSApICogNCBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMudmVydGV4V2VpZ2h0cy5wdXNoKCBmYWNlV2VpZ2h0c1sgKCBpIC0gMSApICogNCArIDEgXSApO1xuXHRcdFx0XHRidWZmZXJzLnZlcnRleFdlaWdodHMucHVzaCggZmFjZVdlaWdodHNbICggaSAtIDEgKSAqIDQgKyAyIF0gKTtcblx0XHRcdFx0YnVmZmVycy52ZXJ0ZXhXZWlnaHRzLnB1c2goIGZhY2VXZWlnaHRzWyAoIGkgLSAxICkgKiA0ICsgMyBdICk7XG5cblx0XHRcdFx0YnVmZmVycy52ZXJ0ZXhXZWlnaHRzLnB1c2goIGZhY2VXZWlnaHRzWyBpICogNCBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMudmVydGV4V2VpZ2h0cy5wdXNoKCBmYWNlV2VpZ2h0c1sgaSAqIDQgKyAxIF0gKTtcblx0XHRcdFx0YnVmZmVycy52ZXJ0ZXhXZWlnaHRzLnB1c2goIGZhY2VXZWlnaHRzWyBpICogNCArIDIgXSApO1xuXHRcdFx0XHRidWZmZXJzLnZlcnRleFdlaWdodHMucHVzaCggZmFjZVdlaWdodHNbIGkgKiA0ICsgMyBdICk7XG5cblx0XHRcdFx0YnVmZmVycy53ZWlnaHRzSW5kaWNlcy5wdXNoKCBmYWNlV2VpZ2h0SW5kaWNlc1sgMCBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMud2VpZ2h0c0luZGljZXMucHVzaCggZmFjZVdlaWdodEluZGljZXNbIDEgXSApO1xuXHRcdFx0XHRidWZmZXJzLndlaWdodHNJbmRpY2VzLnB1c2goIGZhY2VXZWlnaHRJbmRpY2VzWyAyIF0gKTtcblx0XHRcdFx0YnVmZmVycy53ZWlnaHRzSW5kaWNlcy5wdXNoKCBmYWNlV2VpZ2h0SW5kaWNlc1sgMyBdICk7XG5cblx0XHRcdFx0YnVmZmVycy53ZWlnaHRzSW5kaWNlcy5wdXNoKCBmYWNlV2VpZ2h0SW5kaWNlc1sgKCBpIC0gMSApICogNCBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMud2VpZ2h0c0luZGljZXMucHVzaCggZmFjZVdlaWdodEluZGljZXNbICggaSAtIDEgKSAqIDQgKyAxIF0gKTtcblx0XHRcdFx0YnVmZmVycy53ZWlnaHRzSW5kaWNlcy5wdXNoKCBmYWNlV2VpZ2h0SW5kaWNlc1sgKCBpIC0gMSApICogNCArIDIgXSApO1xuXHRcdFx0XHRidWZmZXJzLndlaWdodHNJbmRpY2VzLnB1c2goIGZhY2VXZWlnaHRJbmRpY2VzWyAoIGkgLSAxICkgKiA0ICsgMyBdICk7XG5cblx0XHRcdFx0YnVmZmVycy53ZWlnaHRzSW5kaWNlcy5wdXNoKCBmYWNlV2VpZ2h0SW5kaWNlc1sgaSAqIDQgXSApO1xuXHRcdFx0XHRidWZmZXJzLndlaWdodHNJbmRpY2VzLnB1c2goIGZhY2VXZWlnaHRJbmRpY2VzWyBpICogNCArIDEgXSApO1xuXHRcdFx0XHRidWZmZXJzLndlaWdodHNJbmRpY2VzLnB1c2goIGZhY2VXZWlnaHRJbmRpY2VzWyBpICogNCArIDIgXSApO1xuXHRcdFx0XHRidWZmZXJzLndlaWdodHNJbmRpY2VzLnB1c2goIGZhY2VXZWlnaHRJbmRpY2VzWyBpICogNCArIDMgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggZ2VvSW5mby5jb2xvciApIHtcblxuXHRcdFx0XHRidWZmZXJzLmNvbG9ycy5wdXNoKCBmYWNlQ29sb3JzWyAwIF0gKTtcblx0XHRcdFx0YnVmZmVycy5jb2xvcnMucHVzaCggZmFjZUNvbG9yc1sgMSBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMuY29sb3JzLnB1c2goIGZhY2VDb2xvcnNbIDIgXSApO1xuXG5cdFx0XHRcdGJ1ZmZlcnMuY29sb3JzLnB1c2goIGZhY2VDb2xvcnNbICggaSAtIDEgKSAqIDMgXSApO1xuXHRcdFx0XHRidWZmZXJzLmNvbG9ycy5wdXNoKCBmYWNlQ29sb3JzWyAoIGkgLSAxICkgKiAzICsgMSBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMuY29sb3JzLnB1c2goIGZhY2VDb2xvcnNbICggaSAtIDEgKSAqIDMgKyAyIF0gKTtcblxuXHRcdFx0XHRidWZmZXJzLmNvbG9ycy5wdXNoKCBmYWNlQ29sb3JzWyBpICogMyBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMuY29sb3JzLnB1c2goIGZhY2VDb2xvcnNbIGkgKiAzICsgMSBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMuY29sb3JzLnB1c2goIGZhY2VDb2xvcnNbIGkgKiAzICsgMiBdICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBnZW9JbmZvLm1hdGVyaWFsICYmIGdlb0luZm8ubWF0ZXJpYWwubWFwcGluZ1R5cGUgIT09ICdBbGxTYW1lJyApIHtcblxuXHRcdFx0XHRidWZmZXJzLm1hdGVyaWFsSW5kZXgucHVzaCggbWF0ZXJpYWxJbmRleCApO1xuXHRcdFx0XHRidWZmZXJzLm1hdGVyaWFsSW5kZXgucHVzaCggbWF0ZXJpYWxJbmRleCApO1xuXHRcdFx0XHRidWZmZXJzLm1hdGVyaWFsSW5kZXgucHVzaCggbWF0ZXJpYWxJbmRleCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggZ2VvSW5mby5ub3JtYWwgKSB7XG5cblx0XHRcdFx0YnVmZmVycy5ub3JtYWwucHVzaCggZmFjZU5vcm1hbHNbIDAgXSApO1xuXHRcdFx0XHRidWZmZXJzLm5vcm1hbC5wdXNoKCBmYWNlTm9ybWFsc1sgMSBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMubm9ybWFsLnB1c2goIGZhY2VOb3JtYWxzWyAyIF0gKTtcblxuXHRcdFx0XHRidWZmZXJzLm5vcm1hbC5wdXNoKCBmYWNlTm9ybWFsc1sgKCBpIC0gMSApICogMyBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMubm9ybWFsLnB1c2goIGZhY2VOb3JtYWxzWyAoIGkgLSAxICkgKiAzICsgMSBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMubm9ybWFsLnB1c2goIGZhY2VOb3JtYWxzWyAoIGkgLSAxICkgKiAzICsgMiBdICk7XG5cblx0XHRcdFx0YnVmZmVycy5ub3JtYWwucHVzaCggZmFjZU5vcm1hbHNbIGkgKiAzIF0gKTtcblx0XHRcdFx0YnVmZmVycy5ub3JtYWwucHVzaCggZmFjZU5vcm1hbHNbIGkgKiAzICsgMSBdICk7XG5cdFx0XHRcdGJ1ZmZlcnMubm9ybWFsLnB1c2goIGZhY2VOb3JtYWxzWyBpICogMyArIDIgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggZ2VvSW5mby51diApIHtcblxuXHRcdFx0XHRnZW9JbmZvLnV2LmZvckVhY2goIGZ1bmN0aW9uICggdXYsIGogKSB7XG5cblx0XHRcdFx0XHRpZiAoIGJ1ZmZlcnMudXZzWyBqIF0gPT09IHVuZGVmaW5lZCApIGJ1ZmZlcnMudXZzWyBqIF0gPSBbXTtcblxuXHRcdFx0XHRcdGJ1ZmZlcnMudXZzWyBqIF0ucHVzaCggZmFjZVVWc1sgaiBdWyAwIF0gKTtcblx0XHRcdFx0XHRidWZmZXJzLnV2c1sgaiBdLnB1c2goIGZhY2VVVnNbIGogXVsgMSBdICk7XG5cblx0XHRcdFx0XHRidWZmZXJzLnV2c1sgaiBdLnB1c2goIGZhY2VVVnNbIGogXVsgKCBpIC0gMSApICogMiBdICk7XG5cdFx0XHRcdFx0YnVmZmVycy51dnNbIGogXS5wdXNoKCBmYWNlVVZzWyBqIF1bICggaSAtIDEgKSAqIDIgKyAxIF0gKTtcblxuXHRcdFx0XHRcdGJ1ZmZlcnMudXZzWyBqIF0ucHVzaCggZmFjZVVWc1sgaiBdWyBpICogMiBdICk7XG5cdFx0XHRcdFx0YnVmZmVycy51dnNbIGogXS5wdXNoKCBmYWNlVVZzWyBqIF1bIGkgKiAyICsgMSBdICk7XG5cblx0XHRcdFx0fSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdGFkZE1vcnBoVGFyZ2V0cyggcGFyZW50R2VvLCBwYXJlbnRHZW9Ob2RlLCBtb3JwaFRhcmdldHMsIHByZVRyYW5zZm9ybSApIHtcblxuXHRcdGlmICggbW9ycGhUYXJnZXRzLmxlbmd0aCA9PT0gMCApIHJldHVybjtcblxuXHRcdHBhcmVudEdlby5tb3JwaFRhcmdldHNSZWxhdGl2ZSA9IHRydWU7XG5cblx0XHRwYXJlbnRHZW8ubW9ycGhBdHRyaWJ1dGVzLnBvc2l0aW9uID0gW107XG5cdFx0Ly8gcGFyZW50R2VvLm1vcnBoQXR0cmlidXRlcy5ub3JtYWwgPSBbXTsgLy8gbm90IGltcGxlbWVudGVkXG5cblx0XHRjb25zdCBzY29wZSA9IHRoaXM7XG5cdFx0bW9ycGhUYXJnZXRzLmZvckVhY2goIGZ1bmN0aW9uICggbW9ycGhUYXJnZXQgKSB7XG5cblx0XHRcdG1vcnBoVGFyZ2V0LnJhd1RhcmdldHMuZm9yRWFjaCggZnVuY3Rpb24gKCByYXdUYXJnZXQgKSB7XG5cblx0XHRcdFx0Y29uc3QgbW9ycGhHZW9Ob2RlID0gZmJ4VHJlZS5PYmplY3RzLkdlb21ldHJ5WyByYXdUYXJnZXQuZ2VvSUQgXTtcblxuXHRcdFx0XHRpZiAoIG1vcnBoR2VvTm9kZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0c2NvcGUuZ2VuTW9ycGhHZW9tZXRyeSggcGFyZW50R2VvLCBwYXJlbnRHZW9Ob2RlLCBtb3JwaEdlb05vZGUsIHByZVRyYW5zZm9ybSwgcmF3VGFyZ2V0Lm5hbWUgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0Ly8gYSBtb3JwaCBnZW9tZXRyeSBub2RlIGlzIHNpbWlsYXIgdG8gYSBzdGFuZGFyZCAgbm9kZSwgYW5kIHRoZSBub2RlIGlzIGFsc28gY29udGFpbmVkXG5cdC8vIGluIEZCWFRyZWUuT2JqZWN0cy5HZW9tZXRyeSwgaG93ZXZlciBpdCBjYW4gb25seSBoYXZlIGF0dHJpYnV0ZXMgZm9yIHBvc2l0aW9uLCBub3JtYWxcblx0Ly8gYW5kIGEgc3BlY2lhbCBhdHRyaWJ1dGUgSW5kZXggZGVmaW5pbmcgd2hpY2ggdmVydGljZXMgb2YgdGhlIG9yaWdpbmFsIGdlb21ldHJ5IGFyZSBhZmZlY3RlZFxuXHQvLyBOb3JtYWwgYW5kIHBvc2l0aW9uIGF0dHJpYnV0ZXMgb25seSBoYXZlIGRhdGEgZm9yIHRoZSB2ZXJ0aWNlcyB0aGF0IGFyZSBhZmZlY3RlZCBieSB0aGUgbW9ycGhcblx0Z2VuTW9ycGhHZW9tZXRyeSggcGFyZW50R2VvLCBwYXJlbnRHZW9Ob2RlLCBtb3JwaEdlb05vZGUsIHByZVRyYW5zZm9ybSwgbmFtZSApIHtcblxuXHRcdGNvbnN0IHZlcnRleEluZGljZXMgPSAoIHBhcmVudEdlb05vZGUuUG9seWdvblZlcnRleEluZGV4ICE9PSB1bmRlZmluZWQgKSA/IHBhcmVudEdlb05vZGUuUG9seWdvblZlcnRleEluZGV4LmEgOiBbXTtcblxuXHRcdGNvbnN0IG1vcnBoUG9zaXRpb25zU3BhcnNlID0gKCBtb3JwaEdlb05vZGUuVmVydGljZXMgIT09IHVuZGVmaW5lZCApID8gbW9ycGhHZW9Ob2RlLlZlcnRpY2VzLmEgOiBbXTtcblx0XHRjb25zdCBpbmRpY2VzID0gKCBtb3JwaEdlb05vZGUuSW5kZXhlcyAhPT0gdW5kZWZpbmVkICkgPyBtb3JwaEdlb05vZGUuSW5kZXhlcy5hIDogW107XG5cblx0XHRjb25zdCBsZW5ndGggPSBwYXJlbnRHZW8uYXR0cmlidXRlcy5wb3NpdGlvbi5jb3VudCAqIDM7XG5cdFx0Y29uc3QgbW9ycGhQb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCBtb3JwaEluZGV4ID0gaW5kaWNlc1sgaSBdICogMztcblxuXHRcdFx0bW9ycGhQb3NpdGlvbnNbIG1vcnBoSW5kZXggXSA9IG1vcnBoUG9zaXRpb25zU3BhcnNlWyBpICogMyBdO1xuXHRcdFx0bW9ycGhQb3NpdGlvbnNbIG1vcnBoSW5kZXggKyAxIF0gPSBtb3JwaFBvc2l0aW9uc1NwYXJzZVsgaSAqIDMgKyAxIF07XG5cdFx0XHRtb3JwaFBvc2l0aW9uc1sgbW9ycGhJbmRleCArIDIgXSA9IG1vcnBoUG9zaXRpb25zU3BhcnNlWyBpICogMyArIDIgXTtcblxuXHRcdH1cblxuXHRcdC8vIFRPRE86IGFkZCBtb3JwaCBub3JtYWwgc3VwcG9ydFxuXHRcdGNvbnN0IG1vcnBoR2VvSW5mbyA9IHtcblx0XHRcdHZlcnRleEluZGljZXM6IHZlcnRleEluZGljZXMsXG5cdFx0XHR2ZXJ0ZXhQb3NpdGlvbnM6IG1vcnBoUG9zaXRpb25zLFxuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG1vcnBoQnVmZmVycyA9IHRoaXMuZ2VuQnVmZmVycyggbW9ycGhHZW9JbmZvICk7XG5cblx0XHRjb25zdCBwb3NpdGlvbkF0dHJpYnV0ZSA9IG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlKCBtb3JwaEJ1ZmZlcnMudmVydGV4LCAzICk7XG5cdFx0cG9zaXRpb25BdHRyaWJ1dGUubmFtZSA9IG5hbWUgfHwgbW9ycGhHZW9Ob2RlLmF0dHJOYW1lO1xuXG5cdFx0cG9zaXRpb25BdHRyaWJ1dGUuYXBwbHlNYXRyaXg0KCBwcmVUcmFuc2Zvcm0gKTtcblxuXHRcdHBhcmVudEdlby5tb3JwaEF0dHJpYnV0ZXMucG9zaXRpb24ucHVzaCggcG9zaXRpb25BdHRyaWJ1dGUgKTtcblxuXHR9XG5cblx0Ly8gUGFyc2Ugbm9ybWFsIGZyb20gRkJYVHJlZS5PYmplY3RzLkdlb21ldHJ5LkxheWVyRWxlbWVudE5vcm1hbCBpZiBpdCBleGlzdHNcblx0cGFyc2VOb3JtYWxzKCBOb3JtYWxOb2RlICkge1xuXG5cdFx0Y29uc3QgbWFwcGluZ1R5cGUgPSBOb3JtYWxOb2RlLk1hcHBpbmdJbmZvcm1hdGlvblR5cGU7XG5cdFx0Y29uc3QgcmVmZXJlbmNlVHlwZSA9IE5vcm1hbE5vZGUuUmVmZXJlbmNlSW5mb3JtYXRpb25UeXBlO1xuXHRcdGNvbnN0IGJ1ZmZlciA9IE5vcm1hbE5vZGUuTm9ybWFscy5hO1xuXHRcdGxldCBpbmRleEJ1ZmZlciA9IFtdO1xuXHRcdGlmICggcmVmZXJlbmNlVHlwZSA9PT0gJ0luZGV4VG9EaXJlY3QnICkge1xuXG5cdFx0XHRpZiAoICdOb3JtYWxJbmRleCcgaW4gTm9ybWFsTm9kZSApIHtcblxuXHRcdFx0XHRpbmRleEJ1ZmZlciA9IE5vcm1hbE5vZGUuTm9ybWFsSW5kZXguYTtcblxuXHRcdFx0fSBlbHNlIGlmICggJ05vcm1hbHNJbmRleCcgaW4gTm9ybWFsTm9kZSApIHtcblxuXHRcdFx0XHRpbmRleEJ1ZmZlciA9IE5vcm1hbE5vZGUuTm9ybWFsc0luZGV4LmE7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRkYXRhU2l6ZTogMyxcblx0XHRcdGJ1ZmZlcjogYnVmZmVyLFxuXHRcdFx0aW5kaWNlczogaW5kZXhCdWZmZXIsXG5cdFx0XHRtYXBwaW5nVHlwZTogbWFwcGluZ1R5cGUsXG5cdFx0XHRyZWZlcmVuY2VUeXBlOiByZWZlcmVuY2VUeXBlXG5cdFx0fTtcblxuXHR9XG5cblx0Ly8gUGFyc2UgVVZzIGZyb20gRkJYVHJlZS5PYmplY3RzLkdlb21ldHJ5LkxheWVyRWxlbWVudFVWIGlmIGl0IGV4aXN0c1xuXHRwYXJzZVVWcyggVVZOb2RlICkge1xuXG5cdFx0Y29uc3QgbWFwcGluZ1R5cGUgPSBVVk5vZGUuTWFwcGluZ0luZm9ybWF0aW9uVHlwZTtcblx0XHRjb25zdCByZWZlcmVuY2VUeXBlID0gVVZOb2RlLlJlZmVyZW5jZUluZm9ybWF0aW9uVHlwZTtcblx0XHRjb25zdCBidWZmZXIgPSBVVk5vZGUuVVYuYTtcblx0XHRsZXQgaW5kZXhCdWZmZXIgPSBbXTtcblx0XHRpZiAoIHJlZmVyZW5jZVR5cGUgPT09ICdJbmRleFRvRGlyZWN0JyApIHtcblxuXHRcdFx0aW5kZXhCdWZmZXIgPSBVVk5vZGUuVVZJbmRleC5hO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRhdGFTaXplOiAyLFxuXHRcdFx0YnVmZmVyOiBidWZmZXIsXG5cdFx0XHRpbmRpY2VzOiBpbmRleEJ1ZmZlcixcblx0XHRcdG1hcHBpbmdUeXBlOiBtYXBwaW5nVHlwZSxcblx0XHRcdHJlZmVyZW5jZVR5cGU6IHJlZmVyZW5jZVR5cGVcblx0XHR9O1xuXG5cdH1cblxuXHQvLyBQYXJzZSBWZXJ0ZXggQ29sb3JzIGZyb20gRkJYVHJlZS5PYmplY3RzLkdlb21ldHJ5LkxheWVyRWxlbWVudENvbG9yIGlmIGl0IGV4aXN0c1xuXHRwYXJzZVZlcnRleENvbG9ycyggQ29sb3JOb2RlICkge1xuXG5cdFx0Y29uc3QgbWFwcGluZ1R5cGUgPSBDb2xvck5vZGUuTWFwcGluZ0luZm9ybWF0aW9uVHlwZTtcblx0XHRjb25zdCByZWZlcmVuY2VUeXBlID0gQ29sb3JOb2RlLlJlZmVyZW5jZUluZm9ybWF0aW9uVHlwZTtcblx0XHRjb25zdCBidWZmZXIgPSBDb2xvck5vZGUuQ29sb3JzLmE7XG5cdFx0bGV0IGluZGV4QnVmZmVyID0gW107XG5cdFx0aWYgKCByZWZlcmVuY2VUeXBlID09PSAnSW5kZXhUb0RpcmVjdCcgKSB7XG5cblx0XHRcdGluZGV4QnVmZmVyID0gQ29sb3JOb2RlLkNvbG9ySW5kZXguYTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRkYXRhU2l6ZTogNCxcblx0XHRcdGJ1ZmZlcjogYnVmZmVyLFxuXHRcdFx0aW5kaWNlczogaW5kZXhCdWZmZXIsXG5cdFx0XHRtYXBwaW5nVHlwZTogbWFwcGluZ1R5cGUsXG5cdFx0XHRyZWZlcmVuY2VUeXBlOiByZWZlcmVuY2VUeXBlXG5cdFx0fTtcblxuXHR9XG5cblx0Ly8gUGFyc2UgbWFwcGluZyBhbmQgbWF0ZXJpYWwgZGF0YSBpbiBGQlhUcmVlLk9iamVjdHMuR2VvbWV0cnkuTGF5ZXJFbGVtZW50TWF0ZXJpYWwgaWYgaXQgZXhpc3RzXG5cdHBhcnNlTWF0ZXJpYWxJbmRpY2VzKCBNYXRlcmlhbE5vZGUgKSB7XG5cblx0XHRjb25zdCBtYXBwaW5nVHlwZSA9IE1hdGVyaWFsTm9kZS5NYXBwaW5nSW5mb3JtYXRpb25UeXBlO1xuXHRcdGNvbnN0IHJlZmVyZW5jZVR5cGUgPSBNYXRlcmlhbE5vZGUuUmVmZXJlbmNlSW5mb3JtYXRpb25UeXBlO1xuXG5cdFx0aWYgKCBtYXBwaW5nVHlwZSA9PT0gJ05vTWFwcGluZ0luZm9ybWF0aW9uJyApIHtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZGF0YVNpemU6IDEsXG5cdFx0XHRcdGJ1ZmZlcjogWyAwIF0sXG5cdFx0XHRcdGluZGljZXM6IFsgMCBdLFxuXHRcdFx0XHRtYXBwaW5nVHlwZTogJ0FsbFNhbWUnLFxuXHRcdFx0XHRyZWZlcmVuY2VUeXBlOiByZWZlcmVuY2VUeXBlXG5cdFx0XHR9O1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgbWF0ZXJpYWxJbmRleEJ1ZmZlciA9IE1hdGVyaWFsTm9kZS5NYXRlcmlhbHMuYTtcblxuXHRcdC8vIFNpbmNlIG1hdGVyaWFscyBhcmUgc3RvcmVkIGFzIGluZGljZXMsIHRoZXJlJ3MgYSBiaXQgb2YgYSBtaXNtYXRjaCBiZXR3ZWVuIEZCWCBhbmQgd2hhdFxuXHRcdC8vIHdlIGV4cGVjdC5TbyB3ZSBjcmVhdGUgYW4gaW50ZXJtZWRpYXRlIGJ1ZmZlciB0aGF0IHBvaW50cyB0byB0aGUgaW5kZXggaW4gdGhlIGJ1ZmZlcixcblx0XHQvLyBmb3IgY29uZm9ybWluZyB3aXRoIHRoZSBvdGhlciBmdW5jdGlvbnMgd2UndmUgd3JpdHRlbiBmb3Igb3RoZXIgZGF0YS5cblx0XHRjb25zdCBtYXRlcmlhbEluZGljZXMgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IG1hdGVyaWFsSW5kZXhCdWZmZXIubGVuZ3RoOyArKyBpICkge1xuXG5cdFx0XHRtYXRlcmlhbEluZGljZXMucHVzaCggaSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRhdGFTaXplOiAxLFxuXHRcdFx0YnVmZmVyOiBtYXRlcmlhbEluZGV4QnVmZmVyLFxuXHRcdFx0aW5kaWNlczogbWF0ZXJpYWxJbmRpY2VzLFxuXHRcdFx0bWFwcGluZ1R5cGU6IG1hcHBpbmdUeXBlLFxuXHRcdFx0cmVmZXJlbmNlVHlwZTogcmVmZXJlbmNlVHlwZVxuXHRcdH07XG5cblx0fVxuXG5cdC8vIEdlbmVyYXRlIGEgTnVyYkdlb21ldHJ5IGZyb20gYSBub2RlIGluIEZCWFRyZWUuT2JqZWN0cy5HZW9tZXRyeVxuXHRwYXJzZU51cmJzR2VvbWV0cnkoIGdlb05vZGUgKSB7XG5cblx0XHRpZiAoIE5VUkJTQ3VydmUgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Y29uc29sZS5lcnJvciggJ1RIUkVFLkZCWExvYWRlcjogVGhlIGxvYWRlciByZWxpZXMgb24gTlVSQlNDdXJ2ZSBmb3IgYW55IG51cmJzIHByZXNlbnQgaW4gdGhlIG1vZGVsLiBOdXJicyB3aWxsIHNob3cgdXAgYXMgZW1wdHkgZ2VvbWV0cnkuJyApO1xuXHRcdFx0cmV0dXJuIG5ldyBCdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3Qgb3JkZXIgPSBwYXJzZUludCggZ2VvTm9kZS5PcmRlciApO1xuXG5cdFx0aWYgKCBpc05hTiggb3JkZXIgKSApIHtcblxuXHRcdFx0Y29uc29sZS5lcnJvciggJ1RIUkVFLkZCWExvYWRlcjogSW52YWxpZCBPcmRlciAlcyBnaXZlbiBmb3IgZ2VvbWV0cnkgSUQ6ICVzJywgZ2VvTm9kZS5PcmRlciwgZ2VvTm9kZS5pZCApO1xuXHRcdFx0cmV0dXJuIG5ldyBCdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgZGVncmVlID0gb3JkZXIgLSAxO1xuXG5cdFx0Y29uc3Qga25vdHMgPSBnZW9Ob2RlLktub3RWZWN0b3IuYTtcblx0XHRjb25zdCBjb250cm9sUG9pbnRzID0gW107XG5cdFx0Y29uc3QgcG9pbnRzVmFsdWVzID0gZ2VvTm9kZS5Qb2ludHMuYTtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgbCA9IHBvaW50c1ZhbHVlcy5sZW5ndGg7IGkgPCBsOyBpICs9IDQgKSB7XG5cblx0XHRcdGNvbnRyb2xQb2ludHMucHVzaCggbmV3IFZlY3RvcjQoKS5mcm9tQXJyYXkoIHBvaW50c1ZhbHVlcywgaSApICk7XG5cblx0XHR9XG5cblx0XHRsZXQgc3RhcnRLbm90LCBlbmRLbm90O1xuXG5cdFx0aWYgKCBnZW9Ob2RlLkZvcm0gPT09ICdDbG9zZWQnICkge1xuXG5cdFx0XHRjb250cm9sUG9pbnRzLnB1c2goIGNvbnRyb2xQb2ludHNbIDAgXSApO1xuXG5cdFx0fSBlbHNlIGlmICggZ2VvTm9kZS5Gb3JtID09PSAnUGVyaW9kaWMnICkge1xuXG5cdFx0XHRzdGFydEtub3QgPSBkZWdyZWU7XG5cdFx0XHRlbmRLbm90ID0ga25vdHMubGVuZ3RoIC0gMSAtIHN0YXJ0S25vdDtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgZGVncmVlOyArKyBpICkge1xuXG5cdFx0XHRcdGNvbnRyb2xQb2ludHMucHVzaCggY29udHJvbFBvaW50c1sgaSBdICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGNvbnN0IGN1cnZlID0gbmV3IE5VUkJTQ3VydmUoIGRlZ3JlZSwga25vdHMsIGNvbnRyb2xQb2ludHMsIHN0YXJ0S25vdCwgZW5kS25vdCApO1xuXHRcdGNvbnN0IHBvaW50cyA9IGN1cnZlLmdldFBvaW50cyggY29udHJvbFBvaW50cy5sZW5ndGggKiAxMiApO1xuXG5cdFx0cmV0dXJuIG5ldyBCdWZmZXJHZW9tZXRyeSgpLnNldEZyb21Qb2ludHMoIHBvaW50cyApO1xuXG5cdH1cblxufVxuXG4vLyBwYXJzZSBhbmltYXRpb24gZGF0YSBmcm9tIEZCWFRyZWVcbmNsYXNzIEFuaW1hdGlvblBhcnNlciB7XG5cblx0Ly8gdGFrZSByYXcgYW5pbWF0aW9uIGNsaXBzIGFuZCB0dXJuIHRoZW0gaW50byB0aHJlZS5qcyBhbmltYXRpb24gY2xpcHNcblx0cGFyc2UoKSB7XG5cblx0XHRjb25zdCBhbmltYXRpb25DbGlwcyA9IFtdO1xuXG5cdFx0Y29uc3QgcmF3Q2xpcHMgPSB0aGlzLnBhcnNlQ2xpcHMoKTtcblxuXHRcdGlmICggcmF3Q2xpcHMgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Zm9yICggY29uc3Qga2V5IGluIHJhd0NsaXBzICkge1xuXG5cdFx0XHRcdGNvbnN0IHJhd0NsaXAgPSByYXdDbGlwc1sga2V5IF07XG5cblx0XHRcdFx0Y29uc3QgY2xpcCA9IHRoaXMuYWRkQ2xpcCggcmF3Q2xpcCApO1xuXG5cdFx0XHRcdGFuaW1hdGlvbkNsaXBzLnB1c2goIGNsaXAgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFuaW1hdGlvbkNsaXBzO1xuXG5cdH1cblxuXHRwYXJzZUNsaXBzKCkge1xuXG5cdFx0Ly8gc2luY2UgdGhlIGFjdHVhbCB0cmFuc2Zvcm1hdGlvbiBkYXRhIGlzIHN0b3JlZCBpbiBGQlhUcmVlLk9iamVjdHMuQW5pbWF0aW9uQ3VydmUsXG5cdFx0Ly8gaWYgdGhpcyBpcyB1bmRlZmluZWQgd2UgY2FuIHNhZmVseSBhc3N1bWUgdGhlcmUgYXJlIG5vIGFuaW1hdGlvbnNcblx0XHRpZiAoIGZieFRyZWUuT2JqZWN0cy5BbmltYXRpb25DdXJ2ZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGNvbnN0IGN1cnZlTm9kZXNNYXAgPSB0aGlzLnBhcnNlQW5pbWF0aW9uQ3VydmVOb2RlcygpO1xuXG5cdFx0dGhpcy5wYXJzZUFuaW1hdGlvbkN1cnZlcyggY3VydmVOb2Rlc01hcCApO1xuXG5cdFx0Y29uc3QgbGF5ZXJzTWFwID0gdGhpcy5wYXJzZUFuaW1hdGlvbkxheWVycyggY3VydmVOb2Rlc01hcCApO1xuXHRcdGNvbnN0IHJhd0NsaXBzID0gdGhpcy5wYXJzZUFuaW1TdGFja3MoIGxheWVyc01hcCApO1xuXG5cdFx0cmV0dXJuIHJhd0NsaXBzO1xuXG5cdH1cblxuXHQvLyBwYXJzZSBub2RlcyBpbiBGQlhUcmVlLk9iamVjdHMuQW5pbWF0aW9uQ3VydmVOb2RlXG5cdC8vIGVhY2ggQW5pbWF0aW9uQ3VydmVOb2RlIGhvbGRzIGRhdGEgZm9yIGFuIGFuaW1hdGlvbiB0cmFuc2Zvcm0gZm9yIGEgbW9kZWwgKGUuZy4gbGVmdCBhcm0gcm90YXRpb24gKVxuXHQvLyBhbmQgaXMgcmVmZXJlbmNlZCBieSBhbiBBbmltYXRpb25MYXllclxuXHRwYXJzZUFuaW1hdGlvbkN1cnZlTm9kZXMoKSB7XG5cblx0XHRjb25zdCByYXdDdXJ2ZU5vZGVzID0gZmJ4VHJlZS5PYmplY3RzLkFuaW1hdGlvbkN1cnZlTm9kZTtcblxuXHRcdGNvbnN0IGN1cnZlTm9kZXNNYXAgPSBuZXcgTWFwKCk7XG5cblx0XHRmb3IgKCBjb25zdCBub2RlSUQgaW4gcmF3Q3VydmVOb2RlcyApIHtcblxuXHRcdFx0Y29uc3QgcmF3Q3VydmVOb2RlID0gcmF3Q3VydmVOb2Rlc1sgbm9kZUlEIF07XG5cblx0XHRcdGlmICggcmF3Q3VydmVOb2RlLmF0dHJOYW1lLm1hdGNoKCAvU3xSfFR8RGVmb3JtUGVyY2VudC8gKSAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRjb25zdCBjdXJ2ZU5vZGUgPSB7XG5cblx0XHRcdFx0XHRpZDogcmF3Q3VydmVOb2RlLmlkLFxuXHRcdFx0XHRcdGF0dHI6IHJhd0N1cnZlTm9kZS5hdHRyTmFtZSxcblx0XHRcdFx0XHRjdXJ2ZXM6IHt9LFxuXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y3VydmVOb2Rlc01hcC5zZXQoIGN1cnZlTm9kZS5pZCwgY3VydmVOb2RlICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiBjdXJ2ZU5vZGVzTWFwO1xuXG5cdH1cblxuXHQvLyBwYXJzZSBub2RlcyBpbiBGQlhUcmVlLk9iamVjdHMuQW5pbWF0aW9uQ3VydmUgYW5kIGNvbm5lY3QgdGhlbSB1cCB0b1xuXHQvLyBwcmV2aW91c2x5IHBhcnNlZCBBbmltYXRpb25DdXJ2ZU5vZGVzLiBFYWNoIEFuaW1hdGlvbkN1cnZlIGhvbGRzIGRhdGEgZm9yIGEgc2luZ2xlIGFuaW1hdGVkXG5cdC8vIGF4aXMgKCBlLmcuIHRpbWVzIGFuZCB2YWx1ZXMgb2YgeCByb3RhdGlvbilcblx0cGFyc2VBbmltYXRpb25DdXJ2ZXMoIGN1cnZlTm9kZXNNYXAgKSB7XG5cblx0XHRjb25zdCByYXdDdXJ2ZXMgPSBmYnhUcmVlLk9iamVjdHMuQW5pbWF0aW9uQ3VydmU7XG5cblx0XHQvLyBUT0RPOiBNYW55IHZhbHVlcyBhcmUgaWRlbnRpY2FsIHVwIHRvIHJvdW5kb2ZmIGVycm9yLCBidXQgd29uJ3QgYmUgb3B0aW1pc2VkXG5cdFx0Ly8gZS5nLiBwb3NpdGlvbiB0aW1lczogWzAsIDAuNCwgMC4gOF1cblx0XHQvLyBwb3NpdGlvbiB2YWx1ZXM6IFs3LjIzNTM4MzM1MDIzNDc3ZS03LCA5My42NzUxODYxNTcyMjY1NiwgLTAuOTk4MjY5NTU3OTUyODgwOSwgNy4yMzUzODMzNTAyMzQ3N2UtNywgOTMuNjc1MTg2MTU3MjI2NTYsIC0wLjk5ODI2OTU1Nzk1Mjg4MDksIDcuMjM1Mzg0NDg3MTAzMTQ3ZS03LCA5My42NzUyMDkwNDU0MTAxNiwgLTAuOTk4MjY5NTU3OTUyODgwOV1cblx0XHQvLyBjbGVhcmx5LCB0aGlzIHNob3VsZCBiZSBvcHRpbWlzZWQgdG9cblx0XHQvLyB0aW1lczogWzBdLCBwb3NpdGlvbnMgWzcuMjM1MzgzMzUwMjM0NzdlLTcsIDkzLjY3NTE4NjE1NzIyNjU2LCAtMC45OTgyNjk1NTc5NTI4ODA5XVxuXHRcdC8vIHRoaXMgc2hvd3MgdXAgaW4gbmVhcmx5IGV2ZXJ5IEZCWCBmaWxlLCBhbmQgZ2VuZXJhbGx5IHRpbWUgYXJyYXkgaXMgbGVuZ3RoID4gMTAwXG5cblx0XHRmb3IgKCBjb25zdCBub2RlSUQgaW4gcmF3Q3VydmVzICkge1xuXG5cdFx0XHRjb25zdCBhbmltYXRpb25DdXJ2ZSA9IHtcblxuXHRcdFx0XHRpZDogcmF3Q3VydmVzWyBub2RlSUQgXS5pZCxcblx0XHRcdFx0dGltZXM6IHJhd0N1cnZlc1sgbm9kZUlEIF0uS2V5VGltZS5hLm1hcCggY29udmVydEZCWFRpbWVUb1NlY29uZHMgKSxcblx0XHRcdFx0dmFsdWVzOiByYXdDdXJ2ZXNbIG5vZGVJRCBdLktleVZhbHVlRmxvYXQuYSxcblxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3QgcmVsYXRpb25zaGlwcyA9IGNvbm5lY3Rpb25zLmdldCggYW5pbWF0aW9uQ3VydmUuaWQgKTtcblxuXHRcdFx0aWYgKCByZWxhdGlvbnNoaXBzICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0Y29uc3QgYW5pbWF0aW9uQ3VydmVJRCA9IHJlbGF0aW9uc2hpcHMucGFyZW50c1sgMCBdLklEO1xuXHRcdFx0XHRjb25zdCBhbmltYXRpb25DdXJ2ZVJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcHMucGFyZW50c1sgMCBdLnJlbGF0aW9uc2hpcDtcblxuXHRcdFx0XHRpZiAoIGFuaW1hdGlvbkN1cnZlUmVsYXRpb25zaGlwLm1hdGNoKCAvWC8gKSApIHtcblxuXHRcdFx0XHRcdGN1cnZlTm9kZXNNYXAuZ2V0KCBhbmltYXRpb25DdXJ2ZUlEICkuY3VydmVzWyAneCcgXSA9IGFuaW1hdGlvbkN1cnZlO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGFuaW1hdGlvbkN1cnZlUmVsYXRpb25zaGlwLm1hdGNoKCAvWS8gKSApIHtcblxuXHRcdFx0XHRcdGN1cnZlTm9kZXNNYXAuZ2V0KCBhbmltYXRpb25DdXJ2ZUlEICkuY3VydmVzWyAneScgXSA9IGFuaW1hdGlvbkN1cnZlO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGFuaW1hdGlvbkN1cnZlUmVsYXRpb25zaGlwLm1hdGNoKCAvWi8gKSApIHtcblxuXHRcdFx0XHRcdGN1cnZlTm9kZXNNYXAuZ2V0KCBhbmltYXRpb25DdXJ2ZUlEICkuY3VydmVzWyAneicgXSA9IGFuaW1hdGlvbkN1cnZlO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGFuaW1hdGlvbkN1cnZlUmVsYXRpb25zaGlwLm1hdGNoKCAvZHxEZWZvcm1QZXJjZW50LyApICYmIGN1cnZlTm9kZXNNYXAuaGFzKCBhbmltYXRpb25DdXJ2ZUlEICkgKSB7XG5cblx0XHRcdFx0XHRjdXJ2ZU5vZGVzTWFwLmdldCggYW5pbWF0aW9uQ3VydmVJRCApLmN1cnZlc1sgJ21vcnBoJyBdID0gYW5pbWF0aW9uQ3VydmU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdC8vIHBhcnNlIG5vZGVzIGluIEZCWFRyZWUuT2JqZWN0cy5BbmltYXRpb25MYXllci4gRWFjaCBsYXllcnMgaG9sZHMgcmVmZXJlbmNlc1xuXHQvLyB0byB2YXJpb3VzIEFuaW1hdGlvbkN1cnZlTm9kZXMgYW5kIGlzIHJlZmVyZW5jZWQgYnkgYW4gQW5pbWF0aW9uU3RhY2sgbm9kZVxuXHQvLyBub3RlOiB0aGVvcmV0aWNhbGx5IGEgc3RhY2sgY2FuIGhhdmUgbXVsdGlwbGUgbGF5ZXJzLCBob3dldmVyIGluIHByYWN0aWNlIHRoZXJlIGFsd2F5cyBzZWVtcyB0byBiZSBvbmUgcGVyIHN0YWNrXG5cdHBhcnNlQW5pbWF0aW9uTGF5ZXJzKCBjdXJ2ZU5vZGVzTWFwICkge1xuXG5cdFx0Y29uc3QgcmF3TGF5ZXJzID0gZmJ4VHJlZS5PYmplY3RzLkFuaW1hdGlvbkxheWVyO1xuXG5cdFx0Y29uc3QgbGF5ZXJzTWFwID0gbmV3IE1hcCgpO1xuXG5cdFx0Zm9yICggY29uc3Qgbm9kZUlEIGluIHJhd0xheWVycyApIHtcblxuXHRcdFx0Y29uc3QgbGF5ZXJDdXJ2ZU5vZGVzID0gW107XG5cblx0XHRcdGNvbnN0IGNvbm5lY3Rpb24gPSBjb25uZWN0aW9ucy5nZXQoIHBhcnNlSW50KCBub2RlSUQgKSApO1xuXG5cdFx0XHRpZiAoIGNvbm5lY3Rpb24gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHQvLyBhbGwgdGhlIGFuaW1hdGlvbkN1cnZlTm9kZXMgdXNlZCBpbiB0aGUgbGF5ZXJcblx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBjb25uZWN0aW9uLmNoaWxkcmVuO1xuXG5cdFx0XHRcdGNoaWxkcmVuLmZvckVhY2goIGZ1bmN0aW9uICggY2hpbGQsIGkgKSB7XG5cblx0XHRcdFx0XHRpZiAoIGN1cnZlTm9kZXNNYXAuaGFzKCBjaGlsZC5JRCApICkge1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjdXJ2ZU5vZGUgPSBjdXJ2ZU5vZGVzTWFwLmdldCggY2hpbGQuSUQgKTtcblxuXHRcdFx0XHRcdFx0Ly8gY2hlY2sgdGhhdCB0aGUgY3VydmVzIGFyZSBkZWZpbmVkIGZvciBhdCBsZWFzdCBvbmUgYXhpcywgb3RoZXJ3aXNlIGlnbm9yZSB0aGUgY3VydmVOb2RlXG5cdFx0XHRcdFx0XHRpZiAoIGN1cnZlTm9kZS5jdXJ2ZXMueCAhPT0gdW5kZWZpbmVkIHx8IGN1cnZlTm9kZS5jdXJ2ZXMueSAhPT0gdW5kZWZpbmVkIHx8IGN1cnZlTm9kZS5jdXJ2ZXMueiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRcdGlmICggbGF5ZXJDdXJ2ZU5vZGVzWyBpIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG1vZGVsSUQgPSBjb25uZWN0aW9ucy5nZXQoIGNoaWxkLklEICkucGFyZW50cy5maWx0ZXIoIGZ1bmN0aW9uICggcGFyZW50ICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyZW50LnJlbGF0aW9uc2hpcCAhPT0gdW5kZWZpbmVkO1xuXG5cdFx0XHRcdFx0XHRcdFx0fSApWyAwIF0uSUQ7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoIG1vZGVsSUQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmF3TW9kZWwgPSBmYnhUcmVlLk9iamVjdHMuTW9kZWxbIG1vZGVsSUQudG9TdHJpbmcoKSBdO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIHJhd01vZGVsID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuRkJYTG9hZGVyOiBFbmNvdW50ZXJlZCBhIHVudXNlZCBjdXJ2ZS4nLCBjaGlsZCApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgbm9kZSA9IHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtb2RlbE5hbWU6IHJhd01vZGVsLmF0dHJOYW1lID8gUHJvcGVydHlCaW5kaW5nLnNhbml0aXplTm9kZU5hbWUoIHJhd01vZGVsLmF0dHJOYW1lICkgOiAnJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0SUQ6IHJhd01vZGVsLmlkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbml0aWFsUG9zaXRpb246IFsgMCwgMCwgMCBdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbml0aWFsUm90YXRpb246IFsgMCwgMCwgMCBdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbml0aWFsU2NhbGU6IFsgMSwgMSwgMSBdLFxuXG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRzY2VuZUdyYXBoLnRyYXZlcnNlKCBmdW5jdGlvbiAoIGNoaWxkICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICggY2hpbGQuSUQgPT09IHJhd01vZGVsLmlkICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bm9kZS50cmFuc2Zvcm0gPSBjaGlsZC5tYXRyaXg7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIGNoaWxkLnVzZXJEYXRhLnRyYW5zZm9ybURhdGEgKSBub2RlLmV1bGVyT3JkZXIgPSBjaGlsZC51c2VyRGF0YS50cmFuc2Zvcm1EYXRhLmV1bGVyT3JkZXI7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICggISBub2RlLnRyYW5zZm9ybSApIG5vZGUudHJhbnNmb3JtID0gbmV3IE1hdHJpeDQoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gaWYgdGhlIGFuaW1hdGVkIG1vZGVsIGlzIHByZSByb3RhdGVkLCB3ZSdsbCBoYXZlIHRvIGFwcGx5IHRoZSBwcmUgcm90YXRpb25zIHRvIGV2ZXJ5XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBhbmltYXRpb24gdmFsdWUgYXMgd2VsbFxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCAnUHJlUm90YXRpb24nIGluIHJhd01vZGVsICkgbm9kZS5wcmVSb3RhdGlvbiA9IHJhd01vZGVsLlByZVJvdGF0aW9uLnZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCAnUG9zdFJvdGF0aW9uJyBpbiByYXdNb2RlbCApIG5vZGUucG9zdFJvdGF0aW9uID0gcmF3TW9kZWwuUG9zdFJvdGF0aW9uLnZhbHVlO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsYXllckN1cnZlTm9kZXNbIGkgXSA9IG5vZGU7XG5cblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICggbGF5ZXJDdXJ2ZU5vZGVzWyBpIF0gKSBsYXllckN1cnZlTm9kZXNbIGkgXVsgY3VydmVOb2RlLmF0dHIgXSA9IGN1cnZlTm9kZTtcblxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICggY3VydmVOb2RlLmN1cnZlcy5tb3JwaCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRcdGlmICggbGF5ZXJDdXJ2ZU5vZGVzWyBpIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRlZm9ybWVySUQgPSBjb25uZWN0aW9ucy5nZXQoIGNoaWxkLklEICkucGFyZW50cy5maWx0ZXIoIGZ1bmN0aW9uICggcGFyZW50ICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyZW50LnJlbGF0aW9uc2hpcCAhPT0gdW5kZWZpbmVkO1xuXG5cdFx0XHRcdFx0XHRcdFx0fSApWyAwIF0uSUQ7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zdCBtb3JwaGVySUQgPSBjb25uZWN0aW9ucy5nZXQoIGRlZm9ybWVySUQgKS5wYXJlbnRzWyAwIF0uSUQ7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgZ2VvSUQgPSBjb25uZWN0aW9ucy5nZXQoIG1vcnBoZXJJRCApLnBhcmVudHNbIDAgXS5JRDtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIGFzc3VtaW5nIGdlb21ldHJ5IGlzIG5vdCB1c2VkIGluIG1vcmUgdGhhbiBvbmUgbW9kZWxcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBtb2RlbElEID0gY29ubmVjdGlvbnMuZ2V0KCBnZW9JRCApLnBhcmVudHNbIDAgXS5JRDtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJhd01vZGVsID0gZmJ4VHJlZS5PYmplY3RzLk1vZGVsWyBtb2RlbElEIF07XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zdCBub2RlID0ge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRtb2RlbE5hbWU6IHJhd01vZGVsLmF0dHJOYW1lID8gUHJvcGVydHlCaW5kaW5nLnNhbml0aXplTm9kZU5hbWUoIHJhd01vZGVsLmF0dHJOYW1lICkgOiAnJyxcblx0XHRcdFx0XHRcdFx0XHRcdG1vcnBoTmFtZTogZmJ4VHJlZS5PYmplY3RzLkRlZm9ybWVyWyBkZWZvcm1lcklEIF0uYXR0ck5hbWUsXG5cblx0XHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdFx0bGF5ZXJDdXJ2ZU5vZGVzWyBpIF0gPSBub2RlO1xuXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsYXllckN1cnZlTm9kZXNbIGkgXVsgY3VydmVOb2RlLmF0dHIgXSA9IGN1cnZlTm9kZTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRsYXllcnNNYXAuc2V0KCBwYXJzZUludCggbm9kZUlEICksIGxheWVyQ3VydmVOb2RlcyApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gbGF5ZXJzTWFwO1xuXG5cdH1cblxuXHQvLyBwYXJzZSBub2RlcyBpbiBGQlhUcmVlLk9iamVjdHMuQW5pbWF0aW9uU3RhY2suIFRoZXNlIGFyZSB0aGUgdG9wIGxldmVsIG5vZGUgaW4gdGhlIGFuaW1hdGlvblxuXHQvLyBoaWVyYXJjaHkuIEVhY2ggU3RhY2sgbm9kZSB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIGEgQW5pbWF0aW9uQ2xpcFxuXHRwYXJzZUFuaW1TdGFja3MoIGxheWVyc01hcCApIHtcblxuXHRcdGNvbnN0IHJhd1N0YWNrcyA9IGZieFRyZWUuT2JqZWN0cy5BbmltYXRpb25TdGFjaztcblxuXHRcdC8vIGNvbm5lY3QgdGhlIHN0YWNrcyAoY2xpcHMpIHVwIHRvIHRoZSBsYXllcnNcblx0XHRjb25zdCByYXdDbGlwcyA9IHt9O1xuXG5cdFx0Zm9yICggY29uc3Qgbm9kZUlEIGluIHJhd1N0YWNrcyApIHtcblxuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBjb25uZWN0aW9ucy5nZXQoIHBhcnNlSW50KCBub2RlSUQgKSApLmNoaWxkcmVuO1xuXG5cdFx0XHRpZiAoIGNoaWxkcmVuLmxlbmd0aCA+IDEgKSB7XG5cblx0XHRcdFx0Ly8gaXQgc2VlbXMgbGlrZSBzdGFja3Mgd2lsbCBhbHdheXMgYmUgYXNzb2NpYXRlZCB3aXRoIGEgc2luZ2xlIGxheWVyLiBCdXQganVzdCBpbiBjYXNlIHRoZXJlIGFyZSBmaWxlc1xuXHRcdFx0XHQvLyB3aGVyZSB0aGVyZSBhcmUgbXVsdGlwbGUgbGF5ZXJzIHBlciBzdGFjaywgd2UnbGwgZGlzcGxheSBhIHdhcm5pbmdcblx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuRkJYTG9hZGVyOiBFbmNvdW50ZXJlZCBhbiBhbmltYXRpb24gc3RhY2sgd2l0aCBtdWx0aXBsZSBsYXllcnMsIHRoaXMgaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQuIElnbm9yaW5nIHN1YnNlcXVlbnQgbGF5ZXJzLicgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBsYXllciA9IGxheWVyc01hcC5nZXQoIGNoaWxkcmVuWyAwIF0uSUQgKTtcblxuXHRcdFx0cmF3Q2xpcHNbIG5vZGVJRCBdID0ge1xuXG5cdFx0XHRcdG5hbWU6IHJhd1N0YWNrc1sgbm9kZUlEIF0uYXR0ck5hbWUsXG5cdFx0XHRcdGxheWVyOiBsYXllcixcblxuXHRcdFx0fTtcblxuXHRcdH1cblxuXHRcdHJldHVybiByYXdDbGlwcztcblxuXHR9XG5cblx0YWRkQ2xpcCggcmF3Q2xpcCApIHtcblxuXHRcdGxldCB0cmFja3MgPSBbXTtcblxuXHRcdGNvbnN0IHNjb3BlID0gdGhpcztcblx0XHRyYXdDbGlwLmxheWVyLmZvckVhY2goIGZ1bmN0aW9uICggcmF3VHJhY2tzICkge1xuXG5cdFx0XHR0cmFja3MgPSB0cmFja3MuY29uY2F0KCBzY29wZS5nZW5lcmF0ZVRyYWNrcyggcmF3VHJhY2tzICkgKTtcblxuXHRcdH0gKTtcblxuXHRcdHJldHVybiBuZXcgQW5pbWF0aW9uQ2xpcCggcmF3Q2xpcC5uYW1lLCAtIDEsIHRyYWNrcyApO1xuXG5cdH1cblxuXHRnZW5lcmF0ZVRyYWNrcyggcmF3VHJhY2tzICkge1xuXG5cdFx0Y29uc3QgdHJhY2tzID0gW107XG5cblx0XHRsZXQgaW5pdGlhbFBvc2l0aW9uID0gbmV3IFZlY3RvcjMoKTtcblx0XHRsZXQgaW5pdGlhbFJvdGF0aW9uID0gbmV3IFF1YXRlcm5pb24oKTtcblx0XHRsZXQgaW5pdGlhbFNjYWxlID0gbmV3IFZlY3RvcjMoKTtcblxuXHRcdGlmICggcmF3VHJhY2tzLnRyYW5zZm9ybSApIHJhd1RyYWNrcy50cmFuc2Zvcm0uZGVjb21wb3NlKCBpbml0aWFsUG9zaXRpb24sIGluaXRpYWxSb3RhdGlvbiwgaW5pdGlhbFNjYWxlICk7XG5cblx0XHRpbml0aWFsUG9zaXRpb24gPSBpbml0aWFsUG9zaXRpb24udG9BcnJheSgpO1xuXHRcdGluaXRpYWxSb3RhdGlvbiA9IG5ldyBFdWxlcigpLnNldEZyb21RdWF0ZXJuaW9uKCBpbml0aWFsUm90YXRpb24sIHJhd1RyYWNrcy5ldWxlck9yZGVyICkudG9BcnJheSgpO1xuXHRcdGluaXRpYWxTY2FsZSA9IGluaXRpYWxTY2FsZS50b0FycmF5KCk7XG5cblx0XHRpZiAoIHJhd1RyYWNrcy5UICE9PSB1bmRlZmluZWQgJiYgT2JqZWN0LmtleXMoIHJhd1RyYWNrcy5ULmN1cnZlcyApLmxlbmd0aCA+IDAgKSB7XG5cblx0XHRcdGNvbnN0IHBvc2l0aW9uVHJhY2sgPSB0aGlzLmdlbmVyYXRlVmVjdG9yVHJhY2soIHJhd1RyYWNrcy5tb2RlbE5hbWUsIHJhd1RyYWNrcy5ULmN1cnZlcywgaW5pdGlhbFBvc2l0aW9uLCAncG9zaXRpb24nICk7XG5cdFx0XHRpZiAoIHBvc2l0aW9uVHJhY2sgIT09IHVuZGVmaW5lZCApIHRyYWNrcy5wdXNoKCBwb3NpdGlvblRyYWNrICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHJhd1RyYWNrcy5SICE9PSB1bmRlZmluZWQgJiYgT2JqZWN0LmtleXMoIHJhd1RyYWNrcy5SLmN1cnZlcyApLmxlbmd0aCA+IDAgKSB7XG5cblx0XHRcdGNvbnN0IHJvdGF0aW9uVHJhY2sgPSB0aGlzLmdlbmVyYXRlUm90YXRpb25UcmFjayggcmF3VHJhY2tzLm1vZGVsTmFtZSwgcmF3VHJhY2tzLlIuY3VydmVzLCBpbml0aWFsUm90YXRpb24sIHJhd1RyYWNrcy5wcmVSb3RhdGlvbiwgcmF3VHJhY2tzLnBvc3RSb3RhdGlvbiwgcmF3VHJhY2tzLmV1bGVyT3JkZXIgKTtcblx0XHRcdGlmICggcm90YXRpb25UcmFjayAhPT0gdW5kZWZpbmVkICkgdHJhY2tzLnB1c2goIHJvdGF0aW9uVHJhY2sgKTtcblxuXHRcdH1cblxuXHRcdGlmICggcmF3VHJhY2tzLlMgIT09IHVuZGVmaW5lZCAmJiBPYmplY3Qua2V5cyggcmF3VHJhY2tzLlMuY3VydmVzICkubGVuZ3RoID4gMCApIHtcblxuXHRcdFx0Y29uc3Qgc2NhbGVUcmFjayA9IHRoaXMuZ2VuZXJhdGVWZWN0b3JUcmFjayggcmF3VHJhY2tzLm1vZGVsTmFtZSwgcmF3VHJhY2tzLlMuY3VydmVzLCBpbml0aWFsU2NhbGUsICdzY2FsZScgKTtcblx0XHRcdGlmICggc2NhbGVUcmFjayAhPT0gdW5kZWZpbmVkICkgdHJhY2tzLnB1c2goIHNjYWxlVHJhY2sgKTtcblxuXHRcdH1cblxuXHRcdGlmICggcmF3VHJhY2tzLkRlZm9ybVBlcmNlbnQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Y29uc3QgbW9ycGhUcmFjayA9IHRoaXMuZ2VuZXJhdGVNb3JwaFRyYWNrKCByYXdUcmFja3MgKTtcblx0XHRcdGlmICggbW9ycGhUcmFjayAhPT0gdW5kZWZpbmVkICkgdHJhY2tzLnB1c2goIG1vcnBoVHJhY2sgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0cmFja3M7XG5cblx0fVxuXG5cdGdlbmVyYXRlVmVjdG9yVHJhY2soIG1vZGVsTmFtZSwgY3VydmVzLCBpbml0aWFsVmFsdWUsIHR5cGUgKSB7XG5cblx0XHRjb25zdCB0aW1lcyA9IHRoaXMuZ2V0VGltZXNGb3JBbGxBeGVzKCBjdXJ2ZXMgKTtcblx0XHRjb25zdCB2YWx1ZXMgPSB0aGlzLmdldEtleWZyYW1lVHJhY2tWYWx1ZXMoIHRpbWVzLCBjdXJ2ZXMsIGluaXRpYWxWYWx1ZSApO1xuXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3JLZXlmcmFtZVRyYWNrKCBtb2RlbE5hbWUgKyAnLicgKyB0eXBlLCB0aW1lcywgdmFsdWVzICk7XG5cblx0fVxuXG5cdGdlbmVyYXRlUm90YXRpb25UcmFjayggbW9kZWxOYW1lLCBjdXJ2ZXMsIGluaXRpYWxWYWx1ZSwgcHJlUm90YXRpb24sIHBvc3RSb3RhdGlvbiwgZXVsZXJPcmRlciApIHtcblxuXHRcdGlmICggY3VydmVzLnggIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGhpcy5pbnRlcnBvbGF0ZVJvdGF0aW9ucyggY3VydmVzLnggKTtcblx0XHRcdGN1cnZlcy54LnZhbHVlcyA9IGN1cnZlcy54LnZhbHVlcy5tYXAoIE1hdGhVdGlscy5kZWdUb1JhZCApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBjdXJ2ZXMueSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR0aGlzLmludGVycG9sYXRlUm90YXRpb25zKCBjdXJ2ZXMueSApO1xuXHRcdFx0Y3VydmVzLnkudmFsdWVzID0gY3VydmVzLnkudmFsdWVzLm1hcCggTWF0aFV0aWxzLmRlZ1RvUmFkICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIGN1cnZlcy56ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHRoaXMuaW50ZXJwb2xhdGVSb3RhdGlvbnMoIGN1cnZlcy56ICk7XG5cdFx0XHRjdXJ2ZXMuei52YWx1ZXMgPSBjdXJ2ZXMuei52YWx1ZXMubWFwKCBNYXRoVXRpbHMuZGVnVG9SYWQgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHRpbWVzID0gdGhpcy5nZXRUaW1lc0ZvckFsbEF4ZXMoIGN1cnZlcyApO1xuXHRcdGNvbnN0IHZhbHVlcyA9IHRoaXMuZ2V0S2V5ZnJhbWVUcmFja1ZhbHVlcyggdGltZXMsIGN1cnZlcywgaW5pdGlhbFZhbHVlICk7XG5cblx0XHRpZiAoIHByZVJvdGF0aW9uICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHByZVJvdGF0aW9uID0gcHJlUm90YXRpb24ubWFwKCBNYXRoVXRpbHMuZGVnVG9SYWQgKTtcblx0XHRcdHByZVJvdGF0aW9uLnB1c2goIGV1bGVyT3JkZXIgKTtcblxuXHRcdFx0cHJlUm90YXRpb24gPSBuZXcgRXVsZXIoKS5mcm9tQXJyYXkoIHByZVJvdGF0aW9uICk7XG5cdFx0XHRwcmVSb3RhdGlvbiA9IG5ldyBRdWF0ZXJuaW9uKCkuc2V0RnJvbUV1bGVyKCBwcmVSb3RhdGlvbiApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBwb3N0Um90YXRpb24gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0cG9zdFJvdGF0aW9uID0gcG9zdFJvdGF0aW9uLm1hcCggTWF0aFV0aWxzLmRlZ1RvUmFkICk7XG5cdFx0XHRwb3N0Um90YXRpb24ucHVzaCggZXVsZXJPcmRlciApO1xuXG5cdFx0XHRwb3N0Um90YXRpb24gPSBuZXcgRXVsZXIoKS5mcm9tQXJyYXkoIHBvc3RSb3RhdGlvbiApO1xuXHRcdFx0cG9zdFJvdGF0aW9uID0gbmV3IFF1YXRlcm5pb24oKS5zZXRGcm9tRXVsZXIoIHBvc3RSb3RhdGlvbiApLmludmVydCgpO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgcXVhdGVybmlvbiA9IG5ldyBRdWF0ZXJuaW9uKCk7XG5cdFx0Y29uc3QgZXVsZXIgPSBuZXcgRXVsZXIoKTtcblxuXHRcdGNvbnN0IHF1YXRlcm5pb25WYWx1ZXMgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkgKz0gMyApIHtcblxuXHRcdFx0ZXVsZXIuc2V0KCB2YWx1ZXNbIGkgXSwgdmFsdWVzWyBpICsgMSBdLCB2YWx1ZXNbIGkgKyAyIF0sIGV1bGVyT3JkZXIgKTtcblxuXHRcdFx0cXVhdGVybmlvbi5zZXRGcm9tRXVsZXIoIGV1bGVyICk7XG5cblx0XHRcdGlmICggcHJlUm90YXRpb24gIT09IHVuZGVmaW5lZCApIHF1YXRlcm5pb24ucHJlbXVsdGlwbHkoIHByZVJvdGF0aW9uICk7XG5cdFx0XHRpZiAoIHBvc3RSb3RhdGlvbiAhPT0gdW5kZWZpbmVkICkgcXVhdGVybmlvbi5tdWx0aXBseSggcG9zdFJvdGF0aW9uICk7XG5cblx0XHRcdHF1YXRlcm5pb24udG9BcnJheSggcXVhdGVybmlvblZhbHVlcywgKCBpIC8gMyApICogNCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBRdWF0ZXJuaW9uS2V5ZnJhbWVUcmFjayggbW9kZWxOYW1lICsgJy5xdWF0ZXJuaW9uJywgdGltZXMsIHF1YXRlcm5pb25WYWx1ZXMgKTtcblxuXHR9XG5cblx0Z2VuZXJhdGVNb3JwaFRyYWNrKCByYXdUcmFja3MgKSB7XG5cblx0XHRjb25zdCBjdXJ2ZXMgPSByYXdUcmFja3MuRGVmb3JtUGVyY2VudC5jdXJ2ZXMubW9ycGg7XG5cdFx0Y29uc3QgdmFsdWVzID0gY3VydmVzLnZhbHVlcy5tYXAoIGZ1bmN0aW9uICggdmFsICkge1xuXG5cdFx0XHRyZXR1cm4gdmFsIC8gMTAwO1xuXG5cdFx0fSApO1xuXG5cdFx0Y29uc3QgbW9ycGhOdW0gPSBzY2VuZUdyYXBoLmdldE9iamVjdEJ5TmFtZSggcmF3VHJhY2tzLm1vZGVsTmFtZSApLm1vcnBoVGFyZ2V0RGljdGlvbmFyeVsgcmF3VHJhY2tzLm1vcnBoTmFtZSBdO1xuXG5cdFx0cmV0dXJuIG5ldyBOdW1iZXJLZXlmcmFtZVRyYWNrKCByYXdUcmFja3MubW9kZWxOYW1lICsgJy5tb3JwaFRhcmdldEluZmx1ZW5jZXNbJyArIG1vcnBoTnVtICsgJ10nLCBjdXJ2ZXMudGltZXMsIHZhbHVlcyApO1xuXG5cdH1cblxuXHQvLyBGb3IgYWxsIGFuaW1hdGVkIG9iamVjdHMsIHRpbWVzIGFyZSBkZWZpbmVkIHNlcGFyYXRlbHkgZm9yIGVhY2ggYXhpc1xuXHQvLyBIZXJlIHdlJ2xsIGNvbWJpbmUgdGhlIHRpbWVzIGludG8gb25lIHNvcnRlZCBhcnJheSB3aXRob3V0IGR1cGxpY2F0ZXNcblx0Z2V0VGltZXNGb3JBbGxBeGVzKCBjdXJ2ZXMgKSB7XG5cblx0XHRsZXQgdGltZXMgPSBbXTtcblxuXHRcdC8vIGZpcnN0IGpvaW4gdG9nZXRoZXIgdGhlIHRpbWVzIGZvciBlYWNoIGF4aXMsIGlmIGRlZmluZWRcblx0XHRpZiAoIGN1cnZlcy54ICE9PSB1bmRlZmluZWQgKSB0aW1lcyA9IHRpbWVzLmNvbmNhdCggY3VydmVzLngudGltZXMgKTtcblx0XHRpZiAoIGN1cnZlcy55ICE9PSB1bmRlZmluZWQgKSB0aW1lcyA9IHRpbWVzLmNvbmNhdCggY3VydmVzLnkudGltZXMgKTtcblx0XHRpZiAoIGN1cnZlcy56ICE9PSB1bmRlZmluZWQgKSB0aW1lcyA9IHRpbWVzLmNvbmNhdCggY3VydmVzLnoudGltZXMgKTtcblxuXHRcdC8vIHRoZW4gc29ydCB0aGVtXG5cdFx0dGltZXMgPSB0aW1lcy5zb3J0KCBmdW5jdGlvbiAoIGEsIGIgKSB7XG5cblx0XHRcdHJldHVybiBhIC0gYjtcblxuXHRcdH0gKTtcblxuXHRcdC8vIGFuZCByZW1vdmUgZHVwbGljYXRlc1xuXHRcdGlmICggdGltZXMubGVuZ3RoID4gMSApIHtcblxuXHRcdFx0bGV0IHRhcmdldEluZGV4ID0gMTtcblx0XHRcdGxldCBsYXN0VmFsdWUgPSB0aW1lc1sgMCBdO1xuXHRcdFx0Zm9yICggbGV0IGkgPSAxOyBpIDwgdGltZXMubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRpbWVzWyBpIF07XG5cdFx0XHRcdGlmICggY3VycmVudFZhbHVlICE9PSBsYXN0VmFsdWUgKSB7XG5cblx0XHRcdFx0XHR0aW1lc1sgdGFyZ2V0SW5kZXggXSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0XHRsYXN0VmFsdWUgPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdFx0dGFyZ2V0SW5kZXggKys7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHRpbWVzID0gdGltZXMuc2xpY2UoIDAsIHRhcmdldEluZGV4ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGltZXM7XG5cblx0fVxuXG5cdGdldEtleWZyYW1lVHJhY2tWYWx1ZXMoIHRpbWVzLCBjdXJ2ZXMsIGluaXRpYWxWYWx1ZSApIHtcblxuXHRcdGNvbnN0IHByZXZWYWx1ZSA9IGluaXRpYWxWYWx1ZTtcblxuXHRcdGNvbnN0IHZhbHVlcyA9IFtdO1xuXG5cdFx0bGV0IHhJbmRleCA9IC0gMTtcblx0XHRsZXQgeUluZGV4ID0gLSAxO1xuXHRcdGxldCB6SW5kZXggPSAtIDE7XG5cblx0XHR0aW1lcy5mb3JFYWNoKCBmdW5jdGlvbiAoIHRpbWUgKSB7XG5cblx0XHRcdGlmICggY3VydmVzLnggKSB4SW5kZXggPSBjdXJ2ZXMueC50aW1lcy5pbmRleE9mKCB0aW1lICk7XG5cdFx0XHRpZiAoIGN1cnZlcy55ICkgeUluZGV4ID0gY3VydmVzLnkudGltZXMuaW5kZXhPZiggdGltZSApO1xuXHRcdFx0aWYgKCBjdXJ2ZXMueiApIHpJbmRleCA9IGN1cnZlcy56LnRpbWVzLmluZGV4T2YoIHRpbWUgKTtcblxuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgYW4geCB2YWx1ZSBkZWZpbmVkIGZvciB0aGlzIGZyYW1lLCB1c2UgdGhhdFxuXHRcdFx0aWYgKCB4SW5kZXggIT09IC0gMSApIHtcblxuXHRcdFx0XHRjb25zdCB4VmFsdWUgPSBjdXJ2ZXMueC52YWx1ZXNbIHhJbmRleCBdO1xuXHRcdFx0XHR2YWx1ZXMucHVzaCggeFZhbHVlICk7XG5cdFx0XHRcdHByZXZWYWx1ZVsgMCBdID0geFZhbHVlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIG90aGVyd2lzZSB1c2UgdGhlIHggdmFsdWUgZnJvbSB0aGUgcHJldmlvdXMgZnJhbWVcblx0XHRcdFx0dmFsdWVzLnB1c2goIHByZXZWYWx1ZVsgMCBdICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCB5SW5kZXggIT09IC0gMSApIHtcblxuXHRcdFx0XHRjb25zdCB5VmFsdWUgPSBjdXJ2ZXMueS52YWx1ZXNbIHlJbmRleCBdO1xuXHRcdFx0XHR2YWx1ZXMucHVzaCggeVZhbHVlICk7XG5cdFx0XHRcdHByZXZWYWx1ZVsgMSBdID0geVZhbHVlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHZhbHVlcy5wdXNoKCBwcmV2VmFsdWVbIDEgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggekluZGV4ICE9PSAtIDEgKSB7XG5cblx0XHRcdFx0Y29uc3QgelZhbHVlID0gY3VydmVzLnoudmFsdWVzWyB6SW5kZXggXTtcblx0XHRcdFx0dmFsdWVzLnB1c2goIHpWYWx1ZSApO1xuXHRcdFx0XHRwcmV2VmFsdWVbIDIgXSA9IHpWYWx1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR2YWx1ZXMucHVzaCggcHJldlZhbHVlWyAyIF0gKTtcblxuXHRcdFx0fVxuXG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIHZhbHVlcztcblxuXHR9XG5cblx0Ly8gUm90YXRpb25zIGFyZSBkZWZpbmVkIGFzIEV1bGVyIGFuZ2xlcyB3aGljaCBjYW4gaGF2ZSB2YWx1ZXMgIG9mIGFueSBzaXplXG5cdC8vIFRoZXNlIHdpbGwgYmUgY29udmVydGVkIHRvIHF1YXRlcm5pb25zIHdoaWNoIGRvbid0IHN1cHBvcnQgdmFsdWVzIGdyZWF0ZXIgdGhhblxuXHQvLyBQSSwgc28gd2UnbGwgaW50ZXJwb2xhdGUgbGFyZ2Ugcm90YXRpb25zXG5cdGludGVycG9sYXRlUm90YXRpb25zKCBjdXJ2ZSApIHtcblxuXHRcdGZvciAoIGxldCBpID0gMTsgaSA8IGN1cnZlLnZhbHVlcy5sZW5ndGg7IGkgKysgKSB7XG5cblx0XHRcdGNvbnN0IGluaXRpYWxWYWx1ZSA9IGN1cnZlLnZhbHVlc1sgaSAtIDEgXTtcblx0XHRcdGNvbnN0IHZhbHVlc1NwYW4gPSBjdXJ2ZS52YWx1ZXNbIGkgXSAtIGluaXRpYWxWYWx1ZTtcblxuXHRcdFx0Y29uc3QgYWJzb2x1dGVTcGFuID0gTWF0aC5hYnMoIHZhbHVlc1NwYW4gKTtcblxuXHRcdFx0aWYgKCBhYnNvbHV0ZVNwYW4gPj0gMTgwICkge1xuXG5cdFx0XHRcdGNvbnN0IG51bVN1YkludGVydmFscyA9IGFic29sdXRlU3BhbiAvIDE4MDtcblxuXHRcdFx0XHRjb25zdCBzdGVwID0gdmFsdWVzU3BhbiAvIG51bVN1YkludGVydmFscztcblx0XHRcdFx0bGV0IG5leHRWYWx1ZSA9IGluaXRpYWxWYWx1ZSArIHN0ZXA7XG5cblx0XHRcdFx0Y29uc3QgaW5pdGlhbFRpbWUgPSBjdXJ2ZS50aW1lc1sgaSAtIDEgXTtcblx0XHRcdFx0Y29uc3QgdGltZVNwYW4gPSBjdXJ2ZS50aW1lc1sgaSBdIC0gaW5pdGlhbFRpbWU7XG5cdFx0XHRcdGNvbnN0IGludGVydmFsID0gdGltZVNwYW4gLyBudW1TdWJJbnRlcnZhbHM7XG5cdFx0XHRcdGxldCBuZXh0VGltZSA9IGluaXRpYWxUaW1lICsgaW50ZXJ2YWw7XG5cblx0XHRcdFx0Y29uc3QgaW50ZXJwb2xhdGVkVGltZXMgPSBbXTtcblx0XHRcdFx0Y29uc3QgaW50ZXJwb2xhdGVkVmFsdWVzID0gW107XG5cblx0XHRcdFx0d2hpbGUgKCBuZXh0VGltZSA8IGN1cnZlLnRpbWVzWyBpIF0gKSB7XG5cblx0XHRcdFx0XHRpbnRlcnBvbGF0ZWRUaW1lcy5wdXNoKCBuZXh0VGltZSApO1xuXHRcdFx0XHRcdG5leHRUaW1lICs9IGludGVydmFsO1xuXG5cdFx0XHRcdFx0aW50ZXJwb2xhdGVkVmFsdWVzLnB1c2goIG5leHRWYWx1ZSApO1xuXHRcdFx0XHRcdG5leHRWYWx1ZSArPSBzdGVwO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjdXJ2ZS50aW1lcyA9IGluamVjdCggY3VydmUudGltZXMsIGksIGludGVycG9sYXRlZFRpbWVzICk7XG5cdFx0XHRcdGN1cnZlLnZhbHVlcyA9IGluamVjdCggY3VydmUudmFsdWVzLCBpLCBpbnRlcnBvbGF0ZWRWYWx1ZXMgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxufVxuXG4vLyBwYXJzZSBhbiBGQlggZmlsZSBpbiBBU0NJSSBmb3JtYXRcbmNsYXNzIFRleHRQYXJzZXIge1xuXG5cdGdldFByZXZOb2RlKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMubm9kZVN0YWNrWyB0aGlzLmN1cnJlbnRJbmRlbnQgLSAyIF07XG5cblx0fVxuXG5cdGdldEN1cnJlbnROb2RlKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMubm9kZVN0YWNrWyB0aGlzLmN1cnJlbnRJbmRlbnQgLSAxIF07XG5cblx0fVxuXG5cdGdldEN1cnJlbnRQcm9wKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuY3VycmVudFByb3A7XG5cblx0fVxuXG5cdHB1c2hTdGFjayggbm9kZSApIHtcblxuXHRcdHRoaXMubm9kZVN0YWNrLnB1c2goIG5vZGUgKTtcblx0XHR0aGlzLmN1cnJlbnRJbmRlbnQgKz0gMTtcblxuXHR9XG5cblx0cG9wU3RhY2soKSB7XG5cblx0XHR0aGlzLm5vZGVTdGFjay5wb3AoKTtcblx0XHR0aGlzLmN1cnJlbnRJbmRlbnQgLT0gMTtcblxuXHR9XG5cblx0c2V0Q3VycmVudFByb3AoIHZhbCwgbmFtZSApIHtcblxuXHRcdHRoaXMuY3VycmVudFByb3AgPSB2YWw7XG5cdFx0dGhpcy5jdXJyZW50UHJvcE5hbWUgPSBuYW1lO1xuXG5cdH1cblxuXHRwYXJzZSggdGV4dCApIHtcblxuXHRcdHRoaXMuY3VycmVudEluZGVudCA9IDA7XG5cblx0XHR0aGlzLmFsbE5vZGVzID0gbmV3IEZCWFRyZWUoKTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHRcdHRoaXMuY3VycmVudFByb3AgPSBbXTtcblx0XHR0aGlzLmN1cnJlbnRQcm9wTmFtZSA9ICcnO1xuXG5cdFx0Y29uc3Qgc2NvcGUgPSB0aGlzO1xuXG5cdFx0Y29uc3Qgc3BsaXQgPSB0ZXh0LnNwbGl0KCAvW1xcclxcbl0rLyApO1xuXG5cdFx0c3BsaXQuZm9yRWFjaCggZnVuY3Rpb24gKCBsaW5lLCBpICkge1xuXG5cdFx0XHRjb25zdCBtYXRjaENvbW1lbnQgPSBsaW5lLm1hdGNoKCAvXltcXHNcXHRdKjsvICk7XG5cdFx0XHRjb25zdCBtYXRjaEVtcHR5ID0gbGluZS5tYXRjaCggL15bXFxzXFx0XSokLyApO1xuXG5cdFx0XHRpZiAoIG1hdGNoQ29tbWVudCB8fCBtYXRjaEVtcHR5ICkgcmV0dXJuO1xuXG5cdFx0XHRjb25zdCBtYXRjaEJlZ2lubmluZyA9IGxpbmUubWF0Y2goICdeXFxcXHR7JyArIHNjb3BlLmN1cnJlbnRJbmRlbnQgKyAnfShcXFxcdyspOiguKil7JywgJycgKTtcblx0XHRcdGNvbnN0IG1hdGNoUHJvcGVydHkgPSBsaW5lLm1hdGNoKCAnXlxcXFx0eycgKyAoIHNjb3BlLmN1cnJlbnRJbmRlbnQgKSArICd9KFxcXFx3Kyk6W1xcXFxzXFxcXHRcXFxcclxcXFxuXSguKiknICk7XG5cdFx0XHRjb25zdCBtYXRjaEVuZCA9IGxpbmUubWF0Y2goICdeXFxcXHR7JyArICggc2NvcGUuY3VycmVudEluZGVudCAtIDEgKSArICd9fScgKTtcblxuXHRcdFx0aWYgKCBtYXRjaEJlZ2lubmluZyApIHtcblxuXHRcdFx0XHRzY29wZS5wYXJzZU5vZGVCZWdpbiggbGluZSwgbWF0Y2hCZWdpbm5pbmcgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggbWF0Y2hQcm9wZXJ0eSApIHtcblxuXHRcdFx0XHRzY29wZS5wYXJzZU5vZGVQcm9wZXJ0eSggbGluZSwgbWF0Y2hQcm9wZXJ0eSwgc3BsaXRbICsrIGkgXSApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBtYXRjaEVuZCApIHtcblxuXHRcdFx0XHRzY29wZS5wb3BTdGFjaygpO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBsaW5lLm1hdGNoKCAvXlteXFxzXFx0fV0vICkgKSB7XG5cblx0XHRcdFx0Ly8gbGFyZ2UgYXJyYXlzIGFyZSBzcGxpdCBvdmVyIG11bHRpcGxlIGxpbmVzIHRlcm1pbmF0ZWQgd2l0aCBhICcsJyBjaGFyYWN0ZXJcblx0XHRcdFx0Ly8gaWYgdGhpcyBpcyBlbmNvdW50ZXJlZCB0aGUgbGluZSBuZWVkcyB0byBiZSBqb2luZWQgdG8gdGhlIHByZXZpb3VzIGxpbmVcblx0XHRcdFx0c2NvcGUucGFyc2VOb2RlUHJvcGVydHlDb250aW51ZWQoIGxpbmUgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIHRoaXMuYWxsTm9kZXM7XG5cblx0fVxuXG5cdHBhcnNlTm9kZUJlZ2luKCBsaW5lLCBwcm9wZXJ0eSApIHtcblxuXHRcdGNvbnN0IG5vZGVOYW1lID0gcHJvcGVydHlbIDEgXS50cmltKCkucmVwbGFjZSggL15cIi8sICcnICkucmVwbGFjZSggL1wiJC8sICcnICk7XG5cblx0XHRjb25zdCBub2RlQXR0cnMgPSBwcm9wZXJ0eVsgMiBdLnNwbGl0KCAnLCcgKS5tYXAoIGZ1bmN0aW9uICggYXR0ciApIHtcblxuXHRcdFx0cmV0dXJuIGF0dHIudHJpbSgpLnJlcGxhY2UoIC9eXCIvLCAnJyApLnJlcGxhY2UoIC9cIiQvLCAnJyApO1xuXG5cdFx0fSApO1xuXG5cdFx0Y29uc3Qgbm9kZSA9IHsgbmFtZTogbm9kZU5hbWUgfTtcblx0XHRjb25zdCBhdHRycyA9IHRoaXMucGFyc2VOb2RlQXR0ciggbm9kZUF0dHJzICk7XG5cblx0XHRjb25zdCBjdXJyZW50Tm9kZSA9IHRoaXMuZ2V0Q3VycmVudE5vZGUoKTtcblxuXHRcdC8vIGEgdG9wIG5vZGVcblx0XHRpZiAoIHRoaXMuY3VycmVudEluZGVudCA9PT0gMCApIHtcblxuXHRcdFx0dGhpcy5hbGxOb2Rlcy5hZGQoIG5vZGVOYW1lLCBub2RlICk7XG5cblx0XHR9IGVsc2UgeyAvLyBhIHN1Ym5vZGVcblxuXHRcdFx0Ly8gaWYgdGhlIHN1Ym5vZGUgYWxyZWFkeSBleGlzdHMsIGFwcGVuZCBpdFxuXHRcdFx0aWYgKCBub2RlTmFtZSBpbiBjdXJyZW50Tm9kZSApIHtcblxuXHRcdFx0XHQvLyBzcGVjaWFsIGNhc2UgUG9zZSBuZWVkcyBQb3NlTm9kZXMgYXMgYW4gYXJyYXlcblx0XHRcdFx0aWYgKCBub2RlTmFtZSA9PT0gJ1Bvc2VOb2RlJyApIHtcblxuXHRcdFx0XHRcdGN1cnJlbnROb2RlLlBvc2VOb2RlLnB1c2goIG5vZGUgKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCBjdXJyZW50Tm9kZVsgbm9kZU5hbWUgXS5pZCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0Y3VycmVudE5vZGVbIG5vZGVOYW1lIF0gPSB7fTtcblx0XHRcdFx0XHRjdXJyZW50Tm9kZVsgbm9kZU5hbWUgXVsgY3VycmVudE5vZGVbIG5vZGVOYW1lIF0uaWQgXSA9IGN1cnJlbnROb2RlWyBub2RlTmFtZSBdO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIGF0dHJzLmlkICE9PSAnJyApIGN1cnJlbnROb2RlWyBub2RlTmFtZSBdWyBhdHRycy5pZCBdID0gbm9kZTtcblxuXHRcdFx0fSBlbHNlIGlmICggdHlwZW9mIGF0dHJzLmlkID09PSAnbnVtYmVyJyApIHtcblxuXHRcdFx0XHRjdXJyZW50Tm9kZVsgbm9kZU5hbWUgXSA9IHt9O1xuXHRcdFx0XHRjdXJyZW50Tm9kZVsgbm9kZU5hbWUgXVsgYXR0cnMuaWQgXSA9IG5vZGU7XG5cblx0XHRcdH0gZWxzZSBpZiAoIG5vZGVOYW1lICE9PSAnUHJvcGVydGllczcwJyApIHtcblxuXHRcdFx0XHRpZiAoIG5vZGVOYW1lID09PSAnUG9zZU5vZGUnIClcdGN1cnJlbnROb2RlWyBub2RlTmFtZSBdID0gWyBub2RlIF07XG5cdFx0XHRcdGVsc2UgY3VycmVudE5vZGVbIG5vZGVOYW1lIF0gPSBub2RlO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiBhdHRycy5pZCA9PT0gJ251bWJlcicgKSBub2RlLmlkID0gYXR0cnMuaWQ7XG5cdFx0aWYgKCBhdHRycy5uYW1lICE9PSAnJyApIG5vZGUuYXR0ck5hbWUgPSBhdHRycy5uYW1lO1xuXHRcdGlmICggYXR0cnMudHlwZSAhPT0gJycgKSBub2RlLmF0dHJUeXBlID0gYXR0cnMudHlwZTtcblxuXHRcdHRoaXMucHVzaFN0YWNrKCBub2RlICk7XG5cblx0fVxuXG5cdHBhcnNlTm9kZUF0dHIoIGF0dHJzICkge1xuXG5cdFx0bGV0IGlkID0gYXR0cnNbIDAgXTtcblxuXHRcdGlmICggYXR0cnNbIDAgXSAhPT0gJycgKSB7XG5cblx0XHRcdGlkID0gcGFyc2VJbnQoIGF0dHJzWyAwIF0gKTtcblxuXHRcdFx0aWYgKCBpc05hTiggaWQgKSApIHtcblxuXHRcdFx0XHRpZCA9IGF0dHJzWyAwIF07XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGxldCBuYW1lID0gJycsIHR5cGUgPSAnJztcblxuXHRcdGlmICggYXR0cnMubGVuZ3RoID4gMSApIHtcblxuXHRcdFx0bmFtZSA9IGF0dHJzWyAxIF0ucmVwbGFjZSggL14oXFx3Kyk6Oi8sICcnICk7XG5cdFx0XHR0eXBlID0gYXR0cnNbIDIgXTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB7IGlkOiBpZCwgbmFtZTogbmFtZSwgdHlwZTogdHlwZSB9O1xuXG5cdH1cblxuXHRwYXJzZU5vZGVQcm9wZXJ0eSggbGluZSwgcHJvcGVydHksIGNvbnRlbnRMaW5lICkge1xuXG5cdFx0bGV0IHByb3BOYW1lID0gcHJvcGVydHlbIDEgXS5yZXBsYWNlKCAvXlwiLywgJycgKS5yZXBsYWNlKCAvXCIkLywgJycgKS50cmltKCk7XG5cdFx0bGV0IHByb3BWYWx1ZSA9IHByb3BlcnR5WyAyIF0ucmVwbGFjZSggL15cIi8sICcnICkucmVwbGFjZSggL1wiJC8sICcnICkudHJpbSgpO1xuXG5cdFx0Ly8gZm9yIHNwZWNpYWwgY2FzZTogYmFzZTY0IGltYWdlIGRhdGEgZm9sbG93cyBcIkNvbnRlbnQ6ICxcIiBsaW5lXG5cdFx0Ly9cdENvbnRlbnQ6ICxcblx0XHQvL1x0IFwiLzlqLzRSRGFSWGhwWmdBQVRVMEEuLi5cIlxuXHRcdGlmICggcHJvcE5hbWUgPT09ICdDb250ZW50JyAmJiBwcm9wVmFsdWUgPT09ICcsJyApIHtcblxuXHRcdFx0cHJvcFZhbHVlID0gY29udGVudExpbmUucmVwbGFjZSggL1wiL2csICcnICkucmVwbGFjZSggLywkLywgJycgKS50cmltKCk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBjdXJyZW50Tm9kZSA9IHRoaXMuZ2V0Q3VycmVudE5vZGUoKTtcblx0XHRjb25zdCBwYXJlbnROYW1lID0gY3VycmVudE5vZGUubmFtZTtcblxuXHRcdGlmICggcGFyZW50TmFtZSA9PT0gJ1Byb3BlcnRpZXM3MCcgKSB7XG5cblx0XHRcdHRoaXMucGFyc2VOb2RlU3BlY2lhbFByb3BlcnR5KCBsaW5lLCBwcm9wTmFtZSwgcHJvcFZhbHVlICk7XG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHQvLyBDb25uZWN0aW9uc1xuXHRcdGlmICggcHJvcE5hbWUgPT09ICdDJyApIHtcblxuXHRcdFx0Y29uc3QgY29ublByb3BzID0gcHJvcFZhbHVlLnNwbGl0KCAnLCcgKS5zbGljZSggMSApO1xuXHRcdFx0Y29uc3QgZnJvbSA9IHBhcnNlSW50KCBjb25uUHJvcHNbIDAgXSApO1xuXHRcdFx0Y29uc3QgdG8gPSBwYXJzZUludCggY29ublByb3BzWyAxIF0gKTtcblxuXHRcdFx0bGV0IHJlc3QgPSBwcm9wVmFsdWUuc3BsaXQoICcsJyApLnNsaWNlKCAzICk7XG5cblx0XHRcdHJlc3QgPSByZXN0Lm1hcCggZnVuY3Rpb24gKCBlbGVtICkge1xuXG5cdFx0XHRcdHJldHVybiBlbGVtLnRyaW0oKS5yZXBsYWNlKCAvXlwiLywgJycgKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0XHRwcm9wTmFtZSA9ICdjb25uZWN0aW9ucyc7XG5cdFx0XHRwcm9wVmFsdWUgPSBbIGZyb20sIHRvIF07XG5cdFx0XHRhcHBlbmQoIHByb3BWYWx1ZSwgcmVzdCApO1xuXG5cdFx0XHRpZiAoIGN1cnJlbnROb2RlWyBwcm9wTmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0Y3VycmVudE5vZGVbIHByb3BOYW1lIF0gPSBbXTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0Ly8gTm9kZVxuXHRcdGlmICggcHJvcE5hbWUgPT09ICdOb2RlJyApIGN1cnJlbnROb2RlLmlkID0gcHJvcFZhbHVlO1xuXG5cdFx0Ly8gY29ubmVjdGlvbnNcblx0XHRpZiAoIHByb3BOYW1lIGluIGN1cnJlbnROb2RlICYmIEFycmF5LmlzQXJyYXkoIGN1cnJlbnROb2RlWyBwcm9wTmFtZSBdICkgKSB7XG5cblx0XHRcdGN1cnJlbnROb2RlWyBwcm9wTmFtZSBdLnB1c2goIHByb3BWYWx1ZSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYgKCBwcm9wTmFtZSAhPT0gJ2EnICkgY3VycmVudE5vZGVbIHByb3BOYW1lIF0gPSBwcm9wVmFsdWU7XG5cdFx0XHRlbHNlIGN1cnJlbnROb2RlLmEgPSBwcm9wVmFsdWU7XG5cblx0XHR9XG5cblx0XHR0aGlzLnNldEN1cnJlbnRQcm9wKCBjdXJyZW50Tm9kZSwgcHJvcE5hbWUgKTtcblxuXHRcdC8vIGNvbnZlcnQgc3RyaW5nIHRvIGFycmF5LCB1bmxlc3MgaXQgZW5kcyBpbiAnLCcgaW4gd2hpY2ggY2FzZSBtb3JlIHdpbGwgYmUgYWRkZWQgdG8gaXRcblx0XHRpZiAoIHByb3BOYW1lID09PSAnYScgJiYgcHJvcFZhbHVlLnNsaWNlKCAtIDEgKSAhPT0gJywnICkge1xuXG5cdFx0XHRjdXJyZW50Tm9kZS5hID0gcGFyc2VOdW1iZXJBcnJheSggcHJvcFZhbHVlICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHBhcnNlTm9kZVByb3BlcnR5Q29udGludWVkKCBsaW5lICkge1xuXG5cdFx0Y29uc3QgY3VycmVudE5vZGUgPSB0aGlzLmdldEN1cnJlbnROb2RlKCk7XG5cblx0XHRjdXJyZW50Tm9kZS5hICs9IGxpbmU7XG5cblx0XHQvLyBpZiB0aGUgbGluZSBkb2Vzbid0IGVuZCBpbiAnLCcgd2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIHByb3BlcnR5IHZhbHVlXG5cdFx0Ly8gc28gY29udmVydCB0aGUgc3RyaW5nIHRvIGFuIGFycmF5XG5cdFx0aWYgKCBsaW5lLnNsaWNlKCAtIDEgKSAhPT0gJywnICkge1xuXG5cdFx0XHRjdXJyZW50Tm9kZS5hID0gcGFyc2VOdW1iZXJBcnJheSggY3VycmVudE5vZGUuYSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvLyBwYXJzZSBcIlByb3BlcnR5NzBcIlxuXHRwYXJzZU5vZGVTcGVjaWFsUHJvcGVydHkoIGxpbmUsIHByb3BOYW1lLCBwcm9wVmFsdWUgKSB7XG5cblx0XHQvLyBzcGxpdCB0aGlzXG5cdFx0Ly8gUDogXCJMY2wgU2NhbGluZ1wiLCBcIkxjbCBTY2FsaW5nXCIsIFwiXCIsIFwiQVwiLDEsMSwxXG5cdFx0Ly8gaW50byBhcnJheSBsaWtlIGJlbG93XG5cdFx0Ly8gW1wiTGNsIFNjYWxpbmdcIiwgXCJMY2wgU2NhbGluZ1wiLCBcIlwiLCBcIkFcIiwgXCIxLDEsMVwiIF1cblx0XHRjb25zdCBwcm9wcyA9IHByb3BWYWx1ZS5zcGxpdCggJ1wiLCcgKS5tYXAoIGZ1bmN0aW9uICggcHJvcCApIHtcblxuXHRcdFx0cmV0dXJuIHByb3AudHJpbSgpLnJlcGxhY2UoIC9eXFxcIi8sICcnICkucmVwbGFjZSggL1xccy8sICdfJyApO1xuXG5cdFx0fSApO1xuXG5cdFx0Y29uc3QgaW5uZXJQcm9wTmFtZSA9IHByb3BzWyAwIF07XG5cdFx0Y29uc3QgaW5uZXJQcm9wVHlwZTEgPSBwcm9wc1sgMSBdO1xuXHRcdGNvbnN0IGlubmVyUHJvcFR5cGUyID0gcHJvcHNbIDIgXTtcblx0XHRjb25zdCBpbm5lclByb3BGbGFnID0gcHJvcHNbIDMgXTtcblx0XHRsZXQgaW5uZXJQcm9wVmFsdWUgPSBwcm9wc1sgNCBdO1xuXG5cdFx0Ly8gY2FzdCB2YWx1ZXMgd2hlcmUgbmVlZGVkLCBvdGhlcndpc2UgbGVhdmUgYXMgc3RyaW5nc1xuXHRcdHN3aXRjaCAoIGlubmVyUHJvcFR5cGUxICkge1xuXG5cdFx0XHRjYXNlICdpbnQnOlxuXHRcdFx0Y2FzZSAnZW51bSc6XG5cdFx0XHRjYXNlICdib29sJzpcblx0XHRcdGNhc2UgJ1VMb25nTG9uZyc6XG5cdFx0XHRjYXNlICdkb3VibGUnOlxuXHRcdFx0Y2FzZSAnTnVtYmVyJzpcblx0XHRcdGNhc2UgJ0ZpZWxkT2ZWaWV3Jzpcblx0XHRcdFx0aW5uZXJQcm9wVmFsdWUgPSBwYXJzZUZsb2F0KCBpbm5lclByb3BWYWx1ZSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnQ29sb3InOlxuXHRcdFx0Y2FzZSAnQ29sb3JSR0InOlxuXHRcdFx0Y2FzZSAnVmVjdG9yM0QnOlxuXHRcdFx0Y2FzZSAnTGNsX1RyYW5zbGF0aW9uJzpcblx0XHRcdGNhc2UgJ0xjbF9Sb3RhdGlvbic6XG5cdFx0XHRjYXNlICdMY2xfU2NhbGluZyc6XG5cdFx0XHRcdGlubmVyUHJvcFZhbHVlID0gcGFyc2VOdW1iZXJBcnJheSggaW5uZXJQcm9wVmFsdWUgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHR9XG5cblx0XHQvLyBDQVVUSU9OOiB0aGVzZSBwcm9wcyBtdXN0IGFwcGVuZCB0byBwYXJlbnQncyBwYXJlbnRcblx0XHR0aGlzLmdldFByZXZOb2RlKClbIGlubmVyUHJvcE5hbWUgXSA9IHtcblxuXHRcdFx0J3R5cGUnOiBpbm5lclByb3BUeXBlMSxcblx0XHRcdCd0eXBlMic6IGlubmVyUHJvcFR5cGUyLFxuXHRcdFx0J2ZsYWcnOiBpbm5lclByb3BGbGFnLFxuXHRcdFx0J3ZhbHVlJzogaW5uZXJQcm9wVmFsdWVcblxuXHRcdH07XG5cblx0XHR0aGlzLnNldEN1cnJlbnRQcm9wKCB0aGlzLmdldFByZXZOb2RlKCksIGlubmVyUHJvcE5hbWUgKTtcblxuXHR9XG5cbn1cblxuLy8gUGFyc2UgYW4gRkJYIGZpbGUgaW4gQmluYXJ5IGZvcm1hdFxuY2xhc3MgQmluYXJ5UGFyc2VyIHtcblxuXHRwYXJzZSggYnVmZmVyICkge1xuXG5cdFx0Y29uc3QgcmVhZGVyID0gbmV3IEJpbmFyeVJlYWRlciggYnVmZmVyICk7XG5cdFx0cmVhZGVyLnNraXAoIDIzICk7IC8vIHNraXAgbWFnaWMgMjMgYnl0ZXNcblxuXHRcdGNvbnN0IHZlcnNpb24gPSByZWFkZXIuZ2V0VWludDMyKCk7XG5cblx0XHRpZiAoIHZlcnNpb24gPCA2NDAwICkge1xuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5GQlhMb2FkZXI6IEZCWCB2ZXJzaW9uIG5vdCBzdXBwb3J0ZWQsIEZpbGVWZXJzaW9uOiAnICsgdmVyc2lvbiApO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgYWxsTm9kZXMgPSBuZXcgRkJYVHJlZSgpO1xuXG5cdFx0d2hpbGUgKCAhIHRoaXMuZW5kT2ZDb250ZW50KCByZWFkZXIgKSApIHtcblxuXHRcdFx0Y29uc3Qgbm9kZSA9IHRoaXMucGFyc2VOb2RlKCByZWFkZXIsIHZlcnNpb24gKTtcblx0XHRcdGlmICggbm9kZSAhPT0gbnVsbCApIGFsbE5vZGVzLmFkZCggbm9kZS5uYW1lLCBub2RlICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gYWxsTm9kZXM7XG5cblx0fVxuXG5cdC8vIENoZWNrIGlmIHJlYWRlciBoYXMgcmVhY2hlZCB0aGUgZW5kIG9mIGNvbnRlbnQuXG5cdGVuZE9mQ29udGVudCggcmVhZGVyICkge1xuXG5cdFx0Ly8gZm9vdGVyIHNpemU6IDE2MGJ5dGVzICsgMTYtYnl0ZSBhbGlnbm1lbnQgcGFkZGluZ1xuXHRcdC8vIC0gMTZieXRlczogbWFnaWNcblx0XHQvLyAtIHBhZGRpbmcgdGlsIDE2LWJ5dGUgYWxpZ25tZW50IChhdCBsZWFzdCAxYnl0ZT8pXG5cdFx0Ly9cdChzZWVtcyBsaWtlIHNvbWUgZXhwb3J0ZXJzIGVtYmVkIGZpeGVkIDE1IG9yIDE2Ynl0ZXM/KVxuXHRcdC8vIC0gNGJ5dGVzOiBtYWdpY1xuXHRcdC8vIC0gNGJ5dGVzOiB2ZXJzaW9uXG5cdFx0Ly8gLSAxMjBieXRlczogemVyb1xuXHRcdC8vIC0gMTZieXRlczogbWFnaWNcblx0XHRpZiAoIHJlYWRlci5zaXplKCkgJSAxNiA9PT0gMCApIHtcblxuXHRcdFx0cmV0dXJuICggKCByZWFkZXIuZ2V0T2Zmc2V0KCkgKyAxNjAgKyAxNiApICYgfiAweGYgKSA+PSByZWFkZXIuc2l6ZSgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0cmV0dXJuIHJlYWRlci5nZXRPZmZzZXQoKSArIDE2MCArIDE2ID49IHJlYWRlci5zaXplKCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8vIHJlY3Vyc2l2ZWx5IHBhcnNlIG5vZGVzIHVudGlsIHRoZSBlbmQgb2YgdGhlIGZpbGUgaXMgcmVhY2hlZFxuXHRwYXJzZU5vZGUoIHJlYWRlciwgdmVyc2lvbiApIHtcblxuXHRcdGNvbnN0IG5vZGUgPSB7fTtcblxuXHRcdC8vIFRoZSBmaXJzdCB0aHJlZSBkYXRhIHNpemVzIGRlcGVuZHMgb24gdmVyc2lvbi5cblx0XHRjb25zdCBlbmRPZmZzZXQgPSAoIHZlcnNpb24gPj0gNzUwMCApID8gcmVhZGVyLmdldFVpbnQ2NCgpIDogcmVhZGVyLmdldFVpbnQzMigpO1xuXHRcdGNvbnN0IG51bVByb3BlcnRpZXMgPSAoIHZlcnNpb24gPj0gNzUwMCApID8gcmVhZGVyLmdldFVpbnQ2NCgpIDogcmVhZGVyLmdldFVpbnQzMigpO1xuXG5cdFx0KCB2ZXJzaW9uID49IDc1MDAgKSA/IHJlYWRlci5nZXRVaW50NjQoKSA6IHJlYWRlci5nZXRVaW50MzIoKTsgLy8gdGhlIHJldHVybmVkIHByb3BlcnR5TGlzdExlbiBpcyBub3QgdXNlZFxuXG5cdFx0Y29uc3QgbmFtZUxlbiA9IHJlYWRlci5nZXRVaW50OCgpO1xuXHRcdGNvbnN0IG5hbWUgPSByZWFkZXIuZ2V0U3RyaW5nKCBuYW1lTGVuICk7XG5cblx0XHQvLyBSZWdhcmRzIHRoaXMgbm9kZSBhcyBOVUxMLXJlY29yZCBpZiBlbmRPZmZzZXQgaXMgemVyb1xuXHRcdGlmICggZW5kT2Zmc2V0ID09PSAwICkgcmV0dXJuIG51bGw7XG5cblx0XHRjb25zdCBwcm9wZXJ0eUxpc3QgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IG51bVByb3BlcnRpZXM7IGkgKysgKSB7XG5cblx0XHRcdHByb3BlcnR5TGlzdC5wdXNoKCB0aGlzLnBhcnNlUHJvcGVydHkoIHJlYWRlciApICk7XG5cblx0XHR9XG5cblx0XHQvLyBSZWdhcmRzIHRoZSBmaXJzdCB0aHJlZSBlbGVtZW50cyBpbiBwcm9wZXJ0eUxpc3QgYXMgaWQsIGF0dHJOYW1lLCBhbmQgYXR0clR5cGVcblx0XHRjb25zdCBpZCA9IHByb3BlcnR5TGlzdC5sZW5ndGggPiAwID8gcHJvcGVydHlMaXN0WyAwIF0gOiAnJztcblx0XHRjb25zdCBhdHRyTmFtZSA9IHByb3BlcnR5TGlzdC5sZW5ndGggPiAxID8gcHJvcGVydHlMaXN0WyAxIF0gOiAnJztcblx0XHRjb25zdCBhdHRyVHlwZSA9IHByb3BlcnR5TGlzdC5sZW5ndGggPiAyID8gcHJvcGVydHlMaXN0WyAyIF0gOiAnJztcblxuXHRcdC8vIGNoZWNrIGlmIHRoaXMgbm9kZSByZXByZXNlbnRzIGp1c3QgYSBzaW5nbGUgcHJvcGVydHlcblx0XHQvLyBsaWtlIChuYW1lLCAwKSBzZXQgb3IgKG5hbWUyLCBbMCwgMSwgMl0pIHNldCBvZiB7bmFtZTogMCwgbmFtZTI6IFswLCAxLCAyXX1cblx0XHRub2RlLnNpbmdsZVByb3BlcnR5ID0gKCBudW1Qcm9wZXJ0aWVzID09PSAxICYmIHJlYWRlci5nZXRPZmZzZXQoKSA9PT0gZW5kT2Zmc2V0ICkgPyB0cnVlIDogZmFsc2U7XG5cblx0XHR3aGlsZSAoIGVuZE9mZnNldCA+IHJlYWRlci5nZXRPZmZzZXQoKSApIHtcblxuXHRcdFx0Y29uc3Qgc3ViTm9kZSA9IHRoaXMucGFyc2VOb2RlKCByZWFkZXIsIHZlcnNpb24gKTtcblxuXHRcdFx0aWYgKCBzdWJOb2RlICE9PSBudWxsICkgdGhpcy5wYXJzZVN1Yk5vZGUoIG5hbWUsIG5vZGUsIHN1Yk5vZGUgKTtcblxuXHRcdH1cblxuXHRcdG5vZGUucHJvcGVydHlMaXN0ID0gcHJvcGVydHlMaXN0OyAvLyByYXcgcHJvcGVydHkgbGlzdCB1c2VkIGJ5IHBhcmVudFxuXG5cdFx0aWYgKCB0eXBlb2YgaWQgPT09ICdudW1iZXInICkgbm9kZS5pZCA9IGlkO1xuXHRcdGlmICggYXR0ck5hbWUgIT09ICcnICkgbm9kZS5hdHRyTmFtZSA9IGF0dHJOYW1lO1xuXHRcdGlmICggYXR0clR5cGUgIT09ICcnICkgbm9kZS5hdHRyVHlwZSA9IGF0dHJUeXBlO1xuXHRcdGlmICggbmFtZSAhPT0gJycgKSBub2RlLm5hbWUgPSBuYW1lO1xuXG5cdFx0cmV0dXJuIG5vZGU7XG5cblx0fVxuXG5cdHBhcnNlU3ViTm9kZSggbmFtZSwgbm9kZSwgc3ViTm9kZSApIHtcblxuXHRcdC8vIHNwZWNpYWwgY2FzZTogY2hpbGQgbm9kZSBpcyBzaW5nbGUgcHJvcGVydHlcblx0XHRpZiAoIHN1Yk5vZGUuc2luZ2xlUHJvcGVydHkgPT09IHRydWUgKSB7XG5cblx0XHRcdGNvbnN0IHZhbHVlID0gc3ViTm9kZS5wcm9wZXJ0eUxpc3RbIDAgXTtcblxuXHRcdFx0aWYgKCBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xuXG5cdFx0XHRcdG5vZGVbIHN1Yk5vZGUubmFtZSBdID0gc3ViTm9kZTtcblxuXHRcdFx0XHRzdWJOb2RlLmEgPSB2YWx1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRub2RlWyBzdWJOb2RlLm5hbWUgXSA9IHZhbHVlO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYgKCBuYW1lID09PSAnQ29ubmVjdGlvbnMnICYmIHN1Yk5vZGUubmFtZSA9PT0gJ0MnICkge1xuXG5cdFx0XHRjb25zdCBhcnJheSA9IFtdO1xuXG5cdFx0XHRzdWJOb2RlLnByb3BlcnR5TGlzdC5mb3JFYWNoKCBmdW5jdGlvbiAoIHByb3BlcnR5LCBpICkge1xuXG5cdFx0XHRcdC8vIGZpcnN0IENvbm5lY3Rpb24gaXMgRkJYIHR5cGUgKE9PLCBPUCwgZXRjLikuIFdlJ2xsIGRpc2NhcmQgdGhlc2Vcblx0XHRcdFx0aWYgKCBpICE9PSAwICkgYXJyYXkucHVzaCggcHJvcGVydHkgKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0XHRpZiAoIG5vZGUuY29ubmVjdGlvbnMgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRub2RlLmNvbm5lY3Rpb25zID0gW107XG5cblx0XHRcdH1cblxuXHRcdFx0bm9kZS5jb25uZWN0aW9ucy5wdXNoKCBhcnJheSApO1xuXG5cdFx0fSBlbHNlIGlmICggc3ViTm9kZS5uYW1lID09PSAnUHJvcGVydGllczcwJyApIHtcblxuXHRcdFx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKCBzdWJOb2RlICk7XG5cblx0XHRcdGtleXMuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG5cblx0XHRcdFx0bm9kZVsga2V5IF0gPSBzdWJOb2RlWyBrZXkgXTtcblxuXHRcdFx0fSApO1xuXG5cdFx0fSBlbHNlIGlmICggbmFtZSA9PT0gJ1Byb3BlcnRpZXM3MCcgJiYgc3ViTm9kZS5uYW1lID09PSAnUCcgKSB7XG5cblx0XHRcdGxldCBpbm5lclByb3BOYW1lID0gc3ViTm9kZS5wcm9wZXJ0eUxpc3RbIDAgXTtcblx0XHRcdGxldCBpbm5lclByb3BUeXBlMSA9IHN1Yk5vZGUucHJvcGVydHlMaXN0WyAxIF07XG5cdFx0XHRjb25zdCBpbm5lclByb3BUeXBlMiA9IHN1Yk5vZGUucHJvcGVydHlMaXN0WyAyIF07XG5cdFx0XHRjb25zdCBpbm5lclByb3BGbGFnID0gc3ViTm9kZS5wcm9wZXJ0eUxpc3RbIDMgXTtcblx0XHRcdGxldCBpbm5lclByb3BWYWx1ZTtcblxuXHRcdFx0aWYgKCBpbm5lclByb3BOYW1lLmluZGV4T2YoICdMY2wgJyApID09PSAwICkgaW5uZXJQcm9wTmFtZSA9IGlubmVyUHJvcE5hbWUucmVwbGFjZSggJ0xjbCAnLCAnTGNsXycgKTtcblx0XHRcdGlmICggaW5uZXJQcm9wVHlwZTEuaW5kZXhPZiggJ0xjbCAnICkgPT09IDAgKSBpbm5lclByb3BUeXBlMSA9IGlubmVyUHJvcFR5cGUxLnJlcGxhY2UoICdMY2wgJywgJ0xjbF8nICk7XG5cblx0XHRcdGlmICggaW5uZXJQcm9wVHlwZTEgPT09ICdDb2xvcicgfHwgaW5uZXJQcm9wVHlwZTEgPT09ICdDb2xvclJHQicgfHwgaW5uZXJQcm9wVHlwZTEgPT09ICdWZWN0b3InIHx8IGlubmVyUHJvcFR5cGUxID09PSAnVmVjdG9yM0QnIHx8IGlubmVyUHJvcFR5cGUxLmluZGV4T2YoICdMY2xfJyApID09PSAwICkge1xuXG5cdFx0XHRcdGlubmVyUHJvcFZhbHVlID0gW1xuXHRcdFx0XHRcdHN1Yk5vZGUucHJvcGVydHlMaXN0WyA0IF0sXG5cdFx0XHRcdFx0c3ViTm9kZS5wcm9wZXJ0eUxpc3RbIDUgXSxcblx0XHRcdFx0XHRzdWJOb2RlLnByb3BlcnR5TGlzdFsgNiBdXG5cdFx0XHRcdF07XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aW5uZXJQcm9wVmFsdWUgPSBzdWJOb2RlLnByb3BlcnR5TGlzdFsgNCBdO1xuXG5cdFx0XHR9XG5cblx0XHRcdC8vIHRoaXMgd2lsbCBiZSBjb3BpZWQgdG8gcGFyZW50LCBzZWUgYWJvdmVcblx0XHRcdG5vZGVbIGlubmVyUHJvcE5hbWUgXSA9IHtcblxuXHRcdFx0XHQndHlwZSc6IGlubmVyUHJvcFR5cGUxLFxuXHRcdFx0XHQndHlwZTInOiBpbm5lclByb3BUeXBlMixcblx0XHRcdFx0J2ZsYWcnOiBpbm5lclByb3BGbGFnLFxuXHRcdFx0XHQndmFsdWUnOiBpbm5lclByb3BWYWx1ZVxuXG5cdFx0XHR9O1xuXG5cdFx0fSBlbHNlIGlmICggbm9kZVsgc3ViTm9kZS5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0aWYgKCB0eXBlb2Ygc3ViTm9kZS5pZCA9PT0gJ251bWJlcicgKSB7XG5cblx0XHRcdFx0bm9kZVsgc3ViTm9kZS5uYW1lIF0gPSB7fTtcblx0XHRcdFx0bm9kZVsgc3ViTm9kZS5uYW1lIF1bIHN1Yk5vZGUuaWQgXSA9IHN1Yk5vZGU7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0bm9kZVsgc3ViTm9kZS5uYW1lIF0gPSBzdWJOb2RlO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZiAoIHN1Yk5vZGUubmFtZSA9PT0gJ1Bvc2VOb2RlJyApIHtcblxuXHRcdFx0XHRpZiAoICEgQXJyYXkuaXNBcnJheSggbm9kZVsgc3ViTm9kZS5uYW1lIF0gKSApIHtcblxuXHRcdFx0XHRcdG5vZGVbIHN1Yk5vZGUubmFtZSBdID0gWyBub2RlWyBzdWJOb2RlLm5hbWUgXSBdO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRub2RlWyBzdWJOb2RlLm5hbWUgXS5wdXNoKCBzdWJOb2RlICk7XG5cblx0XHRcdH0gZWxzZSBpZiAoIG5vZGVbIHN1Yk5vZGUubmFtZSBdWyBzdWJOb2RlLmlkIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRub2RlWyBzdWJOb2RlLm5hbWUgXVsgc3ViTm9kZS5pZCBdID0gc3ViTm9kZTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHRwYXJzZVByb3BlcnR5KCByZWFkZXIgKSB7XG5cblx0XHRjb25zdCB0eXBlID0gcmVhZGVyLmdldFN0cmluZyggMSApO1xuXHRcdGxldCBsZW5ndGg7XG5cblx0XHRzd2l0Y2ggKCB0eXBlICkge1xuXG5cdFx0XHRjYXNlICdDJzpcblx0XHRcdFx0cmV0dXJuIHJlYWRlci5nZXRCb29sZWFuKCk7XG5cblx0XHRcdGNhc2UgJ0QnOlxuXHRcdFx0XHRyZXR1cm4gcmVhZGVyLmdldEZsb2F0NjQoKTtcblxuXHRcdFx0Y2FzZSAnRic6XG5cdFx0XHRcdHJldHVybiByZWFkZXIuZ2V0RmxvYXQzMigpO1xuXG5cdFx0XHRjYXNlICdJJzpcblx0XHRcdFx0cmV0dXJuIHJlYWRlci5nZXRJbnQzMigpO1xuXG5cdFx0XHRjYXNlICdMJzpcblx0XHRcdFx0cmV0dXJuIHJlYWRlci5nZXRJbnQ2NCgpO1xuXG5cdFx0XHRjYXNlICdSJzpcblx0XHRcdFx0bGVuZ3RoID0gcmVhZGVyLmdldFVpbnQzMigpO1xuXHRcdFx0XHRyZXR1cm4gcmVhZGVyLmdldEFycmF5QnVmZmVyKCBsZW5ndGggKTtcblxuXHRcdFx0Y2FzZSAnUyc6XG5cdFx0XHRcdGxlbmd0aCA9IHJlYWRlci5nZXRVaW50MzIoKTtcblx0XHRcdFx0cmV0dXJuIHJlYWRlci5nZXRTdHJpbmcoIGxlbmd0aCApO1xuXG5cdFx0XHRjYXNlICdZJzpcblx0XHRcdFx0cmV0dXJuIHJlYWRlci5nZXRJbnQxNigpO1xuXG5cdFx0XHRjYXNlICdiJzpcblx0XHRcdGNhc2UgJ2MnOlxuXHRcdFx0Y2FzZSAnZCc6XG5cdFx0XHRjYXNlICdmJzpcblx0XHRcdGNhc2UgJ2knOlxuXHRcdFx0Y2FzZSAnbCc6XG5cblx0XHRcdFx0Y29uc3QgYXJyYXlMZW5ndGggPSByZWFkZXIuZ2V0VWludDMyKCk7XG5cdFx0XHRcdGNvbnN0IGVuY29kaW5nID0gcmVhZGVyLmdldFVpbnQzMigpOyAvLyAwOiBub24tY29tcHJlc3NlZCwgMTogY29tcHJlc3NlZFxuXHRcdFx0XHRjb25zdCBjb21wcmVzc2VkTGVuZ3RoID0gcmVhZGVyLmdldFVpbnQzMigpO1xuXG5cdFx0XHRcdGlmICggZW5jb2RpbmcgPT09IDAgKSB7XG5cblx0XHRcdFx0XHRzd2l0Y2ggKCB0eXBlICkge1xuXG5cdFx0XHRcdFx0XHRjYXNlICdiJzpcblx0XHRcdFx0XHRcdGNhc2UgJ2MnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVhZGVyLmdldEJvb2xlYW5BcnJheSggYXJyYXlMZW5ndGggKTtcblxuXHRcdFx0XHRcdFx0Y2FzZSAnZCc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZWFkZXIuZ2V0RmxvYXQ2NEFycmF5KCBhcnJheUxlbmd0aCApO1xuXG5cdFx0XHRcdFx0XHRjYXNlICdmJzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlYWRlci5nZXRGbG9hdDMyQXJyYXkoIGFycmF5TGVuZ3RoICk7XG5cblx0XHRcdFx0XHRcdGNhc2UgJ2knOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVhZGVyLmdldEludDMyQXJyYXkoIGFycmF5TGVuZ3RoICk7XG5cblx0XHRcdFx0XHRcdGNhc2UgJ2wnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVhZGVyLmdldEludDY0QXJyYXkoIGFycmF5TGVuZ3RoICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggdHlwZW9mIGZmbGF0ZSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCAnVEhSRUUuRkJYTG9hZGVyOiBFeHRlcm5hbCBsaWJyYXJ5IGZmbGF0ZS5taW4uanMgcmVxdWlyZWQuJyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBkYXRhID0gZmZsYXRlLnVuemxpYlN5bmMoIG5ldyBVaW50OEFycmF5KCByZWFkZXIuZ2V0QXJyYXlCdWZmZXIoIGNvbXByZXNzZWRMZW5ndGggKSApICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblx0XHRcdFx0Y29uc3QgcmVhZGVyMiA9IG5ldyBCaW5hcnlSZWFkZXIoIGRhdGEuYnVmZmVyICk7XG5cblx0XHRcdFx0c3dpdGNoICggdHlwZSApIHtcblxuXHRcdFx0XHRcdGNhc2UgJ2InOlxuXHRcdFx0XHRcdGNhc2UgJ2MnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlYWRlcjIuZ2V0Qm9vbGVhbkFycmF5KCBhcnJheUxlbmd0aCApO1xuXG5cdFx0XHRcdFx0Y2FzZSAnZCc6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVhZGVyMi5nZXRGbG9hdDY0QXJyYXkoIGFycmF5TGVuZ3RoICk7XG5cblx0XHRcdFx0XHRjYXNlICdmJzpcblx0XHRcdFx0XHRcdHJldHVybiByZWFkZXIyLmdldEZsb2F0MzJBcnJheSggYXJyYXlMZW5ndGggKTtcblxuXHRcdFx0XHRcdGNhc2UgJ2knOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlYWRlcjIuZ2V0SW50MzJBcnJheSggYXJyYXlMZW5ndGggKTtcblxuXHRcdFx0XHRcdGNhc2UgJ2wnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlYWRlcjIuZ2V0SW50NjRBcnJheSggYXJyYXlMZW5ndGggKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLkZCWExvYWRlcjogVW5rbm93biBwcm9wZXJ0eSB0eXBlICcgKyB0eXBlICk7XG5cblx0XHR9XG5cblx0fVxuXG59XG5cbmNsYXNzIEJpbmFyeVJlYWRlciB7XG5cblx0Y29uc3RydWN0b3IoIGJ1ZmZlciwgbGl0dGxlRW5kaWFuICkge1xuXG5cdFx0dGhpcy5kdiA9IG5ldyBEYXRhVmlldyggYnVmZmVyICk7XG5cdFx0dGhpcy5vZmZzZXQgPSAwO1xuXHRcdHRoaXMubGl0dGxlRW5kaWFuID0gKCBsaXR0bGVFbmRpYW4gIT09IHVuZGVmaW5lZCApID8gbGl0dGxlRW5kaWFuIDogdHJ1ZTtcblxuXHR9XG5cblx0Z2V0T2Zmc2V0KCkge1xuXG5cdFx0cmV0dXJuIHRoaXMub2Zmc2V0O1xuXG5cdH1cblxuXHRzaXplKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuZHYuYnVmZmVyLmJ5dGVMZW5ndGg7XG5cblx0fVxuXG5cdHNraXAoIGxlbmd0aCApIHtcblxuXHRcdHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcblxuXHR9XG5cblx0Ly8gc2VlbXMgbGlrZSB0cnVlL2ZhbHNlIHJlcHJlc2VudGF0aW9uIGRlcGVuZHMgb24gZXhwb3J0ZXIuXG5cdC8vIHRydWU6IDEgb3IgJ1knKD0weDU5KSwgZmFsc2U6IDAgb3IgJ1QnKD0weDU0KVxuXHQvLyB0aGVuIHNlZXMgTFNCLlxuXHRnZXRCb29sZWFuKCkge1xuXG5cdFx0cmV0dXJuICggdGhpcy5nZXRVaW50OCgpICYgMSApID09PSAxO1xuXG5cdH1cblxuXHRnZXRCb29sZWFuQXJyYXkoIHNpemUgKSB7XG5cblx0XHRjb25zdCBhID0gW107XG5cblx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBzaXplOyBpICsrICkge1xuXG5cdFx0XHRhLnB1c2goIHRoaXMuZ2V0Qm9vbGVhbigpICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gYTtcblxuXHR9XG5cblx0Z2V0VWludDgoKSB7XG5cblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZHYuZ2V0VWludDgoIHRoaXMub2Zmc2V0ICk7XG5cdFx0dGhpcy5vZmZzZXQgKz0gMTtcblx0XHRyZXR1cm4gdmFsdWU7XG5cblx0fVxuXG5cdGdldEludDE2KCkge1xuXG5cdFx0Y29uc3QgdmFsdWUgPSB0aGlzLmR2LmdldEludDE2KCB0aGlzLm9mZnNldCwgdGhpcy5saXR0bGVFbmRpYW4gKTtcblx0XHR0aGlzLm9mZnNldCArPSAyO1xuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9XG5cblx0Z2V0SW50MzIoKSB7XG5cblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZHYuZ2V0SW50MzIoIHRoaXMub2Zmc2V0LCB0aGlzLmxpdHRsZUVuZGlhbiApO1xuXHRcdHRoaXMub2Zmc2V0ICs9IDQ7XG5cdFx0cmV0dXJuIHZhbHVlO1xuXG5cdH1cblxuXHRnZXRJbnQzMkFycmF5KCBzaXplICkge1xuXG5cdFx0Y29uc3QgYSA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSArKyApIHtcblxuXHRcdFx0YS5wdXNoKCB0aGlzLmdldEludDMyKCkgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBhO1xuXG5cdH1cblxuXHRnZXRVaW50MzIoKSB7XG5cblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZHYuZ2V0VWludDMyKCB0aGlzLm9mZnNldCwgdGhpcy5saXR0bGVFbmRpYW4gKTtcblx0XHR0aGlzLm9mZnNldCArPSA0O1xuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9XG5cblx0Ly8gSmF2YVNjcmlwdCBkb2Vzbid0IHN1cHBvcnQgNjQtYml0IGludGVnZXIgc28gY2FsY3VsYXRlIHRoaXMgaGVyZVxuXHQvLyAxIDw8IDMyIHdpbGwgcmV0dXJuIDEgc28gdXNpbmcgbXVsdGlwbHkgb3BlcmF0aW9uIGluc3RlYWQgaGVyZS5cblx0Ly8gVGhlcmUncyBhIHBvc3NpYmlsaXR5IHRoYXQgdGhpcyBtZXRob2QgcmV0dXJucyB3cm9uZyB2YWx1ZSBpZiB0aGUgdmFsdWVcblx0Ly8gaXMgb3V0IG9mIHRoZSByYW5nZSBiZXR3ZWVuIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIGFuZCBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUi5cblx0Ly8gVE9ETzogc2FmZWx5IGhhbmRsZSA2NC1iaXQgaW50ZWdlclxuXHRnZXRJbnQ2NCgpIHtcblxuXHRcdGxldCBsb3csIGhpZ2g7XG5cblx0XHRpZiAoIHRoaXMubGl0dGxlRW5kaWFuICkge1xuXG5cdFx0XHRsb3cgPSB0aGlzLmdldFVpbnQzMigpO1xuXHRcdFx0aGlnaCA9IHRoaXMuZ2V0VWludDMyKCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRoaWdoID0gdGhpcy5nZXRVaW50MzIoKTtcblx0XHRcdGxvdyA9IHRoaXMuZ2V0VWludDMyKCk7XG5cblx0XHR9XG5cblx0XHQvLyBjYWxjdWxhdGUgbmVnYXRpdmUgdmFsdWVcblx0XHRpZiAoIGhpZ2ggJiAweDgwMDAwMDAwICkge1xuXG5cdFx0XHRoaWdoID0gfiBoaWdoICYgMHhGRkZGRkZGRjtcblx0XHRcdGxvdyA9IH4gbG93ICYgMHhGRkZGRkZGRjtcblxuXHRcdFx0aWYgKCBsb3cgPT09IDB4RkZGRkZGRkYgKSBoaWdoID0gKCBoaWdoICsgMSApICYgMHhGRkZGRkZGRjtcblxuXHRcdFx0bG93ID0gKCBsb3cgKyAxICkgJiAweEZGRkZGRkZGO1xuXG5cdFx0XHRyZXR1cm4gLSAoIGhpZ2ggKiAweDEwMDAwMDAwMCArIGxvdyApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhpZ2ggKiAweDEwMDAwMDAwMCArIGxvdztcblxuXHR9XG5cblx0Z2V0SW50NjRBcnJheSggc2l6ZSApIHtcblxuXHRcdGNvbnN0IGEgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IHNpemU7IGkgKysgKSB7XG5cblx0XHRcdGEucHVzaCggdGhpcy5nZXRJbnQ2NCgpICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gYTtcblxuXHR9XG5cblx0Ly8gTm90ZTogc2VlIGdldEludDY0KCkgY29tbWVudFxuXHRnZXRVaW50NjQoKSB7XG5cblx0XHRsZXQgbG93LCBoaWdoO1xuXG5cdFx0aWYgKCB0aGlzLmxpdHRsZUVuZGlhbiApIHtcblxuXHRcdFx0bG93ID0gdGhpcy5nZXRVaW50MzIoKTtcblx0XHRcdGhpZ2ggPSB0aGlzLmdldFVpbnQzMigpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aGlnaCA9IHRoaXMuZ2V0VWludDMyKCk7XG5cdFx0XHRsb3cgPSB0aGlzLmdldFVpbnQzMigpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhpZ2ggKiAweDEwMDAwMDAwMCArIGxvdztcblxuXHR9XG5cblx0Z2V0RmxvYXQzMigpIHtcblxuXHRcdGNvbnN0IHZhbHVlID0gdGhpcy5kdi5nZXRGbG9hdDMyKCB0aGlzLm9mZnNldCwgdGhpcy5saXR0bGVFbmRpYW4gKTtcblx0XHR0aGlzLm9mZnNldCArPSA0O1xuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9XG5cblx0Z2V0RmxvYXQzMkFycmF5KCBzaXplICkge1xuXG5cdFx0Y29uc3QgYSA9IFtdO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSArKyApIHtcblxuXHRcdFx0YS5wdXNoKCB0aGlzLmdldEZsb2F0MzIoKSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGE7XG5cblx0fVxuXG5cdGdldEZsb2F0NjQoKSB7XG5cblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZHYuZ2V0RmxvYXQ2NCggdGhpcy5vZmZzZXQsIHRoaXMubGl0dGxlRW5kaWFuICk7XG5cdFx0dGhpcy5vZmZzZXQgKz0gODtcblx0XHRyZXR1cm4gdmFsdWU7XG5cblx0fVxuXG5cdGdldEZsb2F0NjRBcnJheSggc2l6ZSApIHtcblxuXHRcdGNvbnN0IGEgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IHNpemU7IGkgKysgKSB7XG5cblx0XHRcdGEucHVzaCggdGhpcy5nZXRGbG9hdDY0KCkgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBhO1xuXG5cdH1cblxuXHRnZXRBcnJheUJ1ZmZlciggc2l6ZSApIHtcblxuXHRcdGNvbnN0IHZhbHVlID0gdGhpcy5kdi5idWZmZXIuc2xpY2UoIHRoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArIHNpemUgKTtcblx0XHR0aGlzLm9mZnNldCArPSBzaXplO1xuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9XG5cblx0Z2V0U3RyaW5nKCBzaXplICkge1xuXG5cdFx0Ly8gbm90ZTogc2FmYXJpIDkgZG9lc24ndCBzdXBwb3J0IFVpbnQ4QXJyYXkuaW5kZXhPZjsgY3JlYXRlIGludGVybWVkaWF0ZSBhcnJheSBpbnN0ZWFkXG5cdFx0bGV0IGEgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IHNpemU7IGkgKysgKSB7XG5cblx0XHRcdGFbIGkgXSA9IHRoaXMuZ2V0VWludDgoKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IG51bGxCeXRlID0gYS5pbmRleE9mKCAwICk7XG5cdFx0aWYgKCBudWxsQnl0ZSA+PSAwICkgYSA9IGEuc2xpY2UoIDAsIG51bGxCeXRlICk7XG5cblx0XHRyZXR1cm4gTG9hZGVyVXRpbHMuZGVjb2RlVGV4dCggbmV3IFVpbnQ4QXJyYXkoIGEgKSApO1xuXG5cdH1cblxufVxuXG4vLyBGQlhUcmVlIGhvbGRzIGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIEZCWCBkYXRhLCByZXR1cm5lZCBieSB0aGUgVGV4dFBhcnNlciAoIEZCWCBBU0NJSSBmb3JtYXQpXG4vLyBhbmQgQmluYXJ5UGFyc2VyKCBGQlggQmluYXJ5IGZvcm1hdClcbmNsYXNzIEZCWFRyZWUge1xuXG5cdGFkZCgga2V5LCB2YWwgKSB7XG5cblx0XHR0aGlzWyBrZXkgXSA9IHZhbDtcblxuXHR9XG5cbn1cblxuLy8gKioqKioqKioqKioqKiogVVRJTElUWSBGVU5DVElPTlMgKioqKioqKioqKioqKipcblxuZnVuY3Rpb24gaXNGYnhGb3JtYXRCaW5hcnkoIGJ1ZmZlciApIHtcblxuXHRjb25zdCBDT1JSRUNUID0gJ0theWRhcmFcXHUwMDIwRkJYXFx1MDAyMEJpbmFyeVxcdTAwMjBcXHUwMDIwXFwwJztcblxuXHRyZXR1cm4gYnVmZmVyLmJ5dGVMZW5ndGggPj0gQ09SUkVDVC5sZW5ndGggJiYgQ09SUkVDVCA9PT0gY29udmVydEFycmF5QnVmZmVyVG9TdHJpbmcoIGJ1ZmZlciwgMCwgQ09SUkVDVC5sZW5ndGggKTtcblxufVxuXG5mdW5jdGlvbiBpc0ZieEZvcm1hdEFTQ0lJKCB0ZXh0ICkge1xuXG5cdGNvbnN0IENPUlJFQ1QgPSBbICdLJywgJ2EnLCAneScsICdkJywgJ2EnLCAncicsICdhJywgJ1xcXFwnLCAnRicsICdCJywgJ1gnLCAnXFxcXCcsICdCJywgJ2knLCAnbicsICdhJywgJ3InLCAneScsICdcXFxcJywgJ1xcXFwnIF07XG5cblx0bGV0IGN1cnNvciA9IDA7XG5cblx0ZnVuY3Rpb24gcmVhZCggb2Zmc2V0ICkge1xuXG5cdFx0Y29uc3QgcmVzdWx0ID0gdGV4dFsgb2Zmc2V0IC0gMSBdO1xuXHRcdHRleHQgPSB0ZXh0LnNsaWNlKCBjdXJzb3IgKyBvZmZzZXQgKTtcblx0XHRjdXJzb3IgKys7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblxuXHR9XG5cblx0Zm9yICggbGV0IGkgPSAwOyBpIDwgQ09SUkVDVC5sZW5ndGg7ICsrIGkgKSB7XG5cblx0XHRjb25zdCBudW0gPSByZWFkKCAxICk7XG5cdFx0aWYgKCBudW0gPT09IENPUlJFQ1RbIGkgXSApIHtcblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcblxufVxuXG5mdW5jdGlvbiBnZXRGYnhWZXJzaW9uKCB0ZXh0ICkge1xuXG5cdGNvbnN0IHZlcnNpb25SZWdFeHAgPSAvRkJYVmVyc2lvbjogKFxcZCspLztcblx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKCB2ZXJzaW9uUmVnRXhwICk7XG5cblx0aWYgKCBtYXRjaCApIHtcblxuXHRcdGNvbnN0IHZlcnNpb24gPSBwYXJzZUludCggbWF0Y2hbIDEgXSApO1xuXHRcdHJldHVybiB2ZXJzaW9uO1xuXG5cdH1cblxuXHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5GQlhMb2FkZXI6IENhbm5vdCBmaW5kIHRoZSB2ZXJzaW9uIG51bWJlciBmb3IgdGhlIGZpbGUgZ2l2ZW4uJyApO1xuXG59XG5cbi8vIENvbnZlcnRzIEZCWCB0aWNrcyBpbnRvIHJlYWwgdGltZSBzZWNvbmRzLlxuZnVuY3Rpb24gY29udmVydEZCWFRpbWVUb1NlY29uZHMoIHRpbWUgKSB7XG5cblx0cmV0dXJuIHRpbWUgLyA0NjE4NjE1ODAwMDtcblxufVxuXG5jb25zdCBkYXRhQXJyYXkgPSBbXTtcblxuLy8gZXh0cmFjdHMgdGhlIGRhdGEgZnJvbSB0aGUgY29ycmVjdCBwb3NpdGlvbiBpbiB0aGUgRkJYIGFycmF5IGJhc2VkIG9uIGluZGV4aW5nIHR5cGVcbmZ1bmN0aW9uIGdldERhdGEoIHBvbHlnb25WZXJ0ZXhJbmRleCwgcG9seWdvbkluZGV4LCB2ZXJ0ZXhJbmRleCwgaW5mb09iamVjdCApIHtcblxuXHRsZXQgaW5kZXg7XG5cblx0c3dpdGNoICggaW5mb09iamVjdC5tYXBwaW5nVHlwZSApIHtcblxuXHRcdGNhc2UgJ0J5UG9seWdvblZlcnRleCcgOlxuXHRcdFx0aW5kZXggPSBwb2x5Z29uVmVydGV4SW5kZXg7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdCeVBvbHlnb24nIDpcblx0XHRcdGluZGV4ID0gcG9seWdvbkluZGV4O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnQnlWZXJ0aWNlJyA6XG5cdFx0XHRpbmRleCA9IHZlcnRleEluZGV4O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnQWxsU2FtZScgOlxuXHRcdFx0aW5kZXggPSBpbmZvT2JqZWN0LmluZGljZXNbIDAgXTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQgOlxuXHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuRkJYTG9hZGVyOiB1bmtub3duIGF0dHJpYnV0ZSBtYXBwaW5nIHR5cGUgJyArIGluZm9PYmplY3QubWFwcGluZ1R5cGUgKTtcblxuXHR9XG5cblx0aWYgKCBpbmZvT2JqZWN0LnJlZmVyZW5jZVR5cGUgPT09ICdJbmRleFRvRGlyZWN0JyApIGluZGV4ID0gaW5mb09iamVjdC5pbmRpY2VzWyBpbmRleCBdO1xuXG5cdGNvbnN0IGZyb20gPSBpbmRleCAqIGluZm9PYmplY3QuZGF0YVNpemU7XG5cdGNvbnN0IHRvID0gZnJvbSArIGluZm9PYmplY3QuZGF0YVNpemU7XG5cblx0cmV0dXJuIHNsaWNlKCBkYXRhQXJyYXksIGluZm9PYmplY3QuYnVmZmVyLCBmcm9tLCB0byApO1xuXG59XG5cbmNvbnN0IHRlbXBFdWxlciA9IG5ldyBFdWxlcigpO1xuY29uc3QgdGVtcFZlYyA9IG5ldyBWZWN0b3IzKCk7XG5cbi8vIGdlbmVyYXRlIHRyYW5zZm9ybWF0aW9uIGZyb20gRkJYIHRyYW5zZm9ybSBkYXRhXG4vLyByZWY6IGh0dHBzOi8vaGVscC5hdXRvZGVzay5jb20vdmlldy9GQlgvMjAxNy9FTlUvP2d1aWQ9X19maWxlc19HVUlEXzEwQ0RENjNDXzc5QzFfNEYyRF9CQjI4X0FEMkJFNjVBMDJFRF9odG1cbi8vIHJlZjogaHR0cDovL2RvY3MuYXV0b2Rlc2suY29tL0ZCWC8yMDE0L0VOVS9GQlgtU0RLLURvY3VtZW50YXRpb24vaW5kZXguaHRtbD91cmw9Y3BwX3JlZi9fdHJhbnNmb3JtYXRpb25zXzJtYWluXzhjeHgtZXhhbXBsZS5odG1sLHRvcGljTnVtYmVyPWNwcF9yZWZfX3RyYW5zZm9ybWF0aW9uc18ybWFpbl84Y3h4X2V4YW1wbGVfaHRtbGZjMTBhMWUxLWIxOGQtNGU3Mi05ZGMwLTcwZDBmMTk1OWY1ZVxuZnVuY3Rpb24gZ2VuZXJhdGVUcmFuc2Zvcm0oIHRyYW5zZm9ybURhdGEgKSB7XG5cblx0Y29uc3QgbFRyYW5zbGF0aW9uTSA9IG5ldyBNYXRyaXg0KCk7XG5cdGNvbnN0IGxQcmVSb3RhdGlvbk0gPSBuZXcgTWF0cml4NCgpO1xuXHRjb25zdCBsUm90YXRpb25NID0gbmV3IE1hdHJpeDQoKTtcblx0Y29uc3QgbFBvc3RSb3RhdGlvbk0gPSBuZXcgTWF0cml4NCgpO1xuXG5cdGNvbnN0IGxTY2FsaW5nTSA9IG5ldyBNYXRyaXg0KCk7XG5cdGNvbnN0IGxTY2FsaW5nUGl2b3RNID0gbmV3IE1hdHJpeDQoKTtcblx0Y29uc3QgbFNjYWxpbmdPZmZzZXRNID0gbmV3IE1hdHJpeDQoKTtcblx0Y29uc3QgbFJvdGF0aW9uT2Zmc2V0TSA9IG5ldyBNYXRyaXg0KCk7XG5cdGNvbnN0IGxSb3RhdGlvblBpdm90TSA9IG5ldyBNYXRyaXg0KCk7XG5cblx0Y29uc3QgbFBhcmVudEdYID0gbmV3IE1hdHJpeDQoKTtcblx0Y29uc3QgbFBhcmVudExYID0gbmV3IE1hdHJpeDQoKTtcblx0Y29uc3QgbEdsb2JhbFQgPSBuZXcgTWF0cml4NCgpO1xuXG5cdGNvbnN0IGluaGVyaXRUeXBlID0gKCB0cmFuc2Zvcm1EYXRhLmluaGVyaXRUeXBlICkgPyB0cmFuc2Zvcm1EYXRhLmluaGVyaXRUeXBlIDogMDtcblxuXHRpZiAoIHRyYW5zZm9ybURhdGEudHJhbnNsYXRpb24gKSBsVHJhbnNsYXRpb25NLnNldFBvc2l0aW9uKCB0ZW1wVmVjLmZyb21BcnJheSggdHJhbnNmb3JtRGF0YS50cmFuc2xhdGlvbiApICk7XG5cblx0aWYgKCB0cmFuc2Zvcm1EYXRhLnByZVJvdGF0aW9uICkge1xuXG5cdFx0Y29uc3QgYXJyYXkgPSB0cmFuc2Zvcm1EYXRhLnByZVJvdGF0aW9uLm1hcCggTWF0aFV0aWxzLmRlZ1RvUmFkICk7XG5cdFx0YXJyYXkucHVzaCggdHJhbnNmb3JtRGF0YS5ldWxlck9yZGVyICk7XG5cdFx0bFByZVJvdGF0aW9uTS5tYWtlUm90YXRpb25Gcm9tRXVsZXIoIHRlbXBFdWxlci5mcm9tQXJyYXkoIGFycmF5ICkgKTtcblxuXHR9XG5cblx0aWYgKCB0cmFuc2Zvcm1EYXRhLnJvdGF0aW9uICkge1xuXG5cdFx0Y29uc3QgYXJyYXkgPSB0cmFuc2Zvcm1EYXRhLnJvdGF0aW9uLm1hcCggTWF0aFV0aWxzLmRlZ1RvUmFkICk7XG5cdFx0YXJyYXkucHVzaCggdHJhbnNmb3JtRGF0YS5ldWxlck9yZGVyICk7XG5cdFx0bFJvdGF0aW9uTS5tYWtlUm90YXRpb25Gcm9tRXVsZXIoIHRlbXBFdWxlci5mcm9tQXJyYXkoIGFycmF5ICkgKTtcblxuXHR9XG5cblx0aWYgKCB0cmFuc2Zvcm1EYXRhLnBvc3RSb3RhdGlvbiApIHtcblxuXHRcdGNvbnN0IGFycmF5ID0gdHJhbnNmb3JtRGF0YS5wb3N0Um90YXRpb24ubWFwKCBNYXRoVXRpbHMuZGVnVG9SYWQgKTtcblx0XHRhcnJheS5wdXNoKCB0cmFuc2Zvcm1EYXRhLmV1bGVyT3JkZXIgKTtcblx0XHRsUG9zdFJvdGF0aW9uTS5tYWtlUm90YXRpb25Gcm9tRXVsZXIoIHRlbXBFdWxlci5mcm9tQXJyYXkoIGFycmF5ICkgKTtcblx0XHRsUG9zdFJvdGF0aW9uTS5pbnZlcnQoKTtcblxuXHR9XG5cblx0aWYgKCB0cmFuc2Zvcm1EYXRhLnNjYWxlICkgbFNjYWxpbmdNLnNjYWxlKCB0ZW1wVmVjLmZyb21BcnJheSggdHJhbnNmb3JtRGF0YS5zY2FsZSApICk7XG5cblx0Ly8gUGl2b3RzIGFuZCBvZmZzZXRzXG5cdGlmICggdHJhbnNmb3JtRGF0YS5zY2FsaW5nT2Zmc2V0ICkgbFNjYWxpbmdPZmZzZXRNLnNldFBvc2l0aW9uKCB0ZW1wVmVjLmZyb21BcnJheSggdHJhbnNmb3JtRGF0YS5zY2FsaW5nT2Zmc2V0ICkgKTtcblx0aWYgKCB0cmFuc2Zvcm1EYXRhLnNjYWxpbmdQaXZvdCApIGxTY2FsaW5nUGl2b3RNLnNldFBvc2l0aW9uKCB0ZW1wVmVjLmZyb21BcnJheSggdHJhbnNmb3JtRGF0YS5zY2FsaW5nUGl2b3QgKSApO1xuXHRpZiAoIHRyYW5zZm9ybURhdGEucm90YXRpb25PZmZzZXQgKSBsUm90YXRpb25PZmZzZXRNLnNldFBvc2l0aW9uKCB0ZW1wVmVjLmZyb21BcnJheSggdHJhbnNmb3JtRGF0YS5yb3RhdGlvbk9mZnNldCApICk7XG5cdGlmICggdHJhbnNmb3JtRGF0YS5yb3RhdGlvblBpdm90ICkgbFJvdGF0aW9uUGl2b3RNLnNldFBvc2l0aW9uKCB0ZW1wVmVjLmZyb21BcnJheSggdHJhbnNmb3JtRGF0YS5yb3RhdGlvblBpdm90ICkgKTtcblxuXHQvLyBwYXJlbnQgdHJhbnNmb3JtXG5cdGlmICggdHJhbnNmb3JtRGF0YS5wYXJlbnRNYXRyaXhXb3JsZCApIHtcblxuXHRcdGxQYXJlbnRMWC5jb3B5KCB0cmFuc2Zvcm1EYXRhLnBhcmVudE1hdHJpeCApO1xuXHRcdGxQYXJlbnRHWC5jb3B5KCB0cmFuc2Zvcm1EYXRhLnBhcmVudE1hdHJpeFdvcmxkICk7XG5cblx0fVxuXG5cdGNvbnN0IGxMUk0gPSBsUHJlUm90YXRpb25NLmNsb25lKCkubXVsdGlwbHkoIGxSb3RhdGlvbk0gKS5tdWx0aXBseSggbFBvc3RSb3RhdGlvbk0gKTtcblx0Ly8gR2xvYmFsIFJvdGF0aW9uXG5cdGNvbnN0IGxQYXJlbnRHUk0gPSBuZXcgTWF0cml4NCgpO1xuXHRsUGFyZW50R1JNLmV4dHJhY3RSb3RhdGlvbiggbFBhcmVudEdYICk7XG5cblx0Ly8gR2xvYmFsIFNoZWFyKlNjYWxpbmdcblx0Y29uc3QgbFBhcmVudFRNID0gbmV3IE1hdHJpeDQoKTtcblx0bFBhcmVudFRNLmNvcHlQb3NpdGlvbiggbFBhcmVudEdYICk7XG5cblx0Y29uc3QgbFBhcmVudEdSU00gPSBsUGFyZW50VE0uY2xvbmUoKS5pbnZlcnQoKS5tdWx0aXBseSggbFBhcmVudEdYICk7XG5cdGNvbnN0IGxQYXJlbnRHU00gPSBsUGFyZW50R1JNLmNsb25lKCkuaW52ZXJ0KCkubXVsdGlwbHkoIGxQYXJlbnRHUlNNICk7XG5cdGNvbnN0IGxMU00gPSBsU2NhbGluZ007XG5cblx0Y29uc3QgbEdsb2JhbFJTID0gbmV3IE1hdHJpeDQoKTtcblxuXHRpZiAoIGluaGVyaXRUeXBlID09PSAwICkge1xuXG5cdFx0bEdsb2JhbFJTLmNvcHkoIGxQYXJlbnRHUk0gKS5tdWx0aXBseSggbExSTSApLm11bHRpcGx5KCBsUGFyZW50R1NNICkubXVsdGlwbHkoIGxMU00gKTtcblxuXHR9IGVsc2UgaWYgKCBpbmhlcml0VHlwZSA9PT0gMSApIHtcblxuXHRcdGxHbG9iYWxSUy5jb3B5KCBsUGFyZW50R1JNICkubXVsdGlwbHkoIGxQYXJlbnRHU00gKS5tdWx0aXBseSggbExSTSApLm11bHRpcGx5KCBsTFNNICk7XG5cblx0fSBlbHNlIHtcblxuXHRcdGNvbnN0IGxQYXJlbnRMU00gPSBuZXcgTWF0cml4NCgpLnNjYWxlKCBuZXcgVmVjdG9yMygpLnNldEZyb21NYXRyaXhTY2FsZSggbFBhcmVudExYICkgKTtcblx0XHRjb25zdCBsUGFyZW50TFNNX2ludiA9IGxQYXJlbnRMU00uY2xvbmUoKS5pbnZlcnQoKTtcblx0XHRjb25zdCBsUGFyZW50R1NNX25vTG9jYWwgPSBsUGFyZW50R1NNLmNsb25lKCkubXVsdGlwbHkoIGxQYXJlbnRMU01faW52ICk7XG5cblx0XHRsR2xvYmFsUlMuY29weSggbFBhcmVudEdSTSApLm11bHRpcGx5KCBsTFJNICkubXVsdGlwbHkoIGxQYXJlbnRHU01fbm9Mb2NhbCApLm11bHRpcGx5KCBsTFNNICk7XG5cblx0fVxuXG5cdGNvbnN0IGxSb3RhdGlvblBpdm90TV9pbnYgPSBsUm90YXRpb25QaXZvdE0uY2xvbmUoKS5pbnZlcnQoKTtcblx0Y29uc3QgbFNjYWxpbmdQaXZvdE1faW52ID0gbFNjYWxpbmdQaXZvdE0uY2xvbmUoKS5pbnZlcnQoKTtcblx0Ly8gQ2FsY3VsYXRlIHRoZSBsb2NhbCB0cmFuc2Zvcm0gbWF0cml4XG5cdGxldCBsVHJhbnNmb3JtID0gbFRyYW5zbGF0aW9uTS5jbG9uZSgpLm11bHRpcGx5KCBsUm90YXRpb25PZmZzZXRNICkubXVsdGlwbHkoIGxSb3RhdGlvblBpdm90TSApLm11bHRpcGx5KCBsUHJlUm90YXRpb25NICkubXVsdGlwbHkoIGxSb3RhdGlvbk0gKS5tdWx0aXBseSggbFBvc3RSb3RhdGlvbk0gKS5tdWx0aXBseSggbFJvdGF0aW9uUGl2b3RNX2ludiApLm11bHRpcGx5KCBsU2NhbGluZ09mZnNldE0gKS5tdWx0aXBseSggbFNjYWxpbmdQaXZvdE0gKS5tdWx0aXBseSggbFNjYWxpbmdNICkubXVsdGlwbHkoIGxTY2FsaW5nUGl2b3RNX2ludiApO1xuXG5cdGNvbnN0IGxMb2NhbFRXaXRoQWxsUGl2b3RBbmRPZmZzZXRJbmZvID0gbmV3IE1hdHJpeDQoKS5jb3B5UG9zaXRpb24oIGxUcmFuc2Zvcm0gKTtcblxuXHRjb25zdCBsR2xvYmFsVHJhbnNsYXRpb24gPSBsUGFyZW50R1guY2xvbmUoKS5tdWx0aXBseSggbExvY2FsVFdpdGhBbGxQaXZvdEFuZE9mZnNldEluZm8gKTtcblx0bEdsb2JhbFQuY29weVBvc2l0aW9uKCBsR2xvYmFsVHJhbnNsYXRpb24gKTtcblxuXHRsVHJhbnNmb3JtID0gbEdsb2JhbFQuY2xvbmUoKS5tdWx0aXBseSggbEdsb2JhbFJTICk7XG5cblx0Ly8gZnJvbSBnbG9iYWwgdG8gbG9jYWxcblx0bFRyYW5zZm9ybS5wcmVtdWx0aXBseSggbFBhcmVudEdYLmludmVydCgpICk7XG5cblx0cmV0dXJuIGxUcmFuc2Zvcm07XG5cbn1cblxuLy8gUmV0dXJucyB0aGUgdGhyZWUuanMgaW50cmluc2ljIEV1bGVyIG9yZGVyIGNvcnJlc3BvbmRpbmcgdG8gRkJYIGV4dHJpbnNpYyBFdWxlciBvcmRlclxuLy8gcmVmOiBodHRwOi8vaGVscC5hdXRvZGVzay5jb20vdmlldy9GQlgvMjAxNy9FTlUvP2d1aWQ9X19jcHBfcmVmX2NsYXNzX2ZieF9ldWxlcl9odG1sXG5mdW5jdGlvbiBnZXRFdWxlck9yZGVyKCBvcmRlciApIHtcblxuXHRvcmRlciA9IG9yZGVyIHx8IDA7XG5cblx0Y29uc3QgZW51bXMgPSBbXG5cdFx0J1pZWCcsIC8vIC0+IFhZWiBleHRyaW5zaWNcblx0XHQnWVpYJywgLy8gLT4gWFpZIGV4dHJpbnNpY1xuXHRcdCdYWlknLCAvLyAtPiBZWlggZXh0cmluc2ljXG5cdFx0J1pYWScsIC8vIC0+IFlYWiBleHRyaW5zaWNcblx0XHQnWVhaJywgLy8gLT4gWlhZIGV4dHJpbnNpY1xuXHRcdCdYWVonLCAvLyAtPiBaWVggZXh0cmluc2ljXG5cdFx0Ly8nU3BoZXJpY1hZWicsIC8vIG5vdCBwb3NzaWJsZSB0byBzdXBwb3J0XG5cdF07XG5cblx0aWYgKCBvcmRlciA9PT0gNiApIHtcblxuXHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkZCWExvYWRlcjogdW5zdXBwb3J0ZWQgRXVsZXIgT3JkZXI6IFNwaGVyaWNhbCBYWVouIEFuaW1hdGlvbnMgYW5kIHJvdGF0aW9ucyBtYXkgYmUgaW5jb3JyZWN0LicgKTtcblx0XHRyZXR1cm4gZW51bXNbIDAgXTtcblxuXHR9XG5cblx0cmV0dXJuIGVudW1zWyBvcmRlciBdO1xuXG59XG5cbi8vIFBhcnNlcyBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBudW1iZXJzIGFuZCByZXR1cm5zIHRoZW0gYW4gYXJyYXkuXG4vLyBVc2VkIGludGVybmFsbHkgYnkgdGhlIFRleHRQYXJzZXJcbmZ1bmN0aW9uIHBhcnNlTnVtYmVyQXJyYXkoIHZhbHVlICkge1xuXG5cdGNvbnN0IGFycmF5ID0gdmFsdWUuc3BsaXQoICcsJyApLm1hcCggZnVuY3Rpb24gKCB2YWwgKSB7XG5cblx0XHRyZXR1cm4gcGFyc2VGbG9hdCggdmFsICk7XG5cblx0fSApO1xuXG5cdHJldHVybiBhcnJheTtcblxufVxuXG5mdW5jdGlvbiBjb252ZXJ0QXJyYXlCdWZmZXJUb1N0cmluZyggYnVmZmVyLCBmcm9tLCB0byApIHtcblxuXHRpZiAoIGZyb20gPT09IHVuZGVmaW5lZCApIGZyb20gPSAwO1xuXHRpZiAoIHRvID09PSB1bmRlZmluZWQgKSB0byA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xuXG5cdHJldHVybiBMb2FkZXJVdGlscy5kZWNvZGVUZXh0KCBuZXcgVWludDhBcnJheSggYnVmZmVyLCBmcm9tLCB0byApICk7XG5cbn1cblxuZnVuY3Rpb24gYXBwZW5kKCBhLCBiICkge1xuXG5cdGZvciAoIGxldCBpID0gMCwgaiA9IGEubGVuZ3RoLCBsID0gYi5sZW5ndGg7IGkgPCBsOyBpICsrLCBqICsrICkge1xuXG5cdFx0YVsgaiBdID0gYlsgaSBdO1xuXG5cdH1cblxufVxuXG5mdW5jdGlvbiBzbGljZSggYSwgYiwgZnJvbSwgdG8gKSB7XG5cblx0Zm9yICggbGV0IGkgPSBmcm9tLCBqID0gMDsgaSA8IHRvOyBpICsrLCBqICsrICkge1xuXG5cdFx0YVsgaiBdID0gYlsgaSBdO1xuXG5cdH1cblxuXHRyZXR1cm4gYTtcblxufVxuXG4vLyBpbmplY3QgYXJyYXkgYTIgaW50byBhcnJheSBhMSBhdCBpbmRleFxuZnVuY3Rpb24gaW5qZWN0KCBhMSwgaW5kZXgsIGEyICkge1xuXG5cdHJldHVybiBhMS5zbGljZSggMCwgaW5kZXggKS5jb25jYXQoIGEyICkuY29uY2F0KCBhMS5zbGljZSggaW5kZXggKSApO1xuXG59XG5cbmV4cG9ydCB7IEZCWExvYWRlciB9O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==