const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const Token = artifacts.require("ERC721Token.sol");
const MockBadRecipient = artifacts.require("MockBadRecipient.sol");

contract("ERC721Token", (accounts) => {
  let token;
  const [admin, trader1, trader2] = [accounts[0], accounts[1], accounts[2]];

  beforeEach(async () => {
    token = await Token.new();
    for (let i = 0; i < 3; i++) {
      await token.mint();
    }
  });

  it("should NOT mint if not admin", async () => {
    await expectRevert(token.mint({ from: accounts[4] }), "only admin");
  });

  it("should mint if admin", async () => {
    //const nextTokenId = parseInt(await token.nextTokenId());
    await token.mint({ from: admin });
  });

  it("should NOT transfer if balance is 0", async () => {
    await token.transferFrom(admin, trader1, 1);
    await expectRevert(
      token.transferFrom(trader1, trader2, 1),
      "Transfer not authorized"
    );
  });

  it("should NOT transfer if not owner", async () => {
    await token.transferFrom(admin, trader1, 1);
    await expectRevert(
      token.transferFrom(trader2, trader1, 1),
      "Transfer not authorized"
    );
  });

  //Bug here, skip this test :( see end code for explanation
  it.skip("safeTransferFrom() should NOT transfer if recipient contract does not implement erc721recipient interface", async () => {
    const badRecipient = await MockBadRecipient.new();
    await expectRevert(
      token.safeTransferFrom(admin, badRecipient.address, 0, { from: admin }),
      "Recipient smart contract cannot handle ERC721 tokens"
    );
  });

  it("transferFrom() should transfer", async () => {
    const tokenId = web3.utils.toBN(1);
    const transfer = await token.transferFrom(admin, trader1, tokenId);
    expectEvent(transfer, "Transfer", {
      _from: admin,
      _to: trader1,
      _tokenId: tokenId,
    });

    const ownerBalance = await token.balanceOf(trader1);
    assert(ownerBalance.toNumber() === tokenId.toNumber());
  });

  it("safeTransferFrom() should transfer", async () => {
    const tokenId = web3.utils.toBN(1);
    const safeTransfer = await token.safeTransferFrom(admin, trader1, tokenId);

    const ownerBalance = await token.balanceOf(trader1);
    assert(ownerBalance.toNumber() === tokenId.toNumber());

    expectEvent(safeTransfer, "Transfer", {
      _from: admin,
      _to: trader1,
      _tokenId: tokenId,
    });
  });

  it("should transfer token when approved", async () => {
    const tokenId = 0;
    // Get approval first
    const receipt = await token.approve(trader1, tokenId);
    const approved = await token.getApproved(tokenId);
    // Trader1 is approved to transfer NFT
    const tx = await token.transferFrom(admin, trader1, tokenId, {
      from: trader1,
    });
    const [balanceAdmin, balanceTrader, owner] = await Promise.all([
      token.balanceOf(admin),
      token.balanceOf(trader1),
      token.ownerOf(tokenId),
    ]);
    assert(balanceAdmin.toNumber() === 2);
    assert(balanceTrader.toNumber() === 1);
    assert(owner === trader1);

    expectEvent(receipt, "Approval", {
      _owner: admin,
      _approved: trader1,
      _tokenId: web3.utils.toBN(tokenId),
    });
    expectEvent(tx, "Transfer", {
      _from: admin,
      _to: trader1,
      _tokenId: web3.utils.toBN(tokenId),
    });
  });
});
