import * as three from 'three';
import { Color, Vector4, IUniform as IUniform$1, Texture, ShaderMaterial, Box3, Matrix4, Vector3, Sphere, Camera, WebGLRenderer, EventDispatcher, BufferGeometry, Points, Object3D, WebGLRenderTarget, Ray, RawShaderMaterial, Shader, Scene, Material, Quaternion, Euler, Group, Matrix3, Vector2, PerspectiveCamera, OrthographicCamera, LoadingManager, TextureLoader, SphereGeometry, CircleGeometry, Plane, Raycaster, Mesh, SpriteMaterial, Sprite, Line } from 'three';
import CamControls from 'camera-controls';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { Context } from 'vm';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

declare type IGradient = [number, Color][];
interface IClassification {
    [value: string]: Vector4;
    DEFAULT: Vector4;
}
interface IUniform<T> extends IUniform$1 {
    type: string;
    value: T;
}

interface IBlurMaterialUniforms {
    [name: string]: IUniform<any>;
    near: IUniform<number>;
    far: IUniform<number>;
    screenWidth: IUniform<number>;
    screenHeight: IUniform<number>;
    map: IUniform<Texture | null>;
}
declare class BlurMaterial extends ShaderMaterial {
    vertexShader: string;
    fragmentShader: string;
    uniforms: IBlurMaterialUniforms;
}

declare enum ClipMode {
    DISABLED = 0,
    CLIP_OUTSIDE = 1,
    HIGHLIGHT_INSIDE = 2
}
interface IClipBox {
    box: Box3;
    inverse: Matrix4;
    matrix: Matrix4;
    position: Vector3;
}

declare enum PointSizeType {
    FIXED = 0,
    ATTENUATED = 1,
    ADAPTIVE = 2
}
declare enum PointShape {
    SQUARE = 0,
    CIRCLE = 1,
    PARABOLOID = 2
}
declare enum TreeType {
    OCTREE = 0,
    KDTREE = 1
}
declare enum PointOpacityType {
    FIXED = 0,
    ATTENUATED = 1
}
declare enum PointColorType {
    RGB = 0,
    COLOR = 1,
    DEPTH = 2,
    HEIGHT = 3,
    ELEVATION = 3,
    INTENSITY = 4,
    INTENSITY_GRADIENT = 5,
    LOD = 6,
    LEVEL_OF_DETAIL = 6,
    POINT_INDEX = 7,
    CLASSIFICATION = 8,
    RETURN_NUMBER = 9,
    SOURCE = 10,
    NORMAL = 11,
    PHONG = 12,
    RGB_HEIGHT = 13,
    COMPOSITE = 50
}

declare type GetUrlFn = (url: string) => string | Promise<string>;
declare type XhrRequest = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

declare type Node = IPointCloudTreeNode;
declare class LRUItem {
    node: Node;
    next: LRUItem | null;
    previous: LRUItem | null;
    constructor(node: Node);
}
/**
 * A doubly-linked-list of the least recently used elements.
 */
declare class LRU {
    pointBudget: number;
    first: LRUItem | null;
    last: LRUItem | null;
    numPoints: number;
    private items;
    constructor(pointBudget?: number);
    get size(): number;
    has(node: Node): boolean;
    /**
     * Makes the specified the most recently used item. if the list does not contain node, it will
     * be added.
     */
    touch(node: Node): void;
    private addNew;
    private touchExisting;
    remove(node: Node): void;
    getLRUItem(): Node | undefined;
    freeMemory(): void;
    dispose(): void;
    disposeSubtree(node: Node): void;
}

interface IPointCloudTreeNode {
    id: number;
    name: string;
    level: number;
    index: number;
    spacing: number;
    boundingBox: Box3;
    boundingSphere: Sphere;
    loaded: boolean;
    numPoints: number;
    readonly children: ReadonlyArray<IPointCloudTreeNode | null>;
    readonly isLeafNode: boolean;
    dispose(): void;
    traverse(cb: (node: IPointCloudTreeNode) => void, includeSelf?: boolean): void;
}
interface IVisibilityUpdateResult {
    visibleNodes: IPointCloudTreeNode[];
    numVisiblePoints: number;
    /**
     * True when a node has been loaded but was not added to the scene yet.
     * Make sure to call updatePointClouds() again on the next frame.
     */
    exceededMaxLoadsToGPU: boolean;
    /**
     * True when at least one node in view has failed to load.
     */
    nodeLoadFailed: boolean;
    /**
     * Promises for loading nodes, will reject when loading fails.
     */
    nodeLoadPromises: Promise<void>[];
}
interface IPotree {
    pointBudget: number;
    maxNumNodesLoading: number;
    lru: LRU;
    loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: XhrRequest): Promise<PointCloudOctree>;
    updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): IVisibilityUpdateResult;
}
interface PickPoint {
    position?: Vector3;
    normal?: Vector3;
    datasetNormal?: Vector3;
    [property: string]: any;
}
interface PointCloudHit {
    pIndex: number;
    pcIndex: number;
}

/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */

interface NodeData {
    children: number;
    numPoints: number;
    name: string;
}
declare class PointCloudOctreeGeometryNode extends EventDispatcher implements IPointCloudTreeNode {
    private static idCount;
    id: number;
    name: string;
    pcoGeometry: PointCloudOctreeGeometry;
    index: number;
    level: number;
    spacing: number;
    hasChildren: boolean;
    readonly children: ReadonlyArray<PointCloudOctreeGeometryNode | null>;
    boundingBox: Box3;
    tightBoundingBox: Box3;
    boundingSphere: Sphere;
    mean: Vector3;
    numPoints: number;
    geometry: BufferGeometry;
    loaded: boolean;
    loading: boolean;
    failed: boolean;
    parent: PointCloudOctreeGeometryNode | null;
    oneTimeDisposeHandlers: (() => void)[];
    isLeafNode: boolean;
    xhrInit: RequestInit;
    readonly isTreeNode: boolean;
    readonly isGeometryNode: boolean;
    constructor(name: string, pcoGeometry: PointCloudOctreeGeometry, boundingBox: Box3, xhrInit?: RequestInit);
    dispose(): void;
    /**
     * Gets the url of the binary file for this node.
     */
    getUrl(): string;
    /**
     * Gets the url of the hierarchy file for this node.
     */
    getHierarchyUrl(): string;
    /**
     * Adds the specified node as a child of the current node.
     *
     * @param child
     *    The node which is to be added as a child.
     */
    addChild(child: PointCloudOctreeGeometryNode): void;
    /**
     * Calls the specified callback for the current node (if includeSelf is set to true) and all its
     * children.
     *
     * @param cb
     *    The function which is to be called for each node.
     */
    traverse(cb: (node: PointCloudOctreeGeometryNode) => void, includeSelf?: boolean): void;
    load(): Promise<void>;
    private canLoad;
    private loadPoints;
    private loadHierachyThenPoints;
    /**
     * Gets the url of the folder where the hierarchy is, relative to the octreeDir.
     */
    private getHierarchyBaseUrl;
    private loadHierarchy;
    private getNodeData;
    addNode({ name, numPoints, children }: NodeData, pco: PointCloudOctreeGeometry, nodes: Map<string, PointCloudOctreeGeometryNode>): void;
}

declare class Version {
    version: string;
    versionMajor: number;
    versionMinor: number;
    constructor(version: string);
    newerThan(version: string): boolean;
    equalOrHigher(version: string): boolean;
    upTo(version: string): boolean;
}

interface BinaryLoaderOptions {
    getUrl?: GetUrlFn;
    version: string;
    boundingBox: Box3;
    scale: number;
    xhrRequest: XhrRequest;
}
declare class BinaryLoader {
    version: Version;
    boundingBox: Box3;
    scale: number;
    getUrl: GetUrlFn;
    disposed: boolean;
    xhrRequest: XhrRequest;
    callbacks: ((node: PointCloudOctreeGeometryNode) => void)[];
    private workers;
    constructor({ getUrl, version, boundingBox, scale, xhrRequest, }: BinaryLoaderOptions);
    dispose(): void;
    load(node: PointCloudOctreeGeometryNode): Promise<void>;
    private getNodeUrl;
    private parse;
    private getWorker;
    private releaseWorker;
    private getTightBoundingBox;
    private addBufferAttributes;
    private addIndices;
    private addNormalAttribute;
    private isAttribute;
}

interface LASLoaderOptions {
    getUrl?: GetUrlFn;
    version: string;
    boundingBox: Box3;
    scale: number;
    xhrRequest: XhrRequest;
    xhrInit?: RequestInit;
}
declare class LASLoader {
    version: Version;
    boundingBox: Box3;
    scale: number;
    getUrl: GetUrlFn;
    disposed: boolean;
    xhrRequest: XhrRequest;
    xhrInit: RequestInit;
    callbacks: ((node: PointCloudOctreeGeometryNode) => void)[];
    private workers;
    constructor({ getUrl, version, boundingBox, scale, xhrRequest, xhrInit, }: LASLoaderOptions);
    dispose(): void;
    load(node: PointCloudOctreeGeometryNode): Promise<void>;
    private getNodeUrl;
    private parse;
    private getWorker;
    private releaseWorker;
}

