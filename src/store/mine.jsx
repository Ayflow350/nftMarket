let globalState = {
    connectedAccount: null,
    contract: null,
    nfts: [],
    transactions: [],
    ownedNFTs: [], // add this line
  };
  


  const setAlert = (msg, color = 'green') => {
    setGlobalState('loading', false)
    setGlobalState('alert', { show: true, msg, color })
    setTimeout(() => {
      setGlobalState('alert', { show: false, msg: '', color })
    }, 6000)
  }

  const setGlobalState = (key, value) => {
    globalState = { ...globalState, [key]: value };
  };
  
  const getGlobalState = (key) => {
    return globalState[key];
  };
  
  export { setGlobalState,  setAlert, getGlobalState };
  