import { Connect, SimpleSigner } from 'uport-connect';
import Key from './key.json';

const uport = new Connect('blocks4humans', {
  clientId: '2oupi9Gj934NaPndCSBCiUWr28e1PwbA2vB',
  network: 'rinkeby',
  signer: SimpleSigner(Key.uPortSigner),
});
  
const web3 = uport.getWeb3();
export { web3, uport };