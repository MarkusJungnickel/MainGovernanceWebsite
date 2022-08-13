import ethereumProvider from "@metamask/detect-provider";
import React, { useEffect, useState } from "react";

interface IProvider {
  walletProvider: any;
  currentAccount: string;
  connectFunction: () => void;
}
const defaultState: IProvider = {
  walletProvider: "",
  currentAccount: "",
  connectFunction: () => {},
};
export const ProviderContext = React.createContext<IProvider>(defaultState);

export default function WalletProvider(props: any) {
  const [provider, setProvider] = useState(defaultState.walletProvider);
  const [currentAccount, setCurrentAccount] = useState(
    defaultState.currentAccount
  );

  async function setupWalletProvider() {
    // set provider
    const provider = await getProvider();

    // set accounts
    await setAccount(provider);

    //set change handlers
    changeHandler(provider);
  }

  async function getProvider() {
    const provider = await ethereumProvider();
    setProvider(provider);
    return provider;
  }
  async function setAccount(provider: any) {
    if (provider && provider == window.window.ethereum) {
      await provider
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
      setCurrentAccount(provider.selectedAddress);
    } else {
      console.log("Please install MetaMask!");
    }
  }
  useEffect(() => {
    setupWalletProvider();
  }, []);

  function changeHandler(provider: any) {
    provider.on("chainChanged", handleChainChanged);
    function handleChainChanged(_chainId: any) {
      provider.reload();
    }
    provider.on("accountsChanged", function () {
      provider
        .request({ method: "eth_requestAccounts" })
        .then((result: string | any[]) => handleAccountsChanged(result))
        .catch((err: any) => {
          console.error(err);
        });
    });
  }

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts: string | any[]) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log("Please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
      setCurrentAccount(accounts[0]);
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
  async function connect() {
    await provider
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

  return (
    <ProviderContext.Provider
      value={{
        walletProvider: provider,
        currentAccount: currentAccount,
        connectFunction: connect,
      }}
    >
      {props.children}
    </ProviderContext.Provider>
  );
}
