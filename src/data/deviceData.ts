export interface IFbDeviceData {
    locationTags: [string, string, string]; 
    deviceId: string | number;
}

export interface IMotionDeviceData { 
    locationTags: [string, string, string];
    deviceId: string | number;
}

const fbDeviceData: IFbDeviceData[] = [
    {
        locationTags: ["Pineapple", "124 Conch Street", "Bikini Bottom"],
        deviceId: "SPONGEBOB-F",
    },
    {
        locationTags: ["Easter Island Head", "122 Conch Street", "Bikini Bottom"],
        deviceId: "SQUIDWARD-F",
    },
    {
        locationTags: ["Rock", "120 Conch Street", "Bikini Bottom"],
        deviceId: "PATRICK-F",
    }
];

const motionDeviceData: IMotionDeviceData[] = [
    {
        locationTags: ["Krusty Krab", "Bikini Bottom", "Pacific Ocean"],
        deviceId: "MRKRABS-M",
    },
    {
        locationTags: ["Chum Bucket", "Bikini Bottom", "Pacific Ocean"],
        deviceId: "PLANKTON-M",
    },
    {
        locationTags: ["Mrs. Puff's", "Boating School", "Bikini Bottom"],
        deviceId: "MRSPUFF-M",
    }
];

export default { fbDeviceData, motionDeviceData };
