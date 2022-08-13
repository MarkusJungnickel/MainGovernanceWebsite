export async function switchChain(
  walletProvider: any,
  chainId: string,
  chainName: string,
  rpcURL: string
) {
  try {
    await walletProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    console.log(switchError);
    if (switchError.code === 4902) {
      try {
        await walletProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainId,
              chainName: chainName,
              rpcUrls: [rpcURL] /* ... */,
            },
          ],
        });
      } catch (addError) {
        console.log(addError);
      }
    }
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
