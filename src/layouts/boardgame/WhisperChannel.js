import React, { Component } from 'react'
import Terminal from 'terminal-in-react'
import contract from 'truffle-contract'
import getWeb3 from '../../util/web3/getWeb3'
import {Topic} from '../../whisper/whisper-channel/channel'
import {createChannel} from '../../whisper/whisper-channel/channel'
import {getAccounts} from '../../whisper/whisper-channel/channel'
import {sleep} from '../../whisper/whisper-channel/channel'
import EthereumDIDRegistry from '../../../build/contracts/EthereumDIDRegistry.json'

class WhisperChannel extends Component {

    
      const useWeb3 = () => getWeb3;
      const results = await useWeb3();
      let accounts = await getAccounts(results.web3Instance);
      let identity = accounts[0].toLowerCase();
      let identity2 = accounts[0].toLowerCase();
 
      let registryAddress = await truffleDeployed(results.web3Provider);
      
      if(!registryAddress){
        console.log("Ethr DID registry not deployed.")
      } else {
        console.log("Using test deployed Ethr DID registry.")
        let topic = Topic();
        console.log("Topic: ",topic);
        let channel = await createChannel({registryAddress, identity, identity2, topic});
        
        let ch = await channel.open()
        console.log("Whisper Id: ",ch.whisperId);

        await channel.start();

        let msg = {message: "Hello World"};
        await channel.send(msg);

        console.log("Identity address: ", identity);
        console.log("My Signer: ",ch.signer);

        await sleep(3)
        console.log("Received Message:",channel.read());

        await sleep(2)
        await channel.close();
        console.log("Channel closed.")
      }
    
}
export default WhisperChannel;


async function truffleDeployed(provider){
  const DidReg = contract(EthereumDIDRegistry);
  DidReg.setProvider(provider);

  let instance = await DidReg.deployed();
  return instance.address;
}