declare enum PointAttributeName {
    POSITION_CARTESIAN = 0,
    COLOR_PACKED = 1,
    COLOR_FLOATS_1 = 2,
    COLOR_FLOATS_255 = 3,
    NORMAL_FLOATS = 4,
    FILLER = 5,
    INTENSITY = 6,
    CLASSIFICATION = 7,
    NORMAL_SPHEREMAPPED = 8,
    NORMAL_OCT16 = 9,
    NORMAL = 10
}
interface PointAttributeType {
    ordinal: number;
    size: number;
}
declare const POINT_ATTRIBUTE_TYPES: Record<string, PointAttributeType>;
interface IPointAttribute {
    name: PointAttributeName;
    type: PointAttributeType;
    numElements: number;
    byteSize: number;
}
interface IPointAttributes {
    attributes: IPointAttribute[];
    byteSize: number;
    size: number;
}
declare const POINT_ATTRIBUTES: {
    POSITION_CARTESIAN: IPointAttribute;
    RGBA_PACKED: IPointAttribute;
    COLOR_PACKED: IPointAttribute;
    RGB_PACKED: IPointAttribute;
    NORMAL_FLOATS: IPointAttribute;
    FILLER_1B: IPointAttribute;
    INTENSITY: IPointAttribute;
    CLASSIFICATION: IPointAttribute;
    NORMAL_SPHEREMAPPED: IPointAttribute;
    NORMAL_OCT16: IPointAttribute;
    NORMAL: IPointAttribute;
};
declare type PointAttributeStringName = keyof typeof POINT_ATTRIBUTES;
declare class PointAttributes implements IPointAttributes {
    attributes: IPointAttribute[];
    byteSize: number;
    size: number;
    constructor(pointAttributeNames?: PointAttributeStringName[]);
    add(pointAttribute: IPointAttribute): void;
    hasColors(): boolean;
    hasNormals(): boolean;
}

declare class PointCloudOctreeGeometry {
    loader: BinaryLoader | LASLoader;
    boundingBox: Box3;
    tightBoundingBox: Box3;
    offset: Vector3;
    xhrRequest: XhrRequest;
    xhrInit?: RequestInit | undefined;
    disposed: boolean;
    needsUpdate: boolean;
    root: PointCloudOctreeGeometryNode;
    octreeDir: string;
    hierarchyStepSize: number;
    nodes: Record<string, PointCloudOctreeGeometryNode>;
    numNodesLoading: number;
    maxNumNodesLoading: number;
    spacing: number;
    pointAttributes: PointAttributes;
    projection: any;
    url: string | null;
    constructor(loader: BinaryLoader | LASLoader, boundingBox: Box3, tightBoundingBox: Box3, offset: Vector3, xhrRequest: XhrRequest, xhrInit?: RequestInit | undefined);
    dispose(): void;
    addNodeLoadedCallback(callback: (node: PointCloudOctreeGeometryNode) => void): void;
    clearNodeLoadedCallbacks(): void;
}

declare class PointCloudOctreeNode extends EventDispatcher implements IPointCloudTreeNode {
    geometryNode: PointCloudOctreeGeometryNode;
    sceneNode: Points;
    pcIndex: number | undefined;
    boundingBoxNode: Object3D | null;
    readonly children: (IPointCloudTreeNode | null)[];
    readonly loaded = true;
    readonly isTreeNode: boolean;
    readonly isGeometryNode: boolean;
    constructor(geometryNode: PointCloudOctreeGeometryNode, sceneNode: Points);
    dispose(): void;
    disposeSceneNode(): void;
    traverse(cb: (node: IPointCloudTreeNode) => void, includeSelf?: boolean): void;
    get id(): number;
    get name(): string;
    get level(): number;
    get isLeafNode(): boolean;
    get numPoints(): number;
    get index(): number;
    get boundingSphere(): Sphere;
    get boundingBox(): Box3;
    get spacing(): number;
}

interface PickParams {
    pickWindowSize: number;
    pickOutsideClipRegion: boolean;
    /**
     * If provided, the picking will use this pixel position instead of the `Ray` passed to the `pick`
     * method.
     */
    pixelPosition: Vector3;
    /**
     * Function which gets called after a picking material has been created and setup and before the
     * point cloud is rendered into the picking render target. This gives applications a chance to
     * customize the renderTarget and the material.
     *
     * @param material
     *    The pick material.
     * @param renterTarget
     *    The render target used for picking.
     */
    onBeforePickRender: (material: PointCloudMaterial, renterTarget: WebGLRenderTarget) => void;
}

declare class PointCloudTree extends Object3D {
    root: IPointCloudTreeNode | null;
    geometry: BufferGeometry;
    initialized(): boolean;
}

declare class PointCloudOctree extends PointCloudTree {
    potree: IPotree;
    disposed: boolean;
    pcoGeometry: PointCloudOctreeGeometry;
    boundingBox: Box3;
    boundingSphere: Sphere;
    material: PointCloudMaterial;
    level: number;
    maxLevel: number;
    /**
     * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
     */
    minNodePixelSize: number;
    root: IPointCloudTreeNode | null;
    boundingBoxNodes: Object3D[];
    visibleNodes: PointCloudOctreeNode[];
    visibleGeometry: PointCloudOctreeGeometryNode[];
    numVisiblePoints: number;
    showBoundingBox: boolean;
    private visibleBounds;
    private picker;
    constructor(potree: IPotree, pcoGeometry: PointCloudOctreeGeometry, material?: PointCloudMaterial);
    private initMaterial;
    dispose(): void;
    get pointSizeType(): PointSizeType;
    set pointSizeType(value: PointSizeType);
    toTreeNode(geometryNode: PointCloudOctreeGeometryNode, parent?: PointCloudOctreeNode | null): PointCloudOctreeNode;
    updateVisibleBounds(): void;
    updateBoundingBoxes(): void;
    updateMatrixWorld(force: boolean): void;
    hideDescendants(object: Object3D): void;
    moveToOrigin(): void;
    moveToGroundPlane(): void;
    getBoundingBoxWorld(bbox?: Box3): Box3;
    getVisibleExtent(): Box3;
    pick(renderer: WebGLRenderer, camera: Camera, ray: Ray, params?: Partial<PickParams>): PickPoint | null;
    get progress(): number;
}

interface IPointCloudMaterialParameters {
    size: number;
    minSize: number;
    maxSize: number;
    treeType: TreeType;
}
interface IPointCloudMaterialUniforms {
    bbSize: IUniform<[number, number, number]>;
    blendDepthSupplement: IUniform<number>;
    blendHardness: IUniform<number>;
    classificationLUT: IUniform<Texture>;
    clipBoxCount: IUniform<number>;
    clipBoxes: IUniform<Float32Array>;
    depthMap: IUniform<Texture | null>;
    diffuse: IUniform<[number, number, number]>;
    fov: IUniform<number>;
    gradient: IUniform<Texture>;
    heightMax: IUniform<number>;
    heightMin: IUniform<number>;
    intensityBrightness: IUniform<number>;
    intensityContrast: IUniform<number>;
    intensityGamma: IUniform<number>;
    intensityRange: IUniform<[number, number]>;
    level: IUniform<number>;
    maxSize: IUniform<number>;
    minSize: IUniform<number>;
    octreeSize: IUniform<number>;
    opacity: IUniform<number>;
    pcIndex: IUniform<number>;
    rgbBrightness: IUniform<number>;
    rgbContrast: IUniform<number>;
    rgbGamma: IUniform<number>;
    screenHeight: IUniform<number>;
    screenWidth: IUniform<number>;
    size: IUniform<number>;
    spacing: IUniform<number>;
    toModel: IUniform<number[]>;
    transition: IUniform<number>;
    uColor: IUniform<Color>;
    visibleNodes: IUniform<Texture>;
    vnStart: IUniform<number>;
    wClassification: IUniform<number>;
    wElevation: IUniform<number>;
    wIntensity: IUniform<number>;
    wReturnNumber: IUniform<number>;
    wRGB: IUniform<number>;
    wSourceID: IUniform<number>;
    opacityAttenuation: IUniform<number>;
    filterByNormalThreshold: IUniform<number>;
    highlightedPointCoordinate: IUniform<Vector3>;
    highlightedPointColor: IUniform<Vector4>;
    enablePointHighlighting: IUniform<boolean>;
    highlightedPointScale: IUniform<number>;
    useUnscaledElevation: IUniform<boolean>;
    clipIntersection: IUniform<boolean>;
}
declare class PointCloudMaterial extends RawShaderMaterial {
    private static helperVec3;
    morphTargets: boolean;
    lights: boolean;
    fog: boolean;
    numClipBoxes: number;
    clipBoxes: IClipBox[];
    visibleNodesTexture: Texture | undefined;
    private cacheKeyIndex;
    private visibleNodeTextureOffsets;
    private _gradient;
    private gradientTexture;
    private _classification;
    private classificationTexture;
    uniforms: IPointCloudMaterialUniforms & Record<string, IUniform<any>>;
    bbSize: [number, number, number];
    depthMap: Texture | undefined;
    fov: number;
    heightMax: number;
    heightMin: number;
    intensityBrightness: number;
    intensityContrast: number;
    intensityGamma: number;
    intensityRange: [number, number];
    maxSize: number;
    minSize: number;
    octreeSize: number;
    opacity: number;
    rgbBrightness: number;
    rgbContrast: number;
    rgbGamma: number;
    screenHeight: number;
    screenWidth: number;
    size: number;
    spacing: number;
    transition: number;
    color: Color;
    weightClassification: number;
    weightElevation: number;
    weightIntensity: number;
    weightReturnNumber: number;
    weightRGB: number;
    weightSourceID: number;
    opacityAttenuation: number;
    filterByNormalThreshold: number;
    highlightedPointCoordinate: Vector3;
    highlightedPointColor: Vector4;
    enablePointHighlighting: boolean;
    highlightedPointScale: number;
    useUnscaledElevation: boolean;
    clipIntersection: boolean;
    useClipBox: boolean;
    weighted: boolean;
    pointColorType: PointColorType;
    pointSizeType: PointSizeType;
    clipMode: ClipMode;
    useEDL: boolean;
    shape: PointShape;
    treeType: TreeType;
    pointOpacityType: PointOpacityType;
    useFilterByNormal: boolean;
    highlightPoint: boolean;
    attributes: {
        position: {
            type: string;
            value: never[];
        };
        color: {
            type: string;
            value: never[];
        };
        normal: {
            type: string;
            value: never[];
        };
        intensity: {
            type: string;
            value: never[];
        };
        classification: {
            type: string;
            value: never[];
        };
        returnNumber: {
            type: string;
            value: never[];
        };
        numberOfReturns: {
            type: string;
            value: never[];
        };
        pointSourceID: {
            type: string;
            value: never[];
        };
        indices: {
            type: string;
            value: never[];
        };
    };
    constructor(parameters?: Partial<IPointCloudMaterialParameters>);
    dispose(): void;
    clearVisibleNodeTextureOffsets(): void;
    updateShaderSource(): void;
    applyDefines(shaderSrc: string): string;
    setClipBoxes(clipBoxes: IClipBox[]): void;
    get gradient(): IGradient;
    set gradient(value: IGradient);
    get classification(): IClassification;
    set classification(value: IClassification);
    private recomputeClassification;
    get elevationRange(): [number, number];
    set elevationRange(value: [number, number]);
    getUniform<K extends keyof IPointCloudMaterialUniforms>(name: K): IPointCloudMaterialUniforms[K]['value'];
    setUniform<K extends keyof IPointCloudMaterialUniforms>(name: K, value: IPointCloudMaterialUniforms[K]['value']): void;
    updateMaterial(octree: PointCloudOctree, visibleNodes: PointCloudOctreeNode[], camera: Camera, renderer: WebGLRenderer): void;
    private updateVisibilityTextureData;
    onBeforeCompile(shader: Shader, renderer: WebGLRenderer): void;
    customProgramCacheKey(): string;
    static makeOnBeforeRender(octree: PointCloudOctree, node: PointCloudOctreeNode, pcIndex?: number): (_renderer: WebGLRenderer, _scene: Scene, _camera: Camera, _geometry: BufferGeometry, material: Material) => void;
}

