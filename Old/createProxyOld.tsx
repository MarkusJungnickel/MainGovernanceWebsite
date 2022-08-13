import * as React from "react";
import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Safe, { SafeFactory, SafeAccountConfig } from "@gnosis.pm/safe-core-sdk";
import ethereumProvider from "@metamask/detect-provider";
import Web3Adapter from "@gnosis.pm/safe-web3-lib";
import Web3 from "web3";
import { FACTORY_ABI } from "../constants/ABIs/FACTORY_ABI";
import { LOGIC_ABI } from "../constants/ABIs/LOGIC_ABI";
import { isAddress, toHex, toWei } from "web3-utils";
import { TransactionReceipt } from "web3-eth";

const provider =
  "https://eth-rinkeby.alchemyapi.io/v2/u4kDg20QopAesjF2c1w_9CuvG84D-78_";

let currentAccount: any = null;
const factoryAddr = "0x1aCc8C5990D4c8C4666159C7859299262F79bDd4";
const budgetModifierAddr = "0x57994ab547C4465EC6de8A514Ba4FE8aA295B609";
let safeCreated = false;
let budgetModified = false;
let moduleCreated = false;

export async function getProvider() {
  // this returns the provider, or null if it wasn't detected
  const provider = await ethereumProvider();
  console.log(provider);

  if (provider) {
    startApp(provider); // Initialize your app
  } else {
    console.log("Please install MetaMask!");
  }

  function startApp(provider: unknown) {
    // If the provider returned by detectwindow.ethereumProvider is not the same as
    // window.window.ethereum, something is overwriting it, perhaps another wallet.
    if (provider !== window.window.ethereum) {
      console.error("Do you have multiple wallets installed?");
    }
    // Access the decentralized web!
  }

  /**********************************************************/
  /* Handle chain (network) and chainChanged (per EIP-1193) */
  /**********************************************************/

  window.ethereum.on("chainChanged", handleChainChanged);

  function handleChainChanged(_chainId: any) {
    // We recommend reloading the page, unless you must do otherwise
    window.location.reload();
  }

  /***********************************************************/
  /* Handle user accounts and accountsChanged (per EIP-1193) */
  /***********************************************************/

  window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then((result: string | any[]) => handleAccountsChanged(result))
    .catch((err: any) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err);
    });

  // Note that this event is emitted on page load.
  // If the array of accounts is non-empty, you're already
  // connected.
  window.ethereum.on("accountsChanged", handleAccountsChanged);

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts: string | any[]) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log("Please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      console.log("current account: ", currentAccount);
      // Do any other work!
    }
  }

  /*********************************************/
  /* Access the user's accounts (per EIP-1102) */
  /*********************************************/

  // You should only attempt to request the user's accounts in response to user
  // interaction, such as a button click.
  // Otherwise, you popup-spam the user like it's 1999.
  // If you fail to retrieve the user's account(s), you should encourage the user
  // to initiate the attempt.
  // document.getElementById('connectButton', connect);

  // While you are awaiting the call to eth_requestAccounts, you should disable
  // any buttons the user can click to initiate the request.
  // MetaMask will reject any additional requests while the first is still
  // pending.
  function connect() {
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(handleAccountsChanged)
      .catch((err: { code: number }) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      });
  }
}

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function SignUp() {
  const [wrapperAddress, setWrapperAddress] = useState("");
  let waitingInterval: string | number | NodeJS.Timeout | undefined;
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  useEffect(() => {
    if (receipt != null) {
      console.log("address: ", receipt!.contractAddress);
      setWrapperAddress(receipt!.contractAddress!);
      moduleCreated = true;
      budgetModified = true;
      clearInterval(waitingInterval);
    }
  }, [receipt]);
  const [safeAddress, setSafeAddress] = useState("");

  async function deploySafeWithBudget(budget: any, interval: any) {
    const budgetWei = toWei(budget);
    let web3 = new Web3(window.ethereum);
    const ethAdapter = new Web3Adapter({
      web3,
      signerAddress: currentAccount,
    });
    const factory = new web3.eth.Contract(FACTORY_ABI, factoryAddr);
    const safeFactory = await SafeFactory.create({ ethAdapter });
    const owners = [currentAccount.toString()];
    const threshold = 1;
    const safeAccountConfig: SafeAccountConfig = {
      owners,
      threshold,
      // ...
    };
    const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig });
    setSafeAddress(safeSdk.getAddress());
    safeCreated = true;
    console.log("created:", safeSdk.getAddress());

    let accounts: any = [];
    async function getAccount() {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    }

    await getAccount();
    if (window.ethereum.isConnected()) {
      getProvider();
    }

    const txs = {
      from: accounts[0],
      to: factoryAddr,
      value: "0",
      data: factory.methods
        .createSafeWrapperWithBudget(
          safeSdk.getAddress(),
          currentAccount,
          budgetWei,
          interval,
          budgetModifierAddr
        )
        .encodeABI(),
      chainId: "0x4",
    };

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [txs],
    });
    console.log(txHash);

    waitingInterval = setInterval(() => waitForTransaction(txHash), 500);
    setTimeout(() => {
      clearInterval(waitingInterval);
    }, 30000);

    async function waitForTransaction(txHash: any) {
      const tx = await web3.eth.getTransactionReceipt(txHash);
      console.log(tx);
      if (tx != null) {
        setReceipt(tx);
        clearTimeout();
        console.log(tx);
      }
    }
  }

  const handleClick = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await deploySafeWithBudget(data.get("amount"), data.get("interval"));
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        {safeCreated && (
          <a
            href={"https://gnosis-safe.io/app/rin:" + safeAddress + "/home"}
            rel="noreferrer"
          >
            {"\u2705"}Deployed Committee Multisig
          </a>
        )}
      </div>
      <div>
        {moduleCreated && (
          <a
            href={"https://rinkeby.etherscan.io/address/" + wrapperAddress}
            rel="noreferrer"
          >
            {"\u2705"}Deployed Committee Contract
          </a>
        )}
      </div>
      <div>
        {budgetModified && (
          <a
            href={"https://rinkeby.etherscan.io/address/" + budgetModifierAddr}
            rel="noreferrer"
          >
            {"\u2705"}Budget Set
          </a>
        )}
      </div>
      <Box component="form" noValidate onSubmit={handleClick} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField required id="amount" label="Budget" name="amount" />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              name="interval"
              label="Budget Period"
              id="interval"
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Create New Committee
        </Button>
      </Box>
    </ThemeProvider>
  );
}
