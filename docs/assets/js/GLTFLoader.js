(self["webpackChunkgulp"] = self["webpackChunkgulp"] || []).push([["GLTFLoader"],{

/***/ "./node_modules/three/examples/jsm/loaders/GLTFLoader.js":
/*!***************************************************************!*\
  !*** ./node_modules/three/examples/jsm/loaders/GLTFLoader.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GLTFLoader": () => (/* binding */ GLTFLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");


class GLTFLoader extends three__WEBPACK_IMPORTED_MODULE_0__.Loader {

	constructor( manager ) {

		super( manager );

		this.dracoLoader = null;
		this.ktx2Loader = null;
		this.meshoptDecoder = null;

		this.pluginCallbacks = [];

		this.register( function ( parser ) {

			return new GLTFMaterialsClearcoatExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFTextureBasisUExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFTextureWebPExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsTransmissionExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsVolumeExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsIorExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsSpecularExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFLightsExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMeshoptCompression( parser );

		} );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		let resourcePath;

		if ( this.resourcePath !== '' ) {

			resourcePath = this.resourcePath;

		} else if ( this.path !== '' ) {

			resourcePath = this.path;

		} else {

			resourcePath = three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.extractUrlBase( url );

		}

		// Tells the LoadingManager to track an extra item, which resolves after
		// the model is fully loaded. This means the count of items loaded will
		// be incorrect, but ensures manager.onLoad() does not fire early.
		this.manager.itemStart( url );

		const _onError = function ( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

			scope.manager.itemError( url );
			scope.manager.itemEnd( url );

		};

		const loader = new three__WEBPACK_IMPORTED_MODULE_0__.FileLoader( this.manager );

		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( data ) {

			try {

				scope.parse( data, resourcePath, function ( gltf ) {

					onLoad( gltf );

					scope.manager.itemEnd( url );

				}, _onError );

			} catch ( e ) {

				_onError( e );

			}

		}, onProgress, _onError );

	}

	setDRACOLoader( dracoLoader ) {

		this.dracoLoader = dracoLoader;
		return this;

	}

	setDDSLoader() {

		throw new Error(

			'THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".'

		);

	}

	setKTX2Loader( ktx2Loader ) {

		this.ktx2Loader = ktx2Loader;
		return this;

	}

	setMeshoptDecoder( meshoptDecoder ) {

		this.meshoptDecoder = meshoptDecoder;
		return this;

	}

	register( callback ) {

		if ( this.pluginCallbacks.indexOf( callback ) === - 1 ) {

			this.pluginCallbacks.push( callback );

		}

		return this;

	}

	unregister( callback ) {

		if ( this.pluginCallbacks.indexOf( callback ) !== - 1 ) {

			this.pluginCallbacks.splice( this.pluginCallbacks.indexOf( callback ), 1 );

		}

		return this;

	}

	parse( data, path, onLoad, onError ) {

		let content;
		const extensions = {};
		const plugins = {};

		if ( typeof data === 'string' ) {

			content = data;

		} else {

			const magic = three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

			if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

				try {

					extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );

				} catch ( error ) {

					if ( onError ) onError( error );
					return;

				}

				content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

			} else {

				content = three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.decodeText( new Uint8Array( data ) );

			}

		}

		const json = JSON.parse( content );

		if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

			if ( onError ) onError( new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.' ) );
			return;

		}

		const parser = new GLTFParser( json, {

			path: path || this.resourcePath || '',
			crossOrigin: this.crossOrigin,
			requestHeader: this.requestHeader,
			manager: this.manager,
			ktx2Loader: this.ktx2Loader,
			meshoptDecoder: this.meshoptDecoder

		} );

		parser.fileLoader.setRequestHeader( this.requestHeader );

		for ( let i = 0; i < this.pluginCallbacks.length; i ++ ) {

			const plugin = this.pluginCallbacks[ i ]( parser );
			plugins[ plugin.name ] = plugin;

			// Workaround to avoid determining as unknown extension
			// in addUnknownExtensionsToUserData().
			// Remove this workaround if we move all the existing
			// extension handlers to plugin system
			extensions[ plugin.name ] = true;

		}

		if ( json.extensionsUsed ) {

			for ( let i = 0; i < json.extensionsUsed.length; ++ i ) {

				const extensionName = json.extensionsUsed[ i ];
				const extensionsRequired = json.extensionsRequired || [];

				switch ( extensionName ) {

					case EXTENSIONS.KHR_MATERIALS_UNLIT:
						extensions[ extensionName ] = new GLTFMaterialsUnlitExtension();
						break;

					case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
						extensions[ extensionName ] = new GLTFMaterialsPbrSpecularGlossinessExtension();
						break;

					case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
						extensions[ extensionName ] = new GLTFDracoMeshCompressionExtension( json, this.dracoLoader );
						break;

					case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
						extensions[ extensionName ] = new GLTFTextureTransformExtension();
						break;

					case EXTENSIONS.KHR_MESH_QUANTIZATION:
						extensions[ extensionName ] = new GLTFMeshQuantizationExtension();
						break;

					default:

						if ( extensionsRequired.indexOf( extensionName ) >= 0 && plugins[ extensionName ] === undefined ) {

							console.warn( 'THREE.GLTFLoader: Unknown extension "' + extensionName + '".' );

						}

				}

			}

		}

		parser.setExtensions( extensions );
		parser.setPlugins( plugins );
		parser.parse( onLoad, onError );

	}

}

/* GLTFREGISTRY */

function GLTFRegistry() {

	let objects = {};

	return	{

		get: function ( key ) {

			return objects[ key ];

		},

		add: function ( key, object ) {

			objects[ key ] = object;

		},

		remove: function ( key ) {

			delete objects[ key ];

		},

		removeAll: function () {

			objects = {};

		}

	};

}

/*********************************/
/********** EXTENSIONS ***********/
/*********************************/

const EXTENSIONS = {
	KHR_BINARY_GLTF: 'KHR_binary_glTF',
	KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
	KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
	KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
	KHR_MATERIALS_IOR: 'KHR_materials_ior',
	KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
	KHR_MATERIALS_SPECULAR: 'KHR_materials_specular',
	KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
	KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
	KHR_MATERIALS_VOLUME: 'KHR_materials_volume',
	KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
	KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
	KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
	EXT_TEXTURE_WEBP: 'EXT_texture_webp',
	EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression'
};

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
class GLTFLightsExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

		// Object3D instance caches
		this.cache = { refs: {}, uses: {} };

	}

	_markDefs() {

		const parser = this.parser;
		const nodeDefs = this.parser.json.nodes || [];

		for ( let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

			const nodeDef = nodeDefs[ nodeIndex ];

			if ( nodeDef.extensions
					&& nodeDef.extensions[ this.name ]
					&& nodeDef.extensions[ this.name ].light !== undefined ) {

				parser._addNodeRef( this.cache, nodeDef.extensions[ this.name ].light );

			}

		}

	}

	_loadLight( lightIndex ) {

		const parser = this.parser;
		const cacheKey = 'light:' + lightIndex;
		let dependency = parser.cache.get( cacheKey );

		if ( dependency ) return dependency;

		const json = parser.json;
		const extensions = ( json.extensions && json.extensions[ this.name ] ) || {};
		const lightDefs = extensions.lights || [];
		const lightDef = lightDefs[ lightIndex ];
		let lightNode;

		const color = new three__WEBPACK_IMPORTED_MODULE_0__.Color( 0xffffff );

		if ( lightDef.color !== undefined ) color.fromArray( lightDef.color );

		const range = lightDef.range !== undefined ? lightDef.range : 0;

		switch ( lightDef.type ) {

			case 'directional':
				lightNode = new three__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight( color );
				lightNode.target.position.set( 0, 0, - 1 );
				lightNode.add( lightNode.target );
				break;

			case 'point':
				lightNode = new three__WEBPACK_IMPORTED_MODULE_0__.PointLight( color );
				lightNode.distance = range;
				break;

			case 'spot':
				lightNode = new three__WEBPACK_IMPORTED_MODULE_0__.SpotLight( color );
				lightNode.distance = range;
				// Handle spotlight properties.
				lightDef.spot = lightDef.spot || {};
				lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
				lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
				lightNode.angle = lightDef.spot.outerConeAngle;
				lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
				lightNode.target.position.set( 0, 0, - 1 );
				lightNode.add( lightNode.target );
				break;

			default:
				throw new Error( 'THREE.GLTFLoader: Unexpected light type: ' + lightDef.type );

		}

		// Some lights (e.g. spot) default to a position other than the origin. Reset the position
		// here, because node-level parsing will only override position if explicitly specified.
		lightNode.position.set( 0, 0, 0 );

		lightNode.decay = 2;

		if ( lightDef.intensity !== undefined ) lightNode.intensity = lightDef.intensity;

		lightNode.name = parser.createUniqueName( lightDef.name || ( 'light_' + lightIndex ) );

		dependency = Promise.resolve( lightNode );

		parser.cache.add( cacheKey, dependency );

		return dependency;

	}

	createNodeAttachment( nodeIndex ) {

		const self = this;
		const parser = this.parser;
		const json = parser.json;
		const nodeDef = json.nodes[ nodeIndex ];
		const lightDef = ( nodeDef.extensions && nodeDef.extensions[ this.name ] ) || {};
		const lightIndex = lightDef.light;

		if ( lightIndex === undefined ) return null;

		return this._loadLight( lightIndex ).then( function ( light ) {

			return parser._getNodeRef( self.cache, lightIndex, light );

		} );

	}

}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
class GLTFMaterialsUnlitExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;

	}

	getMaterialType() {

		return three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial;

	}

	extendParams( materialParams, materialDef, parser ) {

		const pending = [];

		materialParams.color = new three__WEBPACK_IMPORTED_MODULE_0__.Color( 1.0, 1.0, 1.0 );
		materialParams.opacity = 1.0;

		const metallicRoughness = materialDef.pbrMetallicRoughness;

		if ( metallicRoughness ) {

			if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

				const array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray( array );
				materialParams.opacity = array[ 3 ];

			}

			if ( metallicRoughness.baseColorTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

			}

		}

		return Promise.all( pending );

	}

}

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
class GLTFMaterialsClearcoatExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return three__WEBPACK_IMPORTED_MODULE_0__.MeshPhysicalMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const pending = [];

		const extension = materialDef.extensions[ this.name ];

		if ( extension.clearcoatFactor !== undefined ) {

			materialParams.clearcoat = extension.clearcoatFactor;

		}

		if ( extension.clearcoatTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatMap', extension.clearcoatTexture ) );

		}

		if ( extension.clearcoatRoughnessFactor !== undefined ) {

			materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;

		}

		if ( extension.clearcoatRoughnessTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture ) );

		}

		if ( extension.clearcoatNormalTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture ) );

			if ( extension.clearcoatNormalTexture.scale !== undefined ) {

				const scale = extension.clearcoatNormalTexture.scale;

				// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
				materialParams.clearcoatNormalScale = new three__WEBPACK_IMPORTED_MODULE_0__.Vector2( scale, - scale );

			}

		}

		return Promise.all( pending );

	}

}

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
class GLTFMaterialsTransmissionExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return three__WEBPACK_IMPORTED_MODULE_0__.MeshPhysicalMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const pending = [];

		const extension = materialDef.extensions[ this.name ];

		if ( extension.transmissionFactor !== undefined ) {

			materialParams.transmission = extension.transmissionFactor;

		}

		if ( extension.transmissionTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'transmissionMap', extension.transmissionTexture ) );

		}

		return Promise.all( pending );

	}

}

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
class GLTFMaterialsVolumeExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return three__WEBPACK_IMPORTED_MODULE_0__.MeshPhysicalMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const pending = [];

		const extension = materialDef.extensions[ this.name ];

		materialParams.thickness = extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0;

		if ( extension.thicknessTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'thicknessMap', extension.thicknessTexture ) );

		}

		materialParams.attenuationDistance = extension.attenuationDistance || 0;

		const colorArray = extension.attenuationColor || [ 1, 1, 1 ];
		materialParams.attenuationTint = new three__WEBPACK_IMPORTED_MODULE_0__.Color( colorArray[ 0 ], colorArray[ 1 ], colorArray[ 2 ] );

		return Promise.all( pending );

	}

}

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
class GLTFMaterialsIorExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_IOR;

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return three__WEBPACK_IMPORTED_MODULE_0__.MeshPhysicalMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const extension = materialDef.extensions[ this.name ];

		materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5;

		return Promise.resolve();

	}

}

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
class GLTFMaterialsSpecularExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return three__WEBPACK_IMPORTED_MODULE_0__.MeshPhysicalMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const pending = [];

		const extension = materialDef.extensions[ this.name ];

		materialParams.specularIntensity = extension.specularFactor !== undefined ? extension.specularFactor : 1.0;

		if ( extension.specularTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'specularIntensityMap', extension.specularTexture ) );

		}

		const colorArray = extension.specularColorFactor || [ 1, 1, 1 ];
		materialParams.specularTint = new three__WEBPACK_IMPORTED_MODULE_0__.Color( colorArray[ 0 ], colorArray[ 1 ], colorArray[ 2 ] );

		if ( extension.specularColorTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'specularTintMap', extension.specularColorTexture ).then( function ( texture ) {

				texture.encoding = three__WEBPACK_IMPORTED_MODULE_0__.sRGBEncoding;

			} ) );

		}

		return Promise.all( pending );

	}

}

/**
 * BasisU Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
 */
class GLTFTextureBasisUExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_TEXTURE_BASISU;

	}

	loadTexture( textureIndex ) {

		const parser = this.parser;
		const json = parser.json;

		const textureDef = json.textures[ textureIndex ];

		if ( ! textureDef.extensions || ! textureDef.extensions[ this.name ] ) {

			return null;

		}

		const extension = textureDef.extensions[ this.name ];
		const source = json.images[ extension.source ];
		const loader = parser.options.ktx2Loader;

		if ( ! loader ) {

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( this.name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures' );

			} else {

				// Assumes that the extension is optional and that a fallback texture is present
				return null;

			}

		}

		return parser.loadTextureImage( textureIndex, source, loader );

	}

}

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
class GLTFTextureWebPExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
		this.isSupported = null;

	}

	loadTexture( textureIndex ) {

		const name = this.name;
		const parser = this.parser;
		const json = parser.json;

		const textureDef = json.textures[ textureIndex ];

		if ( ! textureDef.extensions || ! textureDef.extensions[ name ] ) {

			return null;

		}

		const extension = textureDef.extensions[ name ];
		const source = json.images[ extension.source ];

		let loader = parser.textureLoader;
		if ( source.uri ) {

			const handler = parser.options.manager.getHandler( source.uri );
			if ( handler !== null ) loader = handler;

		}

		return this.detectSupport().then( function ( isSupported ) {

			if ( isSupported ) return parser.loadTextureImage( textureIndex, source, loader );

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: WebP required by asset but unsupported.' );

			}

			// Fall back to PNG or JPEG.
			return parser.loadTexture( textureIndex );

		} );

	}

	detectSupport() {

		if ( ! this.isSupported ) {

			this.isSupported = new Promise( function ( resolve ) {

				const image = new Image();

				// Lossy test image. Support for lossy images doesn't guarantee support for all
				// WebP images, unfortunately.
				image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

				image.onload = image.onerror = function () {

					resolve( image.height === 1 );

				};

			} );

		}

		return this.isSupported;

	}

}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
class GLTFMeshoptCompression {

	constructor( parser ) {

		this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
		this.parser = parser;

	}

	loadBufferView( index ) {

		const json = this.parser.json;
		const bufferView = json.bufferViews[ index ];

		if ( bufferView.extensions && bufferView.extensions[ this.name ] ) {

			const extensionDef = bufferView.extensions[ this.name ];

			const buffer = this.parser.getDependency( 'buffer', extensionDef.buffer );
			const decoder = this.parser.options.meshoptDecoder;

			if ( ! decoder || ! decoder.supported ) {

				if ( json.extensionsRequired && json.extensionsRequired.indexOf( this.name ) >= 0 ) {

					throw new Error( 'THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files' );

				} else {

					// Assumes that the extension is optional and that fallback buffer data is present
					return null;

				}

			}

			return Promise.all( [ buffer, decoder.ready ] ).then( function ( res ) {

				const byteOffset = extensionDef.byteOffset || 0;
				const byteLength = extensionDef.byteLength || 0;

				const count = extensionDef.count;
				const stride = extensionDef.byteStride;

				const result = new ArrayBuffer( count * stride );
				const source = new Uint8Array( res[ 0 ], byteOffset, byteLength );

				decoder.decodeGltfBuffer( new Uint8Array( result ), count, stride, source, extensionDef.mode, extensionDef.filter );
				return result;

			} );

		} else {

			return null;

		}

	}

}

/* BINARY EXTENSION */
const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

class GLTFBinaryExtension {

	constructor( data ) {

		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;

		const headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

		this.header = {
			magic: three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
			version: headerView.getUint32( 4, true ),
			length: headerView.getUint32( 8, true )
		};

		if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

			throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );

		} else if ( this.header.version < 2.0 ) {

			throw new Error( 'THREE.GLTFLoader: Legacy binary file detected.' );

		}

		const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
		const chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
		let chunkIndex = 0;

		while ( chunkIndex < chunkContentsLength ) {

			const chunkLength = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			const chunkType = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

				const contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
				this.content = three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.decodeText( contentArray );

			} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

				const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice( byteOffset, byteOffset + chunkLength );

			}

			// Clients must ignore chunks with unknown types.

			chunkIndex += chunkLength;

		}

		if ( this.content === null ) {

			throw new Error( 'THREE.GLTFLoader: JSON content not found.' );

		}

	}

}

/**
 * DRACO Mesh Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
class GLTFDracoMeshCompressionExtension {

	constructor( json, dracoLoader ) {

		if ( ! dracoLoader ) {

			throw new Error( 'THREE.GLTFLoader: No DRACOLoader instance provided.' );

		}

		this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
		this.json = json;
		this.dracoLoader = dracoLoader;
		this.dracoLoader.preload();

	}

	decodePrimitive( primitive, parser ) {

		const json = this.json;
		const dracoLoader = this.dracoLoader;
		const bufferViewIndex = primitive.extensions[ this.name ].bufferView;
		const gltfAttributeMap = primitive.extensions[ this.name ].attributes;
		const threeAttributeMap = {};
		const attributeNormalizedMap = {};
		const attributeTypeMap = {};

		for ( const attributeName in gltfAttributeMap ) {

			const threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

			threeAttributeMap[ threeAttributeName ] = gltfAttributeMap[ attributeName ];

		}

		for ( const attributeName in primitive.attributes ) {

			const threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

			if ( gltfAttributeMap[ attributeName ] !== undefined ) {

				const accessorDef = json.accessors[ primitive.attributes[ attributeName ] ];
				const componentType = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

				attributeTypeMap[ threeAttributeName ] = componentType;
				attributeNormalizedMap[ threeAttributeName ] = accessorDef.normalized === true;

			}

		}

		return parser.getDependency( 'bufferView', bufferViewIndex ).then( function ( bufferView ) {

			return new Promise( function ( resolve ) {

				dracoLoader.decodeDracoFile( bufferView, function ( geometry ) {

					for ( const attributeName in geometry.attributes ) {

						const attribute = geometry.attributes[ attributeName ];
						const normalized = attributeNormalizedMap[ attributeName ];

						if ( normalized !== undefined ) attribute.normalized = normalized;

					}

					resolve( geometry );

				}, threeAttributeMap, attributeTypeMap );

			} );

		} );

	}

}

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
class GLTFTextureTransformExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;

	}

	extendTexture( texture, transform ) {

		if ( transform.texCoord !== undefined ) {

			console.warn( 'THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.' );

		}

		if ( transform.offset === undefined && transform.rotation === undefined && transform.scale === undefined ) {

			// See https://github.com/mrdoob/three.js/issues/21819.
			return texture;

		}

		texture = texture.clone();

		if ( transform.offset !== undefined ) {

			texture.offset.fromArray( transform.offset );

		}

		if ( transform.rotation !== undefined ) {

			texture.rotation = transform.rotation;

		}

		if ( transform.scale !== undefined ) {

			texture.repeat.fromArray( transform.scale );

		}

		texture.needsUpdate = true;

		return texture;

	}

}

/**
 * Specular-Glossiness Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
 */

/**
 * A sub class of StandardMaterial with some of the functionality
 * changed via the `onBeforeCompile` callback
 * @pailhead
 */
class GLTFMeshStandardSGMaterial extends three__WEBPACK_IMPORTED_MODULE_0__.MeshStandardMaterial {

	constructor( params ) {

		super();

		this.isGLTFSpecularGlossinessMaterial = true;

		//various chunks that need replacing
		const specularMapParsFragmentChunk = [
			'#ifdef USE_SPECULARMAP',
			'	uniform sampler2D specularMap;',
			'#endif'
		].join( '\n' );

		const glossinessMapParsFragmentChunk = [
			'#ifdef USE_GLOSSINESSMAP',
			'	uniform sampler2D glossinessMap;',
			'#endif'
		].join( '\n' );

		const specularMapFragmentChunk = [
			'vec3 specularFactor = specular;',
			'#ifdef USE_SPECULARMAP',
			'	vec4 texelSpecular = texture2D( specularMap, vUv );',
			'	texelSpecular = sRGBToLinear( texelSpecular );',
			'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	specularFactor *= texelSpecular.rgb;',
			'#endif'
		].join( '\n' );

		const glossinessMapFragmentChunk = [
			'float glossinessFactor = glossiness;',
			'#ifdef USE_GLOSSINESSMAP',
			'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
			'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	glossinessFactor *= texelGlossiness.a;',
			'#endif'
		].join( '\n' );

		const lightPhysicalFragmentChunk = [
			'PhysicalMaterial material;',
			'material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );',
			'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
			'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
			'material.roughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.',
			'material.roughness += geometryRoughness;',
			'material.roughness = min( material.roughness, 1.0 );',
			'material.specularColor = specularFactor;',
		].join( '\n' );

		const uniforms = {
			specular: { value: new three__WEBPACK_IMPORTED_MODULE_0__.Color().setHex( 0xffffff ) },
			glossiness: { value: 1 },
			specularMap: { value: null },
			glossinessMap: { value: null }
		};

		this._extraUniforms = uniforms;

		this.onBeforeCompile = function ( shader ) {

			for ( const uniformName in uniforms ) {

				shader.uniforms[ uniformName ] = uniforms[ uniformName ];

			}

			shader.fragmentShader = shader.fragmentShader
				.replace( 'uniform float roughness;', 'uniform vec3 specular;' )
				.replace( 'uniform float metalness;', 'uniform float glossiness;' )
				.replace( '#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk )
				.replace( '#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk )
				.replace( '#include <roughnessmap_fragment>', specularMapFragmentChunk )
				.replace( '#include <metalnessmap_fragment>', glossinessMapFragmentChunk )
				.replace( '#include <lights_physical_fragment>', lightPhysicalFragmentChunk );

		};

		Object.defineProperties( this, {

			specular: {
				get: function () {

					return uniforms.specular.value;

				},
				set: function ( v ) {

					uniforms.specular.value = v;

				}
			},

			specularMap: {
				get: function () {

					return uniforms.specularMap.value;

				},
				set: function ( v ) {

					uniforms.specularMap.value = v;

					if ( v ) {

						this.defines.USE_SPECULARMAP = ''; // USE_UV is set by the renderer for specular maps

					} else {

						delete this.defines.USE_SPECULARMAP;

					}

				}
			},

			glossiness: {
				get: function () {

					return uniforms.glossiness.value;

				},
				set: function ( v ) {

					uniforms.glossiness.value = v;

				}
			},

			glossinessMap: {
				get: function () {

					return uniforms.glossinessMap.value;

				},
				set: function ( v ) {

					uniforms.glossinessMap.value = v;

					if ( v ) {

						this.defines.USE_GLOSSINESSMAP = '';
						this.defines.USE_UV = '';

					} else {

						delete this.defines.USE_GLOSSINESSMAP;
						delete this.defines.USE_UV;

					}

				}
			}

		} );

		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;

		this.setValues( params );

	}

	copy( source ) {

		super.copy( source );

		this.specularMap = source.specularMap;
		this.specular.copy( source.specular );
		this.glossinessMap = source.glossinessMap;
		this.glossiness = source.glossiness;
		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;
		return this;

	}

}


class GLTFMaterialsPbrSpecularGlossinessExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS;

		this.specularGlossinessParams = [
			'color',
			'map',
			'lightMap',
			'lightMapIntensity',
			'aoMap',
			'aoMapIntensity',
			'emissive',
			'emissiveIntensity',
			'emissiveMap',
			'bumpMap',
			'bumpScale',
			'normalMap',
			'normalMapType',
			'displacementMap',
			'displacementScale',
			'displacementBias',
			'specularMap',
			'specular',
			'glossinessMap',
			'glossiness',
			'alphaMap',
			'envMap',
			'envMapIntensity',
			'refractionRatio',
		];

	}

	getMaterialType() {

		return GLTFMeshStandardSGMaterial;

	}

	extendParams( materialParams, materialDef, parser ) {

		const pbrSpecularGlossiness = materialDef.extensions[ this.name ];

		materialParams.color = new three__WEBPACK_IMPORTED_MODULE_0__.Color( 1.0, 1.0, 1.0 );
		materialParams.opacity = 1.0;

		const pending = [];

		if ( Array.isArray( pbrSpecularGlossiness.diffuseFactor ) ) {

			const array = pbrSpecularGlossiness.diffuseFactor;

			materialParams.color.fromArray( array );
			materialParams.opacity = array[ 3 ];

		}

		if ( pbrSpecularGlossiness.diffuseTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'map', pbrSpecularGlossiness.diffuseTexture ) );

		}

		materialParams.emissive = new three__WEBPACK_IMPORTED_MODULE_0__.Color( 0.0, 0.0, 0.0 );
		materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
		materialParams.specular = new three__WEBPACK_IMPORTED_MODULE_0__.Color( 1.0, 1.0, 1.0 );

		if ( Array.isArray( pbrSpecularGlossiness.specularFactor ) ) {

			materialParams.specular.fromArray( pbrSpecularGlossiness.specularFactor );

		}

		if ( pbrSpecularGlossiness.specularGlossinessTexture !== undefined ) {

			const specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
			pending.push( parser.assignTexture( materialParams, 'glossinessMap', specGlossMapDef ) );
			pending.push( parser.assignTexture( materialParams, 'specularMap', specGlossMapDef ) );

		}

		return Promise.all( pending );

	}

	createMaterial( materialParams ) {

		const material = new GLTFMeshStandardSGMaterial( materialParams );
		material.fog = true;

		material.color = materialParams.color;

		material.map = materialParams.map === undefined ? null : materialParams.map;

		material.lightMap = null;
		material.lightMapIntensity = 1.0;

		material.aoMap = materialParams.aoMap === undefined ? null : materialParams.aoMap;
		material.aoMapIntensity = 1.0;

		material.emissive = materialParams.emissive;
		material.emissiveIntensity = 1.0;
		material.emissiveMap = materialParams.emissiveMap === undefined ? null : materialParams.emissiveMap;

		material.bumpMap = materialParams.bumpMap === undefined ? null : materialParams.bumpMap;
		material.bumpScale = 1;

		material.normalMap = materialParams.normalMap === undefined ? null : materialParams.normalMap;
		material.normalMapType = three__WEBPACK_IMPORTED_MODULE_0__.TangentSpaceNormalMap;

		if ( materialParams.normalScale ) material.normalScale = materialParams.normalScale;

		material.displacementMap = null;
		material.displacementScale = 1;
		material.displacementBias = 0;

		material.specularMap = materialParams.specularMap === undefined ? null : materialParams.specularMap;
		material.specular = materialParams.specular;

		material.glossinessMap = materialParams.glossinessMap === undefined ? null : materialParams.glossinessMap;
		material.glossiness = materialParams.glossiness;

		material.alphaMap = null;

		material.envMap = materialParams.envMap === undefined ? null : materialParams.envMap;
		material.envMapIntensity = 1.0;

		material.refractionRatio = 0.98;

		return material;

	}

}

/**
 * Mesh Quantization Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
 */
class GLTFMeshQuantizationExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;

	}

}

/*********************************/
/********** INTERPOLATION ********/
/*********************************/

// Spline Interpolation
// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
class GLTFCubicSplineInterpolant extends three__WEBPACK_IMPORTED_MODULE_0__.Interpolant {

	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	copySampleValue_( index ) {

		// Copies a sample value to the result buffer. See description of glTF
		// CUBICSPLINE values layout in interpolate_() function below.

		const result = this.resultBuffer,
			values = this.sampleValues,
			valueSize = this.valueSize,
			offset = index * valueSize * 3 + valueSize;

		for ( let i = 0; i !== valueSize; i ++ ) {

			result[ i ] = values[ offset + i ];

		}

		return result;

	}

}

GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

GLTFCubicSplineInterpolant.prototype.interpolate_ = function ( i1, t0, t, t1 ) {

	const result = this.resultBuffer;
	const values = this.sampleValues;
	const stride = this.valueSize;

	const stride2 = stride * 2;
	const stride3 = stride * 3;

	const td = t1 - t0;

	const p = ( t - t0 ) / td;
	const pp = p * p;
	const ppp = pp * p;

	const offset1 = i1 * stride3;
	const offset0 = offset1 - stride3;

	const s2 = - 2 * ppp + 3 * pp;
	const s3 = ppp - pp;
	const s0 = 1 - s2;
	const s1 = s3 - pp + p;

	// Layout of keyframe output values for CUBICSPLINE animations:
	//   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
	for ( let i = 0; i !== stride; i ++ ) {

		const p0 = values[ offset0 + i + stride ]; // splineVertex_k
		const m0 = values[ offset0 + i + stride2 ] * td; // outTangent_k * (t_k+1 - t_k)
		const p1 = values[ offset1 + i + stride ]; // splineVertex_k+1
		const m1 = values[ offset1 + i ] * td; // inTangent_k+1 * (t_k+1 - t_k)

		result[ i ] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

	}

	return result;

};

const _q = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion();

class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {

	interpolate_( i1, t0, t, t1 ) {

		const result = super.interpolate_( i1, t0, t, t1 );

		_q.fromArray( result ).normalize().toArray( result );

		return result;

	}

}


/*********************************/
/********** INTERNALS ************/
/*********************************/

/* CONSTANTS */

const WEBGL_CONSTANTS = {
	FLOAT: 5126,
	//FLOAT_MAT2: 35674,
	FLOAT_MAT3: 35675,
	FLOAT_MAT4: 35676,
	FLOAT_VEC2: 35664,
	FLOAT_VEC3: 35665,
	FLOAT_VEC4: 35666,
	LINEAR: 9729,
	REPEAT: 10497,
	SAMPLER_2D: 35678,
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6,
	UNSIGNED_BYTE: 5121,
	UNSIGNED_SHORT: 5123
};

const WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};

const WEBGL_FILTERS = {
	9728: three__WEBPACK_IMPORTED_MODULE_0__.NearestFilter,
	9729: three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter,
	9984: three__WEBPACK_IMPORTED_MODULE_0__.NearestMipmapNearestFilter,
	9985: three__WEBPACK_IMPORTED_MODULE_0__.LinearMipmapNearestFilter,
	9986: three__WEBPACK_IMPORTED_MODULE_0__.NearestMipmapLinearFilter,
	9987: three__WEBPACK_IMPORTED_MODULE_0__.LinearMipmapLinearFilter
};

const WEBGL_WRAPPINGS = {
	33071: three__WEBPACK_IMPORTED_MODULE_0__.ClampToEdgeWrapping,
	33648: three__WEBPACK_IMPORTED_MODULE_0__.MirroredRepeatWrapping,
	10497: three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping
};

const WEBGL_TYPE_SIZES = {
	'SCALAR': 1,
	'VEC2': 2,
	'VEC3': 3,
	'VEC4': 4,
	'MAT2': 4,
	'MAT3': 9,
	'MAT4': 16
};

const ATTRIBUTES = {
	POSITION: 'position',
	NORMAL: 'normal',
	TANGENT: 'tangent',
	TEXCOORD_0: 'uv',
	TEXCOORD_1: 'uv2',
	COLOR_0: 'color',
	WEIGHTS_0: 'skinWeight',
	JOINTS_0: 'skinIndex',
};

const PATH_PROPERTIES = {
	scale: 'scale',
	translation: 'position',
	rotation: 'quaternion',
	weights: 'morphTargetInfluences'
};

const INTERPOLATION = {
	CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
		                        // keyframe track will be initialized with a default interpolation type, then modified.
	LINEAR: three__WEBPACK_IMPORTED_MODULE_0__.InterpolateLinear,
	STEP: three__WEBPACK_IMPORTED_MODULE_0__.InterpolateDiscrete
};

const ALPHA_MODES = {
	OPAQUE: 'OPAQUE',
	MASK: 'MASK',
	BLEND: 'BLEND'
};

/* UTILITY FUNCTIONS */

function resolveURL( url, path ) {

	// Invalid URL
	if ( typeof url !== 'string' || url === '' ) return '';

	// Host Relative URL
	if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

		path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

	}

	// Absolute URL http://,https://,//
	if ( /^(https?:)?\/\//i.test( url ) ) return url;

	// Data URI
	if ( /^data:.*,.*$/i.test( url ) ) return url;

	// Blob URL
	if ( /^blob:.*$/i.test( url ) ) return url;

	// Relative URL
	return path + url;

}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
 */
function createDefaultMaterial( cache ) {

	if ( cache[ 'DefaultMaterial' ] === undefined ) {

		cache[ 'DefaultMaterial' ] = new three__WEBPACK_IMPORTED_MODULE_0__.MeshStandardMaterial( {
			color: 0xFFFFFF,
			emissive: 0x000000,
			metalness: 1,
			roughness: 1,
			transparent: false,
			depthTest: true,
			side: three__WEBPACK_IMPORTED_MODULE_0__.FrontSide
		} );

	}

	return cache[ 'DefaultMaterial' ];

}

function addUnknownExtensionsToUserData( knownExtensions, object, objectDef ) {

	// Add unknown glTF extensions to an object's userData.

	for ( const name in objectDef.extensions ) {

		if ( knownExtensions[ name ] === undefined ) {

			object.userData.gltfExtensions = object.userData.gltfExtensions || {};
			object.userData.gltfExtensions[ name ] = objectDef.extensions[ name ];

		}

	}

}

/**
 * @param {Object3D|Material|BufferGeometry} object
 * @param {GLTF.definition} gltfDef
 */
function assignExtrasToUserData( object, gltfDef ) {

	if ( gltfDef.extras !== undefined ) {

		if ( typeof gltfDef.extras === 'object' ) {

			Object.assign( object.userData, gltfDef.extras );

		} else {

			console.warn( 'THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras );

		}

	}

}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
 *
 * @param {BufferGeometry} geometry
 * @param {Array<GLTF.Target>} targets
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
function addMorphTargets( geometry, targets, parser ) {

	let hasMorphPosition = false;
	let hasMorphNormal = false;

	for ( let i = 0, il = targets.length; i < il; i ++ ) {

		const target = targets[ i ];

		if ( target.POSITION !== undefined ) hasMorphPosition = true;
		if ( target.NORMAL !== undefined ) hasMorphNormal = true;

		if ( hasMorphPosition && hasMorphNormal ) break;

	}

	if ( ! hasMorphPosition && ! hasMorphNormal ) return Promise.resolve( geometry );

	const pendingPositionAccessors = [];
	const pendingNormalAccessors = [];

	for ( let i = 0, il = targets.length; i < il; i ++ ) {

		const target = targets[ i ];

		if ( hasMorphPosition ) {

			const pendingAccessor = target.POSITION !== undefined
				? parser.getDependency( 'accessor', target.POSITION )
				: geometry.attributes.position;

			pendingPositionAccessors.push( pendingAccessor );

		}

		if ( hasMorphNormal ) {

			const pendingAccessor = target.NORMAL !== undefined
				? parser.getDependency( 'accessor', target.NORMAL )
				: geometry.attributes.normal;

			pendingNormalAccessors.push( pendingAccessor );

		}

	}

	return Promise.all( [
		Promise.all( pendingPositionAccessors ),
		Promise.all( pendingNormalAccessors )
	] ).then( function ( accessors ) {

		const morphPositions = accessors[ 0 ];
		const morphNormals = accessors[ 1 ];

		if ( hasMorphPosition ) geometry.morphAttributes.position = morphPositions;
		if ( hasMorphNormal ) geometry.morphAttributes.normal = morphNormals;
		geometry.morphTargetsRelative = true;

		return geometry;

	} );

}

/**
 * @param {Mesh} mesh
 * @param {GLTF.Mesh} meshDef
 */
function updateMorphTargets( mesh, meshDef ) {

	mesh.updateMorphTargets();

	if ( meshDef.weights !== undefined ) {

		for ( let i = 0, il = meshDef.weights.length; i < il; i ++ ) {

			mesh.morphTargetInfluences[ i ] = meshDef.weights[ i ];

		}

	}

	// .extras has user-defined data, so check that .extras.targetNames is an array.
	if ( meshDef.extras && Array.isArray( meshDef.extras.targetNames ) ) {

		const targetNames = meshDef.extras.targetNames;

		if ( mesh.morphTargetInfluences.length === targetNames.length ) {

			mesh.morphTargetDictionary = {};

			for ( let i = 0, il = targetNames.length; i < il; i ++ ) {

				mesh.morphTargetDictionary[ targetNames[ i ] ] = i;

			}

		} else {

			console.warn( 'THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.' );

		}

	}

}

function createPrimitiveKey( primitiveDef ) {

	const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ];
	let geometryKey;

	if ( dracoExtension ) {

		geometryKey = 'draco:' + dracoExtension.bufferView
				+ ':' + dracoExtension.indices
				+ ':' + createAttributesKey( dracoExtension.attributes );

	} else {

		geometryKey = primitiveDef.indices + ':' + createAttributesKey( primitiveDef.attributes ) + ':' + primitiveDef.mode;

	}

	return geometryKey;

}

function createAttributesKey( attributes ) {

	let attributesKey = '';

	const keys = Object.keys( attributes ).sort();

	for ( let i = 0, il = keys.length; i < il; i ++ ) {

		attributesKey += keys[ i ] + ':' + attributes[ keys[ i ] ] + ';';

	}

	return attributesKey;

}

function getNormalizedComponentScale( constructor ) {

	// Reference:
	// https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization#encoding-quantized-data

	switch ( constructor ) {

		case Int8Array:
			return 1 / 127;

		case Uint8Array:
			return 1 / 255;

		case Int16Array:
			return 1 / 32767;

		case Uint16Array:
			return 1 / 65535;

		default:
			throw new Error( 'THREE.GLTFLoader: Unsupported normalized accessor component type.' );

	}

}

/* GLTF PARSER */

class GLTFParser {

	constructor( json = {}, options = {} ) {

		this.json = json;
		this.extensions = {};
		this.plugins = {};
		this.options = options;

		// loader object cache
		this.cache = new GLTFRegistry();

		// associations between Three.js objects and glTF elements
		this.associations = new Map();

		// BufferGeometry caching
		this.primitiveCache = {};

		// Object3D instance caches
		this.meshCache = { refs: {}, uses: {} };
		this.cameraCache = { refs: {}, uses: {} };
		this.lightCache = { refs: {}, uses: {} };

		this.textureCache = {};

		// Track node names, to ensure no duplicates
		this.nodeNamesUsed = {};

		// Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
		// expensive work of uploading a texture to the GPU off the main thread.
		if ( typeof createImageBitmap !== 'undefined' && /Firefox/.test( navigator.userAgent ) === false ) {

			this.textureLoader = new three__WEBPACK_IMPORTED_MODULE_0__.ImageBitmapLoader( this.options.manager );

		} else {

			this.textureLoader = new three__WEBPACK_IMPORTED_MODULE_0__.TextureLoader( this.options.manager );

		}

		this.textureLoader.setCrossOrigin( this.options.crossOrigin );
		this.textureLoader.setRequestHeader( this.options.requestHeader );

		this.fileLoader = new three__WEBPACK_IMPORTED_MODULE_0__.FileLoader( this.options.manager );
		this.fileLoader.setResponseType( 'arraybuffer' );

		if ( this.options.crossOrigin === 'use-credentials' ) {

			this.fileLoader.setWithCredentials( true );

		}

	}

	setExtensions( extensions ) {

		this.extensions = extensions;

	}

	setPlugins( plugins ) {

		this.plugins = plugins;

	}

	parse( onLoad, onError ) {

		const parser = this;
		const json = this.json;
		const extensions = this.extensions;

		// Clear the loader cache
		this.cache.removeAll();

		// Mark the special nodes/meshes in json for efficient parse
		this._invokeAll( function ( ext ) {

			return ext._markDefs && ext._markDefs();

		} );

		Promise.all( this._invokeAll( function ( ext ) {

			return ext.beforeRoot && ext.beforeRoot();

		} ) ).then( function () {

			return Promise.all( [

				parser.getDependencies( 'scene' ),
				parser.getDependencies( 'animation' ),
				parser.getDependencies( 'camera' ),

			] );

		} ).then( function ( dependencies ) {

			const result = {
				scene: dependencies[ 0 ][ json.scene || 0 ],
				scenes: dependencies[ 0 ],
				animations: dependencies[ 1 ],
				cameras: dependencies[ 2 ],
				asset: json.asset,
				parser: parser,
				userData: {}
			};

			addUnknownExtensionsToUserData( extensions, result, json );

			assignExtrasToUserData( result, json );

			Promise.all( parser._invokeAll( function ( ext ) {

				return ext.afterRoot && ext.afterRoot( result );

			} ) ).then( function () {

				onLoad( result );

			} );

		} ).catch( onError );

	}

	/**
	 * Marks the special nodes/meshes in json for efficient parse.
	 */
	_markDefs() {

		const nodeDefs = this.json.nodes || [];
		const skinDefs = this.json.skins || [];
		const meshDefs = this.json.meshes || [];

		// Nothing in the node definition indicates whether it is a Bone or an
		// Object3D. Use the skins' joint references to mark bones.
		for ( let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex ++ ) {

			const joints = skinDefs[ skinIndex ].joints;

			for ( let i = 0, il = joints.length; i < il; i ++ ) {

				nodeDefs[ joints[ i ] ].isBone = true;

			}

		}

		// Iterate over all nodes, marking references to shared resources,
		// as well as skeleton joints.
		for ( let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

			const nodeDef = nodeDefs[ nodeIndex ];

			if ( nodeDef.mesh !== undefined ) {

				this._addNodeRef( this.meshCache, nodeDef.mesh );

				// Nothing in the mesh definition indicates whether it is
				// a SkinnedMesh or Mesh. Use the node's mesh reference
				// to mark SkinnedMesh if node has skin.
				if ( nodeDef.skin !== undefined ) {

					meshDefs[ nodeDef.mesh ].isSkinnedMesh = true;

				}

			}

			if ( nodeDef.camera !== undefined ) {

				this._addNodeRef( this.cameraCache, nodeDef.camera );

			}

		}

	}

	/**
	 * Counts references to shared node / Object3D resources. These resources
	 * can be reused, or "instantiated", at multiple nodes in the scene
	 * hierarchy. Mesh, Camera, and Light instances are instantiated and must
	 * be marked. Non-scenegraph resources (like Materials, Geometries, and
	 * Textures) can be reused directly and are not marked here.
	 *
	 * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
	 */
	_addNodeRef( cache, index ) {

		if ( index === undefined ) return;

		if ( cache.refs[ index ] === undefined ) {

			cache.refs[ index ] = cache.uses[ index ] = 0;

		}

		cache.refs[ index ] ++;

	}

	/** Returns a reference to a shared resource, cloning it if necessary. */
	_getNodeRef( cache, index, object ) {

		if ( cache.refs[ index ] <= 1 ) return object;

		const ref = object.clone();

		ref.name += '_instance_' + ( cache.uses[ index ] ++ );

		return ref;

	}

	_invokeOne( func ) {

		const extensions = Object.values( this.plugins );
		extensions.push( this );

		for ( let i = 0; i < extensions.length; i ++ ) {

			const result = func( extensions[ i ] );

			if ( result ) return result;

		}

		return null;

	}

	_invokeAll( func ) {

		const extensions = Object.values( this.plugins );
		extensions.unshift( this );

		const pending = [];

		for ( let i = 0; i < extensions.length; i ++ ) {

			const result = func( extensions[ i ] );

			if ( result ) pending.push( result );

		}

		return pending;

	}

	/**
	 * Requests the specified dependency asynchronously, with caching.
	 * @param {string} type
	 * @param {number} index
	 * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
	 */
	getDependency( type, index ) {

		const cacheKey = type + ':' + index;
		let dependency = this.cache.get( cacheKey );

		if ( ! dependency ) {

			switch ( type ) {

				case 'scene':
					dependency = this.loadScene( index );
					break;

				case 'node':
					dependency = this.loadNode( index );
					break;

				case 'mesh':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadMesh && ext.loadMesh( index );

					} );
					break;

				case 'accessor':
					dependency = this.loadAccessor( index );
					break;

				case 'bufferView':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadBufferView && ext.loadBufferView( index );

					} );
					break;

				case 'buffer':
					dependency = this.loadBuffer( index );
					break;

				case 'material':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadMaterial && ext.loadMaterial( index );

					} );
					break;

				case 'texture':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadTexture && ext.loadTexture( index );

					} );
					break;

				case 'skin':
					dependency = this.loadSkin( index );
					break;

				case 'animation':
					dependency = this.loadAnimation( index );
					break;

				case 'camera':
					dependency = this.loadCamera( index );
					break;

				default:
					throw new Error( 'Unknown type: ' + type );

			}

			this.cache.add( cacheKey, dependency );

		}

		return dependency;

	}

	/**
	 * Requests all dependencies of the specified type asynchronously, with caching.
	 * @param {string} type
	 * @return {Promise<Array<Object>>}
	 */
	getDependencies( type ) {

		let dependencies = this.cache.get( type );

		if ( ! dependencies ) {

			const parser = this;
			const defs = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || [];

			dependencies = Promise.all( defs.map( function ( def, index ) {

				return parser.getDependency( type, index );

			} ) );

			this.cache.add( type, dependencies );

		}

		return dependencies;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	loadBuffer( bufferIndex ) {

		const bufferDef = this.json.buffers[ bufferIndex ];
		const loader = this.fileLoader;

		if ( bufferDef.type && bufferDef.type !== 'arraybuffer' ) {

			throw new Error( 'THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.' );

		}

		// If present, GLB container is required to be the first buffer.
		if ( bufferDef.uri === undefined && bufferIndex === 0 ) {

			return Promise.resolve( this.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body );

		}

		const options = this.options;

		return new Promise( function ( resolve, reject ) {

			loader.load( resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {

				reject( new Error( 'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".' ) );

			} );

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferViewIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	loadBufferView( bufferViewIndex ) {

		const bufferViewDef = this.json.bufferViews[ bufferViewIndex ];

		return this.getDependency( 'buffer', bufferViewDef.buffer ).then( function ( buffer ) {

			const byteLength = bufferViewDef.byteLength || 0;
			const byteOffset = bufferViewDef.byteOffset || 0;
			return buffer.slice( byteOffset, byteOffset + byteLength );

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
	 * @param {number} accessorIndex
	 * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
	 */
	loadAccessor( accessorIndex ) {

		const parser = this;
		const json = this.json;

		const accessorDef = this.json.accessors[ accessorIndex ];

		if ( accessorDef.bufferView === undefined && accessorDef.sparse === undefined ) {

			// Ignore empty accessors, which may be used to declare runtime
			// information about attributes coming from another source (e.g. Draco
			// compression extension).
			return Promise.resolve( null );

		}

		const pendingBufferViews = [];

		if ( accessorDef.bufferView !== undefined ) {

			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.bufferView ) );

		} else {

			pendingBufferViews.push( null );

		}

		if ( accessorDef.sparse !== undefined ) {

			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.indices.bufferView ) );
			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.values.bufferView ) );

		}

		return Promise.all( pendingBufferViews ).then( function ( bufferViews ) {

			const bufferView = bufferViews[ 0 ];

			const itemSize = WEBGL_TYPE_SIZES[ accessorDef.type ];
			const TypedArray = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

			// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
			const elementBytes = TypedArray.BYTES_PER_ELEMENT;
			const itemBytes = elementBytes * itemSize;
			const byteOffset = accessorDef.byteOffset || 0;
			const byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[ accessorDef.bufferView ].byteStride : undefined;
			const normalized = accessorDef.normalized === true;
			let array, bufferAttribute;

			// The buffer is not interleaved if the stride is the item size in bytes.
			if ( byteStride && byteStride !== itemBytes ) {

				// Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
				// This makes sure that IBA.count reflects accessor.count properly
				const ibSlice = Math.floor( byteOffset / byteStride );
				const ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
				let ib = parser.cache.get( ibCacheKey );

				if ( ! ib ) {

					array = new TypedArray( bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes );

					// Integer parameters to IB/IBA are in array elements, not bytes.
					ib = new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBuffer( array, byteStride / elementBytes );

					parser.cache.add( ibCacheKey, ib );

				}

				bufferAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( ib, itemSize, ( byteOffset % byteStride ) / elementBytes, normalized );

			} else {

				if ( bufferView === null ) {

					array = new TypedArray( accessorDef.count * itemSize );

				} else {

					array = new TypedArray( bufferView, byteOffset, accessorDef.count * itemSize );

				}

				bufferAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute( array, itemSize, normalized );

			}

			// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
			if ( accessorDef.sparse !== undefined ) {

				const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
				const TypedArrayIndices = WEBGL_COMPONENT_TYPES[ accessorDef.sparse.indices.componentType ];

				const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
				const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

				const sparseIndices = new TypedArrayIndices( bufferViews[ 1 ], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices );
				const sparseValues = new TypedArray( bufferViews[ 2 ], byteOffsetValues, accessorDef.sparse.count * itemSize );

				if ( bufferView !== null ) {

					// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
					bufferAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute( bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized );

				}

				for ( let i = 0, il = sparseIndices.length; i < il; i ++ ) {

					const index = sparseIndices[ i ];

					bufferAttribute.setX( index, sparseValues[ i * itemSize ] );
					if ( itemSize >= 2 ) bufferAttribute.setY( index, sparseValues[ i * itemSize + 1 ] );
					if ( itemSize >= 3 ) bufferAttribute.setZ( index, sparseValues[ i * itemSize + 2 ] );
					if ( itemSize >= 4 ) bufferAttribute.setW( index, sparseValues[ i * itemSize + 3 ] );
					if ( itemSize >= 5 ) throw new Error( 'THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.' );

				}

			}

			return bufferAttribute;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
	 * @param {number} textureIndex
	 * @return {Promise<THREE.Texture>}
	 */
	loadTexture( textureIndex ) {

		const json = this.json;
		const options = this.options;
		const textureDef = json.textures[ textureIndex ];
		const source = json.images[ textureDef.source ];

		let loader = this.textureLoader;

		if ( source.uri ) {

			const handler = options.manager.getHandler( source.uri );
			if ( handler !== null ) loader = handler;

		}

		return this.loadTextureImage( textureIndex, source, loader );

	}

	loadTextureImage( textureIndex, source, loader ) {

		const parser = this;
		const json = this.json;
		const options = this.options;

		const textureDef = json.textures[ textureIndex ];

		const cacheKey = ( source.uri || source.bufferView ) + ':' + textureDef.sampler;

		if ( this.textureCache[ cacheKey ] ) {

			// See https://github.com/mrdoob/three.js/issues/21559.
			return this.textureCache[ cacheKey ];

		}

		const URL = self.URL || self.webkitURL;

		let sourceURI = source.uri || '';
		let isObjectURL = false;
		let hasAlpha = true;

		const isJPEG = sourceURI.search( /\.jpe?g($|\?)/i ) > 0 || sourceURI.search( /^data\:image\/jpeg/ ) === 0;

		if ( source.mimeType === 'image/jpeg' || isJPEG ) hasAlpha = false;

		if ( source.bufferView !== undefined ) {

			// Load binary image data from bufferView, if provided.

			sourceURI = parser.getDependency( 'bufferView', source.bufferView ).then( function ( bufferView ) {

				if ( source.mimeType === 'image/png' ) {

					// Inspect the PNG 'IHDR' chunk to determine whether the image could have an
					// alpha channel. This check is conservative — the image could have an alpha
					// channel with all values == 1, and the indexed type (colorType == 3) only
					// sometimes contains alpha.
					//
					// https://en.wikipedia.org/wiki/Portable_Network_Graphics#File_header
					const colorType = new DataView( bufferView, 25, 1 ).getUint8( 0, false );
					hasAlpha = colorType === 6 || colorType === 4 || colorType === 3;

				}

				isObjectURL = true;
				const blob = new Blob( [ bufferView ], { type: source.mimeType } );
				sourceURI = URL.createObjectURL( blob );
				return sourceURI;

			} );

		} else if ( source.uri === undefined ) {

			throw new Error( 'THREE.GLTFLoader: Image ' + textureIndex + ' is missing URI and bufferView' );

		}

		const promise = Promise.resolve( sourceURI ).then( function ( sourceURI ) {

			return new Promise( function ( resolve, reject ) {

				let onLoad = resolve;

				if ( loader.isImageBitmapLoader === true ) {

					onLoad = function ( imageBitmap ) {

						const texture = new three__WEBPACK_IMPORTED_MODULE_0__.Texture( imageBitmap );
						texture.needsUpdate = true;

						resolve( texture );

					};

				}

				loader.load( resolveURL( sourceURI, options.path ), onLoad, undefined, reject );

			} );

		} ).then( function ( texture ) {

			// Clean up resources and configure Texture.

			if ( isObjectURL === true ) {

				URL.revokeObjectURL( sourceURI );

			}

			texture.flipY = false;

			if ( textureDef.name ) texture.name = textureDef.name;

			// When there is definitely no alpha channel in the texture, set RGBFormat to save space.
			if ( ! hasAlpha ) texture.format = three__WEBPACK_IMPORTED_MODULE_0__.RGBFormat;

			const samplers = json.samplers || {};
			const sampler = samplers[ textureDef.sampler ] || {};

			texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter;
			texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || three__WEBPACK_IMPORTED_MODULE_0__.LinearMipmapLinearFilter;
			texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;
			texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;

			parser.associations.set( texture, {
				type: 'textures',
				index: textureIndex
			} );

			return texture;

		} ).catch( function () {

			console.error( 'THREE.GLTFLoader: Couldn\'t load texture', sourceURI );
			return null;

		} );

		this.textureCache[ cacheKey ] = promise;

		return promise;

	}

	/**
	 * Asynchronously assigns a texture to the given material parameters.
	 * @param {Object} materialParams
	 * @param {string} mapName
	 * @param {Object} mapDef
	 * @return {Promise<Texture>}
	 */
	assignTexture( materialParams, mapName, mapDef ) {

		const parser = this;

		return this.getDependency( 'texture', mapDef.index ).then( function ( texture ) {

			// Materials sample aoMap from UV set 1 and other maps from UV set 0 - this can't be configured
			// However, we will copy UV set 0 to UV set 1 on demand for aoMap
			if ( mapDef.texCoord !== undefined && mapDef.texCoord != 0 && ! ( mapName === 'aoMap' && mapDef.texCoord == 1 ) ) {

				console.warn( 'THREE.GLTFLoader: Custom UV set ' + mapDef.texCoord + ' for texture ' + mapName + ' not yet supported.' );

			}

			if ( parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] ) {

				const transform = mapDef.extensions !== undefined ? mapDef.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] : undefined;

				if ( transform ) {

					const gltfReference = parser.associations.get( texture );
					texture = parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ].extendTexture( texture, transform );
					parser.associations.set( texture, gltfReference );

				}

			}

			materialParams[ mapName ] = texture;

			return texture;

		} );

	}

	/**
	 * Assigns final material to a Mesh, Line, or Points instance. The instance
	 * already has a material (generated from the glTF material options alone)
	 * but reuse of the same glTF material may require multiple threejs materials
	 * to accommodate different primitive types, defines, etc. New materials will
	 * be created if necessary, and reused from a cache.
	 * @param  {Object3D} mesh Mesh, Line, or Points instance.
	 */
	assignFinalMaterial( mesh ) {

		const geometry = mesh.geometry;
		let material = mesh.material;

		const useVertexTangents = geometry.attributes.tangent !== undefined;
		const useVertexColors = geometry.attributes.color !== undefined;
		const useFlatShading = geometry.attributes.normal === undefined;

		if ( mesh.isPoints ) {

			const cacheKey = 'PointsMaterial:' + material.uuid;

			let pointsMaterial = this.cache.get( cacheKey );

			if ( ! pointsMaterial ) {

				pointsMaterial = new three__WEBPACK_IMPORTED_MODULE_0__.PointsMaterial();
				three__WEBPACK_IMPORTED_MODULE_0__.Material.prototype.copy.call( pointsMaterial, material );
				pointsMaterial.color.copy( material.color );
				pointsMaterial.map = material.map;
				pointsMaterial.sizeAttenuation = false; // glTF spec says points should be 1px

				this.cache.add( cacheKey, pointsMaterial );

			}

			material = pointsMaterial;

		} else if ( mesh.isLine ) {

			const cacheKey = 'LineBasicMaterial:' + material.uuid;

			let lineMaterial = this.cache.get( cacheKey );

			if ( ! lineMaterial ) {

				lineMaterial = new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial();
				three__WEBPACK_IMPORTED_MODULE_0__.Material.prototype.copy.call( lineMaterial, material );
				lineMaterial.color.copy( material.color );

				this.cache.add( cacheKey, lineMaterial );

			}

			material = lineMaterial;

		}

		// Clone the material if it will be modified
		if ( useVertexTangents || useVertexColors || useFlatShading ) {

			let cacheKey = 'ClonedMaterial:' + material.uuid + ':';

			if ( material.isGLTFSpecularGlossinessMaterial ) cacheKey += 'specular-glossiness:';
			if ( useVertexTangents ) cacheKey += 'vertex-tangents:';
			if ( useVertexColors ) cacheKey += 'vertex-colors:';
			if ( useFlatShading ) cacheKey += 'flat-shading:';

			let cachedMaterial = this.cache.get( cacheKey );

			if ( ! cachedMaterial ) {

				cachedMaterial = material.clone();

				if ( useVertexColors ) cachedMaterial.vertexColors = true;
				if ( useFlatShading ) cachedMaterial.flatShading = true;

				if ( useVertexTangents ) {

					// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
					if ( cachedMaterial.normalScale ) cachedMaterial.normalScale.y *= - 1;
					if ( cachedMaterial.clearcoatNormalScale ) cachedMaterial.clearcoatNormalScale.y *= - 1;

				}

				this.cache.add( cacheKey, cachedMaterial );

				this.associations.set( cachedMaterial, this.associations.get( material ) );

			}

			material = cachedMaterial;

		}

		// workarounds for mesh and geometry

		if ( material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined ) {

			geometry.setAttribute( 'uv2', geometry.attributes.uv );

		}

		mesh.material = material;

	}

	getMaterialType( /* materialIndex */ ) {

		return three__WEBPACK_IMPORTED_MODULE_0__.MeshStandardMaterial;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
	 * @param {number} materialIndex
	 * @return {Promise<Material>}
	 */
	loadMaterial( materialIndex ) {

		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		const materialDef = json.materials[ materialIndex ];

		let materialType;
		const materialParams = {};
		const materialExtensions = materialDef.extensions || {};

		const pending = [];

		if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] ) {

			const sgExtension = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ];
			materialType = sgExtension.getMaterialType();
			pending.push( sgExtension.extendParams( materialParams, materialDef, parser ) );

		} else if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ] ) {

			const kmuExtension = extensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ];
			materialType = kmuExtension.getMaterialType();
			pending.push( kmuExtension.extendParams( materialParams, materialDef, parser ) );

		} else {

			// Specification:
			// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

			const metallicRoughness = materialDef.pbrMetallicRoughness || {};

			materialParams.color = new three__WEBPACK_IMPORTED_MODULE_0__.Color( 1.0, 1.0, 1.0 );
			materialParams.opacity = 1.0;

			if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

				const array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray( array );
				materialParams.opacity = array[ 3 ];

			}

			if ( metallicRoughness.baseColorTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

			}

			materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
			materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

			if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture ) );
				pending.push( parser.assignTexture( materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture ) );

			}

			materialType = this._invokeOne( function ( ext ) {

				return ext.getMaterialType && ext.getMaterialType( materialIndex );

			} );

			pending.push( Promise.all( this._invokeAll( function ( ext ) {

				return ext.extendMaterialParams && ext.extendMaterialParams( materialIndex, materialParams );

			} ) ) );

		}

		if ( materialDef.doubleSided === true ) {

			materialParams.side = three__WEBPACK_IMPORTED_MODULE_0__.DoubleSide;

		}

		const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

		if ( alphaMode === ALPHA_MODES.BLEND ) {

			materialParams.transparent = true;

			// See: https://github.com/mrdoob/three.js/issues/17706
			materialParams.depthWrite = false;

		} else {

			materialParams.format = three__WEBPACK_IMPORTED_MODULE_0__.RGBFormat;
			materialParams.transparent = false;

			if ( alphaMode === ALPHA_MODES.MASK ) {

				materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

			}

		}

		if ( materialDef.normalTexture !== undefined && materialType !== three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'normalMap', materialDef.normalTexture ) );

			// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
			materialParams.normalScale = new three__WEBPACK_IMPORTED_MODULE_0__.Vector2( 1, - 1 );

			if ( materialDef.normalTexture.scale !== undefined ) {

				materialParams.normalScale.set( materialDef.normalTexture.scale, - materialDef.normalTexture.scale );

			}

		}

		if ( materialDef.occlusionTexture !== undefined && materialType !== three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'aoMap', materialDef.occlusionTexture ) );

			if ( materialDef.occlusionTexture.strength !== undefined ) {

				materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

			}

		}

		if ( materialDef.emissiveFactor !== undefined && materialType !== three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial ) {

			materialParams.emissive = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( materialDef.emissiveFactor );

		}

		if ( materialDef.emissiveTexture !== undefined && materialType !== three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'emissiveMap', materialDef.emissiveTexture ) );

		}

		return Promise.all( pending ).then( function () {

			let material;

			if ( materialType === GLTFMeshStandardSGMaterial ) {

				material = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].createMaterial( materialParams );

			} else {

				material = new materialType( materialParams );

			}

			if ( materialDef.name ) material.name = materialDef.name;

			// baseColorTexture, emissiveTexture, and specularGlossinessTexture use sRGB encoding.
			if ( material.map ) material.map.encoding = three__WEBPACK_IMPORTED_MODULE_0__.sRGBEncoding;
			if ( material.emissiveMap ) material.emissiveMap.encoding = three__WEBPACK_IMPORTED_MODULE_0__.sRGBEncoding;

			assignExtrasToUserData( material, materialDef );

			parser.associations.set( material, { type: 'materials', index: materialIndex } );

			if ( materialDef.extensions ) addUnknownExtensionsToUserData( extensions, material, materialDef );

			return material;

		} );

	}

	/** When Object3D instances are targeted by animation, they need unique names. */
	createUniqueName( originalName ) {

		const sanitizedName = three__WEBPACK_IMPORTED_MODULE_0__.PropertyBinding.sanitizeNodeName( originalName || '' );

		let name = sanitizedName;

		for ( let i = 1; this.nodeNamesUsed[ name ]; ++ i ) {

			name = sanitizedName + '_' + i;

		}

		this.nodeNamesUsed[ name ] = true;

		return name;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
	 *
	 * Creates BufferGeometries from primitives.
	 *
	 * @param {Array<GLTF.Primitive>} primitives
	 * @return {Promise<Array<BufferGeometry>>}
	 */
	loadGeometries( primitives ) {

		const parser = this;
		const extensions = this.extensions;
		const cache = this.primitiveCache;

		function createDracoPrimitive( primitive ) {

			return extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ]
				.decodePrimitive( primitive, parser )
				.then( function ( geometry ) {

					return addPrimitiveAttributes( geometry, primitive, parser );

				} );

		}

		const pending = [];

		for ( let i = 0, il = primitives.length; i < il; i ++ ) {

			const primitive = primitives[ i ];
			const cacheKey = createPrimitiveKey( primitive );

			// See if we've already created this geometry
			const cached = cache[ cacheKey ];

			if ( cached ) {

				// Use the cached geometry if it exists
				pending.push( cached.promise );

			} else {

				let geometryPromise;

				if ( primitive.extensions && primitive.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ] ) {

					// Use DRACO geometry if available
					geometryPromise = createDracoPrimitive( primitive );

				} else {

					// Otherwise create a new geometry
					geometryPromise = addPrimitiveAttributes( new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry(), primitive, parser );

				}

				// Cache this geometry
				cache[ cacheKey ] = { primitive: primitive, promise: geometryPromise };

				pending.push( geometryPromise );

			}

		}

		return Promise.all( pending );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
	 * @param {number} meshIndex
	 * @return {Promise<Group|Mesh|SkinnedMesh>}
	 */
	loadMesh( meshIndex ) {

		const parser = this;
		const json = this.json;
		const extensions = this.extensions;

		const meshDef = json.meshes[ meshIndex ];
		const primitives = meshDef.primitives;

		const pending = [];

		for ( let i = 0, il = primitives.length; i < il; i ++ ) {

			const material = primitives[ i ].material === undefined
				? createDefaultMaterial( this.cache )
				: this.getDependency( 'material', primitives[ i ].material );

			pending.push( material );

		}

		pending.push( parser.loadGeometries( primitives ) );

		return Promise.all( pending ).then( function ( results ) {

			const materials = results.slice( 0, results.length - 1 );
			const geometries = results[ results.length - 1 ];

			const meshes = [];

			for ( let i = 0, il = geometries.length; i < il; i ++ ) {

				const geometry = geometries[ i ];
				const primitive = primitives[ i ];

				// 1. create Mesh

				let mesh;

				const material = materials[ i ];

				if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
						primitive.mode === undefined ) {

					// .isSkinnedMesh isn't in glTF spec. See ._markDefs()
					mesh = meshDef.isSkinnedMesh === true
						? new three__WEBPACK_IMPORTED_MODULE_0__.SkinnedMesh( geometry, material )
						: new three__WEBPACK_IMPORTED_MODULE_0__.Mesh( geometry, material );

					if ( mesh.isSkinnedMesh === true && ! mesh.geometry.attributes.skinWeight.normalized ) {

						// we normalize floating point skin weight array to fix malformed assets (see #15319)
						// it's important to skip this for non-float32 data since normalizeSkinWeights assumes non-normalized inputs
						mesh.normalizeSkinWeights();

					}

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ) {

						mesh.geometry = toTrianglesDrawMode( mesh.geometry, three__WEBPACK_IMPORTED_MODULE_0__.TriangleStripDrawMode );

					} else if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ) {

						mesh.geometry = toTrianglesDrawMode( mesh.geometry, three__WEBPACK_IMPORTED_MODULE_0__.TriangleFanDrawMode );

					}

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

					mesh = new three__WEBPACK_IMPORTED_MODULE_0__.LineSegments( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_STRIP ) {

					mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Line( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_LOOP ) {

					mesh = new three__WEBPACK_IMPORTED_MODULE_0__.LineLoop( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.POINTS ) {

					mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Points( geometry, material );

				} else {

					throw new Error( 'THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode );

				}

				if ( Object.keys( mesh.geometry.morphAttributes ).length > 0 ) {

					updateMorphTargets( mesh, meshDef );

				}

				mesh.name = parser.createUniqueName( meshDef.name || ( 'mesh_' + meshIndex ) );

				assignExtrasToUserData( mesh, meshDef );

				if ( primitive.extensions ) addUnknownExtensionsToUserData( extensions, mesh, primitive );

				parser.assignFinalMaterial( mesh );

				meshes.push( mesh );

			}

			if ( meshes.length === 1 ) {

				return meshes[ 0 ];

			}

			const group = new three__WEBPACK_IMPORTED_MODULE_0__.Group();

			for ( let i = 0, il = meshes.length; i < il; i ++ ) {

				group.add( meshes[ i ] );

			}

			return group;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
	 * @param {number} cameraIndex
	 * @return {Promise<THREE.Camera>}
	 */
	loadCamera( cameraIndex ) {

		let camera;
		const cameraDef = this.json.cameras[ cameraIndex ];
		const params = cameraDef[ cameraDef.type ];

		if ( ! params ) {

			console.warn( 'THREE.GLTFLoader: Missing camera parameters.' );
			return;

		}

		if ( cameraDef.type === 'perspective' ) {

			camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.radToDeg( params.yfov ), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6 );

		} else if ( cameraDef.type === 'orthographic' ) {

			camera = new three__WEBPACK_IMPORTED_MODULE_0__.OrthographicCamera( - params.xmag, params.xmag, params.ymag, - params.ymag, params.znear, params.zfar );

		}

		if ( cameraDef.name ) camera.name = this.createUniqueName( cameraDef.name );

		assignExtrasToUserData( camera, cameraDef );

		return Promise.resolve( camera );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
	 * @param {number} skinIndex
	 * @return {Promise<Object>}
	 */
	loadSkin( skinIndex ) {

		const skinDef = this.json.skins[ skinIndex ];

		const skinEntry = { joints: skinDef.joints };

		if ( skinDef.inverseBindMatrices === undefined ) {

			return Promise.resolve( skinEntry );

		}

		return this.getDependency( 'accessor', skinDef.inverseBindMatrices ).then( function ( accessor ) {

			skinEntry.inverseBindMatrices = accessor;

			return skinEntry;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
	 * @param {number} animationIndex
	 * @return {Promise<AnimationClip>}
	 */
	loadAnimation( animationIndex ) {

		const json = this.json;

		const animationDef = json.animations[ animationIndex ];

		const pendingNodes = [];
		const pendingInputAccessors = [];
		const pendingOutputAccessors = [];
		const pendingSamplers = [];
		const pendingTargets = [];

		for ( let i = 0, il = animationDef.channels.length; i < il; i ++ ) {

			const channel = animationDef.channels[ i ];
			const sampler = animationDef.samplers[ channel.sampler ];
			const target = channel.target;
			const name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
			const input = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.input ] : sampler.input;
			const output = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.output ] : sampler.output;

			pendingNodes.push( this.getDependency( 'node', name ) );
			pendingInputAccessors.push( this.getDependency( 'accessor', input ) );
			pendingOutputAccessors.push( this.getDependency( 'accessor', output ) );
			pendingSamplers.push( sampler );
			pendingTargets.push( target );

		}

		return Promise.all( [

			Promise.all( pendingNodes ),
			Promise.all( pendingInputAccessors ),
			Promise.all( pendingOutputAccessors ),
			Promise.all( pendingSamplers ),
			Promise.all( pendingTargets )

		] ).then( function ( dependencies ) {

			const nodes = dependencies[ 0 ];
			const inputAccessors = dependencies[ 1 ];
			const outputAccessors = dependencies[ 2 ];
			const samplers = dependencies[ 3 ];
			const targets = dependencies[ 4 ];

			const tracks = [];

			for ( let i = 0, il = nodes.length; i < il; i ++ ) {

				const node = nodes[ i ];
				const inputAccessor = inputAccessors[ i ];
				const outputAccessor = outputAccessors[ i ];
				const sampler = samplers[ i ];
				const target = targets[ i ];

				if ( node === undefined ) continue;

				node.updateMatrix();
				node.matrixAutoUpdate = true;

				let TypedKeyframeTrack;

				switch ( PATH_PROPERTIES[ target.path ] ) {

					case PATH_PROPERTIES.weights:

						TypedKeyframeTrack = three__WEBPACK_IMPORTED_MODULE_0__.NumberKeyframeTrack;
						break;

					case PATH_PROPERTIES.rotation:

						TypedKeyframeTrack = three__WEBPACK_IMPORTED_MODULE_0__.QuaternionKeyframeTrack;
						break;

					case PATH_PROPERTIES.position:
					case PATH_PROPERTIES.scale:
					default:

						TypedKeyframeTrack = three__WEBPACK_IMPORTED_MODULE_0__.VectorKeyframeTrack;
						break;

				}

				const targetName = node.name ? node.name : node.uuid;

				const interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : three__WEBPACK_IMPORTED_MODULE_0__.InterpolateLinear;

				const targetNames = [];

				if ( PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.weights ) {

					// Node may be a Group (glTF mesh with several primitives) or a Mesh.
					node.traverse( function ( object ) {

						if ( object.isMesh === true && object.morphTargetInfluences ) {

							targetNames.push( object.name ? object.name : object.uuid );

						}

					} );

				} else {

					targetNames.push( targetName );

				}

				let outputArray = outputAccessor.array;

				if ( outputAccessor.normalized ) {

					const scale = getNormalizedComponentScale( outputArray.constructor );
					const scaled = new Float32Array( outputArray.length );

					for ( let j = 0, jl = outputArray.length; j < jl; j ++ ) {

						scaled[ j ] = outputArray[ j ] * scale;

					}

					outputArray = scaled;

				}

				for ( let j = 0, jl = targetNames.length; j < jl; j ++ ) {

					const track = new TypedKeyframeTrack(
						targetNames[ j ] + '.' + PATH_PROPERTIES[ target.path ],
						inputAccessor.array,
						outputArray,
						interpolation
					);

					// Override interpolation with custom factory method.
					if ( sampler.interpolation === 'CUBICSPLINE' ) {

						track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline( result ) {

							// A CUBICSPLINE keyframe in glTF has three output values for each input value,
							// representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
							// must be divided by three to get the interpolant's sampleSize argument.

							const interpolantType = ( this instanceof three__WEBPACK_IMPORTED_MODULE_0__.QuaternionKeyframeTrack ) ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant;

							return new interpolantType( this.times, this.values, this.getValueSize() / 3, result );

						};

						// Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
						track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;

					}

					tracks.push( track );

				}

			}

			const name = animationDef.name ? animationDef.name : 'animation_' + animationIndex;

			return new three__WEBPACK_IMPORTED_MODULE_0__.AnimationClip( name, undefined, tracks );

		} );

	}

	createNodeMesh( nodeIndex ) {

		const json = this.json;
		const parser = this;
		const nodeDef = json.nodes[ nodeIndex ];

		if ( nodeDef.mesh === undefined ) return null;

		return parser.getDependency( 'mesh', nodeDef.mesh ).then( function ( mesh ) {

			const node = parser._getNodeRef( parser.meshCache, nodeDef.mesh, mesh );

			// if weights are provided on the node, override weights on the mesh.
			if ( nodeDef.weights !== undefined ) {

				node.traverse( function ( o ) {

					if ( ! o.isMesh ) return;

					for ( let i = 0, il = nodeDef.weights.length; i < il; i ++ ) {

						o.morphTargetInfluences[ i ] = nodeDef.weights[ i ];

					}

				} );

			}

			return node;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
	 * @param {number} nodeIndex
	 * @return {Promise<Object3D>}
	 */
	loadNode( nodeIndex ) {

		const json = this.json;
		const extensions = this.extensions;
		const parser = this;

		const nodeDef = json.nodes[ nodeIndex ];

		// reserve node's name before its dependencies, so the root has the intended name.
		const nodeName = nodeDef.name ? parser.createUniqueName( nodeDef.name ) : '';

		return ( function () {

			const pending = [];

			const meshPromise = parser._invokeOne( function ( ext ) {

				return ext.createNodeMesh && ext.createNodeMesh( nodeIndex );

			} );

			if ( meshPromise ) {

				pending.push( meshPromise );

			}

			if ( nodeDef.camera !== undefined ) {

				pending.push( parser.getDependency( 'camera', nodeDef.camera ).then( function ( camera ) {

					return parser._getNodeRef( parser.cameraCache, nodeDef.camera, camera );

				} ) );

			}

			parser._invokeAll( function ( ext ) {

				return ext.createNodeAttachment && ext.createNodeAttachment( nodeIndex );

			} ).forEach( function ( promise ) {

				pending.push( promise );

			} );

			return Promise.all( pending );

		}() ).then( function ( objects ) {

			let node;

			// .isBone isn't in glTF spec. See ._markDefs
			if ( nodeDef.isBone === true ) {

				node = new three__WEBPACK_IMPORTED_MODULE_0__.Bone();

			} else if ( objects.length > 1 ) {

				node = new three__WEBPACK_IMPORTED_MODULE_0__.Group();

			} else if ( objects.length === 1 ) {

				node = objects[ 0 ];

			} else {

				node = new three__WEBPACK_IMPORTED_MODULE_0__.Object3D();

			}

			if ( node !== objects[ 0 ] ) {

				for ( let i = 0, il = objects.length; i < il; i ++ ) {

					node.add( objects[ i ] );

				}

			}

			if ( nodeDef.name ) {

				node.userData.name = nodeDef.name;
				node.name = nodeName;

			}

			assignExtrasToUserData( node, nodeDef );

			if ( nodeDef.extensions ) addUnknownExtensionsToUserData( extensions, node, nodeDef );

			if ( nodeDef.matrix !== undefined ) {

				const matrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
				matrix.fromArray( nodeDef.matrix );
				node.applyMatrix4( matrix );

			} else {

				if ( nodeDef.translation !== undefined ) {

					node.position.fromArray( nodeDef.translation );

				}

				if ( nodeDef.rotation !== undefined ) {

					node.quaternion.fromArray( nodeDef.rotation );

				}

				if ( nodeDef.scale !== undefined ) {

					node.scale.fromArray( nodeDef.scale );

				}

			}

			parser.associations.set( node, { type: 'nodes', index: nodeIndex } );

			return node;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
	 * @param {number} sceneIndex
	 * @return {Promise<Group>}
	 */
	loadScene( sceneIndex ) {

		const json = this.json;
		const extensions = this.extensions;
		const sceneDef = this.json.scenes[ sceneIndex ];
		const parser = this;

		// Loader returns Group, not Scene.
		// See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
		const scene = new three__WEBPACK_IMPORTED_MODULE_0__.Group();
		if ( sceneDef.name ) scene.name = parser.createUniqueName( sceneDef.name );

		assignExtrasToUserData( scene, sceneDef );

		if ( sceneDef.extensions ) addUnknownExtensionsToUserData( extensions, scene, sceneDef );

		const nodeIds = sceneDef.nodes || [];

		const pending = [];

		for ( let i = 0, il = nodeIds.length; i < il; i ++ ) {

			pending.push( buildNodeHierachy( nodeIds[ i ], scene, json, parser ) );

		}

		return Promise.all( pending ).then( function () {

			return scene;

		} );

	}

}

function buildNodeHierachy( nodeId, parentObject, json, parser ) {

	const nodeDef = json.nodes[ nodeId ];

	return parser.getDependency( 'node', nodeId ).then( function ( node ) {

		if ( nodeDef.skin === undefined ) return node;

		// build skeleton here as well

		let skinEntry;

		return parser.getDependency( 'skin', nodeDef.skin ).then( function ( skin ) {

			skinEntry = skin;

			const pendingJoints = [];

			for ( let i = 0, il = skinEntry.joints.length; i < il; i ++ ) {

				pendingJoints.push( parser.getDependency( 'node', skinEntry.joints[ i ] ) );

			}

			return Promise.all( pendingJoints );

		} ).then( function ( jointNodes ) {

			node.traverse( function ( mesh ) {

				if ( ! mesh.isMesh ) return;

				const bones = [];
				const boneInverses = [];

				for ( let j = 0, jl = jointNodes.length; j < jl; j ++ ) {

					const jointNode = jointNodes[ j ];

					if ( jointNode ) {

						bones.push( jointNode );

						const mat = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

						if ( skinEntry.inverseBindMatrices !== undefined ) {

							mat.fromArray( skinEntry.inverseBindMatrices.array, j * 16 );

						}

						boneInverses.push( mat );

					} else {

						console.warn( 'THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[ j ] );

					}

				}

				mesh.bind( new three__WEBPACK_IMPORTED_MODULE_0__.Skeleton( bones, boneInverses ), mesh.matrixWorld );

			} );

			return node;

		} );

	} ).then( function ( node ) {

		// build node hierachy

		parentObject.add( node );

		const pending = [];

		if ( nodeDef.children ) {

			const children = nodeDef.children;

			for ( let i = 0, il = children.length; i < il; i ++ ) {

				const child = children[ i ];
				pending.push( buildNodeHierachy( child, node, json, parser ) );

			}

		}

		return Promise.all( pending );

	} );

}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 */
function computeBounds( geometry, primitiveDef, parser ) {

	const attributes = primitiveDef.attributes;

	const box = new three__WEBPACK_IMPORTED_MODULE_0__.Box3();

	if ( attributes.POSITION !== undefined ) {

		const accessor = parser.json.accessors[ attributes.POSITION ];

		const min = accessor.min;
		const max = accessor.max;

		// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

		if ( min !== undefined && max !== undefined ) {

			box.set(
				new three__WEBPACK_IMPORTED_MODULE_0__.Vector3( min[ 0 ], min[ 1 ], min[ 2 ] ),
				new three__WEBPACK_IMPORTED_MODULE_0__.Vector3( max[ 0 ], max[ 1 ], max[ 2 ] )
			);

			if ( accessor.normalized ) {

				const boxScale = getNormalizedComponentScale( WEBGL_COMPONENT_TYPES[ accessor.componentType ] );
				box.min.multiplyScalar( boxScale );
				box.max.multiplyScalar( boxScale );

			}

		} else {

			console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

			return;

		}

	} else {

		return;

	}

	const targets = primitiveDef.targets;

	if ( targets !== undefined ) {

		const maxDisplacement = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
		const vector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

		for ( let i = 0, il = targets.length; i < il; i ++ ) {

			const target = targets[ i ];

			if ( target.POSITION !== undefined ) {

				const accessor = parser.json.accessors[ target.POSITION ];
				const min = accessor.min;
				const max = accessor.max;

				// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

				if ( min !== undefined && max !== undefined ) {

					// we need to get max of absolute components because target weight is [-1,1]
					vector.setX( Math.max( Math.abs( min[ 0 ] ), Math.abs( max[ 0 ] ) ) );
					vector.setY( Math.max( Math.abs( min[ 1 ] ), Math.abs( max[ 1 ] ) ) );
					vector.setZ( Math.max( Math.abs( min[ 2 ] ), Math.abs( max[ 2 ] ) ) );


					if ( accessor.normalized ) {

						const boxScale = getNormalizedComponentScale( WEBGL_COMPONENT_TYPES[ accessor.componentType ] );
						vector.multiplyScalar( boxScale );

					}

					// Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
					// to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
					// are used to implement key-frame animations and as such only two are active at a time - this results in very large
					// boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
					maxDisplacement.max( vector );

				} else {

					console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

				}

			}

		}

		// As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
		box.expandByVector( maxDisplacement );

	}

	geometry.boundingBox = box;

	const sphere = new three__WEBPACK_IMPORTED_MODULE_0__.Sphere();

	box.getCenter( sphere.center );
	sphere.radius = box.min.distanceTo( box.max ) / 2;

	geometry.boundingSphere = sphere;

}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
function addPrimitiveAttributes( geometry, primitiveDef, parser ) {

	const attributes = primitiveDef.attributes;

	const pending = [];

	function assignAttributeAccessor( accessorIndex, attributeName ) {

		return parser.getDependency( 'accessor', accessorIndex )
			.then( function ( accessor ) {

				geometry.setAttribute( attributeName, accessor );

			} );

	}

	for ( const gltfAttributeName in attributes ) {

		const threeAttributeName = ATTRIBUTES[ gltfAttributeName ] || gltfAttributeName.toLowerCase();

		// Skip attributes already provided by e.g. Draco extension.
		if ( threeAttributeName in geometry.attributes ) continue;

		pending.push( assignAttributeAccessor( attributes[ gltfAttributeName ], threeAttributeName ) );

	}

	if ( primitiveDef.indices !== undefined && ! geometry.index ) {

		const accessor = parser.getDependency( 'accessor', primitiveDef.indices ).then( function ( accessor ) {

			geometry.setIndex( accessor );

		} );

		pending.push( accessor );

	}

	assignExtrasToUserData( geometry, primitiveDef );

	computeBounds( geometry, primitiveDef, parser );

	return Promise.all( pending ).then( function () {

		return primitiveDef.targets !== undefined
			? addMorphTargets( geometry, primitiveDef.targets, parser )
			: geometry;

	} );

}

/**
 * @param {BufferGeometry} geometry
 * @param {Number} drawMode
 * @return {BufferGeometry}
 */
function toTrianglesDrawMode( geometry, drawMode ) {

	let index = geometry.getIndex();

	// generate index if not present

	if ( index === null ) {

		const indices = [];

		const position = geometry.getAttribute( 'position' );

		if ( position !== undefined ) {

			for ( let i = 0; i < position.count; i ++ ) {

				indices.push( i );

			}

			geometry.setIndex( indices );
			index = geometry.getIndex();

		} else {

			console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
			return geometry;

		}

	}

	//

	const numberOfTriangles = index.count - 2;
	const newIndices = [];

	if ( drawMode === three__WEBPACK_IMPORTED_MODULE_0__.TriangleFanDrawMode ) {

		// gl.TRIANGLE_FAN

		for ( let i = 1; i <= numberOfTriangles; i ++ ) {

			newIndices.push( index.getX( 0 ) );
			newIndices.push( index.getX( i ) );
			newIndices.push( index.getX( i + 1 ) );

		}

	} else {

		// gl.TRIANGLE_STRIP

		for ( let i = 0; i < numberOfTriangles; i ++ ) {

			if ( i % 2 === 0 ) {

				newIndices.push( index.getX( i ) );
				newIndices.push( index.getX( i + 1 ) );
				newIndices.push( index.getX( i + 2 ) );


			} else {

				newIndices.push( index.getX( i + 2 ) );
				newIndices.push( index.getX( i + 1 ) );
				newIndices.push( index.getX( i ) );

			}

		}

	}

	if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

		console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

	}

	// build final geometry

	const newGeometry = geometry.clone();
	newGeometry.setIndex( newIndices );

	return newGeometry;

}




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWxwLy4vbm9kZV9tb2R1bGVzL3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL0dMVEZMb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFnRWU7O0FBRWYseUJBQXlCLHlDQUFNOztBQUUvQjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQSxHQUFHOztBQUVILGtCQUFrQiw2REFBMEI7O0FBRTVDOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxxQkFBcUIsNkNBQVU7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUwsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7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QTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsU0FBUyx1REFBb0I7O0FBRTdCOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxTQUFTLHVEQUFvQjs7QUFFN0I7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLHVDQUF1Qyx3Q0FBSzs7QUFFNUM7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxTQUFTLHVEQUFvQjs7QUFFN0I7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLFNBQVMsdURBQW9COztBQUU3Qjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0Esb0NBQW9DLHdDQUFLOztBQUV6Qzs7QUFFQTs7QUFFQSx1QkFBdUIsK0NBQVk7O0FBRW5DLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsaUNBQWlDOztBQUVqQzs7QUFFQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxJQUFJOztBQUVKLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDOztBQUV0Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxVQUFVLHlEQUFzQjtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsbUJBQW1CLHlEQUFzQjs7QUFFekMsSUFBSTs7QUFFSjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVB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XG5cdEFuaW1hdGlvbkNsaXAsXG5cdEJvbmUsXG5cdEJveDMsXG5cdEJ1ZmZlckF0dHJpYnV0ZSxcblx0QnVmZmVyR2VvbWV0cnksXG5cdENsYW1wVG9FZGdlV3JhcHBpbmcsXG5cdENvbG9yLFxuXHREaXJlY3Rpb25hbExpZ2h0LFxuXHREb3VibGVTaWRlLFxuXHRGaWxlTG9hZGVyLFxuXHRGcm9udFNpZGUsXG5cdEdyb3VwLFxuXHRJbWFnZUJpdG1hcExvYWRlcixcblx0SW50ZXJsZWF2ZWRCdWZmZXIsXG5cdEludGVybGVhdmVkQnVmZmVyQXR0cmlidXRlLFxuXHRJbnRlcnBvbGFudCxcblx0SW50ZXJwb2xhdGVEaXNjcmV0ZSxcblx0SW50ZXJwb2xhdGVMaW5lYXIsXG5cdExpbmUsXG5cdExpbmVCYXNpY01hdGVyaWFsLFxuXHRMaW5lTG9vcCxcblx0TGluZVNlZ21lbnRzLFxuXHRMaW5lYXJGaWx0ZXIsXG5cdExpbmVhck1pcG1hcExpbmVhckZpbHRlcixcblx0TGluZWFyTWlwbWFwTmVhcmVzdEZpbHRlcixcblx0TG9hZGVyLFxuXHRMb2FkZXJVdGlscyxcblx0TWF0ZXJpYWwsXG5cdE1hdGhVdGlscyxcblx0TWF0cml4NCxcblx0TWVzaCxcblx0TWVzaEJhc2ljTWF0ZXJpYWwsXG5cdE1lc2hQaHlzaWNhbE1hdGVyaWFsLFxuXHRNZXNoU3RhbmRhcmRNYXRlcmlhbCxcblx0TWlycm9yZWRSZXBlYXRXcmFwcGluZyxcblx0TmVhcmVzdEZpbHRlcixcblx0TmVhcmVzdE1pcG1hcExpbmVhckZpbHRlcixcblx0TmVhcmVzdE1pcG1hcE5lYXJlc3RGaWx0ZXIsXG5cdE51bWJlcktleWZyYW1lVHJhY2ssXG5cdE9iamVjdDNELFxuXHRPcnRob2dyYXBoaWNDYW1lcmEsXG5cdFBlcnNwZWN0aXZlQ2FtZXJhLFxuXHRQb2ludExpZ2h0LFxuXHRQb2ludHMsXG5cdFBvaW50c01hdGVyaWFsLFxuXHRQcm9wZXJ0eUJpbmRpbmcsXG5cdFF1YXRlcm5pb24sXG5cdFF1YXRlcm5pb25LZXlmcmFtZVRyYWNrLFxuXHRSR0JGb3JtYXQsXG5cdFJlcGVhdFdyYXBwaW5nLFxuXHRTa2VsZXRvbixcblx0U2tpbm5lZE1lc2gsXG5cdFNwaGVyZSxcblx0U3BvdExpZ2h0LFxuXHRUYW5nZW50U3BhY2VOb3JtYWxNYXAsXG5cdFRleHR1cmUsXG5cdFRleHR1cmVMb2FkZXIsXG5cdFRyaWFuZ2xlRmFuRHJhd01vZGUsXG5cdFRyaWFuZ2xlU3RyaXBEcmF3TW9kZSxcblx0VmVjdG9yMixcblx0VmVjdG9yMyxcblx0VmVjdG9yS2V5ZnJhbWVUcmFjayxcblx0c1JHQkVuY29kaW5nXG59IGZyb20gJ3RocmVlJztcblxuY2xhc3MgR0xURkxvYWRlciBleHRlbmRzIExvYWRlciB7XG5cblx0Y29uc3RydWN0b3IoIG1hbmFnZXIgKSB7XG5cblx0XHRzdXBlciggbWFuYWdlciApO1xuXG5cdFx0dGhpcy5kcmFjb0xvYWRlciA9IG51bGw7XG5cdFx0dGhpcy5rdHgyTG9hZGVyID0gbnVsbDtcblx0XHR0aGlzLm1lc2hvcHREZWNvZGVyID0gbnVsbDtcblxuXHRcdHRoaXMucGx1Z2luQ2FsbGJhY2tzID0gW107XG5cblx0XHR0aGlzLnJlZ2lzdGVyKCBmdW5jdGlvbiAoIHBhcnNlciApIHtcblxuXHRcdFx0cmV0dXJuIG5ldyBHTFRGTWF0ZXJpYWxzQ2xlYXJjb2F0RXh0ZW5zaW9uKCBwYXJzZXIgKTtcblxuXHRcdH0gKTtcblxuXHRcdHRoaXMucmVnaXN0ZXIoIGZ1bmN0aW9uICggcGFyc2VyICkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IEdMVEZUZXh0dXJlQmFzaXNVRXh0ZW5zaW9uKCBwYXJzZXIgKTtcblxuXHRcdH0gKTtcblxuXHRcdHRoaXMucmVnaXN0ZXIoIGZ1bmN0aW9uICggcGFyc2VyICkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IEdMVEZUZXh0dXJlV2ViUEV4dGVuc2lvbiggcGFyc2VyICk7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnJlZ2lzdGVyKCBmdW5jdGlvbiAoIHBhcnNlciApIHtcblxuXHRcdFx0cmV0dXJuIG5ldyBHTFRGTWF0ZXJpYWxzVHJhbnNtaXNzaW9uRXh0ZW5zaW9uKCBwYXJzZXIgKTtcblxuXHRcdH0gKTtcblxuXHRcdHRoaXMucmVnaXN0ZXIoIGZ1bmN0aW9uICggcGFyc2VyICkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IEdMVEZNYXRlcmlhbHNWb2x1bWVFeHRlbnNpb24oIHBhcnNlciApO1xuXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5yZWdpc3RlciggZnVuY3Rpb24gKCBwYXJzZXIgKSB7XG5cblx0XHRcdHJldHVybiBuZXcgR0xURk1hdGVyaWFsc0lvckV4dGVuc2lvbiggcGFyc2VyICk7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnJlZ2lzdGVyKCBmdW5jdGlvbiAoIHBhcnNlciApIHtcblxuXHRcdFx0cmV0dXJuIG5ldyBHTFRGTWF0ZXJpYWxzU3BlY3VsYXJFeHRlbnNpb24oIHBhcnNlciApO1xuXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5yZWdpc3RlciggZnVuY3Rpb24gKCBwYXJzZXIgKSB7XG5cblx0XHRcdHJldHVybiBuZXcgR0xURkxpZ2h0c0V4dGVuc2lvbiggcGFyc2VyICk7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnJlZ2lzdGVyKCBmdW5jdGlvbiAoIHBhcnNlciApIHtcblxuXHRcdFx0cmV0dXJuIG5ldyBHTFRGTWVzaG9wdENvbXByZXNzaW9uKCBwYXJzZXIgKTtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0bG9hZCggdXJsLCBvbkxvYWQsIG9uUHJvZ3Jlc3MsIG9uRXJyb3IgKSB7XG5cblx0XHRjb25zdCBzY29wZSA9IHRoaXM7XG5cblx0XHRsZXQgcmVzb3VyY2VQYXRoO1xuXG5cdFx0aWYgKCB0aGlzLnJlc291cmNlUGF0aCAhPT0gJycgKSB7XG5cblx0XHRcdHJlc291cmNlUGF0aCA9IHRoaXMucmVzb3VyY2VQYXRoO1xuXG5cdFx0fSBlbHNlIGlmICggdGhpcy5wYXRoICE9PSAnJyApIHtcblxuXHRcdFx0cmVzb3VyY2VQYXRoID0gdGhpcy5wYXRoO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0cmVzb3VyY2VQYXRoID0gTG9hZGVyVXRpbHMuZXh0cmFjdFVybEJhc2UoIHVybCApO1xuXG5cdFx0fVxuXG5cdFx0Ly8gVGVsbHMgdGhlIExvYWRpbmdNYW5hZ2VyIHRvIHRyYWNrIGFuIGV4dHJhIGl0ZW0sIHdoaWNoIHJlc29sdmVzIGFmdGVyXG5cdFx0Ly8gdGhlIG1vZGVsIGlzIGZ1bGx5IGxvYWRlZC4gVGhpcyBtZWFucyB0aGUgY291bnQgb2YgaXRlbXMgbG9hZGVkIHdpbGxcblx0XHQvLyBiZSBpbmNvcnJlY3QsIGJ1dCBlbnN1cmVzIG1hbmFnZXIub25Mb2FkKCkgZG9lcyBub3QgZmlyZSBlYXJseS5cblx0XHR0aGlzLm1hbmFnZXIuaXRlbVN0YXJ0KCB1cmwgKTtcblxuXHRcdGNvbnN0IF9vbkVycm9yID0gZnVuY3Rpb24gKCBlICkge1xuXG5cdFx0XHRpZiAoIG9uRXJyb3IgKSB7XG5cblx0XHRcdFx0b25FcnJvciggZSApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoIGUgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRzY29wZS5tYW5hZ2VyLml0ZW1FcnJvciggdXJsICk7XG5cdFx0XHRzY29wZS5tYW5hZ2VyLml0ZW1FbmQoIHVybCApO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IGxvYWRlciA9IG5ldyBGaWxlTG9hZGVyKCB0aGlzLm1hbmFnZXIgKTtcblxuXHRcdGxvYWRlci5zZXRQYXRoKCB0aGlzLnBhdGggKTtcblx0XHRsb2FkZXIuc2V0UmVzcG9uc2VUeXBlKCAnYXJyYXlidWZmZXInICk7XG5cdFx0bG9hZGVyLnNldFJlcXVlc3RIZWFkZXIoIHRoaXMucmVxdWVzdEhlYWRlciApO1xuXHRcdGxvYWRlci5zZXRXaXRoQ3JlZGVudGlhbHMoIHRoaXMud2l0aENyZWRlbnRpYWxzICk7XG5cblx0XHRsb2FkZXIubG9hZCggdXJsLCBmdW5jdGlvbiAoIGRhdGEgKSB7XG5cblx0XHRcdHRyeSB7XG5cblx0XHRcdFx0c2NvcGUucGFyc2UoIGRhdGEsIHJlc291cmNlUGF0aCwgZnVuY3Rpb24gKCBnbHRmICkge1xuXG5cdFx0XHRcdFx0b25Mb2FkKCBnbHRmICk7XG5cblx0XHRcdFx0XHRzY29wZS5tYW5hZ2VyLml0ZW1FbmQoIHVybCApO1xuXG5cdFx0XHRcdH0sIF9vbkVycm9yICk7XG5cblx0XHRcdH0gY2F0Y2ggKCBlICkge1xuXG5cdFx0XHRcdF9vbkVycm9yKCBlICk7XG5cblx0XHRcdH1cblxuXHRcdH0sIG9uUHJvZ3Jlc3MsIF9vbkVycm9yICk7XG5cblx0fVxuXG5cdHNldERSQUNPTG9hZGVyKCBkcmFjb0xvYWRlciApIHtcblxuXHRcdHRoaXMuZHJhY29Mb2FkZXIgPSBkcmFjb0xvYWRlcjtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0c2V0RERTTG9hZGVyKCkge1xuXG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXG5cdFx0XHQnVEhSRUUuR0xURkxvYWRlcjogXCJNU0ZUX3RleHR1cmVfZGRzXCIgbm8gbG9uZ2VyIHN1cHBvcnRlZC4gUGxlYXNlIHVwZGF0ZSB0byBcIktIUl90ZXh0dXJlX2Jhc2lzdVwiLidcblxuXHRcdCk7XG5cblx0fVxuXG5cdHNldEtUWDJMb2FkZXIoIGt0eDJMb2FkZXIgKSB7XG5cblx0XHR0aGlzLmt0eDJMb2FkZXIgPSBrdHgyTG9hZGVyO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRzZXRNZXNob3B0RGVjb2RlciggbWVzaG9wdERlY29kZXIgKSB7XG5cblx0XHR0aGlzLm1lc2hvcHREZWNvZGVyID0gbWVzaG9wdERlY29kZXI7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHJlZ2lzdGVyKCBjYWxsYmFjayApIHtcblxuXHRcdGlmICggdGhpcy5wbHVnaW5DYWxsYmFja3MuaW5kZXhPZiggY2FsbGJhY2sgKSA9PT0gLSAxICkge1xuXG5cdFx0XHR0aGlzLnBsdWdpbkNhbGxiYWNrcy5wdXNoKCBjYWxsYmFjayApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHVucmVnaXN0ZXIoIGNhbGxiYWNrICkge1xuXG5cdFx0aWYgKCB0aGlzLnBsdWdpbkNhbGxiYWNrcy5pbmRleE9mKCBjYWxsYmFjayApICE9PSAtIDEgKSB7XG5cblx0XHRcdHRoaXMucGx1Z2luQ2FsbGJhY2tzLnNwbGljZSggdGhpcy5wbHVnaW5DYWxsYmFja3MuaW5kZXhPZiggY2FsbGJhY2sgKSwgMSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHBhcnNlKCBkYXRhLCBwYXRoLCBvbkxvYWQsIG9uRXJyb3IgKSB7XG5cblx0XHRsZXQgY29udGVudDtcblx0XHRjb25zdCBleHRlbnNpb25zID0ge307XG5cdFx0Y29uc3QgcGx1Z2lucyA9IHt9O1xuXG5cdFx0aWYgKCB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycgKSB7XG5cblx0XHRcdGNvbnRlbnQgPSBkYXRhO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Y29uc3QgbWFnaWMgPSBMb2FkZXJVdGlscy5kZWNvZGVUZXh0KCBuZXcgVWludDhBcnJheSggZGF0YSwgMCwgNCApICk7XG5cblx0XHRcdGlmICggbWFnaWMgPT09IEJJTkFSWV9FWFRFTlNJT05fSEVBREVSX01BR0lDICkge1xuXG5cdFx0XHRcdHRyeSB7XG5cblx0XHRcdFx0XHRleHRlbnNpb25zWyBFWFRFTlNJT05TLktIUl9CSU5BUllfR0xURiBdID0gbmV3IEdMVEZCaW5hcnlFeHRlbnNpb24oIGRhdGEgKTtcblxuXHRcdFx0XHR9IGNhdGNoICggZXJyb3IgKSB7XG5cblx0XHRcdFx0XHRpZiAoIG9uRXJyb3IgKSBvbkVycm9yKCBlcnJvciApO1xuXHRcdFx0XHRcdHJldHVybjtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29udGVudCA9IGV4dGVuc2lvbnNbIEVYVEVOU0lPTlMuS0hSX0JJTkFSWV9HTFRGIF0uY29udGVudDtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRjb250ZW50ID0gTG9hZGVyVXRpbHMuZGVjb2RlVGV4dCggbmV3IFVpbnQ4QXJyYXkoIGRhdGEgKSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRjb25zdCBqc29uID0gSlNPTi5wYXJzZSggY29udGVudCApO1xuXG5cdFx0aWYgKCBqc29uLmFzc2V0ID09PSB1bmRlZmluZWQgfHwganNvbi5hc3NldC52ZXJzaW9uWyAwIF0gPCAyICkge1xuXG5cdFx0XHRpZiAoIG9uRXJyb3IgKSBvbkVycm9yKCBuZXcgRXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBVbnN1cHBvcnRlZCBhc3NldC4gZ2xURiB2ZXJzaW9ucyA+PTIuMCBhcmUgc3VwcG9ydGVkLicgKSApO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgcGFyc2VyID0gbmV3IEdMVEZQYXJzZXIoIGpzb24sIHtcblxuXHRcdFx0cGF0aDogcGF0aCB8fCB0aGlzLnJlc291cmNlUGF0aCB8fCAnJyxcblx0XHRcdGNyb3NzT3JpZ2luOiB0aGlzLmNyb3NzT3JpZ2luLFxuXHRcdFx0cmVxdWVzdEhlYWRlcjogdGhpcy5yZXF1ZXN0SGVhZGVyLFxuXHRcdFx0bWFuYWdlcjogdGhpcy5tYW5hZ2VyLFxuXHRcdFx0a3R4MkxvYWRlcjogdGhpcy5rdHgyTG9hZGVyLFxuXHRcdFx0bWVzaG9wdERlY29kZXI6IHRoaXMubWVzaG9wdERlY29kZXJcblxuXHRcdH0gKTtcblxuXHRcdHBhcnNlci5maWxlTG9hZGVyLnNldFJlcXVlc3RIZWFkZXIoIHRoaXMucmVxdWVzdEhlYWRlciApO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wbHVnaW5DYWxsYmFja3MubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCBwbHVnaW4gPSB0aGlzLnBsdWdpbkNhbGxiYWNrc1sgaSBdKCBwYXJzZXIgKTtcblx0XHRcdHBsdWdpbnNbIHBsdWdpbi5uYW1lIF0gPSBwbHVnaW47XG5cblx0XHRcdC8vIFdvcmthcm91bmQgdG8gYXZvaWQgZGV0ZXJtaW5pbmcgYXMgdW5rbm93biBleHRlbnNpb25cblx0XHRcdC8vIGluIGFkZFVua25vd25FeHRlbnNpb25zVG9Vc2VyRGF0YSgpLlxuXHRcdFx0Ly8gUmVtb3ZlIHRoaXMgd29ya2Fyb3VuZCBpZiB3ZSBtb3ZlIGFsbCB0aGUgZXhpc3Rpbmdcblx0XHRcdC8vIGV4dGVuc2lvbiBoYW5kbGVycyB0byBwbHVnaW4gc3lzdGVtXG5cdFx0XHRleHRlbnNpb25zWyBwbHVnaW4ubmFtZSBdID0gdHJ1ZTtcblxuXHRcdH1cblxuXHRcdGlmICgganNvbi5leHRlbnNpb25zVXNlZCApIHtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwganNvbi5leHRlbnNpb25zVXNlZC5sZW5ndGg7ICsrIGkgKSB7XG5cblx0XHRcdFx0Y29uc3QgZXh0ZW5zaW9uTmFtZSA9IGpzb24uZXh0ZW5zaW9uc1VzZWRbIGkgXTtcblx0XHRcdFx0Y29uc3QgZXh0ZW5zaW9uc1JlcXVpcmVkID0ganNvbi5leHRlbnNpb25zUmVxdWlyZWQgfHwgW107XG5cblx0XHRcdFx0c3dpdGNoICggZXh0ZW5zaW9uTmFtZSApIHtcblxuXHRcdFx0XHRcdGNhc2UgRVhURU5TSU9OUy5LSFJfTUFURVJJQUxTX1VOTElUOlxuXHRcdFx0XHRcdFx0ZXh0ZW5zaW9uc1sgZXh0ZW5zaW9uTmFtZSBdID0gbmV3IEdMVEZNYXRlcmlhbHNVbmxpdEV4dGVuc2lvbigpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIEVYVEVOU0lPTlMuS0hSX01BVEVSSUFMU19QQlJfU1BFQ1VMQVJfR0xPU1NJTkVTUzpcblx0XHRcdFx0XHRcdGV4dGVuc2lvbnNbIGV4dGVuc2lvbk5hbWUgXSA9IG5ldyBHTFRGTWF0ZXJpYWxzUGJyU3BlY3VsYXJHbG9zc2luZXNzRXh0ZW5zaW9uKCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgRVhURU5TSU9OUy5LSFJfRFJBQ09fTUVTSF9DT01QUkVTU0lPTjpcblx0XHRcdFx0XHRcdGV4dGVuc2lvbnNbIGV4dGVuc2lvbk5hbWUgXSA9IG5ldyBHTFRGRHJhY29NZXNoQ29tcHJlc3Npb25FeHRlbnNpb24oIGpzb24sIHRoaXMuZHJhY29Mb2FkZXIgKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSBFWFRFTlNJT05TLktIUl9URVhUVVJFX1RSQU5TRk9STTpcblx0XHRcdFx0XHRcdGV4dGVuc2lvbnNbIGV4dGVuc2lvbk5hbWUgXSA9IG5ldyBHTFRGVGV4dHVyZVRyYW5zZm9ybUV4dGVuc2lvbigpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIEVYVEVOU0lPTlMuS0hSX01FU0hfUVVBTlRJWkFUSU9OOlxuXHRcdFx0XHRcdFx0ZXh0ZW5zaW9uc1sgZXh0ZW5zaW9uTmFtZSBdID0gbmV3IEdMVEZNZXNoUXVhbnRpemF0aW9uRXh0ZW5zaW9uKCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0XHRcdGlmICggZXh0ZW5zaW9uc1JlcXVpcmVkLmluZGV4T2YoIGV4dGVuc2lvbk5hbWUgKSA+PSAwICYmIHBsdWdpbnNbIGV4dGVuc2lvbk5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkdMVEZMb2FkZXI6IFVua25vd24gZXh0ZW5zaW9uIFwiJyArIGV4dGVuc2lvbk5hbWUgKyAnXCIuJyApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRwYXJzZXIuc2V0RXh0ZW5zaW9ucyggZXh0ZW5zaW9ucyApO1xuXHRcdHBhcnNlci5zZXRQbHVnaW5zKCBwbHVnaW5zICk7XG5cdFx0cGFyc2VyLnBhcnNlKCBvbkxvYWQsIG9uRXJyb3IgKTtcblxuXHR9XG5cbn1cblxuLyogR0xURlJFR0lTVFJZICovXG5cbmZ1bmN0aW9uIEdMVEZSZWdpc3RyeSgpIHtcblxuXHRsZXQgb2JqZWN0cyA9IHt9O1xuXG5cdHJldHVyblx0e1xuXG5cdFx0Z2V0OiBmdW5jdGlvbiAoIGtleSApIHtcblxuXHRcdFx0cmV0dXJuIG9iamVjdHNbIGtleSBdO1xuXG5cdFx0fSxcblxuXHRcdGFkZDogZnVuY3Rpb24gKCBrZXksIG9iamVjdCApIHtcblxuXHRcdFx0b2JqZWN0c1sga2V5IF0gPSBvYmplY3Q7XG5cblx0XHR9LFxuXG5cdFx0cmVtb3ZlOiBmdW5jdGlvbiAoIGtleSApIHtcblxuXHRcdFx0ZGVsZXRlIG9iamVjdHNbIGtleSBdO1xuXG5cdFx0fSxcblxuXHRcdHJlbW92ZUFsbDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRvYmplY3RzID0ge307XG5cblx0XHR9XG5cblx0fTtcblxufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKioqKiogRVhURU5TSU9OUyAqKioqKioqKioqKi9cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmNvbnN0IEVYVEVOU0lPTlMgPSB7XG5cdEtIUl9CSU5BUllfR0xURjogJ0tIUl9iaW5hcnlfZ2xURicsXG5cdEtIUl9EUkFDT19NRVNIX0NPTVBSRVNTSU9OOiAnS0hSX2RyYWNvX21lc2hfY29tcHJlc3Npb24nLFxuXHRLSFJfTElHSFRTX1BVTkNUVUFMOiAnS0hSX2xpZ2h0c19wdW5jdHVhbCcsXG5cdEtIUl9NQVRFUklBTFNfQ0xFQVJDT0FUOiAnS0hSX21hdGVyaWFsc19jbGVhcmNvYXQnLFxuXHRLSFJfTUFURVJJQUxTX0lPUjogJ0tIUl9tYXRlcmlhbHNfaW9yJyxcblx0S0hSX01BVEVSSUFMU19QQlJfU1BFQ1VMQVJfR0xPU1NJTkVTUzogJ0tIUl9tYXRlcmlhbHNfcGJyU3BlY3VsYXJHbG9zc2luZXNzJyxcblx0S0hSX01BVEVSSUFMU19TUEVDVUxBUjogJ0tIUl9tYXRlcmlhbHNfc3BlY3VsYXInLFxuXHRLSFJfTUFURVJJQUxTX1RSQU5TTUlTU0lPTjogJ0tIUl9tYXRlcmlhbHNfdHJhbnNtaXNzaW9uJyxcblx0S0hSX01BVEVSSUFMU19VTkxJVDogJ0tIUl9tYXRlcmlhbHNfdW5saXQnLFxuXHRLSFJfTUFURVJJQUxTX1ZPTFVNRTogJ0tIUl9tYXRlcmlhbHNfdm9sdW1lJyxcblx0S0hSX1RFWFRVUkVfQkFTSVNVOiAnS0hSX3RleHR1cmVfYmFzaXN1Jyxcblx0S0hSX1RFWFRVUkVfVFJBTlNGT1JNOiAnS0hSX3RleHR1cmVfdHJhbnNmb3JtJyxcblx0S0hSX01FU0hfUVVBTlRJWkFUSU9OOiAnS0hSX21lc2hfcXVhbnRpemF0aW9uJyxcblx0RVhUX1RFWFRVUkVfV0VCUDogJ0VYVF90ZXh0dXJlX3dlYnAnLFxuXHRFWFRfTUVTSE9QVF9DT01QUkVTU0lPTjogJ0VYVF9tZXNob3B0X2NvbXByZXNzaW9uJ1xufTtcblxuLyoqXG4gKiBQdW5jdHVhbCBMaWdodHMgRXh0ZW5zaW9uXG4gKlxuICogU3BlY2lmaWNhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL2V4dGVuc2lvbnMvMi4wL0tocm9ub3MvS0hSX2xpZ2h0c19wdW5jdHVhbFxuICovXG5jbGFzcyBHTFRGTGlnaHRzRXh0ZW5zaW9uIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyc2VyICkge1xuXG5cdFx0dGhpcy5wYXJzZXIgPSBwYXJzZXI7XG5cdFx0dGhpcy5uYW1lID0gRVhURU5TSU9OUy5LSFJfTElHSFRTX1BVTkNUVUFMO1xuXG5cdFx0Ly8gT2JqZWN0M0QgaW5zdGFuY2UgY2FjaGVzXG5cdFx0dGhpcy5jYWNoZSA9IHsgcmVmczoge30sIHVzZXM6IHt9IH07XG5cblx0fVxuXG5cdF9tYXJrRGVmcygpIHtcblxuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXMucGFyc2VyO1xuXHRcdGNvbnN0IG5vZGVEZWZzID0gdGhpcy5wYXJzZXIuanNvbi5ub2RlcyB8fCBbXTtcblxuXHRcdGZvciAoIGxldCBub2RlSW5kZXggPSAwLCBub2RlTGVuZ3RoID0gbm9kZURlZnMubGVuZ3RoOyBub2RlSW5kZXggPCBub2RlTGVuZ3RoOyBub2RlSW5kZXggKysgKSB7XG5cblx0XHRcdGNvbnN0IG5vZGVEZWYgPSBub2RlRGVmc1sgbm9kZUluZGV4IF07XG5cblx0XHRcdGlmICggbm9kZURlZi5leHRlbnNpb25zXG5cdFx0XHRcdFx0JiYgbm9kZURlZi5leHRlbnNpb25zWyB0aGlzLm5hbWUgXVxuXHRcdFx0XHRcdCYmIG5vZGVEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0ubGlnaHQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRwYXJzZXIuX2FkZE5vZGVSZWYoIHRoaXMuY2FjaGUsIG5vZGVEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0ubGlnaHQgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHRfbG9hZExpZ2h0KCBsaWdodEluZGV4ICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgY2FjaGVLZXkgPSAnbGlnaHQ6JyArIGxpZ2h0SW5kZXg7XG5cdFx0bGV0IGRlcGVuZGVuY3kgPSBwYXJzZXIuY2FjaGUuZ2V0KCBjYWNoZUtleSApO1xuXG5cdFx0aWYgKCBkZXBlbmRlbmN5ICkgcmV0dXJuIGRlcGVuZGVuY3k7XG5cblx0XHRjb25zdCBqc29uID0gcGFyc2VyLmpzb247XG5cdFx0Y29uc3QgZXh0ZW5zaW9ucyA9ICgganNvbi5leHRlbnNpb25zICYmIGpzb24uZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSB8fCB7fTtcblx0XHRjb25zdCBsaWdodERlZnMgPSBleHRlbnNpb25zLmxpZ2h0cyB8fCBbXTtcblx0XHRjb25zdCBsaWdodERlZiA9IGxpZ2h0RGVmc1sgbGlnaHRJbmRleCBdO1xuXHRcdGxldCBsaWdodE5vZGU7XG5cblx0XHRjb25zdCBjb2xvciA9IG5ldyBDb2xvciggMHhmZmZmZmYgKTtcblxuXHRcdGlmICggbGlnaHREZWYuY29sb3IgIT09IHVuZGVmaW5lZCApIGNvbG9yLmZyb21BcnJheSggbGlnaHREZWYuY29sb3IgKTtcblxuXHRcdGNvbnN0IHJhbmdlID0gbGlnaHREZWYucmFuZ2UgIT09IHVuZGVmaW5lZCA/IGxpZ2h0RGVmLnJhbmdlIDogMDtcblxuXHRcdHN3aXRjaCAoIGxpZ2h0RGVmLnR5cGUgKSB7XG5cblx0XHRcdGNhc2UgJ2RpcmVjdGlvbmFsJzpcblx0XHRcdFx0bGlnaHROb2RlID0gbmV3IERpcmVjdGlvbmFsTGlnaHQoIGNvbG9yICk7XG5cdFx0XHRcdGxpZ2h0Tm9kZS50YXJnZXQucG9zaXRpb24uc2V0KCAwLCAwLCAtIDEgKTtcblx0XHRcdFx0bGlnaHROb2RlLmFkZCggbGlnaHROb2RlLnRhcmdldCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAncG9pbnQnOlxuXHRcdFx0XHRsaWdodE5vZGUgPSBuZXcgUG9pbnRMaWdodCggY29sb3IgKTtcblx0XHRcdFx0bGlnaHROb2RlLmRpc3RhbmNlID0gcmFuZ2U7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdzcG90Jzpcblx0XHRcdFx0bGlnaHROb2RlID0gbmV3IFNwb3RMaWdodCggY29sb3IgKTtcblx0XHRcdFx0bGlnaHROb2RlLmRpc3RhbmNlID0gcmFuZ2U7XG5cdFx0XHRcdC8vIEhhbmRsZSBzcG90bGlnaHQgcHJvcGVydGllcy5cblx0XHRcdFx0bGlnaHREZWYuc3BvdCA9IGxpZ2h0RGVmLnNwb3QgfHwge307XG5cdFx0XHRcdGxpZ2h0RGVmLnNwb3QuaW5uZXJDb25lQW5nbGUgPSBsaWdodERlZi5zcG90LmlubmVyQ29uZUFuZ2xlICE9PSB1bmRlZmluZWQgPyBsaWdodERlZi5zcG90LmlubmVyQ29uZUFuZ2xlIDogMDtcblx0XHRcdFx0bGlnaHREZWYuc3BvdC5vdXRlckNvbmVBbmdsZSA9IGxpZ2h0RGVmLnNwb3Qub3V0ZXJDb25lQW5nbGUgIT09IHVuZGVmaW5lZCA/IGxpZ2h0RGVmLnNwb3Qub3V0ZXJDb25lQW5nbGUgOiBNYXRoLlBJIC8gNC4wO1xuXHRcdFx0XHRsaWdodE5vZGUuYW5nbGUgPSBsaWdodERlZi5zcG90Lm91dGVyQ29uZUFuZ2xlO1xuXHRcdFx0XHRsaWdodE5vZGUucGVudW1icmEgPSAxLjAgLSBsaWdodERlZi5zcG90LmlubmVyQ29uZUFuZ2xlIC8gbGlnaHREZWYuc3BvdC5vdXRlckNvbmVBbmdsZTtcblx0XHRcdFx0bGlnaHROb2RlLnRhcmdldC5wb3NpdGlvbi5zZXQoIDAsIDAsIC0gMSApO1xuXHRcdFx0XHRsaWdodE5vZGUuYWRkKCBsaWdodE5vZGUudGFyZ2V0ICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBVbmV4cGVjdGVkIGxpZ2h0IHR5cGU6ICcgKyBsaWdodERlZi50eXBlICk7XG5cblx0XHR9XG5cblx0XHQvLyBTb21lIGxpZ2h0cyAoZS5nLiBzcG90KSBkZWZhdWx0IHRvIGEgcG9zaXRpb24gb3RoZXIgdGhhbiB0aGUgb3JpZ2luLiBSZXNldCB0aGUgcG9zaXRpb25cblx0XHQvLyBoZXJlLCBiZWNhdXNlIG5vZGUtbGV2ZWwgcGFyc2luZyB3aWxsIG9ubHkgb3ZlcnJpZGUgcG9zaXRpb24gaWYgZXhwbGljaXRseSBzcGVjaWZpZWQuXG5cdFx0bGlnaHROb2RlLnBvc2l0aW9uLnNldCggMCwgMCwgMCApO1xuXG5cdFx0bGlnaHROb2RlLmRlY2F5ID0gMjtcblxuXHRcdGlmICggbGlnaHREZWYuaW50ZW5zaXR5ICE9PSB1bmRlZmluZWQgKSBsaWdodE5vZGUuaW50ZW5zaXR5ID0gbGlnaHREZWYuaW50ZW5zaXR5O1xuXG5cdFx0bGlnaHROb2RlLm5hbWUgPSBwYXJzZXIuY3JlYXRlVW5pcXVlTmFtZSggbGlnaHREZWYubmFtZSB8fCAoICdsaWdodF8nICsgbGlnaHRJbmRleCApICk7XG5cblx0XHRkZXBlbmRlbmN5ID0gUHJvbWlzZS5yZXNvbHZlKCBsaWdodE5vZGUgKTtcblxuXHRcdHBhcnNlci5jYWNoZS5hZGQoIGNhY2hlS2V5LCBkZXBlbmRlbmN5ICk7XG5cblx0XHRyZXR1cm4gZGVwZW5kZW5jeTtcblxuXHR9XG5cblx0Y3JlYXRlTm9kZUF0dGFjaG1lbnQoIG5vZGVJbmRleCApIHtcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXMucGFyc2VyO1xuXHRcdGNvbnN0IGpzb24gPSBwYXJzZXIuanNvbjtcblx0XHRjb25zdCBub2RlRGVmID0ganNvbi5ub2Rlc1sgbm9kZUluZGV4IF07XG5cdFx0Y29uc3QgbGlnaHREZWYgPSAoIG5vZGVEZWYuZXh0ZW5zaW9ucyAmJiBub2RlRGVmLmV4dGVuc2lvbnNbIHRoaXMubmFtZSBdICkgfHwge307XG5cdFx0Y29uc3QgbGlnaHRJbmRleCA9IGxpZ2h0RGVmLmxpZ2h0O1xuXG5cdFx0aWYgKCBsaWdodEluZGV4ID09PSB1bmRlZmluZWQgKSByZXR1cm4gbnVsbDtcblxuXHRcdHJldHVybiB0aGlzLl9sb2FkTGlnaHQoIGxpZ2h0SW5kZXggKS50aGVuKCBmdW5jdGlvbiAoIGxpZ2h0ICkge1xuXG5cdFx0XHRyZXR1cm4gcGFyc2VyLl9nZXROb2RlUmVmKCBzZWxmLmNhY2hlLCBsaWdodEluZGV4LCBsaWdodCApO1xuXG5cdFx0fSApO1xuXG5cdH1cblxufVxuXG4vKipcbiAqIFVubGl0IE1hdGVyaWFscyBFeHRlbnNpb25cbiAqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvZXh0ZW5zaW9ucy8yLjAvS2hyb25vcy9LSFJfbWF0ZXJpYWxzX3VubGl0XG4gKi9cbmNsYXNzIEdMVEZNYXRlcmlhbHNVbmxpdEV4dGVuc2lvbiB7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cblx0XHR0aGlzLm5hbWUgPSBFWFRFTlNJT05TLktIUl9NQVRFUklBTFNfVU5MSVQ7XG5cblx0fVxuXG5cdGdldE1hdGVyaWFsVHlwZSgpIHtcblxuXHRcdHJldHVybiBNZXNoQmFzaWNNYXRlcmlhbDtcblxuXHR9XG5cblx0ZXh0ZW5kUGFyYW1zKCBtYXRlcmlhbFBhcmFtcywgbWF0ZXJpYWxEZWYsIHBhcnNlciApIHtcblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdG1hdGVyaWFsUGFyYW1zLmNvbG9yID0gbmV3IENvbG9yKCAxLjAsIDEuMCwgMS4wICk7XG5cdFx0bWF0ZXJpYWxQYXJhbXMub3BhY2l0eSA9IDEuMDtcblxuXHRcdGNvbnN0IG1ldGFsbGljUm91Z2huZXNzID0gbWF0ZXJpYWxEZWYucGJyTWV0YWxsaWNSb3VnaG5lc3M7XG5cblx0XHRpZiAoIG1ldGFsbGljUm91Z2huZXNzICkge1xuXG5cdFx0XHRpZiAoIEFycmF5LmlzQXJyYXkoIG1ldGFsbGljUm91Z2huZXNzLmJhc2VDb2xvckZhY3RvciApICkge1xuXG5cdFx0XHRcdGNvbnN0IGFycmF5ID0gbWV0YWxsaWNSb3VnaG5lc3MuYmFzZUNvbG9yRmFjdG9yO1xuXG5cdFx0XHRcdG1hdGVyaWFsUGFyYW1zLmNvbG9yLmZyb21BcnJheSggYXJyYXkgKTtcblx0XHRcdFx0bWF0ZXJpYWxQYXJhbXMub3BhY2l0eSA9IGFycmF5WyAzIF07XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtZXRhbGxpY1JvdWdobmVzcy5iYXNlQ29sb3JUZXh0dXJlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0cGVuZGluZy5wdXNoKCBwYXJzZXIuYXNzaWduVGV4dHVyZSggbWF0ZXJpYWxQYXJhbXMsICdtYXAnLCBtZXRhbGxpY1JvdWdobmVzcy5iYXNlQ29sb3JUZXh0dXJlICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKCBwZW5kaW5nICk7XG5cblx0fVxuXG59XG5cbi8qKlxuICogQ2xlYXJjb2F0IE1hdGVyaWFscyBFeHRlbnNpb25cbiAqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvZXh0ZW5zaW9ucy8yLjAvS2hyb25vcy9LSFJfbWF0ZXJpYWxzX2NsZWFyY29hdFxuICovXG5jbGFzcyBHTFRGTWF0ZXJpYWxzQ2xlYXJjb2F0RXh0ZW5zaW9uIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyc2VyICkge1xuXG5cdFx0dGhpcy5wYXJzZXIgPSBwYXJzZXI7XG5cdFx0dGhpcy5uYW1lID0gRVhURU5TSU9OUy5LSFJfTUFURVJJQUxTX0NMRUFSQ09BVDtcblxuXHR9XG5cblx0Z2V0TWF0ZXJpYWxUeXBlKCBtYXRlcmlhbEluZGV4ICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSByZXR1cm4gbnVsbDtcblxuXHRcdHJldHVybiBNZXNoUGh5c2ljYWxNYXRlcmlhbDtcblxuXHR9XG5cblx0ZXh0ZW5kTWF0ZXJpYWxQYXJhbXMoIG1hdGVyaWFsSW5kZXgsIG1hdGVyaWFsUGFyYW1zICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSB7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IG1hdGVyaWFsRGVmLmV4dGVuc2lvbnNbIHRoaXMubmFtZSBdO1xuXG5cdFx0aWYgKCBleHRlbnNpb24uY2xlYXJjb2F0RmFjdG9yICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdG1hdGVyaWFsUGFyYW1zLmNsZWFyY29hdCA9IGV4dGVuc2lvbi5jbGVhcmNvYXRGYWN0b3I7XG5cblx0XHR9XG5cblx0XHRpZiAoIGV4dGVuc2lvbi5jbGVhcmNvYXRUZXh0dXJlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAnY2xlYXJjb2F0TWFwJywgZXh0ZW5zaW9uLmNsZWFyY29hdFRleHR1cmUgKSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBleHRlbnNpb24uY2xlYXJjb2F0Um91Z2huZXNzRmFjdG9yICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdG1hdGVyaWFsUGFyYW1zLmNsZWFyY29hdFJvdWdobmVzcyA9IGV4dGVuc2lvbi5jbGVhcmNvYXRSb3VnaG5lc3NGYWN0b3I7XG5cblx0XHR9XG5cblx0XHRpZiAoIGV4dGVuc2lvbi5jbGVhcmNvYXRSb3VnaG5lc3NUZXh0dXJlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAnY2xlYXJjb2F0Um91Z2huZXNzTWFwJywgZXh0ZW5zaW9uLmNsZWFyY29hdFJvdWdobmVzc1RleHR1cmUgKSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBleHRlbnNpb24uY2xlYXJjb2F0Tm9ybWFsVGV4dHVyZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRwZW5kaW5nLnB1c2goIHBhcnNlci5hc3NpZ25UZXh0dXJlKCBtYXRlcmlhbFBhcmFtcywgJ2NsZWFyY29hdE5vcm1hbE1hcCcsIGV4dGVuc2lvbi5jbGVhcmNvYXROb3JtYWxUZXh0dXJlICkgKTtcblxuXHRcdFx0aWYgKCBleHRlbnNpb24uY2xlYXJjb2F0Tm9ybWFsVGV4dHVyZS5zY2FsZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdGNvbnN0IHNjYWxlID0gZXh0ZW5zaW9uLmNsZWFyY29hdE5vcm1hbFRleHR1cmUuc2NhbGU7XG5cblx0XHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9pc3N1ZXMvMTE0MzgjaXNzdWVjb21tZW50LTUwNzAwMzk5NVxuXHRcdFx0XHRtYXRlcmlhbFBhcmFtcy5jbGVhcmNvYXROb3JtYWxTY2FsZSA9IG5ldyBWZWN0b3IyKCBzY2FsZSwgLSBzY2FsZSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoIHBlbmRpbmcgKTtcblxuXHR9XG5cbn1cblxuLyoqXG4gKiBUcmFuc21pc3Npb24gTWF0ZXJpYWxzIEV4dGVuc2lvblxuICpcbiAqIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi90cmVlL21hc3Rlci9leHRlbnNpb25zLzIuMC9LaHJvbm9zL0tIUl9tYXRlcmlhbHNfdHJhbnNtaXNzaW9uXG4gKiBEcmFmdDogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3B1bGwvMTY5OFxuICovXG5jbGFzcyBHTFRGTWF0ZXJpYWxzVHJhbnNtaXNzaW9uRXh0ZW5zaW9uIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyc2VyICkge1xuXG5cdFx0dGhpcy5wYXJzZXIgPSBwYXJzZXI7XG5cdFx0dGhpcy5uYW1lID0gRVhURU5TSU9OUy5LSFJfTUFURVJJQUxTX1RSQU5TTUlTU0lPTjtcblxuXHR9XG5cblx0Z2V0TWF0ZXJpYWxUeXBlKCBtYXRlcmlhbEluZGV4ICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSByZXR1cm4gbnVsbDtcblxuXHRcdHJldHVybiBNZXNoUGh5c2ljYWxNYXRlcmlhbDtcblxuXHR9XG5cblx0ZXh0ZW5kTWF0ZXJpYWxQYXJhbXMoIG1hdGVyaWFsSW5kZXgsIG1hdGVyaWFsUGFyYW1zICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSB7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IG1hdGVyaWFsRGVmLmV4dGVuc2lvbnNbIHRoaXMubmFtZSBdO1xuXG5cdFx0aWYgKCBleHRlbnNpb24udHJhbnNtaXNzaW9uRmFjdG9yICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdG1hdGVyaWFsUGFyYW1zLnRyYW5zbWlzc2lvbiA9IGV4dGVuc2lvbi50cmFuc21pc3Npb25GYWN0b3I7XG5cblx0XHR9XG5cblx0XHRpZiAoIGV4dGVuc2lvbi50cmFuc21pc3Npb25UZXh0dXJlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAndHJhbnNtaXNzaW9uTWFwJywgZXh0ZW5zaW9uLnRyYW5zbWlzc2lvblRleHR1cmUgKSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKCBwZW5kaW5nICk7XG5cblx0fVxuXG59XG5cbi8qKlxuICogTWF0ZXJpYWxzIFZvbHVtZSBFeHRlbnNpb25cbiAqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvZXh0ZW5zaW9ucy8yLjAvS2hyb25vcy9LSFJfbWF0ZXJpYWxzX3ZvbHVtZVxuICovXG5jbGFzcyBHTFRGTWF0ZXJpYWxzVm9sdW1lRXh0ZW5zaW9uIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyc2VyICkge1xuXG5cdFx0dGhpcy5wYXJzZXIgPSBwYXJzZXI7XG5cdFx0dGhpcy5uYW1lID0gRVhURU5TSU9OUy5LSFJfTUFURVJJQUxTX1ZPTFVNRTtcblxuXHR9XG5cblx0Z2V0TWF0ZXJpYWxUeXBlKCBtYXRlcmlhbEluZGV4ICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSByZXR1cm4gbnVsbDtcblxuXHRcdHJldHVybiBNZXNoUGh5c2ljYWxNYXRlcmlhbDtcblxuXHR9XG5cblx0ZXh0ZW5kTWF0ZXJpYWxQYXJhbXMoIG1hdGVyaWFsSW5kZXgsIG1hdGVyaWFsUGFyYW1zICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSB7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IG1hdGVyaWFsRGVmLmV4dGVuc2lvbnNbIHRoaXMubmFtZSBdO1xuXG5cdFx0bWF0ZXJpYWxQYXJhbXMudGhpY2tuZXNzID0gZXh0ZW5zaW9uLnRoaWNrbmVzc0ZhY3RvciAhPT0gdW5kZWZpbmVkID8gZXh0ZW5zaW9uLnRoaWNrbmVzc0ZhY3RvciA6IDA7XG5cblx0XHRpZiAoIGV4dGVuc2lvbi50aGlja25lc3NUZXh0dXJlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAndGhpY2tuZXNzTWFwJywgZXh0ZW5zaW9uLnRoaWNrbmVzc1RleHR1cmUgKSApO1xuXG5cdFx0fVxuXG5cdFx0bWF0ZXJpYWxQYXJhbXMuYXR0ZW51YXRpb25EaXN0YW5jZSA9IGV4dGVuc2lvbi5hdHRlbnVhdGlvbkRpc3RhbmNlIHx8IDA7XG5cblx0XHRjb25zdCBjb2xvckFycmF5ID0gZXh0ZW5zaW9uLmF0dGVudWF0aW9uQ29sb3IgfHwgWyAxLCAxLCAxIF07XG5cdFx0bWF0ZXJpYWxQYXJhbXMuYXR0ZW51YXRpb25UaW50ID0gbmV3IENvbG9yKCBjb2xvckFycmF5WyAwIF0sIGNvbG9yQXJyYXlbIDEgXSwgY29sb3JBcnJheVsgMiBdICk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoIHBlbmRpbmcgKTtcblxuXHR9XG5cbn1cblxuLyoqXG4gKiBNYXRlcmlhbHMgaW9yIEV4dGVuc2lvblxuICpcbiAqIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi90cmVlL21hc3Rlci9leHRlbnNpb25zLzIuMC9LaHJvbm9zL0tIUl9tYXRlcmlhbHNfaW9yXG4gKi9cbmNsYXNzIEdMVEZNYXRlcmlhbHNJb3JFeHRlbnNpb24ge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJzZXIgKSB7XG5cblx0XHR0aGlzLnBhcnNlciA9IHBhcnNlcjtcblx0XHR0aGlzLm5hbWUgPSBFWFRFTlNJT05TLktIUl9NQVRFUklBTFNfSU9SO1xuXG5cdH1cblxuXHRnZXRNYXRlcmlhbFR5cGUoIG1hdGVyaWFsSW5kZXggKSB7XG5cblx0XHRjb25zdCBwYXJzZXIgPSB0aGlzLnBhcnNlcjtcblx0XHRjb25zdCBtYXRlcmlhbERlZiA9IHBhcnNlci5qc29uLm1hdGVyaWFsc1sgbWF0ZXJpYWxJbmRleCBdO1xuXG5cdFx0aWYgKCAhIG1hdGVyaWFsRGVmLmV4dGVuc2lvbnMgfHwgISBtYXRlcmlhbERlZi5leHRlbnNpb25zWyB0aGlzLm5hbWUgXSApIHJldHVybiBudWxsO1xuXG5cdFx0cmV0dXJuIE1lc2hQaHlzaWNhbE1hdGVyaWFsO1xuXG5cdH1cblxuXHRleHRlbmRNYXRlcmlhbFBhcmFtcyggbWF0ZXJpYWxJbmRleCwgbWF0ZXJpYWxQYXJhbXMgKSB7XG5cblx0XHRjb25zdCBwYXJzZXIgPSB0aGlzLnBhcnNlcjtcblx0XHRjb25zdCBtYXRlcmlhbERlZiA9IHBhcnNlci5qc29uLm1hdGVyaWFsc1sgbWF0ZXJpYWxJbmRleCBdO1xuXG5cdFx0aWYgKCAhIG1hdGVyaWFsRGVmLmV4dGVuc2lvbnMgfHwgISBtYXRlcmlhbERlZi5leHRlbnNpb25zWyB0aGlzLm5hbWUgXSApIHtcblxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgZXh0ZW5zaW9uID0gbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF07XG5cblx0XHRtYXRlcmlhbFBhcmFtcy5pb3IgPSBleHRlbnNpb24uaW9yICE9PSB1bmRlZmluZWQgPyBleHRlbnNpb24uaW9yIDogMS41O1xuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG5cdH1cblxufVxuXG4vKipcbiAqIE1hdGVyaWFscyBzcGVjdWxhciBFeHRlbnNpb25cbiAqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvZXh0ZW5zaW9ucy8yLjAvS2hyb25vcy9LSFJfbWF0ZXJpYWxzX3NwZWN1bGFyXG4gKi9cbmNsYXNzIEdMVEZNYXRlcmlhbHNTcGVjdWxhckV4dGVuc2lvbiB7XG5cblx0Y29uc3RydWN0b3IoIHBhcnNlciApIHtcblxuXHRcdHRoaXMucGFyc2VyID0gcGFyc2VyO1xuXHRcdHRoaXMubmFtZSA9IEVYVEVOU0lPTlMuS0hSX01BVEVSSUFMU19TUEVDVUxBUjtcblxuXHR9XG5cblx0Z2V0TWF0ZXJpYWxUeXBlKCBtYXRlcmlhbEluZGV4ICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSByZXR1cm4gbnVsbDtcblxuXHRcdHJldHVybiBNZXNoUGh5c2ljYWxNYXRlcmlhbDtcblxuXHR9XG5cblx0ZXh0ZW5kTWF0ZXJpYWxQYXJhbXMoIG1hdGVyaWFsSW5kZXgsIG1hdGVyaWFsUGFyYW1zICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QgbWF0ZXJpYWxEZWYgPSBwYXJzZXIuanNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGlmICggISBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8ICEgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSB7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IG1hdGVyaWFsRGVmLmV4dGVuc2lvbnNbIHRoaXMubmFtZSBdO1xuXG5cdFx0bWF0ZXJpYWxQYXJhbXMuc3BlY3VsYXJJbnRlbnNpdHkgPSBleHRlbnNpb24uc3BlY3VsYXJGYWN0b3IgIT09IHVuZGVmaW5lZCA/IGV4dGVuc2lvbi5zcGVjdWxhckZhY3RvciA6IDEuMDtcblxuXHRcdGlmICggZXh0ZW5zaW9uLnNwZWN1bGFyVGV4dHVyZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRwZW5kaW5nLnB1c2goIHBhcnNlci5hc3NpZ25UZXh0dXJlKCBtYXRlcmlhbFBhcmFtcywgJ3NwZWN1bGFySW50ZW5zaXR5TWFwJywgZXh0ZW5zaW9uLnNwZWN1bGFyVGV4dHVyZSApICk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBjb2xvckFycmF5ID0gZXh0ZW5zaW9uLnNwZWN1bGFyQ29sb3JGYWN0b3IgfHwgWyAxLCAxLCAxIF07XG5cdFx0bWF0ZXJpYWxQYXJhbXMuc3BlY3VsYXJUaW50ID0gbmV3IENvbG9yKCBjb2xvckFycmF5WyAwIF0sIGNvbG9yQXJyYXlbIDEgXSwgY29sb3JBcnJheVsgMiBdICk7XG5cblx0XHRpZiAoIGV4dGVuc2lvbi5zcGVjdWxhckNvbG9yVGV4dHVyZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRwZW5kaW5nLnB1c2goIHBhcnNlci5hc3NpZ25UZXh0dXJlKCBtYXRlcmlhbFBhcmFtcywgJ3NwZWN1bGFyVGludE1hcCcsIGV4dGVuc2lvbi5zcGVjdWxhckNvbG9yVGV4dHVyZSApLnRoZW4oIGZ1bmN0aW9uICggdGV4dHVyZSApIHtcblxuXHRcdFx0XHR0ZXh0dXJlLmVuY29kaW5nID0gc1JHQkVuY29kaW5nO1xuXG5cdFx0XHR9ICkgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLmFsbCggcGVuZGluZyApO1xuXG5cdH1cblxufVxuXG4vKipcbiAqIEJhc2lzVSBUZXh0dXJlIEV4dGVuc2lvblxuICpcbiAqIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi90cmVlL21hc3Rlci9leHRlbnNpb25zLzIuMC9LaHJvbm9zL0tIUl90ZXh0dXJlX2Jhc2lzdVxuICovXG5jbGFzcyBHTFRGVGV4dHVyZUJhc2lzVUV4dGVuc2lvbiB7XG5cblx0Y29uc3RydWN0b3IoIHBhcnNlciApIHtcblxuXHRcdHRoaXMucGFyc2VyID0gcGFyc2VyO1xuXHRcdHRoaXMubmFtZSA9IEVYVEVOU0lPTlMuS0hSX1RFWFRVUkVfQkFTSVNVO1xuXG5cdH1cblxuXHRsb2FkVGV4dHVyZSggdGV4dHVyZUluZGV4ICkge1xuXG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QganNvbiA9IHBhcnNlci5qc29uO1xuXG5cdFx0Y29uc3QgdGV4dHVyZURlZiA9IGpzb24udGV4dHVyZXNbIHRleHR1cmVJbmRleCBdO1xuXG5cdFx0aWYgKCAhIHRleHR1cmVEZWYuZXh0ZW5zaW9ucyB8fCAhIHRleHR1cmVEZWYuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSB7XG5cblx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgZXh0ZW5zaW9uID0gdGV4dHVyZURlZi5leHRlbnNpb25zWyB0aGlzLm5hbWUgXTtcblx0XHRjb25zdCBzb3VyY2UgPSBqc29uLmltYWdlc1sgZXh0ZW5zaW9uLnNvdXJjZSBdO1xuXHRcdGNvbnN0IGxvYWRlciA9IHBhcnNlci5vcHRpb25zLmt0eDJMb2FkZXI7XG5cblx0XHRpZiAoICEgbG9hZGVyICkge1xuXG5cdFx0XHRpZiAoIGpzb24uZXh0ZW5zaW9uc1JlcXVpcmVkICYmIGpzb24uZXh0ZW5zaW9uc1JlcXVpcmVkLmluZGV4T2YoIHRoaXMubmFtZSApID49IDAgKSB7XG5cblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCAnVEhSRUUuR0xURkxvYWRlcjogc2V0S1RYMkxvYWRlciBtdXN0IGJlIGNhbGxlZCBiZWZvcmUgbG9hZGluZyBLVFgyIHRleHR1cmVzJyApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIEFzc3VtZXMgdGhhdCB0aGUgZXh0ZW5zaW9uIGlzIG9wdGlvbmFsIGFuZCB0aGF0IGEgZmFsbGJhY2sgdGV4dHVyZSBpcyBwcmVzZW50XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gcGFyc2VyLmxvYWRUZXh0dXJlSW1hZ2UoIHRleHR1cmVJbmRleCwgc291cmNlLCBsb2FkZXIgKTtcblxuXHR9XG5cbn1cblxuLyoqXG4gKiBXZWJQIFRleHR1cmUgRXh0ZW5zaW9uXG4gKlxuICogU3BlY2lmaWNhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL2V4dGVuc2lvbnMvMi4wL1ZlbmRvci9FWFRfdGV4dHVyZV93ZWJwXG4gKi9cbmNsYXNzIEdMVEZUZXh0dXJlV2ViUEV4dGVuc2lvbiB7XG5cblx0Y29uc3RydWN0b3IoIHBhcnNlciApIHtcblxuXHRcdHRoaXMucGFyc2VyID0gcGFyc2VyO1xuXHRcdHRoaXMubmFtZSA9IEVYVEVOU0lPTlMuRVhUX1RFWFRVUkVfV0VCUDtcblx0XHR0aGlzLmlzU3VwcG9ydGVkID0gbnVsbDtcblxuXHR9XG5cblx0bG9hZFRleHR1cmUoIHRleHR1cmVJbmRleCApIHtcblxuXHRcdGNvbnN0IG5hbWUgPSB0aGlzLm5hbWU7XG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcy5wYXJzZXI7XG5cdFx0Y29uc3QganNvbiA9IHBhcnNlci5qc29uO1xuXG5cdFx0Y29uc3QgdGV4dHVyZURlZiA9IGpzb24udGV4dHVyZXNbIHRleHR1cmVJbmRleCBdO1xuXG5cdFx0aWYgKCAhIHRleHR1cmVEZWYuZXh0ZW5zaW9ucyB8fCAhIHRleHR1cmVEZWYuZXh0ZW5zaW9uc1sgbmFtZSBdICkge1xuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblxuXHRcdH1cblxuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IHRleHR1cmVEZWYuZXh0ZW5zaW9uc1sgbmFtZSBdO1xuXHRcdGNvbnN0IHNvdXJjZSA9IGpzb24uaW1hZ2VzWyBleHRlbnNpb24uc291cmNlIF07XG5cblx0XHRsZXQgbG9hZGVyID0gcGFyc2VyLnRleHR1cmVMb2FkZXI7XG5cdFx0aWYgKCBzb3VyY2UudXJpICkge1xuXG5cdFx0XHRjb25zdCBoYW5kbGVyID0gcGFyc2VyLm9wdGlvbnMubWFuYWdlci5nZXRIYW5kbGVyKCBzb3VyY2UudXJpICk7XG5cdFx0XHRpZiAoIGhhbmRsZXIgIT09IG51bGwgKSBsb2FkZXIgPSBoYW5kbGVyO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZGV0ZWN0U3VwcG9ydCgpLnRoZW4oIGZ1bmN0aW9uICggaXNTdXBwb3J0ZWQgKSB7XG5cblx0XHRcdGlmICggaXNTdXBwb3J0ZWQgKSByZXR1cm4gcGFyc2VyLmxvYWRUZXh0dXJlSW1hZ2UoIHRleHR1cmVJbmRleCwgc291cmNlLCBsb2FkZXIgKTtcblxuXHRcdFx0aWYgKCBqc29uLmV4dGVuc2lvbnNSZXF1aXJlZCAmJiBqc29uLmV4dGVuc2lvbnNSZXF1aXJlZC5pbmRleE9mKCBuYW1lICkgPj0gMCApIHtcblxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBXZWJQIHJlcXVpcmVkIGJ5IGFzc2V0IGJ1dCB1bnN1cHBvcnRlZC4nICk7XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gRmFsbCBiYWNrIHRvIFBORyBvciBKUEVHLlxuXHRcdFx0cmV0dXJuIHBhcnNlci5sb2FkVGV4dHVyZSggdGV4dHVyZUluZGV4ICk7XG5cblx0XHR9ICk7XG5cblx0fVxuXG5cdGRldGVjdFN1cHBvcnQoKSB7XG5cblx0XHRpZiAoICEgdGhpcy5pc1N1cHBvcnRlZCApIHtcblxuXHRcdFx0dGhpcy5pc1N1cHBvcnRlZCA9IG5ldyBQcm9taXNlKCBmdW5jdGlvbiAoIHJlc29sdmUgKSB7XG5cblx0XHRcdFx0Y29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuXHRcdFx0XHQvLyBMb3NzeSB0ZXN0IGltYWdlLiBTdXBwb3J0IGZvciBsb3NzeSBpbWFnZXMgZG9lc24ndCBndWFyYW50ZWUgc3VwcG9ydCBmb3IgYWxsXG5cdFx0XHRcdC8vIFdlYlAgaW1hZ2VzLCB1bmZvcnR1bmF0ZWx5LlxuXHRcdFx0XHRpbWFnZS5zcmMgPSAnZGF0YTppbWFnZS93ZWJwO2Jhc2U2NCxVa2xHUmlJQUFBQlhSVUpRVmxBNElCWUFBQUF3QVFDZEFTb0JBQUVBRHNEK0phUUFBM0FBQUFBQSc7XG5cblx0XHRcdFx0aW1hZ2Uub25sb2FkID0gaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0XHRcdHJlc29sdmUoIGltYWdlLmhlaWdodCA9PT0gMSApO1xuXG5cdFx0XHRcdH07XG5cblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmlzU3VwcG9ydGVkO1xuXG5cdH1cblxufVxuXG4vKipcbiAqIG1lc2hvcHQgQnVmZmVyVmlldyBDb21wcmVzc2lvbiBFeHRlbnNpb25cbiAqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvZXh0ZW5zaW9ucy8yLjAvVmVuZG9yL0VYVF9tZXNob3B0X2NvbXByZXNzaW9uXG4gKi9cbmNsYXNzIEdMVEZNZXNob3B0Q29tcHJlc3Npb24ge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJzZXIgKSB7XG5cblx0XHR0aGlzLm5hbWUgPSBFWFRFTlNJT05TLkVYVF9NRVNIT1BUX0NPTVBSRVNTSU9OO1xuXHRcdHRoaXMucGFyc2VyID0gcGFyc2VyO1xuXG5cdH1cblxuXHRsb2FkQnVmZmVyVmlldyggaW5kZXggKSB7XG5cblx0XHRjb25zdCBqc29uID0gdGhpcy5wYXJzZXIuanNvbjtcblx0XHRjb25zdCBidWZmZXJWaWV3ID0ganNvbi5idWZmZXJWaWV3c1sgaW5kZXggXTtcblxuXHRcdGlmICggYnVmZmVyVmlldy5leHRlbnNpb25zICYmIGJ1ZmZlclZpZXcuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0gKSB7XG5cblx0XHRcdGNvbnN0IGV4dGVuc2lvbkRlZiA9IGJ1ZmZlclZpZXcuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF07XG5cblx0XHRcdGNvbnN0IGJ1ZmZlciA9IHRoaXMucGFyc2VyLmdldERlcGVuZGVuY3koICdidWZmZXInLCBleHRlbnNpb25EZWYuYnVmZmVyICk7XG5cdFx0XHRjb25zdCBkZWNvZGVyID0gdGhpcy5wYXJzZXIub3B0aW9ucy5tZXNob3B0RGVjb2RlcjtcblxuXHRcdFx0aWYgKCAhIGRlY29kZXIgfHwgISBkZWNvZGVyLnN1cHBvcnRlZCApIHtcblxuXHRcdFx0XHRpZiAoIGpzb24uZXh0ZW5zaW9uc1JlcXVpcmVkICYmIGpzb24uZXh0ZW5zaW9uc1JlcXVpcmVkLmluZGV4T2YoIHRoaXMubmFtZSApID49IDAgKSB7XG5cblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBzZXRNZXNob3B0RGVjb2RlciBtdXN0IGJlIGNhbGxlZCBiZWZvcmUgbG9hZGluZyBjb21wcmVzc2VkIGZpbGVzJyApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBBc3N1bWVzIHRoYXQgdGhlIGV4dGVuc2lvbiBpcyBvcHRpb25hbCBhbmQgdGhhdCBmYWxsYmFjayBidWZmZXIgZGF0YSBpcyBwcmVzZW50XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBQcm9taXNlLmFsbCggWyBidWZmZXIsIGRlY29kZXIucmVhZHkgXSApLnRoZW4oIGZ1bmN0aW9uICggcmVzICkge1xuXG5cdFx0XHRcdGNvbnN0IGJ5dGVPZmZzZXQgPSBleHRlbnNpb25EZWYuYnl0ZU9mZnNldCB8fCAwO1xuXHRcdFx0XHRjb25zdCBieXRlTGVuZ3RoID0gZXh0ZW5zaW9uRGVmLmJ5dGVMZW5ndGggfHwgMDtcblxuXHRcdFx0XHRjb25zdCBjb3VudCA9IGV4dGVuc2lvbkRlZi5jb3VudDtcblx0XHRcdFx0Y29uc3Qgc3RyaWRlID0gZXh0ZW5zaW9uRGVmLmJ5dGVTdHJpZGU7XG5cblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IEFycmF5QnVmZmVyKCBjb3VudCAqIHN0cmlkZSApO1xuXHRcdFx0XHRjb25zdCBzb3VyY2UgPSBuZXcgVWludDhBcnJheSggcmVzWyAwIF0sIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGggKTtcblxuXHRcdFx0XHRkZWNvZGVyLmRlY29kZUdsdGZCdWZmZXIoIG5ldyBVaW50OEFycmF5KCByZXN1bHQgKSwgY291bnQsIHN0cmlkZSwgc291cmNlLCBleHRlbnNpb25EZWYubW9kZSwgZXh0ZW5zaW9uRGVmLmZpbHRlciApO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblxuXHRcdH1cblxuXHR9XG5cbn1cblxuLyogQklOQVJZIEVYVEVOU0lPTiAqL1xuY29uc3QgQklOQVJZX0VYVEVOU0lPTl9IRUFERVJfTUFHSUMgPSAnZ2xURic7XG5jb25zdCBCSU5BUllfRVhURU5TSU9OX0hFQURFUl9MRU5HVEggPSAxMjtcbmNvbnN0IEJJTkFSWV9FWFRFTlNJT05fQ0hVTktfVFlQRVMgPSB7IEpTT046IDB4NEU0RjUzNEEsIEJJTjogMHgwMDRFNDk0MiB9O1xuXG5jbGFzcyBHTFRGQmluYXJ5RXh0ZW5zaW9uIHtcblxuXHRjb25zdHJ1Y3RvciggZGF0YSApIHtcblxuXHRcdHRoaXMubmFtZSA9IEVYVEVOU0lPTlMuS0hSX0JJTkFSWV9HTFRGO1xuXHRcdHRoaXMuY29udGVudCA9IG51bGw7XG5cdFx0dGhpcy5ib2R5ID0gbnVsbDtcblxuXHRcdGNvbnN0IGhlYWRlclZpZXcgPSBuZXcgRGF0YVZpZXcoIGRhdGEsIDAsIEJJTkFSWV9FWFRFTlNJT05fSEVBREVSX0xFTkdUSCApO1xuXG5cdFx0dGhpcy5oZWFkZXIgPSB7XG5cdFx0XHRtYWdpYzogTG9hZGVyVXRpbHMuZGVjb2RlVGV4dCggbmV3IFVpbnQ4QXJyYXkoIGRhdGEuc2xpY2UoIDAsIDQgKSApICksXG5cdFx0XHR2ZXJzaW9uOiBoZWFkZXJWaWV3LmdldFVpbnQzMiggNCwgdHJ1ZSApLFxuXHRcdFx0bGVuZ3RoOiBoZWFkZXJWaWV3LmdldFVpbnQzMiggOCwgdHJ1ZSApXG5cdFx0fTtcblxuXHRcdGlmICggdGhpcy5oZWFkZXIubWFnaWMgIT09IEJJTkFSWV9FWFRFTlNJT05fSEVBREVSX01BR0lDICkge1xuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBVbnN1cHBvcnRlZCBnbFRGLUJpbmFyeSBoZWFkZXIuJyApO1xuXG5cdFx0fSBlbHNlIGlmICggdGhpcy5oZWFkZXIudmVyc2lvbiA8IDIuMCApIHtcblxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCAnVEhSRUUuR0xURkxvYWRlcjogTGVnYWN5IGJpbmFyeSBmaWxlIGRldGVjdGVkLicgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IGNodW5rQ29udGVudHNMZW5ndGggPSB0aGlzLmhlYWRlci5sZW5ndGggLSBCSU5BUllfRVhURU5TSU9OX0hFQURFUl9MRU5HVEg7XG5cdFx0Y29uc3QgY2h1bmtWaWV3ID0gbmV3IERhdGFWaWV3KCBkYXRhLCBCSU5BUllfRVhURU5TSU9OX0hFQURFUl9MRU5HVEggKTtcblx0XHRsZXQgY2h1bmtJbmRleCA9IDA7XG5cblx0XHR3aGlsZSAoIGNodW5rSW5kZXggPCBjaHVua0NvbnRlbnRzTGVuZ3RoICkge1xuXG5cdFx0XHRjb25zdCBjaHVua0xlbmd0aCA9IGNodW5rVmlldy5nZXRVaW50MzIoIGNodW5rSW5kZXgsIHRydWUgKTtcblx0XHRcdGNodW5rSW5kZXggKz0gNDtcblxuXHRcdFx0Y29uc3QgY2h1bmtUeXBlID0gY2h1bmtWaWV3LmdldFVpbnQzMiggY2h1bmtJbmRleCwgdHJ1ZSApO1xuXHRcdFx0Y2h1bmtJbmRleCArPSA0O1xuXG5cdFx0XHRpZiAoIGNodW5rVHlwZSA9PT0gQklOQVJZX0VYVEVOU0lPTl9DSFVOS19UWVBFUy5KU09OICkge1xuXG5cdFx0XHRcdGNvbnN0IGNvbnRlbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KCBkYXRhLCBCSU5BUllfRVhURU5TSU9OX0hFQURFUl9MRU5HVEggKyBjaHVua0luZGV4LCBjaHVua0xlbmd0aCApO1xuXHRcdFx0XHR0aGlzLmNvbnRlbnQgPSBMb2FkZXJVdGlscy5kZWNvZGVUZXh0KCBjb250ZW50QXJyYXkgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggY2h1bmtUeXBlID09PSBCSU5BUllfRVhURU5TSU9OX0NIVU5LX1RZUEVTLkJJTiApIHtcblxuXHRcdFx0XHRjb25zdCBieXRlT2Zmc2V0ID0gQklOQVJZX0VYVEVOU0lPTl9IRUFERVJfTEVOR1RIICsgY2h1bmtJbmRleDtcblx0XHRcdFx0dGhpcy5ib2R5ID0gZGF0YS5zbGljZSggYnl0ZU9mZnNldCwgYnl0ZU9mZnNldCArIGNodW5rTGVuZ3RoICk7XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2xpZW50cyBtdXN0IGlnbm9yZSBjaHVua3Mgd2l0aCB1bmtub3duIHR5cGVzLlxuXG5cdFx0XHRjaHVua0luZGV4ICs9IGNodW5rTGVuZ3RoO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmNvbnRlbnQgPT09IG51bGwgKSB7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLkdMVEZMb2FkZXI6IEpTT04gY29udGVudCBub3QgZm91bmQuJyApO1xuXG5cdFx0fVxuXG5cdH1cblxufVxuXG4vKipcbiAqIERSQUNPIE1lc2ggQ29tcHJlc3Npb24gRXh0ZW5zaW9uXG4gKlxuICogU3BlY2lmaWNhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL2V4dGVuc2lvbnMvMi4wL0tocm9ub3MvS0hSX2RyYWNvX21lc2hfY29tcHJlc3Npb25cbiAqL1xuY2xhc3MgR0xURkRyYWNvTWVzaENvbXByZXNzaW9uRXh0ZW5zaW9uIHtcblxuXHRjb25zdHJ1Y3RvcigganNvbiwgZHJhY29Mb2FkZXIgKSB7XG5cblx0XHRpZiAoICEgZHJhY29Mb2FkZXIgKSB7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLkdMVEZMb2FkZXI6IE5vIERSQUNPTG9hZGVyIGluc3RhbmNlIHByb3ZpZGVkLicgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMubmFtZSA9IEVYVEVOU0lPTlMuS0hSX0RSQUNPX01FU0hfQ09NUFJFU1NJT047XG5cdFx0dGhpcy5qc29uID0ganNvbjtcblx0XHR0aGlzLmRyYWNvTG9hZGVyID0gZHJhY29Mb2FkZXI7XG5cdFx0dGhpcy5kcmFjb0xvYWRlci5wcmVsb2FkKCk7XG5cblx0fVxuXG5cdGRlY29kZVByaW1pdGl2ZSggcHJpbWl0aXZlLCBwYXJzZXIgKSB7XG5cblx0XHRjb25zdCBqc29uID0gdGhpcy5qc29uO1xuXHRcdGNvbnN0IGRyYWNvTG9hZGVyID0gdGhpcy5kcmFjb0xvYWRlcjtcblx0XHRjb25zdCBidWZmZXJWaWV3SW5kZXggPSBwcmltaXRpdmUuZXh0ZW5zaW9uc1sgdGhpcy5uYW1lIF0uYnVmZmVyVmlldztcblx0XHRjb25zdCBnbHRmQXR0cmlidXRlTWFwID0gcHJpbWl0aXZlLmV4dGVuc2lvbnNbIHRoaXMubmFtZSBdLmF0dHJpYnV0ZXM7XG5cdFx0Y29uc3QgdGhyZWVBdHRyaWJ1dGVNYXAgPSB7fTtcblx0XHRjb25zdCBhdHRyaWJ1dGVOb3JtYWxpemVkTWFwID0ge307XG5cdFx0Y29uc3QgYXR0cmlidXRlVHlwZU1hcCA9IHt9O1xuXG5cdFx0Zm9yICggY29uc3QgYXR0cmlidXRlTmFtZSBpbiBnbHRmQXR0cmlidXRlTWFwICkge1xuXG5cdFx0XHRjb25zdCB0aHJlZUF0dHJpYnV0ZU5hbWUgPSBBVFRSSUJVVEVTWyBhdHRyaWJ1dGVOYW1lIF0gfHwgYXR0cmlidXRlTmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHR0aHJlZUF0dHJpYnV0ZU1hcFsgdGhyZWVBdHRyaWJ1dGVOYW1lIF0gPSBnbHRmQXR0cmlidXRlTWFwWyBhdHRyaWJ1dGVOYW1lIF07XG5cblx0XHR9XG5cblx0XHRmb3IgKCBjb25zdCBhdHRyaWJ1dGVOYW1lIGluIHByaW1pdGl2ZS5hdHRyaWJ1dGVzICkge1xuXG5cdFx0XHRjb25zdCB0aHJlZUF0dHJpYnV0ZU5hbWUgPSBBVFRSSUJVVEVTWyBhdHRyaWJ1dGVOYW1lIF0gfHwgYXR0cmlidXRlTmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHRpZiAoIGdsdGZBdHRyaWJ1dGVNYXBbIGF0dHJpYnV0ZU5hbWUgXSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdGNvbnN0IGFjY2Vzc29yRGVmID0ganNvbi5hY2Nlc3NvcnNbIHByaW1pdGl2ZS5hdHRyaWJ1dGVzWyBhdHRyaWJ1dGVOYW1lIF0gXTtcblx0XHRcdFx0Y29uc3QgY29tcG9uZW50VHlwZSA9IFdFQkdMX0NPTVBPTkVOVF9UWVBFU1sgYWNjZXNzb3JEZWYuY29tcG9uZW50VHlwZSBdO1xuXG5cdFx0XHRcdGF0dHJpYnV0ZVR5cGVNYXBbIHRocmVlQXR0cmlidXRlTmFtZSBdID0gY29tcG9uZW50VHlwZTtcblx0XHRcdFx0YXR0cmlidXRlTm9ybWFsaXplZE1hcFsgdGhyZWVBdHRyaWJ1dGVOYW1lIF0gPSBhY2Nlc3NvckRlZi5ub3JtYWxpemVkID09PSB0cnVlO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gcGFyc2VyLmdldERlcGVuZGVuY3koICdidWZmZXJWaWV3JywgYnVmZmVyVmlld0luZGV4ICkudGhlbiggZnVuY3Rpb24gKCBidWZmZXJWaWV3ICkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uICggcmVzb2x2ZSApIHtcblxuXHRcdFx0XHRkcmFjb0xvYWRlci5kZWNvZGVEcmFjb0ZpbGUoIGJ1ZmZlclZpZXcsIGZ1bmN0aW9uICggZ2VvbWV0cnkgKSB7XG5cblx0XHRcdFx0XHRmb3IgKCBjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGdlb21ldHJ5LmF0dHJpYnV0ZXMgKSB7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGF0dHJpYnV0ZSA9IGdlb21ldHJ5LmF0dHJpYnV0ZXNbIGF0dHJpYnV0ZU5hbWUgXTtcblx0XHRcdFx0XHRcdGNvbnN0IG5vcm1hbGl6ZWQgPSBhdHRyaWJ1dGVOb3JtYWxpemVkTWFwWyBhdHRyaWJ1dGVOYW1lIF07XG5cblx0XHRcdFx0XHRcdGlmICggbm9ybWFsaXplZCAhPT0gdW5kZWZpbmVkICkgYXR0cmlidXRlLm5vcm1hbGl6ZWQgPSBub3JtYWxpemVkO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmVzb2x2ZSggZ2VvbWV0cnkgKTtcblxuXHRcdFx0XHR9LCB0aHJlZUF0dHJpYnV0ZU1hcCwgYXR0cmlidXRlVHlwZU1hcCApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9ICk7XG5cblx0fVxuXG59XG5cbi8qKlxuICogVGV4dHVyZSBUcmFuc2Zvcm0gRXh0ZW5zaW9uXG4gKlxuICogU3BlY2lmaWNhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL2V4dGVuc2lvbnMvMi4wL0tocm9ub3MvS0hSX3RleHR1cmVfdHJhbnNmb3JtXG4gKi9cbmNsYXNzIEdMVEZUZXh0dXJlVHJhbnNmb3JtRXh0ZW5zaW9uIHtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblxuXHRcdHRoaXMubmFtZSA9IEVYVEVOU0lPTlMuS0hSX1RFWFRVUkVfVFJBTlNGT1JNO1xuXG5cdH1cblxuXHRleHRlbmRUZXh0dXJlKCB0ZXh0dXJlLCB0cmFuc2Zvcm0gKSB7XG5cblx0XHRpZiAoIHRyYW5zZm9ybS50ZXhDb29yZCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5HTFRGTG9hZGVyOiBDdXN0b20gVVYgc2V0cyBpbiBcIicgKyB0aGlzLm5hbWUgKyAnXCIgZXh0ZW5zaW9uIG5vdCB5ZXQgc3VwcG9ydGVkLicgKTtcblxuXHRcdH1cblxuXHRcdGlmICggdHJhbnNmb3JtLm9mZnNldCA9PT0gdW5kZWZpbmVkICYmIHRyYW5zZm9ybS5yb3RhdGlvbiA9PT0gdW5kZWZpbmVkICYmIHRyYW5zZm9ybS5zY2FsZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9pc3N1ZXMvMjE4MTkuXG5cdFx0XHRyZXR1cm4gdGV4dHVyZTtcblxuXHRcdH1cblxuXHRcdHRleHR1cmUgPSB0ZXh0dXJlLmNsb25lKCk7XG5cblx0XHRpZiAoIHRyYW5zZm9ybS5vZmZzZXQgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGV4dHVyZS5vZmZzZXQuZnJvbUFycmF5KCB0cmFuc2Zvcm0ub2Zmc2V0ICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHRyYW5zZm9ybS5yb3RhdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR0ZXh0dXJlLnJvdGF0aW9uID0gdHJhbnNmb3JtLnJvdGF0aW9uO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0cmFuc2Zvcm0uc2NhbGUgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGV4dHVyZS5yZXBlYXQuZnJvbUFycmF5KCB0cmFuc2Zvcm0uc2NhbGUgKTtcblxuXHRcdH1cblxuXHRcdHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRleHR1cmU7XG5cblx0fVxuXG59XG5cbi8qKlxuICogU3BlY3VsYXItR2xvc3NpbmVzcyBFeHRlbnNpb25cbiAqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvZXh0ZW5zaW9ucy8yLjAvS2hyb25vcy9LSFJfbWF0ZXJpYWxzX3BiclNwZWN1bGFyR2xvc3NpbmVzc1xuICovXG5cbi8qKlxuICogQSBzdWIgY2xhc3Mgb2YgU3RhbmRhcmRNYXRlcmlhbCB3aXRoIHNvbWUgb2YgdGhlIGZ1bmN0aW9uYWxpdHlcbiAqIGNoYW5nZWQgdmlhIHRoZSBgb25CZWZvcmVDb21waWxlYCBjYWxsYmFja1xuICogQHBhaWxoZWFkXG4gKi9cbmNsYXNzIEdMVEZNZXNoU3RhbmRhcmRTR01hdGVyaWFsIGV4dGVuZHMgTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJhbXMgKSB7XG5cblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5pc0dMVEZTcGVjdWxhckdsb3NzaW5lc3NNYXRlcmlhbCA9IHRydWU7XG5cblx0XHQvL3ZhcmlvdXMgY2h1bmtzIHRoYXQgbmVlZCByZXBsYWNpbmdcblx0XHRjb25zdCBzcGVjdWxhck1hcFBhcnNGcmFnbWVudENodW5rID0gW1xuXHRcdFx0JyNpZmRlZiBVU0VfU1BFQ1VMQVJNQVAnLFxuXHRcdFx0J1x0dW5pZm9ybSBzYW1wbGVyMkQgc3BlY3VsYXJNYXA7Jyxcblx0XHRcdCcjZW5kaWYnXG5cdFx0XS5qb2luKCAnXFxuJyApO1xuXG5cdFx0Y29uc3QgZ2xvc3NpbmVzc01hcFBhcnNGcmFnbWVudENodW5rID0gW1xuXHRcdFx0JyNpZmRlZiBVU0VfR0xPU1NJTkVTU01BUCcsXG5cdFx0XHQnXHR1bmlmb3JtIHNhbXBsZXIyRCBnbG9zc2luZXNzTWFwOycsXG5cdFx0XHQnI2VuZGlmJ1xuXHRcdF0uam9pbiggJ1xcbicgKTtcblxuXHRcdGNvbnN0IHNwZWN1bGFyTWFwRnJhZ21lbnRDaHVuayA9IFtcblx0XHRcdCd2ZWMzIHNwZWN1bGFyRmFjdG9yID0gc3BlY3VsYXI7Jyxcblx0XHRcdCcjaWZkZWYgVVNFX1NQRUNVTEFSTUFQJyxcblx0XHRcdCdcdHZlYzQgdGV4ZWxTcGVjdWxhciA9IHRleHR1cmUyRCggc3BlY3VsYXJNYXAsIHZVdiApOycsXG5cdFx0XHQnXHR0ZXhlbFNwZWN1bGFyID0gc1JHQlRvTGluZWFyKCB0ZXhlbFNwZWN1bGFyICk7Jyxcblx0XHRcdCdcdC8vIHJlYWRzIGNoYW5uZWwgUkdCLCBjb21wYXRpYmxlIHdpdGggYSBnbFRGIFNwZWN1bGFyLUdsb3NzaW5lc3MgKFJHQkEpIHRleHR1cmUnLFxuXHRcdFx0J1x0c3BlY3VsYXJGYWN0b3IgKj0gdGV4ZWxTcGVjdWxhci5yZ2I7Jyxcblx0XHRcdCcjZW5kaWYnXG5cdFx0XS5qb2luKCAnXFxuJyApO1xuXG5cdFx0Y29uc3QgZ2xvc3NpbmVzc01hcEZyYWdtZW50Q2h1bmsgPSBbXG5cdFx0XHQnZmxvYXQgZ2xvc3NpbmVzc0ZhY3RvciA9IGdsb3NzaW5lc3M7Jyxcblx0XHRcdCcjaWZkZWYgVVNFX0dMT1NTSU5FU1NNQVAnLFxuXHRcdFx0J1x0dmVjNCB0ZXhlbEdsb3NzaW5lc3MgPSB0ZXh0dXJlMkQoIGdsb3NzaW5lc3NNYXAsIHZVdiApOycsXG5cdFx0XHQnXHQvLyByZWFkcyBjaGFubmVsIEEsIGNvbXBhdGlibGUgd2l0aCBhIGdsVEYgU3BlY3VsYXItR2xvc3NpbmVzcyAoUkdCQSkgdGV4dHVyZScsXG5cdFx0XHQnXHRnbG9zc2luZXNzRmFjdG9yICo9IHRleGVsR2xvc3NpbmVzcy5hOycsXG5cdFx0XHQnI2VuZGlmJ1xuXHRcdF0uam9pbiggJ1xcbicgKTtcblxuXHRcdGNvbnN0IGxpZ2h0UGh5c2ljYWxGcmFnbWVudENodW5rID0gW1xuXHRcdFx0J1BoeXNpY2FsTWF0ZXJpYWwgbWF0ZXJpYWw7Jyxcblx0XHRcdCdtYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBkaWZmdXNlQ29sb3IucmdiICogKCAxLiAtIG1heCggc3BlY3VsYXJGYWN0b3IuciwgbWF4KCBzcGVjdWxhckZhY3Rvci5nLCBzcGVjdWxhckZhY3Rvci5iICkgKSApOycsXG5cdFx0XHQndmVjMyBkeHkgPSBtYXgoIGFicyggZEZkeCggZ2VvbWV0cnlOb3JtYWwgKSApLCBhYnMoIGRGZHkoIGdlb21ldHJ5Tm9ybWFsICkgKSApOycsXG5cdFx0XHQnZmxvYXQgZ2VvbWV0cnlSb3VnaG5lc3MgPSBtYXgoIG1heCggZHh5LngsIGR4eS55ICksIGR4eS56ICk7Jyxcblx0XHRcdCdtYXRlcmlhbC5yb3VnaG5lc3MgPSBtYXgoIDEuMCAtIGdsb3NzaW5lc3NGYWN0b3IsIDAuMDUyNSApOyAvLyAwLjA1MjUgY29ycmVzcG9uZHMgdG8gdGhlIGJhc2UgbWlwIG9mIGEgMjU2IGN1YmVtYXAuJyxcblx0XHRcdCdtYXRlcmlhbC5yb3VnaG5lc3MgKz0gZ2VvbWV0cnlSb3VnaG5lc3M7Jyxcblx0XHRcdCdtYXRlcmlhbC5yb3VnaG5lc3MgPSBtaW4oIG1hdGVyaWFsLnJvdWdobmVzcywgMS4wICk7Jyxcblx0XHRcdCdtYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gc3BlY3VsYXJGYWN0b3I7Jyxcblx0XHRdLmpvaW4oICdcXG4nICk7XG5cblx0XHRjb25zdCB1bmlmb3JtcyA9IHtcblx0XHRcdHNwZWN1bGFyOiB7IHZhbHVlOiBuZXcgQ29sb3IoKS5zZXRIZXgoIDB4ZmZmZmZmICkgfSxcblx0XHRcdGdsb3NzaW5lc3M6IHsgdmFsdWU6IDEgfSxcblx0XHRcdHNwZWN1bGFyTWFwOiB7IHZhbHVlOiBudWxsIH0sXG5cdFx0XHRnbG9zc2luZXNzTWFwOiB7IHZhbHVlOiBudWxsIH1cblx0XHR9O1xuXG5cdFx0dGhpcy5fZXh0cmFVbmlmb3JtcyA9IHVuaWZvcm1zO1xuXG5cdFx0dGhpcy5vbkJlZm9yZUNvbXBpbGUgPSBmdW5jdGlvbiAoIHNoYWRlciApIHtcblxuXHRcdFx0Zm9yICggY29uc3QgdW5pZm9ybU5hbWUgaW4gdW5pZm9ybXMgKSB7XG5cblx0XHRcdFx0c2hhZGVyLnVuaWZvcm1zWyB1bmlmb3JtTmFtZSBdID0gdW5pZm9ybXNbIHVuaWZvcm1OYW1lIF07XG5cblx0XHRcdH1cblxuXHRcdFx0c2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG5cdFx0XHRcdC5yZXBsYWNlKCAndW5pZm9ybSBmbG9hdCByb3VnaG5lc3M7JywgJ3VuaWZvcm0gdmVjMyBzcGVjdWxhcjsnIClcblx0XHRcdFx0LnJlcGxhY2UoICd1bmlmb3JtIGZsb2F0IG1ldGFsbmVzczsnLCAndW5pZm9ybSBmbG9hdCBnbG9zc2luZXNzOycgKVxuXHRcdFx0XHQucmVwbGFjZSggJyNpbmNsdWRlIDxyb3VnaG5lc3NtYXBfcGFyc19mcmFnbWVudD4nLCBzcGVjdWxhck1hcFBhcnNGcmFnbWVudENodW5rIClcblx0XHRcdFx0LnJlcGxhY2UoICcjaW5jbHVkZSA8bWV0YWxuZXNzbWFwX3BhcnNfZnJhZ21lbnQ+JywgZ2xvc3NpbmVzc01hcFBhcnNGcmFnbWVudENodW5rIClcblx0XHRcdFx0LnJlcGxhY2UoICcjaW5jbHVkZSA8cm91Z2huZXNzbWFwX2ZyYWdtZW50PicsIHNwZWN1bGFyTWFwRnJhZ21lbnRDaHVuayApXG5cdFx0XHRcdC5yZXBsYWNlKCAnI2luY2x1ZGUgPG1ldGFsbmVzc21hcF9mcmFnbWVudD4nLCBnbG9zc2luZXNzTWFwRnJhZ21lbnRDaHVuayApXG5cdFx0XHRcdC5yZXBsYWNlKCAnI2luY2x1ZGUgPGxpZ2h0c19waHlzaWNhbF9mcmFnbWVudD4nLCBsaWdodFBoeXNpY2FsRnJhZ21lbnRDaHVuayApO1xuXG5cdFx0fTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCB0aGlzLCB7XG5cblx0XHRcdHNwZWN1bGFyOiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdFx0cmV0dXJuIHVuaWZvcm1zLnNwZWN1bGFyLnZhbHVlO1xuXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gKCB2ICkge1xuXG5cdFx0XHRcdFx0dW5pZm9ybXMuc3BlY3VsYXIudmFsdWUgPSB2O1xuXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdHNwZWN1bGFyTWFwOiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdFx0cmV0dXJuIHVuaWZvcm1zLnNwZWN1bGFyTWFwLnZhbHVlO1xuXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gKCB2ICkge1xuXG5cdFx0XHRcdFx0dW5pZm9ybXMuc3BlY3VsYXJNYXAudmFsdWUgPSB2O1xuXG5cdFx0XHRcdFx0aWYgKCB2ICkge1xuXG5cdFx0XHRcdFx0XHR0aGlzLmRlZmluZXMuVVNFX1NQRUNVTEFSTUFQID0gJyc7IC8vIFVTRV9VViBpcyBzZXQgYnkgdGhlIHJlbmRlcmVyIGZvciBzcGVjdWxhciBtYXBzXG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy5kZWZpbmVzLlVTRV9TUEVDVUxBUk1BUDtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRnbG9zc2luZXNzOiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdFx0cmV0dXJuIHVuaWZvcm1zLmdsb3NzaW5lc3MudmFsdWU7XG5cblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHRcdFx0XHR1bmlmb3Jtcy5nbG9zc2luZXNzLnZhbHVlID0gdjtcblxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRnbG9zc2luZXNzTWFwOiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdFx0cmV0dXJuIHVuaWZvcm1zLmdsb3NzaW5lc3NNYXAudmFsdWU7XG5cblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHRcdFx0XHR1bmlmb3Jtcy5nbG9zc2luZXNzTWFwLnZhbHVlID0gdjtcblxuXHRcdFx0XHRcdGlmICggdiApIHtcblxuXHRcdFx0XHRcdFx0dGhpcy5kZWZpbmVzLlVTRV9HTE9TU0lORVNTTUFQID0gJyc7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmluZXMuVVNFX1VWID0gJyc7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy5kZWZpbmVzLlVTRV9HTE9TU0lORVNTTUFQO1xuXHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuZGVmaW5lcy5VU0VfVVY7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fSApO1xuXG5cdFx0ZGVsZXRlIHRoaXMubWV0YWxuZXNzO1xuXHRcdGRlbGV0ZSB0aGlzLnJvdWdobmVzcztcblx0XHRkZWxldGUgdGhpcy5tZXRhbG5lc3NNYXA7XG5cdFx0ZGVsZXRlIHRoaXMucm91Z2huZXNzTWFwO1xuXG5cdFx0dGhpcy5zZXRWYWx1ZXMoIHBhcmFtcyApO1xuXG5cdH1cblxuXHRjb3B5KCBzb3VyY2UgKSB7XG5cblx0XHRzdXBlci5jb3B5KCBzb3VyY2UgKTtcblxuXHRcdHRoaXMuc3BlY3VsYXJNYXAgPSBzb3VyY2Uuc3BlY3VsYXJNYXA7XG5cdFx0dGhpcy5zcGVjdWxhci5jb3B5KCBzb3VyY2Uuc3BlY3VsYXIgKTtcblx0XHR0aGlzLmdsb3NzaW5lc3NNYXAgPSBzb3VyY2UuZ2xvc3NpbmVzc01hcDtcblx0XHR0aGlzLmdsb3NzaW5lc3MgPSBzb3VyY2UuZ2xvc3NpbmVzcztcblx0XHRkZWxldGUgdGhpcy5tZXRhbG5lc3M7XG5cdFx0ZGVsZXRlIHRoaXMucm91Z2huZXNzO1xuXHRcdGRlbGV0ZSB0aGlzLm1ldGFsbmVzc01hcDtcblx0XHRkZWxldGUgdGhpcy5yb3VnaG5lc3NNYXA7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG59XG5cblxuY2xhc3MgR0xURk1hdGVyaWFsc1BiclNwZWN1bGFyR2xvc3NpbmVzc0V4dGVuc2lvbiB7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cblx0XHR0aGlzLm5hbWUgPSBFWFRFTlNJT05TLktIUl9NQVRFUklBTFNfUEJSX1NQRUNVTEFSX0dMT1NTSU5FU1M7XG5cblx0XHR0aGlzLnNwZWN1bGFyR2xvc3NpbmVzc1BhcmFtcyA9IFtcblx0XHRcdCdjb2xvcicsXG5cdFx0XHQnbWFwJyxcblx0XHRcdCdsaWdodE1hcCcsXG5cdFx0XHQnbGlnaHRNYXBJbnRlbnNpdHknLFxuXHRcdFx0J2FvTWFwJyxcblx0XHRcdCdhb01hcEludGVuc2l0eScsXG5cdFx0XHQnZW1pc3NpdmUnLFxuXHRcdFx0J2VtaXNzaXZlSW50ZW5zaXR5Jyxcblx0XHRcdCdlbWlzc2l2ZU1hcCcsXG5cdFx0XHQnYnVtcE1hcCcsXG5cdFx0XHQnYnVtcFNjYWxlJyxcblx0XHRcdCdub3JtYWxNYXAnLFxuXHRcdFx0J25vcm1hbE1hcFR5cGUnLFxuXHRcdFx0J2Rpc3BsYWNlbWVudE1hcCcsXG5cdFx0XHQnZGlzcGxhY2VtZW50U2NhbGUnLFxuXHRcdFx0J2Rpc3BsYWNlbWVudEJpYXMnLFxuXHRcdFx0J3NwZWN1bGFyTWFwJyxcblx0XHRcdCdzcGVjdWxhcicsXG5cdFx0XHQnZ2xvc3NpbmVzc01hcCcsXG5cdFx0XHQnZ2xvc3NpbmVzcycsXG5cdFx0XHQnYWxwaGFNYXAnLFxuXHRcdFx0J2Vudk1hcCcsXG5cdFx0XHQnZW52TWFwSW50ZW5zaXR5Jyxcblx0XHRcdCdyZWZyYWN0aW9uUmF0aW8nLFxuXHRcdF07XG5cblx0fVxuXG5cdGdldE1hdGVyaWFsVHlwZSgpIHtcblxuXHRcdHJldHVybiBHTFRGTWVzaFN0YW5kYXJkU0dNYXRlcmlhbDtcblxuXHR9XG5cblx0ZXh0ZW5kUGFyYW1zKCBtYXRlcmlhbFBhcmFtcywgbWF0ZXJpYWxEZWYsIHBhcnNlciApIHtcblxuXHRcdGNvbnN0IHBiclNwZWN1bGFyR2xvc3NpbmVzcyA9IG1hdGVyaWFsRGVmLmV4dGVuc2lvbnNbIHRoaXMubmFtZSBdO1xuXG5cdFx0bWF0ZXJpYWxQYXJhbXMuY29sb3IgPSBuZXcgQ29sb3IoIDEuMCwgMS4wLCAxLjAgKTtcblx0XHRtYXRlcmlhbFBhcmFtcy5vcGFjaXR5ID0gMS4wO1xuXG5cdFx0Y29uc3QgcGVuZGluZyA9IFtdO1xuXG5cdFx0aWYgKCBBcnJheS5pc0FycmF5KCBwYnJTcGVjdWxhckdsb3NzaW5lc3MuZGlmZnVzZUZhY3RvciApICkge1xuXG5cdFx0XHRjb25zdCBhcnJheSA9IHBiclNwZWN1bGFyR2xvc3NpbmVzcy5kaWZmdXNlRmFjdG9yO1xuXG5cdFx0XHRtYXRlcmlhbFBhcmFtcy5jb2xvci5mcm9tQXJyYXkoIGFycmF5ICk7XG5cdFx0XHRtYXRlcmlhbFBhcmFtcy5vcGFjaXR5ID0gYXJyYXlbIDMgXTtcblxuXHRcdH1cblxuXHRcdGlmICggcGJyU3BlY3VsYXJHbG9zc2luZXNzLmRpZmZ1c2VUZXh0dXJlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAnbWFwJywgcGJyU3BlY3VsYXJHbG9zc2luZXNzLmRpZmZ1c2VUZXh0dXJlICkgKTtcblxuXHRcdH1cblxuXHRcdG1hdGVyaWFsUGFyYW1zLmVtaXNzaXZlID0gbmV3IENvbG9yKCAwLjAsIDAuMCwgMC4wICk7XG5cdFx0bWF0ZXJpYWxQYXJhbXMuZ2xvc3NpbmVzcyA9IHBiclNwZWN1bGFyR2xvc3NpbmVzcy5nbG9zc2luZXNzRmFjdG9yICE9PSB1bmRlZmluZWQgPyBwYnJTcGVjdWxhckdsb3NzaW5lc3MuZ2xvc3NpbmVzc0ZhY3RvciA6IDEuMDtcblx0XHRtYXRlcmlhbFBhcmFtcy5zcGVjdWxhciA9IG5ldyBDb2xvciggMS4wLCAxLjAsIDEuMCApO1xuXG5cdFx0aWYgKCBBcnJheS5pc0FycmF5KCBwYnJTcGVjdWxhckdsb3NzaW5lc3Muc3BlY3VsYXJGYWN0b3IgKSApIHtcblxuXHRcdFx0bWF0ZXJpYWxQYXJhbXMuc3BlY3VsYXIuZnJvbUFycmF5KCBwYnJTcGVjdWxhckdsb3NzaW5lc3Muc3BlY3VsYXJGYWN0b3IgKTtcblxuXHRcdH1cblxuXHRcdGlmICggcGJyU3BlY3VsYXJHbG9zc2luZXNzLnNwZWN1bGFyR2xvc3NpbmVzc1RleHR1cmUgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Y29uc3Qgc3BlY0dsb3NzTWFwRGVmID0gcGJyU3BlY3VsYXJHbG9zc2luZXNzLnNwZWN1bGFyR2xvc3NpbmVzc1RleHR1cmU7XG5cdFx0XHRwZW5kaW5nLnB1c2goIHBhcnNlci5hc3NpZ25UZXh0dXJlKCBtYXRlcmlhbFBhcmFtcywgJ2dsb3NzaW5lc3NNYXAnLCBzcGVjR2xvc3NNYXBEZWYgKSApO1xuXHRcdFx0cGVuZGluZy5wdXNoKCBwYXJzZXIuYXNzaWduVGV4dHVyZSggbWF0ZXJpYWxQYXJhbXMsICdzcGVjdWxhck1hcCcsIHNwZWNHbG9zc01hcERlZiApICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoIHBlbmRpbmcgKTtcblxuXHR9XG5cblx0Y3JlYXRlTWF0ZXJpYWwoIG1hdGVyaWFsUGFyYW1zICkge1xuXG5cdFx0Y29uc3QgbWF0ZXJpYWwgPSBuZXcgR0xURk1lc2hTdGFuZGFyZFNHTWF0ZXJpYWwoIG1hdGVyaWFsUGFyYW1zICk7XG5cdFx0bWF0ZXJpYWwuZm9nID0gdHJ1ZTtcblxuXHRcdG1hdGVyaWFsLmNvbG9yID0gbWF0ZXJpYWxQYXJhbXMuY29sb3I7XG5cblx0XHRtYXRlcmlhbC5tYXAgPSBtYXRlcmlhbFBhcmFtcy5tYXAgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBtYXRlcmlhbFBhcmFtcy5tYXA7XG5cblx0XHRtYXRlcmlhbC5saWdodE1hcCA9IG51bGw7XG5cdFx0bWF0ZXJpYWwubGlnaHRNYXBJbnRlbnNpdHkgPSAxLjA7XG5cblx0XHRtYXRlcmlhbC5hb01hcCA9IG1hdGVyaWFsUGFyYW1zLmFvTWFwID09PSB1bmRlZmluZWQgPyBudWxsIDogbWF0ZXJpYWxQYXJhbXMuYW9NYXA7XG5cdFx0bWF0ZXJpYWwuYW9NYXBJbnRlbnNpdHkgPSAxLjA7XG5cblx0XHRtYXRlcmlhbC5lbWlzc2l2ZSA9IG1hdGVyaWFsUGFyYW1zLmVtaXNzaXZlO1xuXHRcdG1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gMS4wO1xuXHRcdG1hdGVyaWFsLmVtaXNzaXZlTWFwID0gbWF0ZXJpYWxQYXJhbXMuZW1pc3NpdmVNYXAgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBtYXRlcmlhbFBhcmFtcy5lbWlzc2l2ZU1hcDtcblxuXHRcdG1hdGVyaWFsLmJ1bXBNYXAgPSBtYXRlcmlhbFBhcmFtcy5idW1wTWFwID09PSB1bmRlZmluZWQgPyBudWxsIDogbWF0ZXJpYWxQYXJhbXMuYnVtcE1hcDtcblx0XHRtYXRlcmlhbC5idW1wU2NhbGUgPSAxO1xuXG5cdFx0bWF0ZXJpYWwubm9ybWFsTWFwID0gbWF0ZXJpYWxQYXJhbXMubm9ybWFsTWFwID09PSB1bmRlZmluZWQgPyBudWxsIDogbWF0ZXJpYWxQYXJhbXMubm9ybWFsTWFwO1xuXHRcdG1hdGVyaWFsLm5vcm1hbE1hcFR5cGUgPSBUYW5nZW50U3BhY2VOb3JtYWxNYXA7XG5cblx0XHRpZiAoIG1hdGVyaWFsUGFyYW1zLm5vcm1hbFNjYWxlICkgbWF0ZXJpYWwubm9ybWFsU2NhbGUgPSBtYXRlcmlhbFBhcmFtcy5ub3JtYWxTY2FsZTtcblxuXHRcdG1hdGVyaWFsLmRpc3BsYWNlbWVudE1hcCA9IG51bGw7XG5cdFx0bWF0ZXJpYWwuZGlzcGxhY2VtZW50U2NhbGUgPSAxO1xuXHRcdG1hdGVyaWFsLmRpc3BsYWNlbWVudEJpYXMgPSAwO1xuXG5cdFx0bWF0ZXJpYWwuc3BlY3VsYXJNYXAgPSBtYXRlcmlhbFBhcmFtcy5zcGVjdWxhck1hcCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG1hdGVyaWFsUGFyYW1zLnNwZWN1bGFyTWFwO1xuXHRcdG1hdGVyaWFsLnNwZWN1bGFyID0gbWF0ZXJpYWxQYXJhbXMuc3BlY3VsYXI7XG5cblx0XHRtYXRlcmlhbC5nbG9zc2luZXNzTWFwID0gbWF0ZXJpYWxQYXJhbXMuZ2xvc3NpbmVzc01hcCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG1hdGVyaWFsUGFyYW1zLmdsb3NzaW5lc3NNYXA7XG5cdFx0bWF0ZXJpYWwuZ2xvc3NpbmVzcyA9IG1hdGVyaWFsUGFyYW1zLmdsb3NzaW5lc3M7XG5cblx0XHRtYXRlcmlhbC5hbHBoYU1hcCA9IG51bGw7XG5cblx0XHRtYXRlcmlhbC5lbnZNYXAgPSBtYXRlcmlhbFBhcmFtcy5lbnZNYXAgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBtYXRlcmlhbFBhcmFtcy5lbnZNYXA7XG5cdFx0bWF0ZXJpYWwuZW52TWFwSW50ZW5zaXR5ID0gMS4wO1xuXG5cdFx0bWF0ZXJpYWwucmVmcmFjdGlvblJhdGlvID0gMC45ODtcblxuXHRcdHJldHVybiBtYXRlcmlhbDtcblxuXHR9XG5cbn1cblxuLyoqXG4gKiBNZXNoIFF1YW50aXphdGlvbiBFeHRlbnNpb25cbiAqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvZXh0ZW5zaW9ucy8yLjAvS2hyb25vcy9LSFJfbWVzaF9xdWFudGl6YXRpb25cbiAqL1xuY2xhc3MgR0xURk1lc2hRdWFudGl6YXRpb25FeHRlbnNpb24ge1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXG5cdFx0dGhpcy5uYW1lID0gRVhURU5TSU9OUy5LSFJfTUVTSF9RVUFOVElaQVRJT047XG5cblx0fVxuXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqKioqKiBJTlRFUlBPTEFUSU9OICoqKioqKioqL1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gU3BsaW5lIEludGVycG9sYXRpb25cbi8vIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi9ibG9iL21hc3Rlci9zcGVjaWZpY2F0aW9uLzIuMC9SRUFETUUubWQjYXBwZW5kaXgtYy1zcGxpbmUtaW50ZXJwb2xhdGlvblxuY2xhc3MgR0xURkN1YmljU3BsaW5lSW50ZXJwb2xhbnQgZXh0ZW5kcyBJbnRlcnBvbGFudCB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmFtZXRlclBvc2l0aW9ucywgc2FtcGxlVmFsdWVzLCBzYW1wbGVTaXplLCByZXN1bHRCdWZmZXIgKSB7XG5cblx0XHRzdXBlciggcGFyYW1ldGVyUG9zaXRpb25zLCBzYW1wbGVWYWx1ZXMsIHNhbXBsZVNpemUsIHJlc3VsdEJ1ZmZlciApO1xuXG5cdH1cblxuXHRjb3B5U2FtcGxlVmFsdWVfKCBpbmRleCApIHtcblxuXHRcdC8vIENvcGllcyBhIHNhbXBsZSB2YWx1ZSB0byB0aGUgcmVzdWx0IGJ1ZmZlci4gU2VlIGRlc2NyaXB0aW9uIG9mIGdsVEZcblx0XHQvLyBDVUJJQ1NQTElORSB2YWx1ZXMgbGF5b3V0IGluIGludGVycG9sYXRlXygpIGZ1bmN0aW9uIGJlbG93LlxuXG5cdFx0Y29uc3QgcmVzdWx0ID0gdGhpcy5yZXN1bHRCdWZmZXIsXG5cdFx0XHR2YWx1ZXMgPSB0aGlzLnNhbXBsZVZhbHVlcyxcblx0XHRcdHZhbHVlU2l6ZSA9IHRoaXMudmFsdWVTaXplLFxuXHRcdFx0b2Zmc2V0ID0gaW5kZXggKiB2YWx1ZVNpemUgKiAzICsgdmFsdWVTaXplO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpICE9PSB2YWx1ZVNpemU7IGkgKysgKSB7XG5cblx0XHRcdHJlc3VsdFsgaSBdID0gdmFsdWVzWyBvZmZzZXQgKyBpIF07XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXG5cdH1cblxufVxuXG5HTFRGQ3ViaWNTcGxpbmVJbnRlcnBvbGFudC5wcm90b3R5cGUuYmVmb3JlU3RhcnRfID0gR0xURkN1YmljU3BsaW5lSW50ZXJwb2xhbnQucHJvdG90eXBlLmNvcHlTYW1wbGVWYWx1ZV87XG5cbkdMVEZDdWJpY1NwbGluZUludGVycG9sYW50LnByb3RvdHlwZS5hZnRlckVuZF8gPSBHTFRGQ3ViaWNTcGxpbmVJbnRlcnBvbGFudC5wcm90b3R5cGUuY29weVNhbXBsZVZhbHVlXztcblxuR0xURkN1YmljU3BsaW5lSW50ZXJwb2xhbnQucHJvdG90eXBlLmludGVycG9sYXRlXyA9IGZ1bmN0aW9uICggaTEsIHQwLCB0LCB0MSApIHtcblxuXHRjb25zdCByZXN1bHQgPSB0aGlzLnJlc3VsdEJ1ZmZlcjtcblx0Y29uc3QgdmFsdWVzID0gdGhpcy5zYW1wbGVWYWx1ZXM7XG5cdGNvbnN0IHN0cmlkZSA9IHRoaXMudmFsdWVTaXplO1xuXG5cdGNvbnN0IHN0cmlkZTIgPSBzdHJpZGUgKiAyO1xuXHRjb25zdCBzdHJpZGUzID0gc3RyaWRlICogMztcblxuXHRjb25zdCB0ZCA9IHQxIC0gdDA7XG5cblx0Y29uc3QgcCA9ICggdCAtIHQwICkgLyB0ZDtcblx0Y29uc3QgcHAgPSBwICogcDtcblx0Y29uc3QgcHBwID0gcHAgKiBwO1xuXG5cdGNvbnN0IG9mZnNldDEgPSBpMSAqIHN0cmlkZTM7XG5cdGNvbnN0IG9mZnNldDAgPSBvZmZzZXQxIC0gc3RyaWRlMztcblxuXHRjb25zdCBzMiA9IC0gMiAqIHBwcCArIDMgKiBwcDtcblx0Y29uc3QgczMgPSBwcHAgLSBwcDtcblx0Y29uc3QgczAgPSAxIC0gczI7XG5cdGNvbnN0IHMxID0gczMgLSBwcCArIHA7XG5cblx0Ly8gTGF5b3V0IG9mIGtleWZyYW1lIG91dHB1dCB2YWx1ZXMgZm9yIENVQklDU1BMSU5FIGFuaW1hdGlvbnM6XG5cdC8vICAgWyBpblRhbmdlbnRfMSwgc3BsaW5lVmVydGV4XzEsIG91dFRhbmdlbnRfMSwgaW5UYW5nZW50XzIsIHNwbGluZVZlcnRleF8yLCAuLi4gXVxuXHRmb3IgKCBsZXQgaSA9IDA7IGkgIT09IHN0cmlkZTsgaSArKyApIHtcblxuXHRcdGNvbnN0IHAwID0gdmFsdWVzWyBvZmZzZXQwICsgaSArIHN0cmlkZSBdOyAvLyBzcGxpbmVWZXJ0ZXhfa1xuXHRcdGNvbnN0IG0wID0gdmFsdWVzWyBvZmZzZXQwICsgaSArIHN0cmlkZTIgXSAqIHRkOyAvLyBvdXRUYW5nZW50X2sgKiAodF9rKzEgLSB0X2spXG5cdFx0Y29uc3QgcDEgPSB2YWx1ZXNbIG9mZnNldDEgKyBpICsgc3RyaWRlIF07IC8vIHNwbGluZVZlcnRleF9rKzFcblx0XHRjb25zdCBtMSA9IHZhbHVlc1sgb2Zmc2V0MSArIGkgXSAqIHRkOyAvLyBpblRhbmdlbnRfaysxICogKHRfaysxIC0gdF9rKVxuXG5cdFx0cmVzdWx0WyBpIF0gPSBzMCAqIHAwICsgczEgKiBtMCArIHMyICogcDEgKyBzMyAqIG0xO1xuXG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xuXG59O1xuXG5jb25zdCBfcSA9IG5ldyBRdWF0ZXJuaW9uKCk7XG5cbmNsYXNzIEdMVEZDdWJpY1NwbGluZVF1YXRlcm5pb25JbnRlcnBvbGFudCBleHRlbmRzIEdMVEZDdWJpY1NwbGluZUludGVycG9sYW50IHtcblxuXHRpbnRlcnBvbGF0ZV8oIGkxLCB0MCwgdCwgdDEgKSB7XG5cblx0XHRjb25zdCByZXN1bHQgPSBzdXBlci5pbnRlcnBvbGF0ZV8oIGkxLCB0MCwgdCwgdDEgKTtcblxuXHRcdF9xLmZyb21BcnJheSggcmVzdWx0ICkubm9ybWFsaXplKCkudG9BcnJheSggcmVzdWx0ICk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXG5cdH1cblxufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqKioqKiBJTlRFUk5BTFMgKioqKioqKioqKioqL1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLyogQ09OU1RBTlRTICovXG5cbmNvbnN0IFdFQkdMX0NPTlNUQU5UUyA9IHtcblx0RkxPQVQ6IDUxMjYsXG5cdC8vRkxPQVRfTUFUMjogMzU2NzQsXG5cdEZMT0FUX01BVDM6IDM1Njc1LFxuXHRGTE9BVF9NQVQ0OiAzNTY3Nixcblx0RkxPQVRfVkVDMjogMzU2NjQsXG5cdEZMT0FUX1ZFQzM6IDM1NjY1LFxuXHRGTE9BVF9WRUM0OiAzNTY2Nixcblx0TElORUFSOiA5NzI5LFxuXHRSRVBFQVQ6IDEwNDk3LFxuXHRTQU1QTEVSXzJEOiAzNTY3OCxcblx0UE9JTlRTOiAwLFxuXHRMSU5FUzogMSxcblx0TElORV9MT09QOiAyLFxuXHRMSU5FX1NUUklQOiAzLFxuXHRUUklBTkdMRVM6IDQsXG5cdFRSSUFOR0xFX1NUUklQOiA1LFxuXHRUUklBTkdMRV9GQU46IDYsXG5cdFVOU0lHTkVEX0JZVEU6IDUxMjEsXG5cdFVOU0lHTkVEX1NIT1JUOiA1MTIzXG59O1xuXG5jb25zdCBXRUJHTF9DT01QT05FTlRfVFlQRVMgPSB7XG5cdDUxMjA6IEludDhBcnJheSxcblx0NTEyMTogVWludDhBcnJheSxcblx0NTEyMjogSW50MTZBcnJheSxcblx0NTEyMzogVWludDE2QXJyYXksXG5cdDUxMjU6IFVpbnQzMkFycmF5LFxuXHQ1MTI2OiBGbG9hdDMyQXJyYXlcbn07XG5cbmNvbnN0IFdFQkdMX0ZJTFRFUlMgPSB7XG5cdDk3Mjg6IE5lYXJlc3RGaWx0ZXIsXG5cdDk3Mjk6IExpbmVhckZpbHRlcixcblx0OTk4NDogTmVhcmVzdE1pcG1hcE5lYXJlc3RGaWx0ZXIsXG5cdDk5ODU6IExpbmVhck1pcG1hcE5lYXJlc3RGaWx0ZXIsXG5cdDk5ODY6IE5lYXJlc3RNaXBtYXBMaW5lYXJGaWx0ZXIsXG5cdDk5ODc6IExpbmVhck1pcG1hcExpbmVhckZpbHRlclxufTtcblxuY29uc3QgV0VCR0xfV1JBUFBJTkdTID0ge1xuXHQzMzA3MTogQ2xhbXBUb0VkZ2VXcmFwcGluZyxcblx0MzM2NDg6IE1pcnJvcmVkUmVwZWF0V3JhcHBpbmcsXG5cdDEwNDk3OiBSZXBlYXRXcmFwcGluZ1xufTtcblxuY29uc3QgV0VCR0xfVFlQRV9TSVpFUyA9IHtcblx0J1NDQUxBUic6IDEsXG5cdCdWRUMyJzogMixcblx0J1ZFQzMnOiAzLFxuXHQnVkVDNCc6IDQsXG5cdCdNQVQyJzogNCxcblx0J01BVDMnOiA5LFxuXHQnTUFUNCc6IDE2XG59O1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuXHRQT1NJVElPTjogJ3Bvc2l0aW9uJyxcblx0Tk9STUFMOiAnbm9ybWFsJyxcblx0VEFOR0VOVDogJ3RhbmdlbnQnLFxuXHRURVhDT09SRF8wOiAndXYnLFxuXHRURVhDT09SRF8xOiAndXYyJyxcblx0Q09MT1JfMDogJ2NvbG9yJyxcblx0V0VJR0hUU18wOiAnc2tpbldlaWdodCcsXG5cdEpPSU5UU18wOiAnc2tpbkluZGV4Jyxcbn07XG5cbmNvbnN0IFBBVEhfUFJPUEVSVElFUyA9IHtcblx0c2NhbGU6ICdzY2FsZScsXG5cdHRyYW5zbGF0aW9uOiAncG9zaXRpb24nLFxuXHRyb3RhdGlvbjogJ3F1YXRlcm5pb24nLFxuXHR3ZWlnaHRzOiAnbW9ycGhUYXJnZXRJbmZsdWVuY2VzJ1xufTtcblxuY29uc3QgSU5URVJQT0xBVElPTiA9IHtcblx0Q1VCSUNTUExJTkU6IHVuZGVmaW5lZCwgLy8gV2UgdXNlIGEgY3VzdG9tIGludGVycG9sYW50IChHTFRGQ3ViaWNTcGxpbmVJbnRlcnBvbGF0aW9uKSBmb3IgQ1VCSUNTUExJTkUgdHJhY2tzLiBFYWNoXG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgLy8ga2V5ZnJhbWUgdHJhY2sgd2lsbCBiZSBpbml0aWFsaXplZCB3aXRoIGEgZGVmYXVsdCBpbnRlcnBvbGF0aW9uIHR5cGUsIHRoZW4gbW9kaWZpZWQuXG5cdExJTkVBUjogSW50ZXJwb2xhdGVMaW5lYXIsXG5cdFNURVA6IEludGVycG9sYXRlRGlzY3JldGVcbn07XG5cbmNvbnN0IEFMUEhBX01PREVTID0ge1xuXHRPUEFRVUU6ICdPUEFRVUUnLFxuXHRNQVNLOiAnTUFTSycsXG5cdEJMRU5EOiAnQkxFTkQnXG59O1xuXG4vKiBVVElMSVRZIEZVTkNUSU9OUyAqL1xuXG5mdW5jdGlvbiByZXNvbHZlVVJMKCB1cmwsIHBhdGggKSB7XG5cblx0Ly8gSW52YWxpZCBVUkxcblx0aWYgKCB0eXBlb2YgdXJsICE9PSAnc3RyaW5nJyB8fCB1cmwgPT09ICcnICkgcmV0dXJuICcnO1xuXG5cdC8vIEhvc3QgUmVsYXRpdmUgVVJMXG5cdGlmICggL15odHRwcz86XFwvXFwvL2kudGVzdCggcGF0aCApICYmIC9eXFwvLy50ZXN0KCB1cmwgKSApIHtcblxuXHRcdHBhdGggPSBwYXRoLnJlcGxhY2UoIC8oXmh0dHBzPzpcXC9cXC9bXlxcL10rKS4qL2ksICckMScgKTtcblxuXHR9XG5cblx0Ly8gQWJzb2x1dGUgVVJMIGh0dHA6Ly8saHR0cHM6Ly8sLy9cblx0aWYgKCAvXihodHRwcz86KT9cXC9cXC8vaS50ZXN0KCB1cmwgKSApIHJldHVybiB1cmw7XG5cblx0Ly8gRGF0YSBVUklcblx0aWYgKCAvXmRhdGE6LiosLiokL2kudGVzdCggdXJsICkgKSByZXR1cm4gdXJsO1xuXG5cdC8vIEJsb2IgVVJMXG5cdGlmICggL15ibG9iOi4qJC9pLnRlc3QoIHVybCApICkgcmV0dXJuIHVybDtcblxuXHQvLyBSZWxhdGl2ZSBVUkxcblx0cmV0dXJuIHBhdGggKyB1cmw7XG5cbn1cblxuLyoqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvYmxvYi9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAvUkVBRE1FLm1kI2RlZmF1bHQtbWF0ZXJpYWxcbiAqL1xuZnVuY3Rpb24gY3JlYXRlRGVmYXVsdE1hdGVyaWFsKCBjYWNoZSApIHtcblxuXHRpZiAoIGNhY2hlWyAnRGVmYXVsdE1hdGVyaWFsJyBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRjYWNoZVsgJ0RlZmF1bHRNYXRlcmlhbCcgXSA9IG5ldyBNZXNoU3RhbmRhcmRNYXRlcmlhbCgge1xuXHRcdFx0Y29sb3I6IDB4RkZGRkZGLFxuXHRcdFx0ZW1pc3NpdmU6IDB4MDAwMDAwLFxuXHRcdFx0bWV0YWxuZXNzOiAxLFxuXHRcdFx0cm91Z2huZXNzOiAxLFxuXHRcdFx0dHJhbnNwYXJlbnQ6IGZhbHNlLFxuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlLFxuXHRcdFx0c2lkZTogRnJvbnRTaWRlXG5cdFx0fSApO1xuXG5cdH1cblxuXHRyZXR1cm4gY2FjaGVbICdEZWZhdWx0TWF0ZXJpYWwnIF07XG5cbn1cblxuZnVuY3Rpb24gYWRkVW5rbm93bkV4dGVuc2lvbnNUb1VzZXJEYXRhKCBrbm93bkV4dGVuc2lvbnMsIG9iamVjdCwgb2JqZWN0RGVmICkge1xuXG5cdC8vIEFkZCB1bmtub3duIGdsVEYgZXh0ZW5zaW9ucyB0byBhbiBvYmplY3QncyB1c2VyRGF0YS5cblxuXHRmb3IgKCBjb25zdCBuYW1lIGluIG9iamVjdERlZi5leHRlbnNpb25zICkge1xuXG5cdFx0aWYgKCBrbm93bkV4dGVuc2lvbnNbIG5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRvYmplY3QudXNlckRhdGEuZ2x0ZkV4dGVuc2lvbnMgPSBvYmplY3QudXNlckRhdGEuZ2x0ZkV4dGVuc2lvbnMgfHwge307XG5cdFx0XHRvYmplY3QudXNlckRhdGEuZ2x0ZkV4dGVuc2lvbnNbIG5hbWUgXSA9IG9iamVjdERlZi5leHRlbnNpb25zWyBuYW1lIF07XG5cblx0XHR9XG5cblx0fVxuXG59XG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3QzRHxNYXRlcmlhbHxCdWZmZXJHZW9tZXRyeX0gb2JqZWN0XG4gKiBAcGFyYW0ge0dMVEYuZGVmaW5pdGlvbn0gZ2x0ZkRlZlxuICovXG5mdW5jdGlvbiBhc3NpZ25FeHRyYXNUb1VzZXJEYXRhKCBvYmplY3QsIGdsdGZEZWYgKSB7XG5cblx0aWYgKCBnbHRmRGVmLmV4dHJhcyAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0aWYgKCB0eXBlb2YgZ2x0ZkRlZi5leHRyYXMgPT09ICdvYmplY3QnICkge1xuXG5cdFx0XHRPYmplY3QuYXNzaWduKCBvYmplY3QudXNlckRhdGEsIGdsdGZEZWYuZXh0cmFzICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5HTFRGTG9hZGVyOiBJZ25vcmluZyBwcmltaXRpdmUgdHlwZSAuZXh0cmFzLCAnICsgZ2x0ZkRlZi5leHRyYXMgKTtcblxuXHRcdH1cblxuXHR9XG5cbn1cblxuLyoqXG4gKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvYmxvYi9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAvUkVBRE1FLm1kI21vcnBoLXRhcmdldHNcbiAqXG4gKiBAcGFyYW0ge0J1ZmZlckdlb21ldHJ5fSBnZW9tZXRyeVxuICogQHBhcmFtIHtBcnJheTxHTFRGLlRhcmdldD59IHRhcmdldHNcbiAqIEBwYXJhbSB7R0xURlBhcnNlcn0gcGFyc2VyXG4gKiBAcmV0dXJuIHtQcm9taXNlPEJ1ZmZlckdlb21ldHJ5Pn1cbiAqL1xuZnVuY3Rpb24gYWRkTW9ycGhUYXJnZXRzKCBnZW9tZXRyeSwgdGFyZ2V0cywgcGFyc2VyICkge1xuXG5cdGxldCBoYXNNb3JwaFBvc2l0aW9uID0gZmFsc2U7XG5cdGxldCBoYXNNb3JwaE5vcm1hbCA9IGZhbHNlO1xuXG5cdGZvciAoIGxldCBpID0gMCwgaWwgPSB0YXJnZXRzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gdGFyZ2V0c1sgaSBdO1xuXG5cdFx0aWYgKCB0YXJnZXQuUE9TSVRJT04gIT09IHVuZGVmaW5lZCApIGhhc01vcnBoUG9zaXRpb24gPSB0cnVlO1xuXHRcdGlmICggdGFyZ2V0Lk5PUk1BTCAhPT0gdW5kZWZpbmVkICkgaGFzTW9ycGhOb3JtYWwgPSB0cnVlO1xuXG5cdFx0aWYgKCBoYXNNb3JwaFBvc2l0aW9uICYmIGhhc01vcnBoTm9ybWFsICkgYnJlYWs7XG5cblx0fVxuXG5cdGlmICggISBoYXNNb3JwaFBvc2l0aW9uICYmICEgaGFzTW9ycGhOb3JtYWwgKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBnZW9tZXRyeSApO1xuXG5cdGNvbnN0IHBlbmRpbmdQb3NpdGlvbkFjY2Vzc29ycyA9IFtdO1xuXHRjb25zdCBwZW5kaW5nTm9ybWFsQWNjZXNzb3JzID0gW107XG5cblx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IHRhcmdldHMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRjb25zdCB0YXJnZXQgPSB0YXJnZXRzWyBpIF07XG5cblx0XHRpZiAoIGhhc01vcnBoUG9zaXRpb24gKSB7XG5cblx0XHRcdGNvbnN0IHBlbmRpbmdBY2Nlc3NvciA9IHRhcmdldC5QT1NJVElPTiAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdD8gcGFyc2VyLmdldERlcGVuZGVuY3koICdhY2Nlc3NvcicsIHRhcmdldC5QT1NJVElPTiApXG5cdFx0XHRcdDogZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbjtcblxuXHRcdFx0cGVuZGluZ1Bvc2l0aW9uQWNjZXNzb3JzLnB1c2goIHBlbmRpbmdBY2Nlc3NvciApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBoYXNNb3JwaE5vcm1hbCApIHtcblxuXHRcdFx0Y29uc3QgcGVuZGluZ0FjY2Vzc29yID0gdGFyZ2V0Lk5PUk1BTCAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdD8gcGFyc2VyLmdldERlcGVuZGVuY3koICdhY2Nlc3NvcicsIHRhcmdldC5OT1JNQUwgKVxuXHRcdFx0XHQ6IGdlb21ldHJ5LmF0dHJpYnV0ZXMubm9ybWFsO1xuXG5cdFx0XHRwZW5kaW5nTm9ybWFsQWNjZXNzb3JzLnB1c2goIHBlbmRpbmdBY2Nlc3NvciApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRyZXR1cm4gUHJvbWlzZS5hbGwoIFtcblx0XHRQcm9taXNlLmFsbCggcGVuZGluZ1Bvc2l0aW9uQWNjZXNzb3JzICksXG5cdFx0UHJvbWlzZS5hbGwoIHBlbmRpbmdOb3JtYWxBY2Nlc3NvcnMgKVxuXHRdICkudGhlbiggZnVuY3Rpb24gKCBhY2Nlc3NvcnMgKSB7XG5cblx0XHRjb25zdCBtb3JwaFBvc2l0aW9ucyA9IGFjY2Vzc29yc1sgMCBdO1xuXHRcdGNvbnN0IG1vcnBoTm9ybWFscyA9IGFjY2Vzc29yc1sgMSBdO1xuXG5cdFx0aWYgKCBoYXNNb3JwaFBvc2l0aW9uICkgZ2VvbWV0cnkubW9ycGhBdHRyaWJ1dGVzLnBvc2l0aW9uID0gbW9ycGhQb3NpdGlvbnM7XG5cdFx0aWYgKCBoYXNNb3JwaE5vcm1hbCApIGdlb21ldHJ5Lm1vcnBoQXR0cmlidXRlcy5ub3JtYWwgPSBtb3JwaE5vcm1hbHM7XG5cdFx0Z2VvbWV0cnkubW9ycGhUYXJnZXRzUmVsYXRpdmUgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIGdlb21ldHJ5O1xuXG5cdH0gKTtcblxufVxuXG4vKipcbiAqIEBwYXJhbSB7TWVzaH0gbWVzaFxuICogQHBhcmFtIHtHTFRGLk1lc2h9IG1lc2hEZWZcbiAqL1xuZnVuY3Rpb24gdXBkYXRlTW9ycGhUYXJnZXRzKCBtZXNoLCBtZXNoRGVmICkge1xuXG5cdG1lc2gudXBkYXRlTW9ycGhUYXJnZXRzKCk7XG5cblx0aWYgKCBtZXNoRGVmLndlaWdodHMgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBtZXNoRGVmLndlaWdodHMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdG1lc2gubW9ycGhUYXJnZXRJbmZsdWVuY2VzWyBpIF0gPSBtZXNoRGVmLndlaWdodHNbIGkgXTtcblxuXHRcdH1cblxuXHR9XG5cblx0Ly8gLmV4dHJhcyBoYXMgdXNlci1kZWZpbmVkIGRhdGEsIHNvIGNoZWNrIHRoYXQgLmV4dHJhcy50YXJnZXROYW1lcyBpcyBhbiBhcnJheS5cblx0aWYgKCBtZXNoRGVmLmV4dHJhcyAmJiBBcnJheS5pc0FycmF5KCBtZXNoRGVmLmV4dHJhcy50YXJnZXROYW1lcyApICkge1xuXG5cdFx0Y29uc3QgdGFyZ2V0TmFtZXMgPSBtZXNoRGVmLmV4dHJhcy50YXJnZXROYW1lcztcblxuXHRcdGlmICggbWVzaC5tb3JwaFRhcmdldEluZmx1ZW5jZXMubGVuZ3RoID09PSB0YXJnZXROYW1lcy5sZW5ndGggKSB7XG5cblx0XHRcdG1lc2gubW9ycGhUYXJnZXREaWN0aW9uYXJ5ID0ge307XG5cblx0XHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSB0YXJnZXROYW1lcy5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0XHRtZXNoLm1vcnBoVGFyZ2V0RGljdGlvbmFyeVsgdGFyZ2V0TmFtZXNbIGkgXSBdID0gaTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuR0xURkxvYWRlcjogSW52YWxpZCBleHRyYXMudGFyZ2V0TmFtZXMgbGVuZ3RoLiBJZ25vcmluZyBuYW1lcy4nICk7XG5cblx0XHR9XG5cblx0fVxuXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW1pdGl2ZUtleSggcHJpbWl0aXZlRGVmICkge1xuXG5cdGNvbnN0IGRyYWNvRXh0ZW5zaW9uID0gcHJpbWl0aXZlRGVmLmV4dGVuc2lvbnMgJiYgcHJpbWl0aXZlRGVmLmV4dGVuc2lvbnNbIEVYVEVOU0lPTlMuS0hSX0RSQUNPX01FU0hfQ09NUFJFU1NJT04gXTtcblx0bGV0IGdlb21ldHJ5S2V5O1xuXG5cdGlmICggZHJhY29FeHRlbnNpb24gKSB7XG5cblx0XHRnZW9tZXRyeUtleSA9ICdkcmFjbzonICsgZHJhY29FeHRlbnNpb24uYnVmZmVyVmlld1xuXHRcdFx0XHQrICc6JyArIGRyYWNvRXh0ZW5zaW9uLmluZGljZXNcblx0XHRcdFx0KyAnOicgKyBjcmVhdGVBdHRyaWJ1dGVzS2V5KCBkcmFjb0V4dGVuc2lvbi5hdHRyaWJ1dGVzICk7XG5cblx0fSBlbHNlIHtcblxuXHRcdGdlb21ldHJ5S2V5ID0gcHJpbWl0aXZlRGVmLmluZGljZXMgKyAnOicgKyBjcmVhdGVBdHRyaWJ1dGVzS2V5KCBwcmltaXRpdmVEZWYuYXR0cmlidXRlcyApICsgJzonICsgcHJpbWl0aXZlRGVmLm1vZGU7XG5cblx0fVxuXG5cdHJldHVybiBnZW9tZXRyeUtleTtcblxufVxuXG5mdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVzS2V5KCBhdHRyaWJ1dGVzICkge1xuXG5cdGxldCBhdHRyaWJ1dGVzS2V5ID0gJyc7XG5cblx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKCBhdHRyaWJ1dGVzICkuc29ydCgpO1xuXG5cdGZvciAoIGxldCBpID0gMCwgaWwgPSBrZXlzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0YXR0cmlidXRlc0tleSArPSBrZXlzWyBpIF0gKyAnOicgKyBhdHRyaWJ1dGVzWyBrZXlzWyBpIF0gXSArICc7JztcblxuXHR9XG5cblx0cmV0dXJuIGF0dHJpYnV0ZXNLZXk7XG5cbn1cblxuZnVuY3Rpb24gZ2V0Tm9ybWFsaXplZENvbXBvbmVudFNjYWxlKCBjb25zdHJ1Y3RvciApIHtcblxuXHQvLyBSZWZlcmVuY2U6XG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi90cmVlL21hc3Rlci9leHRlbnNpb25zLzIuMC9LaHJvbm9zL0tIUl9tZXNoX3F1YW50aXphdGlvbiNlbmNvZGluZy1xdWFudGl6ZWQtZGF0YVxuXG5cdHN3aXRjaCAoIGNvbnN0cnVjdG9yICkge1xuXG5cdFx0Y2FzZSBJbnQ4QXJyYXk6XG5cdFx0XHRyZXR1cm4gMSAvIDEyNztcblxuXHRcdGNhc2UgVWludDhBcnJheTpcblx0XHRcdHJldHVybiAxIC8gMjU1O1xuXG5cdFx0Y2FzZSBJbnQxNkFycmF5OlxuXHRcdFx0cmV0dXJuIDEgLyAzMjc2NztcblxuXHRcdGNhc2UgVWludDE2QXJyYXk6XG5cdFx0XHRyZXR1cm4gMSAvIDY1NTM1O1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLkdMVEZMb2FkZXI6IFVuc3VwcG9ydGVkIG5vcm1hbGl6ZWQgYWNjZXNzb3IgY29tcG9uZW50IHR5cGUuJyApO1xuXG5cdH1cblxufVxuXG4vKiBHTFRGIFBBUlNFUiAqL1xuXG5jbGFzcyBHTFRGUGFyc2VyIHtcblxuXHRjb25zdHJ1Y3RvcigganNvbiA9IHt9LCBvcHRpb25zID0ge30gKSB7XG5cblx0XHR0aGlzLmpzb24gPSBqc29uO1xuXHRcdHRoaXMuZXh0ZW5zaW9ucyA9IHt9O1xuXHRcdHRoaXMucGx1Z2lucyA9IHt9O1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0XHQvLyBsb2FkZXIgb2JqZWN0IGNhY2hlXG5cdFx0dGhpcy5jYWNoZSA9IG5ldyBHTFRGUmVnaXN0cnkoKTtcblxuXHRcdC8vIGFzc29jaWF0aW9ucyBiZXR3ZWVuIFRocmVlLmpzIG9iamVjdHMgYW5kIGdsVEYgZWxlbWVudHNcblx0XHR0aGlzLmFzc29jaWF0aW9ucyA9IG5ldyBNYXAoKTtcblxuXHRcdC8vIEJ1ZmZlckdlb21ldHJ5IGNhY2hpbmdcblx0XHR0aGlzLnByaW1pdGl2ZUNhY2hlID0ge307XG5cblx0XHQvLyBPYmplY3QzRCBpbnN0YW5jZSBjYWNoZXNcblx0XHR0aGlzLm1lc2hDYWNoZSA9IHsgcmVmczoge30sIHVzZXM6IHt9IH07XG5cdFx0dGhpcy5jYW1lcmFDYWNoZSA9IHsgcmVmczoge30sIHVzZXM6IHt9IH07XG5cdFx0dGhpcy5saWdodENhY2hlID0geyByZWZzOiB7fSwgdXNlczoge30gfTtcblxuXHRcdHRoaXMudGV4dHVyZUNhY2hlID0ge307XG5cblx0XHQvLyBUcmFjayBub2RlIG5hbWVzLCB0byBlbnN1cmUgbm8gZHVwbGljYXRlc1xuXHRcdHRoaXMubm9kZU5hbWVzVXNlZCA9IHt9O1xuXG5cdFx0Ly8gVXNlIGFuIEltYWdlQml0bWFwTG9hZGVyIGlmIGltYWdlQml0bWFwcyBhcmUgc3VwcG9ydGVkLiBNb3ZlcyBtdWNoIG9mIHRoZVxuXHRcdC8vIGV4cGVuc2l2ZSB3b3JrIG9mIHVwbG9hZGluZyBhIHRleHR1cmUgdG8gdGhlIEdQVSBvZmYgdGhlIG1haW4gdGhyZWFkLlxuXHRcdGlmICggdHlwZW9mIGNyZWF0ZUltYWdlQml0bWFwICE9PSAndW5kZWZpbmVkJyAmJiAvRmlyZWZveC8udGVzdCggbmF2aWdhdG9yLnVzZXJBZ2VudCApID09PSBmYWxzZSApIHtcblxuXHRcdFx0dGhpcy50ZXh0dXJlTG9hZGVyID0gbmV3IEltYWdlQml0bWFwTG9hZGVyKCB0aGlzLm9wdGlvbnMubWFuYWdlciApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy50ZXh0dXJlTG9hZGVyID0gbmV3IFRleHR1cmVMb2FkZXIoIHRoaXMub3B0aW9ucy5tYW5hZ2VyICk7XG5cblx0XHR9XG5cblx0XHR0aGlzLnRleHR1cmVMb2FkZXIuc2V0Q3Jvc3NPcmlnaW4oIHRoaXMub3B0aW9ucy5jcm9zc09yaWdpbiApO1xuXHRcdHRoaXMudGV4dHVyZUxvYWRlci5zZXRSZXF1ZXN0SGVhZGVyKCB0aGlzLm9wdGlvbnMucmVxdWVzdEhlYWRlciApO1xuXG5cdFx0dGhpcy5maWxlTG9hZGVyID0gbmV3IEZpbGVMb2FkZXIoIHRoaXMub3B0aW9ucy5tYW5hZ2VyICk7XG5cdFx0dGhpcy5maWxlTG9hZGVyLnNldFJlc3BvbnNlVHlwZSggJ2FycmF5YnVmZmVyJyApO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuY3Jvc3NPcmlnaW4gPT09ICd1c2UtY3JlZGVudGlhbHMnICkge1xuXG5cdFx0XHR0aGlzLmZpbGVMb2FkZXIuc2V0V2l0aENyZWRlbnRpYWxzKCB0cnVlICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHNldEV4dGVuc2lvbnMoIGV4dGVuc2lvbnMgKSB7XG5cblx0XHR0aGlzLmV4dGVuc2lvbnMgPSBleHRlbnNpb25zO1xuXG5cdH1cblxuXHRzZXRQbHVnaW5zKCBwbHVnaW5zICkge1xuXG5cdFx0dGhpcy5wbHVnaW5zID0gcGx1Z2lucztcblxuXHR9XG5cblx0cGFyc2UoIG9uTG9hZCwgb25FcnJvciApIHtcblxuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXM7XG5cdFx0Y29uc3QganNvbiA9IHRoaXMuanNvbjtcblx0XHRjb25zdCBleHRlbnNpb25zID0gdGhpcy5leHRlbnNpb25zO1xuXG5cdFx0Ly8gQ2xlYXIgdGhlIGxvYWRlciBjYWNoZVxuXHRcdHRoaXMuY2FjaGUucmVtb3ZlQWxsKCk7XG5cblx0XHQvLyBNYXJrIHRoZSBzcGVjaWFsIG5vZGVzL21lc2hlcyBpbiBqc29uIGZvciBlZmZpY2llbnQgcGFyc2Vcblx0XHR0aGlzLl9pbnZva2VBbGwoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRyZXR1cm4gZXh0Ll9tYXJrRGVmcyAmJiBleHQuX21hcmtEZWZzKCk7XG5cblx0XHR9ICk7XG5cblx0XHRQcm9taXNlLmFsbCggdGhpcy5faW52b2tlQWxsKCBmdW5jdGlvbiAoIGV4dCApIHtcblxuXHRcdFx0cmV0dXJuIGV4dC5iZWZvcmVSb290ICYmIGV4dC5iZWZvcmVSb290KCk7XG5cblx0XHR9ICkgKS50aGVuKCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLmFsbCggW1xuXG5cdFx0XHRcdHBhcnNlci5nZXREZXBlbmRlbmNpZXMoICdzY2VuZScgKSxcblx0XHRcdFx0cGFyc2VyLmdldERlcGVuZGVuY2llcyggJ2FuaW1hdGlvbicgKSxcblx0XHRcdFx0cGFyc2VyLmdldERlcGVuZGVuY2llcyggJ2NhbWVyYScgKSxcblxuXHRcdFx0XSApO1xuXG5cdFx0fSApLnRoZW4oIGZ1bmN0aW9uICggZGVwZW5kZW5jaWVzICkge1xuXG5cdFx0XHRjb25zdCByZXN1bHQgPSB7XG5cdFx0XHRcdHNjZW5lOiBkZXBlbmRlbmNpZXNbIDAgXVsganNvbi5zY2VuZSB8fCAwIF0sXG5cdFx0XHRcdHNjZW5lczogZGVwZW5kZW5jaWVzWyAwIF0sXG5cdFx0XHRcdGFuaW1hdGlvbnM6IGRlcGVuZGVuY2llc1sgMSBdLFxuXHRcdFx0XHRjYW1lcmFzOiBkZXBlbmRlbmNpZXNbIDIgXSxcblx0XHRcdFx0YXNzZXQ6IGpzb24uYXNzZXQsXG5cdFx0XHRcdHBhcnNlcjogcGFyc2VyLFxuXHRcdFx0XHR1c2VyRGF0YToge31cblx0XHRcdH07XG5cblx0XHRcdGFkZFVua25vd25FeHRlbnNpb25zVG9Vc2VyRGF0YSggZXh0ZW5zaW9ucywgcmVzdWx0LCBqc29uICk7XG5cblx0XHRcdGFzc2lnbkV4dHJhc1RvVXNlckRhdGEoIHJlc3VsdCwganNvbiApO1xuXG5cdFx0XHRQcm9taXNlLmFsbCggcGFyc2VyLl9pbnZva2VBbGwoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdHJldHVybiBleHQuYWZ0ZXJSb290ICYmIGV4dC5hZnRlclJvb3QoIHJlc3VsdCApO1xuXG5cdFx0XHR9ICkgKS50aGVuKCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdFx0b25Mb2FkKCByZXN1bHQgKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0fSApLmNhdGNoKCBvbkVycm9yICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBNYXJrcyB0aGUgc3BlY2lhbCBub2Rlcy9tZXNoZXMgaW4ganNvbiBmb3IgZWZmaWNpZW50IHBhcnNlLlxuXHQgKi9cblx0X21hcmtEZWZzKCkge1xuXG5cdFx0Y29uc3Qgbm9kZURlZnMgPSB0aGlzLmpzb24ubm9kZXMgfHwgW107XG5cdFx0Y29uc3Qgc2tpbkRlZnMgPSB0aGlzLmpzb24uc2tpbnMgfHwgW107XG5cdFx0Y29uc3QgbWVzaERlZnMgPSB0aGlzLmpzb24ubWVzaGVzIHx8IFtdO1xuXG5cdFx0Ly8gTm90aGluZyBpbiB0aGUgbm9kZSBkZWZpbml0aW9uIGluZGljYXRlcyB3aGV0aGVyIGl0IGlzIGEgQm9uZSBvciBhblxuXHRcdC8vIE9iamVjdDNELiBVc2UgdGhlIHNraW5zJyBqb2ludCByZWZlcmVuY2VzIHRvIG1hcmsgYm9uZXMuXG5cdFx0Zm9yICggbGV0IHNraW5JbmRleCA9IDAsIHNraW5MZW5ndGggPSBza2luRGVmcy5sZW5ndGg7IHNraW5JbmRleCA8IHNraW5MZW5ndGg7IHNraW5JbmRleCArKyApIHtcblxuXHRcdFx0Y29uc3Qgam9pbnRzID0gc2tpbkRlZnNbIHNraW5JbmRleCBdLmpvaW50cztcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IGpvaW50cy5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0XHRub2RlRGVmc1sgam9pbnRzWyBpIF0gXS5pc0JvbmUgPSB0cnVlO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHQvLyBJdGVyYXRlIG92ZXIgYWxsIG5vZGVzLCBtYXJraW5nIHJlZmVyZW5jZXMgdG8gc2hhcmVkIHJlc291cmNlcyxcblx0XHQvLyBhcyB3ZWxsIGFzIHNrZWxldG9uIGpvaW50cy5cblx0XHRmb3IgKCBsZXQgbm9kZUluZGV4ID0gMCwgbm9kZUxlbmd0aCA9IG5vZGVEZWZzLmxlbmd0aDsgbm9kZUluZGV4IDwgbm9kZUxlbmd0aDsgbm9kZUluZGV4ICsrICkge1xuXG5cdFx0XHRjb25zdCBub2RlRGVmID0gbm9kZURlZnNbIG5vZGVJbmRleCBdO1xuXG5cdFx0XHRpZiAoIG5vZGVEZWYubWVzaCAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdHRoaXMuX2FkZE5vZGVSZWYoIHRoaXMubWVzaENhY2hlLCBub2RlRGVmLm1lc2ggKTtcblxuXHRcdFx0XHQvLyBOb3RoaW5nIGluIHRoZSBtZXNoIGRlZmluaXRpb24gaW5kaWNhdGVzIHdoZXRoZXIgaXQgaXNcblx0XHRcdFx0Ly8gYSBTa2lubmVkTWVzaCBvciBNZXNoLiBVc2UgdGhlIG5vZGUncyBtZXNoIHJlZmVyZW5jZVxuXHRcdFx0XHQvLyB0byBtYXJrIFNraW5uZWRNZXNoIGlmIG5vZGUgaGFzIHNraW4uXG5cdFx0XHRcdGlmICggbm9kZURlZi5za2luICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRtZXNoRGVmc1sgbm9kZURlZi5tZXNoIF0uaXNTa2lubmVkTWVzaCA9IHRydWU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggbm9kZURlZi5jYW1lcmEgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHR0aGlzLl9hZGROb2RlUmVmKCB0aGlzLmNhbWVyYUNhY2hlLCBub2RlRGVmLmNhbWVyYSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDb3VudHMgcmVmZXJlbmNlcyB0byBzaGFyZWQgbm9kZSAvIE9iamVjdDNEIHJlc291cmNlcy4gVGhlc2UgcmVzb3VyY2VzXG5cdCAqIGNhbiBiZSByZXVzZWQsIG9yIFwiaW5zdGFudGlhdGVkXCIsIGF0IG11bHRpcGxlIG5vZGVzIGluIHRoZSBzY2VuZVxuXHQgKiBoaWVyYXJjaHkuIE1lc2gsIENhbWVyYSwgYW5kIExpZ2h0IGluc3RhbmNlcyBhcmUgaW5zdGFudGlhdGVkIGFuZCBtdXN0XG5cdCAqIGJlIG1hcmtlZC4gTm9uLXNjZW5lZ3JhcGggcmVzb3VyY2VzIChsaWtlIE1hdGVyaWFscywgR2VvbWV0cmllcywgYW5kXG5cdCAqIFRleHR1cmVzKSBjYW4gYmUgcmV1c2VkIGRpcmVjdGx5IGFuZCBhcmUgbm90IG1hcmtlZCBoZXJlLlxuXHQgKlxuXHQgKiBFeGFtcGxlOiBDZXNpdW1NaWxrVHJ1Y2sgc2FtcGxlIG1vZGVsIHJldXNlcyBcIldoZWVsXCIgbWVzaGVzLlxuXHQgKi9cblx0X2FkZE5vZGVSZWYoIGNhY2hlLCBpbmRleCApIHtcblxuXHRcdGlmICggaW5kZXggPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdGlmICggY2FjaGUucmVmc1sgaW5kZXggXSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRjYWNoZS5yZWZzWyBpbmRleCBdID0gY2FjaGUudXNlc1sgaW5kZXggXSA9IDA7XG5cblx0XHR9XG5cblx0XHRjYWNoZS5yZWZzWyBpbmRleCBdICsrO1xuXG5cdH1cblxuXHQvKiogUmV0dXJucyBhIHJlZmVyZW5jZSB0byBhIHNoYXJlZCByZXNvdXJjZSwgY2xvbmluZyBpdCBpZiBuZWNlc3NhcnkuICovXG5cdF9nZXROb2RlUmVmKCBjYWNoZSwgaW5kZXgsIG9iamVjdCApIHtcblxuXHRcdGlmICggY2FjaGUucmVmc1sgaW5kZXggXSA8PSAxICkgcmV0dXJuIG9iamVjdDtcblxuXHRcdGNvbnN0IHJlZiA9IG9iamVjdC5jbG9uZSgpO1xuXG5cdFx0cmVmLm5hbWUgKz0gJ19pbnN0YW5jZV8nICsgKCBjYWNoZS51c2VzWyBpbmRleCBdICsrICk7XG5cblx0XHRyZXR1cm4gcmVmO1xuXG5cdH1cblxuXHRfaW52b2tlT25lKCBmdW5jICkge1xuXG5cdFx0Y29uc3QgZXh0ZW5zaW9ucyA9IE9iamVjdC52YWx1ZXMoIHRoaXMucGx1Z2lucyApO1xuXHRcdGV4dGVuc2lvbnMucHVzaCggdGhpcyApO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwOyBpIDwgZXh0ZW5zaW9ucy5sZW5ndGg7IGkgKysgKSB7XG5cblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZ1bmMoIGV4dGVuc2lvbnNbIGkgXSApO1xuXG5cdFx0XHRpZiAoIHJlc3VsdCApIHJldHVybiByZXN1bHQ7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblxuXHR9XG5cblx0X2ludm9rZUFsbCggZnVuYyApIHtcblxuXHRcdGNvbnN0IGV4dGVuc2lvbnMgPSBPYmplY3QudmFsdWVzKCB0aGlzLnBsdWdpbnMgKTtcblx0XHRleHRlbnNpb25zLnVuc2hpZnQoIHRoaXMgKTtcblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMDsgaSA8IGV4dGVuc2lvbnMubGVuZ3RoOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jKCBleHRlbnNpb25zWyBpIF0gKTtcblxuXHRcdFx0aWYgKCByZXN1bHQgKSBwZW5kaW5nLnB1c2goIHJlc3VsdCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBlbmRpbmc7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyB0aGUgc3BlY2lmaWVkIGRlcGVuZGVuY3kgYXN5bmNocm9ub3VzbHksIHdpdGggY2FjaGluZy5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcblx0ICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG5cdCAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0M0R8TWF0ZXJpYWx8VEhSRUUuVGV4dHVyZXxBbmltYXRpb25DbGlwfEFycmF5QnVmZmVyfE9iamVjdD59XG5cdCAqL1xuXHRnZXREZXBlbmRlbmN5KCB0eXBlLCBpbmRleCApIHtcblxuXHRcdGNvbnN0IGNhY2hlS2V5ID0gdHlwZSArICc6JyArIGluZGV4O1xuXHRcdGxldCBkZXBlbmRlbmN5ID0gdGhpcy5jYWNoZS5nZXQoIGNhY2hlS2V5ICk7XG5cblx0XHRpZiAoICEgZGVwZW5kZW5jeSApIHtcblxuXHRcdFx0c3dpdGNoICggdHlwZSApIHtcblxuXHRcdFx0XHRjYXNlICdzY2VuZSc6XG5cdFx0XHRcdFx0ZGVwZW5kZW5jeSA9IHRoaXMubG9hZFNjZW5lKCBpbmRleCApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ25vZGUnOlxuXHRcdFx0XHRcdGRlcGVuZGVuY3kgPSB0aGlzLmxvYWROb2RlKCBpbmRleCApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ21lc2gnOlxuXHRcdFx0XHRcdGRlcGVuZGVuY3kgPSB0aGlzLl9pbnZva2VPbmUoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZXh0LmxvYWRNZXNoICYmIGV4dC5sb2FkTWVzaCggaW5kZXggKTtcblxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdhY2Nlc3Nvcic6XG5cdFx0XHRcdFx0ZGVwZW5kZW5jeSA9IHRoaXMubG9hZEFjY2Vzc29yKCBpbmRleCApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ2J1ZmZlclZpZXcnOlxuXHRcdFx0XHRcdGRlcGVuZGVuY3kgPSB0aGlzLl9pbnZva2VPbmUoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZXh0LmxvYWRCdWZmZXJWaWV3ICYmIGV4dC5sb2FkQnVmZmVyVmlldyggaW5kZXggKTtcblxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdidWZmZXInOlxuXHRcdFx0XHRcdGRlcGVuZGVuY3kgPSB0aGlzLmxvYWRCdWZmZXIoIGluZGV4ICk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnbWF0ZXJpYWwnOlxuXHRcdFx0XHRcdGRlcGVuZGVuY3kgPSB0aGlzLl9pbnZva2VPbmUoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZXh0LmxvYWRNYXRlcmlhbCAmJiBleHQubG9hZE1hdGVyaWFsKCBpbmRleCApO1xuXG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgJ3RleHR1cmUnOlxuXHRcdFx0XHRcdGRlcGVuZGVuY3kgPSB0aGlzLl9pbnZva2VPbmUoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZXh0LmxvYWRUZXh0dXJlICYmIGV4dC5sb2FkVGV4dHVyZSggaW5kZXggKTtcblxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdza2luJzpcblx0XHRcdFx0XHRkZXBlbmRlbmN5ID0gdGhpcy5sb2FkU2tpbiggaW5kZXggKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdhbmltYXRpb24nOlxuXHRcdFx0XHRcdGRlcGVuZGVuY3kgPSB0aGlzLmxvYWRBbmltYXRpb24oIGluZGV4ICk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnY2FtZXJhJzpcblx0XHRcdFx0XHRkZXBlbmRlbmN5ID0gdGhpcy5sb2FkQ2FtZXJhKCBpbmRleCApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCAnVW5rbm93biB0eXBlOiAnICsgdHlwZSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuY2FjaGUuYWRkKCBjYWNoZUtleSwgZGVwZW5kZW5jeSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlcGVuZGVuY3k7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhbGwgZGVwZW5kZW5jaWVzIG9mIHRoZSBzcGVjaWZpZWQgdHlwZSBhc3luY2hyb25vdXNseSwgd2l0aCBjYWNoaW5nLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlPEFycmF5PE9iamVjdD4+fVxuXHQgKi9cblx0Z2V0RGVwZW5kZW5jaWVzKCB0eXBlICkge1xuXG5cdFx0bGV0IGRlcGVuZGVuY2llcyA9IHRoaXMuY2FjaGUuZ2V0KCB0eXBlICk7XG5cblx0XHRpZiAoICEgZGVwZW5kZW5jaWVzICkge1xuXG5cdFx0XHRjb25zdCBwYXJzZXIgPSB0aGlzO1xuXHRcdFx0Y29uc3QgZGVmcyA9IHRoaXMuanNvblsgdHlwZSArICggdHlwZSA9PT0gJ21lc2gnID8gJ2VzJyA6ICdzJyApIF0gfHwgW107XG5cblx0XHRcdGRlcGVuZGVuY2llcyA9IFByb21pc2UuYWxsKCBkZWZzLm1hcCggZnVuY3Rpb24gKCBkZWYsIGluZGV4ICkge1xuXG5cdFx0XHRcdHJldHVybiBwYXJzZXIuZ2V0RGVwZW5kZW5jeSggdHlwZSwgaW5kZXggKTtcblxuXHRcdFx0fSApICk7XG5cblx0XHRcdHRoaXMuY2FjaGUuYWRkKCB0eXBlLCBkZXBlbmRlbmNpZXMgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBkZXBlbmRlbmNpZXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvYmxvYi9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAvUkVBRE1FLm1kI2J1ZmZlcnMtYW5kLWJ1ZmZlci12aWV3c1xuXHQgKiBAcGFyYW0ge251bWJlcn0gYnVmZmVySW5kZXhcblx0ICogQHJldHVybiB7UHJvbWlzZTxBcnJheUJ1ZmZlcj59XG5cdCAqL1xuXHRsb2FkQnVmZmVyKCBidWZmZXJJbmRleCApIHtcblxuXHRcdGNvbnN0IGJ1ZmZlckRlZiA9IHRoaXMuanNvbi5idWZmZXJzWyBidWZmZXJJbmRleCBdO1xuXHRcdGNvbnN0IGxvYWRlciA9IHRoaXMuZmlsZUxvYWRlcjtcblxuXHRcdGlmICggYnVmZmVyRGVmLnR5cGUgJiYgYnVmZmVyRGVmLnR5cGUgIT09ICdhcnJheWJ1ZmZlcicgKSB7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLkdMVEZMb2FkZXI6ICcgKyBidWZmZXJEZWYudHlwZSArICcgYnVmZmVyIHR5cGUgaXMgbm90IHN1cHBvcnRlZC4nICk7XG5cblx0XHR9XG5cblx0XHQvLyBJZiBwcmVzZW50LCBHTEIgY29udGFpbmVyIGlzIHJlcXVpcmVkIHRvIGJlIHRoZSBmaXJzdCBidWZmZXIuXG5cdFx0aWYgKCBidWZmZXJEZWYudXJpID09PSB1bmRlZmluZWQgJiYgYnVmZmVySW5kZXggPT09IDAgKSB7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMuZXh0ZW5zaW9uc1sgRVhURU5TSU9OUy5LSFJfQklOQVJZX0dMVEYgXS5ib2R5ICk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiAoIHJlc29sdmUsIHJlamVjdCApIHtcblxuXHRcdFx0bG9hZGVyLmxvYWQoIHJlc29sdmVVUkwoIGJ1ZmZlckRlZi51cmksIG9wdGlvbnMucGF0aCApLCByZXNvbHZlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0XHRyZWplY3QoIG5ldyBFcnJvciggJ1RIUkVFLkdMVEZMb2FkZXI6IEZhaWxlZCB0byBsb2FkIGJ1ZmZlciBcIicgKyBidWZmZXJEZWYudXJpICsgJ1wiLicgKSApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9ICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvYmxvYi9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAvUkVBRE1FLm1kI2J1ZmZlcnMtYW5kLWJ1ZmZlci12aWV3c1xuXHQgKiBAcGFyYW0ge251bWJlcn0gYnVmZmVyVmlld0luZGV4XG5cdCAqIEByZXR1cm4ge1Byb21pc2U8QXJyYXlCdWZmZXI+fVxuXHQgKi9cblx0bG9hZEJ1ZmZlclZpZXcoIGJ1ZmZlclZpZXdJbmRleCApIHtcblxuXHRcdGNvbnN0IGJ1ZmZlclZpZXdEZWYgPSB0aGlzLmpzb24uYnVmZmVyVmlld3NbIGJ1ZmZlclZpZXdJbmRleCBdO1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0RGVwZW5kZW5jeSggJ2J1ZmZlcicsIGJ1ZmZlclZpZXdEZWYuYnVmZmVyICkudGhlbiggZnVuY3Rpb24gKCBidWZmZXIgKSB7XG5cblx0XHRcdGNvbnN0IGJ5dGVMZW5ndGggPSBidWZmZXJWaWV3RGVmLmJ5dGVMZW5ndGggfHwgMDtcblx0XHRcdGNvbnN0IGJ5dGVPZmZzZXQgPSBidWZmZXJWaWV3RGVmLmJ5dGVPZmZzZXQgfHwgMDtcblx0XHRcdHJldHVybiBidWZmZXIuc2xpY2UoIGJ5dGVPZmZzZXQsIGJ5dGVPZmZzZXQgKyBieXRlTGVuZ3RoICk7XG5cblx0XHR9ICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvYmxvYi9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAvUkVBRE1FLm1kI2FjY2Vzc29yc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gYWNjZXNzb3JJbmRleFxuXHQgKiBAcmV0dXJuIHtQcm9taXNlPEJ1ZmZlckF0dHJpYnV0ZXxJbnRlcmxlYXZlZEJ1ZmZlckF0dHJpYnV0ZT59XG5cdCAqL1xuXHRsb2FkQWNjZXNzb3IoIGFjY2Vzc29ySW5kZXggKSB7XG5cblx0XHRjb25zdCBwYXJzZXIgPSB0aGlzO1xuXHRcdGNvbnN0IGpzb24gPSB0aGlzLmpzb247XG5cblx0XHRjb25zdCBhY2Nlc3NvckRlZiA9IHRoaXMuanNvbi5hY2Nlc3NvcnNbIGFjY2Vzc29ySW5kZXggXTtcblxuXHRcdGlmICggYWNjZXNzb3JEZWYuYnVmZmVyVmlldyA9PT0gdW5kZWZpbmVkICYmIGFjY2Vzc29yRGVmLnNwYXJzZSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHQvLyBJZ25vcmUgZW1wdHkgYWNjZXNzb3JzLCB3aGljaCBtYXkgYmUgdXNlZCB0byBkZWNsYXJlIHJ1bnRpbWVcblx0XHRcdC8vIGluZm9ybWF0aW9uIGFib3V0IGF0dHJpYnV0ZXMgY29taW5nIGZyb20gYW5vdGhlciBzb3VyY2UgKGUuZy4gRHJhY29cblx0XHRcdC8vIGNvbXByZXNzaW9uIGV4dGVuc2lvbikuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBudWxsICk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBwZW5kaW5nQnVmZmVyVmlld3MgPSBbXTtcblxuXHRcdGlmICggYWNjZXNzb3JEZWYuYnVmZmVyVmlldyAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRwZW5kaW5nQnVmZmVyVmlld3MucHVzaCggdGhpcy5nZXREZXBlbmRlbmN5KCAnYnVmZmVyVmlldycsIGFjY2Vzc29yRGVmLmJ1ZmZlclZpZXcgKSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0cGVuZGluZ0J1ZmZlclZpZXdzLnB1c2goIG51bGwgKTtcblxuXHRcdH1cblxuXHRcdGlmICggYWNjZXNzb3JEZWYuc3BhcnNlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHBlbmRpbmdCdWZmZXJWaWV3cy5wdXNoKCB0aGlzLmdldERlcGVuZGVuY3koICdidWZmZXJWaWV3JywgYWNjZXNzb3JEZWYuc3BhcnNlLmluZGljZXMuYnVmZmVyVmlldyApICk7XG5cdFx0XHRwZW5kaW5nQnVmZmVyVmlld3MucHVzaCggdGhpcy5nZXREZXBlbmRlbmN5KCAnYnVmZmVyVmlldycsIGFjY2Vzc29yRGVmLnNwYXJzZS52YWx1ZXMuYnVmZmVyVmlldyApICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoIHBlbmRpbmdCdWZmZXJWaWV3cyApLnRoZW4oIGZ1bmN0aW9uICggYnVmZmVyVmlld3MgKSB7XG5cblx0XHRcdGNvbnN0IGJ1ZmZlclZpZXcgPSBidWZmZXJWaWV3c1sgMCBdO1xuXG5cdFx0XHRjb25zdCBpdGVtU2l6ZSA9IFdFQkdMX1RZUEVfU0laRVNbIGFjY2Vzc29yRGVmLnR5cGUgXTtcblx0XHRcdGNvbnN0IFR5cGVkQXJyYXkgPSBXRUJHTF9DT01QT05FTlRfVFlQRVNbIGFjY2Vzc29yRGVmLmNvbXBvbmVudFR5cGUgXTtcblxuXHRcdFx0Ly8gRm9yIFZFQzM6IGl0ZW1TaXplIGlzIDMsIGVsZW1lbnRCeXRlcyBpcyA0LCBpdGVtQnl0ZXMgaXMgMTIuXG5cdFx0XHRjb25zdCBlbGVtZW50Qnl0ZXMgPSBUeXBlZEFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xuXHRcdFx0Y29uc3QgaXRlbUJ5dGVzID0gZWxlbWVudEJ5dGVzICogaXRlbVNpemU7XG5cdFx0XHRjb25zdCBieXRlT2Zmc2V0ID0gYWNjZXNzb3JEZWYuYnl0ZU9mZnNldCB8fCAwO1xuXHRcdFx0Y29uc3QgYnl0ZVN0cmlkZSA9IGFjY2Vzc29yRGVmLmJ1ZmZlclZpZXcgIT09IHVuZGVmaW5lZCA/IGpzb24uYnVmZmVyVmlld3NbIGFjY2Vzc29yRGVmLmJ1ZmZlclZpZXcgXS5ieXRlU3RyaWRlIDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZCA9IGFjY2Vzc29yRGVmLm5vcm1hbGl6ZWQgPT09IHRydWU7XG5cdFx0XHRsZXQgYXJyYXksIGJ1ZmZlckF0dHJpYnV0ZTtcblxuXHRcdFx0Ly8gVGhlIGJ1ZmZlciBpcyBub3QgaW50ZXJsZWF2ZWQgaWYgdGhlIHN0cmlkZSBpcyB0aGUgaXRlbSBzaXplIGluIGJ5dGVzLlxuXHRcdFx0aWYgKCBieXRlU3RyaWRlICYmIGJ5dGVTdHJpZGUgIT09IGl0ZW1CeXRlcyApIHtcblxuXHRcdFx0XHQvLyBFYWNoIFwic2xpY2VcIiBvZiB0aGUgYnVmZmVyLCBhcyBkZWZpbmVkIGJ5ICdjb3VudCcgZWxlbWVudHMgb2YgJ2J5dGVTdHJpZGUnIGJ5dGVzLCBnZXRzIGl0cyBvd24gSW50ZXJsZWF2ZWRCdWZmZXJcblx0XHRcdFx0Ly8gVGhpcyBtYWtlcyBzdXJlIHRoYXQgSUJBLmNvdW50IHJlZmxlY3RzIGFjY2Vzc29yLmNvdW50IHByb3Blcmx5XG5cdFx0XHRcdGNvbnN0IGliU2xpY2UgPSBNYXRoLmZsb29yKCBieXRlT2Zmc2V0IC8gYnl0ZVN0cmlkZSApO1xuXHRcdFx0XHRjb25zdCBpYkNhY2hlS2V5ID0gJ0ludGVybGVhdmVkQnVmZmVyOicgKyBhY2Nlc3NvckRlZi5idWZmZXJWaWV3ICsgJzonICsgYWNjZXNzb3JEZWYuY29tcG9uZW50VHlwZSArICc6JyArIGliU2xpY2UgKyAnOicgKyBhY2Nlc3NvckRlZi5jb3VudDtcblx0XHRcdFx0bGV0IGliID0gcGFyc2VyLmNhY2hlLmdldCggaWJDYWNoZUtleSApO1xuXG5cdFx0XHRcdGlmICggISBpYiApIHtcblxuXHRcdFx0XHRcdGFycmF5ID0gbmV3IFR5cGVkQXJyYXkoIGJ1ZmZlclZpZXcsIGliU2xpY2UgKiBieXRlU3RyaWRlLCBhY2Nlc3NvckRlZi5jb3VudCAqIGJ5dGVTdHJpZGUgLyBlbGVtZW50Qnl0ZXMgKTtcblxuXHRcdFx0XHRcdC8vIEludGVnZXIgcGFyYW1ldGVycyB0byBJQi9JQkEgYXJlIGluIGFycmF5IGVsZW1lbnRzLCBub3QgYnl0ZXMuXG5cdFx0XHRcdFx0aWIgPSBuZXcgSW50ZXJsZWF2ZWRCdWZmZXIoIGFycmF5LCBieXRlU3RyaWRlIC8gZWxlbWVudEJ5dGVzICk7XG5cblx0XHRcdFx0XHRwYXJzZXIuY2FjaGUuYWRkKCBpYkNhY2hlS2V5LCBpYiApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRidWZmZXJBdHRyaWJ1dGUgPSBuZXcgSW50ZXJsZWF2ZWRCdWZmZXJBdHRyaWJ1dGUoIGliLCBpdGVtU2l6ZSwgKCBieXRlT2Zmc2V0ICUgYnl0ZVN0cmlkZSApIC8gZWxlbWVudEJ5dGVzLCBub3JtYWxpemVkICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYgKCBidWZmZXJWaWV3ID09PSBudWxsICkge1xuXG5cdFx0XHRcdFx0YXJyYXkgPSBuZXcgVHlwZWRBcnJheSggYWNjZXNzb3JEZWYuY291bnQgKiBpdGVtU2l6ZSApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRhcnJheSA9IG5ldyBUeXBlZEFycmF5KCBidWZmZXJWaWV3LCBieXRlT2Zmc2V0LCBhY2Nlc3NvckRlZi5jb3VudCAqIGl0ZW1TaXplICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJ1ZmZlckF0dHJpYnV0ZSA9IG5ldyBCdWZmZXJBdHRyaWJ1dGUoIGFycmF5LCBpdGVtU2l6ZSwgbm9ybWFsaXplZCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi9ibG9iL21hc3Rlci9zcGVjaWZpY2F0aW9uLzIuMC9SRUFETUUubWQjc3BhcnNlLWFjY2Vzc29yc1xuXHRcdFx0aWYgKCBhY2Nlc3NvckRlZi5zcGFyc2UgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRjb25zdCBpdGVtU2l6ZUluZGljZXMgPSBXRUJHTF9UWVBFX1NJWkVTLlNDQUxBUjtcblx0XHRcdFx0Y29uc3QgVHlwZWRBcnJheUluZGljZXMgPSBXRUJHTF9DT01QT05FTlRfVFlQRVNbIGFjY2Vzc29yRGVmLnNwYXJzZS5pbmRpY2VzLmNvbXBvbmVudFR5cGUgXTtcblxuXHRcdFx0XHRjb25zdCBieXRlT2Zmc2V0SW5kaWNlcyA9IGFjY2Vzc29yRGVmLnNwYXJzZS5pbmRpY2VzLmJ5dGVPZmZzZXQgfHwgMDtcblx0XHRcdFx0Y29uc3QgYnl0ZU9mZnNldFZhbHVlcyA9IGFjY2Vzc29yRGVmLnNwYXJzZS52YWx1ZXMuYnl0ZU9mZnNldCB8fCAwO1xuXG5cdFx0XHRcdGNvbnN0IHNwYXJzZUluZGljZXMgPSBuZXcgVHlwZWRBcnJheUluZGljZXMoIGJ1ZmZlclZpZXdzWyAxIF0sIGJ5dGVPZmZzZXRJbmRpY2VzLCBhY2Nlc3NvckRlZi5zcGFyc2UuY291bnQgKiBpdGVtU2l6ZUluZGljZXMgKTtcblx0XHRcdFx0Y29uc3Qgc3BhcnNlVmFsdWVzID0gbmV3IFR5cGVkQXJyYXkoIGJ1ZmZlclZpZXdzWyAyIF0sIGJ5dGVPZmZzZXRWYWx1ZXMsIGFjY2Vzc29yRGVmLnNwYXJzZS5jb3VudCAqIGl0ZW1TaXplICk7XG5cblx0XHRcdFx0aWYgKCBidWZmZXJWaWV3ICE9PSBudWxsICkge1xuXG5cdFx0XHRcdFx0Ly8gQXZvaWQgbW9kaWZ5aW5nIHRoZSBvcmlnaW5hbCBBcnJheUJ1ZmZlciwgaWYgdGhlIGJ1ZmZlclZpZXcgd2Fzbid0IGluaXRpYWxpemVkIHdpdGggemVyb2VzLlxuXHRcdFx0XHRcdGJ1ZmZlckF0dHJpYnV0ZSA9IG5ldyBCdWZmZXJBdHRyaWJ1dGUoIGJ1ZmZlckF0dHJpYnV0ZS5hcnJheS5zbGljZSgpLCBidWZmZXJBdHRyaWJ1dGUuaXRlbVNpemUsIGJ1ZmZlckF0dHJpYnV0ZS5ub3JtYWxpemVkICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBzcGFyc2VJbmRpY2VzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgaW5kZXggPSBzcGFyc2VJbmRpY2VzWyBpIF07XG5cblx0XHRcdFx0XHRidWZmZXJBdHRyaWJ1dGUuc2V0WCggaW5kZXgsIHNwYXJzZVZhbHVlc1sgaSAqIGl0ZW1TaXplIF0gKTtcblx0XHRcdFx0XHRpZiAoIGl0ZW1TaXplID49IDIgKSBidWZmZXJBdHRyaWJ1dGUuc2V0WSggaW5kZXgsIHNwYXJzZVZhbHVlc1sgaSAqIGl0ZW1TaXplICsgMSBdICk7XG5cdFx0XHRcdFx0aWYgKCBpdGVtU2l6ZSA+PSAzICkgYnVmZmVyQXR0cmlidXRlLnNldFooIGluZGV4LCBzcGFyc2VWYWx1ZXNbIGkgKiBpdGVtU2l6ZSArIDIgXSApO1xuXHRcdFx0XHRcdGlmICggaXRlbVNpemUgPj0gNCApIGJ1ZmZlckF0dHJpYnV0ZS5zZXRXKCBpbmRleCwgc3BhcnNlVmFsdWVzWyBpICogaXRlbVNpemUgKyAzIF0gKTtcblx0XHRcdFx0XHRpZiAoIGl0ZW1TaXplID49IDUgKSB0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBVbnN1cHBvcnRlZCBpdGVtU2l6ZSBpbiBzcGFyc2UgQnVmZmVyQXR0cmlidXRlLicgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJ1ZmZlckF0dHJpYnV0ZTtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi90cmVlL21hc3Rlci9zcGVjaWZpY2F0aW9uLzIuMCN0ZXh0dXJlc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gdGV4dHVyZUluZGV4XG5cdCAqIEByZXR1cm4ge1Byb21pc2U8VEhSRUUuVGV4dHVyZT59XG5cdCAqL1xuXHRsb2FkVGV4dHVyZSggdGV4dHVyZUluZGV4ICkge1xuXG5cdFx0Y29uc3QganNvbiA9IHRoaXMuanNvbjtcblx0XHRjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXHRcdGNvbnN0IHRleHR1cmVEZWYgPSBqc29uLnRleHR1cmVzWyB0ZXh0dXJlSW5kZXggXTtcblx0XHRjb25zdCBzb3VyY2UgPSBqc29uLmltYWdlc1sgdGV4dHVyZURlZi5zb3VyY2UgXTtcblxuXHRcdGxldCBsb2FkZXIgPSB0aGlzLnRleHR1cmVMb2FkZXI7XG5cblx0XHRpZiAoIHNvdXJjZS51cmkgKSB7XG5cblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBvcHRpb25zLm1hbmFnZXIuZ2V0SGFuZGxlciggc291cmNlLnVyaSApO1xuXHRcdFx0aWYgKCBoYW5kbGVyICE9PSBudWxsICkgbG9hZGVyID0gaGFuZGxlcjtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmxvYWRUZXh0dXJlSW1hZ2UoIHRleHR1cmVJbmRleCwgc291cmNlLCBsb2FkZXIgKTtcblxuXHR9XG5cblx0bG9hZFRleHR1cmVJbWFnZSggdGV4dHVyZUluZGV4LCBzb3VyY2UsIGxvYWRlciApIHtcblxuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXM7XG5cdFx0Y29uc3QganNvbiA9IHRoaXMuanNvbjtcblx0XHRjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0Y29uc3QgdGV4dHVyZURlZiA9IGpzb24udGV4dHVyZXNbIHRleHR1cmVJbmRleCBdO1xuXG5cdFx0Y29uc3QgY2FjaGVLZXkgPSAoIHNvdXJjZS51cmkgfHwgc291cmNlLmJ1ZmZlclZpZXcgKSArICc6JyArIHRleHR1cmVEZWYuc2FtcGxlcjtcblxuXHRcdGlmICggdGhpcy50ZXh0dXJlQ2FjaGVbIGNhY2hlS2V5IF0gKSB7XG5cblx0XHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2lzc3Vlcy8yMTU1OS5cblx0XHRcdHJldHVybiB0aGlzLnRleHR1cmVDYWNoZVsgY2FjaGVLZXkgXTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IFVSTCA9IHNlbGYuVVJMIHx8IHNlbGYud2Via2l0VVJMO1xuXG5cdFx0bGV0IHNvdXJjZVVSSSA9IHNvdXJjZS51cmkgfHwgJyc7XG5cdFx0bGV0IGlzT2JqZWN0VVJMID0gZmFsc2U7XG5cdFx0bGV0IGhhc0FscGhhID0gdHJ1ZTtcblxuXHRcdGNvbnN0IGlzSlBFRyA9IHNvdXJjZVVSSS5zZWFyY2goIC9cXC5qcGU/ZygkfFxcPykvaSApID4gMCB8fCBzb3VyY2VVUkkuc2VhcmNoKCAvXmRhdGFcXDppbWFnZVxcL2pwZWcvICkgPT09IDA7XG5cblx0XHRpZiAoIHNvdXJjZS5taW1lVHlwZSA9PT0gJ2ltYWdlL2pwZWcnIHx8IGlzSlBFRyApIGhhc0FscGhhID0gZmFsc2U7XG5cblx0XHRpZiAoIHNvdXJjZS5idWZmZXJWaWV3ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdC8vIExvYWQgYmluYXJ5IGltYWdlIGRhdGEgZnJvbSBidWZmZXJWaWV3LCBpZiBwcm92aWRlZC5cblxuXHRcdFx0c291cmNlVVJJID0gcGFyc2VyLmdldERlcGVuZGVuY3koICdidWZmZXJWaWV3Jywgc291cmNlLmJ1ZmZlclZpZXcgKS50aGVuKCBmdW5jdGlvbiAoIGJ1ZmZlclZpZXcgKSB7XG5cblx0XHRcdFx0aWYgKCBzb3VyY2UubWltZVR5cGUgPT09ICdpbWFnZS9wbmcnICkge1xuXG5cdFx0XHRcdFx0Ly8gSW5zcGVjdCB0aGUgUE5HICdJSERSJyBjaHVuayB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgaW1hZ2UgY291bGQgaGF2ZSBhblxuXHRcdFx0XHRcdC8vIGFscGhhIGNoYW5uZWwuIFRoaXMgY2hlY2sgaXMgY29uc2VydmF0aXZlIOKAlCB0aGUgaW1hZ2UgY291bGQgaGF2ZSBhbiBhbHBoYVxuXHRcdFx0XHRcdC8vIGNoYW5uZWwgd2l0aCBhbGwgdmFsdWVzID09IDEsIGFuZCB0aGUgaW5kZXhlZCB0eXBlIChjb2xvclR5cGUgPT0gMykgb25seVxuXHRcdFx0XHRcdC8vIHNvbWV0aW1lcyBjb250YWlucyBhbHBoYS5cblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BvcnRhYmxlX05ldHdvcmtfR3JhcGhpY3MjRmlsZV9oZWFkZXJcblx0XHRcdFx0XHRjb25zdCBjb2xvclR5cGUgPSBuZXcgRGF0YVZpZXcoIGJ1ZmZlclZpZXcsIDI1LCAxICkuZ2V0VWludDgoIDAsIGZhbHNlICk7XG5cdFx0XHRcdFx0aGFzQWxwaGEgPSBjb2xvclR5cGUgPT09IDYgfHwgY29sb3JUeXBlID09PSA0IHx8IGNvbG9yVHlwZSA9PT0gMztcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aXNPYmplY3RVUkwgPSB0cnVlO1xuXHRcdFx0XHRjb25zdCBibG9iID0gbmV3IEJsb2IoIFsgYnVmZmVyVmlldyBdLCB7IHR5cGU6IHNvdXJjZS5taW1lVHlwZSB9ICk7XG5cdFx0XHRcdHNvdXJjZVVSSSA9IFVSTC5jcmVhdGVPYmplY3RVUkwoIGJsb2IgKTtcblx0XHRcdFx0cmV0dXJuIHNvdXJjZVVSSTtcblxuXHRcdFx0fSApO1xuXG5cdFx0fSBlbHNlIGlmICggc291cmNlLnVyaSA9PT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBJbWFnZSAnICsgdGV4dHVyZUluZGV4ICsgJyBpcyBtaXNzaW5nIFVSSSBhbmQgYnVmZmVyVmlldycgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoIHNvdXJjZVVSSSApLnRoZW4oIGZ1bmN0aW9uICggc291cmNlVVJJICkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uICggcmVzb2x2ZSwgcmVqZWN0ICkge1xuXG5cdFx0XHRcdGxldCBvbkxvYWQgPSByZXNvbHZlO1xuXG5cdFx0XHRcdGlmICggbG9hZGVyLmlzSW1hZ2VCaXRtYXBMb2FkZXIgPT09IHRydWUgKSB7XG5cblx0XHRcdFx0XHRvbkxvYWQgPSBmdW5jdGlvbiAoIGltYWdlQml0bWFwICkge1xuXG5cdFx0XHRcdFx0XHRjb25zdCB0ZXh0dXJlID0gbmV3IFRleHR1cmUoIGltYWdlQml0bWFwICk7XG5cdFx0XHRcdFx0XHR0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0cmVzb2x2ZSggdGV4dHVyZSApO1xuXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bG9hZGVyLmxvYWQoIHJlc29sdmVVUkwoIHNvdXJjZVVSSSwgb3B0aW9ucy5wYXRoICksIG9uTG9hZCwgdW5kZWZpbmVkLCByZWplY3QgKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0fSApLnRoZW4oIGZ1bmN0aW9uICggdGV4dHVyZSApIHtcblxuXHRcdFx0Ly8gQ2xlYW4gdXAgcmVzb3VyY2VzIGFuZCBjb25maWd1cmUgVGV4dHVyZS5cblxuXHRcdFx0aWYgKCBpc09iamVjdFVSTCA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKCBzb3VyY2VVUkkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHR0ZXh0dXJlLmZsaXBZID0gZmFsc2U7XG5cblx0XHRcdGlmICggdGV4dHVyZURlZi5uYW1lICkgdGV4dHVyZS5uYW1lID0gdGV4dHVyZURlZi5uYW1lO1xuXG5cdFx0XHQvLyBXaGVuIHRoZXJlIGlzIGRlZmluaXRlbHkgbm8gYWxwaGEgY2hhbm5lbCBpbiB0aGUgdGV4dHVyZSwgc2V0IFJHQkZvcm1hdCB0byBzYXZlIHNwYWNlLlxuXHRcdFx0aWYgKCAhIGhhc0FscGhhICkgdGV4dHVyZS5mb3JtYXQgPSBSR0JGb3JtYXQ7XG5cblx0XHRcdGNvbnN0IHNhbXBsZXJzID0ganNvbi5zYW1wbGVycyB8fCB7fTtcblx0XHRcdGNvbnN0IHNhbXBsZXIgPSBzYW1wbGVyc1sgdGV4dHVyZURlZi5zYW1wbGVyIF0gfHwge307XG5cblx0XHRcdHRleHR1cmUubWFnRmlsdGVyID0gV0VCR0xfRklMVEVSU1sgc2FtcGxlci5tYWdGaWx0ZXIgXSB8fCBMaW5lYXJGaWx0ZXI7XG5cdFx0XHR0ZXh0dXJlLm1pbkZpbHRlciA9IFdFQkdMX0ZJTFRFUlNbIHNhbXBsZXIubWluRmlsdGVyIF0gfHwgTGluZWFyTWlwbWFwTGluZWFyRmlsdGVyO1xuXHRcdFx0dGV4dHVyZS53cmFwUyA9IFdFQkdMX1dSQVBQSU5HU1sgc2FtcGxlci53cmFwUyBdIHx8IFJlcGVhdFdyYXBwaW5nO1xuXHRcdFx0dGV4dHVyZS53cmFwVCA9IFdFQkdMX1dSQVBQSU5HU1sgc2FtcGxlci53cmFwVCBdIHx8IFJlcGVhdFdyYXBwaW5nO1xuXG5cdFx0XHRwYXJzZXIuYXNzb2NpYXRpb25zLnNldCggdGV4dHVyZSwge1xuXHRcdFx0XHR0eXBlOiAndGV4dHVyZXMnLFxuXHRcdFx0XHRpbmRleDogdGV4dHVyZUluZGV4XG5cdFx0XHR9ICk7XG5cblx0XHRcdHJldHVybiB0ZXh0dXJlO1xuXG5cdFx0fSApLmNhdGNoKCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyOiBDb3VsZG5cXCd0IGxvYWQgdGV4dHVyZScsIHNvdXJjZVVSSSApO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cblx0XHR9ICk7XG5cblx0XHR0aGlzLnRleHR1cmVDYWNoZVsgY2FjaGVLZXkgXSA9IHByb21pc2U7XG5cblx0XHRyZXR1cm4gcHJvbWlzZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFzeW5jaHJvbm91c2x5IGFzc2lnbnMgYSB0ZXh0dXJlIHRvIHRoZSBnaXZlbiBtYXRlcmlhbCBwYXJhbWV0ZXJzLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gbWF0ZXJpYWxQYXJhbXNcblx0ICogQHBhcmFtIHtzdHJpbmd9IG1hcE5hbWVcblx0ICogQHBhcmFtIHtPYmplY3R9IG1hcERlZlxuXHQgKiBAcmV0dXJuIHtQcm9taXNlPFRleHR1cmU+fVxuXHQgKi9cblx0YXNzaWduVGV4dHVyZSggbWF0ZXJpYWxQYXJhbXMsIG1hcE5hbWUsIG1hcERlZiApIHtcblxuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXM7XG5cblx0XHRyZXR1cm4gdGhpcy5nZXREZXBlbmRlbmN5KCAndGV4dHVyZScsIG1hcERlZi5pbmRleCApLnRoZW4oIGZ1bmN0aW9uICggdGV4dHVyZSApIHtcblxuXHRcdFx0Ly8gTWF0ZXJpYWxzIHNhbXBsZSBhb01hcCBmcm9tIFVWIHNldCAxIGFuZCBvdGhlciBtYXBzIGZyb20gVVYgc2V0IDAgLSB0aGlzIGNhbid0IGJlIGNvbmZpZ3VyZWRcblx0XHRcdC8vIEhvd2V2ZXIsIHdlIHdpbGwgY29weSBVViBzZXQgMCB0byBVViBzZXQgMSBvbiBkZW1hbmQgZm9yIGFvTWFwXG5cdFx0XHRpZiAoIG1hcERlZi50ZXhDb29yZCAhPT0gdW5kZWZpbmVkICYmIG1hcERlZi50ZXhDb29yZCAhPSAwICYmICEgKCBtYXBOYW1lID09PSAnYW9NYXAnICYmIG1hcERlZi50ZXhDb29yZCA9PSAxICkgKSB7XG5cblx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuR0xURkxvYWRlcjogQ3VzdG9tIFVWIHNldCAnICsgbWFwRGVmLnRleENvb3JkICsgJyBmb3IgdGV4dHVyZSAnICsgbWFwTmFtZSArICcgbm90IHlldCBzdXBwb3J0ZWQuJyApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggcGFyc2VyLmV4dGVuc2lvbnNbIEVYVEVOU0lPTlMuS0hSX1RFWFRVUkVfVFJBTlNGT1JNIF0gKSB7XG5cblx0XHRcdFx0Y29uc3QgdHJhbnNmb3JtID0gbWFwRGVmLmV4dGVuc2lvbnMgIT09IHVuZGVmaW5lZCA/IG1hcERlZi5leHRlbnNpb25zWyBFWFRFTlNJT05TLktIUl9URVhUVVJFX1RSQU5TRk9STSBdIDogdW5kZWZpbmVkO1xuXG5cdFx0XHRcdGlmICggdHJhbnNmb3JtICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgZ2x0ZlJlZmVyZW5jZSA9IHBhcnNlci5hc3NvY2lhdGlvbnMuZ2V0KCB0ZXh0dXJlICk7XG5cdFx0XHRcdFx0dGV4dHVyZSA9IHBhcnNlci5leHRlbnNpb25zWyBFWFRFTlNJT05TLktIUl9URVhUVVJFX1RSQU5TRk9STSBdLmV4dGVuZFRleHR1cmUoIHRleHR1cmUsIHRyYW5zZm9ybSApO1xuXHRcdFx0XHRcdHBhcnNlci5hc3NvY2lhdGlvbnMuc2V0KCB0ZXh0dXJlLCBnbHRmUmVmZXJlbmNlICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdG1hdGVyaWFsUGFyYW1zWyBtYXBOYW1lIF0gPSB0ZXh0dXJlO1xuXG5cdFx0XHRyZXR1cm4gdGV4dHVyZTtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFzc2lnbnMgZmluYWwgbWF0ZXJpYWwgdG8gYSBNZXNoLCBMaW5lLCBvciBQb2ludHMgaW5zdGFuY2UuIFRoZSBpbnN0YW5jZVxuXHQgKiBhbHJlYWR5IGhhcyBhIG1hdGVyaWFsIChnZW5lcmF0ZWQgZnJvbSB0aGUgZ2xURiBtYXRlcmlhbCBvcHRpb25zIGFsb25lKVxuXHQgKiBidXQgcmV1c2Ugb2YgdGhlIHNhbWUgZ2xURiBtYXRlcmlhbCBtYXkgcmVxdWlyZSBtdWx0aXBsZSB0aHJlZWpzIG1hdGVyaWFsc1xuXHQgKiB0byBhY2NvbW1vZGF0ZSBkaWZmZXJlbnQgcHJpbWl0aXZlIHR5cGVzLCBkZWZpbmVzLCBldGMuIE5ldyBtYXRlcmlhbHMgd2lsbFxuXHQgKiBiZSBjcmVhdGVkIGlmIG5lY2Vzc2FyeSwgYW5kIHJldXNlZCBmcm9tIGEgY2FjaGUuXG5cdCAqIEBwYXJhbSAge09iamVjdDNEfSBtZXNoIE1lc2gsIExpbmUsIG9yIFBvaW50cyBpbnN0YW5jZS5cblx0ICovXG5cdGFzc2lnbkZpbmFsTWF0ZXJpYWwoIG1lc2ggKSB7XG5cblx0XHRjb25zdCBnZW9tZXRyeSA9IG1lc2guZ2VvbWV0cnk7XG5cdFx0bGV0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbDtcblxuXHRcdGNvbnN0IHVzZVZlcnRleFRhbmdlbnRzID0gZ2VvbWV0cnkuYXR0cmlidXRlcy50YW5nZW50ICE9PSB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgdXNlVmVydGV4Q29sb3JzID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5jb2xvciAhPT0gdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHVzZUZsYXRTaGFkaW5nID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5ub3JtYWwgPT09IHVuZGVmaW5lZDtcblxuXHRcdGlmICggbWVzaC5pc1BvaW50cyApIHtcblxuXHRcdFx0Y29uc3QgY2FjaGVLZXkgPSAnUG9pbnRzTWF0ZXJpYWw6JyArIG1hdGVyaWFsLnV1aWQ7XG5cblx0XHRcdGxldCBwb2ludHNNYXRlcmlhbCA9IHRoaXMuY2FjaGUuZ2V0KCBjYWNoZUtleSApO1xuXG5cdFx0XHRpZiAoICEgcG9pbnRzTWF0ZXJpYWwgKSB7XG5cblx0XHRcdFx0cG9pbnRzTWF0ZXJpYWwgPSBuZXcgUG9pbnRzTWF0ZXJpYWwoKTtcblx0XHRcdFx0TWF0ZXJpYWwucHJvdG90eXBlLmNvcHkuY2FsbCggcG9pbnRzTWF0ZXJpYWwsIG1hdGVyaWFsICk7XG5cdFx0XHRcdHBvaW50c01hdGVyaWFsLmNvbG9yLmNvcHkoIG1hdGVyaWFsLmNvbG9yICk7XG5cdFx0XHRcdHBvaW50c01hdGVyaWFsLm1hcCA9IG1hdGVyaWFsLm1hcDtcblx0XHRcdFx0cG9pbnRzTWF0ZXJpYWwuc2l6ZUF0dGVudWF0aW9uID0gZmFsc2U7IC8vIGdsVEYgc3BlYyBzYXlzIHBvaW50cyBzaG91bGQgYmUgMXB4XG5cblx0XHRcdFx0dGhpcy5jYWNoZS5hZGQoIGNhY2hlS2V5LCBwb2ludHNNYXRlcmlhbCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdG1hdGVyaWFsID0gcG9pbnRzTWF0ZXJpYWw7XG5cblx0XHR9IGVsc2UgaWYgKCBtZXNoLmlzTGluZSApIHtcblxuXHRcdFx0Y29uc3QgY2FjaGVLZXkgPSAnTGluZUJhc2ljTWF0ZXJpYWw6JyArIG1hdGVyaWFsLnV1aWQ7XG5cblx0XHRcdGxldCBsaW5lTWF0ZXJpYWwgPSB0aGlzLmNhY2hlLmdldCggY2FjaGVLZXkgKTtcblxuXHRcdFx0aWYgKCAhIGxpbmVNYXRlcmlhbCApIHtcblxuXHRcdFx0XHRsaW5lTWF0ZXJpYWwgPSBuZXcgTGluZUJhc2ljTWF0ZXJpYWwoKTtcblx0XHRcdFx0TWF0ZXJpYWwucHJvdG90eXBlLmNvcHkuY2FsbCggbGluZU1hdGVyaWFsLCBtYXRlcmlhbCApO1xuXHRcdFx0XHRsaW5lTWF0ZXJpYWwuY29sb3IuY29weSggbWF0ZXJpYWwuY29sb3IgKTtcblxuXHRcdFx0XHR0aGlzLmNhY2hlLmFkZCggY2FjaGVLZXksIGxpbmVNYXRlcmlhbCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdG1hdGVyaWFsID0gbGluZU1hdGVyaWFsO1xuXG5cdFx0fVxuXG5cdFx0Ly8gQ2xvbmUgdGhlIG1hdGVyaWFsIGlmIGl0IHdpbGwgYmUgbW9kaWZpZWRcblx0XHRpZiAoIHVzZVZlcnRleFRhbmdlbnRzIHx8IHVzZVZlcnRleENvbG9ycyB8fCB1c2VGbGF0U2hhZGluZyApIHtcblxuXHRcdFx0bGV0IGNhY2hlS2V5ID0gJ0Nsb25lZE1hdGVyaWFsOicgKyBtYXRlcmlhbC51dWlkICsgJzonO1xuXG5cdFx0XHRpZiAoIG1hdGVyaWFsLmlzR0xURlNwZWN1bGFyR2xvc3NpbmVzc01hdGVyaWFsICkgY2FjaGVLZXkgKz0gJ3NwZWN1bGFyLWdsb3NzaW5lc3M6Jztcblx0XHRcdGlmICggdXNlVmVydGV4VGFuZ2VudHMgKSBjYWNoZUtleSArPSAndmVydGV4LXRhbmdlbnRzOic7XG5cdFx0XHRpZiAoIHVzZVZlcnRleENvbG9ycyApIGNhY2hlS2V5ICs9ICd2ZXJ0ZXgtY29sb3JzOic7XG5cdFx0XHRpZiAoIHVzZUZsYXRTaGFkaW5nICkgY2FjaGVLZXkgKz0gJ2ZsYXQtc2hhZGluZzonO1xuXG5cdFx0XHRsZXQgY2FjaGVkTWF0ZXJpYWwgPSB0aGlzLmNhY2hlLmdldCggY2FjaGVLZXkgKTtcblxuXHRcdFx0aWYgKCAhIGNhY2hlZE1hdGVyaWFsICkge1xuXG5cdFx0XHRcdGNhY2hlZE1hdGVyaWFsID0gbWF0ZXJpYWwuY2xvbmUoKTtcblxuXHRcdFx0XHRpZiAoIHVzZVZlcnRleENvbG9ycyApIGNhY2hlZE1hdGVyaWFsLnZlcnRleENvbG9ycyA9IHRydWU7XG5cdFx0XHRcdGlmICggdXNlRmxhdFNoYWRpbmcgKSBjYWNoZWRNYXRlcmlhbC5mbGF0U2hhZGluZyA9IHRydWU7XG5cblx0XHRcdFx0aWYgKCB1c2VWZXJ0ZXhUYW5nZW50cyApIHtcblxuXHRcdFx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvaXNzdWVzLzExNDM4I2lzc3VlY29tbWVudC01MDcwMDM5OTVcblx0XHRcdFx0XHRpZiAoIGNhY2hlZE1hdGVyaWFsLm5vcm1hbFNjYWxlICkgY2FjaGVkTWF0ZXJpYWwubm9ybWFsU2NhbGUueSAqPSAtIDE7XG5cdFx0XHRcdFx0aWYgKCBjYWNoZWRNYXRlcmlhbC5jbGVhcmNvYXROb3JtYWxTY2FsZSApIGNhY2hlZE1hdGVyaWFsLmNsZWFyY29hdE5vcm1hbFNjYWxlLnkgKj0gLSAxO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmNhY2hlLmFkZCggY2FjaGVLZXksIGNhY2hlZE1hdGVyaWFsICk7XG5cblx0XHRcdFx0dGhpcy5hc3NvY2lhdGlvbnMuc2V0KCBjYWNoZWRNYXRlcmlhbCwgdGhpcy5hc3NvY2lhdGlvbnMuZ2V0KCBtYXRlcmlhbCApICk7XG5cblx0XHRcdH1cblxuXHRcdFx0bWF0ZXJpYWwgPSBjYWNoZWRNYXRlcmlhbDtcblxuXHRcdH1cblxuXHRcdC8vIHdvcmthcm91bmRzIGZvciBtZXNoIGFuZCBnZW9tZXRyeVxuXG5cdFx0aWYgKCBtYXRlcmlhbC5hb01hcCAmJiBnZW9tZXRyeS5hdHRyaWJ1dGVzLnV2MiA9PT0gdW5kZWZpbmVkICYmIGdlb21ldHJ5LmF0dHJpYnV0ZXMudXYgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Z2VvbWV0cnkuc2V0QXR0cmlidXRlKCAndXYyJywgZ2VvbWV0cnkuYXR0cmlidXRlcy51diApO1xuXG5cdFx0fVxuXG5cdFx0bWVzaC5tYXRlcmlhbCA9IG1hdGVyaWFsO1xuXG5cdH1cblxuXHRnZXRNYXRlcmlhbFR5cGUoIC8qIG1hdGVyaWFsSW5kZXggKi8gKSB7XG5cblx0XHRyZXR1cm4gTWVzaFN0YW5kYXJkTWF0ZXJpYWw7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvYmxvYi9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAvUkVBRE1FLm1kI21hdGVyaWFsc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gbWF0ZXJpYWxJbmRleFxuXHQgKiBAcmV0dXJuIHtQcm9taXNlPE1hdGVyaWFsPn1cblx0ICovXG5cdGxvYWRNYXRlcmlhbCggbWF0ZXJpYWxJbmRleCApIHtcblxuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXM7XG5cdFx0Y29uc3QganNvbiA9IHRoaXMuanNvbjtcblx0XHRjb25zdCBleHRlbnNpb25zID0gdGhpcy5leHRlbnNpb25zO1xuXHRcdGNvbnN0IG1hdGVyaWFsRGVmID0ganNvbi5tYXRlcmlhbHNbIG1hdGVyaWFsSW5kZXggXTtcblxuXHRcdGxldCBtYXRlcmlhbFR5cGU7XG5cdFx0Y29uc3QgbWF0ZXJpYWxQYXJhbXMgPSB7fTtcblx0XHRjb25zdCBtYXRlcmlhbEV4dGVuc2lvbnMgPSBtYXRlcmlhbERlZi5leHRlbnNpb25zIHx8IHt9O1xuXG5cdFx0Y29uc3QgcGVuZGluZyA9IFtdO1xuXG5cdFx0aWYgKCBtYXRlcmlhbEV4dGVuc2lvbnNbIEVYVEVOU0lPTlMuS0hSX01BVEVSSUFMU19QQlJfU1BFQ1VMQVJfR0xPU1NJTkVTUyBdICkge1xuXG5cdFx0XHRjb25zdCBzZ0V4dGVuc2lvbiA9IGV4dGVuc2lvbnNbIEVYVEVOU0lPTlMuS0hSX01BVEVSSUFMU19QQlJfU1BFQ1VMQVJfR0xPU1NJTkVTUyBdO1xuXHRcdFx0bWF0ZXJpYWxUeXBlID0gc2dFeHRlbnNpb24uZ2V0TWF0ZXJpYWxUeXBlKCk7XG5cdFx0XHRwZW5kaW5nLnB1c2goIHNnRXh0ZW5zaW9uLmV4dGVuZFBhcmFtcyggbWF0ZXJpYWxQYXJhbXMsIG1hdGVyaWFsRGVmLCBwYXJzZXIgKSApO1xuXG5cdFx0fSBlbHNlIGlmICggbWF0ZXJpYWxFeHRlbnNpb25zWyBFWFRFTlNJT05TLktIUl9NQVRFUklBTFNfVU5MSVQgXSApIHtcblxuXHRcdFx0Y29uc3Qga211RXh0ZW5zaW9uID0gZXh0ZW5zaW9uc1sgRVhURU5TSU9OUy5LSFJfTUFURVJJQUxTX1VOTElUIF07XG5cdFx0XHRtYXRlcmlhbFR5cGUgPSBrbXVFeHRlbnNpb24uZ2V0TWF0ZXJpYWxUeXBlKCk7XG5cdFx0XHRwZW5kaW5nLnB1c2goIGttdUV4dGVuc2lvbi5leHRlbmRQYXJhbXMoIG1hdGVyaWFsUGFyYW1zLCBtYXRlcmlhbERlZiwgcGFyc2VyICkgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIFNwZWNpZmljYXRpb246XG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAjbWV0YWxsaWMtcm91Z2huZXNzLW1hdGVyaWFsXG5cblx0XHRcdGNvbnN0IG1ldGFsbGljUm91Z2huZXNzID0gbWF0ZXJpYWxEZWYucGJyTWV0YWxsaWNSb3VnaG5lc3MgfHwge307XG5cblx0XHRcdG1hdGVyaWFsUGFyYW1zLmNvbG9yID0gbmV3IENvbG9yKCAxLjAsIDEuMCwgMS4wICk7XG5cdFx0XHRtYXRlcmlhbFBhcmFtcy5vcGFjaXR5ID0gMS4wO1xuXG5cdFx0XHRpZiAoIEFycmF5LmlzQXJyYXkoIG1ldGFsbGljUm91Z2huZXNzLmJhc2VDb2xvckZhY3RvciApICkge1xuXG5cdFx0XHRcdGNvbnN0IGFycmF5ID0gbWV0YWxsaWNSb3VnaG5lc3MuYmFzZUNvbG9yRmFjdG9yO1xuXG5cdFx0XHRcdG1hdGVyaWFsUGFyYW1zLmNvbG9yLmZyb21BcnJheSggYXJyYXkgKTtcblx0XHRcdFx0bWF0ZXJpYWxQYXJhbXMub3BhY2l0eSA9IGFycmF5WyAzIF07XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtZXRhbGxpY1JvdWdobmVzcy5iYXNlQ29sb3JUZXh0dXJlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0cGVuZGluZy5wdXNoKCBwYXJzZXIuYXNzaWduVGV4dHVyZSggbWF0ZXJpYWxQYXJhbXMsICdtYXAnLCBtZXRhbGxpY1JvdWdobmVzcy5iYXNlQ29sb3JUZXh0dXJlICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRtYXRlcmlhbFBhcmFtcy5tZXRhbG5lc3MgPSBtZXRhbGxpY1JvdWdobmVzcy5tZXRhbGxpY0ZhY3RvciAhPT0gdW5kZWZpbmVkID8gbWV0YWxsaWNSb3VnaG5lc3MubWV0YWxsaWNGYWN0b3IgOiAxLjA7XG5cdFx0XHRtYXRlcmlhbFBhcmFtcy5yb3VnaG5lc3MgPSBtZXRhbGxpY1JvdWdobmVzcy5yb3VnaG5lc3NGYWN0b3IgIT09IHVuZGVmaW5lZCA/IG1ldGFsbGljUm91Z2huZXNzLnJvdWdobmVzc0ZhY3RvciA6IDEuMDtcblxuXHRcdFx0aWYgKCBtZXRhbGxpY1JvdWdobmVzcy5tZXRhbGxpY1JvdWdobmVzc1RleHR1cmUgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRwZW5kaW5nLnB1c2goIHBhcnNlci5hc3NpZ25UZXh0dXJlKCBtYXRlcmlhbFBhcmFtcywgJ21ldGFsbmVzc01hcCcsIG1ldGFsbGljUm91Z2huZXNzLm1ldGFsbGljUm91Z2huZXNzVGV4dHVyZSApICk7XG5cdFx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAncm91Z2huZXNzTWFwJywgbWV0YWxsaWNSb3VnaG5lc3MubWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRtYXRlcmlhbFR5cGUgPSB0aGlzLl9pbnZva2VPbmUoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdHJldHVybiBleHQuZ2V0TWF0ZXJpYWxUeXBlICYmIGV4dC5nZXRNYXRlcmlhbFR5cGUoIG1hdGVyaWFsSW5kZXggKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0XHRwZW5kaW5nLnB1c2goIFByb21pc2UuYWxsKCB0aGlzLl9pbnZva2VBbGwoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdHJldHVybiBleHQuZXh0ZW5kTWF0ZXJpYWxQYXJhbXMgJiYgZXh0LmV4dGVuZE1hdGVyaWFsUGFyYW1zKCBtYXRlcmlhbEluZGV4LCBtYXRlcmlhbFBhcmFtcyApO1xuXG5cdFx0XHR9ICkgKSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBtYXRlcmlhbERlZi5kb3VibGVTaWRlZCA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0bWF0ZXJpYWxQYXJhbXMuc2lkZSA9IERvdWJsZVNpZGU7XG5cblx0XHR9XG5cblx0XHRjb25zdCBhbHBoYU1vZGUgPSBtYXRlcmlhbERlZi5hbHBoYU1vZGUgfHwgQUxQSEFfTU9ERVMuT1BBUVVFO1xuXG5cdFx0aWYgKCBhbHBoYU1vZGUgPT09IEFMUEhBX01PREVTLkJMRU5EICkge1xuXG5cdFx0XHRtYXRlcmlhbFBhcmFtcy50cmFuc3BhcmVudCA9IHRydWU7XG5cblx0XHRcdC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9pc3N1ZXMvMTc3MDZcblx0XHRcdG1hdGVyaWFsUGFyYW1zLmRlcHRoV3JpdGUgPSBmYWxzZTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdG1hdGVyaWFsUGFyYW1zLmZvcm1hdCA9IFJHQkZvcm1hdDtcblx0XHRcdG1hdGVyaWFsUGFyYW1zLnRyYW5zcGFyZW50ID0gZmFsc2U7XG5cblx0XHRcdGlmICggYWxwaGFNb2RlID09PSBBTFBIQV9NT0RFUy5NQVNLICkge1xuXG5cdFx0XHRcdG1hdGVyaWFsUGFyYW1zLmFscGhhVGVzdCA9IG1hdGVyaWFsRGVmLmFscGhhQ3V0b2ZmICE9PSB1bmRlZmluZWQgPyBtYXRlcmlhbERlZi5hbHBoYUN1dG9mZiA6IDAuNTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKCBtYXRlcmlhbERlZi5ub3JtYWxUZXh0dXJlICE9PSB1bmRlZmluZWQgJiYgbWF0ZXJpYWxUeXBlICE9PSBNZXNoQmFzaWNNYXRlcmlhbCApIHtcblxuXHRcdFx0cGVuZGluZy5wdXNoKCBwYXJzZXIuYXNzaWduVGV4dHVyZSggbWF0ZXJpYWxQYXJhbXMsICdub3JtYWxNYXAnLCBtYXRlcmlhbERlZi5ub3JtYWxUZXh0dXJlICkgKTtcblxuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9pc3N1ZXMvMTE0MzgjaXNzdWVjb21tZW50LTUwNzAwMzk5NVxuXHRcdFx0bWF0ZXJpYWxQYXJhbXMubm9ybWFsU2NhbGUgPSBuZXcgVmVjdG9yMiggMSwgLSAxICk7XG5cblx0XHRcdGlmICggbWF0ZXJpYWxEZWYubm9ybWFsVGV4dHVyZS5zY2FsZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdG1hdGVyaWFsUGFyYW1zLm5vcm1hbFNjYWxlLnNldCggbWF0ZXJpYWxEZWYubm9ybWFsVGV4dHVyZS5zY2FsZSwgLSBtYXRlcmlhbERlZi5ub3JtYWxUZXh0dXJlLnNjYWxlICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGlmICggbWF0ZXJpYWxEZWYub2NjbHVzaW9uVGV4dHVyZSAhPT0gdW5kZWZpbmVkICYmIG1hdGVyaWFsVHlwZSAhPT0gTWVzaEJhc2ljTWF0ZXJpYWwgKSB7XG5cblx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAnYW9NYXAnLCBtYXRlcmlhbERlZi5vY2NsdXNpb25UZXh0dXJlICkgKTtcblxuXHRcdFx0aWYgKCBtYXRlcmlhbERlZi5vY2NsdXNpb25UZXh0dXJlLnN0cmVuZ3RoICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0bWF0ZXJpYWxQYXJhbXMuYW9NYXBJbnRlbnNpdHkgPSBtYXRlcmlhbERlZi5vY2NsdXNpb25UZXh0dXJlLnN0cmVuZ3RoO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIG1hdGVyaWFsRGVmLmVtaXNzaXZlRmFjdG9yICE9PSB1bmRlZmluZWQgJiYgbWF0ZXJpYWxUeXBlICE9PSBNZXNoQmFzaWNNYXRlcmlhbCApIHtcblxuXHRcdFx0bWF0ZXJpYWxQYXJhbXMuZW1pc3NpdmUgPSBuZXcgQ29sb3IoKS5mcm9tQXJyYXkoIG1hdGVyaWFsRGVmLmVtaXNzaXZlRmFjdG9yICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIG1hdGVyaWFsRGVmLmVtaXNzaXZlVGV4dHVyZSAhPT0gdW5kZWZpbmVkICYmIG1hdGVyaWFsVHlwZSAhPT0gTWVzaEJhc2ljTWF0ZXJpYWwgKSB7XG5cblx0XHRcdHBlbmRpbmcucHVzaCggcGFyc2VyLmFzc2lnblRleHR1cmUoIG1hdGVyaWFsUGFyYW1zLCAnZW1pc3NpdmVNYXAnLCBtYXRlcmlhbERlZi5lbWlzc2l2ZVRleHR1cmUgKSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKCBwZW5kaW5nICkudGhlbiggZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRsZXQgbWF0ZXJpYWw7XG5cblx0XHRcdGlmICggbWF0ZXJpYWxUeXBlID09PSBHTFRGTWVzaFN0YW5kYXJkU0dNYXRlcmlhbCApIHtcblxuXHRcdFx0XHRtYXRlcmlhbCA9IGV4dGVuc2lvbnNbIEVYVEVOU0lPTlMuS0hSX01BVEVSSUFMU19QQlJfU1BFQ1VMQVJfR0xPU1NJTkVTUyBdLmNyZWF0ZU1hdGVyaWFsKCBtYXRlcmlhbFBhcmFtcyApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdG1hdGVyaWFsID0gbmV3IG1hdGVyaWFsVHlwZSggbWF0ZXJpYWxQYXJhbXMgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG1hdGVyaWFsRGVmLm5hbWUgKSBtYXRlcmlhbC5uYW1lID0gbWF0ZXJpYWxEZWYubmFtZTtcblxuXHRcdFx0Ly8gYmFzZUNvbG9yVGV4dHVyZSwgZW1pc3NpdmVUZXh0dXJlLCBhbmQgc3BlY3VsYXJHbG9zc2luZXNzVGV4dHVyZSB1c2Ugc1JHQiBlbmNvZGluZy5cblx0XHRcdGlmICggbWF0ZXJpYWwubWFwICkgbWF0ZXJpYWwubWFwLmVuY29kaW5nID0gc1JHQkVuY29kaW5nO1xuXHRcdFx0aWYgKCBtYXRlcmlhbC5lbWlzc2l2ZU1hcCApIG1hdGVyaWFsLmVtaXNzaXZlTWFwLmVuY29kaW5nID0gc1JHQkVuY29kaW5nO1xuXG5cdFx0XHRhc3NpZ25FeHRyYXNUb1VzZXJEYXRhKCBtYXRlcmlhbCwgbWF0ZXJpYWxEZWYgKTtcblxuXHRcdFx0cGFyc2VyLmFzc29jaWF0aW9ucy5zZXQoIG1hdGVyaWFsLCB7IHR5cGU6ICdtYXRlcmlhbHMnLCBpbmRleDogbWF0ZXJpYWxJbmRleCB9ICk7XG5cblx0XHRcdGlmICggbWF0ZXJpYWxEZWYuZXh0ZW5zaW9ucyApIGFkZFVua25vd25FeHRlbnNpb25zVG9Vc2VyRGF0YSggZXh0ZW5zaW9ucywgbWF0ZXJpYWwsIG1hdGVyaWFsRGVmICk7XG5cblx0XHRcdHJldHVybiBtYXRlcmlhbDtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0LyoqIFdoZW4gT2JqZWN0M0QgaW5zdGFuY2VzIGFyZSB0YXJnZXRlZCBieSBhbmltYXRpb24sIHRoZXkgbmVlZCB1bmlxdWUgbmFtZXMuICovXG5cdGNyZWF0ZVVuaXF1ZU5hbWUoIG9yaWdpbmFsTmFtZSApIHtcblxuXHRcdGNvbnN0IHNhbml0aXplZE5hbWUgPSBQcm9wZXJ0eUJpbmRpbmcuc2FuaXRpemVOb2RlTmFtZSggb3JpZ2luYWxOYW1lIHx8ICcnICk7XG5cblx0XHRsZXQgbmFtZSA9IHNhbml0aXplZE5hbWU7XG5cblx0XHRmb3IgKCBsZXQgaSA9IDE7IHRoaXMubm9kZU5hbWVzVXNlZFsgbmFtZSBdOyArKyBpICkge1xuXG5cdFx0XHRuYW1lID0gc2FuaXRpemVkTmFtZSArICdfJyArIGk7XG5cblx0XHR9XG5cblx0XHR0aGlzLm5vZGVOYW1lc1VzZWRbIG5hbWUgXSA9IHRydWU7XG5cblx0XHRyZXR1cm4gbmFtZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi9ibG9iL21hc3Rlci9zcGVjaWZpY2F0aW9uLzIuMC9SRUFETUUubWQjZ2VvbWV0cnlcblx0ICpcblx0ICogQ3JlYXRlcyBCdWZmZXJHZW9tZXRyaWVzIGZyb20gcHJpbWl0aXZlcy5cblx0ICpcblx0ICogQHBhcmFtIHtBcnJheTxHTFRGLlByaW1pdGl2ZT59IHByaW1pdGl2ZXNcblx0ICogQHJldHVybiB7UHJvbWlzZTxBcnJheTxCdWZmZXJHZW9tZXRyeT4+fVxuXHQgKi9cblx0bG9hZEdlb21ldHJpZXMoIHByaW1pdGl2ZXMgKSB7XG5cblx0XHRjb25zdCBwYXJzZXIgPSB0aGlzO1xuXHRcdGNvbnN0IGV4dGVuc2lvbnMgPSB0aGlzLmV4dGVuc2lvbnM7XG5cdFx0Y29uc3QgY2FjaGUgPSB0aGlzLnByaW1pdGl2ZUNhY2hlO1xuXG5cdFx0ZnVuY3Rpb24gY3JlYXRlRHJhY29QcmltaXRpdmUoIHByaW1pdGl2ZSApIHtcblxuXHRcdFx0cmV0dXJuIGV4dGVuc2lvbnNbIEVYVEVOU0lPTlMuS0hSX0RSQUNPX01FU0hfQ09NUFJFU1NJT04gXVxuXHRcdFx0XHQuZGVjb2RlUHJpbWl0aXZlKCBwcmltaXRpdmUsIHBhcnNlciApXG5cdFx0XHRcdC50aGVuKCBmdW5jdGlvbiAoIGdlb21ldHJ5ICkge1xuXG5cdFx0XHRcdFx0cmV0dXJuIGFkZFByaW1pdGl2ZUF0dHJpYnV0ZXMoIGdlb21ldHJ5LCBwcmltaXRpdmUsIHBhcnNlciApO1xuXG5cdFx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBwcmltaXRpdmVzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCBwcmltaXRpdmUgPSBwcmltaXRpdmVzWyBpIF07XG5cdFx0XHRjb25zdCBjYWNoZUtleSA9IGNyZWF0ZVByaW1pdGl2ZUtleSggcHJpbWl0aXZlICk7XG5cblx0XHRcdC8vIFNlZSBpZiB3ZSd2ZSBhbHJlYWR5IGNyZWF0ZWQgdGhpcyBnZW9tZXRyeVxuXHRcdFx0Y29uc3QgY2FjaGVkID0gY2FjaGVbIGNhY2hlS2V5IF07XG5cblx0XHRcdGlmICggY2FjaGVkICkge1xuXG5cdFx0XHRcdC8vIFVzZSB0aGUgY2FjaGVkIGdlb21ldHJ5IGlmIGl0IGV4aXN0c1xuXHRcdFx0XHRwZW5kaW5nLnB1c2goIGNhY2hlZC5wcm9taXNlICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0bGV0IGdlb21ldHJ5UHJvbWlzZTtcblxuXHRcdFx0XHRpZiAoIHByaW1pdGl2ZS5leHRlbnNpb25zICYmIHByaW1pdGl2ZS5leHRlbnNpb25zWyBFWFRFTlNJT05TLktIUl9EUkFDT19NRVNIX0NPTVBSRVNTSU9OIF0gKSB7XG5cblx0XHRcdFx0XHQvLyBVc2UgRFJBQ08gZ2VvbWV0cnkgaWYgYXZhaWxhYmxlXG5cdFx0XHRcdFx0Z2VvbWV0cnlQcm9taXNlID0gY3JlYXRlRHJhY29QcmltaXRpdmUoIHByaW1pdGl2ZSApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGdlb21ldHJ5XG5cdFx0XHRcdFx0Z2VvbWV0cnlQcm9taXNlID0gYWRkUHJpbWl0aXZlQXR0cmlidXRlcyggbmV3IEJ1ZmZlckdlb21ldHJ5KCksIHByaW1pdGl2ZSwgcGFyc2VyICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENhY2hlIHRoaXMgZ2VvbWV0cnlcblx0XHRcdFx0Y2FjaGVbIGNhY2hlS2V5IF0gPSB7IHByaW1pdGl2ZTogcHJpbWl0aXZlLCBwcm9taXNlOiBnZW9tZXRyeVByb21pc2UgfTtcblxuXHRcdFx0XHRwZW5kaW5nLnB1c2goIGdlb21ldHJ5UHJvbWlzZSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoIHBlbmRpbmcgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi9ibG9iL21hc3Rlci9zcGVjaWZpY2F0aW9uLzIuMC9SRUFETUUubWQjbWVzaGVzXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBtZXNoSW5kZXhcblx0ICogQHJldHVybiB7UHJvbWlzZTxHcm91cHxNZXNofFNraW5uZWRNZXNoPn1cblx0ICovXG5cdGxvYWRNZXNoKCBtZXNoSW5kZXggKSB7XG5cblx0XHRjb25zdCBwYXJzZXIgPSB0aGlzO1xuXHRcdGNvbnN0IGpzb24gPSB0aGlzLmpzb247XG5cdFx0Y29uc3QgZXh0ZW5zaW9ucyA9IHRoaXMuZXh0ZW5zaW9ucztcblxuXHRcdGNvbnN0IG1lc2hEZWYgPSBqc29uLm1lc2hlc1sgbWVzaEluZGV4IF07XG5cdFx0Y29uc3QgcHJpbWl0aXZlcyA9IG1lc2hEZWYucHJpbWl0aXZlcztcblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBwcmltaXRpdmVzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRjb25zdCBtYXRlcmlhbCA9IHByaW1pdGl2ZXNbIGkgXS5tYXRlcmlhbCA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdD8gY3JlYXRlRGVmYXVsdE1hdGVyaWFsKCB0aGlzLmNhY2hlIClcblx0XHRcdFx0OiB0aGlzLmdldERlcGVuZGVuY3koICdtYXRlcmlhbCcsIHByaW1pdGl2ZXNbIGkgXS5tYXRlcmlhbCApO1xuXG5cdFx0XHRwZW5kaW5nLnB1c2goIG1hdGVyaWFsICk7XG5cblx0XHR9XG5cblx0XHRwZW5kaW5nLnB1c2goIHBhcnNlci5sb2FkR2VvbWV0cmllcyggcHJpbWl0aXZlcyApICk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoIHBlbmRpbmcgKS50aGVuKCBmdW5jdGlvbiAoIHJlc3VsdHMgKSB7XG5cblx0XHRcdGNvbnN0IG1hdGVyaWFscyA9IHJlc3VsdHMuc2xpY2UoIDAsIHJlc3VsdHMubGVuZ3RoIC0gMSApO1xuXHRcdFx0Y29uc3QgZ2VvbWV0cmllcyA9IHJlc3VsdHNbIHJlc3VsdHMubGVuZ3RoIC0gMSBdO1xuXG5cdFx0XHRjb25zdCBtZXNoZXMgPSBbXTtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IGdlb21ldHJpZXMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0Y29uc3QgZ2VvbWV0cnkgPSBnZW9tZXRyaWVzWyBpIF07XG5cdFx0XHRcdGNvbnN0IHByaW1pdGl2ZSA9IHByaW1pdGl2ZXNbIGkgXTtcblxuXHRcdFx0XHQvLyAxLiBjcmVhdGUgTWVzaFxuXG5cdFx0XHRcdGxldCBtZXNoO1xuXG5cdFx0XHRcdGNvbnN0IG1hdGVyaWFsID0gbWF0ZXJpYWxzWyBpIF07XG5cblx0XHRcdFx0aWYgKCBwcmltaXRpdmUubW9kZSA9PT0gV0VCR0xfQ09OU1RBTlRTLlRSSUFOR0xFUyB8fFxuXHRcdFx0XHRcdFx0cHJpbWl0aXZlLm1vZGUgPT09IFdFQkdMX0NPTlNUQU5UUy5UUklBTkdMRV9TVFJJUCB8fFxuXHRcdFx0XHRcdFx0cHJpbWl0aXZlLm1vZGUgPT09IFdFQkdMX0NPTlNUQU5UUy5UUklBTkdMRV9GQU4gfHxcblx0XHRcdFx0XHRcdHByaW1pdGl2ZS5tb2RlID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHQvLyAuaXNTa2lubmVkTWVzaCBpc24ndCBpbiBnbFRGIHNwZWMuIFNlZSAuX21hcmtEZWZzKClcblx0XHRcdFx0XHRtZXNoID0gbWVzaERlZi5pc1NraW5uZWRNZXNoID09PSB0cnVlXG5cdFx0XHRcdFx0XHQ/IG5ldyBTa2lubmVkTWVzaCggZ2VvbWV0cnksIG1hdGVyaWFsIClcblx0XHRcdFx0XHRcdDogbmV3IE1lc2goIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXG5cdFx0XHRcdFx0aWYgKCBtZXNoLmlzU2tpbm5lZE1lc2ggPT09IHRydWUgJiYgISBtZXNoLmdlb21ldHJ5LmF0dHJpYnV0ZXMuc2tpbldlaWdodC5ub3JtYWxpemVkICkge1xuXG5cdFx0XHRcdFx0XHQvLyB3ZSBub3JtYWxpemUgZmxvYXRpbmcgcG9pbnQgc2tpbiB3ZWlnaHQgYXJyYXkgdG8gZml4IG1hbGZvcm1lZCBhc3NldHMgKHNlZSAjMTUzMTkpXG5cdFx0XHRcdFx0XHQvLyBpdCdzIGltcG9ydGFudCB0byBza2lwIHRoaXMgZm9yIG5vbi1mbG9hdDMyIGRhdGEgc2luY2Ugbm9ybWFsaXplU2tpbldlaWdodHMgYXNzdW1lcyBub24tbm9ybWFsaXplZCBpbnB1dHNcblx0XHRcdFx0XHRcdG1lc2gubm9ybWFsaXplU2tpbldlaWdodHMoKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggcHJpbWl0aXZlLm1vZGUgPT09IFdFQkdMX0NPTlNUQU5UUy5UUklBTkdMRV9TVFJJUCApIHtcblxuXHRcdFx0XHRcdFx0bWVzaC5nZW9tZXRyeSA9IHRvVHJpYW5nbGVzRHJhd01vZGUoIG1lc2guZ2VvbWV0cnksIFRyaWFuZ2xlU3RyaXBEcmF3TW9kZSApO1xuXG5cdFx0XHRcdFx0fSBlbHNlIGlmICggcHJpbWl0aXZlLm1vZGUgPT09IFdFQkdMX0NPTlNUQU5UUy5UUklBTkdMRV9GQU4gKSB7XG5cblx0XHRcdFx0XHRcdG1lc2guZ2VvbWV0cnkgPSB0b1RyaWFuZ2xlc0RyYXdNb2RlKCBtZXNoLmdlb21ldHJ5LCBUcmlhbmdsZUZhbkRyYXdNb2RlICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIGlmICggcHJpbWl0aXZlLm1vZGUgPT09IFdFQkdMX0NPTlNUQU5UUy5MSU5FUyApIHtcblxuXHRcdFx0XHRcdG1lc2ggPSBuZXcgTGluZVNlZ21lbnRzKCBnZW9tZXRyeSwgbWF0ZXJpYWwgKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCBwcmltaXRpdmUubW9kZSA9PT0gV0VCR0xfQ09OU1RBTlRTLkxJTkVfU1RSSVAgKSB7XG5cblx0XHRcdFx0XHRtZXNoID0gbmV3IExpbmUoIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIHByaW1pdGl2ZS5tb2RlID09PSBXRUJHTF9DT05TVEFOVFMuTElORV9MT09QICkge1xuXG5cdFx0XHRcdFx0bWVzaCA9IG5ldyBMaW5lTG9vcCggZ2VvbWV0cnksIG1hdGVyaWFsICk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggcHJpbWl0aXZlLm1vZGUgPT09IFdFQkdMX0NPTlNUQU5UUy5QT0lOVFMgKSB7XG5cblx0XHRcdFx0XHRtZXNoID0gbmV3IFBvaW50cyggZ2VvbWV0cnksIG1hdGVyaWFsICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggJ1RIUkVFLkdMVEZMb2FkZXI6IFByaW1pdGl2ZSBtb2RlIHVuc3VwcG9ydGVkOiAnICsgcHJpbWl0aXZlLm1vZGUgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBPYmplY3Qua2V5cyggbWVzaC5nZW9tZXRyeS5tb3JwaEF0dHJpYnV0ZXMgKS5sZW5ndGggPiAwICkge1xuXG5cdFx0XHRcdFx0dXBkYXRlTW9ycGhUYXJnZXRzKCBtZXNoLCBtZXNoRGVmICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdG1lc2gubmFtZSA9IHBhcnNlci5jcmVhdGVVbmlxdWVOYW1lKCBtZXNoRGVmLm5hbWUgfHwgKCAnbWVzaF8nICsgbWVzaEluZGV4ICkgKTtcblxuXHRcdFx0XHRhc3NpZ25FeHRyYXNUb1VzZXJEYXRhKCBtZXNoLCBtZXNoRGVmICk7XG5cblx0XHRcdFx0aWYgKCBwcmltaXRpdmUuZXh0ZW5zaW9ucyApIGFkZFVua25vd25FeHRlbnNpb25zVG9Vc2VyRGF0YSggZXh0ZW5zaW9ucywgbWVzaCwgcHJpbWl0aXZlICk7XG5cblx0XHRcdFx0cGFyc2VyLmFzc2lnbkZpbmFsTWF0ZXJpYWwoIG1lc2ggKTtcblxuXHRcdFx0XHRtZXNoZXMucHVzaCggbWVzaCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWVzaGVzLmxlbmd0aCA9PT0gMSApIHtcblxuXHRcdFx0XHRyZXR1cm4gbWVzaGVzWyAwIF07XG5cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZ3JvdXAgPSBuZXcgR3JvdXAoKTtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IG1lc2hlcy5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0XHRncm91cC5hZGQoIG1lc2hlc1sgaSBdICk7XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGdyb3VwO1xuXG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogU3BlY2lmaWNhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL3NwZWNpZmljYXRpb24vMi4wI2NhbWVyYXNcblx0ICogQHBhcmFtIHtudW1iZXJ9IGNhbWVyYUluZGV4XG5cdCAqIEByZXR1cm4ge1Byb21pc2U8VEhSRUUuQ2FtZXJhPn1cblx0ICovXG5cdGxvYWRDYW1lcmEoIGNhbWVyYUluZGV4ICkge1xuXG5cdFx0bGV0IGNhbWVyYTtcblx0XHRjb25zdCBjYW1lcmFEZWYgPSB0aGlzLmpzb24uY2FtZXJhc1sgY2FtZXJhSW5kZXggXTtcblx0XHRjb25zdCBwYXJhbXMgPSBjYW1lcmFEZWZbIGNhbWVyYURlZi50eXBlIF07XG5cblx0XHRpZiAoICEgcGFyYW1zICkge1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5HTFRGTG9hZGVyOiBNaXNzaW5nIGNhbWVyYSBwYXJhbWV0ZXJzLicgKTtcblx0XHRcdHJldHVybjtcblxuXHRcdH1cblxuXHRcdGlmICggY2FtZXJhRGVmLnR5cGUgPT09ICdwZXJzcGVjdGl2ZScgKSB7XG5cblx0XHRcdGNhbWVyYSA9IG5ldyBQZXJzcGVjdGl2ZUNhbWVyYSggTWF0aFV0aWxzLnJhZFRvRGVnKCBwYXJhbXMueWZvdiApLCBwYXJhbXMuYXNwZWN0UmF0aW8gfHwgMSwgcGFyYW1zLnpuZWFyIHx8IDEsIHBhcmFtcy56ZmFyIHx8IDJlNiApO1xuXG5cdFx0fSBlbHNlIGlmICggY2FtZXJhRGVmLnR5cGUgPT09ICdvcnRob2dyYXBoaWMnICkge1xuXG5cdFx0XHRjYW1lcmEgPSBuZXcgT3J0aG9ncmFwaGljQ2FtZXJhKCAtIHBhcmFtcy54bWFnLCBwYXJhbXMueG1hZywgcGFyYW1zLnltYWcsIC0gcGFyYW1zLnltYWcsIHBhcmFtcy56bmVhciwgcGFyYW1zLnpmYXIgKTtcblxuXHRcdH1cblxuXHRcdGlmICggY2FtZXJhRGVmLm5hbWUgKSBjYW1lcmEubmFtZSA9IHRoaXMuY3JlYXRlVW5pcXVlTmFtZSggY2FtZXJhRGVmLm5hbWUgKTtcblxuXHRcdGFzc2lnbkV4dHJhc1RvVXNlckRhdGEoIGNhbWVyYSwgY2FtZXJhRGVmICk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBjYW1lcmEgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNwZWNpZmljYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi90cmVlL21hc3Rlci9zcGVjaWZpY2F0aW9uLzIuMCNza2luc1xuXHQgKiBAcGFyYW0ge251bWJlcn0gc2tpbkluZGV4XG5cdCAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0Pn1cblx0ICovXG5cdGxvYWRTa2luKCBza2luSW5kZXggKSB7XG5cblx0XHRjb25zdCBza2luRGVmID0gdGhpcy5qc29uLnNraW5zWyBza2luSW5kZXggXTtcblxuXHRcdGNvbnN0IHNraW5FbnRyeSA9IHsgam9pbnRzOiBza2luRGVmLmpvaW50cyB9O1xuXG5cdFx0aWYgKCBza2luRGVmLmludmVyc2VCaW5kTWF0cmljZXMgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSggc2tpbkVudHJ5ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5nZXREZXBlbmRlbmN5KCAnYWNjZXNzb3InLCBza2luRGVmLmludmVyc2VCaW5kTWF0cmljZXMgKS50aGVuKCBmdW5jdGlvbiAoIGFjY2Vzc29yICkge1xuXG5cdFx0XHRza2luRW50cnkuaW52ZXJzZUJpbmRNYXRyaWNlcyA9IGFjY2Vzc29yO1xuXG5cdFx0XHRyZXR1cm4gc2tpbkVudHJ5O1xuXG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogU3BlY2lmaWNhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL3NwZWNpZmljYXRpb24vMi4wI2FuaW1hdGlvbnNcblx0ICogQHBhcmFtIHtudW1iZXJ9IGFuaW1hdGlvbkluZGV4XG5cdCAqIEByZXR1cm4ge1Byb21pc2U8QW5pbWF0aW9uQ2xpcD59XG5cdCAqL1xuXHRsb2FkQW5pbWF0aW9uKCBhbmltYXRpb25JbmRleCApIHtcblxuXHRcdGNvbnN0IGpzb24gPSB0aGlzLmpzb247XG5cblx0XHRjb25zdCBhbmltYXRpb25EZWYgPSBqc29uLmFuaW1hdGlvbnNbIGFuaW1hdGlvbkluZGV4IF07XG5cblx0XHRjb25zdCBwZW5kaW5nTm9kZXMgPSBbXTtcblx0XHRjb25zdCBwZW5kaW5nSW5wdXRBY2Nlc3NvcnMgPSBbXTtcblx0XHRjb25zdCBwZW5kaW5nT3V0cHV0QWNjZXNzb3JzID0gW107XG5cdFx0Y29uc3QgcGVuZGluZ1NhbXBsZXJzID0gW107XG5cdFx0Y29uc3QgcGVuZGluZ1RhcmdldHMgPSBbXTtcblxuXHRcdGZvciAoIGxldCBpID0gMCwgaWwgPSBhbmltYXRpb25EZWYuY2hhbm5lbHMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdGNvbnN0IGNoYW5uZWwgPSBhbmltYXRpb25EZWYuY2hhbm5lbHNbIGkgXTtcblx0XHRcdGNvbnN0IHNhbXBsZXIgPSBhbmltYXRpb25EZWYuc2FtcGxlcnNbIGNoYW5uZWwuc2FtcGxlciBdO1xuXHRcdFx0Y29uc3QgdGFyZ2V0ID0gY2hhbm5lbC50YXJnZXQ7XG5cdFx0XHRjb25zdCBuYW1lID0gdGFyZ2V0Lm5vZGUgIT09IHVuZGVmaW5lZCA/IHRhcmdldC5ub2RlIDogdGFyZ2V0LmlkOyAvLyBOT1RFOiB0YXJnZXQuaWQgaXMgZGVwcmVjYXRlZC5cblx0XHRcdGNvbnN0IGlucHV0ID0gYW5pbWF0aW9uRGVmLnBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCA/IGFuaW1hdGlvbkRlZi5wYXJhbWV0ZXJzWyBzYW1wbGVyLmlucHV0IF0gOiBzYW1wbGVyLmlucHV0O1xuXHRcdFx0Y29uc3Qgb3V0cHV0ID0gYW5pbWF0aW9uRGVmLnBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCA/IGFuaW1hdGlvbkRlZi5wYXJhbWV0ZXJzWyBzYW1wbGVyLm91dHB1dCBdIDogc2FtcGxlci5vdXRwdXQ7XG5cblx0XHRcdHBlbmRpbmdOb2Rlcy5wdXNoKCB0aGlzLmdldERlcGVuZGVuY3koICdub2RlJywgbmFtZSApICk7XG5cdFx0XHRwZW5kaW5nSW5wdXRBY2Nlc3NvcnMucHVzaCggdGhpcy5nZXREZXBlbmRlbmN5KCAnYWNjZXNzb3InLCBpbnB1dCApICk7XG5cdFx0XHRwZW5kaW5nT3V0cHV0QWNjZXNzb3JzLnB1c2goIHRoaXMuZ2V0RGVwZW5kZW5jeSggJ2FjY2Vzc29yJywgb3V0cHV0ICkgKTtcblx0XHRcdHBlbmRpbmdTYW1wbGVycy5wdXNoKCBzYW1wbGVyICk7XG5cdFx0XHRwZW5kaW5nVGFyZ2V0cy5wdXNoKCB0YXJnZXQgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLmFsbCggW1xuXG5cdFx0XHRQcm9taXNlLmFsbCggcGVuZGluZ05vZGVzICksXG5cdFx0XHRQcm9taXNlLmFsbCggcGVuZGluZ0lucHV0QWNjZXNzb3JzICksXG5cdFx0XHRQcm9taXNlLmFsbCggcGVuZGluZ091dHB1dEFjY2Vzc29ycyApLFxuXHRcdFx0UHJvbWlzZS5hbGwoIHBlbmRpbmdTYW1wbGVycyApLFxuXHRcdFx0UHJvbWlzZS5hbGwoIHBlbmRpbmdUYXJnZXRzIClcblxuXHRcdF0gKS50aGVuKCBmdW5jdGlvbiAoIGRlcGVuZGVuY2llcyApIHtcblxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBkZXBlbmRlbmNpZXNbIDAgXTtcblx0XHRcdGNvbnN0IGlucHV0QWNjZXNzb3JzID0gZGVwZW5kZW5jaWVzWyAxIF07XG5cdFx0XHRjb25zdCBvdXRwdXRBY2Nlc3NvcnMgPSBkZXBlbmRlbmNpZXNbIDIgXTtcblx0XHRcdGNvbnN0IHNhbXBsZXJzID0gZGVwZW5kZW5jaWVzWyAzIF07XG5cdFx0XHRjb25zdCB0YXJnZXRzID0gZGVwZW5kZW5jaWVzWyA0IF07XG5cblx0XHRcdGNvbnN0IHRyYWNrcyA9IFtdO1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gbm9kZXMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0Y29uc3Qgbm9kZSA9IG5vZGVzWyBpIF07XG5cdFx0XHRcdGNvbnN0IGlucHV0QWNjZXNzb3IgPSBpbnB1dEFjY2Vzc29yc1sgaSBdO1xuXHRcdFx0XHRjb25zdCBvdXRwdXRBY2Nlc3NvciA9IG91dHB1dEFjY2Vzc29yc1sgaSBdO1xuXHRcdFx0XHRjb25zdCBzYW1wbGVyID0gc2FtcGxlcnNbIGkgXTtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gdGFyZ2V0c1sgaSBdO1xuXG5cdFx0XHRcdGlmICggbm9kZSA9PT0gdW5kZWZpbmVkICkgY29udGludWU7XG5cblx0XHRcdFx0bm9kZS51cGRhdGVNYXRyaXgoKTtcblx0XHRcdFx0bm9kZS5tYXRyaXhBdXRvVXBkYXRlID0gdHJ1ZTtcblxuXHRcdFx0XHRsZXQgVHlwZWRLZXlmcmFtZVRyYWNrO1xuXG5cdFx0XHRcdHN3aXRjaCAoIFBBVEhfUFJPUEVSVElFU1sgdGFyZ2V0LnBhdGggXSApIHtcblxuXHRcdFx0XHRcdGNhc2UgUEFUSF9QUk9QRVJUSUVTLndlaWdodHM6XG5cblx0XHRcdFx0XHRcdFR5cGVkS2V5ZnJhbWVUcmFjayA9IE51bWJlcktleWZyYW1lVHJhY2s7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgUEFUSF9QUk9QRVJUSUVTLnJvdGF0aW9uOlxuXG5cdFx0XHRcdFx0XHRUeXBlZEtleWZyYW1lVHJhY2sgPSBRdWF0ZXJuaW9uS2V5ZnJhbWVUcmFjaztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSBQQVRIX1BST1BFUlRJRVMucG9zaXRpb246XG5cdFx0XHRcdFx0Y2FzZSBQQVRIX1BST1BFUlRJRVMuc2NhbGU6XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHRcdFx0VHlwZWRLZXlmcmFtZVRyYWNrID0gVmVjdG9yS2V5ZnJhbWVUcmFjaztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB0YXJnZXROYW1lID0gbm9kZS5uYW1lID8gbm9kZS5uYW1lIDogbm9kZS51dWlkO1xuXG5cdFx0XHRcdGNvbnN0IGludGVycG9sYXRpb24gPSBzYW1wbGVyLmludGVycG9sYXRpb24gIT09IHVuZGVmaW5lZCA/IElOVEVSUE9MQVRJT05bIHNhbXBsZXIuaW50ZXJwb2xhdGlvbiBdIDogSW50ZXJwb2xhdGVMaW5lYXI7XG5cblx0XHRcdFx0Y29uc3QgdGFyZ2V0TmFtZXMgPSBbXTtcblxuXHRcdFx0XHRpZiAoIFBBVEhfUFJPUEVSVElFU1sgdGFyZ2V0LnBhdGggXSA9PT0gUEFUSF9QUk9QRVJUSUVTLndlaWdodHMgKSB7XG5cblx0XHRcdFx0XHQvLyBOb2RlIG1heSBiZSBhIEdyb3VwIChnbFRGIG1lc2ggd2l0aCBzZXZlcmFsIHByaW1pdGl2ZXMpIG9yIGEgTWVzaC5cblx0XHRcdFx0XHRub2RlLnRyYXZlcnNlKCBmdW5jdGlvbiAoIG9iamVjdCApIHtcblxuXHRcdFx0XHRcdFx0aWYgKCBvYmplY3QuaXNNZXNoID09PSB0cnVlICYmIG9iamVjdC5tb3JwaFRhcmdldEluZmx1ZW5jZXMgKSB7XG5cblx0XHRcdFx0XHRcdFx0dGFyZ2V0TmFtZXMucHVzaCggb2JqZWN0Lm5hbWUgPyBvYmplY3QubmFtZSA6IG9iamVjdC51dWlkICk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0dGFyZ2V0TmFtZXMucHVzaCggdGFyZ2V0TmFtZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgb3V0cHV0QXJyYXkgPSBvdXRwdXRBY2Nlc3Nvci5hcnJheTtcblxuXHRcdFx0XHRpZiAoIG91dHB1dEFjY2Vzc29yLm5vcm1hbGl6ZWQgKSB7XG5cblx0XHRcdFx0XHRjb25zdCBzY2FsZSA9IGdldE5vcm1hbGl6ZWRDb21wb25lbnRTY2FsZSggb3V0cHV0QXJyYXkuY29uc3RydWN0b3IgKTtcblx0XHRcdFx0XHRjb25zdCBzY2FsZWQgPSBuZXcgRmxvYXQzMkFycmF5KCBvdXRwdXRBcnJheS5sZW5ndGggKTtcblxuXHRcdFx0XHRcdGZvciAoIGxldCBqID0gMCwgamwgPSBvdXRwdXRBcnJheS5sZW5ndGg7IGogPCBqbDsgaiArKyApIHtcblxuXHRcdFx0XHRcdFx0c2NhbGVkWyBqIF0gPSBvdXRwdXRBcnJheVsgaiBdICogc2NhbGU7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXRBcnJheSA9IHNjYWxlZDtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICggbGV0IGogPSAwLCBqbCA9IHRhcmdldE5hbWVzLmxlbmd0aDsgaiA8IGpsOyBqICsrICkge1xuXG5cdFx0XHRcdFx0Y29uc3QgdHJhY2sgPSBuZXcgVHlwZWRLZXlmcmFtZVRyYWNrKFxuXHRcdFx0XHRcdFx0dGFyZ2V0TmFtZXNbIGogXSArICcuJyArIFBBVEhfUFJPUEVSVElFU1sgdGFyZ2V0LnBhdGggXSxcblx0XHRcdFx0XHRcdGlucHV0QWNjZXNzb3IuYXJyYXksXG5cdFx0XHRcdFx0XHRvdXRwdXRBcnJheSxcblx0XHRcdFx0XHRcdGludGVycG9sYXRpb25cblx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0Ly8gT3ZlcnJpZGUgaW50ZXJwb2xhdGlvbiB3aXRoIGN1c3RvbSBmYWN0b3J5IG1ldGhvZC5cblx0XHRcdFx0XHRpZiAoIHNhbXBsZXIuaW50ZXJwb2xhdGlvbiA9PT0gJ0NVQklDU1BMSU5FJyApIHtcblxuXHRcdFx0XHRcdFx0dHJhY2suY3JlYXRlSW50ZXJwb2xhbnQgPSBmdW5jdGlvbiBJbnRlcnBvbGFudEZhY3RvcnlNZXRob2RHTFRGQ3ViaWNTcGxpbmUoIHJlc3VsdCApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBBIENVQklDU1BMSU5FIGtleWZyYW1lIGluIGdsVEYgaGFzIHRocmVlIG91dHB1dCB2YWx1ZXMgZm9yIGVhY2ggaW5wdXQgdmFsdWUsXG5cdFx0XHRcdFx0XHRcdC8vIHJlcHJlc2VudGluZyBpblRhbmdlbnQsIHNwbGluZVZlcnRleCwgYW5kIG91dFRhbmdlbnQuIEFzIGEgcmVzdWx0LCB0cmFjay5nZXRWYWx1ZVNpemUoKVxuXHRcdFx0XHRcdFx0XHQvLyBtdXN0IGJlIGRpdmlkZWQgYnkgdGhyZWUgdG8gZ2V0IHRoZSBpbnRlcnBvbGFudCdzIHNhbXBsZVNpemUgYXJndW1lbnQuXG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgaW50ZXJwb2xhbnRUeXBlID0gKCB0aGlzIGluc3RhbmNlb2YgUXVhdGVybmlvbktleWZyYW1lVHJhY2sgKSA/IEdMVEZDdWJpY1NwbGluZVF1YXRlcm5pb25JbnRlcnBvbGFudCA6IEdMVEZDdWJpY1NwbGluZUludGVycG9sYW50O1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgaW50ZXJwb2xhbnRUeXBlKCB0aGlzLnRpbWVzLCB0aGlzLnZhbHVlcywgdGhpcy5nZXRWYWx1ZVNpemUoKSAvIDMsIHJlc3VsdCApO1xuXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHQvLyBNYXJrIGFzIENVQklDU1BMSU5FLiBgdHJhY2suZ2V0SW50ZXJwb2xhdGlvbigpYCBkb2Vzbid0IHN1cHBvcnQgY3VzdG9tIGludGVycG9sYW50cy5cblx0XHRcdFx0XHRcdHRyYWNrLmNyZWF0ZUludGVycG9sYW50LmlzSW50ZXJwb2xhbnRGYWN0b3J5TWV0aG9kR0xURkN1YmljU3BsaW5lID0gdHJ1ZTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRyYWNrcy5wdXNoKCB0cmFjayApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBuYW1lID0gYW5pbWF0aW9uRGVmLm5hbWUgPyBhbmltYXRpb25EZWYubmFtZSA6ICdhbmltYXRpb25fJyArIGFuaW1hdGlvbkluZGV4O1xuXG5cdFx0XHRyZXR1cm4gbmV3IEFuaW1hdGlvbkNsaXAoIG5hbWUsIHVuZGVmaW5lZCwgdHJhY2tzICk7XG5cblx0XHR9ICk7XG5cblx0fVxuXG5cdGNyZWF0ZU5vZGVNZXNoKCBub2RlSW5kZXggKSB7XG5cblx0XHRjb25zdCBqc29uID0gdGhpcy5qc29uO1xuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXM7XG5cdFx0Y29uc3Qgbm9kZURlZiA9IGpzb24ubm9kZXNbIG5vZGVJbmRleCBdO1xuXG5cdFx0aWYgKCBub2RlRGVmLm1lc2ggPT09IHVuZGVmaW5lZCApIHJldHVybiBudWxsO1xuXG5cdFx0cmV0dXJuIHBhcnNlci5nZXREZXBlbmRlbmN5KCAnbWVzaCcsIG5vZGVEZWYubWVzaCApLnRoZW4oIGZ1bmN0aW9uICggbWVzaCApIHtcblxuXHRcdFx0Y29uc3Qgbm9kZSA9IHBhcnNlci5fZ2V0Tm9kZVJlZiggcGFyc2VyLm1lc2hDYWNoZSwgbm9kZURlZi5tZXNoLCBtZXNoICk7XG5cblx0XHRcdC8vIGlmIHdlaWdodHMgYXJlIHByb3ZpZGVkIG9uIHRoZSBub2RlLCBvdmVycmlkZSB3ZWlnaHRzIG9uIHRoZSBtZXNoLlxuXHRcdFx0aWYgKCBub2RlRGVmLndlaWdodHMgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRub2RlLnRyYXZlcnNlKCBmdW5jdGlvbiAoIG8gKSB7XG5cblx0XHRcdFx0XHRpZiAoICEgby5pc01lc2ggKSByZXR1cm47XG5cblx0XHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gbm9kZURlZi53ZWlnaHRzLmxlbmd0aDsgaSA8IGlsOyBpICsrICkge1xuXG5cdFx0XHRcdFx0XHRvLm1vcnBoVGFyZ2V0SW5mbHVlbmNlc1sgaSBdID0gbm9kZURlZi53ZWlnaHRzWyBpIF07XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBub2RlO1xuXG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogU3BlY2lmaWNhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL3NwZWNpZmljYXRpb24vMi4wI25vZGVzLWFuZC1oaWVyYXJjaHlcblx0ICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleFxuXHQgKiBAcmV0dXJuIHtQcm9taXNlPE9iamVjdDNEPn1cblx0ICovXG5cdGxvYWROb2RlKCBub2RlSW5kZXggKSB7XG5cblx0XHRjb25zdCBqc29uID0gdGhpcy5qc29uO1xuXHRcdGNvbnN0IGV4dGVuc2lvbnMgPSB0aGlzLmV4dGVuc2lvbnM7XG5cdFx0Y29uc3QgcGFyc2VyID0gdGhpcztcblxuXHRcdGNvbnN0IG5vZGVEZWYgPSBqc29uLm5vZGVzWyBub2RlSW5kZXggXTtcblxuXHRcdC8vIHJlc2VydmUgbm9kZSdzIG5hbWUgYmVmb3JlIGl0cyBkZXBlbmRlbmNpZXMsIHNvIHRoZSByb290IGhhcyB0aGUgaW50ZW5kZWQgbmFtZS5cblx0XHRjb25zdCBub2RlTmFtZSA9IG5vZGVEZWYubmFtZSA/IHBhcnNlci5jcmVhdGVVbmlxdWVOYW1lKCBub2RlRGVmLm5hbWUgKSA6ICcnO1xuXG5cdFx0cmV0dXJuICggZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRjb25zdCBwZW5kaW5nID0gW107XG5cblx0XHRcdGNvbnN0IG1lc2hQcm9taXNlID0gcGFyc2VyLl9pbnZva2VPbmUoIGZ1bmN0aW9uICggZXh0ICkge1xuXG5cdFx0XHRcdHJldHVybiBleHQuY3JlYXRlTm9kZU1lc2ggJiYgZXh0LmNyZWF0ZU5vZGVNZXNoKCBub2RlSW5kZXggKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0XHRpZiAoIG1lc2hQcm9taXNlICkge1xuXG5cdFx0XHRcdHBlbmRpbmcucHVzaCggbWVzaFByb21pc2UgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG5vZGVEZWYuY2FtZXJhICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0cGVuZGluZy5wdXNoKCBwYXJzZXIuZ2V0RGVwZW5kZW5jeSggJ2NhbWVyYScsIG5vZGVEZWYuY2FtZXJhICkudGhlbiggZnVuY3Rpb24gKCBjYW1lcmEgKSB7XG5cblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VyLl9nZXROb2RlUmVmKCBwYXJzZXIuY2FtZXJhQ2FjaGUsIG5vZGVEZWYuY2FtZXJhLCBjYW1lcmEgKTtcblxuXHRcdFx0XHR9ICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZXIuX2ludm9rZUFsbCggZnVuY3Rpb24gKCBleHQgKSB7XG5cblx0XHRcdFx0cmV0dXJuIGV4dC5jcmVhdGVOb2RlQXR0YWNobWVudCAmJiBleHQuY3JlYXRlTm9kZUF0dGFjaG1lbnQoIG5vZGVJbmRleCApO1xuXG5cdFx0XHR9ICkuZm9yRWFjaCggZnVuY3Rpb24gKCBwcm9taXNlICkge1xuXG5cdFx0XHRcdHBlbmRpbmcucHVzaCggcHJvbWlzZSApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLmFsbCggcGVuZGluZyApO1xuXG5cdFx0fSgpICkudGhlbiggZnVuY3Rpb24gKCBvYmplY3RzICkge1xuXG5cdFx0XHRsZXQgbm9kZTtcblxuXHRcdFx0Ly8gLmlzQm9uZSBpc24ndCBpbiBnbFRGIHNwZWMuIFNlZSAuX21hcmtEZWZzXG5cdFx0XHRpZiAoIG5vZGVEZWYuaXNCb25lID09PSB0cnVlICkge1xuXG5cdFx0XHRcdG5vZGUgPSBuZXcgQm9uZSgpO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBvYmplY3RzLmxlbmd0aCA+IDEgKSB7XG5cblx0XHRcdFx0bm9kZSA9IG5ldyBHcm91cCgpO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBvYmplY3RzLmxlbmd0aCA9PT0gMSApIHtcblxuXHRcdFx0XHRub2RlID0gb2JqZWN0c1sgMCBdO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdG5vZGUgPSBuZXcgT2JqZWN0M0QoKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG5vZGUgIT09IG9iamVjdHNbIDAgXSApIHtcblxuXHRcdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gb2JqZWN0cy5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0XHRcdG5vZGUuYWRkKCBvYmplY3RzWyBpIF0gKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBub2RlRGVmLm5hbWUgKSB7XG5cblx0XHRcdFx0bm9kZS51c2VyRGF0YS5uYW1lID0gbm9kZURlZi5uYW1lO1xuXHRcdFx0XHRub2RlLm5hbWUgPSBub2RlTmFtZTtcblxuXHRcdFx0fVxuXG5cdFx0XHRhc3NpZ25FeHRyYXNUb1VzZXJEYXRhKCBub2RlLCBub2RlRGVmICk7XG5cblx0XHRcdGlmICggbm9kZURlZi5leHRlbnNpb25zICkgYWRkVW5rbm93bkV4dGVuc2lvbnNUb1VzZXJEYXRhKCBleHRlbnNpb25zLCBub2RlLCBub2RlRGVmICk7XG5cblx0XHRcdGlmICggbm9kZURlZi5tYXRyaXggIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRjb25zdCBtYXRyaXggPSBuZXcgTWF0cml4NCgpO1xuXHRcdFx0XHRtYXRyaXguZnJvbUFycmF5KCBub2RlRGVmLm1hdHJpeCApO1xuXHRcdFx0XHRub2RlLmFwcGx5TWF0cml4NCggbWF0cml4ICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYgKCBub2RlRGVmLnRyYW5zbGF0aW9uICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRub2RlLnBvc2l0aW9uLmZyb21BcnJheSggbm9kZURlZi50cmFuc2xhdGlvbiApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIG5vZGVEZWYucm90YXRpb24gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdG5vZGUucXVhdGVybmlvbi5mcm9tQXJyYXkoIG5vZGVEZWYucm90YXRpb24gKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBub2RlRGVmLnNjYWxlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRub2RlLnNjYWxlLmZyb21BcnJheSggbm9kZURlZi5zY2FsZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZXIuYXNzb2NpYXRpb25zLnNldCggbm9kZSwgeyB0eXBlOiAnbm9kZXMnLCBpbmRleDogbm9kZUluZGV4IH0gKTtcblxuXHRcdFx0cmV0dXJuIG5vZGU7XG5cblx0XHR9ICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTcGVjaWZpY2F0aW9uOiBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAjc2NlbmVzXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBzY2VuZUluZGV4XG5cdCAqIEByZXR1cm4ge1Byb21pc2U8R3JvdXA+fVxuXHQgKi9cblx0bG9hZFNjZW5lKCBzY2VuZUluZGV4ICkge1xuXG5cdFx0Y29uc3QganNvbiA9IHRoaXMuanNvbjtcblx0XHRjb25zdCBleHRlbnNpb25zID0gdGhpcy5leHRlbnNpb25zO1xuXHRcdGNvbnN0IHNjZW5lRGVmID0gdGhpcy5qc29uLnNjZW5lc1sgc2NlbmVJbmRleCBdO1xuXHRcdGNvbnN0IHBhcnNlciA9IHRoaXM7XG5cblx0XHQvLyBMb2FkZXIgcmV0dXJucyBHcm91cCwgbm90IFNjZW5lLlxuXHRcdC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9pc3N1ZXMvMTgzNDIjaXNzdWVjb21tZW50LTU3ODk4MTE3MlxuXHRcdGNvbnN0IHNjZW5lID0gbmV3IEdyb3VwKCk7XG5cdFx0aWYgKCBzY2VuZURlZi5uYW1lICkgc2NlbmUubmFtZSA9IHBhcnNlci5jcmVhdGVVbmlxdWVOYW1lKCBzY2VuZURlZi5uYW1lICk7XG5cblx0XHRhc3NpZ25FeHRyYXNUb1VzZXJEYXRhKCBzY2VuZSwgc2NlbmVEZWYgKTtcblxuXHRcdGlmICggc2NlbmVEZWYuZXh0ZW5zaW9ucyApIGFkZFVua25vd25FeHRlbnNpb25zVG9Vc2VyRGF0YSggZXh0ZW5zaW9ucywgc2NlbmUsIHNjZW5lRGVmICk7XG5cblx0XHRjb25zdCBub2RlSWRzID0gc2NlbmVEZWYubm9kZXMgfHwgW107XG5cblx0XHRjb25zdCBwZW5kaW5nID0gW107XG5cblx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gbm9kZUlkcy5sZW5ndGg7IGkgPCBpbDsgaSArKyApIHtcblxuXHRcdFx0cGVuZGluZy5wdXNoKCBidWlsZE5vZGVIaWVyYWNoeSggbm9kZUlkc1sgaSBdLCBzY2VuZSwganNvbiwgcGFyc2VyICkgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLmFsbCggcGVuZGluZyApLnRoZW4oIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0cmV0dXJuIHNjZW5lO1xuXG5cdFx0fSApO1xuXG5cdH1cblxufVxuXG5mdW5jdGlvbiBidWlsZE5vZGVIaWVyYWNoeSggbm9kZUlkLCBwYXJlbnRPYmplY3QsIGpzb24sIHBhcnNlciApIHtcblxuXHRjb25zdCBub2RlRGVmID0ganNvbi5ub2Rlc1sgbm9kZUlkIF07XG5cblx0cmV0dXJuIHBhcnNlci5nZXREZXBlbmRlbmN5KCAnbm9kZScsIG5vZGVJZCApLnRoZW4oIGZ1bmN0aW9uICggbm9kZSApIHtcblxuXHRcdGlmICggbm9kZURlZi5za2luID09PSB1bmRlZmluZWQgKSByZXR1cm4gbm9kZTtcblxuXHRcdC8vIGJ1aWxkIHNrZWxldG9uIGhlcmUgYXMgd2VsbFxuXG5cdFx0bGV0IHNraW5FbnRyeTtcblxuXHRcdHJldHVybiBwYXJzZXIuZ2V0RGVwZW5kZW5jeSggJ3NraW4nLCBub2RlRGVmLnNraW4gKS50aGVuKCBmdW5jdGlvbiAoIHNraW4gKSB7XG5cblx0XHRcdHNraW5FbnRyeSA9IHNraW47XG5cblx0XHRcdGNvbnN0IHBlbmRpbmdKb2ludHMgPSBbXTtcblxuXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IHNraW5FbnRyeS5qb2ludHMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0cGVuZGluZ0pvaW50cy5wdXNoKCBwYXJzZXIuZ2V0RGVwZW5kZW5jeSggJ25vZGUnLCBza2luRW50cnkuam9pbnRzWyBpIF0gKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBQcm9taXNlLmFsbCggcGVuZGluZ0pvaW50cyApO1xuXG5cdFx0fSApLnRoZW4oIGZ1bmN0aW9uICggam9pbnROb2RlcyApIHtcblxuXHRcdFx0bm9kZS50cmF2ZXJzZSggZnVuY3Rpb24gKCBtZXNoICkge1xuXG5cdFx0XHRcdGlmICggISBtZXNoLmlzTWVzaCApIHJldHVybjtcblxuXHRcdFx0XHRjb25zdCBib25lcyA9IFtdO1xuXHRcdFx0XHRjb25zdCBib25lSW52ZXJzZXMgPSBbXTtcblxuXHRcdFx0XHRmb3IgKCBsZXQgaiA9IDAsIGpsID0gam9pbnROb2Rlcy5sZW5ndGg7IGogPCBqbDsgaiArKyApIHtcblxuXHRcdFx0XHRcdGNvbnN0IGpvaW50Tm9kZSA9IGpvaW50Tm9kZXNbIGogXTtcblxuXHRcdFx0XHRcdGlmICggam9pbnROb2RlICkge1xuXG5cdFx0XHRcdFx0XHRib25lcy5wdXNoKCBqb2ludE5vZGUgKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgbWF0ID0gbmV3IE1hdHJpeDQoKTtcblxuXHRcdFx0XHRcdFx0aWYgKCBza2luRW50cnkuaW52ZXJzZUJpbmRNYXRyaWNlcyAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRcdG1hdC5mcm9tQXJyYXkoIHNraW5FbnRyeS5pbnZlcnNlQmluZE1hdHJpY2VzLmFycmF5LCBqICogMTYgKTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRib25lSW52ZXJzZXMucHVzaCggbWF0ICk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5HTFRGTG9hZGVyOiBKb2ludCBcIiVzXCIgY291bGQgbm90IGJlIGZvdW5kLicsIHNraW5FbnRyeS5qb2ludHNbIGogXSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtZXNoLmJpbmQoIG5ldyBTa2VsZXRvbiggYm9uZXMsIGJvbmVJbnZlcnNlcyApLCBtZXNoLm1hdHJpeFdvcmxkICk7XG5cblx0XHRcdH0gKTtcblxuXHRcdFx0cmV0dXJuIG5vZGU7XG5cblx0XHR9ICk7XG5cblx0fSApLnRoZW4oIGZ1bmN0aW9uICggbm9kZSApIHtcblxuXHRcdC8vIGJ1aWxkIG5vZGUgaGllcmFjaHlcblxuXHRcdHBhcmVudE9iamVjdC5hZGQoIG5vZGUgKTtcblxuXHRcdGNvbnN0IHBlbmRpbmcgPSBbXTtcblxuXHRcdGlmICggbm9kZURlZi5jaGlsZHJlbiApIHtcblxuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBub2RlRGVmLmNoaWxkcmVuO1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDAsIGlsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdFx0Y29uc3QgY2hpbGQgPSBjaGlsZHJlblsgaSBdO1xuXHRcdFx0XHRwZW5kaW5nLnB1c2goIGJ1aWxkTm9kZUhpZXJhY2h5KCBjaGlsZCwgbm9kZSwganNvbiwgcGFyc2VyICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKCBwZW5kaW5nICk7XG5cblx0fSApO1xuXG59XG5cbi8qKlxuICogQHBhcmFtIHtCdWZmZXJHZW9tZXRyeX0gZ2VvbWV0cnlcbiAqIEBwYXJhbSB7R0xURi5QcmltaXRpdmV9IHByaW1pdGl2ZURlZlxuICogQHBhcmFtIHtHTFRGUGFyc2VyfSBwYXJzZXJcbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUJvdW5kcyggZ2VvbWV0cnksIHByaW1pdGl2ZURlZiwgcGFyc2VyICkge1xuXG5cdGNvbnN0IGF0dHJpYnV0ZXMgPSBwcmltaXRpdmVEZWYuYXR0cmlidXRlcztcblxuXHRjb25zdCBib3ggPSBuZXcgQm94MygpO1xuXG5cdGlmICggYXR0cmlidXRlcy5QT1NJVElPTiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0Y29uc3QgYWNjZXNzb3IgPSBwYXJzZXIuanNvbi5hY2Nlc3NvcnNbIGF0dHJpYnV0ZXMuUE9TSVRJT04gXTtcblxuXHRcdGNvbnN0IG1pbiA9IGFjY2Vzc29yLm1pbjtcblx0XHRjb25zdCBtYXggPSBhY2Nlc3Nvci5tYXg7XG5cblx0XHQvLyBnbFRGIHJlcXVpcmVzICdtaW4nIGFuZCAnbWF4JywgYnV0IFZSTSAod2hpY2ggZXh0ZW5kcyBnbFRGKSBjdXJyZW50bHkgaWdub3JlcyB0aGF0IHJlcXVpcmVtZW50LlxuXG5cdFx0aWYgKCBtaW4gIT09IHVuZGVmaW5lZCAmJiBtYXggIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Ym94LnNldChcblx0XHRcdFx0bmV3IFZlY3RvcjMoIG1pblsgMCBdLCBtaW5bIDEgXSwgbWluWyAyIF0gKSxcblx0XHRcdFx0bmV3IFZlY3RvcjMoIG1heFsgMCBdLCBtYXhbIDEgXSwgbWF4WyAyIF0gKVxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKCBhY2Nlc3Nvci5ub3JtYWxpemVkICkge1xuXG5cdFx0XHRcdGNvbnN0IGJveFNjYWxlID0gZ2V0Tm9ybWFsaXplZENvbXBvbmVudFNjYWxlKCBXRUJHTF9DT01QT05FTlRfVFlQRVNbIGFjY2Vzc29yLmNvbXBvbmVudFR5cGUgXSApO1xuXHRcdFx0XHRib3gubWluLm11bHRpcGx5U2NhbGFyKCBib3hTY2FsZSApO1xuXHRcdFx0XHRib3gubWF4Lm11bHRpcGx5U2NhbGFyKCBib3hTY2FsZSApO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5HTFRGTG9hZGVyOiBNaXNzaW5nIG1pbi9tYXggcHJvcGVydGllcyBmb3IgYWNjZXNzb3IgUE9TSVRJT04uJyApO1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0fSBlbHNlIHtcblxuXHRcdHJldHVybjtcblxuXHR9XG5cblx0Y29uc3QgdGFyZ2V0cyA9IHByaW1pdGl2ZURlZi50YXJnZXRzO1xuXG5cdGlmICggdGFyZ2V0cyAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0Y29uc3QgbWF4RGlzcGxhY2VtZW50ID0gbmV3IFZlY3RvcjMoKTtcblx0XHRjb25zdCB2ZWN0b3IgPSBuZXcgVmVjdG9yMygpO1xuXG5cdFx0Zm9yICggbGV0IGkgPSAwLCBpbCA9IHRhcmdldHMubGVuZ3RoOyBpIDwgaWw7IGkgKysgKSB7XG5cblx0XHRcdGNvbnN0IHRhcmdldCA9IHRhcmdldHNbIGkgXTtcblxuXHRcdFx0aWYgKCB0YXJnZXQuUE9TSVRJT04gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRjb25zdCBhY2Nlc3NvciA9IHBhcnNlci5qc29uLmFjY2Vzc29yc1sgdGFyZ2V0LlBPU0lUSU9OIF07XG5cdFx0XHRcdGNvbnN0IG1pbiA9IGFjY2Vzc29yLm1pbjtcblx0XHRcdFx0Y29uc3QgbWF4ID0gYWNjZXNzb3IubWF4O1xuXG5cdFx0XHRcdC8vIGdsVEYgcmVxdWlyZXMgJ21pbicgYW5kICdtYXgnLCBidXQgVlJNICh3aGljaCBleHRlbmRzIGdsVEYpIGN1cnJlbnRseSBpZ25vcmVzIHRoYXQgcmVxdWlyZW1lbnQuXG5cblx0XHRcdFx0aWYgKCBtaW4gIT09IHVuZGVmaW5lZCAmJiBtYXggIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdC8vIHdlIG5lZWQgdG8gZ2V0IG1heCBvZiBhYnNvbHV0ZSBjb21wb25lbnRzIGJlY2F1c2UgdGFyZ2V0IHdlaWdodCBpcyBbLTEsMV1cblx0XHRcdFx0XHR2ZWN0b3Iuc2V0WCggTWF0aC5tYXgoIE1hdGguYWJzKCBtaW5bIDAgXSApLCBNYXRoLmFicyggbWF4WyAwIF0gKSApICk7XG5cdFx0XHRcdFx0dmVjdG9yLnNldFkoIE1hdGgubWF4KCBNYXRoLmFicyggbWluWyAxIF0gKSwgTWF0aC5hYnMoIG1heFsgMSBdICkgKSApO1xuXHRcdFx0XHRcdHZlY3Rvci5zZXRaKCBNYXRoLm1heCggTWF0aC5hYnMoIG1pblsgMiBdICksIE1hdGguYWJzKCBtYXhbIDIgXSApICkgKTtcblxuXG5cdFx0XHRcdFx0aWYgKCBhY2Nlc3Nvci5ub3JtYWxpemVkICkge1xuXG5cdFx0XHRcdFx0XHRjb25zdCBib3hTY2FsZSA9IGdldE5vcm1hbGl6ZWRDb21wb25lbnRTY2FsZSggV0VCR0xfQ09NUE9ORU5UX1RZUEVTWyBhY2Nlc3Nvci5jb21wb25lbnRUeXBlIF0gKTtcblx0XHRcdFx0XHRcdHZlY3Rvci5tdWx0aXBseVNjYWxhciggYm94U2NhbGUgKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIE5vdGU6IHRoaXMgYXNzdW1lcyB0aGF0IHRoZSBzdW0gb2YgYWxsIHdlaWdodHMgaXMgYXQgbW9zdCAxLiBUaGlzIGlzbid0IHF1aXRlIGNvcnJlY3QgLSBpdCdzIG1vcmUgY29uc2VydmF0aXZlXG5cdFx0XHRcdFx0Ly8gdG8gYXNzdW1lIHRoYXQgZWFjaCB0YXJnZXQgY2FuIGhhdmUgYSBtYXggd2VpZ2h0IG9mIDEuIEhvd2V2ZXIsIGZvciBzb21lIHVzZSBjYXNlcyAtIG5vdGFibHksIHdoZW4gbW9ycGggdGFyZ2V0c1xuXHRcdFx0XHRcdC8vIGFyZSB1c2VkIHRvIGltcGxlbWVudCBrZXktZnJhbWUgYW5pbWF0aW9ucyBhbmQgYXMgc3VjaCBvbmx5IHR3byBhcmUgYWN0aXZlIGF0IGEgdGltZSAtIHRoaXMgcmVzdWx0cyBpbiB2ZXJ5IGxhcmdlXG5cdFx0XHRcdFx0Ly8gYm94ZXMuIFNvIGZvciBub3cgd2UgbWFrZSBhIGJveCB0aGF0J3Mgc29tZXRpbWVzIGEgdG91Y2ggdG9vIHNtYWxsIGJ1dCBpcyBob3BlZnVsbHkgbW9zdGx5IG9mIHJlYXNvbmFibGUgc2l6ZS5cblx0XHRcdFx0XHRtYXhEaXNwbGFjZW1lbnQubWF4KCB2ZWN0b3IgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuR0xURkxvYWRlcjogTWlzc2luZyBtaW4vbWF4IHByb3BlcnRpZXMgZm9yIGFjY2Vzc29yIFBPU0lUSU9OLicgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdC8vIEFzIHBlciBjb21tZW50IGFib3ZlIHRoaXMgYm94IGlzbid0IGNvbnNlcnZhdGl2ZSwgYnV0IGhhcyBhIHJlYXNvbmFibGUgc2l6ZSBmb3IgYSB2ZXJ5IGxhcmdlIG51bWJlciBvZiBtb3JwaCB0YXJnZXRzLlxuXHRcdGJveC5leHBhbmRCeVZlY3RvciggbWF4RGlzcGxhY2VtZW50ICk7XG5cblx0fVxuXG5cdGdlb21ldHJ5LmJvdW5kaW5nQm94ID0gYm94O1xuXG5cdGNvbnN0IHNwaGVyZSA9IG5ldyBTcGhlcmUoKTtcblxuXHRib3guZ2V0Q2VudGVyKCBzcGhlcmUuY2VudGVyICk7XG5cdHNwaGVyZS5yYWRpdXMgPSBib3gubWluLmRpc3RhbmNlVG8oIGJveC5tYXggKSAvIDI7XG5cblx0Z2VvbWV0cnkuYm91bmRpbmdTcGhlcmUgPSBzcGhlcmU7XG5cbn1cblxuLyoqXG4gKiBAcGFyYW0ge0J1ZmZlckdlb21ldHJ5fSBnZW9tZXRyeVxuICogQHBhcmFtIHtHTFRGLlByaW1pdGl2ZX0gcHJpbWl0aXZlRGVmXG4gKiBAcGFyYW0ge0dMVEZQYXJzZXJ9IHBhcnNlclxuICogQHJldHVybiB7UHJvbWlzZTxCdWZmZXJHZW9tZXRyeT59XG4gKi9cbmZ1bmN0aW9uIGFkZFByaW1pdGl2ZUF0dHJpYnV0ZXMoIGdlb21ldHJ5LCBwcmltaXRpdmVEZWYsIHBhcnNlciApIHtcblxuXHRjb25zdCBhdHRyaWJ1dGVzID0gcHJpbWl0aXZlRGVmLmF0dHJpYnV0ZXM7XG5cblx0Y29uc3QgcGVuZGluZyA9IFtdO1xuXG5cdGZ1bmN0aW9uIGFzc2lnbkF0dHJpYnV0ZUFjY2Vzc29yKCBhY2Nlc3NvckluZGV4LCBhdHRyaWJ1dGVOYW1lICkge1xuXG5cdFx0cmV0dXJuIHBhcnNlci5nZXREZXBlbmRlbmN5KCAnYWNjZXNzb3InLCBhY2Nlc3NvckluZGV4IClcblx0XHRcdC50aGVuKCBmdW5jdGlvbiAoIGFjY2Vzc29yICkge1xuXG5cdFx0XHRcdGdlb21ldHJ5LnNldEF0dHJpYnV0ZSggYXR0cmlidXRlTmFtZSwgYWNjZXNzb3IgKTtcblxuXHRcdFx0fSApO1xuXG5cdH1cblxuXHRmb3IgKCBjb25zdCBnbHRmQXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzICkge1xuXG5cdFx0Y29uc3QgdGhyZWVBdHRyaWJ1dGVOYW1lID0gQVRUUklCVVRFU1sgZ2x0ZkF0dHJpYnV0ZU5hbWUgXSB8fCBnbHRmQXR0cmlidXRlTmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0Ly8gU2tpcCBhdHRyaWJ1dGVzIGFscmVhZHkgcHJvdmlkZWQgYnkgZS5nLiBEcmFjbyBleHRlbnNpb24uXG5cdFx0aWYgKCB0aHJlZUF0dHJpYnV0ZU5hbWUgaW4gZ2VvbWV0cnkuYXR0cmlidXRlcyApIGNvbnRpbnVlO1xuXG5cdFx0cGVuZGluZy5wdXNoKCBhc3NpZ25BdHRyaWJ1dGVBY2Nlc3NvciggYXR0cmlidXRlc1sgZ2x0ZkF0dHJpYnV0ZU5hbWUgXSwgdGhyZWVBdHRyaWJ1dGVOYW1lICkgKTtcblxuXHR9XG5cblx0aWYgKCBwcmltaXRpdmVEZWYuaW5kaWNlcyAhPT0gdW5kZWZpbmVkICYmICEgZ2VvbWV0cnkuaW5kZXggKSB7XG5cblx0XHRjb25zdCBhY2Nlc3NvciA9IHBhcnNlci5nZXREZXBlbmRlbmN5KCAnYWNjZXNzb3InLCBwcmltaXRpdmVEZWYuaW5kaWNlcyApLnRoZW4oIGZ1bmN0aW9uICggYWNjZXNzb3IgKSB7XG5cblx0XHRcdGdlb21ldHJ5LnNldEluZGV4KCBhY2Nlc3NvciApO1xuXG5cdFx0fSApO1xuXG5cdFx0cGVuZGluZy5wdXNoKCBhY2Nlc3NvciApO1xuXG5cdH1cblxuXHRhc3NpZ25FeHRyYXNUb1VzZXJEYXRhKCBnZW9tZXRyeSwgcHJpbWl0aXZlRGVmICk7XG5cblx0Y29tcHV0ZUJvdW5kcyggZ2VvbWV0cnksIHByaW1pdGl2ZURlZiwgcGFyc2VyICk7XG5cblx0cmV0dXJuIFByb21pc2UuYWxsKCBwZW5kaW5nICkudGhlbiggZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIHByaW1pdGl2ZURlZi50YXJnZXRzICE9PSB1bmRlZmluZWRcblx0XHRcdD8gYWRkTW9ycGhUYXJnZXRzKCBnZW9tZXRyeSwgcHJpbWl0aXZlRGVmLnRhcmdldHMsIHBhcnNlciApXG5cdFx0XHQ6IGdlb21ldHJ5O1xuXG5cdH0gKTtcblxufVxuXG4vKipcbiAqIEBwYXJhbSB7QnVmZmVyR2VvbWV0cnl9IGdlb21ldHJ5XG4gKiBAcGFyYW0ge051bWJlcn0gZHJhd01vZGVcbiAqIEByZXR1cm4ge0J1ZmZlckdlb21ldHJ5fVxuICovXG5mdW5jdGlvbiB0b1RyaWFuZ2xlc0RyYXdNb2RlKCBnZW9tZXRyeSwgZHJhd01vZGUgKSB7XG5cblx0bGV0IGluZGV4ID0gZ2VvbWV0cnkuZ2V0SW5kZXgoKTtcblxuXHQvLyBnZW5lcmF0ZSBpbmRleCBpZiBub3QgcHJlc2VudFxuXG5cdGlmICggaW5kZXggPT09IG51bGwgKSB7XG5cblx0XHRjb25zdCBpbmRpY2VzID0gW107XG5cblx0XHRjb25zdCBwb3NpdGlvbiA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSggJ3Bvc2l0aW9uJyApO1xuXG5cdFx0aWYgKCBwb3NpdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbi5jb3VudDsgaSArKyApIHtcblxuXHRcdFx0XHRpbmRpY2VzLnB1c2goIGkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRnZW9tZXRyeS5zZXRJbmRleCggaW5kaWNlcyApO1xuXHRcdFx0aW5kZXggPSBnZW9tZXRyeS5nZXRJbmRleCgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Y29uc29sZS5lcnJvciggJ1RIUkVFLkdMVEZMb2FkZXIudG9UcmlhbmdsZXNEcmF3TW9kZSgpOiBVbmRlZmluZWQgcG9zaXRpb24gYXR0cmlidXRlLiBQcm9jZXNzaW5nIG5vdCBwb3NzaWJsZS4nICk7XG5cdFx0XHRyZXR1cm4gZ2VvbWV0cnk7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8vXG5cblx0Y29uc3QgbnVtYmVyT2ZUcmlhbmdsZXMgPSBpbmRleC5jb3VudCAtIDI7XG5cdGNvbnN0IG5ld0luZGljZXMgPSBbXTtcblxuXHRpZiAoIGRyYXdNb2RlID09PSBUcmlhbmdsZUZhbkRyYXdNb2RlICkge1xuXG5cdFx0Ly8gZ2wuVFJJQU5HTEVfRkFOXG5cblx0XHRmb3IgKCBsZXQgaSA9IDE7IGkgPD0gbnVtYmVyT2ZUcmlhbmdsZXM7IGkgKysgKSB7XG5cblx0XHRcdG5ld0luZGljZXMucHVzaCggaW5kZXguZ2V0WCggMCApICk7XG5cdFx0XHRuZXdJbmRpY2VzLnB1c2goIGluZGV4LmdldFgoIGkgKSApO1xuXHRcdFx0bmV3SW5kaWNlcy5wdXNoKCBpbmRleC5nZXRYKCBpICsgMSApICk7XG5cblx0XHR9XG5cblx0fSBlbHNlIHtcblxuXHRcdC8vIGdsLlRSSUFOR0xFX1NUUklQXG5cblx0XHRmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZlRyaWFuZ2xlczsgaSArKyApIHtcblxuXHRcdFx0aWYgKCBpICUgMiA9PT0gMCApIHtcblxuXHRcdFx0XHRuZXdJbmRpY2VzLnB1c2goIGluZGV4LmdldFgoIGkgKSApO1xuXHRcdFx0XHRuZXdJbmRpY2VzLnB1c2goIGluZGV4LmdldFgoIGkgKyAxICkgKTtcblx0XHRcdFx0bmV3SW5kaWNlcy5wdXNoKCBpbmRleC5nZXRYKCBpICsgMiApICk7XG5cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRuZXdJbmRpY2VzLnB1c2goIGluZGV4LmdldFgoIGkgKyAyICkgKTtcblx0XHRcdFx0bmV3SW5kaWNlcy5wdXNoKCBpbmRleC5nZXRYKCBpICsgMSApICk7XG5cdFx0XHRcdG5ld0luZGljZXMucHVzaCggaW5kZXguZ2V0WCggaSApICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0aWYgKCAoIG5ld0luZGljZXMubGVuZ3RoIC8gMyApICE9PSBudW1iZXJPZlRyaWFuZ2xlcyApIHtcblxuXHRcdGNvbnNvbGUuZXJyb3IoICdUSFJFRS5HTFRGTG9hZGVyLnRvVHJpYW5nbGVzRHJhd01vZGUoKTogVW5hYmxlIHRvIGdlbmVyYXRlIGNvcnJlY3QgYW1vdW50IG9mIHRyaWFuZ2xlcy4nICk7XG5cblx0fVxuXG5cdC8vIGJ1aWxkIGZpbmFsIGdlb21ldHJ5XG5cblx0Y29uc3QgbmV3R2VvbWV0cnkgPSBnZW9tZXRyeS5jbG9uZSgpO1xuXHRuZXdHZW9tZXRyeS5zZXRJbmRleCggbmV3SW5kaWNlcyApO1xuXG5cdHJldHVybiBuZXdHZW9tZXRyeTtcblxufVxuXG5leHBvcnQgeyBHTFRGTG9hZGVyIH07XG4iXSwic291cmNlUm9vdCI6IiJ9