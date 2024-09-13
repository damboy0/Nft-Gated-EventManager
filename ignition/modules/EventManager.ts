import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const EventManagerModule = buildModule("EventManagerModule", (m) => {

    const save = m.contract("EventManager");

    return { save };
});

export default EventManagerModule;