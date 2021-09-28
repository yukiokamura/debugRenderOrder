(self["webpackChunkgulp"] = self["webpackChunkgulp"] || []).push([["MTLLoader"],{

/***/ "./node_modules/three/examples/jsm/loaders/MTLLoader.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/loaders/MTLLoader.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MTLLoader": () => (/* binding */ MTLLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");


/**
 * Loads a Wavefront .mtl file specifying materials
 */

class MTLLoader extends three__WEBPACK_IMPORTED_MODULE_0__.Loader {

	constructor( manager ) {

		super( manager );

	}

	/**
	 * Loads and parses a MTL asset from a URL.
	 *
	 * @param {String} url - URL to the MTL file.
	 * @param {Function} [onLoad] - Callback invoked with the loaded object.
	 * @param {Function} [onProgress] - Callback for download progress.
	 * @param {Function} [onError] - Callback for download errors.
	 *
	 * @see setPath setResourcePath
	 *
	 * @note In order for relative texture references to resolve correctly
	 * you must call setResourcePath() explicitly prior to load.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( this.path === '' ) ? three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.extractUrlBase( url ) : this.path;

		const loader = new three__WEBPACK_IMPORTED_MODULE_0__.FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text, path ) );

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

	setMaterialOptions( value ) {

		this.materialOptions = value;
		return this;

	}

	/**
	 * Parses a MTL file.
	 *
	 * @param {String} text - Content of MTL file
	 * @return {MaterialCreator}
	 *
	 * @see setPath setResourcePath
	 *
	 * @note In order for relative texture references to resolve correctly
	 * you must call setResourcePath() explicitly prior to parse.
	 */
	parse( text, path ) {

		const lines = text.split( '\n' );
		let info = {};
		const delimiter_pattern = /\s+/;
		const materialsInfo = {};

		for ( let i = 0; i < lines.length; i ++ ) {

			let line = lines[ i ];
			line = line.trim();

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				// Blank line or comment ignore
				continue;

			}

			const pos = line.indexOf( ' ' );

			let key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
			key = key.toLowerCase();

			let value = ( pos >= 0 ) ? line.substring( pos + 1 ) : '';
			value = value.trim();

			if ( key === 'newmtl' ) {

				// New material

				info = { name: value };
				materialsInfo[ value ] = info;

			} else {

				if ( key === 'ka' || key === 'kd' || key === 'ks' || key === 'ke' ) {

					const ss = value.split( delimiter_pattern, 3 );
					info[ key ] = [ parseFloat( ss[ 0 ] ), parseFloat( ss[ 1 ] ), parseFloat( ss[ 2 ] ) ];

				} else {

					info[ key ] = value;

				}

			}

		}

		const materialCreator = new MaterialCreator( this.resourcePath || path, this.materialOptions );
		materialCreator.setCrossOrigin( this.crossOrigin );
		materialCreator.setManager( this.manager );
		materialCreator.setMaterials( materialsInfo );
		return materialCreator;

	}

}

/**
 * Create a new MTLLoader.MaterialCreator
 * @param baseUrl - Url relative to which textures are loaded
 * @param options - Set of options on how to construct the materials
 *                  side: Which side to apply the material
 *                        FrontSide (default), THREE.BackSide, THREE.DoubleSide
 *                  wrap: What type of wrapping to apply for textures
 *                        RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
 *                                Default: false, assumed to be already normalized
 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
 *                                  Default: false
 * @constructor
 */

class MaterialCreator {

	constructor( baseUrl = '', options = {} ) {

		this.baseUrl = baseUrl;
		this.options = options;
		this.materialsInfo = {};
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

		this.crossOrigin = 'anonymous';

		this.side = ( this.options.side !== undefined ) ? this.options.side : three__WEBPACK_IMPORTED_MODULE_0__.FrontSide;
		this.wrap = ( this.options.wrap !== undefined ) ? this.options.wrap : three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;

	}

	setCrossOrigin( value ) {

		this.crossOrigin = value;
		return this;

	}

	setManager( value ) {

		this.manager = value;

	}

	setMaterials( materialsInfo ) {

		this.materialsInfo = this.convert( materialsInfo );
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

	}

	convert( materialsInfo ) {

		if ( ! this.options ) return materialsInfo;

		const converted = {};

		for ( const mn in materialsInfo ) {

			// Convert materials info into normalized form based on options

			const mat = materialsInfo[ mn ];

			const covmat = {};

			converted[ mn ] = covmat;

			for ( const prop in mat ) {

				let save = true;
				let value = mat[ prop ];
				const lprop = prop.toLowerCase();

				switch ( lprop ) {

					case 'kd':
					case 'ka':
					case 'ks':

						// Diffuse color (color under white light) using RGB values

						if ( this.options && this.options.normalizeRGB ) {

							value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];

						}

						if ( this.options && this.options.ignoreZeroRGBs ) {

							if ( value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 2 ] === 0 ) {

								// ignore

								save = false;

							}

						}

						break;

					default:

						break;

				}

				if ( save ) {

					covmat[ lprop ] = value;

				}

			}

		}

		return converted;

	}

	preload() {

		for ( const mn in this.materialsInfo ) {

			this.create( mn );

		}

	}

	getIndex( materialName ) {

		return this.nameLookup[ materialName ];

	}

	getAsArray() {

		let index = 0;

		for ( const mn in this.materialsInfo ) {

			this.materialsArray[ index ] = this.create( mn );
			this.nameLookup[ mn ] = index;
			index ++;

		}

		return this.materialsArray;

	}

	create( materialName ) {

		if ( this.materials[ materialName ] === undefined ) {

			this.createMaterial_( materialName );

		}

		return this.materials[ materialName ];

	}

	createMaterial_( materialName ) {

		// Create material

		const scope = this;
		const mat = this.materialsInfo[ materialName ];
		const params = {

			name: materialName,
			side: this.side

		};

		function resolveURL( baseUrl, url ) {

			if ( typeof url !== 'string' || url === '' )
				return '';

			// Absolute URL
			if ( /^https?:\/\//i.test( url ) ) return url;

			return baseUrl + url;

		}

		function setMapForType( mapType, value ) {

			if ( params[ mapType ] ) return; // Keep the first encountered texture

			const texParams = scope.getTextureParams( value, params );
			const map = scope.loadTexture( resolveURL( scope.baseUrl, texParams.url ) );

			map.repeat.copy( texParams.scale );
			map.offset.copy( texParams.offset );

			map.wrapS = scope.wrap;
			map.wrapT = scope.wrap;

			params[ mapType ] = map;

		}

		for ( const prop in mat ) {

			const value = mat[ prop ];
			let n;

			if ( value === '' ) continue;

			switch ( prop.toLowerCase() ) {

				// Ns is material specular exponent

				case 'kd':

					// Diffuse color (color under white light) using RGB values

					params.color = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( value );

					break;

				case 'ks':

					// Specular color (color when light is reflected from shiny surface) using RGB values
					params.specular = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( value );

					break;

				case 'ke':

					// Emissive using RGB values
					params.emissive = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( value );

					break;

				case 'map_kd':

					// Diffuse texture map

					setMapForType( 'map', value );

					break;

				case 'map_ks':

					// Specular map

					setMapForType( 'specularMap', value );

					break;

				case 'map_ke':

					// Emissive map

					setMapForType( 'emissiveMap', value );

					break;

				case 'norm':

					setMapForType( 'normalMap', value );

					break;

				case 'map_bump':
				case 'bump':

					// Bump texture map

					setMapForType( 'bumpMap', value );

					break;

				case 'map_d':

					// Alpha map

					setMapForType( 'alphaMap', value );
					params.transparent = true;

					break;

				case 'ns':

					// The specular exponent (defines the focus of the specular highlight)
					// A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

					params.shininess = parseFloat( value );

					break;

				case 'd':
					n = parseFloat( value );

					if ( n < 1 ) {

						params.opacity = n;
						params.transparent = true;

					}

					break;

				case 'tr':
					n = parseFloat( value );

					if ( this.options && this.options.invertTrProperty ) n = 1 - n;

					if ( n > 0 ) {

						params.opacity = 1 - n;
						params.transparent = true;

					}

					break;

				default:
					break;

			}

		}

		this.materials[ materialName ] = new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial( params );
		return this.materials[ materialName ];

	}

	getTextureParams( value, matParams ) {

		const texParams = {

			scale: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2( 1, 1 ),
			offset: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2( 0, 0 )

		 };

		const items = value.split( /\s+/ );
		let pos;

		pos = items.indexOf( '-bm' );

		if ( pos >= 0 ) {

			matParams.bumpScale = parseFloat( items[ pos + 1 ] );
			items.splice( pos, 2 );

		}

		pos = items.indexOf( '-s' );

		if ( pos >= 0 ) {

			texParams.scale.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
			items.splice( pos, 4 ); // we expect 3 parameters here!

		}

		pos = items.indexOf( '-o' );

		if ( pos >= 0 ) {

			texParams.offset.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
			items.splice( pos, 4 ); // we expect 3 parameters here!

		}

		texParams.url = items.join( ' ' ).trim();
		return texParams;

	}

	loadTexture( url, mapping, onLoad, onProgress, onError ) {

		const manager = ( this.manager !== undefined ) ? this.manager : three__WEBPACK_IMPORTED_MODULE_0__.DefaultLoadingManager;
		let loader = manager.getHandler( url );

		if ( loader === null ) {

			loader = new three__WEBPACK_IMPORTED_MODULE_0__.TextureLoader( manager );

		}

		if ( loader.setCrossOrigin ) loader.setCrossOrigin( this.crossOrigin );

		const texture = loader.load( url, onLoad, onProgress, onError );

		if ( mapping !== undefined ) texture.mapping = mapping;

		return texture;

	}

}




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWxwLy4vbm9kZV9tb2R1bGVzL3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL01UTExvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQVdlOztBQUVmO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IseUNBQU07O0FBRTlCOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksT0FBTztBQUNuQixZQUFZLFNBQVM7QUFDckIsWUFBWSxTQUFTO0FBQ3JCLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxzQ0FBc0MsNkRBQTBCOztBQUVoRSxxQkFBcUIsNkNBQVU7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLE9BQU87QUFDbkIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixrQkFBa0I7O0FBRXBDO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsWUFBWTtBQUNaOztBQUVBLElBQUk7O0FBRUo7O0FBRUE7QUFDQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx3Q0FBd0M7O0FBRXhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx3RUFBd0UsNENBQVM7QUFDakYsd0VBQXdFLGlEQUFjOztBQUV0Rjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxtQ0FBbUM7O0FBRW5DO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsd0JBQXdCLHdDQUFLOztBQUU3Qjs7QUFFQTs7QUFFQTtBQUNBLDJCQUEyQix3Q0FBSzs7QUFFaEM7O0FBRUE7O0FBRUE7QUFDQSwyQkFBMkIsd0NBQUs7O0FBRWhDOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSx1Q0FBdUMsb0RBQWlCO0FBQ3hEOztBQUVBOztBQUVBOztBQUVBOztBQUVBLGNBQWMsMENBQU87QUFDckIsZUFBZSwwQ0FBTzs7QUFFdEI7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsMEJBQTBCOztBQUUxQjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLDBCQUEwQjs7QUFFMUI7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxrRUFBa0Usd0RBQXFCO0FBQ3ZGOztBQUVBOztBQUVBLGdCQUFnQixnREFBYTs7QUFFN0I7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRXFCIiwiZmlsZSI6Ik1UTExvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdENvbG9yLFxuXHREZWZhdWx0TG9hZGluZ01hbmFnZXIsXG5cdEZpbGVMb2FkZXIsXG5cdEZyb250U2lkZSxcblx0TG9hZGVyLFxuXHRMb2FkZXJVdGlscyxcblx0TWVzaFBob25nTWF0ZXJpYWwsXG5cdFJlcGVhdFdyYXBwaW5nLFxuXHRUZXh0dXJlTG9hZGVyLFxuXHRWZWN0b3IyXG59IGZyb20gJ3RocmVlJztcblxuLyoqXG4gKiBMb2FkcyBhIFdhdmVmcm9udCAubXRsIGZpbGUgc3BlY2lmeWluZyBtYXRlcmlhbHNcbiAqL1xuXG5jbGFzcyBNVExMb2FkZXIgZXh0ZW5kcyBMb2FkZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBtYW5hZ2VyICkge1xuXG5cdFx0c3VwZXIoIG1hbmFnZXIgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGFuZCBwYXJzZXMgYSBNVEwgYXNzZXQgZnJvbSBhIFVSTC5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHVybCAtIFVSTCB0byB0aGUgTVRMIGZpbGUuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkxvYWRdIC0gQ2FsbGJhY2sgaW52b2tlZCB3aXRoIHRoZSBsb2FkZWQgb2JqZWN0LlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb25Qcm9ncmVzc10gLSBDYWxsYmFjayBmb3IgZG93bmxvYWQgcHJvZ3Jlc3MuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkVycm9yXSAtIENhbGxiYWNrIGZvciBkb3dubG9hZCBlcnJvcnMuXG5cdCAqXG5cdCAqIEBzZWUgc2V0UGF0aCBzZXRSZXNvdXJjZVBhdGhcblx0ICpcblx0ICogQG5vdGUgSW4gb3JkZXIgZm9yIHJlbGF0aXZlIHRleHR1cmUgcmVmZXJlbmNlcyB0byByZXNvbHZlIGNvcnJlY3RseVxuXHQgKiB5b3UgbXVzdCBjYWxsIHNldFJlc291cmNlUGF0aCgpIGV4cGxpY2l0bHkgcHJpb3IgdG8gbG9hZC5cblx0ICovXG5cdGxvYWQoIHVybCwgb25Mb2FkLCBvblByb2dyZXNzLCBvbkVycm9yICkge1xuXG5cdFx0Y29uc3Qgc2NvcGUgPSB0aGlzO1xuXG5cdFx0Y29uc3QgcGF0aCA9ICggdGhpcy5wYXRoID09PSAnJyApID8gTG9hZGVyVXRpbHMuZXh0cmFjdFVybEJhc2UoIHVybCApIDogdGhpcy5wYXRoO1xuXG5cdFx0Y29uc3QgbG9hZGVyID0gbmV3IEZpbGVMb2FkZXIoIHRoaXMubWFuYWdlciApO1xuXHRcdGxvYWRlci5zZXRQYXRoKCB0aGlzLnBhdGggKTtcblx0XHRsb2FkZXIuc2V0UmVxdWVzdEhlYWRlciggdGhpcy5yZXF1ZXN0SGVhZGVyICk7XG5cdFx0bG9hZGVyLnNldFdpdGhDcmVkZW50aWFscyggdGhpcy53aXRoQ3JlZGVudGlhbHMgKTtcblx0XHRsb2FkZXIubG9hZCggdXJsLCBmdW5jdGlvbiAoIHRleHQgKSB7XG5cblx0XHRcdHRyeSB7XG5cblx0XHRcdFx0b25Mb2FkKCBzY29wZS5wYXJzZSggdGV4dCwgcGF0aCApICk7XG5cblx0XHRcdH0gY2F0Y2ggKCBlICkge1xuXG5cdFx0XHRcdGlmICggb25FcnJvciApIHtcblxuXHRcdFx0XHRcdG9uRXJyb3IoIGUgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciggZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzY29wZS5tYW5hZ2VyLml0ZW1FcnJvciggdXJsICk7XG5cblx0XHRcdH1cblxuXHRcdH0sIG9uUHJvZ3Jlc3MsIG9uRXJyb3IgKTtcblxuXHR9XG5cblx0c2V0TWF0ZXJpYWxPcHRpb25zKCB2YWx1ZSApIHtcblxuXHRcdHRoaXMubWF0ZXJpYWxPcHRpb25zID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgYSBNVEwgZmlsZS5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHQgLSBDb250ZW50IG9mIE1UTCBmaWxlXG5cdCAqIEByZXR1cm4ge01hdGVyaWFsQ3JlYXRvcn1cblx0ICpcblx0ICogQHNlZSBzZXRQYXRoIHNldFJlc291cmNlUGF0aFxuXHQgKlxuXHQgKiBAbm90ZSBJbiBvcmRlciBmb3IgcmVsYXRpdmUgdGV4dHVyZSByZWZlcmVuY2VzIHRvIHJlc29sdmUgY29ycmVjdGx5XG5cdCAqIHlvdSBtdXN0IGNhbGwgc2V0UmVzb3VyY2VQYXRoKCkgZXhwbGljaXRseSBwcmlvciB0byBwYXJzZS5cblx0ICovXG5cdHBhcnNlKCB0ZXh0LCBwYXRoICkge1xuXG5cdFx0Y29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KCAnXFxuJyApO1xuXHRcdGxldCBpbmZvID0ge307XG5cdFx0Y29uc3QgZGVsaW1pdGVyX3BhdHRlcm4gPSAvXFxzKy87XG5cdFx0Y29uc3QgbWF0ZXJpYWxzSW5mbyA9IHt9O1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRsZXQgbGluZSA9IGxpbmVzWyBpIF07XG5cdFx0XHRsaW5lID0gbGluZS50cmltKCk7XG5cblx0XHRcdGlmICggbGluZS5sZW5ndGggPT09IDAgfHwgbGluZS5jaGFyQXQoIDAgKSA9PT0gJyMnICkge1xuXG5cdFx0XHRcdC8vIEJsYW5rIGxpbmUgb3IgY29tbWVudCBpZ25vcmVcblx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcG9zID0gbGluZS5pbmRleE9mKCAnICcgKTtcblxuXHRcdFx0bGV0IGtleSA9ICggcG9zID49IDAgKSA/IGxpbmUuc3Vic3RyaW5nKCAwLCBwb3MgKSA6IGxpbmU7XG5cdFx0XHRrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0bGV0IHZhbHVlID0gKCBwb3MgPj0gMCApID8gbGluZS5zdWJzdHJpbmcoIHBvcyArIDEgKSA6ICcnO1xuXHRcdFx0dmFsdWUgPSB2YWx1ZS50cmltKCk7XG5cblx0XHRcdGlmICgga2V5ID09PSAnbmV3bXRsJyApIHtcblxuXHRcdFx0XHQvLyBOZXcgbWF0ZXJpYWxcblxuXHRcdFx0XHRpbmZvID0geyBuYW1lOiB2YWx1ZSB9O1xuXHRcdFx0XHRtYXRlcmlhbHNJbmZvWyB2YWx1ZSBdID0gaW5mbztcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZiAoIGtleSA9PT0gJ2thJyB8fCBrZXkgPT09ICdrZCcgfHwga2V5ID09PSAna3MnIHx8IGtleSA9PT0gJ2tlJyApIHtcblxuXHRcdFx0XHRcdGNvbnN0IHNzID0gdmFsdWUuc3BsaXQoIGRlbGltaXRlcl9wYXR0ZXJuLCAzICk7XG5cdFx0XHRcdFx0aW5mb1sga2V5IF0gPSBbIHBhcnNlRmxvYXQoIHNzWyAwIF0gKSwgcGFyc2VGbG9hdCggc3NbIDEgXSApLCBwYXJzZUZsb2F0KCBzc1sgMiBdICkgXTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aW5mb1sga2V5IF0gPSB2YWx1ZTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGNvbnN0IG1hdGVyaWFsQ3JlYXRvciA9IG5ldyBNYXRlcmlhbENyZWF0b3IoIHRoaXMucmVzb3VyY2VQYXRoIHx8IHBhdGgsIHRoaXMubWF0ZXJpYWxPcHRpb25zICk7XG5cdFx0bWF0ZXJpYWxDcmVhdG9yLnNldENyb3NzT3JpZ2luKCB0aGlzLmNyb3NzT3JpZ2luICk7XG5cdFx0bWF0ZXJpYWxDcmVhdG9yLnNldE1hbmFnZXIoIHRoaXMubWFuYWdlciApO1xuXHRcdG1hdGVyaWFsQ3JlYXRvci5zZXRNYXRlcmlhbHMoIG1hdGVyaWFsc0luZm8gKTtcblx0XHRyZXR1cm4gbWF0ZXJpYWxDcmVhdG9yO1xuXG5cdH1cblxufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBNVExMb2FkZXIuTWF0ZXJpYWxDcmVhdG9yXG4gKiBAcGFyYW0gYmFzZVVybCAtIFVybCByZWxhdGl2ZSB0byB3aGljaCB0ZXh0dXJlcyBhcmUgbG9hZGVkXG4gKiBAcGFyYW0gb3B0aW9ucyAtIFNldCBvZiBvcHRpb25zIG9uIGhvdyB0byBjb25zdHJ1Y3QgdGhlIG1hdGVyaWFsc1xuICogICAgICAgICAgICAgICAgICBzaWRlOiBXaGljaCBzaWRlIHRvIGFwcGx5IHRoZSBtYXRlcmlhbFxuICogICAgICAgICAgICAgICAgICAgICAgICBGcm9udFNpZGUgKGRlZmF1bHQpLCBUSFJFRS5CYWNrU2lkZSwgVEhSRUUuRG91YmxlU2lkZVxuICogICAgICAgICAgICAgICAgICB3cmFwOiBXaGF0IHR5cGUgb2Ygd3JhcHBpbmcgdG8gYXBwbHkgZm9yIHRleHR1cmVzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIFJlcGVhdFdyYXBwaW5nIChkZWZhdWx0KSwgVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZywgVEhSRUUuTWlycm9yZWRSZXBlYXRXcmFwcGluZ1xuICogICAgICAgICAgICAgICAgICBub3JtYWxpemVSR0I6IFJHQnMgbmVlZCB0byBiZSBub3JtYWxpemVkIHRvIDAtMSBmcm9tIDAtMjU1XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdDogZmFsc2UsIGFzc3VtZWQgdG8gYmUgYWxyZWFkeSBub3JtYWxpemVkXG4gKiAgICAgICAgICAgICAgICAgIGlnbm9yZVplcm9SR0JzOiBJZ25vcmUgdmFsdWVzIG9mIFJHQnMgKEthLEtkLEtzKSB0aGF0IGFyZSBhbGwgMCdzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBEZWZhdWx0OiBmYWxzZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cblxuY2xhc3MgTWF0ZXJpYWxDcmVhdG9yIHtcblxuXHRjb25zdHJ1Y3RvciggYmFzZVVybCA9ICcnLCBvcHRpb25zID0ge30gKSB7XG5cblx0XHR0aGlzLmJhc2VVcmwgPSBiYXNlVXJsO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0dGhpcy5tYXRlcmlhbHNJbmZvID0ge307XG5cdFx0dGhpcy5tYXRlcmlhbHMgPSB7fTtcblx0XHR0aGlzLm1hdGVyaWFsc0FycmF5ID0gW107XG5cdFx0dGhpcy5uYW1lTG9va3VwID0ge307XG5cblx0XHR0aGlzLmNyb3NzT3JpZ2luID0gJ2Fub255bW91cyc7XG5cblx0XHR0aGlzLnNpZGUgPSAoIHRoaXMub3B0aW9ucy5zaWRlICE9PSB1bmRlZmluZWQgKSA/IHRoaXMub3B0aW9ucy5zaWRlIDogRnJvbnRTaWRlO1xuXHRcdHRoaXMud3JhcCA9ICggdGhpcy5vcHRpb25zLndyYXAgIT09IHVuZGVmaW5lZCApID8gdGhpcy5vcHRpb25zLndyYXAgOiBSZXBlYXRXcmFwcGluZztcblxuXHR9XG5cblx0c2V0Q3Jvc3NPcmlnaW4oIHZhbHVlICkge1xuXG5cdFx0dGhpcy5jcm9zc09yaWdpbiA9IHZhbHVlO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRNYW5hZ2VyKCB2YWx1ZSApIHtcblxuXHRcdHRoaXMubWFuYWdlciA9IHZhbHVlO1xuXG5cdH1cblxuXHRzZXRNYXRlcmlhbHMoIG1hdGVyaWFsc0luZm8gKSB7XG5cblx0XHR0aGlzLm1hdGVyaWFsc0luZm8gPSB0aGlzLmNvbnZlcnQoIG1hdGVyaWFsc0luZm8gKTtcblx0XHR0aGlzLm1hdGVyaWFscyA9IHt9O1xuXHRcdHRoaXMubWF0ZXJpYWxzQXJyYXkgPSBbXTtcblx0XHR0aGlzLm5hbWVMb29rdXAgPSB7fTtcblxuXHR9XG5cblx0Y29udmVydCggbWF0ZXJpYWxzSW5mbyApIHtcblxuXHRcdGlmICggISB0aGlzLm9wdGlvbnMgKSByZXR1cm4gbWF0ZXJpYWxzSW5mbztcblxuXHRcdGNvbnN0IGNvbnZlcnRlZCA9IHt9O1xuXG5cdFx0Zm9yICggY29uc3QgbW4gaW4gbWF0ZXJpYWxzSW5mbyApIHtcblxuXHRcdFx0Ly8gQ29udmVydCBtYXRlcmlhbHMgaW5mbyBpbnRvIG5vcm1hbGl6ZWQgZm9ybSBiYXNlZCBvbiBvcHRpb25zXG5cblx0XHRcdGNvbnN0IG1hdCA9IG1hdGVyaWFsc0luZm9bIG1uIF07XG5cblx0XHRcdGNvbnN0IGNvdm1hdCA9IHt9O1xuXG5cdFx0XHRjb252ZXJ0ZWRbIG1uIF0gPSBjb3ZtYXQ7XG5cblx0XHRcdGZvciAoIGNvbnN0IHByb3AgaW4gbWF0ICkge1xuXG5cdFx0XHRcdGxldCBzYXZlID0gdHJ1ZTtcblx0XHRcdFx0bGV0IHZhbHVlID0gbWF0WyBwcm9wIF07XG5cdFx0XHRcdGNvbnN0IGxwcm9wID0gcHJvcC50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHRcdHN3aXRjaCAoIGxwcm9wICkge1xuXG5cdFx0XHRcdFx0Y2FzZSAna2QnOlxuXHRcdFx0XHRcdGNhc2UgJ2thJzpcblx0XHRcdFx0XHRjYXNlICdrcyc6XG5cblx0XHRcdFx0XHRcdC8vIERpZmZ1c2UgY29sb3IgKGNvbG9yIHVuZGVyIHdoaXRlIGxpZ2h0KSB1c2luZyBSR0IgdmFsdWVzXG5cblx0XHRcdFx0XHRcdGlmICggdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5ub3JtYWxpemVSR0IgKSB7XG5cblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBbIHZhbHVlWyAwIF0gLyAyNTUsIHZhbHVlWyAxIF0gLyAyNTUsIHZhbHVlWyAyIF0gLyAyNTUgXTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuaWdub3JlWmVyb1JHQnMgKSB7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCB2YWx1ZVsgMCBdID09PSAwICYmIHZhbHVlWyAxIF0gPT09IDAgJiYgdmFsdWVbIDIgXSA9PT0gMCApIHtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIGlnbm9yZVxuXG5cdFx0XHRcdFx0XHRcdFx0c2F2ZSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIHNhdmUgKSB7XG5cblx0XHRcdFx0XHRjb3ZtYXRbIGxwcm9wIF0gPSB2YWx1ZTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiBjb252ZXJ0ZWQ7XG5cblx0fVxuXG5cdHByZWxvYWQoKSB7XG5cblx0XHRmb3IgKCBjb25zdCBtbiBpbiB0aGlzLm1hdGVyaWFsc0luZm8gKSB7XG5cblx0XHRcdHRoaXMuY3JlYXRlKCBtbiApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRnZXRJbmRleCggbWF0ZXJpYWxOYW1lICkge1xuXG5cdFx0cmV0dXJuIHRoaXMubmFtZUxvb2t1cFsgbWF0ZXJpYWxOYW1lIF07XG5cblx0fVxuXG5cdGdldEFzQXJyYXkoKSB7XG5cblx0XHRsZXQgaW5kZXggPSAwO1xuXG5cdFx0Zm9yICggY29uc3QgbW4gaW4gdGhpcy5tYXRlcmlhbHNJbmZvICkge1xuXG5cdFx0XHR0aGlzLm1hdGVyaWFsc0FycmF5WyBpbmRleCBdID0gdGhpcy5jcmVhdGUoIG1uICk7XG5cdFx0XHR0aGlzLm5hbWVMb29rdXBbIG1uIF0gPSBpbmRleDtcblx0XHRcdGluZGV4ICsrO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubWF0ZXJpYWxzQXJyYXk7XG5cblx0fVxuXG5cdGNyZWF0ZSggbWF0ZXJpYWxOYW1lICkge1xuXG5cdFx0aWYgKCB0aGlzLm1hdGVyaWFsc1sgbWF0ZXJpYWxOYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGhpcy5jcmVhdGVNYXRlcmlhbF8oIG1hdGVyaWFsTmFtZSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubWF0ZXJpYWxzWyBtYXRlcmlhbE5hbWUgXTtcblxuXHR9XG5cblx0Y3JlYXRlTWF0ZXJpYWxfKCBtYXRlcmlhbE5hbWUgKSB7XG5cblx0XHQvLyBDcmVhdGUgbWF0ZXJpYWxcblxuXHRcdGNvbnN0IHNjb3BlID0gdGhpcztcblx0XHRjb25zdCBtYXQgPSB0aGlzLm1hdGVyaWFsc0luZm9bIG1hdGVyaWFsTmFtZSBdO1xuXHRcdGNvbnN0IHBhcmFtcyA9IHtcblxuXHRcdFx0bmFtZTogbWF0ZXJpYWxOYW1lLFxuXHRcdFx0c2lkZTogdGhpcy5zaWRlXG5cblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gcmVzb2x2ZVVSTCggYmFzZVVybCwgdXJsICkge1xuXG5cdFx0XHRpZiAoIHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnIHx8IHVybCA9PT0gJycgKVxuXHRcdFx0XHRyZXR1cm4gJyc7XG5cblx0XHRcdC8vIEFic29sdXRlIFVSTFxuXHRcdFx0aWYgKCAvXmh0dHBzPzpcXC9cXC8vaS50ZXN0KCB1cmwgKSApIHJldHVybiB1cmw7XG5cblx0XHRcdHJldHVybiBiYXNlVXJsICsgdXJsO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gc2V0TWFwRm9yVHlwZSggbWFwVHlwZSwgdmFsdWUgKSB7XG5cblx0XHRcdGlmICggcGFyYW1zWyBtYXBUeXBlIF0gKSByZXR1cm47IC8vIEtlZXAgdGhlIGZpcnN0IGVuY291bnRlcmVkIHRleHR1cmVcblxuXHRcdFx0Y29uc3QgdGV4UGFyYW1zID0gc2NvcGUuZ2V0VGV4dHVyZVBhcmFtcyggdmFsdWUsIHBhcmFtcyApO1xuXHRcdFx0Y29uc3QgbWFwID0gc2NvcGUubG9hZFRleHR1cmUoIHJlc29sdmVVUkwoIHNjb3BlLmJhc2VVcmwsIHRleFBhcmFtcy51cmwgKSApO1xuXG5cdFx0XHRtYXAucmVwZWF0LmNvcHkoIHRleFBhcmFtcy5zY2FsZSApO1xuXHRcdFx0bWFwLm9mZnNldC5jb3B5KCB0ZXhQYXJhbXMub2Zmc2V0ICk7XG5cblx0XHRcdG1hcC53cmFwUyA9IHNjb3BlLndyYXA7XG5cdFx0XHRtYXAud3JhcFQgPSBzY29wZS53cmFwO1xuXG5cdFx0XHRwYXJhbXNbIG1hcFR5cGUgXSA9IG1hcDtcblxuXHRcdH1cblxuXHRcdGZvciAoIGNvbnN0IHByb3AgaW4gbWF0ICkge1xuXG5cdFx0XHRjb25zdCB2YWx1ZSA9IG1hdFsgcHJvcCBdO1xuXHRcdFx0bGV0IG47XG5cblx0XHRcdGlmICggdmFsdWUgPT09ICcnICkgY29udGludWU7XG5cblx0XHRcdHN3aXRjaCAoIHByb3AudG9Mb3dlckNhc2UoKSApIHtcblxuXHRcdFx0XHQvLyBOcyBpcyBtYXRlcmlhbCBzcGVjdWxhciBleHBvbmVudFxuXG5cdFx0XHRcdGNhc2UgJ2tkJzpcblxuXHRcdFx0XHRcdC8vIERpZmZ1c2UgY29sb3IgKGNvbG9yIHVuZGVyIHdoaXRlIGxpZ2h0KSB1c2luZyBSR0IgdmFsdWVzXG5cblx0XHRcdFx0XHRwYXJhbXMuY29sb3IgPSBuZXcgQ29sb3IoKS5mcm9tQXJyYXkoIHZhbHVlICk7XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdrcyc6XG5cblx0XHRcdFx0XHQvLyBTcGVjdWxhciBjb2xvciAoY29sb3Igd2hlbiBsaWdodCBpcyByZWZsZWN0ZWQgZnJvbSBzaGlueSBzdXJmYWNlKSB1c2luZyBSR0IgdmFsdWVzXG5cdFx0XHRcdFx0cGFyYW1zLnNwZWN1bGFyID0gbmV3IENvbG9yKCkuZnJvbUFycmF5KCB2YWx1ZSApO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAna2UnOlxuXG5cdFx0XHRcdFx0Ly8gRW1pc3NpdmUgdXNpbmcgUkdCIHZhbHVlc1xuXHRcdFx0XHRcdHBhcmFtcy5lbWlzc2l2ZSA9IG5ldyBDb2xvcigpLmZyb21BcnJheSggdmFsdWUgKTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ21hcF9rZCc6XG5cblx0XHRcdFx0XHQvLyBEaWZmdXNlIHRleHR1cmUgbWFwXG5cblx0XHRcdFx0XHRzZXRNYXBGb3JUeXBlKCAnbWFwJywgdmFsdWUgKTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ21hcF9rcyc6XG5cblx0XHRcdFx0XHQvLyBTcGVjdWxhciBtYXBcblxuXHRcdFx0XHRcdHNldE1hcEZvclR5cGUoICdzcGVjdWxhck1hcCcsIHZhbHVlICk7XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdtYXBfa2UnOlxuXG5cdFx0XHRcdFx0Ly8gRW1pc3NpdmUgbWFwXG5cblx0XHRcdFx0XHRzZXRNYXBGb3JUeXBlKCAnZW1pc3NpdmVNYXAnLCB2YWx1ZSApO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnbm9ybSc6XG5cblx0XHRcdFx0XHRzZXRNYXBGb3JUeXBlKCAnbm9ybWFsTWFwJywgdmFsdWUgKTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ21hcF9idW1wJzpcblx0XHRcdFx0Y2FzZSAnYnVtcCc6XG5cblx0XHRcdFx0XHQvLyBCdW1wIHRleHR1cmUgbWFwXG5cblx0XHRcdFx0XHRzZXRNYXBGb3JUeXBlKCAnYnVtcE1hcCcsIHZhbHVlICk7XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdtYXBfZCc6XG5cblx0XHRcdFx0XHQvLyBBbHBoYSBtYXBcblxuXHRcdFx0XHRcdHNldE1hcEZvclR5cGUoICdhbHBoYU1hcCcsIHZhbHVlICk7XG5cdFx0XHRcdFx0cGFyYW1zLnRyYW5zcGFyZW50ID0gdHJ1ZTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ25zJzpcblxuXHRcdFx0XHRcdC8vIFRoZSBzcGVjdWxhciBleHBvbmVudCAoZGVmaW5lcyB0aGUgZm9jdXMgb2YgdGhlIHNwZWN1bGFyIGhpZ2hsaWdodClcblx0XHRcdFx0XHQvLyBBIGhpZ2ggZXhwb25lbnQgcmVzdWx0cyBpbiBhIHRpZ2h0LCBjb25jZW50cmF0ZWQgaGlnaGxpZ2h0LiBOcyB2YWx1ZXMgbm9ybWFsbHkgcmFuZ2UgZnJvbSAwIHRvIDEwMDAuXG5cblx0XHRcdFx0XHRwYXJhbXMuc2hpbmluZXNzID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ2QnOlxuXHRcdFx0XHRcdG4gPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuXG5cdFx0XHRcdFx0aWYgKCBuIDwgMSApIHtcblxuXHRcdFx0XHRcdFx0cGFyYW1zLm9wYWNpdHkgPSBuO1xuXHRcdFx0XHRcdFx0cGFyYW1zLnRyYW5zcGFyZW50ID0gdHJ1ZTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ3RyJzpcblx0XHRcdFx0XHRuID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcblxuXHRcdFx0XHRcdGlmICggdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5pbnZlcnRUclByb3BlcnR5ICkgbiA9IDEgLSBuO1xuXG5cdFx0XHRcdFx0aWYgKCBuID4gMCApIHtcblxuXHRcdFx0XHRcdFx0cGFyYW1zLm9wYWNpdHkgPSAxIC0gbjtcblx0XHRcdFx0XHRcdHBhcmFtcy50cmFuc3BhcmVudCA9IHRydWU7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHR0aGlzLm1hdGVyaWFsc1sgbWF0ZXJpYWxOYW1lIF0gPSBuZXcgTWVzaFBob25nTWF0ZXJpYWwoIHBhcmFtcyApO1xuXHRcdHJldHVybiB0aGlzLm1hdGVyaWFsc1sgbWF0ZXJpYWxOYW1lIF07XG5cblx0fVxuXG5cdGdldFRleHR1cmVQYXJhbXMoIHZhbHVlLCBtYXRQYXJhbXMgKSB7XG5cblx0XHRjb25zdCB0ZXhQYXJhbXMgPSB7XG5cblx0XHRcdHNjYWxlOiBuZXcgVmVjdG9yMiggMSwgMSApLFxuXHRcdFx0b2Zmc2V0OiBuZXcgVmVjdG9yMiggMCwgMCApXG5cblx0XHQgfTtcblxuXHRcdGNvbnN0IGl0ZW1zID0gdmFsdWUuc3BsaXQoIC9cXHMrLyApO1xuXHRcdGxldCBwb3M7XG5cblx0XHRwb3MgPSBpdGVtcy5pbmRleE9mKCAnLWJtJyApO1xuXG5cdFx0aWYgKCBwb3MgPj0gMCApIHtcblxuXHRcdFx0bWF0UGFyYW1zLmJ1bXBTY2FsZSA9IHBhcnNlRmxvYXQoIGl0ZW1zWyBwb3MgKyAxIF0gKTtcblx0XHRcdGl0ZW1zLnNwbGljZSggcG9zLCAyICk7XG5cblx0XHR9XG5cblx0XHRwb3MgPSBpdGVtcy5pbmRleE9mKCAnLXMnICk7XG5cblx0XHRpZiAoIHBvcyA+PSAwICkge1xuXG5cdFx0XHR0ZXhQYXJhbXMuc2NhbGUuc2V0KCBwYXJzZUZsb2F0KCBpdGVtc1sgcG9zICsgMSBdICksIHBhcnNlRmxvYXQoIGl0ZW1zWyBwb3MgKyAyIF0gKSApO1xuXHRcdFx0aXRlbXMuc3BsaWNlKCBwb3MsIDQgKTsgLy8gd2UgZXhwZWN0IDMgcGFyYW1ldGVycyBoZXJlIVxuXG5cdFx0fVxuXG5cdFx0cG9zID0gaXRlbXMuaW5kZXhPZiggJy1vJyApO1xuXG5cdFx0aWYgKCBwb3MgPj0gMCApIHtcblxuXHRcdFx0dGV4UGFyYW1zLm9mZnNldC5zZXQoIHBhcnNlRmxvYXQoIGl0ZW1zWyBwb3MgKyAxIF0gKSwgcGFyc2VGbG9hdCggaXRlbXNbIHBvcyArIDIgXSApICk7XG5cdFx0XHRpdGVtcy5zcGxpY2UoIHBvcywgNCApOyAvLyB3ZSBleHBlY3QgMyBwYXJhbWV0ZXJzIGhlcmUhXG5cblx0XHR9XG5cblx0XHR0ZXhQYXJhbXMudXJsID0gaXRlbXMuam9pbiggJyAnICkudHJpbSgpO1xuXHRcdHJldHVybiB0ZXhQYXJhbXM7XG5cblx0fVxuXG5cdGxvYWRUZXh0dXJlKCB1cmwsIG1hcHBpbmcsIG9uTG9hZCwgb25Qcm9ncmVzcywgb25FcnJvciApIHtcblxuXHRcdGNvbnN0IG1hbmFnZXIgPSAoIHRoaXMubWFuYWdlciAhPT0gdW5kZWZpbmVkICkgPyB0aGlzLm1hbmFnZXIgOiBEZWZhdWx0TG9hZGluZ01hbmFnZXI7XG5cdFx0bGV0IGxvYWRlciA9IG1hbmFnZXIuZ2V0SGFuZGxlciggdXJsICk7XG5cblx0XHRpZiAoIGxvYWRlciA9PT0gbnVsbCApIHtcblxuXHRcdFx0bG9hZGVyID0gbmV3IFRleHR1cmVMb2FkZXIoIG1hbmFnZXIgKTtcblxuXHRcdH1cblxuXHRcdGlmICggbG9hZGVyLnNldENyb3NzT3JpZ2luICkgbG9hZGVyLnNldENyb3NzT3JpZ2luKCB0aGlzLmNyb3NzT3JpZ2luICk7XG5cblx0XHRjb25zdCB0ZXh0dXJlID0gbG9hZGVyLmxvYWQoIHVybCwgb25Mb2FkLCBvblByb2dyZXNzLCBvbkVycm9yICk7XG5cblx0XHRpZiAoIG1hcHBpbmcgIT09IHVuZGVmaW5lZCApIHRleHR1cmUubWFwcGluZyA9IG1hcHBpbmc7XG5cblx0XHRyZXR1cm4gdGV4dHVyZTtcblxuXHR9XG5cbn1cblxuZXhwb3J0IHsgTVRMTG9hZGVyIH07XG4iXSwic291cmNlUm9vdCI6IiJ9