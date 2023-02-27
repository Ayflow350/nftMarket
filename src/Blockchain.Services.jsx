import Web3 from 'web3'
import { setGlobalState, getGlobalState, setAlert } from './store'
import abi from './abis/TimelessNFT.json'


const providerUrl = `https://polygon-mumbai.infura.io/v3/2fe5101c39df4d91a7cbefc5a5d6e988`
const web3Provider = new Web3.providers.HttpProvider(providerUrl)
window.web3 = new Web3(web3Provider)
if (typeof window.web3 === 'undefined') {
  console.log('Web3 is not available.');
} else {
  console.log('Web3 is available.');
}



const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState('connectedAccount')

  if (connectedAccount) {
    const web3 = window.web3
    const networkId = await web3.eth.net.getId()
    const networkData = abi.networks[networkId]

    if (networkData) {
      const contract = new web3.eth.Contract(abi.abi, networkData.address)
      return contract
    } else {
      return null
    }
  } else {
    return getGlobalState('contract')
  }
}

const connectWallet = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setGlobalState('connectedAccount', accounts[0].toLowerCase())
  } catch (error) {
    reportError(error)
  }
}

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async () => {
      setGlobalState('connectedAccount', accounts[0].toLowerCase())
      await isWallectConnected()
    })

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0].toLowerCase())
    } else {
      alert('Please connect wallet.')
      console.log('No accounts found.')
    }
  } catch (error) {
    reportError(error)
  }
}

const structuredNfts = (nfts) => {
  return nfts
    .map((nft) => ({
      id: Number(nft.id),
      owner: nft.owner.toLowerCase(),
      cost: window.web3.utils.fromWei(nft.cost),
      title: nft.title,
      description: nft.description,
      metadataURI: nft.metadataURI,
      timestamp: nft.timestamp,
    }))
    .reverse()
}

const getAllNFTs = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEtheriumContract()
    const nfts = await contract.methods.getAllNFTs().call()
    const transactions = await contract.methods.getAllTransactions().call()

    setGlobalState('nfts', structuredNfts(nfts))
    setGlobalState('transactions', structuredNfts(transactions))
  } catch (error) {
    reportError(error)
  }
}

const mintNFT = async ({ title, description, metadataURI, price }) => {
  try {
    price = window.web3.utils.toWei(price.toString(), 'ether')
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')
    const mintPrice = window.web3.utils.toWei('0.01', 'ether')

    await contract.methods
      .payToMint(title, description, metadataURI, price)
      .send({ from: account, value: mintPrice })

    return true
  } catch (error) {
    reportError(error)
  }
}

const buyNFT = async ({ id, cost }) => {
  try {
    cost = window.web3.utils.toWei(cost.toString(), 'ether')
    const contract = await getEtheriumContract()
    const buyer = getGlobalState('connectedAccount')

    await contract.methods
      .payToBuy(Number(id))
      .send({ from: buyer, value: cost })

    return true
  } catch (error) {
    reportError(error)
  }
}

const updateNFT = async ({ id, cost }) => {
  try {
    cost = window.web3.utils.toWei(cost.toString(), 'ether')
    const contract = await getEtheriumContract()
    const buyer = getGlobalState('connectedAccount')

    await contract.methods.changePrice(Number(id), cost).send({ from: buyer })
  } catch (error) {
    reportError(error)
  }
}



// const fetchOwnedNFTs = async () => {
//   try {
//     const connectedAccount = getGlobalState('connectedAccount')
//     //if (!connectedAccount) return alert('Please connect wallet.')
    
//     const contract = await getEtheriumContract()
//     const ownedNFTs = await contract.methods.getOwnedNFTs().call({ from: connectedAccount })
//     const transactions = await contract.methods.getAccountTransactions().call({ from: account })
//     //setGlobalState('ownedNFTs', structuredOwnedNfts(ownedNFTs))
//     console.log(structuredOwnedNfts(ownedNFTs))
//     console.log(structuredTransactions(transactions))
//   } catch (error) {
//     reportError(error)
//   }
// }

const fetchOwnedNFTs = async () => {
  try {
    const connectedAccount = getGlobalState('connectedAccount')
    if (connectedAccount) {
      console.log('Please connect wallet.')
    }
    
    const contract = await getEtheriumContract()
   
    const mnfts = await contract.methods.getOwnedNFTs().call({ from: connectedAccount })
     console.log( structuredOwnedNfts(mnfts))
   setGlobalState('mnfts', structuredOwnedNfts(mnfts))
  } catch (error) {
    console.error(error)
    reportError(error)
  }
}






const structuredOwnedNfts = (mnfts) => {
  return mnfts.map((mnft) => ({
    id: Number(mnft.id),
    owner: mnft.owner.toLowerCase(),
    cost: window.web3.utils.fromWei(mnft.cost),
    title: mnft.title,
    description: mnft.description,
    metadataURI: mnft.metadataURI,
    timestamp: mnft.timestamp,
  }))
}


// const getAccountTransactions = async () => {
//   try {
//     const connectedAccount = getGlobalState('connectedAccount')
//     console.log('connectedAccount:', connectedAccount)

//     const contract = await getEtheriumContract()
//     console.log('contract:', contract)

//     const transactions = await contractInstance.methods.getAccountTransactions().call({ from: connectedAccount })
//     if (!transactions) {
//       console.log('Failed to get account transactions.')
//     } else {
//       console.log('Structured transactions:', structuredTransactions(transactions))
//     }

//     //setGlobalState('transactions', structuredTransactions(transactions))
//   } catch (error) {
//     reportError(error)
//   }
// }



// const structuredTransactions = (transactions) => {
//   return transactions
//     .map((transaction) => ({
//       id: Number(transaction.id),
//       owner: transaction.owner.toLowerCase(),
//       type: transaction.type,
//       amount: window.web3.utils.fromWei(transaction.amount),
//       timestamp: transaction.timestamp,
//     }))
//     .reverse()
// }



const reportError = (error) => {
  setAlert(JSON.stringify(error), 'red')
  throw new Error('No ethereum object.')
}

export {
  getAllNFTs,
  // getOwnedNFTs,
  fetchOwnedNFTs,
  // getAccountTransactions,
  connectWallet,
  mintNFT,
  buyNFT,
  updateNFT,
  isWallectConnected,
}
