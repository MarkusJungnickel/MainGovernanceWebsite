import { LinearProgress, Stack } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ethers } from "ethers";
import * as React from "react";
import Web3 from "web3";
import budgetJason from "../../constants/ABIs/budgetModifierLogic.json";
import { GOVERNOR_V2_ABI } from "../../constants/ABIs/GOVERNOR_V2_ABI";
import permissionJson from "../../constants/ABIs/permissionRegistryLogic.json";
import wrapperJson from "../../constants/ABIs/wrapperFactory.json";
import {
  CONTRACTS,
  GOVERNOR_V2_ADDRESS,
  PROVIDER_XDAI,
} from "../../constants/constants";
import { ProviderContext } from "../../context/Provider";
import { switchChain } from "../utils";
import { AbiItemExtended } from "./AbiUtilsPropose";
import ContractFormPropose from "./ContractFormPropose";
import ParameterFormPropose from "./ParameterFormPropose";
import ProposalDetails from "./ProposalDetails";
import ReviewPropose from "./ReviewPropose";

const steps = [
  "Select Method",
  "Enter Parameters",
  "Proposal Details",
  "Review Proposal",
];
const isReadMethod = (method: AbiItemExtended): boolean =>
  method && method.action === "read";

const theme = createTheme();

let contractAddressMapping = new Map<string, string>([
  [
    CONTRACTS[0].value.address.toLowerCase(),
    CONTRACTS[0].value.proxyAddress.toLowerCase(),
  ],
  [
    CONTRACTS[1].value.address.toLowerCase(),
    CONTRACTS[1].value.proxyAddress.toLowerCase(),
  ],
  [
    CONTRACTS[2].value.address.toLowerCase(),
    CONTRACTS[2].value.proxyAddress.toLowerCase(),
  ],
]);

let contractABIMapping = new Map<string, any>([
  [CONTRACTS[0].value.address.toLowerCase(), permissionJson],
  [CONTRACTS[1].value.address.toLowerCase(), wrapperJson],
  [CONTRACTS[2].value.address.toLowerCase(), budgetJason],
]);

