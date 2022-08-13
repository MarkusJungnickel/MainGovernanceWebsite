import { MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import Web3 from "web3";
import { PERMISSIONREG_ABI } from "../../constants/ABIs/PERMISSIONREG_ABI";
import { CONTRACTS, PERMISSIONREG_ADDRESS } from "../../constants/constants";
import { ProviderContext } from "../../context/Provider";
import { extractUsefulMethods } from "./AbiUtils";

export default function ContractForm(props: any) {
  const { walletProvider, currentAccount, connectFunction } =
    React.useContext(ProviderContext);
  let web3 = new Web3(walletProvider);
  const permissionReg = new web3.eth.Contract(
    PERMISSIONREG_ABI,
    PERMISSIONREG_ADDRESS
  );
  async function checkPermission(
    caller: string,
    contract: string,
    method: string
  ) {
    return await permissionReg.methods.canCall(caller, contract, method).call();
  }

  // ========= Contract Dialog ========
  const [selectedMethod, setSelectedMethod] = React.useState();
  const [methods, setMethods] = React.useState<any>([]);
  const [noPermission, setNoPermission] = React.useState(false);
  const [methodHelperText, setMethodHelperText] =
    React.useState("Select the Method");
  const handleMethodChange = async (data: any) => {
    const selectedMethodTmp = data.target;
    setNoPermission(
      !(await checkPermission(
        currentAccount,
        selectedContract,
        selectedMethodTmp.value.signature
      ))
    );
    setSelectedMethod(selectedMethodTmp.value);
    props.parentCallback(selectedContract, selectedMethodTmp);
  };
  const [selectedContract, setSelectedContract] = React.useState("");

  const handleContractChange = (data: any) => {
    setSelectedContract(data.target.value.address);
    setMethods(extractUsefulMethods(data.target.value.abi));
    console.log(extractUsefulMethods(data.target.value.abi));
  };

  React.useEffect(() => {
    if (noPermission) {
      setMethodHelperText("No permission to call");
    } else if (methodHelperText != "Select the Method") {
      setMethodHelperText("Select the Method");
    }
  });
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Select the Method
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <TextField
            required
            id="contract"
            name="contract"
            label="Contract"
            fullWidth
            select
            onChange={handleContractChange}
            helperText="Select the contract"
          >
            {CONTRACTS.map((option: any) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            required
            id="method"
            name="method"
            select
            label="Method"
            fullWidth
            value={selectedMethod}
            onChange={handleMethodChange}
            helperText={methodHelperText}
            error={noPermission}
          >
            {methods.map((option: any) => (
              <MenuItem key={option.signature} value={option}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