declare function generateDataTexture(width: number, height: number, color: Color): Texture;
declare function generateGradientTexture(gradient: IGradient): Texture;
declare function generateClassificationTexture(classification: IClassification): Texture;

declare const GRAYSCALE: IGradient;

declare const INFERNO: IGradient;

declare const PLASMA: IGradient;

declare const RAINBOW: IGradient;

declare const SPECTRAL: IGradient;

declare const VIRIDIS: IGradient;

declare const YELLOW_GREEN: IGradient;

declare class QueueItem {
    pointCloudIndex: number;
    weight: number;
    node: IPointCloudTreeNode;
    parent?: IPointCloudTreeNode | null | undefined;
    constructor(pointCloudIndex: number, weight: number, node: IPointCloudTreeNode, parent?: IPointCloudTreeNode | null | undefined);
}
declare class Potree implements IPotree {
    private static picker;
    private _pointBudget;
    private _rendererSize;
    maxNumNodesLoading: number;
    features: {
        SHADER_INTERPOLATION: boolean;
        SHADER_SPLATS: boolean;
        SHADER_EDL: boolean;
        precision: string;
    };
    lru: LRU;
    loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: (input: RequestInfo, init?: RequestInit) => Promise<Response>, xhrInit?: RequestInit): Promise<PointCloudOctree>;
    updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): IVisibilityUpdateResult;
    static pick(pointClouds: PointCloudOctree[], renderer: WebGLRenderer, camera: Camera, ray: Ray, params?: Partial<PickParams>): PickPoint | null;
    dispose(): void;
    get pointBudget(): number;
    set pointBudget(value: number);
    private updateVisibility;
    private updateTreeNodeVisibility;
    private updateChildVisibility;
    private updateBoundingBoxVisibility;
    private shouldClip;
    private updateVisibilityStructures;
}

type index_IBlurMaterialUniforms = IBlurMaterialUniforms;
type index_BlurMaterial = BlurMaterial;
declare const index_BlurMaterial: typeof BlurMaterial;
type index_ClipMode = ClipMode;
declare const index_ClipMode: typeof ClipMode;
type index_IClipBox = IClipBox;
type index_PointSizeType = PointSizeType;
declare const index_PointSizeType: typeof PointSizeType;
type index_PointShape = PointShape;
declare const index_PointShape: typeof PointShape;
type index_TreeType = TreeType;
declare const index_TreeType: typeof TreeType;
type index_PointOpacityType = PointOpacityType;
declare const index_PointOpacityType: typeof PointOpacityType;
type index_PointColorType = PointColorType;
declare const index_PointColorType: typeof PointColorType;
type index_IPointCloudMaterialParameters = IPointCloudMaterialParameters;
type index_IPointCloudMaterialUniforms = IPointCloudMaterialUniforms;
type index_PointCloudMaterial = PointCloudMaterial;
declare const index_PointCloudMaterial: typeof PointCloudMaterial;
declare const index_generateDataTexture: typeof generateDataTexture;
declare const index_generateGradientTexture: typeof generateGradientTexture;
declare const index_generateClassificationTexture: typeof generateClassificationTexture;
type index_IGradient = IGradient;
type index_IClassification = IClassification;
type index_IUniform<T> = IUniform<T>;
declare const index_GRAYSCALE: typeof GRAYSCALE;
declare const index_INFERNO: typeof INFERNO;
declare const index_PLASMA: typeof PLASMA;
declare const index_RAINBOW: typeof RAINBOW;
declare const index_SPECTRAL: typeof SPECTRAL;
declare const index_VIRIDIS: typeof VIRIDIS;
declare const index_YELLOW_GREEN: typeof YELLOW_GREEN;
type index_PointAttributeName = PointAttributeName;
declare const index_PointAttributeName: typeof PointAttributeName;
type index_PointAttributeType = PointAttributeType;
declare const index_POINT_ATTRIBUTE_TYPES: typeof POINT_ATTRIBUTE_TYPES;
type index_IPointAttribute = IPointAttribute;
type index_IPointAttributes = IPointAttributes;
declare const index_POINT_ATTRIBUTES: typeof POINT_ATTRIBUTES;
type index_PointAttributeStringName = PointAttributeStringName;
type index_PointAttributes = PointAttributes;
declare const index_PointAttributes: typeof PointAttributes;
type index_NodeData = NodeData;
type index_PointCloudOctreeGeometryNode = PointCloudOctreeGeometryNode;
declare const index_PointCloudOctreeGeometryNode: typeof PointCloudOctreeGeometryNode;
type index_PointCloudOctreeGeometry = PointCloudOctreeGeometry;
declare const index_PointCloudOctreeGeometry: typeof PointCloudOctreeGeometry;
type index_PointCloudOctreeNode = PointCloudOctreeNode;
declare const index_PointCloudOctreeNode: typeof PointCloudOctreeNode;
type index_PointCloudOctree = PointCloudOctree;
declare const index_PointCloudOctree: typeof PointCloudOctree;
type index_PointCloudTree = PointCloudTree;
declare const index_PointCloudTree: typeof PointCloudTree;
type index_QueueItem = QueueItem;
declare const index_QueueItem: typeof QueueItem;
type index_Potree = Potree;
declare const index_Potree: typeof Potree;
type index_IPointCloudTreeNode = IPointCloudTreeNode;
type index_IVisibilityUpdateResult = IVisibilityUpdateResult;
type index_IPotree = IPotree;
type index_PickPoint = PickPoint;
type index_PointCloudHit = PointCloudHit;
type index_Version = Version;
declare const index_Version: typeof Version;
declare namespace index {
  export {
    index_IBlurMaterialUniforms as IBlurMaterialUniforms,
    index_BlurMaterial as BlurMaterial,
    index_ClipMode as ClipMode,
    index_IClipBox as IClipBox,
    index_PointSizeType as PointSizeType,
    index_PointShape as PointShape,
    index_TreeType as TreeType,
    index_PointOpacityType as PointOpacityType,
    index_PointColorType as PointColorType,
    index_IPointCloudMaterialParameters as IPointCloudMaterialParameters,
    index_IPointCloudMaterialUniforms as IPointCloudMaterialUniforms,
    index_PointCloudMaterial as PointCloudMaterial,
    index_generateDataTexture as generateDataTexture,
    index_generateGradientTexture as generateGradientTexture,
    index_generateClassificationTexture as generateClassificationTexture,
    index_IGradient as IGradient,
    index_IClassification as IClassification,
    index_IUniform as IUniform,
    index_GRAYSCALE as GRAYSCALE,
    index_INFERNO as INFERNO,
    index_PLASMA as PLASMA,
    index_RAINBOW as RAINBOW,
    index_SPECTRAL as SPECTRAL,
    index_VIRIDIS as VIRIDIS,
    index_YELLOW_GREEN as YELLOW_GREEN,
    index_PointAttributeName as PointAttributeName,
    index_PointAttributeType as PointAttributeType,
    index_POINT_ATTRIBUTE_TYPES as POINT_ATTRIBUTE_TYPES,
    index_IPointAttribute as IPointAttribute,
    index_IPointAttributes as IPointAttributes,
    index_POINT_ATTRIBUTES as POINT_ATTRIBUTES,
    index_PointAttributeStringName as PointAttributeStringName,
    index_PointAttributes as PointAttributes,
    index_NodeData as NodeData,
    index_PointCloudOctreeGeometryNode as PointCloudOctreeGeometryNode,
    index_PointCloudOctreeGeometry as PointCloudOctreeGeometry,
    index_PointCloudOctreeNode as PointCloudOctreeNode,
    index_PointCloudOctree as PointCloudOctree,
    index_PointCloudTree as PointCloudTree,
    index_QueueItem as QueueItem,
    index_Potree as Potree,
    index_IPointCloudTreeNode as IPointCloudTreeNode,
    index_IVisibilityUpdateResult as IVisibilityUpdateResult,
    index_IPotree as IPotree,
    index_PickPoint as PickPoint,
    index_PointCloudHit as PointCloudHit,
    index_Version as Version,
  };
}

