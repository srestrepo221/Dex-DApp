const { expect } = require('chai');
const { ethers } = require('hardhat');
// imports ethers library from the hardhat library
// we are not importing hardhat and assigning it into the ether variable
// the curly braces destructure that and we are only taking the ethers part of this that is whats exported 
// and assiging it to this variable thus we can perfrom any ethers function that we want to
const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}
describe('Token', ()=> {
	let token

	beforeEach(async () => {
		const Token = await ethers.getContractFactory('Token') // gets contract itself
		token = await Token.deploy('Green Bros', 'GB', 1000000) // now we want a deployed instance of the contract
	})

	describe('Deployment', () => {
		const name = 'Green Bros'
		const symbol = 'GB'
		const decimals = '18'
		const totalSupply = tokens('1000000')

		it('has correct name', async () => {
		/*const name = await token.name()
		expect(name).to.equal('Green Bros')
		*/ // same as code below but in one line
		expect(await token.name()).to.equal(name)
	 })

		it('has correct symbol', async () => {
		/*const symbol = await token.symbol()
		expect(symbol).to.equal('GB')*/ // same as code below but one line
		expect(await token.symbol()).to.equal(symbol)
	 })
		it('has correct decimals', async () => {
		expect(await token.decimals()).to.equal(decimals)
	 })
		it('has correct totalSupply', async () => {
		expect(await token.totalSupply()).to.equal(totalSupply)
	 })
	})
})
