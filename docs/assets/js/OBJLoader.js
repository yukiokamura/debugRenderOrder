(self["webpackChunkgulp"] = self["webpackChunkgulp"] || []).push([["OBJLoader"],{

/***/ "./node_modules/three/examples/jsm/loaders/OBJLoader.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/loaders/OBJLoader.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OBJLoader": () => (/* binding */ OBJLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");


// o object_name | g group_name
const _object_pattern = /^[og]\s*(.+)?/;
// mtllib file_reference
const _material_library_pattern = /^mtllib /;
// usemtl material_name
const _material_use_pattern = /^usemtl /;
// usemap map_name
const _map_use_pattern = /^usemap /;

const _vA = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _vB = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _vC = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

const _ab = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _cb = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

function ParserState() {

	const state = {
		objects: [],
		object: {},

		vertices: [],
		normals: [],
		colors: [],
		uvs: [],

		materials: {},
		materialLibraries: [],

		startObject: function ( name, fromDeclaration ) {

			// If the current object (initial from reset) is not from a g/o declaration in the parsed
			// file. We need to use it for the first parsed g/o to keep things in sync.
			if ( this.object && this.object.fromDeclaration === false ) {

				this.object.name = name;
				this.object.fromDeclaration = ( fromDeclaration !== false );
				return;

			}

			const previousMaterial = ( this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined );

			if ( this.object && typeof this.object._finalize === 'function' ) {

				this.object._finalize( true );

			}

			this.object = {
				name: name || '',
				fromDeclaration: ( fromDeclaration !== false ),

				geometry: {
					vertices: [],
					normals: [],
					colors: [],
					uvs: [],
					hasUVIndices: false
				},
				materials: [],
				smooth: true,

				startMaterial: function ( name, libraries ) {

					const previous = this._finalize( false );

					// New usemtl declaration overwrites an inherited material, except if faces were declared
					// after the material, then it must be preserved for proper MultiMaterial continuation.
					if ( previous && ( previous.inherited || previous.groupCount <= 0 ) ) {

						this.materials.splice( previous.index, 1 );

					}

					const material = {
						index: this.materials.length,
						name: name || '',
						mtllib: ( Array.isArray( libraries ) && libraries.length > 0 ? libraries[ libraries.length - 1 ] : '' ),
						smooth: ( previous !== undefined ? previous.smooth : this.smooth ),
						groupStart: ( previous !== undefined ? previous.groupEnd : 0 ),
						groupEnd: - 1,
						groupCount: - 1,
						inherited: false,

						clone: function ( index ) {

							const cloned = {
								index: ( typeof index === 'number' ? index : this.index ),
								name: this.name,
								mtllib: this.mtllib,
								smooth: this.smooth,
								groupStart: 0,
								groupEnd: - 1,
								groupCount: - 1,
								inherited: false
							};
							cloned.clone = this.clone.bind( cloned );
							return cloned;

						}
					};

					this.materials.push( material );

					return material;

				},

				currentMaterial: function () {

					if ( this.materials.length > 0 ) {

						return this.materials[ this.materials.length - 1 ];

					}

					return undefined;

				},

				_finalize: function ( end ) {

					const lastMultiMaterial = this.currentMaterial();
					if ( lastMultiMaterial && lastMultiMaterial.groupEnd === - 1 ) {

						lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
						lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
						lastMultiMaterial.inherited = false;

					}

					// Ignore objects tail materials if no face declarations followed them before a new o/g started.
					if ( end && this.materials.length > 1 ) {

						for ( let mi = this.materials.length - 1; mi >= 0; mi -- ) {

							if ( this.materials[ mi ].groupCount <= 0 ) {

								this.materials.splice( mi, 1 );

							}

						}

					}

					// Guarantee at least one empty material, this makes the creation later more straight forward.
					if ( end && this.materials.length === 0 ) {

						this.materials.push( {
							name: '',
							smooth: this.smooth
						} );

					}

					return lastMultiMaterial;

				}
			};

			// Inherit previous objects material.
			// Spec tells us that a declared material must be set to all objects until a new material is declared.
			// If a usemtl declaration is encountered while this new object is being parsed, it will
			// overwrite the inherited material. Exception being that there was already face declarations
			// to the inherited material, then it will be preserved for proper MultiMaterial continuation.

			if ( previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function' ) {

				const declared = previousMaterial.clone( 0 );
				declared.inherited = true;
				this.object.materials.push( declared );

			}

			this.objects.push( this.object );

		},

		finalize: function () {

			if ( this.object && typeof this.object._finalize === 'function' ) {

				this.object._finalize( true );

			}

		},

		parseVertexIndex: function ( value, len ) {

			const index = parseInt( value, 10 );
			return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

		},

		parseNormalIndex: function ( value, len ) {

			const index = parseInt( value, 10 );
			return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

		},

		parseUVIndex: function ( value, len ) {

			const index = parseInt( value, 10 );
			return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;

		},

		addVertex: function ( a, b, c ) {

			const src = this.vertices;
			const dst = this.object.geometry.vertices;

			dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
			dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
			dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

		},

		addVertexPoint: function ( a ) {

			const src = this.vertices;
			const dst = this.object.geometry.vertices;

			dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );

		},

		addVertexLine: function ( a ) {

			const src = this.vertices;
			const dst = this.object.geometry.vertices;

			dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );

		},

		addNormal: function ( a, b, c ) {

			const src = this.normals;
			const dst = this.object.geometry.normals;

			dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
			dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
			dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

		},

		addFaceNormal: function ( a, b, c ) {

			const src = this.vertices;
			const dst = this.object.geometry.normals;

			_vA.fromArray( src, a );
			_vB.fromArray( src, b );
			_vC.fromArray( src, c );

			_cb.subVectors( _vC, _vB );
			_ab.subVectors( _vA, _vB );
			_cb.cross( _ab );

			_cb.normalize();

			dst.push( _cb.x, _cb.y, _cb.z );
			dst.push( _cb.x, _cb.y, _cb.z );
			dst.push( _cb.x, _cb.y, _cb.z );

		},

		addColor: function ( a, b, c ) {

			const src = this.colors;
			const dst = this.object.geometry.colors;

			if ( src[ a ] !== undefined ) dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
			if ( src[ b ] !== undefined ) dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
			if ( src[ c ] !== undefined ) dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

		},

		addUV: function ( a, b, c ) {

			const src = this.uvs;
			const dst = this.object.geometry.uvs;

			dst.push( src[ a + 0 ], src[ a + 1 ] );
			dst.push( src[ b + 0 ], src[ b + 1 ] );
			dst.push( src[ c + 0 ], src[ c + 1 ] );

		},

		addDefaultUV: function () {

			const dst = this.object.geometry.uvs;

			dst.push( 0, 0 );
			dst.push( 0, 0 );
			dst.push( 0, 0 );

		},

		addUVLine: function ( a ) {

			const src = this.uvs;
			const dst = this.object.geometry.uvs;

			dst.push( src[ a + 0 ], src[ a + 1 ] );

		},

		addFace: function ( a, b, c, ua, ub, uc, na, nb, nc ) {

			const vLen = this.vertices.length;

			let ia = this.parseVertexIndex( a, vLen );
			let ib = this.parseVertexIndex( b, vLen );
			let ic = this.parseVertexIndex( c, vLen );

			this.addVertex( ia, ib, ic );
			this.addColor( ia, ib, ic );

			// normals

			if ( na !== undefined && na !== '' ) {

				const nLen = this.normals.length;

				ia = this.parseNormalIndex( na, nLen );
				ib = this.parseNormalIndex( nb, nLen );
				ic = this.parseNormalIndex( nc, nLen );

				this.addNormal( ia, ib, ic );

			} else {

				this.addFaceNormal( ia, ib, ic );

			}

			// uvs

			if ( ua !== undefined && ua !== '' ) {

				const uvLen = this.uvs.length;

				ia = this.parseUVIndex( ua, uvLen );
				ib = this.parseUVIndex( ub, uvLen );
				ic = this.parseUVIndex( uc, uvLen );

				this.addUV( ia, ib, ic );

				this.object.geometry.hasUVIndices = true;

			} else {

				// add placeholder values (for inconsistent face definitions)

				this.addDefaultUV();

			}

		},

		addPointGeometry: function ( vertices ) {

			this.object.geometry.type = 'Points';

			const vLen = this.vertices.length;

			for ( let vi = 0, l = vertices.length; vi < l; vi ++ ) {

				const index = this.parseVertexIndex( vertices[ vi ], vLen );

				this.addVertexPoint( index );
				this.addColor( index );

			}

		},

		addLineGeometry: function ( vertices, uvs ) {

			this.object.geometry.type = 'Line';

			const vLen = this.vertices.length;
			const uvLen = this.uvs.length;

			for ( let vi = 0, l = vertices.length; vi < l; vi ++ ) {

				this.addVertexLine( this.parseVertexIndex( vertices[ vi ], vLen ) );

			}

			for ( let uvi = 0, l = uvs.length; uvi < l; uvi ++ ) {

				this.addUVLine( this.parseUVIndex( uvs[ uvi ], uvLen ) );

			}

		}

	};

	state.startObject( '', false );

	return state;

}

//

class OBJLoader extends three__WEBPACK_IMPORTED_MODULE_0__.Loader {

	constructor( manager ) {

		super( manager );

		this.materials = null;

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new three__WEBPACK_IMPORTED_MODULE_0__.FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

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

	setMaterials( materials ) {

		this.materials = materials;

		return this;

	}

	parse( text ) {

		const state = new ParserState();

		if ( text.indexOf( '\r\n' ) !== - 1 ) {

			// This is faster than String.split with regex that splits on both
			text = text.replace( /\r\n/g, '\n' );

		}

		if ( text.indexOf( '\\\n' ) !== - 1 ) {

			// join lines separated by a line continuation character (\)
			text = text.replace( /\\\n/g, '' );

		}

		const lines = text.split( '\n' );
		let line = '', lineFirstChar = '';
		let lineLength = 0;
		let result = [];

		// Faster to just trim left side of the line. Use if available.
		const trimLeft = ( typeof ''.trimLeft === 'function' );

		for ( let i = 0, l = lines.length; i < l; i ++ ) {

			line = lines[ i ];

			line = trimLeft ? line.trimLeft() : line.trim();

			lineLength = line.length;

			if ( lineLength === 0 ) continue;

			lineFirstChar = line.charAt( 0 );

			// @todo invoke passed in handler if any
			if ( lineFirstChar === '#' ) continue;

			if ( lineFirstChar === 'v' ) {

				const data = line.split( /\s+/ );

				switch ( data[ 0 ] ) {

					case 'v':
						state.vertices.push(
							parseFloat( data[ 1 ] ),
							parseFloat( data[ 2 ] ),
							parseFloat( data[ 3 ] )
						);
						if ( data.length >= 7 ) {

							state.colors.push(
								parseFloat( data[ 4 ] ),
								parseFloat( data[ 5 ] ),
								parseFloat( data[ 6 ] )

							);

						} else {

							// if no colors are defined, add placeholders so color and vertex indices match

							state.colors.push( undefined, undefined, undefined );

						}

						break;
					case 'vn':
						state.normals.push(
							parseFloat( data[ 1 ] ),
							parseFloat( data[ 2 ] ),
							parseFloat( data[ 3 ] )
						);
						break;
					case 'vt':
						state.uvs.push(
							parseFloat( data[ 1 ] ),
							parseFloat( data[ 2 ] )
						);
						break;

				}

			} else if ( lineFirstChar === 'f' ) {

				const lineData = line.substr( 1 ).trim();
				const vertexData = lineData.split( /\s+/ );
				const faceVertices = [];

				// Parse the face vertex data into an easy to work with format

				for ( let j = 0, jl = vertexData.length; j < jl; j ++ ) {

					const vertex = vertexData[ j ];

					if ( vertex.length > 0 ) {

						const vertexParts = vertex.split( '/' );
						faceVertices.push( vertexParts );

					}

				}

				// Draw an edge between the first vertex and all subsequent vertices to form an n-gon

				const v1 = faceVertices[ 0 ];

				for ( let j = 1, jl = faceVertices.length - 1; j < jl; j ++ ) {

					const v2 = faceVertices[ j ];
					const v3 = faceVertices[ j + 1 ];

					state.addFace(
						v1[ 0 ], v2[ 0 ], v3[ 0 ],
						v1[ 1 ], v2[ 1 ], v3[ 1 ],
						v1[ 2 ], v2[ 2 ], v3[ 2 ]
					);

				}

			} else if ( lineFirstChar === 'l' ) {

				const lineParts = line.substring( 1 ).trim().split( ' ' );
				let lineVertices = [];
				const lineUVs = [];

				if ( line.indexOf( '/' ) === - 1 ) {

					lineVertices = lineParts;

				} else {

					for ( let li = 0, llen = lineParts.length; li < llen; li ++ ) {

						const parts = lineParts[ li ].split( '/' );

						if ( parts[ 0 ] !== '' ) lineVertices.push( parts[ 0 ] );
						if ( parts[ 1 ] !== '' ) lineUVs.push( parts[ 1 ] );

					}

				}

				state.addLineGeometry( lineVertices, lineUVs );

			} else if ( lineFirstChar === 'p' ) {

				const lineData = line.substr( 1 ).trim();
				const pointData = lineData.split( ' ' );

				state.addPointGeometry( pointData );

			} else if ( ( result = _object_pattern.exec( line ) ) !== null ) {

				// o object_name
				// or
				// g group_name

				// WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
				// let name = result[ 0 ].substr( 1 ).trim();
				const name = ( ' ' + result[ 0 ].substr( 1 ).trim() ).substr( 1 );

				state.startObject( name );

			} else if ( _material_use_pattern.test( line ) ) {

				// material

				state.object.startMaterial( line.substring( 7 ).trim(), state.materialLibraries );

			} else if ( _material_library_pattern.test( line ) ) {

				// mtl file

				state.materialLibraries.push( line.substring( 7 ).trim() );

			} else if ( _map_use_pattern.test( line ) ) {

				// the line is parsed but ignored since the loader assumes textures are defined MTL files
				// (according to https://www.okino.com/conv/imp_wave.htm, 'usemap' is the old-style Wavefront texture reference method)

				console.warn( 'THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.' );

			} else if ( lineFirstChar === 's' ) {

				result = line.split( ' ' );

				// smooth shading

				// @todo Handle files that have varying smooth values for a set of faces inside one geometry,
				// but does not define a usemtl for each face set.
				// This should be detected and a dummy material created (later MultiMaterial and geometry groups).
				// This requires some care to not create extra material on each smooth value for "normal" obj files.
				// where explicit usemtl defines geometry groups.
				// Example asset: examples/models/obj/cerberus/Cerberus.obj

				/*
					 * http://paulbourke.net/dataformats/obj/
					 * or
					 * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
					 *
					 * From chapter "Grouping" Syntax explanation "s group_number":
					 * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
					 * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
					 * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
					 * than 0."
					 */
				if ( result.length > 1 ) {

					const value = result[ 1 ].trim().toLowerCase();
					state.object.smooth = ( value !== '0' && value !== 'off' );

				} else {

					// ZBrush can produce "s" lines #11707
					state.object.smooth = true;

				}

				const material = state.object.currentMaterial();
				if ( material ) material.smooth = state.object.smooth;

			} else {

				// Handle null terminated files without exception
				if ( line === '\0' ) continue;

				console.warn( 'THREE.OBJLoader: Unexpected line: "' + line + '"' );

			}

		}

		state.finalize();

		const container = new three__WEBPACK_IMPORTED_MODULE_0__.Group();
		container.materialLibraries = [].concat( state.materialLibraries );

		const hasPrimitives = ! ( state.objects.length === 1 && state.objects[ 0 ].geometry.vertices.length === 0 );

		if ( hasPrimitives === true ) {

			for ( let i = 0, l = state.objects.length; i < l; i ++ ) {

				const object = state.objects[ i ];
				const geometry = object.geometry;
				const materials = object.materials;
				const isLine = ( geometry.type === 'Line' );
				const isPoints = ( geometry.type === 'Points' );
				let hasVertexColors = false;

				// Skip o/g line declarations that did not follow with any faces
				if ( geometry.vertices.length === 0 ) continue;

				const buffergeometry = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();

				buffergeometry.setAttribute( 'position', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( geometry.vertices, 3 ) );

				if ( geometry.normals.length > 0 ) {

					buffergeometry.setAttribute( 'normal', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( geometry.normals, 3 ) );

				}

				if ( geometry.colors.length > 0 ) {

					hasVertexColors = true;
					buffergeometry.setAttribute( 'color', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( geometry.colors, 3 ) );

				}

				if ( geometry.hasUVIndices === true ) {

					buffergeometry.setAttribute( 'uv', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( geometry.uvs, 2 ) );

				}

				// Create materials

				const createdMaterials = [];

				for ( let mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {

					const sourceMaterial = materials[ mi ];
					const materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
					let material = state.materials[ materialHash ];

					if ( this.materials !== null ) {

						material = this.materials.create( sourceMaterial.name );

						// mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
						if ( isLine && material && ! ( material instanceof three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial ) ) {

							const materialLine = new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial();
							three__WEBPACK_IMPORTED_MODULE_0__.Material.prototype.copy.call( materialLine, material );
							materialLine.color.copy( material.color );
							material = materialLine;

						} else if ( isPoints && material && ! ( material instanceof three__WEBPACK_IMPORTED_MODULE_0__.PointsMaterial ) ) {

							const materialPoints = new three__WEBPACK_IMPORTED_MODULE_0__.PointsMaterial( { size: 10, sizeAttenuation: false } );
							three__WEBPACK_IMPORTED_MODULE_0__.Material.prototype.copy.call( materialPoints, material );
							materialPoints.color.copy( material.color );
							materialPoints.map = material.map;
							material = materialPoints;

						}

					}

					if ( material === undefined ) {

						if ( isLine ) {

							material = new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial();

						} else if ( isPoints ) {

							material = new three__WEBPACK_IMPORTED_MODULE_0__.PointsMaterial( { size: 1, sizeAttenuation: false } );

						} else {

							material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial();

						}

						material.name = sourceMaterial.name;
						material.flatShading = sourceMaterial.smooth ? false : true;
						material.vertexColors = hasVertexColors;

						state.materials[ materialHash ] = material;

					}

					createdMaterials.push( material );

				}

				// Create mesh

				let mesh;

				if ( createdMaterials.length > 1 ) {

					for ( let mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {

						const sourceMaterial = materials[ mi ];
						buffergeometry.addGroup( sourceMaterial.groupStart, sourceMaterial.groupCount, mi );

					}

					if ( isLine ) {

						mesh = new three__WEBPACK_IMPORTED_MODULE_0__.LineSegments( buffergeometry, createdMaterials );

					} else if ( isPoints ) {

						mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Points( buffergeometry, createdMaterials );

					} else {

						mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh( buffergeometry, createdMaterials );

					}

				} else {

					if ( isLine ) {

						mesh = new three__WEBPACK_IMPORTED_MODULE_0__.LineSegments( buffergeometry, createdMaterials[ 0 ] );

					} else if ( isPoints ) {

						mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Points( buffergeometry, createdMaterials[ 0 ] );

					} else {

						mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh( buffergeometry, createdMaterials[ 0 ] );

					}

				}

				mesh.name = object.name;

				container.add( mesh );

			}

		} else {

			// if there is only the default parser state object with no geometry data, interpret data as point cloud

			if ( state.vertices.length > 0 ) {

				const material = new three__WEBPACK_IMPORTED_MODULE_0__.PointsMaterial( { size: 1, sizeAttenuation: false } );

				const buffergeometry = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();

				buffergeometry.setAttribute( 'position', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( state.vertices, 3 ) );

				if ( state.colors.length > 0 && state.colors[ 0 ] !== undefined ) {

					buffergeometry.setAttribute( 'color', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( state.colors, 3 ) );
					material.vertexColors = true;

				}

				const points = new three__WEBPACK_IMPORTED_MODULE_0__.Points( buffergeometry, material );
				container.add( points );

			}

		}

		return container;

	}

}




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWxwLy4vbm9kZV9tb2R1bGVzL3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL09CSkxvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQWNlOztBQUVmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0JBQWdCLDBDQUFPO0FBQ3ZCLGdCQUFnQiwwQ0FBTztBQUN2QixnQkFBZ0IsMENBQU87O0FBRXZCLGdCQUFnQiwwQ0FBTztBQUN2QixnQkFBZ0IsMENBQU87O0FBRXZCOztBQUVBO0FBQ0E7QUFDQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGVBQWU7QUFDZjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLCtDQUErQyxTQUFTOztBQUV4RDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTtBQUNBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTtBQUNBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTs7QUFFQSx5Q0FBeUMsUUFBUTs7QUFFakQ7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEseUNBQXlDLFFBQVE7O0FBRWpEOztBQUVBOztBQUVBLHFDQUFxQyxTQUFTOztBQUU5Qzs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSx3QkFBd0IseUNBQU07O0FBRTlCOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLHFCQUFxQiw2Q0FBVTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxvQ0FBb0MsT0FBTzs7QUFFM0M7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxPQUFPOztBQUVQOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsNENBQTRDLFFBQVE7O0FBRXBEOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsa0RBQWtELFFBQVE7O0FBRTFEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMLCtDQUErQyxXQUFXOztBQUUxRDs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLElBQUk7O0FBRUo7QUFDQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQSxJQUFJOztBQUVKOztBQUVBOztBQUVBLElBQUk7O0FBRUo7QUFDQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStEO0FBQy9EO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSx3QkFBd0Isd0NBQUs7QUFDN0I7O0FBRUE7O0FBRUE7O0FBRUEsNkNBQTZDLE9BQU87O0FBRXBEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLCtCQUErQixpREFBYzs7QUFFN0MsaURBQWlELHlEQUFzQjs7QUFFdkU7O0FBRUEsZ0RBQWdELHlEQUFzQjs7QUFFdEU7O0FBRUE7O0FBRUE7QUFDQSwrQ0FBK0MseURBQXNCOztBQUVyRTs7QUFFQTs7QUFFQSw0Q0FBNEMseURBQXNCOztBQUVsRTs7QUFFQTs7QUFFQTs7QUFFQSwrQ0FBK0MsWUFBWTs7QUFFM0Q7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EseURBQXlELG9EQUFpQjs7QUFFMUUsZ0NBQWdDLG9EQUFpQjtBQUNqRCxPQUFPLCtEQUE0QjtBQUNuQztBQUNBOztBQUVBLE9BQU8sMkRBQTJELGlEQUFjOztBQUVoRixrQ0FBa0MsaURBQWMsR0FBRyxtQ0FBbUM7QUFDdEYsT0FBTywrREFBNEI7QUFDbkM7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLHNCQUFzQixvREFBaUI7O0FBRXZDLE9BQU87O0FBRVAsc0JBQXNCLGlEQUFjLEdBQUcsa0NBQWtDOztBQUV6RSxPQUFPOztBQUVQLHNCQUFzQixvREFBaUI7O0FBRXZDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxnREFBZ0QsWUFBWTs7QUFFNUQ7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxpQkFBaUIsK0NBQVk7O0FBRTdCLE1BQU07O0FBRU4saUJBQWlCLHlDQUFNOztBQUV2QixNQUFNOztBQUVOLGlCQUFpQix1Q0FBSTs7QUFFckI7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQSxpQkFBaUIsK0NBQVk7O0FBRTdCLE1BQU07O0FBRU4saUJBQWlCLHlDQUFNOztBQUV2QixNQUFNOztBQUVOLGlCQUFpQix1Q0FBSTs7QUFFckI7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQSx5QkFBeUIsaURBQWMsR0FBRyxrQ0FBa0M7O0FBRTVFLCtCQUErQixpREFBYzs7QUFFN0MsaURBQWlELHlEQUFzQjs7QUFFdkU7O0FBRUEsK0NBQStDLHlEQUFzQjtBQUNyRTs7QUFFQTs7QUFFQSx1QkFBdUIseUNBQU07QUFDN0I7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRXFCIiwiZmlsZSI6Ik9CSkxvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEJ1ZmZlckdlb21ldHJ5LFxuXHRGaWxlTG9hZGVyLFxuXHRGbG9hdDMyQnVmZmVyQXR0cmlidXRlLFxuXHRHcm91cCxcblx0TGluZUJhc2ljTWF0ZXJpYWwsXG5cdExpbmVTZWdtZW50cyxcblx0TG9hZGVyLFxuXHRNYXRlcmlhbCxcblx0TWVzaCxcblx0TWVzaFBob25nTWF0ZXJpYWwsXG5cdFBvaW50cyxcblx0UG9pbnRzTWF0ZXJpYWwsXG5cdFZlY3RvcjNcbn0gZnJvbSAndGhyZWUnO1xuXG4vLyBvIG9iamVjdF9uYW1lIHwgZyBncm91cF9uYW1lXG5jb25zdCBfb2JqZWN0X3BhdHRlcm4gPSAvXltvZ11cXHMqKC4rKT8vO1xuLy8gbXRsbGliIGZpbGVfcmVmZXJlbmNlXG5jb25zdCBfbWF0ZXJpYWxfbGlicmFyeV9wYXR0ZXJuID0gL15tdGxsaWIgLztcbi8vIHVzZW10bCBtYXRlcmlhbF9uYW1lXG5jb25zdCBfbWF0ZXJpYWxfdXNlX3BhdHRlcm4gPSAvXnVzZW10bCAvO1xuLy8gdXNlbWFwIG1hcF9uYW1lXG5jb25zdCBfbWFwX3VzZV9wYXR0ZXJuID0gL151c2VtYXAgLztcblxuY29uc3QgX3ZBID0gbmV3IFZlY3RvcjMoKTtcbmNvbnN0IF92QiA9IG5ldyBWZWN0b3IzKCk7XG5jb25zdCBfdkMgPSBuZXcgVmVjdG9yMygpO1xuXG5jb25zdCBfYWIgPSBuZXcgVmVjdG9yMygpO1xuY29uc3QgX2NiID0gbmV3IFZlY3RvcjMoKTtcblxuZnVuY3Rpb24gUGFyc2VyU3RhdGUoKSB7XG5cblx0Y29uc3Qgc3RhdGUgPSB7XG5cdFx0b2JqZWN0czogW10sXG5cdFx0b2JqZWN0OiB7fSxcblxuXHRcdHZlcnRpY2VzOiBbXSxcblx0XHRub3JtYWxzOiBbXSxcblx0XHRjb2xvcnM6IFtdLFxuXHRcdHV2czogW10sXG5cblx0XHRtYXRlcmlhbHM6IHt9LFxuXHRcdG1hdGVyaWFsTGlicmFyaWVzOiBbXSxcblxuXHRcdHN0YXJ0T2JqZWN0OiBmdW5jdGlvbiAoIG5hbWUsIGZyb21EZWNsYXJhdGlvbiApIHtcblxuXHRcdFx0Ly8gSWYgdGhlIGN1cnJlbnQgb2JqZWN0IChpbml0aWFsIGZyb20gcmVzZXQpIGlzIG5vdCBmcm9tIGEgZy9vIGRlY2xhcmF0aW9uIGluIHRoZSBwYXJzZWRcblx0XHRcdC8vIGZpbGUuIFdlIG5lZWQgdG8gdXNlIGl0IGZvciB0aGUgZmlyc3QgcGFyc2VkIGcvbyB0byBrZWVwIHRoaW5ncyBpbiBzeW5jLlxuXHRcdFx0aWYgKCB0aGlzLm9iamVjdCAmJiB0aGlzLm9iamVjdC5mcm9tRGVjbGFyYXRpb24gPT09IGZhbHNlICkge1xuXG5cdFx0XHRcdHRoaXMub2JqZWN0Lm5hbWUgPSBuYW1lO1xuXHRcdFx0XHR0aGlzLm9iamVjdC5mcm9tRGVjbGFyYXRpb24gPSAoIGZyb21EZWNsYXJhdGlvbiAhPT0gZmFsc2UgKTtcblx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHByZXZpb3VzTWF0ZXJpYWwgPSAoIHRoaXMub2JqZWN0ICYmIHR5cGVvZiB0aGlzLm9iamVjdC5jdXJyZW50TWF0ZXJpYWwgPT09ICdmdW5jdGlvbicgPyB0aGlzLm9iamVjdC5jdXJyZW50TWF0ZXJpYWwoKSA6IHVuZGVmaW5lZCApO1xuXG5cdFx0XHRpZiAoIHRoaXMub2JqZWN0ICYmIHR5cGVvZiB0aGlzLm9iamVjdC5fZmluYWxpemUgPT09ICdmdW5jdGlvbicgKSB7XG5cblx0XHRcdFx0dGhpcy5vYmplY3QuX2ZpbmFsaXplKCB0cnVlICk7XG5cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vYmplY3QgPSB7XG5cdFx0XHRcdG5hbWU6IG5hbWUgfHwgJycsXG5cdFx0XHRcdGZyb21EZWNsYXJhdGlvbjogKCBmcm9tRGVjbGFyYXRpb24gIT09IGZhbHNlICksXG5cblx0XHRcdFx0Z2VvbWV0cnk6IHtcblx0XHRcdFx0XHR2ZXJ0aWNlczogW10sXG5cdFx0XHRcdFx0bm9ybWFsczogW10sXG5cdFx0XHRcdFx0Y29sb3JzOiBbXSxcblx0XHRcdFx0XHR1dnM6IFtdLFxuXHRcdFx0XHRcdGhhc1VWSW5kaWNlczogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0bWF0ZXJpYWxzOiBbXSxcblx0XHRcdFx0c21vb3RoOiB0cnVlLFxuXG5cdFx0XHRcdHN0YXJ0TWF0ZXJpYWw6IGZ1bmN0aW9uICggbmFtZSwgbGlicmFyaWVzICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgcHJldmlvdXMgPSB0aGlzLl9maW5hbGl6ZSggZmFsc2UgKTtcblxuXHRcdFx0XHRcdC8vIE5ldyB1c2VtdGwgZGVjbGFyYXRpb24gb3ZlcndyaXRlcyBhbiBpbmhlcml0ZWQgbWF0ZXJpYWwsIGV4Y2VwdCBpZiBmYWNlcyB3ZXJlIGRlY2xhcmVkXG5cdFx0XHRcdFx0Ly8gYWZ0ZXIgdGhlIG1hdGVyaWFsLCB0aGVuIGl0IG11c3QgYmUgcHJlc2VydmVkIGZvciBwcm9wZXIgTXVsdGlNYXRlcmlhbCBjb250aW51YXRpb24uXG5cdFx0XHRcdFx0aWYgKCBwcmV2aW91cyAmJiAoIHByZXZpb3VzLmluaGVyaXRlZCB8fCBwcmV2aW91cy5ncm91cENvdW50IDw9IDAgKSApIHtcblxuXHRcdFx0XHRcdFx0dGhpcy5tYXRlcmlhbHMuc3BsaWNlKCBwcmV2aW91cy5pbmRleCwgMSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgbWF0ZXJpYWwgPSB7XG5cdFx0XHRcdFx0XHRpbmRleDogdGhpcy5tYXRlcmlhbHMubGVuZ3RoLFxuXHRcdFx0XHRcdFx0bmFtZTogbmFtZSB8fCAnJyxcblx0XHRcdFx0XHRcdG10bGxpYjogKCBBcnJheS5pc0FycmF5KCBsaWJyYXJpZXMgKSAmJiBsaWJyYXJpZXMubGVuZ3RoID4gMCA/IGxpYnJhcmllc1sgbGlicmFyaWVzLmxlbmd0aCAtIDEgXSA6ICcnICksXG5cdFx0XHRcdFx0XHRzbW9vdGg6ICggcHJldmlvdXMgIT09IHVuZGVmaW5lZCA/IHByZXZpb3VzLnNtb290aCA6IHRoaXMuc21vb3RoICksXG5cdFx0XHRcdFx0XHRncm91cFN0YXJ0OiAoIHByZXZpb3VzICE9PSB1bmRlZmluZWQgPyBwcmV2aW91cy5ncm91cEVuZCA6IDAgKSxcblx0XHRcdFx0XHRcdGdyb3VwRW5kOiAtIDEsXG5cdFx0XHRcdFx0XHRncm91cENvdW50OiAtIDEsXG5cdFx0XHRcdFx0XHRpbmhlcml0ZWQ6IGZhbHNlLFxuXG5cdFx0XHRcdFx0XHRjbG9uZTogZnVuY3Rpb24gKCBpbmRleCApIHtcblxuXHRcdFx0XHRcdFx0XHRjb25zdCBjbG9uZWQgPSB7XG5cdFx0XHRcdFx0XHRcdFx0aW5kZXg6ICggdHlwZW9mIGluZGV4ID09PSAnbnVtYmVyJyA/IGluZGV4IDogdGhpcy5pbmRleCApLFxuXHRcdFx0XHRcdFx0XHRcdG5hbWU6IHRoaXMubmFtZSxcblx0XHRcdFx0XHRcdFx0XHRtdGxsaWI6IHRoaXMubXRsbGliLFxuXHRcdFx0XHRcdFx0XHRcdHNtb290aDogdGhpcy5zbW9vdGgsXG5cdFx0XHRcdFx0XHRcdFx0Z3JvdXBTdGFydDogMCxcblx0XHRcdFx0XHRcdFx0XHRncm91cEVuZDogLSAxLFxuXHRcdFx0XHRcdFx0XHRcdGdyb3VwQ291bnQ6IC0gMSxcblx0XHRcdFx0XHRcdFx0XHRpbmhlcml0ZWQ6IGZhbHNlXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGNsb25lZC5jbG9uZSA9IHRoaXMuY2xvbmUuYmluZCggY2xvbmVkICk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBjbG9uZWQ7XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0dGhpcy5tYXRlcmlhbHMucHVzaCggbWF0ZXJpYWwgKTtcblxuXHRcdFx0XHRcdHJldHVybiBtYXRlcmlhbDtcblxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGN1cnJlbnRNYXRlcmlhbDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1hdGVyaWFscy5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXRlcmlhbHNbIHRoaXMubWF0ZXJpYWxzLmxlbmd0aCAtIDEgXTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRfZmluYWxpemU6IGZ1bmN0aW9uICggZW5kICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgbGFzdE11bHRpTWF0ZXJpYWwgPSB0aGlzLmN1cnJlbnRNYXRlcmlhbCgpO1xuXHRcdFx0XHRcdGlmICggbGFzdE11bHRpTWF0ZXJpYWwgJiYgbGFzdE11bHRpTWF0ZXJpYWwuZ3JvdXBFbmQgPT09IC0gMSApIHtcblxuXHRcdFx0XHRcdFx0bGFzdE11bHRpTWF0ZXJpYWwuZ3JvdXBFbmQgPSB0aGlzLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCAvIDM7XG5cdFx0XHRcdFx0XHRsYXN0TXVsdGlNYXRlcmlhbC5ncm91cENvdW50ID0gbGFzdE11bHRpTWF0ZXJpYWwuZ3JvdXBFbmQgLSBsYXN0TXVsdGlNYXRlcmlhbC5ncm91cFN0YXJ0O1xuXHRcdFx0XHRcdFx0bGFzdE11bHRpTWF0ZXJpYWwuaW5oZXJpdGVkID0gZmFsc2U7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBJZ25vcmUgb2JqZWN0cyB0YWlsIG1hdGVyaWFscyBpZiBubyBmYWNlIGRlY2xhcmF0aW9ucyBmb2xsb3dlZCB0aGVtIGJlZm9yZSBhIG5ldyBvL2cgc3RhcnRlZC5cblx0XHRcdFx0XHRpZiAoIGVuZCAmJiB0aGlzLm1hdGVyaWFscy5sZW5ndGggPiAxICkge1xuXG5cdFx0XHRcdFx0XHRmb3IgKCBsZXQgbWkgPSB0aGlzLm1hdGVyaWFscy5sZW5ndGggLSAxOyBtaSA+PSAwOyBtaSAtLSApIHtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIHRoaXMubWF0ZXJpYWxzWyBtaSBdLmdyb3VwQ291bnQgPD0gMCApIHtcblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMubWF0ZXJpYWxzLnNwbGljZSggbWksIDEgKTtcblxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEd1YXJhbnRlZSBhdCBsZWFzdCBvbmUgZW1wdHkgbWF0ZXJpYWwsIHRoaXMgbWFrZXMgdGhlIGNyZWF0aW9uIGxhdGVyIG1vcmUgc3RyYWlnaHQgZm9yd2FyZC5cblx0XHRcdFx0XHRpZiAoIGVuZCAmJiB0aGlzLm1hdGVyaWFscy5sZW5ndGggPT09IDAgKSB7XG5cblx0XHRcdFx0XHRcdHRoaXMubWF0ZXJpYWxzLnB1c2goIHtcblx0XHRcdFx0XHRcdFx0bmFtZTogJycsXG5cdFx0XHRcdFx0XHRcdHNtb290aDogdGhpcy5zbW9vdGhcblx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBsYXN0TXVsdGlNYXRlcmlhbDtcblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBJbmhlcml0IHByZXZpb3VzIG9iamVjdHMgbWF0ZXJpYWwuXG5cdFx0XHQvLyBTcGVjIHRlbGxzIHVzIHRoYXQgYSBkZWNsYXJlZCBtYXRlcmlhbCBtdXN0IGJlIHNldCB0byBhbGwgb2JqZWN0cyB1bnRpbCBhIG5ldyBtYXRlcmlhbCBpcyBkZWNsYXJlZC5cblx0XHRcdC8vIElmIGEgdXNlbXRsIGRlY2xhcmF0aW9uIGlzIGVuY291bnRlcmVkIHdoaWxlIHRoaXMgbmV3IG9iamVjdCBpcyBiZWluZyBwYXJzZWQsIGl0IHdpbGxcblx0XHRcdC8vIG92ZXJ3cml0ZSB0aGUgaW5oZXJpdGVkIG1hdGVyaWFsLiBFeGNlcHRpb24gYmVpbmcgdGhhdCB0aGVyZSB3YXMgYWxyZWFkeSBmYWNlIGRlY2xhcmF0aW9uc1xuXHRcdFx0Ly8gdG8gdGhlIGluaGVyaXRlZCBtYXRlcmlhbCwgdGhlbiBpdCB3aWxsIGJlIHByZXNlcnZlZCBmb3IgcHJvcGVyIE11bHRpTWF0ZXJpYWwgY29udGludWF0aW9uLlxuXG5cdFx0XHRpZiAoIHByZXZpb3VzTWF0ZXJpYWwgJiYgcHJldmlvdXNNYXRlcmlhbC5uYW1lICYmIHR5cGVvZiBwcmV2aW91c01hdGVyaWFsLmNsb25lID09PSAnZnVuY3Rpb24nICkge1xuXG5cdFx0XHRcdGNvbnN0IGRlY2xhcmVkID0gcHJldmlvdXNNYXRlcmlhbC5jbG9uZSggMCApO1xuXHRcdFx0XHRkZWNsYXJlZC5pbmhlcml0ZWQgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLm9iamVjdC5tYXRlcmlhbHMucHVzaCggZGVjbGFyZWQgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm9iamVjdHMucHVzaCggdGhpcy5vYmplY3QgKTtcblxuXHRcdH0sXG5cblx0XHRmaW5hbGl6ZTogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRpZiAoIHRoaXMub2JqZWN0ICYmIHR5cGVvZiB0aGlzLm9iamVjdC5fZmluYWxpemUgPT09ICdmdW5jdGlvbicgKSB7XG5cblx0XHRcdFx0dGhpcy5vYmplY3QuX2ZpbmFsaXplKCB0cnVlICk7XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRwYXJzZVZlcnRleEluZGV4OiBmdW5jdGlvbiAoIHZhbHVlLCBsZW4gKSB7XG5cblx0XHRcdGNvbnN0IGluZGV4ID0gcGFyc2VJbnQoIHZhbHVlLCAxMCApO1xuXHRcdFx0cmV0dXJuICggaW5kZXggPj0gMCA/IGluZGV4IC0gMSA6IGluZGV4ICsgbGVuIC8gMyApICogMztcblxuXHRcdH0sXG5cblx0XHRwYXJzZU5vcm1hbEluZGV4OiBmdW5jdGlvbiAoIHZhbHVlLCBsZW4gKSB7XG5cblx0XHRcdGNvbnN0IGluZGV4ID0gcGFyc2VJbnQoIHZhbHVlLCAxMCApO1xuXHRcdFx0cmV0dXJuICggaW5kZXggPj0gMCA/IGluZGV4IC0gMSA6IGluZGV4ICsgbGVuIC8gMyApICogMztcblxuXHRcdH0sXG5cblx0XHRwYXJzZVVWSW5kZXg6IGZ1bmN0aW9uICggdmFsdWUsIGxlbiApIHtcblxuXHRcdFx0Y29uc3QgaW5kZXggPSBwYXJzZUludCggdmFsdWUsIDEwICk7XG5cdFx0XHRyZXR1cm4gKCBpbmRleCA+PSAwID8gaW5kZXggLSAxIDogaW5kZXggKyBsZW4gLyAyICkgKiAyO1xuXG5cdFx0fSxcblxuXHRcdGFkZFZlcnRleDogZnVuY3Rpb24gKCBhLCBiLCBjICkge1xuXG5cdFx0XHRjb25zdCBzcmMgPSB0aGlzLnZlcnRpY2VzO1xuXHRcdFx0Y29uc3QgZHN0ID0gdGhpcy5vYmplY3QuZ2VvbWV0cnkudmVydGljZXM7XG5cblx0XHRcdGRzdC5wdXNoKCBzcmNbIGEgKyAwIF0sIHNyY1sgYSArIDEgXSwgc3JjWyBhICsgMiBdICk7XG5cdFx0XHRkc3QucHVzaCggc3JjWyBiICsgMCBdLCBzcmNbIGIgKyAxIF0sIHNyY1sgYiArIDIgXSApO1xuXHRcdFx0ZHN0LnB1c2goIHNyY1sgYyArIDAgXSwgc3JjWyBjICsgMSBdLCBzcmNbIGMgKyAyIF0gKTtcblxuXHRcdH0sXG5cblx0XHRhZGRWZXJ0ZXhQb2ludDogZnVuY3Rpb24gKCBhICkge1xuXG5cdFx0XHRjb25zdCBzcmMgPSB0aGlzLnZlcnRpY2VzO1xuXHRcdFx0Y29uc3QgZHN0ID0gdGhpcy5vYmplY3QuZ2VvbWV0cnkudmVydGljZXM7XG5cblx0XHRcdGRzdC5wdXNoKCBzcmNbIGEgKyAwIF0sIHNyY1sgYSArIDEgXSwgc3JjWyBhICsgMiBdICk7XG5cblx0XHR9LFxuXG5cdFx0YWRkVmVydGV4TGluZTogZnVuY3Rpb24gKCBhICkge1xuXG5cdFx0XHRjb25zdCBzcmMgPSB0aGlzLnZlcnRpY2VzO1xuXHRcdFx0Y29uc3QgZHN0ID0gdGhpcy5vYmplY3QuZ2VvbWV0cnkudmVydGljZXM7XG5cblx0XHRcdGRzdC5wdXNoKCBzcmNbIGEgKyAwIF0sIHNyY1sgYSArIDEgXSwgc3JjWyBhICsgMiBdICk7XG5cblx0XHR9LFxuXG5cdFx0YWRkTm9ybWFsOiBmdW5jdGlvbiAoIGEsIGIsIGMgKSB7XG5cblx0XHRcdGNvbnN0IHNyYyA9IHRoaXMubm9ybWFscztcblx0XHRcdGNvbnN0IGRzdCA9IHRoaXMub2JqZWN0Lmdlb21ldHJ5Lm5vcm1hbHM7XG5cblx0XHRcdGRzdC5wdXNoKCBzcmNbIGEgKyAwIF0sIHNyY1sgYSArIDEgXSwgc3JjWyBhICsgMiBdICk7XG5cdFx0XHRkc3QucHVzaCggc3JjWyBiICsgMCBdLCBzcmNbIGIgKyAxIF0sIHNyY1sgYiArIDIgXSApO1xuXHRcdFx0ZHN0LnB1c2goIHNyY1sgYyArIDAgXSwgc3JjWyBjICsgMSBdLCBzcmNbIGMgKyAyIF0gKTtcblxuXHRcdH0sXG5cblx0XHRhZGRGYWNlTm9ybWFsOiBmdW5jdGlvbiAoIGEsIGIsIGMgKSB7XG5cblx0XHRcdGNvbnN0IHNyYyA9IHRoaXMudmVydGljZXM7XG5cdFx0XHRjb25zdCBkc3QgPSB0aGlzLm9iamVjdC5nZW9tZXRyeS5ub3JtYWxzO1xuXG5cdFx0XHRfdkEuZnJvbUFycmF5KCBzcmMsIGEgKTtcblx0XHRcdF92Qi5mcm9tQXJyYXkoIHNyYywgYiApO1xuXHRcdFx0X3ZDLmZyb21BcnJheSggc3JjLCBjICk7XG5cblx0XHRcdF9jYi5zdWJWZWN0b3JzKCBfdkMsIF92QiApO1xuXHRcdFx0X2FiLnN1YlZlY3RvcnMoIF92QSwgX3ZCICk7XG5cdFx0XHRfY2IuY3Jvc3MoIF9hYiApO1xuXG5cdFx0XHRfY2Iubm9ybWFsaXplKCk7XG5cblx0XHRcdGRzdC5wdXNoKCBfY2IueCwgX2NiLnksIF9jYi56ICk7XG5cdFx0XHRkc3QucHVzaCggX2NiLngsIF9jYi55LCBfY2IueiApO1xuXHRcdFx0ZHN0LnB1c2goIF9jYi54LCBfY2IueSwgX2NiLnogKTtcblxuXHRcdH0sXG5cblx0XHRhZGRDb2xvcjogZnVuY3Rpb24gKCBhLCBiLCBjICkge1xuXG5cdFx0XHRjb25zdCBzcmMgPSB0aGlzLmNvbG9ycztcblx0XHRcdGNvbnN0IGRzdCA9IHRoaXMub2JqZWN0Lmdlb21ldHJ5LmNvbG9ycztcblxuXHRcdFx0aWYgKCBzcmNbIGEgXSAhPT0gdW5kZWZpbmVkICkgZHN0LnB1c2goIHNyY1sgYSArIDAgXSwgc3JjWyBhICsgMSBdLCBzcmNbIGEgKyAyIF0gKTtcblx0XHRcdGlmICggc3JjWyBiIF0gIT09IHVuZGVmaW5lZCApIGRzdC5wdXNoKCBzcmNbIGIgKyAwIF0sIHNyY1sgYiArIDEgXSwgc3JjWyBiICsgMiBdICk7XG5cdFx0XHRpZiAoIHNyY1sgYyBdICE9PSB1bmRlZmluZWQgKSBkc3QucHVzaCggc3JjWyBjICsgMCBdLCBzcmNbIGMgKyAxIF0sIHNyY1sgYyArIDIgXSApO1xuXG5cdFx0fSxcblxuXHRcdGFkZFVWOiBmdW5jdGlvbiAoIGEsIGIsIGMgKSB7XG5cblx0XHRcdGNvbnN0IHNyYyA9IHRoaXMudXZzO1xuXHRcdFx0Y29uc3QgZHN0ID0gdGhpcy5vYmplY3QuZ2VvbWV0cnkudXZzO1xuXG5cdFx0XHRkc3QucHVzaCggc3JjWyBhICsgMCBdLCBzcmNbIGEgKyAxIF0gKTtcblx0XHRcdGRzdC5wdXNoKCBzcmNbIGIgKyAwIF0sIHNyY1sgYiArIDEgXSApO1xuXHRcdFx0ZHN0LnB1c2goIHNyY1sgYyArIDAgXSwgc3JjWyBjICsgMSBdICk7XG5cblx0XHR9LFxuXG5cdFx0YWRkRGVmYXVsdFVWOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGNvbnN0IGRzdCA9IHRoaXMub2JqZWN0Lmdlb21ldHJ5LnV2cztcblxuXHRcdFx0ZHN0LnB1c2goIDAsIDAgKTtcblx0XHRcdGRzdC5wdXNoKCAwLCAwICk7XG5cdFx0XHRkc3QucHVzaCggMCwgMCApO1xuXG5cdFx0fSxcblxuXHRcdGFkZFVWTGluZTogZnVuY3Rpb24gKCBhICkge1xuXG5cdFx0XHRjb25zdCBzcmMgPSB0aGlzLnV2cztcblx0XHRcdGNvbnN0IGRzdCA9IHRoaXMub2JqZWN0Lmdlb21ldHJ5LnV2cztcblxuXHRcdFx0ZHN0LnB1c2goIHNyY1sgYSArIDAgXSwgc3JjWyBhICsgMSBdICk7XG5cblx0XHR9LFxuXG5cdFx0YWRkRmFjZTogZnVuY3Rpb24gKCBhLCBiLCBjLCB1YSwgdWIsIHVjLCBuYSwgbmIsIG5jICkge1xuXG5cdFx0XHRjb25zdCB2TGVuID0gdGhpcy52ZXJ0aWNlcy5sZW5ndGg7XG5cblx0XHRcdGxldCBpYSA9IHRoaXMucGFyc2VWZXJ0ZXhJbmRleCggYSwgdkxlbiApO1xuXHRcdFx0bGV0IGliID0gdGhpcy5wYXJzZVZlcnRleEluZGV4KCBiLCB2TGVuICk7XG5cdFx0XHRsZXQgaWMgPSB0aGlzLnBhcnNlVmVydGV4SW5kZXgoIGMsIHZMZW4gKTtcblxuXHRcdFx0dGhpcy5hZGRWZXJ0ZXgoIGlhLCBpYiwgaWMgKTtcblx0XHRcdHRoaXMuYWRkQ29sb3IoIGlhLCBpYiwgaWMgKTtcblxuXHRcdFx0Ly8gbm9ybWFsc1xuXG5cdFx0XHRpZiAoIG5hICE9PSB1bmRlZmluZWQgJiYgbmEgIT09ICcnICkge1xuXG5cdFx0XHRcdGNvbnN0IG5MZW4gPSB0aGlzLm5vcm1hbHMubGVuZ3RoO1xuXG5cdFx0XHRcdGlhID0gdGhpcy5wYXJzZU5vcm1hbEluZGV4KCBuYSwgbkxlbiApO1xuXHRcdFx0XHRpYiA9IHRoaXMucGFyc2VOb3JtYWxJbmRleCggbmIsIG5MZW4gKTtcblx0XHRcdFx0aWMgPSB0aGlzLnBhcnNlTm9ybWFsSW5kZXgoIG5jLCBuTGVuICk7XG5cblx0XHRcdFx0dGhpcy5hZGROb3JtYWwoIGlhLCBpYiwgaWMgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR0aGlzLmFkZEZhY2VOb3JtYWwoIGlhLCBpYiwgaWMgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHQvLyB1dnNcblxuXHRcdFx0aWYgKCB1YSAhPT0gdW5kZWZpbmVkICYmIHVhICE9PSAnJyApIHtcblxuXHRcdFx0XHRjb25zdCB1dkxlbiA9IHRoaXMudXZzLmxlbmd0aDtcblxuXHRcdFx0XHRpYSA9IHRoaXMucGFyc2VVVkluZGV4KCB1YSwgdXZMZW4gKTtcblx0XHRcdFx0aWIgPSB0aGlzLnBhcnNlVVZJbmRleCggdWIsIHV2TGVuICk7XG5cdFx0XHRcdGljID0gdGhpcy5wYXJzZVVWSW5kZXgoIHVjLCB1dkxlbiApO1xuXG5cdFx0XHRcdHRoaXMuYWRkVVYoIGlhLCBpYiwgaWMgKTtcblxuXHRcdFx0XHR0aGlzLm9iamVjdC5nZW9tZXRyeS5oYXNVVkluZGljZXMgPSB0cnVlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIGFkZCBwbGFjZWhvbGRlciB2YWx1ZXMgKGZvciBpbmNvbnNpc3RlbnQgZmFjZSBkZWZpbml0aW9ucylcblxuXHRcdFx0XHR0aGlzLmFkZERlZmF1bHRVVigpO1xuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0YWRkUG9pbnRHZW9tZXRyeTogZnVuY3Rpb24gKCB2ZXJ0aWNlcyApIHtcblxuXHRcdFx0dGhpcy5vYmplY3QuZ2VvbWV0cnkudHlwZSA9ICdQb2ludHMnO1xuXG5cdFx0XHRjb25zdCB2TGVuID0gdGhpcy52ZXJ0aWNlcy5sZW5ndGg7XG5cblx0XHRcdGZvciAoIGxldCB2aSA9IDAsIGwgPSB2ZXJ0aWNlcy5sZW5ndGg7IHZpIDwgbDsgdmkgKysgKSB7XG5cblx0XHRcdFx0Y29uc3QgaW5kZXggPSB0aGlzLnBhcnNlVmVydGV4SW5kZXgoIHZlcnRpY2VzWyB2aSBdLCB2TGVuICk7XG5cblx0XHRcdFx0dGhpcy5hZGRWZXJ0ZXhQb2ludCggaW5kZXggKTtcblx0XHRcdFx0dGhpcy5hZGRDb2xvciggaW5kZXggKTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGFkZExpbmVHZW9tZXRyeTogZnVuY3Rpb24gKCB2ZXJ0aWNlcywgdXZzICkge1xuXG5cdFx0XHR0aGlzLm9iamVjdC5nZW9tZXRyeS50eXBlID0gJ0xpbmUnO1xuXG5cdFx0XHRjb25zdCB2TGVuID0gdGhpcy52ZXJ0aWNlcy5sZW5ndGg7XG5cdFx0XHRjb25zdCB1dkxlbiA9IHRoaXMudXZzLmxlbmd0aDtcblxuXHRcdFx0Zm9yICggbGV0IHZpID0gMCwgbCA9IHZlcnRpY2VzLmxlbmd0aDsgdmkgPCBsOyB2aSArKyApIHtcblxuXHRcdFx0XHR0aGlzLmFkZFZlcnRleExpbmUoIHRoaXMucGFyc2VWZXJ0ZXhJbmRleCggdmVydGljZXNbIHZpIF0sIHZMZW4gKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGZvciAoIGxldCB1dmkgPSAwLCBsID0gdXZzLmxlbmd0aDsgdXZpIDwgbDsgdXZpICsrICkge1xuXG5cdFx0XHRcdHRoaXMuYWRkVVZMaW5lKCB0aGlzLnBhcnNlVVZJbmRleCggdXZzWyB1dmkgXSwgdXZMZW4gKSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHRzdGF0ZS5zdGFydE9iamVjdCggJycsIGZhbHNlICk7XG5cblx0cmV0dXJuIHN0YXRlO1xuXG59XG5cbi8vXG5cbmNsYXNzIE9CSkxvYWRlciBleHRlbmRzIExvYWRlciB7XG5cblx0Y29uc3RydWN0b3IoIG1hbmFnZXIgKSB7XG5cblx0XHRzdXBlciggbWFuYWdlciApO1xuXG5cdFx0dGhpcy5tYXRlcmlhbHMgPSBudWxsO1xuXG5cdH1cblxuXHRsb2FkKCB1cmwsIG9uTG9hZCwgb25Qcm9ncmVzcywgb25FcnJvciApIHtcblxuXHRcdGNvbnN0IHNjb3BlID0gdGhpcztcblxuXHRcdGNvbnN0IGxvYWRlciA9IG5ldyBGaWxlTG9hZGVyKCB0aGlzLm1hbmFnZXIgKTtcblx0XHRsb2FkZXIuc2V0UGF0aCggdGhpcy5wYXRoICk7XG5cdFx0bG9hZGVyLnNldFJlcXVlc3RIZWFkZXIoIHRoaXMucmVxdWVzdEhlYWRlciApO1xuXHRcdGxvYWRlci5zZXRXaXRoQ3JlZGVudGlhbHMoIHRoaXMud2l0aENyZWRlbnRpYWxzICk7XG5cdFx0bG9hZGVyLmxvYWQoIHVybCwgZnVuY3Rpb24gKCB0ZXh0ICkge1xuXG5cdFx0XHR0cnkge1xuXG5cdFx0XHRcdG9uTG9hZCggc2NvcGUucGFyc2UoIHRleHQgKSApO1xuXG5cdFx0XHR9IGNhdGNoICggZSApIHtcblxuXHRcdFx0XHRpZiAoIG9uRXJyb3IgKSB7XG5cblx0XHRcdFx0XHRvbkVycm9yKCBlICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGUgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2NvcGUubWFuYWdlci5pdGVtRXJyb3IoIHVybCApO1xuXG5cdFx0XHR9XG5cblx0XHR9LCBvblByb2dyZXNzLCBvbkVycm9yICk7XG5cblx0fVxuXG5cdHNldE1hdGVyaWFscyggbWF0ZXJpYWxzICkge1xuXG5cdFx0dGhpcy5tYXRlcmlhbHMgPSBtYXRlcmlhbHM7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0cGFyc2UoIHRleHQgKSB7XG5cblx0XHRjb25zdCBzdGF0ZSA9IG5ldyBQYXJzZXJTdGF0ZSgpO1xuXG5cdFx0aWYgKCB0ZXh0LmluZGV4T2YoICdcXHJcXG4nICkgIT09IC0gMSApIHtcblxuXHRcdFx0Ly8gVGhpcyBpcyBmYXN0ZXIgdGhhbiBTdHJpbmcuc3BsaXQgd2l0aCByZWdleCB0aGF0IHNwbGl0cyBvbiBib3RoXG5cdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKCAvXFxyXFxuL2csICdcXG4nICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHRleHQuaW5kZXhPZiggJ1xcXFxcXG4nICkgIT09IC0gMSApIHtcblxuXHRcdFx0Ly8gam9pbiBsaW5lcyBzZXBhcmF0ZWQgYnkgYSBsaW5lIGNvbnRpbnVhdGlvbiBjaGFyYWN0ZXIgKFxcKVxuXHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZSggL1xcXFxcXG4vZywgJycgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCggJ1xcbicgKTtcblx0XHRsZXQgbGluZSA9ICcnLCBsaW5lRmlyc3RDaGFyID0gJyc7XG5cdFx0bGV0IGxpbmVMZW5ndGggPSAwO1xuXHRcdGxldCByZXN1bHQgPSBbXTtcblxuXHRcdC8vIEZhc3RlciB0byBqdXN0IHRyaW0gbGVmdCBzaWRlIG9mIHRoZSBsaW5lLiBVc2UgaWYgYXZhaWxhYmxlLlxuXHRcdGNvbnN0IHRyaW1MZWZ0ID0gKCB0eXBlb2YgJycudHJpbUxlZnQgPT09ICdmdW5jdGlvbicgKTtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdGxpbmUgPSBsaW5lc1sgaSBdO1xuXG5cdFx0XHRsaW5lID0gdHJpbUxlZnQgPyBsaW5lLnRyaW1MZWZ0KCkgOiBsaW5lLnRyaW0oKTtcblxuXHRcdFx0bGluZUxlbmd0aCA9IGxpbmUubGVuZ3RoO1xuXG5cdFx0XHRpZiAoIGxpbmVMZW5ndGggPT09IDAgKSBjb250aW51ZTtcblxuXHRcdFx0bGluZUZpcnN0Q2hhciA9IGxpbmUuY2hhckF0KCAwICk7XG5cblx0XHRcdC8vIEB0b2RvIGludm9rZSBwYXNzZWQgaW4gaGFuZGxlciBpZiBhbnlcblx0XHRcdGlmICggbGluZUZpcnN0Q2hhciA9PT0gJyMnICkgY29udGludWU7XG5cblx0XHRcdGlmICggbGluZUZpcnN0Q2hhciA9PT0gJ3YnICkge1xuXG5cdFx0XHRcdGNvbnN0IGRhdGEgPSBsaW5lLnNwbGl0KCAvXFxzKy8gKTtcblxuXHRcdFx0XHRzd2l0Y2ggKCBkYXRhWyAwIF0gKSB7XG5cblx0XHRcdFx0XHRjYXNlICd2Jzpcblx0XHRcdFx0XHRcdHN0YXRlLnZlcnRpY2VzLnB1c2goXG5cdFx0XHRcdFx0XHRcdHBhcnNlRmxvYXQoIGRhdGFbIDEgXSApLFxuXHRcdFx0XHRcdFx0XHRwYXJzZUZsb2F0KCBkYXRhWyAyIF0gKSxcblx0XHRcdFx0XHRcdFx0cGFyc2VGbG9hdCggZGF0YVsgMyBdIClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRpZiAoIGRhdGEubGVuZ3RoID49IDcgKSB7XG5cblx0XHRcdFx0XHRcdFx0c3RhdGUuY29sb3JzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VGbG9hdCggZGF0YVsgNCBdICksXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VGbG9hdCggZGF0YVsgNSBdICksXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VGbG9hdCggZGF0YVsgNiBdIClcblxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRcdC8vIGlmIG5vIGNvbG9ycyBhcmUgZGVmaW5lZCwgYWRkIHBsYWNlaG9sZGVycyBzbyBjb2xvciBhbmQgdmVydGV4IGluZGljZXMgbWF0Y2hcblxuXHRcdFx0XHRcdFx0XHRzdGF0ZS5jb2xvcnMucHVzaCggdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ3ZuJzpcblx0XHRcdFx0XHRcdHN0YXRlLm5vcm1hbHMucHVzaChcblx0XHRcdFx0XHRcdFx0cGFyc2VGbG9hdCggZGF0YVsgMSBdICksXG5cdFx0XHRcdFx0XHRcdHBhcnNlRmxvYXQoIGRhdGFbIDIgXSApLFxuXHRcdFx0XHRcdFx0XHRwYXJzZUZsb2F0KCBkYXRhWyAzIF0gKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ3Z0Jzpcblx0XHRcdFx0XHRcdHN0YXRlLnV2cy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRwYXJzZUZsb2F0KCBkYXRhWyAxIF0gKSxcblx0XHRcdFx0XHRcdFx0cGFyc2VGbG9hdCggZGF0YVsgMiBdIClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZiAoIGxpbmVGaXJzdENoYXIgPT09ICdmJyApIHtcblxuXHRcdFx0XHRjb25zdCBsaW5lRGF0YSA9IGxpbmUuc3Vic3RyKCAxICkudHJpbSgpO1xuXHRcdFx0XHRjb25zdCB2ZXJ0ZXhEYXRhID0gbGluZURhdGEuc3BsaXQoIC9cXHMrLyApO1xuXHRcdFx0XHRjb25zdCBmYWNlVmVydGljZXMgPSBbXTtcblxuXHRcdFx0XHQvLyBQYXJzZSB0aGUgZmFjZSB2ZXJ0ZXggZGF0YSBpbnRvIGFuIGVhc3kgdG8gd29yayB3aXRoIGZvcm1hdFxuXG5cdFx0XHRcdGZvciAoIGxldCBqID0gMCwgamwgPSB2ZXJ0ZXhEYXRhLmxlbmd0aDsgaiA8IGpsOyBqICsrICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgdmVydGV4ID0gdmVydGV4RGF0YVsgaiBdO1xuXG5cdFx0XHRcdFx0aWYgKCB2ZXJ0ZXgubGVuZ3RoID4gMCApIHtcblxuXHRcdFx0XHRcdFx0Y29uc3QgdmVydGV4UGFydHMgPSB2ZXJ0ZXguc3BsaXQoICcvJyApO1xuXHRcdFx0XHRcdFx0ZmFjZVZlcnRpY2VzLnB1c2goIHZlcnRleFBhcnRzICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIERyYXcgYW4gZWRnZSBiZXR3ZWVuIHRoZSBmaXJzdCB2ZXJ0ZXggYW5kIGFsbCBzdWJzZXF1ZW50IHZlcnRpY2VzIHRvIGZvcm0gYW4gbi1nb25cblxuXHRcdFx0XHRjb25zdCB2MSA9IGZhY2VWZXJ0aWNlc1sgMCBdO1xuXG5cdFx0XHRcdGZvciAoIGxldCBqID0gMSwgamwgPSBmYWNlVmVydGljZXMubGVuZ3RoIC0gMTsgaiA8IGpsOyBqICsrICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgdjIgPSBmYWNlVmVydGljZXNbIGogXTtcblx0XHRcdFx0XHRjb25zdCB2MyA9IGZhY2VWZXJ0aWNlc1sgaiArIDEgXTtcblxuXHRcdFx0XHRcdHN0YXRlLmFkZEZhY2UoXG5cdFx0XHRcdFx0XHR2MVsgMCBdLCB2MlsgMCBdLCB2M1sgMCBdLFxuXHRcdFx0XHRcdFx0djFbIDEgXSwgdjJbIDEgXSwgdjNbIDEgXSxcblx0XHRcdFx0XHRcdHYxWyAyIF0sIHYyWyAyIF0sIHYzWyAyIF1cblx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIGlmICggbGluZUZpcnN0Q2hhciA9PT0gJ2wnICkge1xuXG5cdFx0XHRcdGNvbnN0IGxpbmVQYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKCAxICkudHJpbSgpLnNwbGl0KCAnICcgKTtcblx0XHRcdFx0bGV0IGxpbmVWZXJ0aWNlcyA9IFtdO1xuXHRcdFx0XHRjb25zdCBsaW5lVVZzID0gW107XG5cblx0XHRcdFx0aWYgKCBsaW5lLmluZGV4T2YoICcvJyApID09PSAtIDEgKSB7XG5cblx0XHRcdFx0XHRsaW5lVmVydGljZXMgPSBsaW5lUGFydHM7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGZvciAoIGxldCBsaSA9IDAsIGxsZW4gPSBsaW5lUGFydHMubGVuZ3RoOyBsaSA8IGxsZW47IGxpICsrICkge1xuXG5cdFx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IGxpbmVQYXJ0c1sgbGkgXS5zcGxpdCggJy8nICk7XG5cblx0XHRcdFx0XHRcdGlmICggcGFydHNbIDAgXSAhPT0gJycgKSBsaW5lVmVydGljZXMucHVzaCggcGFydHNbIDAgXSApO1xuXHRcdFx0XHRcdFx0aWYgKCBwYXJ0c1sgMSBdICE9PSAnJyApIGxpbmVVVnMucHVzaCggcGFydHNbIDEgXSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzdGF0ZS5hZGRMaW5lR2VvbWV0cnkoIGxpbmVWZXJ0aWNlcywgbGluZVVWcyApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBsaW5lRmlyc3RDaGFyID09PSAncCcgKSB7XG5cblx0XHRcdFx0Y29uc3QgbGluZURhdGEgPSBsaW5lLnN1YnN0ciggMSApLnRyaW0oKTtcblx0XHRcdFx0Y29uc3QgcG9pbnREYXRhID0gbGluZURhdGEuc3BsaXQoICcgJyApO1xuXG5cdFx0XHRcdHN0YXRlLmFkZFBvaW50R2VvbWV0cnkoIHBvaW50RGF0YSApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCAoIHJlc3VsdCA9IF9vYmplY3RfcGF0dGVybi5leGVjKCBsaW5lICkgKSAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHQvLyBvIG9iamVjdF9uYW1lXG5cdFx0XHRcdC8vIG9yXG5cdFx0XHRcdC8vIGcgZ3JvdXBfbmFtZVxuXG5cdFx0XHRcdC8vIFdPUktBUk9VTkQ6IGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTI4Njlcblx0XHRcdFx0Ly8gbGV0IG5hbWUgPSByZXN1bHRbIDAgXS5zdWJzdHIoIDEgKS50cmltKCk7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSAoICcgJyArIHJlc3VsdFsgMCBdLnN1YnN0ciggMSApLnRyaW0oKSApLnN1YnN0ciggMSApO1xuXG5cdFx0XHRcdHN0YXRlLnN0YXJ0T2JqZWN0KCBuYW1lICk7XG5cblx0XHRcdH0gZWxzZSBpZiAoIF9tYXRlcmlhbF91c2VfcGF0dGVybi50ZXN0KCBsaW5lICkgKSB7XG5cblx0XHRcdFx0Ly8gbWF0ZXJpYWxcblxuXHRcdFx0XHRzdGF0ZS5vYmplY3Quc3RhcnRNYXRlcmlhbCggbGluZS5zdWJzdHJpbmcoIDcgKS50cmltKCksIHN0YXRlLm1hdGVyaWFsTGlicmFyaWVzICk7XG5cblx0XHRcdH0gZWxzZSBpZiAoIF9tYXRlcmlhbF9saWJyYXJ5X3BhdHRlcm4udGVzdCggbGluZSApICkge1xuXG5cdFx0XHRcdC8vIG10bCBmaWxlXG5cblx0XHRcdFx0c3RhdGUubWF0ZXJpYWxMaWJyYXJpZXMucHVzaCggbGluZS5zdWJzdHJpbmcoIDcgKS50cmltKCkgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggX21hcF91c2VfcGF0dGVybi50ZXN0KCBsaW5lICkgKSB7XG5cblx0XHRcdFx0Ly8gdGhlIGxpbmUgaXMgcGFyc2VkIGJ1dCBpZ25vcmVkIHNpbmNlIHRoZSBsb2FkZXIgYXNzdW1lcyB0ZXh0dXJlcyBhcmUgZGVmaW5lZCBNVEwgZmlsZXNcblx0XHRcdFx0Ly8gKGFjY29yZGluZyB0byBodHRwczovL3d3dy5va2luby5jb20vY29udi9pbXBfd2F2ZS5odG0sICd1c2VtYXAnIGlzIHRoZSBvbGQtc3R5bGUgV2F2ZWZyb250IHRleHR1cmUgcmVmZXJlbmNlIG1ldGhvZClcblxuXHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5PQkpMb2FkZXI6IFJlbmRlcmluZyBpZGVudGlmaWVyIFwidXNlbWFwXCIgbm90IHN1cHBvcnRlZC4gVGV4dHVyZXMgbXVzdCBiZSBkZWZpbmVkIGluIE1UTCBmaWxlcy4nICk7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGxpbmVGaXJzdENoYXIgPT09ICdzJyApIHtcblxuXHRcdFx0XHRyZXN1bHQgPSBsaW5lLnNwbGl0KCAnICcgKTtcblxuXHRcdFx0XHQvLyBzbW9vdGggc2hhZGluZ1xuXG5cdFx0XHRcdC8vIEB0b2RvIEhhbmRsZSBmaWxlcyB0aGF0IGhhdmUgdmFyeWluZyBzbW9vdGggdmFsdWVzIGZvciBhIHNldCBvZiBmYWNlcyBpbnNpZGUgb25lIGdlb21ldHJ5LFxuXHRcdFx0XHQvLyBidXQgZG9lcyBub3QgZGVmaW5lIGEgdXNlbXRsIGZvciBlYWNoIGZhY2Ugc2V0LlxuXHRcdFx0XHQvLyBUaGlzIHNob3VsZCBiZSBkZXRlY3RlZCBhbmQgYSBkdW1teSBtYXRlcmlhbCBjcmVhdGVkIChsYXRlciBNdWx0aU1hdGVyaWFsIGFuZCBnZW9tZXRyeSBncm91cHMpLlxuXHRcdFx0XHQvLyBUaGlzIHJlcXVpcmVzIHNvbWUgY2FyZSB0byBub3QgY3JlYXRlIGV4dHJhIG1hdGVyaWFsIG9uIGVhY2ggc21vb3RoIHZhbHVlIGZvciBcIm5vcm1hbFwiIG9iaiBmaWxlcy5cblx0XHRcdFx0Ly8gd2hlcmUgZXhwbGljaXQgdXNlbXRsIGRlZmluZXMgZ2VvbWV0cnkgZ3JvdXBzLlxuXHRcdFx0XHQvLyBFeGFtcGxlIGFzc2V0OiBleGFtcGxlcy9tb2RlbHMvb2JqL2NlcmJlcnVzL0NlcmJlcnVzLm9ialxuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdFx0ICogaHR0cDovL3BhdWxib3Vya2UubmV0L2RhdGFmb3JtYXRzL29iai9cblx0XHRcdFx0XHQgKiBvclxuXHRcdFx0XHRcdCAqIGh0dHA6Ly93d3cuY3MudXRhaC5lZHUvfmJvdWxvcy9jczM1MDUvb2JqX3NwZWMucGRmXG5cdFx0XHRcdFx0ICpcblx0XHRcdFx0XHQgKiBGcm9tIGNoYXB0ZXIgXCJHcm91cGluZ1wiIFN5bnRheCBleHBsYW5hdGlvbiBcInMgZ3JvdXBfbnVtYmVyXCI6XG5cdFx0XHRcdFx0ICogXCJncm91cF9udW1iZXIgaXMgdGhlIHNtb290aGluZyBncm91cCBudW1iZXIuIFRvIHR1cm4gb2ZmIHNtb290aGluZyBncm91cHMsIHVzZSBhIHZhbHVlIG9mIDAgb3Igb2ZmLlxuXHRcdFx0XHRcdCAqIFBvbHlnb25hbCBlbGVtZW50cyB1c2UgZ3JvdXAgbnVtYmVycyB0byBwdXQgZWxlbWVudHMgaW4gZGlmZmVyZW50IHNtb290aGluZyBncm91cHMuIEZvciBmcmVlLWZvcm1cblx0XHRcdFx0XHQgKiBzdXJmYWNlcywgc21vb3RoaW5nIGdyb3VwcyBhcmUgZWl0aGVyIHR1cm5lZCBvbiBvciBvZmY7IHRoZXJlIGlzIG5vIGRpZmZlcmVuY2UgYmV0d2VlbiB2YWx1ZXMgZ3JlYXRlclxuXHRcdFx0XHRcdCAqIHRoYW4gMC5cIlxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRpZiAoIHJlc3VsdC5sZW5ndGggPiAxICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSByZXN1bHRbIDEgXS50cmltKCkudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRzdGF0ZS5vYmplY3Quc21vb3RoID0gKCB2YWx1ZSAhPT0gJzAnICYmIHZhbHVlICE9PSAnb2ZmJyApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBaQnJ1c2ggY2FuIHByb2R1Y2UgXCJzXCIgbGluZXMgIzExNzA3XG5cdFx0XHRcdFx0c3RhdGUub2JqZWN0LnNtb290aCA9IHRydWU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IG1hdGVyaWFsID0gc3RhdGUub2JqZWN0LmN1cnJlbnRNYXRlcmlhbCgpO1xuXHRcdFx0XHRpZiAoIG1hdGVyaWFsICkgbWF0ZXJpYWwuc21vb3RoID0gc3RhdGUub2JqZWN0LnNtb290aDtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBIYW5kbGUgbnVsbCB0ZXJtaW5hdGVkIGZpbGVzIHdpdGhvdXQgZXhjZXB0aW9uXG5cdFx0XHRcdGlmICggbGluZSA9PT0gJ1xcMCcgKSBjb250aW51ZTtcblxuXHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5PQkpMb2FkZXI6IFVuZXhwZWN0ZWQgbGluZTogXCInICsgbGluZSArICdcIicgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0c3RhdGUuZmluYWxpemUoKTtcblxuXHRcdGNvbnN0IGNvbnRhaW5lciA9IG5ldyBHcm91cCgpO1xuXHRcdGNvbnRhaW5lci5tYXRlcmlhbExpYnJhcmllcyA9IFtdLmNvbmNhdCggc3RhdGUubWF0ZXJpYWxMaWJyYXJpZXMgKTtcblxuXHRcdGNvbnN0IGhhc1ByaW1pdGl2ZXMgPSAhICggc3RhdGUub2JqZWN0cy5sZW5ndGggPT09IDEgJiYgc3RhdGUub2JqZWN0c1sgMCBdLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCA9PT0gMCApO1xuXG5cdFx0aWYgKCBoYXNQcmltaXRpdmVzID09PSB0cnVlICkge1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGwgPSBzdGF0ZS5vYmplY3RzLmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0Y29uc3Qgb2JqZWN0ID0gc3RhdGUub2JqZWN0c1sgaSBdO1xuXHRcdFx0XHRjb25zdCBnZW9tZXRyeSA9IG9iamVjdC5nZW9tZXRyeTtcblx0XHRcdFx0Y29uc3QgbWF0ZXJpYWxzID0gb2JqZWN0Lm1hdGVyaWFscztcblx0XHRcdFx0Y29uc3QgaXNMaW5lID0gKCBnZW9tZXRyeS50eXBlID09PSAnTGluZScgKTtcblx0XHRcdFx0Y29uc3QgaXNQb2ludHMgPSAoIGdlb21ldHJ5LnR5cGUgPT09ICdQb2ludHMnICk7XG5cdFx0XHRcdGxldCBoYXNWZXJ0ZXhDb2xvcnMgPSBmYWxzZTtcblxuXHRcdFx0XHQvLyBTa2lwIG8vZyBsaW5lIGRlY2xhcmF0aW9ucyB0aGF0IGRpZCBub3QgZm9sbG93IHdpdGggYW55IGZhY2VzXG5cdFx0XHRcdGlmICggZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoID09PSAwICkgY29udGludWU7XG5cblx0XHRcdFx0Y29uc3QgYnVmZmVyZ2VvbWV0cnkgPSBuZXcgQnVmZmVyR2VvbWV0cnkoKTtcblxuXHRcdFx0XHRidWZmZXJnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlKCBnZW9tZXRyeS52ZXJ0aWNlcywgMyApICk7XG5cblx0XHRcdFx0aWYgKCBnZW9tZXRyeS5ub3JtYWxzLmxlbmd0aCA+IDAgKSB7XG5cblx0XHRcdFx0XHRidWZmZXJnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoICdub3JtYWwnLCBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSggZ2VvbWV0cnkubm9ybWFscywgMyApICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggZ2VvbWV0cnkuY29sb3JzLmxlbmd0aCA+IDAgKSB7XG5cblx0XHRcdFx0XHRoYXNWZXJ0ZXhDb2xvcnMgPSB0cnVlO1xuXHRcdFx0XHRcdGJ1ZmZlcmdlb21ldHJ5LnNldEF0dHJpYnV0ZSggJ2NvbG9yJywgbmV3IEZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUoIGdlb21ldHJ5LmNvbG9ycywgMyApICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggZ2VvbWV0cnkuaGFzVVZJbmRpY2VzID09PSB0cnVlICkge1xuXG5cdFx0XHRcdFx0YnVmZmVyZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCAndXYnLCBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSggZ2VvbWV0cnkudXZzLCAyICkgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ3JlYXRlIG1hdGVyaWFsc1xuXG5cdFx0XHRcdGNvbnN0IGNyZWF0ZWRNYXRlcmlhbHMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCBsZXQgbWkgPSAwLCBtaUxlbiA9IG1hdGVyaWFscy5sZW5ndGg7IG1pIDwgbWlMZW47IG1pICsrICkge1xuXG5cdFx0XHRcdFx0Y29uc3Qgc291cmNlTWF0ZXJpYWwgPSBtYXRlcmlhbHNbIG1pIF07XG5cdFx0XHRcdFx0Y29uc3QgbWF0ZXJpYWxIYXNoID0gc291cmNlTWF0ZXJpYWwubmFtZSArICdfJyArIHNvdXJjZU1hdGVyaWFsLnNtb290aCArICdfJyArIGhhc1ZlcnRleENvbG9ycztcblx0XHRcdFx0XHRsZXQgbWF0ZXJpYWwgPSBzdGF0ZS5tYXRlcmlhbHNbIG1hdGVyaWFsSGFzaCBdO1xuXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1hdGVyaWFscyAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRcdFx0bWF0ZXJpYWwgPSB0aGlzLm1hdGVyaWFscy5jcmVhdGUoIHNvdXJjZU1hdGVyaWFsLm5hbWUgKTtcblxuXHRcdFx0XHRcdFx0Ly8gbXRsIGV0Yy4gbG9hZGVycyBwcm9iYWJseSBjYW4ndCBjcmVhdGUgbGluZSBtYXRlcmlhbHMgY29ycmVjdGx5LCBjb3B5IHByb3BlcnRpZXMgdG8gYSBsaW5lIG1hdGVyaWFsLlxuXHRcdFx0XHRcdFx0aWYgKCBpc0xpbmUgJiYgbWF0ZXJpYWwgJiYgISAoIG1hdGVyaWFsIGluc3RhbmNlb2YgTGluZUJhc2ljTWF0ZXJpYWwgKSApIHtcblxuXHRcdFx0XHRcdFx0XHRjb25zdCBtYXRlcmlhbExpbmUgPSBuZXcgTGluZUJhc2ljTWF0ZXJpYWwoKTtcblx0XHRcdFx0XHRcdFx0TWF0ZXJpYWwucHJvdG90eXBlLmNvcHkuY2FsbCggbWF0ZXJpYWxMaW5lLCBtYXRlcmlhbCApO1xuXHRcdFx0XHRcdFx0XHRtYXRlcmlhbExpbmUuY29sb3IuY29weSggbWF0ZXJpYWwuY29sb3IgKTtcblx0XHRcdFx0XHRcdFx0bWF0ZXJpYWwgPSBtYXRlcmlhbExpbmU7XG5cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIGlzUG9pbnRzICYmIG1hdGVyaWFsICYmICEgKCBtYXRlcmlhbCBpbnN0YW5jZW9mIFBvaW50c01hdGVyaWFsICkgKSB7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgbWF0ZXJpYWxQb2ludHMgPSBuZXcgUG9pbnRzTWF0ZXJpYWwoIHsgc2l6ZTogMTAsIHNpemVBdHRlbnVhdGlvbjogZmFsc2UgfSApO1xuXHRcdFx0XHRcdFx0XHRNYXRlcmlhbC5wcm90b3R5cGUuY29weS5jYWxsKCBtYXRlcmlhbFBvaW50cywgbWF0ZXJpYWwgKTtcblx0XHRcdFx0XHRcdFx0bWF0ZXJpYWxQb2ludHMuY29sb3IuY29weSggbWF0ZXJpYWwuY29sb3IgKTtcblx0XHRcdFx0XHRcdFx0bWF0ZXJpYWxQb2ludHMubWFwID0gbWF0ZXJpYWwubWFwO1xuXHRcdFx0XHRcdFx0XHRtYXRlcmlhbCA9IG1hdGVyaWFsUG9pbnRzO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIG1hdGVyaWFsID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdGlmICggaXNMaW5lICkge1xuXG5cdFx0XHRcdFx0XHRcdG1hdGVyaWFsID0gbmV3IExpbmVCYXNpY01hdGVyaWFsKCk7XG5cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIGlzUG9pbnRzICkge1xuXG5cdFx0XHRcdFx0XHRcdG1hdGVyaWFsID0gbmV3IFBvaW50c01hdGVyaWFsKCB7IHNpemU6IDEsIHNpemVBdHRlbnVhdGlvbjogZmFsc2UgfSApO1xuXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRcdG1hdGVyaWFsID0gbmV3IE1lc2hQaG9uZ01hdGVyaWFsKCk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bWF0ZXJpYWwubmFtZSA9IHNvdXJjZU1hdGVyaWFsLm5hbWU7XG5cdFx0XHRcdFx0XHRtYXRlcmlhbC5mbGF0U2hhZGluZyA9IHNvdXJjZU1hdGVyaWFsLnNtb290aCA/IGZhbHNlIDogdHJ1ZTtcblx0XHRcdFx0XHRcdG1hdGVyaWFsLnZlcnRleENvbG9ycyA9IGhhc1ZlcnRleENvbG9ycztcblxuXHRcdFx0XHRcdFx0c3RhdGUubWF0ZXJpYWxzWyBtYXRlcmlhbEhhc2ggXSA9IG1hdGVyaWFsO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y3JlYXRlZE1hdGVyaWFscy5wdXNoKCBtYXRlcmlhbCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDcmVhdGUgbWVzaFxuXG5cdFx0XHRcdGxldCBtZXNoO1xuXG5cdFx0XHRcdGlmICggY3JlYXRlZE1hdGVyaWFscy5sZW5ndGggPiAxICkge1xuXG5cdFx0XHRcdFx0Zm9yICggbGV0IG1pID0gMCwgbWlMZW4gPSBtYXRlcmlhbHMubGVuZ3RoOyBtaSA8IG1pTGVuOyBtaSArKyApIHtcblxuXHRcdFx0XHRcdFx0Y29uc3Qgc291cmNlTWF0ZXJpYWwgPSBtYXRlcmlhbHNbIG1pIF07XG5cdFx0XHRcdFx0XHRidWZmZXJnZW9tZXRyeS5hZGRHcm91cCggc291cmNlTWF0ZXJpYWwuZ3JvdXBTdGFydCwgc291cmNlTWF0ZXJpYWwuZ3JvdXBDb3VudCwgbWkgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggaXNMaW5lICkge1xuXG5cdFx0XHRcdFx0XHRtZXNoID0gbmV3IExpbmVTZWdtZW50cyggYnVmZmVyZ2VvbWV0cnksIGNyZWF0ZWRNYXRlcmlhbHMgKTtcblxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIGlzUG9pbnRzICkge1xuXG5cdFx0XHRcdFx0XHRtZXNoID0gbmV3IFBvaW50cyggYnVmZmVyZ2VvbWV0cnksIGNyZWF0ZWRNYXRlcmlhbHMgKTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdG1lc2ggPSBuZXcgTWVzaCggYnVmZmVyZ2VvbWV0cnksIGNyZWF0ZWRNYXRlcmlhbHMgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYgKCBpc0xpbmUgKSB7XG5cblx0XHRcdFx0XHRcdG1lc2ggPSBuZXcgTGluZVNlZ21lbnRzKCBidWZmZXJnZW9tZXRyeSwgY3JlYXRlZE1hdGVyaWFsc1sgMCBdICk7XG5cblx0XHRcdFx0XHR9IGVsc2UgaWYgKCBpc1BvaW50cyApIHtcblxuXHRcdFx0XHRcdFx0bWVzaCA9IG5ldyBQb2ludHMoIGJ1ZmZlcmdlb21ldHJ5LCBjcmVhdGVkTWF0ZXJpYWxzWyAwIF0gKTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdG1lc2ggPSBuZXcgTWVzaCggYnVmZmVyZ2VvbWV0cnksIGNyZWF0ZWRNYXRlcmlhbHNbIDAgXSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtZXNoLm5hbWUgPSBvYmplY3QubmFtZTtcblxuXHRcdFx0XHRjb250YWluZXIuYWRkKCBtZXNoICk7XG5cblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgdGhlIGRlZmF1bHQgcGFyc2VyIHN0YXRlIG9iamVjdCB3aXRoIG5vIGdlb21ldHJ5IGRhdGEsIGludGVycHJldCBkYXRhIGFzIHBvaW50IGNsb3VkXG5cblx0XHRcdGlmICggc3RhdGUudmVydGljZXMubGVuZ3RoID4gMCApIHtcblxuXHRcdFx0XHRjb25zdCBtYXRlcmlhbCA9IG5ldyBQb2ludHNNYXRlcmlhbCggeyBzaXplOiAxLCBzaXplQXR0ZW51YXRpb246IGZhbHNlIH0gKTtcblxuXHRcdFx0XHRjb25zdCBidWZmZXJnZW9tZXRyeSA9IG5ldyBCdWZmZXJHZW9tZXRyeSgpO1xuXG5cdFx0XHRcdGJ1ZmZlcmdlb21ldHJ5LnNldEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJywgbmV3IEZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUoIHN0YXRlLnZlcnRpY2VzLCAzICkgKTtcblxuXHRcdFx0XHRpZiAoIHN0YXRlLmNvbG9ycy5sZW5ndGggPiAwICYmIHN0YXRlLmNvbG9yc1sgMCBdICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRidWZmZXJnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoICdjb2xvcicsIG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlKCBzdGF0ZS5jb2xvcnMsIDMgKSApO1xuXHRcdFx0XHRcdG1hdGVyaWFsLnZlcnRleENvbG9ycyA9IHRydWU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHBvaW50cyA9IG5ldyBQb2ludHMoIGJ1ZmZlcmdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXHRcdFx0XHRjb250YWluZXIuYWRkKCBwb2ludHMgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbnRhaW5lcjtcblxuXHR9XG5cbn1cblxuZXhwb3J0IHsgT0JKTG9hZGVyIH07XG4iXSwic291cmNlUm9vdCI6IiJ9