interface ReferenceFrameOpts {
    domEl?: HTMLElement;
}
/** ReferenceFrame handles global origin and related transformations */
declare class ReferenceFrame {
    private _isSet;
    private _upAxis;
    private mRotation;
    private mScale;
    private mPosition;
    private mPreComputed;
    private mNeedsUpdate;
    private proj4?;
    private events;
    private domEl?;
    constructor(opts?: ReferenceFrameOpts);
    computeBoundingBox(box: Box3): Box3;
    computeUntranslatedBoundingBox(box: Box3): Box3;
    decomposeMatrix(m: Matrix4): {
        position: Vector3;
        quaternion: Quaternion;
        rotation: Euler;
        scale: Vector3;
    };
    getSceneGroup(objects: PointCloudOctree[]): Group;
    getTransformationMatrix(forceUpdate?: boolean, useScale?: boolean): Matrix4;
    isSet(): boolean;
    toGeo(data: Vector3 | Object3D | {
        x: number;
        y: number;
        z: number;
    }, opts?: {
        forceMatrixUpdate?: boolean;
        useScale?: boolean;
    }): Vector3;
    toScene(data: Vector3 | Object3D | {
        x: number;
        y: number;
        z: number;
    }, opts?: {
        forceMatrixUpdate?: boolean;
        useScale?: boolean;
    }): Vector3;
    toSceneZ(val: number, opts?: {
        forceMatrixUpdate?: boolean;
        useScale?: boolean;
    }): number;
    set upAxis(axis: string);
    get upAxis(): string;
    setPosition(position: Vector3, negate?: boolean): void;
    set position(vec: Vector3);
    get position(): Vector3;
    setScale(s: Vector3): void;
    set scale(s: Vector3);
    getScale(): Vector3;
    getScaleMatrix3(): Matrix3;
    setProj4(proj4: string): void;
    getProj4(): string | undefined;
    proj4IsSet(): boolean;
    private _normalize;
}

declare const enum PointsceneEvents {
    ControlModeChanged = "pointscene_control_mode_change",
    ControlsUICreated = "pointscene_controls_ui_created",
    DepthEnabled = "pointscene_depth_enabled",
    DisableControls = "pointscene_disable_controls",
    EnableControls = "pointscene_enable_controls",
    EnterSphereMode = "pointscene_enter_sphere_mode",
    ExitSphereMode = "pointscene_exit_sphere_mode",
    LayerUICreated = "pointscene_layer_ui_created",
    MeasureUICreated = "pointscene_measure_ui_created",
    PointcloudUICreated = "pointscene_pointcloud_ui_created",
    RegisterControls = "pointscene_register_controls",
    RegisterLayers = "pointscene_register_layers",
    RegisterPicker = "pointscene_register_picker",
    RegisterPointclouds = "pointscene_register_pointclouds",
    RegisterUpdateHook = "pointscene_register_update_hook",
    ReferenceFrameIsSet = "pointscene_reference_frame_set",
    SetPhotoBackgroundMode = "pointscene_set_photo_background_mode",
    SetPhotoPeekMode = "pointscene_set_photo_peek_mode",
    UpdateOrbitPoint = "pointscene_update_orbit_point",
    UpdateQueryParam = "pointscene_update_query_param",
    QueryParamUpdated = "pointscene_query_param_updated",
    FitTopView = "pointscene_fit_top_view",
    LayerVisibilityChanged = "pointscene_layer_visibility_changed",
    LeftClick = "pointscene_on_leftclick",
    MouseMove = "pointscene_on_mousemove"
}
/** Handles event dispatching to user DOM */
declare class Events {
    private debug;
    dispatch(eventName: string, eventParams?: object, scope?: HTMLElement): void;
}

/**
 * In-place quicksort for typed arrays (e.g. for Float32Array)
 * provides fast sorting
 * useful e.g. for a custom shader and/or BufferGeometry
 *
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 *
 * Complexity: http://bigocheatsheet.com/ see Quicksort
 *
 * Example:
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * eleSize: 3 //because of (x, y, z)
 * orderElement: 0 //order according to x
 */
/**
 * k-d Tree for typed arrays (e.g. for Float32Array), in-place
 * provides fast nearest neighbour search
 * useful e.g. for a custom shader and/or BufferGeometry, saves tons of memory
 * has no insert and remove, only buildup and neares neighbour search
 *
 * Based on https://github.com/ubilabs/kd-tree-javascript by Ubilabs
 *
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 *
 * Requires typed array quicksort
 *
 * Example:
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * metric: function(a, b){	return Math.pow(a[0] - b[0], 2) +  Math.pow(a[1] - b[1], 2) +  Math.pow(a[2] - b[2], 2); }  //Manhatten distance
 * eleSize: 3 //because of (x, y, z)
 *
 * Further information (including mathematical properties)
 * http://en.wikipedia.org/wiki/Binary_tree
 * http://en.wikipedia.org/wiki/K-d_tree
 *
 * If you want to further minimize memory usage, remove Node.depth and replace
 * in search algorithm with a traversal to root node (see comments at THREE.TypedArrayUtils.Kdtree.prototype.Node)
 */
declare class KdTree {
    root: any;
    metric: any;
    maxDepth: number;
    eleSize: number;
    constructor(points: Float64Array, metric: any, eleSize: number);
    getMaxDepth(): number;
    nearest(point: number[], maxNodes: number, maxDistance: number): any;
}

