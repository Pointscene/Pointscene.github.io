import * as React from 'react';
import { FC } from 'react';

interface Coord3D$1 {
    x: number;
    y: number;
    z: number;
}
interface WorldProps {
    domEl: HTMLElement;
    fitTopView?: boolean;
    camera?: Coord3D$1;
    look?: Coord3D$1;
    children?: React.ReactNode;
    disableTelemetry?: boolean;
    disableQueryParams?: boolean;
    proj4?: string;
}
declare const WorldFC: FC<WorldProps>;

interface PointCloudProps {
    url: string;
    name: string;
}
declare const PointCloudFC: FC<PointCloudProps>;

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
}

interface InitUIOpts {
    disableControls?: boolean;
    disableLayers?: boolean;
    disablePointclouds?: boolean;
    disableMeasure?: boolean;
    disableShare?: boolean;
    domElId?: string;
}

interface UiProps extends InitUIOpts {
}
declare const UiFC: FC<UiProps>;

interface TmsProps {
    url: string;
    isTms?: boolean;
    bounds?: number[][];
}
declare const TmsFC: FC<TmsProps>;

interface PhotoSphere extends Photo {
    url: string;
}
interface PhotoSphereProps {
    data: PhotoSphere[];
}
declare const PhotoSpheresFC: FC<PhotoSphereProps>;

interface Coord3D {
    x: number;
    y: number;
    z: number;
}
interface LandXMLProps {
    url: string;
    name: string;
    offset: Coord3D;
    proj4: string;
}
declare const LandXMLFC: FC<LandXMLProps>;

export { LandXMLFC as LandXML, PhotoSpheresFC as PhotoSpheres, PointCloudFC as PointCloud, TmsFC as TileMapService, UiFC as UI, WorldFC as World };
