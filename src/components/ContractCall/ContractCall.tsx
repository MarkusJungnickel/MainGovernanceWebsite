import { styled } from "@material-ui/core";
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
import * as React from "react";
import Web3 from "web3";
import { toHex } from "web3-utils";
import { WEB3_PROVIDER } from "../../constants/constants";
import { ProviderContext } from "../../context/Provider";
import { switchChain } from "../utils";
import { AbiItemExtended } from "./AbiUtils";
import ContractForm from "./ContractForm";
import ParameterForm from "./ParameterForm";
import Review from "./Review";

const steps = ["Select Method", "Enter Parameters", "Review Transaction"];
const isReadMethod = (method: AbiItemExtended): boolean =>
  method && method.action === "read";

const theme = createTheme();
const BootstrapButton = styled(Button)({
  boxShadow: "none",
  textTransform: "none",
  fontSize: 16,
  padding: "6px 12px",
  border: "1px solid",
  lineHeight: 1.5,
  backgroundColor: "white",
  borderColor: "black",
  color: "black",
  fontFamily: ["Arial"].join(","),
  "&:hover": {
    backgroundColor: "black",
    borderColor: "black",
    color: "white",
    boxShadow: "none",
  },
  "&:active": {
    boxShadow: "none",
    backgroundColor: "#0062cc",
    borderColor: "#005cbf",
  },
});

export default function Checkout() {
  const [method, setMethod] = React.useState<any>();
  const [parameters, setParameters] = React.useState<any>();
  const [address, setAddress] = React.useState<any>();
  const [txObject, setTxObject] = React.useState<any>();
  const [result, setResult] = React.useState<any>();
  const [confirmation, setConfirmation] = React.useState<any>(false);
  const { walletProvider, currentAccount, connectFunction } =
    React.useContext(ProviderContext);
  let web3 = new Web3(walletProvider);
  const createTxObject = (
    method: AbiItemExtended,
    contractAddress: string,
    values: Record<string, string>
  ): any => {
    console.log("ADDRESS", contractAddress);
    const contract = new web3.eth.Contract([method], contractAddress);
    const { inputs, name = "" } = method;
    const args =
      inputs?.map((input) => {
        return values[input.name];
      }) || [];
    return contract.methods[name](...args);
  };

  function methodCallbackFunction(contractAddress: string, method: any) {
    console.log("parent:", method);
    setMethod(method);
    console.log(contractAddress);
    setAddress(toHex(contractAddress));
  }
  async function parameterCallbackFunction(parameters: Record<string, string>) {
    console.log(method.value);
    setParameters(parameters);
    const txObjectTmp = createTxObject(method.value, address, parameters);
    setTxObject(txObjectTmp);
  }

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return <ContractForm parentCallback={methodCallbackFunction} />;
      case 1:
        return (
          <ParameterForm
            method={method}
            parentCallback={parameterCallbackFunction}
          />
        );
      case 2:
        return (
          <Review
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
          to: address,
          value: "0",
          data: txObject.encodeABI(),
          chainId: "0x4",
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

  React.useEffect(() => {
    switchChain(walletProvider, "0x4", "rinkeby", WEB3_PROVIDER);
  }, []);

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
            Contract Call
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
                      ? "Submit Transaction"
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