interface IPhotos {
    scene: Scene;
    sceneLabels: Scene;
    domEl: HTMLElement;
    mouse: Vector2;
    camera: PerspectiveCamera | OrthographicCamera;
    referenceFrame: ReferenceFrame;
    disablePhotoNavigation?: boolean;
}
declare type PhotoUrlCallback = (photo: Photo) => Promise<string>;
interface PhotoOpts {
    getUrl: PhotoUrlCallback;
    getDepthUrl: PhotoUrlCallback;
    disablePhotoNavigation?: boolean;
    targetProj4?: string;
    navigationFootprintOffsetZ?: number;
}
interface Photo {
    url?: string;
    depthUrl?: string;
    quaternion?: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    euler?: {
        x: number;
        y: number;
        z: number;
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    proj4?: string;
}
/** Base class for Photos */
declare class Photos {
    protected scene: Scene;
    protected sceneLabels: Scene;
    protected domEl: HTMLElement;
    protected mouse: Vector2;
    protected camera: PerspectiveCamera | OrthographicCamera;
    protected referenceFrame: ReferenceFrame;
    protected screenWidth: number;
    protected screenHeight: number;
    protected group: Group;
    protected toolActive: boolean;
    protected manager: LoadingManager;
    protected loader: TextureLoader;
    protected events: Events;
    protected color: number;
    protected hoverColor: number;
    protected activeColor: number;
    protected type: string;
    protected eps: number;
    protected activeOpacity: number;
    protected peekMplier: number;
    protected peekRadius: number;
    protected monoColor: number;
    protected activeMaterialNeedsUpdate: boolean;
    protected nNearest: number;
    protected maxDistance: number;
    protected nearestObjects: any;
    protected sphereGeometry: SphereGeometry | undefined;
    protected atmosphereGeometry: SphereGeometry | undefined;
    protected ringGeometry: CircleGeometry | undefined;
    protected activeTexture: Texture | undefined;
    protected activeDepthTexture: Texture | undefined;
    protected activeDepthData: ImageData | undefined;
    protected activeObject: Object3D | undefined;
    protected targetObject: Object3D | undefined;
    protected hoveredObject: Object3D | undefined;
    protected isActive: boolean | undefined;
    protected kdtree: KdTree | undefined;
    protected depthScale: number;
    protected disablePhotoNavigation: boolean;
    protected opacityLow: number;
    protected opacityHigh: number;
    constructor(props: IPhotos);
    dispose(): void;
    /**
     * Update active material and mouse position
     */
    update(): void;
    private setAllPickable;
    protected getGeometries(): {
        sphere: SphereGeometry;
        atmosphere: SphereGeometry;
    };
    protected getRingGeometry(): CircleGeometry;
    protected getActiveMaterial(): ShaderMaterial;
    private getMaterials;
    private setPeekMode;
    private handleResize;
    private handleClearHoveredObjects;
    private handleSetPhotoPeekMode;
    private handleLeftClick;
    private handleRightClick;
    private handleEnterSphereMode;
    private handleExitSphereMode;
    /**
     * Add binds
     */
    private addPhotosBinds;
    private addPhotosListeners;
    /**
     * Remove photo listeners
     */
    protected removePhotosListeners(): void;
    /**
     * Add binds
     */
    protected binds(): void;
    protected addListeners(): void;
    /**
     * Remove listeners
     */
    protected removeListeners(): void;
    private addObjectListeners;
    protected load(params: any): void;
    protected add(photo: Photo, params: any): void;
    protected getObjectAtIndex(idx: number): Object3D<three.Event>;
    protected index(): void;
    openNearest(position: Vector3, look?: Vector3): void;
    protected getNearest(position: Vector3, params?: any): {
        d: any;
        idx: number;
    }[] | undefined;
}

interface PickerOpts {
    mouse: Vector2;
    domEl: HTMLElement;
    camera: PerspectiveCamera | OrthographicCamera;
    scenePickable: Scene;
    scenePointcloud: Scene;
    sceneStatic: Scene;
    modules: Modules;
}
interface PickResult {
    point: Vector3;
    pointOnLine?: Vector3;
    faceIndex?: number;
    distance: number;
    normal?: Vector3 | null;
    object: Object3D;
    plane?: Plane;
    objectType: 'pointcloud' | 'mesh' | 'depth' | 'plane';
}
declare class Picker {
    domEl: HTMLElement;
    hoveredObject?: Object3D;
    lastIntersection?: PickResult;
    private raycaster;
    mouse: Vector2;
    camera: PerspectiveCamera | OrthographicCamera;
    scenePickable: Scene;
    sceneStatic: Scene;
    scenePointcloud: Scene;
    modules: Modules;
    pickPointclouds: boolean;
    pickModels: boolean;
    pickDepth: boolean;
    pickInteractive: boolean;
    constructor(opts: PickerOpts);
    private getFaceNormal;
    pick(normalizedPosition?: Vector2, multiple?: boolean): PickResult | PickResult[] | null;
    intersectPlane(plane: Plane): PickResult | null;
    intersectObject(object: Object3D): PickResult | null;
}

interface IPhotoSpheres extends IPhotos {
    navigationFootprintOffsetZ?: number;
}
/** PhotoSphere class extends Photos */
declare class PhotoSpheres extends Photos {
    private ringOffset;
    private getUrlCallback?;
    private getDepthCallback?;
    constructor(props: IPhotoSpheres);
    pick(raycaster: Raycaster): PickResult | null;
    hasDepthData(): boolean;
    private createActiveSphere;
    private getDepthMetricValue;
    private normalizePixel;
    private getDepthPixelValue;
    load(photos: Photo[], opts?: PhotoOpts): Promise<Group>;
    private setBackgroundMode;
    private handleSetSphereBackgroundMode;
    /**
     * Add binds
     */
    protected binds(): void;
    protected addListeners(): void;
    /**
     * Remove listeners
     */
    protected removeListeners(): void;
}

interface IPickPointCloud {
    screenPos?: Vector2 | {
        x: number;
        y: number;
    };
    renderer?: WebGLRenderer;
    pickClipped?: boolean;
    camera?: PerspectiveCamera;
    pointclouds?: PointCloudOctree[];
    pickWindowSize?: number;
    raycaster?: Raycaster;
}
interface IPointClouds {
    scene?: Scene;
    camera?: PerspectiveCamera | OrthographicCamera;
    renderer?: WebGLRenderer;
    domEl?: HTMLElement;
    referenceFrame?: ReferenceFrame;
    referenceFramePosition?: Vector3;
}
/** Class for PointClouds */
declare class PointClouds {
    private scene;
    private camera;
    private renderer;
    private domEl;
    private referenceFrame;
    pointclouds: PointCloudOctree[];
    private pointBudgetLow;
    private pointBudgetMed;
    private pointBudgetHigh;
    private events;
    private potree;
    private useEDL;
    private edlRenderer;
    constructor(props?: IPointClouds);
    private initGLExtensions;
    dispose(): void;
    pick(opts: IPickPointCloud): PickResult | null;
    getBoundingBox(pointclouds?: PointCloudOctree[]): Box3;
    getHeightRange(): number[];
    setReferenceFrame(rf: ReferenceFrame): void;
    /**
     * Fit height range to point clouds bounding box
     */
    fitHeightRange(): void;
    /**
     * Fit intensity range for point clouds
     */
    fitIntensityRange(): boolean;
    private setDefaults;
    private load;
    addPointcloud(url: string): Promise<PointCloudOctree[]>;
    getObjectByName(name: string): PointCloudOctree | undefined;
    loadInternal(url: string | string[], opts?: {
        queryString?: string;
        xhrInit?: RequestInit;
    }): Promise<PointCloudOctree[]>;
    private addToReferenceFrame;
    /**
     * Render point clouds depending on active shaders
     */
    render(renderer?: WebGLRenderer, scene?: Scene, camera?: PerspectiveCamera | OrthographicCamera): void;
    /**
     * Update point clouds
     */
    update(pointclouds?: PointCloudOctree[], renderer?: WebGLRenderer, camera?: PerspectiveCamera): void;
    /**
     * Set clip boxes
     */
    setClipBoxes(clipBoxes: IClipBox[]): void;
    setEDLEnabled(value: boolean): void;
    isEDLEnabled(): boolean;
    setOpacity(value: number): void;
    setPointBudget(value: string): void;
    translatePosition(vector: Vector3): void;
    setColorType(value: number): void;
    setMaterialWeights(weights: {
        rgb?: number;
        int?: number;
        z?: number;
        cls?: number;
    }): void;
    setColorWeight(value: number): void;
    setElevationWeight(value: number): void;
    setIntensityWeight(value: number): void;
    setClassificationWeight(value: number): void;
    setClassVisibility(key: number | string, value: boolean): void;
    setClipMode(value: number): void;
    setPointShape(value: string | number): void;
    getPointsize(): number;
    setPointSize(value: number): void;
    setPointSizeType(value: string | number): void;
    setHeightRange(range: number[]): void;
    setUseUnscaledElevation(value: boolean): void;
    setIntensityRange(range: [number, number]): void;
    setVisibility(value: boolean): void;
    resize(renderer?: WebGLRenderer, camera?: PerspectiveCamera | OrthographicCamera, domEl?: HTMLElement): void;
    removeByName(name: string): void;
    remove(idx: number): void;
    handleWindowResize(): void;
    handleLoadPointcloud(event: Event): void;
    handleSetClipBoxes(event: Event): void;
    handleSetClipMode(event: Event): void;
    handleSetLOD(event: Event): void;
    handleSetMaterialWeights(event: Event): void;
    handleSetClassVisibility(event: Event): void;
    handleUpdateClassRange(event: Event): void;
    handleSetPointShape(event: Event): void;
    handleSetPointSize(event: Event): void;
    handleSetPointSizeType(event: Event): void;
    handleSetHeightRange(event: Event): void;
    handleSetIntensityRange(event: Event): void;
    handleSetEDL(event: Event): void;
    handleSetVisibility(event: Event): void;
    /**
     * Add binds
     */
    binds(): void;
    addListeners(domEl?: HTMLElement): void;
    /**
     * Remove listeners
     */
    removeListeners(domEl?: HTMLElement): void;
}

interface Coords {
    x: number;
    y: number;
    z: number;
}
interface TmsProviderOpts {
    scene: Scene;
    referenceFrame: ReferenceFrame;
}
interface InitTmsProviderOpts {
    proj4?: string;
    gridCenter: Coords;
    gridSize?: {
        x: number;
        y: number;
    };
    minZoom?: number;
    maxZoom?: number;
}
interface AddTmsLayerOpts {
    bounds?: number[][];
    isTms?: boolean;
}
declare class TmsProvider {
    private earthRadius;
    private earthCircumference;
    private tileSize;
    private gridSize;
    private gridCenter;
    private minZoom;
    private maxZoom;
    private proj4;
    private wgs84;
    private tiles;
    private cache;
    private cacheSize;
    private referenceFrame;
    private layers;
    private scene;
    private group;
    private updateCounter;
    private updateInProgress;
    private lastCameraPosition;
    private pickPlane;
    private maxRecursionDepth;
    private firstUpdate;
    constructor(opts: TmsProviderOpts);
    init(opts: InitTmsProviderOpts): Promise<void>;
    isVisible(url: string): boolean;
    setVisibility(url: string, value: boolean): void;
    hasVisibleLayers(): boolean;
    setOffset(offset: Vector3): void;
    addLayer(url: string, opts: AddTmsLayerOpts): void;
    removeLayer(url: string): void;
    setLayerIndex(url: string, toIdx: number): void;
    private updateMeshTexture;
    refresh(keys?: string[]): Promise<void>;
    private getFromCache;
    private putToCache;
    private purgeCache;
    private removeTile;
    private getParentCoords;
    private hasChildren;
    private getChildCoords;
    private replaceWithChildren;
    private getSiblings;
    private recursiveMerge;
    private recursiveSplit;
    update(delta: number, camera: PerspectiveCamera | OrthographicCamera): Promise<void>;
    private cleanParentTiles;
    createBaseGrid(): Promise<void>;
    private createTiles;
    private bboxInFrustum;
    private tileDistanceSquared;
    private createTileMesh;
    private loadImage;
    private isTileInsideBounds;
    private getTexture;
    dispose(): void;
    private tileCoordsToKey;
    private keyToTileCoords;
    private zoom;
    private coordToTile;
    private tileToLng;
    private tileToLat;
    private tileToBounds;
}

declare type Xyz = {
    x: number;
    y: number;
    z: number;
};
declare type Xyzw = {
    x: number;
    y: number;
    z: number;
    w: number;
};
declare type QueryParamTypes = 'float' | 'float[]' | 'xyz[]' | 'xyzw[]' | 'string' | 'int' | 'int[]';
declare class QueryParams {
    queryParams: {
        [key: string]: string;
    };
    disabled: boolean;
    private domEl;
    private events;
    constructor(domEl: HTMLElement);
    update(): void;
    dispose(): void;
    isSet(param: string): boolean;
    private parse;
    set(param: string, value: number | number[] | string | Xyz | Xyzw, paramType: QueryParamTypes): void;
    remove(param: string): void;
    get(param: string, paramType: QueryParamTypes): number | number[] | string | undefined | Xyz | Xyzw;
    private getQueryParam;
    private handleQueryParamUpdate;
    private handleEnterSphere;
    private handleExitSphere;
}

interface IModules {
    scene: Scene;
    camera: PerspectiveCamera | OrthographicCamera;
    renderer: WebGLRenderer;
    domEl: HTMLElement;
    queryParams: QueryParams | undefined;
    referenceFrame?: ReferenceFrame;
}
/** Modules class handles creating and updating all the modules */
declare class Modules {
    scene: Scene;
    private camera;
    private renderer;
    private domEl;
    private tmsProvider?;
    private queryParams;
    sceneStatic: Scene;
    scenePointCloud: Scene;
    scenePickable: Scene;
    sceneLabels: Scene;
    referenceFrame: ReferenceFrame;
    pointclouds: PointClouds | undefined;
    photoSpheres: PhotoSpheres | undefined;
    picker: Picker;
    private events;
    mouse: Vector2;
    private raycastActive;
    private raycaster;
    private raycastDelta;
    private dragActive;
    private mouseDownActive;
    private touchDownActive;
    private mouseDownRightStarted;
    private mouseDownLeftStarted;
    private freezeRenderAndUpdate;
    private disposeCount;
    private hoveredElement;
    private disableRaycast;
    private updateHooks;
    private orbitPoint;
    private fog;
    constructor(opts: IModules);
    setupLights(scene: Scene, intensity?: number): void;
    /**
     * Main render function
     */
    render(splitViews: SplitView[]): void;
    /**
     * Raycast to scenePickable
     */
    private raycast;
    private disposeMaterial;
    private recursiveRemove;
    disposeScene(node: any): void;
    dispose(): void;
    private handleRegisterUpdateHook;
    private registerUpdateHook;
    update(delta: number): void;
    loadPhotoSpheres(photos: Photo[], opts?: PhotoOpts): Promise<Group>;
    addPointcloud(url: string): Promise<PointCloudOctree[]>;
    createPointcloudModule(): void;
    loadPointcloud(url: string, opts?: {
        queryString?: string;
        xhrInit?: RequestInit;
        projIn?: string;
        projOut?: string;
    }): Promise<PointCloudOctree[]>;
    initTMSProvider(gridCenter: Coords, opts: {
        proj4?: string;
    }): Promise<TmsProvider>;
    private updateMouseFromTouch;
    private handleMouseMove;
    private handleTouchMove;
    private handleTouchStart;
    private handleTouchEnd;
    private isHoveredInteractive;
    private hoveredAllowsOrbitUpdate;
    private hoveredHasMetaData;
    private handleMouseDown;
    private handleMouseUp;
    /**
     * Add binds
     */
    private binds;
    private addListeners;
    removeListeners(): void;
}

interface Layer {
    id: string;
    name: string;
    type: 'pointcloud' | 'mesh' | '360' | 'tms';
    object?: Mesh | PointCloudOctree | Group;
    provider?: TmsProvider;
}
declare class Layers {
    private data;
    private order;
    private onUpdateFn;
    private onVisibilityUpdateFn;
    private events;
    private domEl;
    constructor(domEl: HTMLElement);
    add(layer: Layer): void;
    get(id: string): Layer;
    dispose(): void;
    getAll(): Layer[];
    exists(id: string): boolean;
    remove(layer: Layer): void;
    registerOnUpdateCallback(fn: () => void): void;
    registerOnVisibilityUpdateCallback(fn: () => void): void;
    private triggerUpdate;
    private triggerVisibilityUpdate;
    count(): number;
    isVisible(id: string): boolean;
    setVisibility(id: string, value: boolean): void;
    toggleVisibility(id: string): void;
}

interface LoadMeshOpts {
    isPickable?: boolean;
    isInteractive?: boolean;
    useBVH?: boolean;
    verticeOffset?: number[];
}
declare function loadLine(vertices: number[][], color: Color): Line2;
declare function loadMesh(vertices: number[][], faces: number[][], color?: Color, colors?: number[][], material?: Material, opts?: LoadMeshOpts): Mesh;

interface IfcLoadOpts {
    wasmPath?: string;
    workerPath?: string;
    offset?: {
        x: number;
        y: number;
        z: number;
    };
    projIn?: string;
    projOut?: string;
    isPickable?: boolean;
    isInteractive?: boolean;
}
declare function loadIFC(url: string, opts: IfcLoadOpts): Promise<Object3D>;

interface Vec3 {
    x: number;
    y: number;
    z: number;
}
interface Breakline {
    properties: BreaklineProperties;
    coordinates: number[][];
}
interface BreaklineProperties {
    [key: string]: string;
}
interface SurfaceTinProperties {
    [key: string]: string;
}
interface SurfaceTin {
    properties: SurfaceTinProperties;
    vertices: number[][];
    faces: number[][];
}
interface LandXMLProperties {
    tin?: SurfaceTin;
    lines?: Breakline[];
}
interface LandXMLLoadOpts {
    offset?: number[];
    projIn?: string;
    projOut?: string;
}
declare const stringToHex: (str: string) => Color;
declare function loadLandXML(url: string, opts: LandXMLLoadOpts): Promise<Group | undefined>;

declare function loadDXF(url: string): Promise<void>;

type Loaders_LoadMeshOpts = LoadMeshOpts;
declare const Loaders_loadLine: typeof loadLine;
declare const Loaders_loadMesh: typeof loadMesh;
type Loaders_IfcLoadOpts = IfcLoadOpts;
declare const Loaders_loadIFC: typeof loadIFC;
type Loaders_Vec3 = Vec3;
type Loaders_Breakline = Breakline;
type Loaders_BreaklineProperties = BreaklineProperties;
type Loaders_SurfaceTinProperties = SurfaceTinProperties;
type Loaders_SurfaceTin = SurfaceTin;
type Loaders_LandXMLProperties = LandXMLProperties;
type Loaders_LandXMLLoadOpts = LandXMLLoadOpts;
declare const Loaders_stringToHex: typeof stringToHex;
declare const Loaders_loadLandXML: typeof loadLandXML;
declare const Loaders_loadDXF: typeof loadDXF;
declare namespace Loaders {
  export {
    Loaders_LoadMeshOpts as LoadMeshOpts,
    Loaders_loadLine as loadLine,
    Loaders_loadMesh as loadMesh,
    Loaders_IfcLoadOpts as IfcLoadOpts,
    Loaders_loadIFC as loadIFC,
    Loaders_Vec3 as Vec3,
    Loaders_Breakline as Breakline,
    Loaders_BreaklineProperties as BreaklineProperties,
    Loaders_SurfaceTinProperties as SurfaceTinProperties,
    Loaders_SurfaceTin as SurfaceTin,
    Loaders_LandXMLProperties as LandXMLProperties,
    Loaders_LandXMLLoadOpts as LandXMLLoadOpts,
    Loaders_stringToHex as stringToHex,
    Loaders_loadLandXML as loadLandXML,
    Loaders_loadDXF as loadDXF,
  };
}

declare const fitElevationRange: (minZ: number, maxZ: number, base: number, stepCount: number) => number[];
declare const getElevationMaterial: () => ShaderMaterial;

declare const Materials_fitElevationRange: typeof fitElevationRange;
declare const Materials_getElevationMaterial: typeof getElevationMaterial;
declare namespace Materials {
  export {
    Materials_fitElevationRange as fitElevationRange,
    Materials_getElevationMaterial as getElevationMaterial,
  };
}

interface IWorld {
    domEl: HTMLElement;
    showStats?: boolean;
    preserveDrawingBuffer?: boolean;
    referenceFrame?: ReferenceFrame;
    cameraMode?: CameraMode;
    rendererClearColor?: number;
    rendererAlpha?: boolean;
    renderWidth?: number;
    renderHeight?: number;
    preventAutoStart?: boolean;
    antialias?: boolean;
    disableControls?: boolean;
    disableTelemetry?: boolean;
    disableQueryParams?: boolean;
}
declare type CameraMode = 'perspective' | 'orthographic';
interface InitUIOpts {
    disableControls?: boolean;
    disableLayers?: boolean;
    disablePointclouds?: boolean;
    disableMeasure?: boolean;
    disableShare?: boolean;
    domElId?: string;
}
interface SplitView {
    camera: PerspectiveCamera | OrthographicCamera;
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Main class for PointsceneJS */
declare class World {
    layers: Layers;
    queryParams: QueryParams | undefined;
    private domEl;
    private showStats;
    scene: Scene | undefined;
    controls?: CamControls;
    private camControls?;
    modules: Modules | undefined;
    loaders: typeof Loaders;
    materials: typeof Materials;
    private rangeNear;
    private rangeFar;
    private perspectiveCamera;
    private orthoCamera;
    camera: PerspectiveCamera | OrthographicCamera;
    private fov;
    private aspectRatio;
    private clock;
    private events;
    private stats;
    private renderer;
    private screenWidth;
    private screenHeight;
    static screenWidth: number;
    static screenHeight: number;
    private freezeAnimate;
    private prevControlDistance;
    private splitViews;
    static splitViews: SplitView[];
    constructor(opts: IWorld);
    dispose(): void;
    private onWindowResize;
    private handleRendererFocus;
    private handleFitTopView;
    /**
     * Add binds
     */
    private binds;
    private addListeners;
    private handleUpdateOrbitPoint;
    private handleControlUICreated;
    private handleLayerUICreated;
    private handleSetSphericalMode;
    private handleSetOrbitMode;
    private removeListeners;
    private handleMeasureUICreated;
    private handlePointcloudUICreated;
    initUI(opts?: InitUIOpts): void;
    disposeUI(): void;
    getWorldBoundingBox(includeStatic?: boolean): Box3 | null | undefined;
    getSceneBoundingBox(includeStatic?: boolean): Box3 | null | undefined;
    getCameraPosition(): Vector3 | undefined;
    getControlTarget(): Vector3 | undefined;
    /**
     * Fits top view based on point clouds bounding box
     */
    fitTopView(transition?: boolean): Promise<void>;
    fitBoundingBox(boundingBox: Box3): Promise<void>;
    fitLayer(id: string): Promise<void>;
    setCameraView(camera: Vector3, target: Vector3, transition?: boolean): Promise<void>;
    getScreenShot(saveAsFile?: boolean): boolean | string;
    setCameraMode(mode: CameraMode): void;
    setClippingPlanes(planes: Plane[]): void;
    /**
     * Main render loop. Calls modules.render().
     */
    private render;
    /**
     * Main update loop. Calls modules and Tweening.
     */
    private update;
    /**
     * Animate loop
     */
    private animate;
    static projectPoints(points: number[][], projIn: string, projOut: string): Promise<number[][]>;
    projectPoints(points: number[][], projIn: string, projOut: string): Promise<number[][]>;
    /**
     * Start looping
     */
    private start;
}

interface Init {
    accessToken?: string;
    domEl: HTMLElement;
    showStats?: boolean;
    preserveDrawingBuffer?: boolean;
    referenceFrame?: ReferenceFrame;
}
declare const init: (opts: Init) => World;
declare const eulerToQuaternion: (x: number, y: number, z: number, order?: string, transformation?: number[]) => {
    x: number;
    y: number;
    z: number;
    w: number;
};
declare const getPlane: (normalX: number, normalY: number, normalZ: number, constant: number) => Plane;

interface IPoint2D {
    x: number;
    y: number;
}
/** Mixed maths */
declare class CustomMath {
    projectedRadius(radius: number, fov: number, distance: number, screenHeight: number): number;
    lineSegmentIntersection2D(p1: IPoint2D, p2: IPoint2D, p3: IPoint2D, p4: IPoint2D): IPoint2D | boolean;
    lineLineIntersection2D(p1: IPoint2D, p2: IPoint2D, p3: IPoint2D, p4: IPoint2D): boolean;
    pointInPolygon2D(points: IPoint2D[], test: IPoint2D): boolean;
    almostEquals(val: number, compare: number, limit?: number, abs?: boolean): boolean;
    getMiddlePoint(v1: Vector3, v2: Vector3): Vector3;
    getLineIntersectionXY(p1: IPoint2D, p2: IPoint2D, p3: IPoint2D, p4: IPoint2D): Vector3 | undefined;
    arrayToMatrix(typed: number[], n?: number): number[][];
    typedToArray(typed: number[], n: number): number[];
    arrayToTyped(array: number[][]): Float32Array;
    flipNormal(normal: Vector3, point?: Vector3, viewpoint?: Vector3): Vector3;
    getPlaneNormal(coordinates: number[][]): Vector3;
    getCentroid(coordinates: number[][]): number[];
    rep(s: number[], v: number, k?: number): number[][];
    getSVD(A: number[][]): {
        U: number[][];
        S: number[][];
        V: number[][];
    };
}

/**
 * adapted from http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
 * and https://raw.githubusercontent.com/potree/potree/develop/src/TextSprite.js
 */

interface IRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}
/** TextSprite extends THREE.Object3D */
declare class TextSprite extends Object3D {
    material: SpriteMaterial;
    sprite: Sprite;
    borderThickness: number;
    fontface: string;
    fontsize: number;
    borderColor: IRGBA;
    backgroundColor: IRGBA;
    textColor: IRGBA;
    text: string;
    constructor();
    setText(text: string): void;
    setTextColor(color: IRGBA): void;
    setBorderColor(color: IRGBA): void;
    setBackgroundColor(color: IRGBA): void;
    /**
     * Updates sprite
     */
    update(): void;
    roundRect(ctx: Context, x: number, y: number, w: number, h: number, r: number): void;
}

/** Mixed format transformations */
declare class Transformations {
    getPotreeProfileFromBBox(boundingbox: Box3 | Object3D): any;
}

interface CameraControlOpts {
    camera: PerspectiveCamera | OrthographicCamera;
    domEl: HTMLElement;
    referenceFrame: ReferenceFrame;
}
declare enum ControlMode {
    FirstPerson = "walk",
    Orbit = "orbit",
    Spherical = "360"
}
declare class CameraControls {
    controls: CamControls;
    domEl: HTMLElement;
    mode: ControlMode;
    allowOrbitWalkAutoChange: boolean;
    orbitMinDistance: number;
    orbitMaxDistance: number;
    private events;
    private orbitTruckSpeed;
    private orbitDollySpeed;
    fpsMinDistance: number;
    fpsMaxDistance: number;
    private fpsTruckSpeed;
    private fpsDollySpeed;
    private sphereMinDistance;
    private sphereMaxDistance;
    private updateTimeout;
    private referenceFrame;
    constructor(opts: CameraControlOpts);
    private triggerCameraUpdate;
    private handleOnUpdate;
    private handleOnSleep;
    private handleOnRest;
    private handleDisableControls;
    private handleEnableControls;
    getMode(): ControlMode;
    updateOrbitPoint(point: Vector3): void;
    setFirstPersonMode(saveState?: boolean, reset?: boolean): void;
    setSphericalMode(position: Vector3, normal: Vector3, saveState?: boolean, reset?: boolean): void;
    setOrbitMode(saveState?: boolean, reset?: boolean): void;
    disable(): void;
    enable(): void;
    update(deltaT: number): void;
    private resetFocalOffset;
    dispose(): void;
}

declare class EyeDomeLightingMaterial extends ShaderMaterial {
    private neighbourCnt;
    private neighbours;
    private isWebGL2;
    constructor();
    getDefines(): string;
    setIsWebGL2(val: boolean): void;
    updateShaderSource(): void;
    get neighbourCount(): number;
    set neighbourCount(value: number);
}

declare class EDLRenderer {
    edlMaterial: EyeDomeLightingMaterial;
    private rtEDL;
    private screenScene;
    private screenQuad;
    private camera;
    constructor(domEl?: HTMLElement, renderer?: WebGLRenderer, camera?: PerspectiveCamera);
    resize(domEl: HTMLElement, renderer: WebGLRenderer, camera: PerspectiveCamera | OrthographicCamera): void;
    dispose(): void;
    render(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera | OrthographicCamera): void;
}

interface ProfilePointsData {
    classification?: Uint8Array;
    color?: Uint8Array;
    intensity?: Float32Array;
    mileage?: Float64Array;
    numberOfReturns?: Uint8Array;
    pointSourceID?: Uint16Array;
    position?: Float32Array;
    returnNumber?: Uint8Array;
}
declare class ProfilePoints {
    boundingBox: Box3;
    numPoints: number;
    data: ProfilePointsData;
    constructor();
    add(points: ProfilePoints): void;
}

interface Segment {
    start: Vector3;
    end: Vector3;
    cutPlane: Plane;
    halfPlane: Plane;
    length: number;
    points: ProfilePoints;
}
declare class ProfileData {
    profile: Profile;
    boundingBox: Box3;
    segments: Segment[];
    constructor(profile: Profile);
    size(): number;
}

interface PointCloudProfileRequestOpts {
    pointcloud: PointCloudOctree;
    profile: Profile;
    maxDepth?: number;
    onProgress: ProfileRequestCallback;
    onFinish: ProfileRequestCallback;
    onCancel: () => void;
}
interface Profile {
    points: Vector3[];
    width: number;
}
interface ProfileRequestArgs {
    request: PointCloudProfileRequest;
    data: ProfileData;
}
declare type ProfileRequestCallback = (args: ProfileRequestArgs) => void;
interface PriorityQueueItem {
    node: PointCloudOctreeGeometryNode;
    weight: number;
}
declare class PointCloudProfileRequest {
    isFinished: boolean;
    private pointcloud;
    private profile;
    private maxDepth;
    private onProgress;
    private onFinish;
    private onCancel;
    private pointsServed;
    private highestLevelServed;
    private priorityQueue;
    private temporaryResult;
    private profileRequests;
    private updateGeneratorInstance;
    private cancelRequested;
    constructor(opts: PointCloudProfileRequestOpts);
    private initialize;
    private nodeIntersectsProfile;
    private traverse;
    update(): void;
    private updateGenerator;
    private getAccepted;
    private getPointsInsideProfile;
    requestCancel(): void;
}

interface MeasurementsOpts {
    picker: Picker;
    referenceFrame: ReferenceFrame;
    hideLabels?: boolean;
    getPositionFn?: (point: Vector3) => Vector3;
    getDistanceFn?: (a: Vector3, b: Vector3) => number;
    getAreaFn?: (triangles: Vector3[][]) => number;
}
interface MeasurementStartOpts {
    onFinish?: (points: Vector3[], intersection?: PickResult) => void;
    onUpdate?: (position: Vector3) => void;
}
interface MeasureGeometry {
    points: Vector3[];
    lines: Vector3[][];
    polygons: Vector3[][];
}
declare type MeasurementDimensions = 'all' | 'xy' | 'z';
declare type MeasurementType = 'point' | 'distance' | 'area' | 'none' | 'area-line';
declare class MeasureTool {
    picker: Picker;
    referenceFrame: ReferenceFrame;
    private markers;
    points: Vector3[];
    pickingPlane?: Plane;
    activeType: MeasurementType;
    orientMarkersTowardsCamera: boolean;
    private activeDimensions;
    private activeAreaMesh;
    private markerRadius;
    private markerGeometry;
    private activeMarker;
    private activeLine;
    private activeMarkerMeta;
    private metaTool;
    showSlope: boolean;
    showSlopeCallback?: (val: boolean) => void;
    domEl: HTMLElement;
    camera: PerspectiveCamera | OrthographicCamera;
    private hasKinks;
    labelRenderer: CSS2DRenderer;
    private activeLabelDivs;
    private activeLabels;
    private events;
    private updateCounter;
    private markerMinPixelSize;
    private markerMaxPixelSize;
    hideLabels: boolean;
    labelTooltipMarginTop: number;
    onFinish?: (points: Vector3[], intersection?: PickResult) => void;
    onUpdate?: (position: Vector3) => void;
    setLabelTextFn?: (labelType: MeasurementType, labelDivs: HTMLElement[], object: Mesh | Line, labels: CSS2DObject[], isActiveMarker: boolean) => void;
    private getAreaFn?;
    private getDistanceFn?;
    private getPositionFn?;
    constructor(opts: MeasurementsOpts);
    toggleShowSlope(): void;
    private getLabelDiv;
    private getLabel;
    private setLabelStyle;
    start(type: MeasurementType, opts: MeasurementStartOpts): void;
    private getNormal;
    private getArea;
    isWaitingToPickFirstPoint(): boolean;
    update(delta: number): void;
    private findGeometryObject;
    private findMarkerGroup;
    private calculateScale;
    private updateMarkers;
    populateMarkersFromScene(scene: Scene): void;
    private updateLabels;
    clear(): void;
    private getLerpCenter;
    private angleToPercentageStr;
    private getRatioStr;
    private getAngle;
    private getDistance;
    private setLabelText;
    private updateActiveMarkerMeta;
    updateActiveMarker(): void;
    private triangulatePolygon;
    private updateActiveArea;
    private addPoint;
    setActiveMarkerColor(color: number): void;
    setActiveMarkerScale(scale: number): void;
    handleLeftClick(): void;
    handleMouseMove(): void;
    snapToLineIntersection(intersection: PickResult): void;
    cancel(): void;
    dispose(): void;
    end(hit?: PickResult): void;
    private createMarker;
    private createMesh;
    private createLine;
    private getMaterial;
    private getGeometryArray;
    getGeometry(): MeasureGeometry;
}

interface ClippingPlaneToolOpts {
    picker: Picker;
    referenceFrame: ReferenceFrame;
    renderer: WebGLRenderer;
    measureTool?: MeasureTool;
}
interface ClippingPlaneStartOpts {
    onFinish: (points: Vector3[]) => void;
    onUpdate: (points: Vector3[]) => void;
}
interface LineStepResult {
    start: Vector3;
    end: Vector3;
    distance: number;
    faceIndex: number;
    pointOnLine: Vector3;
}
declare type PlaneMode = 'free' | 'cross_on_line';
declare class ClippingPlaneTool {
    minCrossSectionWidth: number;
    private clipTool;
    private measureTool?;
    private onUpdate?;
    private onFinish?;
    private clipPlane;
    private clipPlaneOnStart;
    private pickPlane;
    private model;
    private slider;
    private axis;
    private meshVisible;
    private renderer;
    private needsUpdate;
    private events;
    private isDragging;
    private dragStartOffset?;
    private mode;
    private activeProfileLine;
    private profileView;
    private splitViewSlider;
    private profilePoints;
    private stepSize;
    private zoomMultiplier;
    private hoveredLine;
    constructor(opts: ClippingPlaneToolOpts);
    profileViewIsVisible(): boolean;
    isActive(): boolean;
    private update;
    start(opts: ClippingPlaneStartOpts): void;
    private flipNormal;
    private getNonClipMaterial;
    private getSlider;
    private handleVisibilityUpdate;
    private handleSliderHoverIn;
    private handleSliderHoverOut;
    private handleSliderDragStart;
    private handleSliderDragEnd;
    private findNextStepOnLine;
    private findNearestSegmentOnLine;
    private translatePlane;
    private updateProfilePointsFromModel;
    private updateProfileView;
    private updatePlane;
    private updatePlaneFromPoints;
    private updateProfileOnLine;
    private add;
    private handleProfileAction;
    private createProfileView;
    getProfileGeometries(): MeasureGeometry;
    private disposeProfileView;
    end(): void;
    clearMeasurements(): void;
    cancel(): void;
    clear(needsUpdate?: boolean): void;
    dispose(): void;
}

interface ElevationRangeToolOpts {
    picker: Picker;
    referenceFrame: ReferenceFrame;
}
interface ElevationRangeStartOpts {
    onFinish: (points: number[]) => void;
    onUpdate: (points: number[]) => void;
}
declare class ElevationRangeTool {
    private measureTool;
    private points;
    private onUpdate?;
    private onFinish?;
    constructor(opts: ElevationRangeToolOpts);
    start(opts: ElevationRangeStartOpts): void;
    private add;
    end(): void;
}

interface ProfileLabelUpdateOpts {
    width: number;
    height: number;
    viewWidth: number;
    viewHeight: number;
    center: Vector3;
    profilePoints: Vector3[];
}
interface LabelOpts {
    text: string;
    position: Vector3;
    transform: string;
    marginLeft: string;
    marginTop: string;
    className: string;
}
declare class ProfileViewLabels {
    renderer: CSS2DRenderer;
    private scene;
    private targetLabelCount;
    private minLabelDistance;
    private referenceFrame;
    constructor(referenceFrame: ReferenceFrame);
    update({ width, height, viewWidth, viewHeight, center, profilePoints }: ProfileLabelUpdateOpts): void;
    render(camera: OrthographicCamera): void;
    private createLabel;
    private removeLabels;
    dispose(): void;
}

declare type LoadProgressCallback = (message: string) => void;
interface ProfileViewOpts {
    width: number;
    height: number;
    referenceFrame: ReferenceFrame;
    measureTool?: MeasureTool;
    domEl: HTMLElement;
    loadProgressCallback?: LoadProgressCallback;
    loadFinishCallback?: () => void;
}
interface ProfileViewUpdateOpts {
    center: Vector3;
    clipPlane: Plane;
    profilePoints: Vector3[];
    depth: number;
    zoom: number;
    width: number;
    height: number;
    scene: Scene;
    scenePointcloud?: Scene;
}
declare class ProfileView {
    private orthoCamera;
    profileRenderer: WebGLRenderer;
    private profileGrid;
    private profileScene;
    private profileLines;
    private profilePoints;
    private profileCaps?;
    private loadProgressCallback?;
    private loadFinishCallback?;
    private pointCloudProfileRequests;
    private maxPointCount;
    labels: ProfileViewLabels;
    private measureToolRef?;
    private measureTool?;
    private mouse;
    private clipPlane?;
    constructor(opts: ProfileViewOpts);
    clearMeasurements(): void;
    private handlePointerMove;
    private handlePointerDown;
    private handlePointerEnter;
    private handlePointerLeave;
    private updatePointCloudProfileData;
    private updatePointCloudProfileRequests;
    update(opts: ProfileViewUpdateOpts): void;
    private extractLinesFromMesh;
    private extractLinesFromScene;
    private indexLines;
    private extractLines;
    render(): void;
    getGeometry(): MeasureGeometry;
    dispose(): void;
}

interface SplitViewSliderOpts {
    domEl: HTMLElement;
    splitRatio: number;
}
interface UpdateCallbackArgs {
    up: {
        width: number;
        height: number;
    };
    down: {
        width: number;
        height: number;
    };
    allowPropagation?: boolean;
}
interface CloseCallbackArgs {
    width: number;
    height: number;
}
interface ProfileToolActionProps {
    value: number | string;
}
declare type ProfileToolAction = 'step_forward' | 'step_back' | 'zoom_in' | 'zoom_out' | 'step_change' | 'export_dxf';
declare type UpdateCallback = (args: UpdateCallbackArgs) => void;
declare type CloseCallback = (args: CloseCallbackArgs) => void;
declare class SplitViewSlider {
    private domEl;
    splitPosition: number;
    container: HTMLElement;
    isDisposed: boolean;
    private sliderHeight;
    private buttonSize;
    private events;
    private backgroundColor;
    private sliderColor;
    private totalHeight;
    private splitRatio;
    private updateCallback?;
    private closeCallback?;
    constructor(opts: SplitViewSliderOpts);
    setUpdateCallback(callback: UpdateCallback): void;
    setCloseCallback(callback: CloseCallback): void;
    createProfileToolPanel(onAction: (action: ProfileToolAction, props?: ProfileToolActionProps) => void): void;
    private handleResize;
    private update;
    private createSlider;
    private createButton;
    private createCloseButton;
    updateLoadIndicator(message: string): void;
    hideLoadIndicator(): void;
    private createLoadIndicator;
    dispose(): void;
}

interface DxfPoints {
    data: Vector3[];
    layer: string;
}
interface DxfLines {
    data: Vector3[][];
    layer: string;
}
interface DxfPolygons {
    data: Vector3[][];
    layer: string;
}

export { CameraControlOpts, CameraControls, ClippingPlaneStartOpts, ClippingPlaneTool, ClippingPlaneToolOpts, CloseCallback, CloseCallbackArgs, ControlMode, CustomMath, DxfLines, DxfPoints, DxfPolygons, EDLRenderer, ElevationRangeStartOpts, ElevationRangeTool, ElevationRangeToolOpts, IPickPointCloud, IPointClouds, Init, LabelOpts, LineStepResult, LoadProgressCallback, MeasureGeometry, MeasureTool, MeasurementDimensions, MeasurementStartOpts, MeasurementType, MeasurementsOpts, Modules, PhotoSpheres, Photos, PlaneMode, PointCloudProfileRequest, PointCloudProfileRequestOpts, PointClouds, PointsceneEvents, index as Potree, PriorityQueueItem, Profile, ProfileData, ProfileLabelUpdateOpts, ProfilePoints, ProfilePointsData, ProfileRequestArgs, ProfileRequestCallback, ProfileToolAction, ProfileToolActionProps, ProfileView, ProfileViewLabels, ProfileViewOpts, ProfileViewUpdateOpts, ReferenceFrameOpts, Segment, SplitViewSlider, SplitViewSliderOpts, TextSprite, Transformations, UpdateCallback, UpdateCallbackArgs, World, init as default, eulerToQuaternion, getPlane, init, Loaders as loaders, Materials as materials };
