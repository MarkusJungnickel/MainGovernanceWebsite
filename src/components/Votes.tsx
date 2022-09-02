import { Divider } from "@material-ui/core";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import Web3 from "web3";
import { GOVERNOR_V2_ABI } from "../constants/ABIs/GOVERNOR_V2_ABI";
import { TOKEN_ABI } from "../constants/ABIs/TOKEN_ABI";
import {
  GOVERNOR_V2_ADDRESS,
  PROVIDER_XDAI,
  TOKEN_ADDRESS,
} from "../constants/constants";
import { ProviderContext } from "../context/Provider";

function Votes(props: any) {
  const { walletProvider, currentAccount, connectFunction } =
    React.useContext(ProviderContext);
  let web3 = new Web3(walletProvider);
  const governor = new web3.eth.Contract(GOVERNOR_V2_ABI, GOVERNOR_V2_ADDRESS);
  const [tokens, setTokens] = useState(0);
  const [lockedTokens, setLockedTokens] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [votingPower, setVotingPower] = useState(0);

  async function getTokenData() {
    let web3 = new Web3(PROVIDER_XDAI);
    const token = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);
    const votes = await token.methods.getVotes(currentAccount).call();
    const tokens = Number(await token.methods.balanceOf(currentAccount).call());
    const supply = Number(await token.methods.totalSupply().call());
    setVotingPower(votes);
    setTokens(tokens);
    setLockedTokens(tokens - votes);
    setTotalSupply(supply);
  }

  React.useEffect(() => {
    getTokenData();
  }, []);

  async function retrieveVotes(proposalId: any) {
    const txObject = governor.methods.retrieveStake(proposalId);

    //   freeVotes(
    //     address voter,
    //     uint256 amount,
    //     uint256 proposalId
    // )
    const txs = {
      from: currentAccount,
      to: GOVERNOR_V2_ADDRESS,
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

  const handleVotesSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await retrieveVotes(data.get("proposalId"));
    props.handleClose();
  };
  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleVotesSubmit}
      sx={{ mt: 3 }}
      minWidth={400}
    >
      <DialogTitle>Voting Power</DialogTitle>
      <DialogContent>
        <Typography>
          <b>Gov Tokens:</b> {tokens}
        </Typography>
        <Typography>
          <b>Staked Tokens:</b> {lockedTokens}
        </Typography>
        <Typography>
          <b>Voting Power:</b> {votingPower}
        </Typography>
        <Typography>
          <b>Total Supply:</b> {totalSupply}
        </Typography>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Typography>
            <b>Reclaim Stake:</b>
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TextField
                required
                id="proposalId"
                label="ProposalID"
                name="proposalId"
                helperText="ID of the proposal"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose}>Close</Button>
        <Button type="submit">Reclaim</Button>
      </DialogActions>
    </Box>
  );
}

export default Votes;
