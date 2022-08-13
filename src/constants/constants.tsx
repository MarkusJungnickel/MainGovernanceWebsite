import { BUDGETMODIFIER_ABI } from "./ABIs/BUDGETMODIFIER_ABI";
import { FACTORY_ABI } from "./ABIs/FACTORY_ABI";
import { PERMISSIONREG_ABI } from "./ABIs/PERMISSIONREG_ABI";

export const WRAPPER_FACTORY_ADDRESS =
  "0x07EbC22196Bd797D7B9a959E21Af674b54b37FE8";
export const PERMISSIONREG_ADDRESS =
  "0xE5E6100681a7685e6a7CDb30e3D919674b686c10";
export const MODIFIER_ADDRESS = "0xF5a024A9d55A70C0df8baF514F235FD823C0672E";
export const WEB3_PROVIDER =
  "https://eth-rinkeby.alchemyapi.io/v2/u4kDg20QopAesjF2c1w_9CuvG84D-78_";
export const PROVIDER_XDAI = "https://rpc.ankr.com/gnosis";
export const GOVERNOR_V2_ADDRESS = "0x4D77fC13376D2FdD2665dEe918bfbDe331acc0d7";
export const BRIDGE_PROXY_WRAPPER_FACTORY =
  "0x0BCFe2b0c2128280D0D5ab9A13b0C2A62f5bffDC";
export const BRIDGE_PROXY_PERMISSION_REG =
  "0x6E2603B973507ECB02d38eB18De85c1d230175C1";
export const TOKEN_ADDRESS = "0x18C20822BA74cB1e54C0EE1EbAaC631eE229A7D1";
export const GNOSIS_SAFE_TREASURY = "";
export const ROLES = [
  {
    value: 0,
    label: "Executive",
  },
  {
    value: 1,
    label: "Contributor",
  },
  {
    value: 2,
    label: "Member",
  },
];
export const CONTRACTS = [
  {
    label: "Permission Registry",
    value: {
      address: PERMISSIONREG_ADDRESS,
      abi: PERMISSIONREG_ABI,
      proxyAddress: BRIDGE_PROXY_PERMISSION_REG,
    },
  },
  {
    label: "Committee Factory",
    value: {
      address: WRAPPER_FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      proxyAddress: BRIDGE_PROXY_WRAPPER_FACTORY,
    },
  },
  {
    label: "Committee Budget Modifier",
    value: {
      address: MODIFIER_ADDRESS,
      abi: BUDGETMODIFIER_ABI,
      proxyAddress: BRIDGE_PROXY_WRAPPER_FACTORY,
    },
  },
];
