// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
/*	the variable name is a string data type and is a state variable
	state variables belong to the entire smart contract 
	not just a local function
	what is a state variable?
 	state variables belong to the smart contracts state
 	the value gets directly written to the blockchain, so how does it know the value of the variable?
 	the value of this variable name will get stored on the blockchain itself
	and will use the smart contract to recieve it
*/ 
// Import this file to use console.log
import "hardhat/console.sol";

contract Token {
	// setting the visibility of the variable with the keyword public
	// soliditiy will create special functions for us
	// whenever we deploy the SC, now we can access the name value of My Token
	string public name;
	string public symbol;
	uint256 public decimals = 18; //unsigned integer thats 256 bits
	uint256 public totalSupply;
	// 1,000,000 * 10^18 two stars is exponents

	constructor(string memory _name, string memory _symbol, uint256 _totalSupply) { // _ is used for local variables
		name = _name;
		symbol = _symbol; 
		totalSupply = _totalSupply * (10**decimals); 
	}
}
