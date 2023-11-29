// SPDX-License-Identifier: MIT

// Steps use
// 1. Deploy Contract with info about real estate (Init front, execute back) - deploy()
// 2. Add list of _p2p_platforms (admin execute) - AddP2pPplatform()
// 3. Select p2p_address (from front) - AllowP2Pplatform()
// 4. Transfer to other owner (from p2p_address) - TransferTokenByP2pPlatform()


pragma solidity ^0.8.14;

interface P2PPlatform {
    function getObject( address, address) external;
}

/**
 * @dev Assets tokenization contract
 */
contract Assets {
    // Structs.
    struct Token {
        address owner;
        string governmentRegistryId;
        string name;
        string description;
    }

    // Vars.
    P2PPlatform public p2p_target;
    address _admin;
    address _state_admin;
    string _name;
    string _symbol;
    address _tokenizer; // Allow tokenize only by this address
    address _withdrawAddress; // Allow withdraw only to this address
    mapping(uint256 => Token) private _tokens;
    uint256 _nextTokenId = 1; //Only one token. Contract per object

    mapping(address => bool) private _p2p_platforms;
    address _selected_p2p_platform;

    // Modifiers.
    modifier onlyAdmin() {
        require(msg.sender == _admin, "Only owner can call this method.");
        _;
    }
    modifier onlyTokenizer() {
        require(
            msg.sender == _tokenizer,
            "Only tokenizer can call this method."
        );
        _;
    }

    modifier onlyP2P_selected() {
        require(msg.sender == _selected_p2p_platform, "Only selected P2P Platform can call this method.");
        _;
    }

    modifier onlyStateAdmin_selected() {
        require(msg.sender == _state_admin, "Only state (goverment) admin can call this method.");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == _tokens[_nextTokenId].owner, "Only owner can call this method");
        _;
    }


    /**
     * @dev Constructor
     */
    constructor(
        string memory contractName,
        string memory contractSymbol,
        address tokenizer,
        address withdrawAddress,
        address owner,
        string memory description,
        string memory governmentRegistryId,
        address p2p_address
    ) {
        _admin = msg.sender;
        _state_admin = address(0);
        _name = contractName;
        _symbol = contractSymbol;
        _tokenizer = tokenizer;
        _withdrawAddress = withdrawAddress;
        _selected_p2p_platform = address(0);
        _tokens[_nextTokenId] = Token({
            owner: owner,
            governmentRegistryId: governmentRegistryId,
            name: contractName,
            description: description
        });
        _p2p_platforms[p2p_address] = true;
    }

    /**
     * @dev Returns the token name
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the token symbol
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns token owner
     */
    function getTokenOwner() public view returns (address) {
        return _tokens[_nextTokenId].owner;
    }

    /**
     * @dev Returns token government registry id
     */
    function getTokenGovernmentRegistryId() public view returns (string memory) {
        return _tokens[_nextTokenId].governmentRegistryId;
    }

    /**
     * @dev Tokenize asset
     */
    function tokenize(
        address to,
        string memory tokenGovernmentRegistryId,
        string memory tokenName,
        string memory tokenDescription
    ) public onlyTokenizer returns (uint256) {
        _tokens[_nextTokenId] = Token({
            owner: to,
            governmentRegistryId: tokenGovernmentRegistryId,
            name: tokenName,
            description: tokenDescription
        });
        return _nextTokenId;
    }

    /**
     * @dev Withdraw (if someone accidentally sends ETH to this contract)
     */
    function withdraw() public onlyAdmin {
        payable(_withdrawAddress).transfer(address(this).balance);
    }


    /**
    * @dev addP2PPlatform to list
    */
    function AddP2pPplatform(address p2p_address) public  onlyAdmin{
        _p2p_platforms[p2p_address] = true;
    }

    /**
     * @dev Allow P2P platform
     */
    function AllowP2Pplatform(address p2p_address)  public  onlyOwner{
        require( _p2p_platforms[p2p_address], "Only alloweded P2P Platform can selected by this method.");

        p2p_target = P2PPlatform(p2p_address);

        _selected_p2p_platform = p2p_address;

        p2p_target.getObject(address(this), msg.sender);

    }

    /**
     * @dev Deny P2P platform
     */
    function DenyP2Pplatform()  public onlyOwner {
       
        _selected_p2p_platform = address(0);
    }

    /**
     * @dev TransferTokenByP2pPlatform
     */
    function TransferTokenByP2pPlatform( address newOwner) public onlyP2P_selected {
        _tokens[_nextTokenId].owner = newOwner;
        _selected_p2p_platform = address(0);
    }

    /**
    * @dev AdministrativeTransfer
    */
    function AdministrativeTransfer( address newOwner) public onlyStateAdmin_selected {

        _tokens[_nextTokenId].owner = newOwner;
        _selected_p2p_platform = address(0);

    }
}
