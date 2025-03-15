interface DeviceData {
    locationTags: [string, string, string]; 
    deviceId: string | number;
}

const deviceData: DeviceData[] = [
    {
        locationTags: ["Warehouse", "Sector 3", "Building 7"],
        deviceId: "A",
    },
    {
        locationTags: ["Office", "Floor 5", "North Wing"],
        deviceId: "B",
    },
    {
        locationTags: ["Factory", "Unit 12", "Assembly Line"],
        deviceId: "C",
    }
];

export default deviceData;
