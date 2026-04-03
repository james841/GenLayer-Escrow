import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const account = createAccount();

export const client = createClient({
  chain: studionet,
  account,
});

export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;