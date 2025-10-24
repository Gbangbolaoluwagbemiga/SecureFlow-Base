export const BASE_MAINNET = {
  chainId: "0x2105", // 8453 in hex (Base Mainnet)
  chainName: "Base",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};

export const BASE_TESTNET = {
  chainId: "0x14A34", // 84532 in hex (Base Sepolia Testnet)
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const CONTRACTS = {
  // Base Testnet - DEPLOYED ✅
  SECUREFLOW_ESCROW_TESTNET: "0xd74f3b3f4f2FF04E3eFE2B494A4BE93Eb55E7A94",
  MOCK_TOKEN_TESTNET: "0x7659C2E485D3E29dBC36f7E11de9E633ED1FDa06",

  // Default contracts (used by frontend)
  SECUREFLOW_ESCROW: "0xd74f3b3f4f2FF04E3eFE2B494A4BE93Eb55E7A94",
  USDC: "0x7659C2E485D3E29dBC36f7E11de9E633ED1FDa06",
  MOCK_ERC20: "0x7659C2E485D3E29dBC36f7E11de9E633ED1FDa06",

  BASESCAN_API_KEY: "C9CFD5REN63QS5AESUEF3WJ6EPPWJ2UN9R",
};
