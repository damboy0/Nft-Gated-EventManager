import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MyNFTModule = buildModule("MyNFTModule", (m) => {

    const save = m.contract("MyNFT",["0x91935e2e959fb504640280C08530156c67F89479"]);

    return { save };
});

export default MyNFTModule;