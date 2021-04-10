import React from "react";
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { newContextComponents } from "@drizzle/react-components";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;
const { ContractData } = newContextComponents;

function NFTMetadata() {
  const { drizzle } = useDrizzle();
  const state = useDrizzleState((state) => state);

  return (
    <div>
      <div>
        <h2>Admin</h2>
        <ContractData
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="admin"
        />
      </div>
      <div>
        <h2>Balance</h2>
        <ContractData
          drizzle={drizzle}
          drizzleState={state}
          contract="ERC721Token"
          method="balanceOf"
          methodArgs={[state.accounts[0]]}
        />
      </div>
    </div>
  );
}

export default NFTMetadata;
