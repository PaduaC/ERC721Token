// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

import {ERC721Interface} from "./ERC721Interface.sol";
import {ERC721TokenReceiver} from "./ERC721TokenReceiver.sol";

/**
 * @dev Utility library of inline functions on addresses.
 * @notice Based on:
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol
 * Requires EIP-1052.
 */
library AddressUtils {
    /**
     * @dev Returns whether the target address is a contract.
     * @param _addr Address to check.
     * @return addressCheck True if _addr is a contract, false if not.
     */
    function isContract(address _addr)
        internal
        view
        returns (bool addressCheck)
    {
        // This method relies in extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;
        bytes32 accountHash =
            0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        assembly {
            codehash := extcodehash(_addr)
        } // solhint-disable-line
        addressCheck = (codehash != 0x0 && codehash != accountHash);
    }
}

contract ERC721Token is ERC721Interface {
    using AddressUtils for address;
    mapping(address => uint256) private ownerToTokenCount;
    mapping(uint256 => address) private idToOwner;
    mapping(uint256 => address) private idToApproved;
    mapping(address => mapping(address => bool)) private ownerToOperators;
    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    function balanceOf(address _owner)
        external
        view
        override
        returns (uint256)
    {
        return ownerToTokenCount[_owner];
    }

    function ownerOf(uint256 _tokenId)
        external
        view
        override
        returns (address)
    {
        return idToOwner[_tokenId];
    }

    // For smart contracts
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata data
    ) external payable override {
        _safeTransferFrom(_from, _to, _tokenId, data);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable override {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable override {
        _transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId)
        external
        payable
        override
    {
        address owner = idToOwner[_tokenId];
        require(msg.sender == owner, "Not authorized");
        idToApproved[_tokenId] = _approved;
        emit Approval(owner, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved)
        external
        override
    {
        ownerToOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function getApproved(uint256 _tokenId)
        external
        view
        override
        returns (address)
    {
        return idToApproved[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator)
        external
        view
        override
        returns (bool)
    {
        return ownerToOperators[_owner][_operator];
    }

    function _safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory data
    ) internal {
        _transfer(_from, _to, _tokenId);

        // Verify whether or not recipient is smart contract
        if (_to.isContract()) {
            bytes4 retval =
                ERC721TokenReceiver(_to).onERC721Received(
                    msg.sender,
                    _from,
                    _tokenId,
                    data
                );
            require(
                retval == MAGIC_ON_ERC721_RECEIVED,
                "Recipient smart contract cannot handle ERC721 tokens"
            );
        }
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal canTransfer(_tokenId) {
        ownerToTokenCount[_from] -= 1;
        ownerToTokenCount[_to] += 1;
        idToOwner[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    modifier canTransfer(uint256 _tokenId) {
        address owner = idToOwner[_tokenId];
        require(
            owner == msg.sender ||
                idToApproved[_tokenId] == msg.sender ||
                ownerToOperators[owner][msg.sender] == true,
            "Transfer not authorized"
        );
        _;
    }
}
