const rootRequire = name => {
  const path = require("path")
  const rootPath = path.resolve(__dirname, "..")
  return require(`${rootPath}/${name}`)
}

const deriveAddressOfSignerFromSig = async (txData, splitSig) => {
  const txWithResolvedProperties = await ethers.resolveProperties(txData)
  const txUnsignedSerialized = ethers.Transaction.from(txWithResolvedProperties).unsignedSerialized // returns RLP encoded tx
  const txUnsignedSerializedHashed = ethers.keccak256(txUnsignedSerialized) // as specified by ECDSA
  const txUnsignedSerializedHashedBytes = ethers.getBytes(txUnsignedSerializedHashed) // create binary hash
  const signatureSerialized = ethers.Signature.from(splitSig).serialized
  const recoveredAddressOfSigner = ethers.recoverAddress(txUnsignedSerializedHashedBytes, signatureSerialized)
  return recoveredAddressOfSigner
}

const getContractAbi = async (contractAddress) => {
  const axios = require("axios")
  const httpResponse = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`)
  // const httpResponse = await axios.get(`https://api-alfajores.celoscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.CELOSCAN_API_KEY}`)
  // const httpResponse = await axios.get(`https://testnet.snowtrace.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.SNOWTRACE_API_KEY}`)
  // console.log(`httpResponse.data: ${JSON.stringify(httpResponse.data, null, 2)}`)
  return httpResponse.data.result
}

const verifyContract = async (address, constructorArguments) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    })

    console.log("Contract verified!")
  } catch (err) {
    console.log(err)
  }
}

const printNativeCurrencyBalance = async (walletAddress, decimals = "ether") => ethers.formatUnits(await ethers.provider.getBalance(walletAddress), decimals)

const printContractBalanceOf = async (tokenContract, holderAddress, decimals = "ether") => ethers.formatUnits(await tokenContract.balanceOf(holderAddress), decimals)


module.exports = {
  rootRequire,
  deriveAddressOfSignerFromSig,
  getContractAbi,
  verifyContract,
  printNativeCurrencyBalance,
  printContractBalanceOf,
}