export default function CheckoutPropose() {
  const [method, setMethod] = React.useState<any>();
  const [parameters, setParameters] = React.useState<any>();
  const [address, setAddress] = React.useState<any>();
  const [txObject, setTxObject] = React.useState<any>();
  const [result, setResult] = React.useState<any>();
  const [confirmation, setConfirmation] = React.useState<any>(false);
  const { walletProvider, currentAccount, connectFunction } =
    React.useContext(ProviderContext);
  let web3 = new Web3(walletProvider);

  // const createTxObject = (
  //   method: AbiItemExtended,
  //   contractAddress: string,
  //   values: Record<string, string>
  // ): any => {
  //   console.log("ADDRESS", contractAddress);
  //   const contract = new web3.eth.Contract([method], contractAddress);
  //   const { inputs, name = "" } = method;
  //   const args =
  //     inputs?.map((input) => {
  //       return values[input.name];
  //     }) || [];
  //   return contract.methods[name](...args);
  // };

  const [methodName, setMethodName] = React.useState("");
  const [calldata, setCalldata] = React.useState<any>();

  function createFunctionCall(
    contractAddress: string,
    methodName: string,
    parameters: any[]
  ) {
    const abi = contractABIMapping.get(contractAddress.toLowerCase()).abi;
    const iface = new ethers.utils.Interface(abi);
    const data = iface.encodeFunctionData(methodName, parameters);
    return data;
  }

  function methodCallbackFunction(contractAddress: string, method: any) {
    console.log("parent:", method);
    setMethod(method);
    setMethodName(method.value.name);
    console.log(contractAddress);
    setAddress(contractAddress);
  }
  async function parameterCallbackFunction(parameters: Record<string, any>) {
    console.log(method.value);
    setParameters(parameters);
    // const txObjectTmp = createTxObject(method.value, address, parameters);
    // setTxObject(txObjectTmp);
    const { inputs, name } = method.value;
    const args: any =
      inputs?.map((input: any) => {
        return parameters[input.name];
      }) || [];
    const data = createFunctionCall(address, name, args);
    console.log("Data:", data);
    setCalldata(data);
  }

  async function proposalCallbackFunction(description: any, stake: any) {
    console.log(description, stake);
    const contract = new web3.eth.Contract(
      GOVERNOR_V2_ABI,
      GOVERNOR_V2_ADDRESS
    );

    const txObjectTmp = contract.methods.propose(
      [contractAddressMapping.get(address.toLowerCase())],
      [0],
      [calldata],
      description,
      stake
    );
    setTxObject(txObjectTmp);
    console.log(txObjectTmp);
  }

  React.useEffect(() => {
    switchChain(walletProvider, "0x64", "xDai", PROVIDER_XDAI);
  }, []);
  // async function switchChain() {
  //   console.log("here");
  //   try {
  //     await walletProvider.request({
  //       method: "wallet_switchEthereumChain",
  //       params: [{ chainId: "0x64" }],
  //     });
  //   } catch (switchError: any) {
  //     // This error code indicates that the chain has not been added to MetaMask.
  //     console.log(switchError);
  //     if (switchError.code === 4902) {
  //       try {
  //         await walletProvider.request({
  //           method: "wallet_addEthereumChain",
  //           params: [
  //             {
  //               chainId: "0x64",
  //               chainName: "xDai",
  //               rpcUrls: [PROVIDER_XDAI] /* ... */,
  //             },
  //           ],
  //         });
  //       } catch (addError) {
  //         // handle "add" error
  //       }
  //     }
  //     // handle other "switch" errors
  //   }
  // }

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return <ContractFormPropose parentCallback={methodCallbackFunction} />;
      case 1:
        return (
          <ParameterFormPropose
            method={method}
            parentCallback={parameterCallbackFunction}
          />
        );
      case 2:
        return <ProposalDetails parentCallback={proposalCallbackFunction} />;
      case 3:
        return (
          <ReviewPropose
            address={address}
            method={method.value}
            parameters={parameters}
          />
        );
      default:
        throw new Error("Unknown step");
    }
  }

  const [activeStep, setActiveStep] = React.useState(0);

  async function submitTransaction() {
    if (activeStep == steps.length - 1) {
      if (isReadMethod(method)) {
        const result = await txObject.call();
        setResult(result);
      } else {
        const txs = {
          from: currentAccount,
          to: GOVERNOR_V2_ADDRESS,
          value: "0",
          data: txObject.encodeABI(),
          chainId: "0x64",
        };
        console.log(txs);
        const txHash = await walletProvider
          .request({
            method: "eth_sendTransaction",
            params: [txs],
          })
          .catch((error: any) => {
            console.log(error);
          });
        setConfirmation(true);
        console.log(txHash);
      }
    }
  }
  const handleNext = () => {
    setActiveStep(activeStep + 1);
    submitTransaction();
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  let statusBar = (
    <Stack sx={{ width: "100%", color: "grey.500" }} spacing={2}>
      <LinearProgress color="inherit" />
    </Stack>
  );
  if (confirmation) {
    statusBar = (
      <Typography align="center" variant="h6" fontFamily="Arial">
        Transaction Sent &#128640;
      </Typography>
    );
  }

  return (
    <div>
      <CssBaseline />
      <AppBar
        position="absolute"
        color="default"
        elevation={0}
        sx={{
          position: "relative",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      ></AppBar>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        {/* <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        > */}
        <Box sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, border: 1 }}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            fontFamily="Arial"
          >
            Governance Proposal
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography
                  variant="h6"
                  fontFamily="Arial"
                  align="center"
                  gutterBottom
                >
                  {!confirmation && "Waiting for approval..."}
                </Typography>
                <>{statusBar}</>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {getStepContent(activeStep)}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  {activeStep !== 0 && (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      sx={{
                        mt: 3,
                        ml: 1,
                      }}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    variant="outlined"
                    sx={{ mt: 3, ml: 1 }}
                  >
                    {activeStep === steps.length - 1
                      ? "Submit Proposal"
                      : "Next"}
                  </Button>
                </Box>
              </React.Fragment>
            )}
          </React.Fragment>
          {/* </Paper> */}
        </Box>
      </Container>
    </div>
  );
}
