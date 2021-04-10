import React from "react";
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { newContextComponents } from "@drizzle/react-components";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;
const { ContractData, ContractForm } = newContextComponents;

function NFTWallet() {
  const { drizzle } = useDrizzle();
  const state = useDrizzleState((state) => state);

  return (
    <div>
      {/* Make sure these are the right components */}
      <div>
        <h2>Mint</h2>
        <ContractData
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="mint"
        />
      </div>
      <div>
        <h2>Transfer From</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="transferFrom"
        />
      </div>
      <div>
        <h2>Safe Transfer</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="safeTransferFrom"
        />
      </div>
      <div>
        <h2>Approve</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="approve"
        />
      </div>
      <div>
        <h2>Approve All</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="setApprovalForAll"
        />
      </div>
      <div>
        <h2>Request Approval</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="getApproved"
        />
      </div>
      <div>
        <h2>Is Approved For All</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="isApprovedForAll"
        />
      </div>
    </div>
  );
}

export default NFTWallet;
