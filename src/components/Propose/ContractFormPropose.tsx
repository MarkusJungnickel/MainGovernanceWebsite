import { MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import Web3 from "web3";
import { PERMISSIONREG_ABI } from "../../constants/ABIs/PERMISSIONREG_ABI";
import { CONTRACTS, PERMISSIONREG_ADDRESS } from "../../constants/constants";
import { ProviderContext } from "../../context/Provider";
import { extractUsefulMethods } from "./AbiUtilsPropose";

export default function ContractFormPropose(props: any) {
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
  const [selectedMethod, setSelectedMethod] = React.useState<string>();
  const [selectedMethodValue, setSelectedMethodValue] =
    React.useState<string>("");
  const [methods, setMethods] = React.useState<any>([]);
  const [selectedContract, setSelectedContract] = React.useState<string>();
  const [selectedContractValue, setSelectedContractValue] =
    React.useState<string>("");
  const [methodHelperText, setMethodHelperText] =
    React.useState("Select the Method");
  const handleMethodChange = async (data: any) => {
    const selectedMethodTmp = data.target;
    setSelectedMethod(selectedMethodTmp);
    setSelectedMethodValue(selectedMethodTmp.value);
    props.parentCallback(selectedContract, selectedMethodTmp);
  };

  const handleContractChange = (data: any) => {
    setSelectedContract(data.target.value.address);
    setSelectedContractValue(data.target.value);
    setMethods(extractUsefulMethods(data.target.value.abi));
    console.log(extractUsefulMethods(data.target.value.abi));
  };

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
            value={selectedContractValue}
            onChange={handleContractChange}
            helperText="Select the contract"
          >
            {CONTRACTS.map((option: any) => (
              <MenuItem key={option.label} value={option.value}>
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
            value={selectedMethodValue}
            onChange={handleMethodChange}
            helperText={methodHelperText}
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
