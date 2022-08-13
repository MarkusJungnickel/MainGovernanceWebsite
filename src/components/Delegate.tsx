import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import React from "react";
import Web3 from "web3";
import { TOKEN_ABI } from "../constants/ABIs/TOKEN_ABI";
import { TOKEN_ADDRESS } from "../constants/constants";
import { ProviderContext } from "../context/Provider";

function Delegate(props: any) {
  const { walletProvider, currentAccount, connectFunction } =
    React.useContext(ProviderContext);
  let web3 = new Web3(walletProvider);
  const token = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);
  async function delegate(address: any) {
    const txObject = token.methods.delegate(address);
    const txs = {
      from: currentAccount,
      to: TOKEN_ADDRESS,
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
    console.log(txHash);
  }

  const handleDelegateSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await delegate(data.get("address"));
    props.handleClose();
  };
  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleDelegateSubmit}
      sx={{ mt: 3 }}
      minWidth={400}
    >
      <DialogTitle>Delegate</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <TextField
              required
              id="address"
              label="Address"
              name="address"
              helperText="Address of delegate"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose}>Close</Button>
        <Button type="submit">Delegate</Button>
      </DialogActions>
    </Box>
  );
}

export default Delegate;
